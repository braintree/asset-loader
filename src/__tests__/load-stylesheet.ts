import loadStylesheet from "../load-stylesheet";

describe("loadStylesheet", () => {
  let fakeHead;

  beforeEach(() => {
    fakeHead = {
      insertBefore: jest.fn(),
      appendChild: jest.fn(),
    };
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
      expect(fakeHead.appendChild).not.toBeCalled();
      expect(fakeHead.insertBefore).not.toBeCalled();
    });
  });

  it("injects configured stylesheet", () => {
    loadStylesheet({
      id: "stylesheet-id",
      href: "stylesheet-href",
      container: fakeHead,
    });

    const stylesheet = fakeHead.appendChild.mock.calls[0][0];

    expect(stylesheet).toBeDefined();
    expect(stylesheet.id).toBe("stylesheet-id");
    expect(stylesheet.href).toMatch(/stylesheet-href/);
  });

  it("inserts it before the head firstChild", () => {
    fakeHead.firstChild = "some dom node";

    loadStylesheet({
      id: "stylesheet-id-1",
      href: "stylesheet-href",
      container: fakeHead,
    });

    const stylesheet = fakeHead.insertBefore.mock.calls[0][0];

    expect(fakeHead.appendChild).not.toBeCalled();
    expect(fakeHead.insertBefore).toBeCalledTimes(1);
    expect(fakeHead.insertBefore).toBeCalledWith(stylesheet, "some dom node");
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

    expect(fakeHead.insertBefore).not.toBeCalled();
    expect(fakeHead.appendChild).toBeCalledTimes(1);
    expect(fakeHead.appendChild).toBeCalledWith(stylesheet);
  });
});
