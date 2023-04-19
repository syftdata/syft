const path = require('path');
// const WebpackBundleAnalyzer = require('webpack-bundle-analyzer');

const generalConfig = {
  mode: 'production',
  resolve: {
    extensions: ['.ts']
  },
  plugins: [
    //  new WebpackBundleAnalyzer.BundleAnalyzerPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: [/node_modules/, /lib/, /lib-bundle/, /dist/, /lib-esm/]
      }
    ]
  }
};

const nodeConfig = {
  target: 'node',
  output: {
    filename: '[name].node.js',
    path: path.resolve(__dirname, 'lib-bundle'),
    library: {
      type: 'module'
    }
  }
};

const browserConfig = {
  target: 'web',
  output: {
    filename: '[name].web.js',
    path: path.resolve(__dirname, 'lib-bundle'),
    library: {
      type: 'module'
    }
  }
};

module.exports = (env, argv) => {
  if (argv.mode === 'development') {
    generalConfig.mode = 'development';
    generalConfig.devtool = 'source-map';
  }
  Object.assign(nodeConfig, generalConfig);
  Object.assign(browserConfig, generalConfig);
  return [nodeConfig, browserConfig];
};
