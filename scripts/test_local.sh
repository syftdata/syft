#!/bin/bash

npx lerna run build
cd packages/client
npm pack
cd ../cli
npm pack
cd ../../
