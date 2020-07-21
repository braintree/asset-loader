import PromisePolyfill from "promise-polyfill";

const PromiseGlobal =
  // eslint-disable-next-line no-undef
  typeof Promise !== "undefined" ? Promise : PromisePolyfill;

export { PromiseGlobal };
