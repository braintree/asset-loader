'use strict';

var loadStylesheet = require('../load-stylesheet');

describe('loadStylesheet', function () {
  beforeEach(function () {
    this.fakeHead = {
      insertBefore: this.sandbox.stub(),
      appendChild: this.sandbox.stub()
    };
  });

  it('returns a promise that resolves a stylesheet element', function () {
    return loadStylesheet({
      id: 'stylesheet-id',
      href: 'stylesheet-href',
      container: this.fakeHead
    }).then(function (link) {
      expect(link).to.be.an.instanceof(HTMLElement);
      expect(link.id).to.equal('stylesheet-id');
      expect(link.href).to.match(/stylesheet-href/);
    });
  });

  it('returns a promise that resolves an existing stylesheet element if a link element exists on the page with with the same href', function () {
    var fakeLink = {};

    this.sandbox.stub(document, 'querySelector').returns(fakeLink);

    return loadStylesheet({
      id: 'stylesheet-id',
      href: 'stylesheet-href',
      container: this.fakeHead
    }).then(function (link) {
      expect(link).to.equal(fakeLink);
      expect(this.fakeHead.appendChild).to.not.be.called;
      expect(this.fakeHead.insertBefore).to.not.be.called;
    }.bind(this));
  });

  it('injects configured stylesheet', function () {
    var stylesheet;

    loadStylesheet({
      id: 'stylesheet-id',
      href: 'stylesheet-href',
      container: this.fakeHead
    });

    stylesheet = this.fakeHead.appendChild.firstCall.args[0];

    expect(stylesheet).to.exist;
    expect(stylesheet.id).to.equal('stylesheet-id');
    expect(stylesheet.href).to.match(/stylesheet-href/);
  });

  it('inserts it before the head firstChild', function () {
    var stylesheet;

    this.fakeHead.firstChild = 'some domnode';

    loadStylesheet({
      id: 'stylesheet-id-1',
      href: 'stylesheet-href',
      container: this.fakeHead
    });

    stylesheet = this.fakeHead.insertBefore.firstCall.args[0];

    expect(this.fakeHead.appendChild).to.not.be.called;
    expect(this.fakeHead.insertBefore).to.be.calledOnce;
    expect(this.fakeHead.insertBefore).to.be.calledWith(stylesheet, 'some domnode');
  });

  it('appends child to head if no firstChild exists', function () {
    var stylesheet;

    loadStylesheet({
      id: 'stylesheet-id-1',
      href: 'stylesheet-href',
      container: this.fakeHead
    });

    stylesheet = this.fakeHead.appendChild.firstCall.args[0];

    expect(this.fakeHead.insertBefore).to.not.be.called;
    expect(this.fakeHead.appendChild).to.be.calledOnce;
    expect(this.fakeHead.appendChild).to.be.calledWith(stylesheet);
  });
});
