#!/usr/bin/env node

import p from 'paparam'
import Autobase from 'autobase'
import Corestore from 'corestore'
import Hyperswarm from 'hyperswarm'

class View {
  open (store) {
    const core = store.get('view')
    return core
  }

  async apply (nodes, view, host) {
    for (const node of nodes) {
      const value = JSON.parse(node.value)
      if (value.add) await host.addWriter(Buffer.from(value.add, 'hex'))
      await view.append(JSON.stringify({ echo: value }))
    }
  }

  close (view) {
    return view.close()
  }
}

const args = p.command('autobase-example',
  p.flag('--name [name]'),
  p.flag('--key [key]'),
  p.flag('--add [key]'),
  p.flag('--spam [messages-per-second]'),
  p.flag('--swarm')
).parse()

if (!args) process.exit(0)

const name = args.flags.name || 'a'
const key = args.flags.key || null
const spam = args.flags.spam ? Number(args.flags.spam || 1) : 0
const pace = spam ? Math.round(1000 / spam) : 0

const store = new Corestore('store/' + name)
const base = new Autobase(store, key, new View())

await base.ready()

if (args.flags.swarm) {
  const swarm = new Hyperswarm({
    keyPair: base.local.keyPair
  })
  swarm.on('connection', c => base.replicate(c))
  swarm.join(base.discoveryKey)
}

console.log('Base key', base.key.toString('hex'))
console.log('Local key', base.local.key.toString('hex'))
console.log()

setInterval(async function () {
  console.log('base stats:',
    'length=', base.length,
    'indexed-length=', base.indexedLength,
    'signed-length=', base.signedLength,
    'members=', base._applyState.system.members, '(', base.linearizer.indexers.length, ')',
    'peers=', base.core.peers.length
  )
  const seq = base.view.length - 1
  if (seq < 0) return
  const last = await base.view.get(seq)
  console.log('last message (', seq, ') is', JSON.parse(last))
}, 2000)

if (args.flags.add) {
  await base.append(JSON.stringify({ add: args.flags.add }))
}

if (pace) {
  setInterval(async () => {
    await base.append(JSON.stringify({ hello: 'world', time: Date.now(), from: name }))
  }, pace)
}
