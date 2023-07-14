#!/bin/bash

npx lerna run build
cd packages/client
npm link
cd - 
cd packages/common
npm link
cd -
cd packages/codehandler
npm link
cd -
cd packages/cli
npm link
cd -
