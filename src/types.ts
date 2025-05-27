export type LoadScriptOptions = {
  container?: HTMLElement;
  crossorigin?: boolean | string;
  dataAttributes?: Record<string, string | number>;
  forceScriptReload?: boolean;
  integrity?: string;
  src: string;
  type?: string;
  id?: string;
};

export type LoadStylesheetOptions = {
  href: string;
  container?: HTMLElement;
  id: string;
};
