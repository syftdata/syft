## Syft Studio Testing Instructions.

This document shows how to use [cloud](https://studio.syftdata.com) features

### Prerequisites

- Checkout branch `move-recorder-to-panel`
- Get an api-key from [sources page](https://studio.syftdata.com/sources)
- `npx lerna add -D`

**NOTE**: When you are reporting a bug, use `--verbose` flag and collect debug logs.

### Commands

- init a Syft project:
  ```sh
  npx ts-node packages/cli/src/index.ts init --apikey <api-key>
  ```
- pull a change from remote.
  ```sh
  npx ts-node packages/cli/src/index.ts pull <branch-name> --apikey <api-key>
  ```
- push a change to remote.
  ```sh
  npx ts-node packages/cli/src/index.ts push <branch-name> --apikey <api-key>
  ```

NOTE: you can change server url using --remote
