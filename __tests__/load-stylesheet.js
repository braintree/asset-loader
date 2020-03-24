const loadStylesheet = require('../load-stylesheet');

describe('loadStylesheet', function () {
  let fakeHead;

  beforeEach(function () {
    fakeHead = {
      insertBefore: jest.fn(),
      appendChild: jest.fn()
    };
    jest.spyOn(document, 'querySelector').mockReturnValue(null);
  });

  afterEach(function () {
    jest.clearAllMocks();
  });

  it('returns a promise that resolves a stylesheet element', function () {
    return loadStylesheet({
      id: 'stylesheet-id',
      href: 'stylesheet-href',
      container: fakeHead
    }).then(function (link) {
      expect(link).toBeInstanceOf(HTMLElement);
      expect(link.id).toBe('stylesheet-id');
      expect(link.href).toMatch(/stylesheet-href/);
    });
  });

  it('returns a promise that resolves an existing stylesheet element if a link element exists on the page with with the same href', function () {
    const fakeLink = {};

    jest.spyOn(document, 'querySelector').mockReturnValue(fakeLink);

    return loadStylesheet({
      id: 'stylesheet-id',
      href: 'stylesheet-href',
      container: fakeHead
    }).then(function (link) {
      expect(link).toBe(fakeLink);
      expect(fakeHead.appendChild).not.toBeCalled();
      expect(fakeHead.insertBefore).not.toBeCalled();
    });
  });

  it('injects configured stylesheet', function () {
    let stylesheet;

    loadStylesheet({
      id: 'stylesheet-id',
      href: 'stylesheet-href',
      container: fakeHead
    });

    stylesheet = fakeHead.appendChild.mock.calls[0][0];

    expect(stylesheet).toBeDefined();
    expect(stylesheet.id).toBe('stylesheet-id');
    expect(stylesheet.href).toMatch(/stylesheet-href/);
  });

  it('inserts it before the head firstChild', function () {
    let stylesheet;

    fakeHead.firstChild = 'some domnode';

    loadStylesheet({
      id: 'stylesheet-id-1',
      href: 'stylesheet-href',
      container: fakeHead
    });

    stylesheet = fakeHead.insertBefore.mock.calls[0][0];

    expect(fakeHead.appendChild).not.toBeCalled();
    expect(fakeHead.insertBefore).toBeCalledTimes(1);
    expect(fakeHead.insertBefore).toBeCalledWith(stylesheet, 'some domnode');
  });

  it('appends child to head if no firstChild exists', function () {
    let stylesheet = {
      setAttribute: jest.fn()
    };

    jest.spyOn(document, 'createElement').mockReturnValue(stylesheet);

    loadStylesheet({
      id: 'stylesheet-id-1',
      href: 'stylesheet-href',
      container: fakeHead
    });

    expect(fakeHead.insertBefore).not.toBeCalled();
    expect(fakeHead.appendChild).toBeCalledTimes(1);
    expect(fakeHead.appendChild).toBeCalledWith(stylesheet);
  });
});
