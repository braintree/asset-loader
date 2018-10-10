'use strict';

var chai = require('chai');
var sinon = require('sinon');

chai.use(require('sinon-chai'));

global.expect = chai.expect;

before(function () {
  this.sandbox = sinon.createSandbox();
  this.throwIfResolves = function throwIfResolves() {
    throw new Error('should not resolve');
  };
});

afterEach(function () {
  this.sandbox.restore();
});
