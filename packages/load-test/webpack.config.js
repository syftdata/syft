const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const GlobEntries = require("webpack-glob-entries");

module.exports = {
  mode: "production",
  entry: GlobEntries("./src/*test*.ts"), // Generates multiple entry for each test
  output: {
    path: path.join(__dirname, "dist"),
    libraryTarget: "commonjs",
    filename: "[name].js",
  },
  resolve: {
    extensions: [".ts", ".js"],
    fallback: {
      https: false,
      http: false,
    },
    symlinks: false,
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "babel-loader",
        exclude: /node_modules/,
      },
    ],
  },
  target: "web",
  externals: /^(k6|https?\:\/\/)(\/.*)?/,
  // Generate map files for compiled scripts
  devtool: "source-map",
  plugins: [new CleanWebpackPlugin()],
  optimization: {
    minimize: false,
  },
};
