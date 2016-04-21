'use strict';

const webpack = require('webpack');

// Configuration of variables
const DEBUG = process.argv.indexOf('--release') === -1;
const VERBOSE = process.argv.indexOf('--verbose') > 0;
const GLOBALS = {
  'process.env.NODE_ENV': JSON.stringify(DEBUG ? 'development' : 'production'),
  __DEV__: DEBUG
};

// Configuration of webpack plugins
const plugins = [
  new webpack.optimize.OccurenceOrderPlugin(),
  new webpack.DefinePlugin(GLOBALS)
];
if (!DEBUG) {
  plugins.push(new webpack.optimize.DedupePlugin());
  plugins.push(new webpack.optimize.UglifyJsPlugin({
    compress: { warnings: VERBOSE },
    comments: false
  }));
}
plugins.push(new webpack.optimize.CommonsChunkPlugin('common.js'));

// Export configurations
module.exports = {
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
    notes: './client/javascript/notesIndex.jsx',
    home: './client/javascript/homeIndex.jsx'
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
          presets: ['react', 'es2015']
        }
      }
    ]
  },
  plugins
};
