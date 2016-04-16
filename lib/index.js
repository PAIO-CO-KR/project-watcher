'use strict';// eslint-disable-line strict

require('coffee-script').register();
const Linguist = require('atom-linguist');
const chokidar = require('chokidar');

class ProjectWatcher {
  constructor(projectPath) {
    console.log(chokidar);
    console.log(Linguist);
  }
}

module.exports = ProjectWatcher;
