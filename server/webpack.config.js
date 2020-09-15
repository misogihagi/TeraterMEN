const webpack = require('webpack');
const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  mode: proccess.env === 'prodction' ?'prodction' : 'development'
  entry: './dist/electron.js',
  externals: [nodeExternals()],
  module: {
    rules: [],
  },
  output: {
    filename: 'electron.webpack.js',
    path: path.resolve(__dirname, 'dist')
  },
   plugins: [] ,
  target: 'node',
  node: {
    __dirname: false,
    __filename: false
  }
};