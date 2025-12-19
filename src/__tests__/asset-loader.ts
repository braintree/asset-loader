import * as assetsLoader from "../";
import loadScript from "../load-script";
import loadStylesheet from "../load-stylesheet";

describe("assetsLoader", () => {
  it("exposes loadScript function", () => {
    expect(assetsLoader.loadScript).toBe(loadScript);
  });

  it("exposes loadStylesheet function", () => {
    expect(assetsLoader.loadStylesheet).toBe(loadStylesheet);
  });
});
