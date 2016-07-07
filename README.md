# Insnota

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

## License

[BSD 3-Clause](LICENSE)
