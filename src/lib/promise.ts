import PromisePolyfill from "promise-polyfill";

export const PromiseGlobal =
  // eslint-disable-next-line no-undef
  typeof Promise !== "undefined" ? Promise : PromisePolyfill;
