const path = require('path');
const WebpackBundleAnalyzer = require('webpack-bundle-analyzer');

module.exports = {
  entry: {
    'syft.client': './src/index.ts'
  },
  mode: 'production',
  output: {
    path: path.resolve(__dirname, 'lib-bundle'),
    filename: '[name].min.js',
    library: {
      name: 'syft.client',
      type: 'umd'
    },
    clean: true,
    umdNamedDefine: true
  },
  resolve: {
    extensions: ['.ts']
  },
  devtool: 'source-map',
  plugins: [new WebpackBundleAnalyzer.BundleAnalyzerPlugin()],
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
