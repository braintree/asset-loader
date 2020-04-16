export type LoadScriptOptions = {
  container?: HTMLElement;
  crossorigin?: boolean | string;
  dataAttributes?: Record<string, string | number>;
  forceScriptReload?: boolean;
  src: string;
  id?: string;
};

export type LoadStylesheetOptions = {
  href: string;
  container?: HTMLElement;
  id: string;
};
