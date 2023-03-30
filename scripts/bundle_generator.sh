npx lerna run build-bundle --scope=@syftdata/reflector
cp packages/reflector/lib-bundle/syftr.js* ../examples/todo-app/public/
npx lerna run build-bundle --scope=@syftdata/plugins
cat packages/plugins/lib-bundle/syfts.js | pbcopy
cat packages/plugins/lib-bundle/syfta.js | pbcopy