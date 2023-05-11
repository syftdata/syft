## About

This document shows how to use [cloud](https://syft-studio.app.vercel.app) features

### Prerequisites

- Checkout branch `move-recorder-to-panel`
- `npx lerna add -D`
- Get an api-key from [sources page](https://syft-studio-app.vercel.app/sources)

NOTE: When you are reporting a bug, use `--verbose` flag and collect debug logs.

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
