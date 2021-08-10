import { patch } from "./patch";
import files from "./resourceFiles";

const resourceBlobCache = new Map();

function interceptStylesheets() {
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

function interceptScripts() {
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

function interceptImages() {
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

function interceptCss() {
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

function interceptXhrRequests() {
  patch(
    XMLHttpRequest.prototype,
    "open",
    (fn) =>
      function (_method: string, url: string, ...args: any[]) {
        url = resolveResourceUrl(url);
        return fn.call(this, _method, url, ...args);
      }
  );
}

function resolveResourceUrl(url: string) {
  // TODO: catch http requests so we can work offline
  // Allow fully qualified online resources
  if (/^(data:|https?:|\/\/)/.test(url)) {
    return url;
  }

  // Seems to be an IE support thing
  if (url === "#default#VML") {
    return url;
  }

  // Use cached results
  if (resourceBlobCache.has(url)) {
    return resourceBlobCache.get(url);
  }

  const file = files.find((file) => file.href === url);
  if (typeof file === "undefined") {
    console.warn("Missing resource", url);
    return url;
  }

  const mediaType = file.mediaType;
  const source = file.source;
  const blob = new Blob(
    [mediaType.endsWith(";base64") ? atob(source) : source],
    { type: mediaType }
  );
  const blobUrl = URL.createObjectURL(blob);
  // Add result to cache
  resourceBlobCache.set(url, blobUrl);
  return blobUrl;
}

export function interceptResourceRequests() {
  // Default resources are included in grapheditor resources
  Object.defineProperty(window, "mxLoadResources", { value: false });

  interceptStylesheets();
  interceptScripts();
  interceptImages();
  interceptCss();
  interceptXhrRequests();
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
