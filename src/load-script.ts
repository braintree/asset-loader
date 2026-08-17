import {
  LoadScriptOptions,
  AssetLoadError,
  AssetLoadFailureKind,
} from "./types";

let scriptPromiseCache = {} as Record<string, Promise<HTMLScriptElement>>;

function buildLoadError(
  src: string,
  failureKind: AssetLoadFailureKind,
  startTime: number,
): AssetLoadError {
  const suffix = failureKind === "abort" ? "has aborted." : "failed to load.";
  const error = new Error(`${src} ${suffix}`) as AssetLoadError;

  error.src = src;
  error.failureKind = failureKind;
  error.timing = performance.now() - startTime;
  error.onLine = navigator.onLine;

  return error;
}

function loadScript(options: LoadScriptOptions): Promise<HTMLScriptElement> {
  let scriptLoadPromise;
  const stringifiedOptions = JSON.stringify(options);

  if (!options.forceScriptReload) {
    scriptLoadPromise = scriptPromiseCache[stringifiedOptions];

    if (scriptLoadPromise) {
      return scriptLoadPromise;
    }
  }

  const script = document.createElement("script");
  const attrs = options.dataAttributes || {};
  const container = options.container || document.head;

  script.src = options.src;
  script.id = options.id || "";
  script.async = true;

  if (options.type) {
    script.setAttribute("type", `${options.type}`);
  }

  if (options.crossorigin) {
    script.setAttribute("crossorigin", `${options.crossorigin}`);
  }

  if (options.integrity) {
    script.setAttribute("integrity", `${options.integrity}`);
  }

  Object.keys(attrs).forEach(function (key) {
    script.setAttribute(`data-${key}`, `${attrs[key]}`);
  });

  scriptLoadPromise = new Promise(function (resolve, reject) {
    const startTime = performance.now();

    script.addEventListener("load", function () {
      resolve(script);
    });
    script.addEventListener("error", function () {
      reject(buildLoadError(options.src, "error", startTime));
    });
    script.addEventListener("abort", function () {
      reject(buildLoadError(options.src, "abort", startTime));
    });
    container.appendChild(script);
  }) as Promise<HTMLScriptElement>;

  scriptPromiseCache[stringifiedOptions] = scriptLoadPromise;

  return scriptLoadPromise;
}

loadScript.clearCache = function (): void {
  scriptPromiseCache = {};
};

export = loadScript;
