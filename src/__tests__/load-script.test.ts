import { loadScript } from "../";
import { vi } from "vitest";
import { LoadScriptOptions } from "../types";

function noop(): void {
  // noop
}

describe("loadScript", () => {
  let testContext;

  beforeEach(() => {
    testContext = {};

    testContext.fakeContainer = {
      appendChild: vi.fn(),
    };

    testContext.options = {
      id: "script-id",
      src: "script-src",
      container: testContext.fakeContainer,
    } as LoadScriptOptions;

    testContext.fakeScriptTag = document.createElement("script");

    vi.spyOn(testContext.fakeScriptTag, "setAttribute");
    vi.spyOn(testContext.fakeScriptTag, "addEventListener").mockImplementation(
      (name, cb) => {
        if (typeof cb === "function") {
          cb();
        }
      },
    );

    testContext.createElementSpy = vi
      .spyOn(document, "createElement")
      .mockReturnValue(testContext.fakeScriptTag);
  });

  afterEach(() => {
    loadScript.clearCache();
    testContext.createElementSpy.mockRestore();
  });

  it("returns a promise that resolves when script has loaded", () => {
    const promise = loadScript(testContext.options);

    return promise.then((script) => {
      expect(script).toBe(testContext.fakeScriptTag);
      expect(testContext.fakeScriptTag.addEventListener).toBeCalledTimes(3);
    });
  });

  it("resolves with the script if a script with the same options has already been loaded", () => {
    const options = testContext.options;

    return loadScript(options)
      .then(() => {
        return loadScript(options);
      })
      .then((script) => {
        expect(script).toBe(testContext.fakeScriptTag);
        expect(document.createElement).toBeCalledTimes(1);
      });
  });

  it("adds new script to page if options differ on second load", () => {
    const options = testContext.options;
    const newFakeScript = {
      addEventListener: vi.fn().mockImplementationOnce((name, cb) => {
        cb();
      }),
      setAttribute: vi.fn(),
    };

    return loadScript(options)
      .then(() => {
        testContext.createElementSpy.mockReturnValue(newFakeScript);
        options.dataAttributes = {
          "log-level": "warn",
          foo: "bar",
        };

        return loadScript(options);
      })
      .then((script) => {
        expect(script).toBe(newFakeScript);
        expect(document.createElement).toBeCalledTimes(2);
      });
  });

  it("can force a script reload", () => {
    vi.spyOn(document, "querySelector").mockReturnValue(
      document.createElement("script"),
    );
    testContext.options.forceScriptReload = true;

    return loadScript(testContext.options).then((script) => {
      expect(script).toBe(testContext.fakeScriptTag);
      expect(document.createElement).toBeCalledTimes(2);
    });
  });

  it("rejects when script has errored", () => {
    testContext.fakeScriptTag.addEventListener.mockReset();
    testContext.fakeScriptTag.addEventListener.mockImplementationOnce(noop);
    testContext.fakeScriptTag.addEventListener.mockImplementationOnce(
      (name, cb) => {
        cb();
      },
    );

    return expect(loadScript(testContext.options)).rejects.toThrow(
      "script-src failed to load.",
    );
  });

  it("rejects when script has aborted", () => {
    testContext.fakeScriptTag.addEventListener.mockReset();
    testContext.fakeScriptTag.addEventListener.mockImplementationOnce(noop);
    testContext.fakeScriptTag.addEventListener.mockImplementationOnce(noop);
    testContext.fakeScriptTag.addEventListener.mockImplementationOnce(
      (name, cb) => {
        cb();
      },
    );

    return expect(loadScript(testContext.options)).rejects.toThrow(
      "script-src has aborted.",
    );
  });

  it("appends a configured script tag to provided container", () => {
    return loadScript(testContext.options).then(() => {
      const scriptTag = testContext.fakeContainer.appendChild.mock.calls[0][0];

      expect(scriptTag).toBe(testContext.fakeScriptTag);
      expect(scriptTag.async).toBe(true);
      expect(scriptTag.id).toBe("script-id");
      expect(scriptTag.src).toContain("script-src");

      expect(scriptTag.addEventListener).toBeCalledTimes(3);
      expect(scriptTag.addEventListener).toBeCalledWith(
        "load",
        expect.any(Function),
      );
    });
  });

  it("can pass crossorigin attribute", () => {
    testContext.options.crossorigin = "anonymous";

    return loadScript(testContext.options).then(() => {
      const scriptTag = testContext.fakeContainer.appendChild.mock.calls[0][0];

      expect(scriptTag.setAttribute).toBeCalledWith("crossorigin", "anonymous");
    });
  });

  it("can pass type attribute", () => {
    testContext.options.type = "module";

    return loadScript(testContext.options).then(() => {
      const scriptTag = testContext.fakeContainer.appendChild.mock.calls[0][0];

      expect(scriptTag.setAttribute).toBeCalledWith("type", "module");
    });
  });

  it("passes additional data-attributes", () => {
    testContext.options.dataAttributes = {
      "log-level": "warn",
      foo: "bar",
    };

    return loadScript(testContext.options).then(() => {
      expect(testContext.fakeScriptTag.setAttribute).toBeCalledWith(
        "data-log-level",
        "warn",
      );
      expect(testContext.fakeScriptTag.setAttribute).toBeCalledWith(
        "data-foo",
        "bar",
      );
      // This should be called once for every data-attribute in the options.dataAttributes object,
      // plus another for every value in the testContext.options in the beforeEach() callback
      expect(testContext.fakeScriptTag.setAttribute).toBeCalledTimes(5);
    });
  });
});
