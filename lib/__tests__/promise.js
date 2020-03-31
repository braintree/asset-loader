const promisePolyfill = require('promise-polyfill');
const originalPromise = global.Promise;

describe('Promise polyfill', () => {
  it('loads promise polyfill if environment lacks native promise support', () => {
    let Promise;

    global.Promise = undefined; // eslint-disable-line no-undefined

    Promise = require('../promise');

    const testPromise = new Promise(() => {});

    expect(testPromise).toBeInstanceOf(promisePolyfill);
    expect(testPromise).not.toBeInstanceOf(originalPromise);
  });
});
