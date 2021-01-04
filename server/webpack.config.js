const webpack = require('webpack');
const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  mode: process.env === 'prodction' ? 'prodction' : 'development' ,
  entry: path.resolve(__dirname, 'dist','electron.js'),
  module: {
    rules: [],
  },
  output: {
    filename: 'electron.webpack.js',
    path: path.resolve(__dirname, 'dist')
  },
   plugins: [] ,
  target: 'electron-main',
  node: {
    __dirname: false,
    __filename: false
  }
};