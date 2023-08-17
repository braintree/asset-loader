import { PromiseGlobal as Promise } from "./lib/promise";
import { LoadScriptOptions } from "./types";

let scriptPromiseCache = {} as Record<string, Promise<HTMLScriptElement>>;

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

  Object.keys(attrs).forEach(function (key) {
    script.setAttribute(`data-${key}`, `${attrs[key]}`);
  });

  scriptLoadPromise = new Promise(function (resolve, reject) {
    script.addEventListener("load", function () {
      resolve(script);
    });
    script.addEventListener("error", function () {
      reject(new Error(`${options.src} failed to load.`));
    });
    script.addEventListener("abort", function () {
      reject(new Error(`${options.src} has aborted.`));
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
