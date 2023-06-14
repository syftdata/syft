# Syft devtools Extension

> a chrome extension tools built with Vite + React, and Manifest v3

## Installing

1. Run `npm install` to install the dependencies.
2. Run `npm run dev`

### Chrome Extension Developer Mode

1. Set your Chrome browser 'Developer mode' up
2. click 'Load unpacked', and select `packages/devtool-extension/build` folder

### Nomal FrontEnd Developer Mode

1. access `http://localhost:3000/`
2. when debugging popup page, open `/popup.html`
3. when debugging options page, open `/options.html`

## Packing

After the development of your extension run the command

```shell
$ npm build
```

Now, the content of `build` folder will be the extension ready to be submitted to the Chrome Web Store. Just take a look at the [official guide](https://developer.chrome.com/webstore/publish) to more infos about publishing.

### Tailwind CSS

The css is generated using this figma plugin
https://www.figma.com/community/plugin/1049994768493726219/Inspect---Export-to-HTML%2C-React%2C-TailwindCSS
