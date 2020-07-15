import PromisePolyfill from "promise-polyfill";

const PromiseGlobal = window.Promise || PromisePolyfill;

export { PromiseGlobal };
