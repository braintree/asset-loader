'use strict';

var Promise = require('../lib/promise');
var loadScript = require('../load-script');

describe('loadScript', function () {
  beforeEach(function () {
    this.fakeContainer = {
      appendChild: this.sandbox.stub()
    };
    this.options = {
      id: 'script-id',
      src: 'script-src',
      container: this.fakeContainer
    };
    this.fakeScriptTag = {
      setAttribute: this.sandbox.stub(),
      addEventListener: this.sandbox.stub().withArgs('load').yieldsAsync()
    };

    this.sandbox.stub(document, 'createElement').returns(this.fakeScriptTag);
  });

  afterEach(function () {
    loadScript.clearCache();
  });

  it('returns a promise that resolves when script has loaded', function () {
    var promise = loadScript(this.options);

    expect(promise).to.be.an.instanceof(Promise);

    return promise.then(function (script) {
      expect(script).to.equal(this.fakeScriptTag);
      expect(this.fakeScriptTag.addEventListener).to.be.calledThrice;
    }.bind(this));
  });

  it('resolves with the script if a script with the same options has already been loaded', function () {
    var options = this.options;

    return loadScript(options).then(function () {
      document.createElement.resetHistory();

      return loadScript(options);
    }).then(function (script) {
      expect(script).to.equal(this.fakeScriptTag);
      expect(document.createElement).to.not.be.called;
    }.bind(this));
  });

  it('adds new script to page if options differ on second load', function () {
    var options = this.options;

    return loadScript(options).then(function () {
      document.createElement.resetHistory();
      options.dataAttributes = {
        'log-level': 'warn',
        foo: 'bar'
      };

      return loadScript(options);
    }).then(function (script) {
      expect(script).to.equal(this.fakeScriptTag);
      expect(document.createElement).to.be.calledOnce;
    }.bind(this));
  });

  it('can force a script reload', function () {
    this.sandbox.stub(document, 'querySelector').returns({});
    this.options.forceScriptReload = true;

    return loadScript(this.options).then(function (script) {
      expect(script).to.equal(this.fakeScriptTag);
      expect(document.createElement).to.be.calledOnce;
    }.bind(this));
  });

  it('rejects when script has errored', function () {
    this.fakeScriptTag.addEventListener.resetBehavior();
    this.fakeScriptTag.addEventListener.onCall(1).yieldsAsync();

    return loadScript(this.options).then(this.throwIfResolves).catch(function (error) {
      expect(error.message).to.equal('script-src failed to load.');
    });
  });

  it('rejects when script has aborted', function () {
    this.fakeScriptTag.addEventListener.resetBehavior();
    this.fakeScriptTag.addEventListener.onCall(2).yieldsAsync();

    return loadScript(this.options).then(this.throwIfResolves).catch(function (error) {
      expect(error.message).to.equal('script-src has aborted.');
    });
  });

  it('appends a configured script tag to provided container', function () {
    return loadScript(this.options).then(function () {
      var scriptTag = this.fakeContainer.appendChild.firstCall.args[0];

      expect(scriptTag).to.equal(this.fakeScriptTag);
      expect(scriptTag.async).to.equal(true);
      expect(scriptTag.id).to.equal('script-id');
      expect(scriptTag.src).to.equal('script-src');

      expect(scriptTag.addEventListener).to.be.calledThrice;
      expect(scriptTag.addEventListener).to.be.calledWith('load', this.sandbox.match.func);
    }.bind(this));
  });

  it('can pass crossorigin attribute', function () {
    this.options.crossorigin = 'anonymous';

    return loadScript(this.options).then(function () {
      var scriptTag = this.fakeContainer.appendChild.firstCall.args[0];

      expect(scriptTag.crossorigin).to.equal('anonymous');
    }.bind(this));
  });

  it('passes additional data-attributes', function () {
    this.options.dataAttributes = {
      'log-level': 'warn',
      foo: 'bar'
    };

    return loadScript(this.options).then(function () {
      expect(this.fakeScriptTag.setAttribute).to.be.calledTwice;
      expect(this.fakeScriptTag.setAttribute).to.be.calledWith('data-log-level', 'warn');
      expect(this.fakeScriptTag.setAttribute).to.be.calledWith('data-foo', 'bar');
    }.bind(this));
  });
});
