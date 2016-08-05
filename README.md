# Insnota

[![Build Status](https://travis-ci.org/zesik/insnota.svg?branch=master)](https://travis-ci.org/zesik/insnota)
[![Dependency Status](https://david-dm.org/zesik/insnota.svg)](https://david-dm.org/zesik/insnota)
[![devDependency Status](https://david-dm.org/zesik/insnota/dev-status.svg)](https://david-dm.org/zesik/insnota#info=devDependencies)

Insnota is a collaborative note-taking platform, using the following technologies:

* [Node.js](https://nodejs.org/)
* [React](https://facebook.github.io/react/) and [Redux](http://redux.js.org/)
* [webpack](https://webpack.github.io)
* [CodeMirror](https://codemirror.net)
* [ShareDB](https://github.com/share/sharedb)
* [MongoDB](https://www.mongodb.com/)
* ... and [many more](package.json)

## Getting Started

### Prerequisites

1. Prepare a Node.js environment.

2. Prepare a MongoDB database server.

### Configurations

Configuration file is located inside `server/config`.

Copy `app.config.js` to `local.config.js`, and customize your needs in `local.config.js`.
Settings in `app.config.js` are overwritten by modifications in `local.config.js`.

Some settings cannot be changed once server starts for the first time.
Refers to comments in `app.config.js` for more information.

### Running

To launch Insnota for production with minified JS and CSS, run the following commands.

```sh
$ npm install
$ npm run release
$ npm start
```

To launch Insnota for development and watch changes of front-side JS and CSS, run the following commands.

```sh
$ npm install
$ npm run develop
```

## Release History

* 0.1.1: Jul 25, 2016
  * Fix a problem causing reconnection to fail.
  * Show shared notes in the list.
  * Adapt material design style icons.
* 0.1.0: Jul 10, 2016
  * First proper release.

## License

[BSD 3-Clause](LICENSE)
