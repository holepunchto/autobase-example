# autobase-example

Just a full E2E simple autobase example

```
npm install autobase-example
```

## Usage

```
npm install -g autobase-example
autobase-example -h # prints help
```

### Walkthrough

1. Run the bootstrap peer with swarming enabled:

   ```console
   autobase-example --swarm
   ```

   You will see the following:
   ```
   Base key <base key>
   Local key <base key>
   ```
   Note that the local key will be the same for the bootstrap.
2. In another shell, run another peer, named `b`, that will write messages to
   the autobase via the `--spam` flag. Replace the `<base key>` with the Base
   key from the bootstrap:

   ```
   autobase-example --name b --key <base key> --spam 1 --swarm
   ```

   Similarly this will output a Base key and Local key with the Local key being
   different this time since it is not the bootstrap node. Following the keys
   will be a message:
   ```
   waiting to become writable...
   ```
   This is because peers are not writable by default and need to be added as
   writers by an indexer (currently only the bootstrap). So let's do that.
3. Stop the original bootstrap peer and rerun it passing the Local key from the
   `b` peer like so:

   ```console
   autobase-example --add <b's local key> --swarm
   ```

   You will notice that the `b` peer will output `we are writable!` once the
   peers connect over the swarm. Now the periodic output will tick up.

## License

Apache-2.0
