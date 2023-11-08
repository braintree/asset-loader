import * as assetsLoader from "../";
import { loadScript, loadStylesheet } from "../";

describe("assetsLoader", () => {
  it("exposes loadScript function", () => {
    expect(assetsLoader.loadScript).toBe(loadScript);
  });

  it("exposes loadStylesheet function", () => {
    expect(assetsLoader.loadStylesheet).toBe(loadStylesheet);
  });
});
