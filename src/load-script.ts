import {
  LoadScriptOptions,
  AssetLoadError,
  AssetLoadFailureKind,
} from "./types";

type CacheEntry = {
  promise: Promise<HTMLScriptElement>;
  state: "pending" | "loaded" | "failed";
};

let scriptCache = {} as Record<string, CacheEntry>;

function canReuse(entry: CacheEntry, forceReload?: boolean): boolean {
  return !forceReload && entry.state !== "failed";
}

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
  // forceScriptReload only controls whether the cache is read, so it must not
  // be part of the key, otherwise a forced load can never replace the entry.
  const { forceScriptReload, ...cacheableOptions } = options;
  const stringifiedOptions = JSON.stringify(cacheableOptions);
  const existing = scriptCache[stringifiedOptions];

  if (existing && canReuse(existing, forceScriptReload)) {
    return existing.promise;
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

  // Handlers only update their own entry and never touch the cache, so a
  // forced reload replacing the cached entry can't be undone by an old load.
  // State is set before settling so callers retrying from a catch see it.
  const entry = { state: "pending" } as CacheEntry;

  entry.promise = new Promise(function (resolve, reject) {
    const startTime = performance.now();

    // The first event decides the outcome; later ones can't override it.
    script.addEventListener("load", function () {
      if (entry.state !== "pending") {
        return;
      }

      entry.state = "loaded";
      resolve(script);
    });
    script.addEventListener("error", function () {
      if (entry.state !== "pending") {
        return;
      }

      entry.state = "failed";
      container.removeChild(script);
      reject(buildLoadError(options.src, "error", startTime));
    });
    script.addEventListener("abort", function () {
      if (entry.state !== "pending") {
        return;
      }

      entry.state = "failed";
      reject(buildLoadError(options.src, "abort", startTime));
    });
    container.appendChild(script);
  }) as Promise<HTMLScriptElement>;

  scriptCache[stringifiedOptions] = entry;

  return entry.promise;
}

loadScript.clearCache = function (): void {
  scriptCache = {};
};

export = loadScript;
