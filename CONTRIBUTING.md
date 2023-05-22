# Contributing to Event Hub

This document explains dev setup, build and release process.

## Dev Setup

`npx lerna bootstrap`

## Unit tests

- To Run all unit-tests `npx lerna run test`
- To run CLI unit-tests `npx lerna run test --scope=@syftdata/cli`
- To run a specific unit-test `npx lerna run test --scope=@syftdata/cli -- -i tests/commands/init.test.ts`

## Quick Test

`npx ts-node packages/cli/src/index.ts --help`
`npx ts-node packages/cli/src/index.ts generate ts`

## Publish

Below script updates the package version using lerna.
It deletes the existing release branch and re-creates it from the current branch.

1. Create a temporary branch with what you want to release.
   `git checkout -b release-v0.1.12`
2. Run below command.
   `./scripts/release.sh`
3. Increment the release version.
4. Open PR and merge to the main branch from release-v0.1.12.

Git's release process takes care of publishing packages when release branch is re-created.
