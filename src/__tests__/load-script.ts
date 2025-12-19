import loadScript from "../load-script";
import type { LoadScriptOptions } from "../types";

function noop(): void {
  // noop
}

describe("loadScript", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let testContext: any;

  beforeEach(() => {
    testContext = {};

    testContext.fakeContainer = {
      appendChild: jest.fn(),
    };
    testContext.options = {
      id: "script-id",
      src: "script-src",
      container: testContext.fakeContainer,
    } as LoadScriptOptions;
    testContext.fakeScriptTag = document.createElement("script");
    testContext.fakeScriptTag.setAttribute = jest.fn();
    testContext.fakeScriptTag.addEventListener = jest.fn(
      (name: string, cb: () => void) => {
        cb();
      },
    );

    testContext.createElementSpy = jest
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
      expect(testContext.fakeScriptTag.addEventListener).toHaveBeenCalledTimes(
        3,
      );
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
        expect(document.createElement).toHaveBeenCalledTimes(1);
      });
  });

  it("adds new script to page if options differ on second load", () => {
    const options = testContext.options;
    const newFakeScript = {
      addEventListener: jest.fn().mockImplementationOnce((_name, cb) => {
        cb();
      }),
      setAttribute: jest.fn(),
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
        expect(document.createElement).toHaveBeenCalledTimes(2);
      });
  });

  it("can force a script reload", () => {
    jest
      .spyOn(document, "querySelector")
      .mockReturnValue(document.createElement("script"));
    testContext.options.forceScriptReload = true;

    return loadScript(testContext.options).then((script) => {
      expect(script).toBe(testContext.fakeScriptTag);
      expect(document.createElement).toHaveBeenCalledTimes(2);
    });
  });

  it("rejects when script has errored", () => {
    testContext.fakeScriptTag.addEventListener.mockReset();
    testContext.fakeScriptTag.addEventListener.mockImplementationOnce(noop);
    testContext.fakeScriptTag.addEventListener.mockImplementationOnce(
      (_name: string, cb: () => void) => {
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
      (_name: string, cb: () => void) => {
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

      expect(scriptTag.addEventListener).toHaveBeenCalledTimes(3);
      expect(scriptTag.addEventListener).toHaveBeenCalledWith(
        "load",
        expect.any(Function),
      );
    });
  });

  it("can pass crossorigin attribute", () => {
    testContext.options.crossorigin = "anonymous";

    return loadScript(testContext.options).then(() => {
      const scriptTag = testContext.fakeContainer.appendChild.mock.calls[0][0];

      expect(scriptTag.setAttribute).toHaveBeenCalledWith(
        "crossorigin",
        "anonymous",
      );
    });
  });

  it("can pass type attribute", () => {
    testContext.options.type = "module";

    return loadScript(testContext.options).then(() => {
      const scriptTag = testContext.fakeContainer.appendChild.mock.calls[0][0];

      expect(scriptTag.setAttribute).toHaveBeenCalledWith("type", "module");
    });
  });

  it("can pass integrity attribute", () => {
    testContext.options.integrity = "some-integrity-hash";

    return loadScript(testContext.options).then(() => {
      const scriptTag = testContext.fakeContainer.appendChild.mock.calls[0][0];

      expect(scriptTag.setAttribute).toHaveBeenCalledWith(
        "integrity",
        "some-integrity-hash",
      );
    });
  });

  it("passes additional data-attributes", () => {
    testContext.options.dataAttributes = {
      "log-level": "warn",
      foo: "bar",
    };

    return loadScript(testContext.options).then(() => {
      expect(testContext.fakeScriptTag.setAttribute).toHaveBeenCalledTimes(2);
      expect(testContext.fakeScriptTag.setAttribute).toHaveBeenCalledWith(
        "data-log-level",
        "warn",
      );
      expect(testContext.fakeScriptTag.setAttribute).toHaveBeenCalledWith(
        "data-foo",
        "bar",
      );
    });
  });
});
