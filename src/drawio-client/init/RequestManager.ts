import { patch } from "../patch";
type ResponseList = { mediaType: string; href: string; source: string }[];

export class RequestManager {
  blobCache: Map<string, string>;
  responses: ResponseList;

  private constructor(
    responses: {
      mediaType: string;
      href: string;
      source: string;
    }[]
  ) {
    this.responses = responses;
    this.blobCache = new Map();
  }

  public static interceptRequests(responses: ResponseList) {
    const requestManager = new RequestManager(responses);
    requestManager.interceptRequests();
    return requestManager;
  }

  private resolveResourceUrl(url: string) {
    // Serve local resources from the app
    if (url.startsWith("app://")) {
      return url;
    }

    // Allow data urls
    if (url.startsWith("data:")) {
      return url;
    }

    // TODO: catch http requests so we can work offline
    // Allow fully qualified online resources
    if (/^(https?:|\/\/)/.test(url)) {
      return url;
    }

    // Seems to be an IE support thing
    if (url === "#default#VML") {
      return url;
    }

    // Use cached results
    if (this.blobCache.has(url)) {
      return this.blobCache.get(url);
    }

    const file = this.responses.find((file) => file.href === url);
    if (typeof file === "undefined") {
      console.warn("Missing local resource", "https://app.diagrams.net/" + url);
      // TODO: catch http requests so we can work offline
      // Allow fully qualified online resources
      return "https://app.diagrams.net/" + url;
    } else {
      // console.info("Loading local resource", url);
    }

    const mediaType = file.mediaType;
    const source = file.source;
    const isBase64 = mediaType.endsWith(";base64");

    let blobUrl;

    if (isBase64 && source.length < 1024) {
      blobUrl = "data:" + mediaType + "," + source;
    } else {
      const blob = new Blob([isBase64 ? atob(source) : source], {
        type: mediaType,
      });
      blobUrl = URL.createObjectURL(blob);
    }
    // Add result to cache
    this.blobCache.set(url, blobUrl);
    return blobUrl;
  }

  private interceptStylesheets() {
    const resolveResourceUrl = this.resolveResourceUrl.bind(this);
    patch(
      HTMLLinkElement.prototype,
      "setAttribute",
      (fn) =>
        function (qualifiedName: string, value: string) {
          if (qualifiedName === "href") {
            value = resolveResourceUrl(value);
          }
          return fn.call(this, qualifiedName, value);
        }
    );
  }

  private interceptScripts() {
    const resolveResourceUrl = this.resolveResourceUrl.bind(this);
    patch(
      HTMLScriptElement.prototype,
      "setAttribute",
      (fn) =>
        function (qualifiedName: string, value: string) {
          if (qualifiedName === "src") {
            value = resolveResourceUrl(value);
          }
          return fn.call(this, qualifiedName, value);
        }
    );
    Object.defineProperty(HTMLScriptElement.prototype, "src", {
      set(value) {
        this.setAttribute("src", value);
      },
    });
  }

  private interceptImages() {
    const resolveResourceUrl = this.resolveResourceUrl.bind(this);
    patch(
      HTMLImageElement.prototype,
      "setAttribute",
      (fn) =>
        function (qualifiedName: string, value: string) {
          if (qualifiedName === "src") {
            value = resolveResourceUrl(value);
          }
          return fn.call(this, qualifiedName, value);
        }
    );
    Object.defineProperty(HTMLImageElement.prototype, "src", {
      set(value) {
        this.setAttribute("src", value);
      },
    });
  }

  private interceptCss() {
    const resolveResourceUrl = this.resolveResourceUrl.bind(this);
    const htmlElementStylePropertyDescriptor = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      "style"
    );
    const urlPropertyPattern = /(url\([\'\"]?)(.*)([\'\"]?\))/g;
    Object.defineProperty(HTMLElement.prototype, "style", {
      get() {
        // Get the real CSS style declaration
        const cssStyleDeclaration =
          htmlElementStylePropertyDescriptor.get.call(this);
        return new Proxy(cssStyleDeclaration, {
          set(target, propertyKey, value, receiver) {
            if (typeof value === "string") {
              if (urlPropertyPattern.test(value)) {
                value = value.replace(
                  urlPropertyPattern,
                  (_, a, b, c) => `${a}${resolveResourceUrl(b)}${c}`
                );
              }
              try {
                return Reflect.set(target, propertyKey, value);
              } catch (err) {
                console.warn(err);
              }
            } else {
              return Reflect.set(target, propertyKey, value, receiver);
            }
          },
        });
      },
    });
  }

  private interceptXhrRequests() {
    const resolveResourceUrl = this.resolveResourceUrl.bind(this);
    patch(
      XMLHttpRequest.prototype,
      "open",
      (fn) =>
        function (_method: string, url: string, ...args: any[]) {
          url = resolveResourceUrl(url);
          console.warn("XHR", _method, url);
          return fn.call(this, _method, url, ...args);
        }
    );
  }

  public interceptRequests() {
    this.interceptStylesheets();
    this.interceptScripts();
    this.interceptImages();
    this.interceptCss();
    this.interceptXhrRequests();
  }
}

export function loadScript(src: string, scriptLoadCallback?: () => void) {
  const script = document.createElement("script");
  if (scriptLoadCallback) {
    script.addEventListener("load", () => {
      scriptLoadCallback();
    });
  }
  script.setAttribute("src", src);
  document.head.appendChild(script);
}

export function loadStylesheet(href: string) {
  const link = document.createElement("link");
  link.setAttribute("rel", "stylesheet");
  link.setAttribute("href", href);
  document.head.appendChild(link);
}
