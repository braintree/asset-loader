# asset-loader

## Installation

```sh
npm install --save @braintree/asset-loader
```

## Usage

```js
var loadScript = require("@braintree/asset-loader/load-script");

loadScript({
  src: "https://example.com/some-js-file.js",
  container: domNodeToAddScriptTagTo, // optional, defaults to document.head
  id: "id-to-give-script-tag", // optional
  crossorigin: "anonymous", // optional
  dataAttributes: {
    // optional
    foo: "value", // adds data-foo="value" to script tag
  },
  // optional, by default a repeated call with the same options reuses the
  // earlier load. Setting this to `true` always adds a new script tag and
  // replaces the reused load for later calls with the same options.
  forceScriptReload: true,
})
  .then(function (script) {
    script; // a reference to the dom node
  })
  .catch(function (err) {
    // occurs when the script fails to load or is aborted. err is an
    // AssetLoadError with `src`, `failureKind` ("error" | "abort"),
    // `timing` and `onLine`. Calling loadScript again with the same
    // options starts a new load.
  });
```

```js
var loadStylesheet = require("@braintree/asset-loader/load-stylesheet");

loadStylesheet({
  href: "https://example.com/some-css-file.css",
  container: domNodeToAddScriptTagTo, // optional, defaults to document.head and always puts it at the top of the container
  id: "id-to-give-to-stylesheet-element", // optional
}).then(function (stylesheet) {
  stylesheet; // a reference to the dom node
});
```

Both methods will resolve immediately if the `script` or `link` element is already on the page.

## Development

Run tests:

```sh
npm test
```
