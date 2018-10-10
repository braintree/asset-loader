'use strict';

var assetsLoader = require('../index.js');
var loadScript = require('../load-script');
var loadStylesheet = require('../load-stylesheet');

describe('assetsLoader', function () {
  it('exposes loadScript function', function () {
    expect(assetsLoader.loadScript).to.equal(loadScript);
  });

  it('exposes loadStylesheet function', function () {
    expect(assetsLoader.loadStylesheet).to.equal(loadStylesheet);
  });
});
