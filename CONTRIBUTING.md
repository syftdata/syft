# Contributing to Event Hub

This document explains dev setup, build and release process.

## Dev Setup

`npx lerna bootstrap`

## Unit tests

- To Run all unit-tests `npx lerna run test`
- To run CLI unit-tests `npx lerna run test --scope=syft-cli`
- To run a specific unit-test `npx lerna run test --scope=syft-cli -- -i tests/commands/init.test.ts`

## Quick Test

`ts-node packages/cli/src/index.ts --help`
`ts-node packages/cli/src/index.ts generate ts`

## Publish

Below script updates the package version using lerna.
It deletes the existing release branch and re-creates it from the current branch.

1. Create a temporary branch with what you want to release.
   `git checkout -b release-46`
2. Run below command.
   `./scripts/release.sh`
3. Increment the release version.
4. Open PR and merge to the main branch.

Git's release process takes care of publishing packages when release branch is re-created.

# Notes

### CommonJs vs ESM

We will have to worry about this sometime in the future:
https://adamcoster.com/blog/commonjs-and-esm-importexport-compatibility-examples
