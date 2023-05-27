const path = require('path');
const { SourceMapDevToolPlugin } = require("webpack");


module.exports = {
  mode: 'development',
  devtool: 'eval-source-map',
  entry: './src/index.ts',
  plugins: [
    new SourceMapDevToolPlugin({
      filename: "[file].map"
    }),
  ],  
  module: {
    rules: [
      {
        test: /\.m?js$/,
        enforce: 'pre',
        use: ['source-map-loader'],
      },
      {
        test: /\.ts$/,
        include: [path.resolve(__dirname, 'src')],
        use: 'ts-loader',
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    publicPath: '/public/',
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'public'),
  },
};