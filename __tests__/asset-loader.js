const assetsLoader = require('../index.js');
const loadScript = require('../load-script');
const loadStylesheet = require('../load-stylesheet');

describe('assetsLoader', () => {
  it('exposes loadScript function', () => {
    expect(assetsLoader.loadScript).toBe(loadScript);
  });

  it('exposes loadStylesheet function', () => {
    expect(assetsLoader.loadStylesheet).toBe(loadStylesheet);
  });
});
