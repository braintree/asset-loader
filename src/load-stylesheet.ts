import { LoadStylesheetOptions } from "./types";

export = function loadStylesheet(
  options: LoadStylesheetOptions
): Promise<HTMLLinkElement> {
  let stylesheet = document.querySelector(
    `link[href="${options.href}"]`
  ) as HTMLLinkElement;

  if (stylesheet) {
    return Promise.resolve(stylesheet);
  }

  stylesheet = document.createElement("link");
  const container = options.container || document.head;

  stylesheet.setAttribute("rel", "stylesheet");
  stylesheet.setAttribute("type", "text/css");
  stylesheet.setAttribute("href", options.href);
  stylesheet.setAttribute("id", options.id);

  if (container.firstChild) {
    container.insertBefore(stylesheet, container.firstChild);
  } else {
    container.appendChild(stylesheet);
  }

  return Promise.resolve(stylesheet);
};
