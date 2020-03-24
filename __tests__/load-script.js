const Promise = require('../lib/promise');
const loadScript = require('../load-script');

describe('loadScript', function () {
  let testContext;

  beforeEach(function () {
    testContext = {};

    testContext.fakeContainer = {
      appendChild: jest.fn()
    };
    testContext.options = {
      id: 'script-id',
      src: 'script-src',
      container: testContext.fakeContainer
    };
    testContext.fakeScriptTag = {
      setAttribute: jest.fn(),
      addEventListener: jest.fn().mockImplementationOnce((name, cb) => {
        cb();
      })
    };

    jest.spyOn(document, 'createElement').mockReturnValue(testContext.fakeScriptTag);
  });

  afterEach(function () {
    jest.clearAllMocks();
    loadScript.clearCache();
  });

  it('returns a promise that resolves when script has loaded', function () {
    const promise = loadScript(testContext.options);

    expect(promise).toBeInstanceOf(Promise);

    return promise.then(function (script) {
      expect(script).toBe(testContext.fakeScriptTag);
      expect(testContext.fakeScriptTag.addEventListener).toBeCalledTimes(3);
    });
  });

  it('resolves with the script if a script with the same options has already been loaded', function () {
    const options = testContext.options;

    return loadScript(options).then(function () {
      document.createElement.mockClear();

      return loadScript(options);
    }).then(function (script) {
      expect(script).toBe(testContext.fakeScriptTag);
      expect(document.createElement).not.toBeCalled();
    });
  });

  it('adds new script to page if options differ on second load', function () {
    const options = testContext.options;
    const newFakeScript = {
      addEventListener: jest.fn().mockImplementationOnce((name, cb) => {
        cb();
      }),
      setAttribute: jest.fn()
    };

    return loadScript(options).then(function () {
      document.createElement.mockReturnValue(newFakeScript);
      options.dataAttributes = {
        'log-level': 'warn',
        foo: 'bar'
      };

      return loadScript(options);
    }).then(function (script) {
      expect(script).toBe(newFakeScript);
      expect(document.createElement).toBeCalledTimes(2);
    });
  });

  it('can force a script reload', function () {
    jest.spyOn(document, 'querySelector').mockReturnValue({});
    testContext.options.forceScriptReload = true;

    return loadScript(testContext.options).then(function (script) {
      expect(script).toBe(testContext.fakeScriptTag);
      expect(document.createElement).toBeCalledTimes(1);
    });
  });

  it('rejects when script has errored', function () {
    testContext.fakeScriptTag.addEventListener.mockReset();
    testContext.fakeScriptTag.addEventListener.mockImplementationOnce();
    testContext.fakeScriptTag.addEventListener.mockImplementationOnce((name, cb) => {
      cb();
    });

    return expect(loadScript(testContext.options)).rejects.toThrow('script-src failed to load.');
  });

  it('rejects when script has aborted', function () {
    testContext.fakeScriptTag.addEventListener.mockReset();
    testContext.fakeScriptTag.addEventListener.mockImplementationOnce();
    testContext.fakeScriptTag.addEventListener.mockImplementationOnce();
    testContext.fakeScriptTag.addEventListener.mockImplementationOnce((name, cb) => {
      cb();
    });

    return expect(loadScript(testContext.options)).rejects.toThrow('script-src has aborted.');
  });

  it('appends a configured script tag to provided container', function () {
    return loadScript(testContext.options).then(function () {
      const scriptTag = testContext.fakeContainer.appendChild.mock.calls[0][0];

      expect(scriptTag).toBe(testContext.fakeScriptTag);
      expect(scriptTag.async).toBe(true);
      expect(scriptTag.id).toBe('script-id');
      expect(scriptTag.src).toBe('script-src');

      expect(scriptTag.addEventListener).toBeCalledTimes(3);
      expect(scriptTag.addEventListener).toBeCalledWith('load', expect.any(Function));
    });
  });

  it('can pass crossorigin attribute', function () {
    testContext.options.crossorigin = 'anonymous';

    return loadScript(testContext.options).then(function () {
      const scriptTag = testContext.fakeContainer.appendChild.mock.calls[0][0];

      expect(scriptTag.setAttribute).toBeCalledWith('crossorigin', 'anonymous');
    });
  });

  it('passes additional data-attributes', function () {
    testContext.options.dataAttributes = {
      'log-level': 'warn',
      foo: 'bar'
    };

    return loadScript(testContext.options).then(function () {
      expect(testContext.fakeScriptTag.setAttribute).toBeCalledTimes(2);
      expect(testContext.fakeScriptTag.setAttribute).toBeCalledWith('data-log-level', 'warn');
      expect(testContext.fakeScriptTag.setAttribute).toBeCalledWith('data-foo', 'bar');
    });
  });
});
