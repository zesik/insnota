'use strict';

const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

// Configuration of variables
const DEBUG = process.argv.indexOf('--release') === -1;
const VERBOSE = process.argv.indexOf('--verbose') > 0;
const GLOBALS = {
  'process.env.NODE_ENV': JSON.stringify(DEBUG ? 'development' : 'production'),
  __DEV__: DEBUG
};

// Configuration of webpack plugins
const jsPlugins = [
  new webpack.optimize.OccurenceOrderPlugin(),
  new webpack.DefinePlugin(GLOBALS)
];
const cssPlugins = [
  new CopyWebpackPlugin([
    { from: 'node_modules/codemirror/lib/codemirror.css' },
    { from: 'node_modules/codemirror/addon/dialog/dialog.css', to: 'cm-dialog.css' }
  ]),
  new ExtractTextPlugin('[name].css')
];
let extractTextArgument = 'css!sass';
if (!DEBUG) {
  jsPlugins.push(new webpack.optimize.DedupePlugin());
  jsPlugins.push(new webpack.optimize.UglifyJsPlugin({
    compress: { warnings: VERBOSE },
    comments: false
  }));
  extractTextArgument = 'css?minimize!sass';
}
jsPlugins.push(new webpack.optimize.CommonsChunkPlugin('common.js'));

// Export configurations
module.exports = [{
  name: 'javascripts',
  cache: DEBUG,
  debug: DEBUG,
  stats: {
    colors: true,
    reasons: DEBUG,
    hash: VERBOSE,
    version: VERBOSE,
    timings: true,
    chunks: VERBOSE,
    chunkModules: VERBOSE,
    cached: VERBOSE,
    cachedAssets: VERBOSE
  },
  entry: {
    account: './client/javascript/accountIndex.jsx',
    notes: './client/javascript/notesIndex.jsx'
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  output: {
    path: 'build/javascript',
    filename: '[name].js'
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel',
        exclude: /node_modules/,
        query: {
          presets: ['react', 'es2015'],
          plugins: ['transform-object-rest-spread']
        }
      }
    ]
  },
  plugins: jsPlugins
}, {
  name: 'stylesheets',
  entry: {
    index: './client/stylesheets/index.scss',
    notes: './client/stylesheets/notes.scss'
  },
  output: {
    path: 'build/stylesheets',
    filename: '[name].css'
  },
  module: {
    loaders: [
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract(extractTextArgument),
        exclude: /node_modules/
      }
    ]
  },
  plugins: cssPlugins
}];
