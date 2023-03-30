#npx lerna run build
cp -r packages/cli/lib/* ../examples/todo-app/node_modules/@syftdata/cli/lib/
cp -r packages/cli/package.json ../examples/todo-app/node_modules/@syftdata/cli/package.json
cp -r packages/cli/assets/* ../examples/todo-app/node_modules/@syftdata/cli/assets/
cp -r packages/client/lib/* ../examples/todo-app/node_modules/@syftdata/client/lib/
