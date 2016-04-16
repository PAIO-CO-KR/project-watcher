'use strict';// eslint-disable-line strict

var assert = require('assert');
var ProjectWatcher = require('../lib');

describe('project-watcher', function () {
  it('should have unit test!', function () {
    console.log(new ProjectWatcher());
    assert(true, 'we expected this package author to add actual unit tests.');
  });
});
