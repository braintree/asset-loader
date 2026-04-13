import loadStylesheet from "../load-stylesheet";

describe("loadStylesheet", () => {
  let fakeHead: HTMLElement;

  beforeEach(() => {
    fakeHead = document.createElement("head");
    fakeHead.insertBefore = jest.fn();
    fakeHead.appendChild = jest.fn();
    jest.spyOn(document, "querySelector").mockReturnValue(null);
  });

  it("returns a promise that resolves a stylesheet element", () => {
    return loadStylesheet({
      id: "stylesheet-id",
      href: "stylesheet-href",
      container: fakeHead,
    }).then((link) => {
      expect(link).toBeInstanceOf(HTMLElement);
      expect(link.id).toBe("stylesheet-id");
      expect(link.href).toMatch(/stylesheet-href/);
    });
  });

  it("returns a promise that resolves an existing stylesheet element if a link element exists on the page with the same href", () => {
    const fakeLink = document.createElement("link");

    jest.spyOn(document, "querySelector").mockReturnValue(fakeLink);

    return loadStylesheet({
      id: "stylesheet-id",
      href: "stylesheet-href",
      container: fakeHead,
    }).then((link) => {
      expect(link).toBe(fakeLink);
      expect(fakeHead.appendChild).not.toHaveBeenCalled();
      expect(fakeHead.insertBefore).not.toHaveBeenCalled();
    });
  });

  it("injects configured stylesheet", () => {
    const spy = jest.spyOn(fakeHead, "appendChild");

    loadStylesheet({
      id: "stylesheet-id",
      href: "stylesheet-href",
      container: fakeHead,
    });

    const stylesheet = spy.mock.calls[0][0] as HTMLLinkElement;

    expect(stylesheet).toBeDefined();
    expect(stylesheet.id).toBe("stylesheet-id");
    expect(stylesheet.href).toMatch(/stylesheet-href/);
  });

  it("inserts it before the head firstChild", () => {
    const childNode = document.createElement("div");
    fakeHead.append(childNode);

    const spy = jest.spyOn(fakeHead, "insertBefore");

    loadStylesheet({
      id: "stylesheet-id-1",
      href: "stylesheet-href",
      container: fakeHead,
    });

    const stylesheet = spy.mock.calls[0][0];

    expect(fakeHead.appendChild).not.toHaveBeenCalled();
    expect(fakeHead.insertBefore).toHaveBeenCalledTimes(1);
    expect(fakeHead.insertBefore).toHaveBeenCalledWith(stylesheet, childNode);
  });

  it("appends child to head if no firstChild exists", () => {
    const stylesheet = document.createElement("style");
    jest.spyOn(stylesheet, "setAttribute").mockImplementation();

    jest.spyOn(document, "createElement").mockReturnValue(stylesheet);

    loadStylesheet({
      id: "stylesheet-id-1",
      href: "stylesheet-href",
      container: fakeHead,
    });

    expect(fakeHead.insertBefore).not.toHaveBeenCalled();
    expect(fakeHead.appendChild).toHaveBeenCalledTimes(1);
    expect(fakeHead.appendChild).toHaveBeenCalledWith(stylesheet);
  });
});
