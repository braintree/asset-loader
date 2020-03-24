const assetsLoader = require('../index.js');
const loadScript = require('../load-script');
const loadStylesheet = require('../load-stylesheet');

describe('assetsLoader', () => {
  test('exposes loadScript function', () => {
    expect(assetsLoader.loadScript).toBe(loadScript);
  });

  test('exposes loadStylesheet function', () => {
    expect(assetsLoader.loadStylesheet).toBe(loadStylesheet);
  });
});
