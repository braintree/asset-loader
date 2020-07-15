import assetsLoader = require("../");
import loadScript = require("../load-script");
import loadStylesheet = require("../load-stylesheet");

describe("assetsLoader", () => {
  it("exposes loadScript function", () => {
    expect(assetsLoader.loadScript).toBe(loadScript);
  });

  it("exposes loadStylesheet function", () => {
    expect(assetsLoader.loadStylesheet).toBe(loadStylesheet);
  });
});
