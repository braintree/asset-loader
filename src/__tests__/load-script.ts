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
      removeChild: jest.fn(),
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

  it("rejects with enriched failure detail when script has errored", () => {
    expect.assertions(4);

    testContext.fakeScriptTag.addEventListener.mockReset();
    testContext.fakeScriptTag.addEventListener.mockImplementationOnce(noop);
    testContext.fakeScriptTag.addEventListener.mockImplementationOnce(
      (_name: string, cb: () => void) => {
        cb();
      },
    );

    return loadScript(testContext.options).catch((err) => {
      expect(err.src).toBe("script-src");
      expect(err.failureKind).toBe("error");
      expect(typeof err.timing).toBe("number");
      expect(typeof err.onLine).toBe("boolean");
    });
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

  it("rejects with enriched failure detail when script has aborted", () => {
    expect.assertions(4);

    testContext.fakeScriptTag.addEventListener.mockReset();
    testContext.fakeScriptTag.addEventListener.mockImplementationOnce(noop);
    testContext.fakeScriptTag.addEventListener.mockImplementationOnce(noop);
    testContext.fakeScriptTag.addEventListener.mockImplementationOnce(
      (_name: string, cb: () => void) => {
        cb();
      },
    );

    return loadScript(testContext.options).catch((err) => {
      expect(err.src).toBe("script-src");
      expect(err.failureKind).toBe("abort");
      expect(typeof err.timing).toBe("number");
      expect(typeof err.onLine).toBe("boolean");
    });
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

  describe("failure cleanup and caching", () => {
    type Listener = () => void;
    type ControlledTag = {
      setAttribute: jest.Mock;
      addEventListener: jest.Mock;
      fire: (name: string) => void;
    };

    // Unlike the default fake tag, listeners fire on demand rather than
    // synchronously, which mirrors how browsers dispatch load/error events.
    function buildControlledTag(): ControlledTag {
      const listeners: Record<string, Listener> = {};

      return {
        setAttribute: jest.fn(),
        addEventListener: jest.fn((name: string, cb: Listener) => {
          listeners[name] = cb;
        }),
        fire: (name: string) => listeners[name](),
      };
    }

    let tags: ControlledTag[];

    beforeEach(() => {
      tags = [];
      testContext.createElementSpy.mockImplementation(() => {
        const tag = buildControlledTag();

        tags.push(tag);

        return tag;
      });
    });

    it("removes the script tag and clears the cache entry on error", async () => {
      const rejection = expect(loadScript(testContext.options)).rejects.toThrow(
        "script-src failed to load.",
      );

      tags[0].fire("error");
      await rejection;

      expect(testContext.fakeContainer.removeChild).toHaveBeenCalledTimes(1);
      expect(testContext.fakeContainer.removeChild).toHaveBeenCalledWith(
        tags[0],
      );

      loadScript(testContext.options).catch(noop);

      expect(tags).toHaveLength(2);
    });

    it("lets a later call with the same options create a new tag and succeed", async () => {
      const failed = expect(loadScript(testContext.options)).rejects.toThrow();

      tags[0].fire("error");
      await failed;

      const retry = loadScript(testContext.options);

      expect(tags).toHaveLength(2);
      expect(testContext.fakeContainer.appendChild).toHaveBeenLastCalledWith(
        tags[1],
      );

      tags[1].fire("load");

      await expect(retry).resolves.toBe(tags[1]);
    });

    it("starts a new load after an abort instead of reusing the rejected entry", async () => {
      const aborted = expect(loadScript(testContext.options)).rejects.toThrow(
        "script-src has aborted.",
      );

      tags[0].fire("abort");
      await aborted;

      const retry = loadScript(testContext.options);

      expect(tags).toHaveLength(2);

      tags[1].fire("load");

      await expect(retry).resolves.toBe(tags[1]);
    });

    it("can retry from inside a catch handler", async () => {
      const retried = loadScript(testContext.options).catch(() =>
        loadScript(testContext.options),
      );

      tags[0].fire("error");
      await Promise.resolve();
      await Promise.resolve();

      expect(tags).toHaveLength(2);

      tags[1].fire("load");

      await expect(retried).resolves.toBe(tags[1]);
    });

    it("lets a forced reload replace a rejected entry", async () => {
      const aborted = expect(loadScript(testContext.options)).rejects.toThrow();

      tags[0].fire("abort");
      await aborted;

      const forced = loadScript({
        ...testContext.options,
        forceScriptReload: true,
      });

      expect(tags).toHaveLength(2);

      tags[1].fire("load");
      await forced;

      expect(loadScript(testContext.options)).toBe(forced);
      expect(tags).toHaveLength(2);
    });

    it("ignores events that arrive after the load has settled", async () => {
      const first = loadScript(testContext.options);

      tags[0].fire("load");
      await first;
      tags[0].fire("error");

      expect(testContext.fakeContainer.removeChild).not.toHaveBeenCalled();
      expect(loadScript(testContext.options)).toBe(first);
      expect(tags).toHaveLength(1);
    });

    it("keeps a newer cache entry when an older load fails", async () => {
      const oldLoad = expect(loadScript(testContext.options)).rejects.toThrow();
      const forcedLoad = loadScript({
        ...testContext.options,
        forceScriptReload: true,
      });

      tags[0].fire("error");
      await oldLoad;

      // The failed load must not evict the entry that replaced it.
      expect(loadScript(testContext.options)).toBe(forcedLoad);
      expect(tags).toHaveLength(2);

      tags[1].fire("load");

      await expect(forcedLoad).resolves.toBe(tags[1]);
    });

    it("excludes forceScriptReload from the cache key", async () => {
      const first = loadScript(testContext.options);

      tags[0].fire("load");
      await first;

      const forced = loadScript({
        ...testContext.options,
        forceScriptReload: true,
      });

      expect(forced).not.toBe(first);
      expect(tags).toHaveLength(2);

      tags[1].fire("load");
      await forced;

      // A forced load replaces the cached entry for the same options.
      expect(loadScript(testContext.options)).toBe(forced);
      expect(tags).toHaveLength(2);
    });

    it("shares one in-flight promise between concurrent callers", async () => {
      const first = loadScript(testContext.options);
      const second = loadScript(testContext.options);

      expect(second).toBe(first);
      expect(tags).toHaveLength(1);
      expect(testContext.fakeContainer.appendChild).toHaveBeenCalledTimes(1);

      tags[0].fire("load");

      const [firstScript, secondScript] = await Promise.all([first, second]);

      expect(firstScript).toBe(tags[0]);
      expect(secondScript).toBe(tags[0]);
    });

    describe("timeout", () => {
      beforeEach(() => {
        jest.useFakeTimers();
        testContext.options.timeout = 1000;
      });

      afterEach(() => {
        jest.useRealTimers();
      });

      it("rejects with a timeout failure when the load never finishes", async () => {
        expect.assertions(5);

        const rejection = loadScript(testContext.options).catch((err) => {
          expect(err.message).toBe("script-src timed out.");
          expect(err.src).toBe("script-src");
          expect(err.failureKind).toBe("timeout");
          expect(err.timing).toBeGreaterThanOrEqual(1000);
          expect(typeof err.onLine).toBe("boolean");
        });

        jest.advanceTimersByTime(1000);
        await rejection;
      });

      it("does not reject before the timeout has elapsed", async () => {
        const onSettled = jest.fn();

        loadScript(testContext.options).then(onSettled, onSettled);
        jest.advanceTimersByTime(999);
        await Promise.resolve();

        expect(onSettled).not.toHaveBeenCalled();

        tags[0].fire("load");
        await Promise.resolve();

        expect(onSettled).toHaveBeenCalledWith(tags[0]);
      });

      it("does not start a timer when no timeout is given", () => {
        delete testContext.options.timeout;

        loadScript(testContext.options).catch(noop);

        expect(jest.getTimerCount()).toBe(0);
      });

      it("starts a new load on the next call after a timeout", async () => {
        const timedOut = expect(
          loadScript(testContext.options),
        ).rejects.toThrow("script-src timed out.");

        jest.advanceTimersByTime(1000);
        await timedOut;

        const retry = loadScript(testContext.options);

        expect(tags).toHaveLength(2);
        // The first tag can't be cancelled, so it is left in place.
        expect(testContext.fakeContainer.removeChild).not.toHaveBeenCalled();

        tags[1].fire("load");

        await expect(retry).resolves.toBe(tags[1]);
      });

      it("fixes the entry when the load succeeds after timing out", async () => {
        const timedOut = expect(
          loadScript(testContext.options),
        ).rejects.toThrow("script-src timed out.");

        jest.advanceTimersByTime(1000);
        await timedOut;

        tags[0].fire("load");

        await expect(loadScript(testContext.options)).resolves.toBe(tags[0]);
        expect(tags).toHaveLength(1);
      });

      it.each(["load", "error", "abort"])(
        "clears the timer on %s",
        async (eventName: string) => {
          const settled = loadScript(testContext.options).catch(noop);

          expect(jest.getTimerCount()).toBe(1);

          tags[0].fire(eventName);
          await settled;

          expect(jest.getTimerCount()).toBe(0);
        },
      );

      it("excludes timeout from the cache key and uses the first caller's value", async () => {
        const first = loadScript(testContext.options);
        const second = loadScript({ ...testContext.options, timeout: 60000 });

        expect(second).toBe(first);
        expect(tags).toHaveLength(1);

        const rejections = Promise.all([
          expect(first).rejects.toThrow("script-src timed out."),
          expect(second).rejects.toThrow("script-src timed out."),
        ]);

        jest.advanceTimersByTime(1000);
        await rejections;
      });
    });
  });
});
