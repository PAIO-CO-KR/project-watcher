'use strict';// eslint-disable-line

require('coffee-script').register();
const Linguist = require('atom-linguist');
const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');
const yaml = require('js-yaml');


/**
 * Project Watcher
 * @class
 */
class ProjectWatcher extends EventEmitter {
  constructor(projectPath) {
    super();
    if (typeof projectPath !== 'string') {
      throw 'path should be a string';
    }
    if (!path.isAbsolute(projectPath)) {
      throw 'path is not absolute';
    }

    this.projectPath = projectPath;
    this._watchBuffer = [];
    this._lastDate = 0;

    //count file change event as coding hours, maximum value in ms.
    this.maxCodingDuration = 10 * 60 * 1000;
    //gether watch events those coincidence duration is less than specified in ms.
    this.lumpThreshold = 500;
    //determine ignore
    this.ignores = [];
    //hidden path
    this.ignores.push(/(^|\/)\.[^\/\.]/);
    //vendor files
    this.ignores.push(new RegExp(yaml.safeLoad(fs.readFileSync(`${__dirname}/../data/vendor.yml`, {json: true})).join('|')));

    this._watcher = fs.watch(projectPath, { persistent: true, recursive: true }, this._onFileEvent.bind(this));
  }

  /**
   * on file watch event arised
   * @param event
   * @param filename
   */
  _onFileEvent(event, filename) {
    //if there is no filename provided, skip.
    if (typeof filename !== 'string') {
      return;
    }
    //if the filename matches ignore, skip.
    for (let ignore of this.ignores) {
      if (filename.match(ignore) !== null) {
        return;
      }
    }

    //detect language of the file
    let lang = null;
    try {
      lang = Linguist.detect(path.resolve(this.projectPath, filename));
    } catch (e) {
      return e;
    }

    this.registerCoding(filename, lang);
  }

  /**
   * register coding
   * @param filename
   * @param lang
   */
  registerCoding(filename, lang) {
    this._watchBuffer.push({
      path: filename,
      lang: lang,
      date: Date.now()
    });

    //lumping events
    if (this._lumpTimeout) {
      clearTimeout(this._lumpTimeout);
    }
    this._lumpTimeout = setTimeout(() => {
      let now = Date.now();
      this.emit('codingHour', {
        //duration is 0~1000 in ms.
        duration: Math.min(Math.max(now - this._lastDate, 0), this.maxCodingDuration),
        //assume first one file is the user coded, rest are auto-generated/vendored files.
        lang: this._watchBuffer[0].lang,
        files: this._watchBuffer
      });

      this._watchBuffer = [];
      this._lastDate = now;
      this._lumpTimeout = null;
    }, this.lumpThreshold);
  }

  /**
   * stop watching
   */
  stop() {
    if (this._watcher) {
      this._watcher.close();
    }
  }
}

module.exports = ProjectWatcher;
