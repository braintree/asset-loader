const assetsLoader = require('../index.js');
const loadScript = require('../load-script');
const loadStylesheet = require('../load-stylesheet');

describe('assetsLoader', function () {
  it('exposes loadScript function', function () {
    expect(assetsLoader.loadScript).toBe(loadScript);
  });

  it('exposes loadStylesheet function', function () {
    expect(assetsLoader.loadStylesheet).toBe(loadStylesheet);
  });
});
