'use strict';// eslint-disable-line

var assert = require('assert');
var ProjectWatcher = require('../lib');
const spawn = require('child_process').spawn;

describe('project-watcher', function () {
  it('should have unit test!', function (done) {
    new ProjectWatcher(process.cwd()).on('codingHour', event => {
      console.log(event);
      assert(event !== null);
      done();
    });
    setTimeout(() => spawn('touch', [`${process.cwd()}/package.json`]), 100);
  });
});
