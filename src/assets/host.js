// ellipse;whiteSpace=wrap;html=1;aspect=fixed;sketch=1;hachureGap=4;pointerEvents=0;fontFamily=Architects Daughter;fontSource=https%3A%2F%2Ffonts.googleapis.com%2Fcss%3Ffamily%3DArchitects%2BDaughter;fontSize=20;
/*
edgeStyle=none;
curved=0;
rounded=1;
sketch=1;
orthogonalLoop=1;
jettySize=auto;
html=1;
fontFamily=Architects Daughter;
fontSource=https%3A%2F%2Ffonts.googleapis.com%2Fcss%3Ffamily%3DArchitects%2BDaughter;
fontSize=20;
endArrow=open;
startSize=14;
endSize=14;
sourcePerimeterSpacing=8;
targetPerimeterSpacing=8;
*/
(function (win, doc) {
  const resourceFiles = new Map();

  function addResourceFile(mediaType, href, content) {
    resourceFiles.set(href, {
      mediaType,
      content,
    });
  }

  win.addResourceFile = addResourceFile;

  // Record settings
  const settingsProxy = new Proxy(
    {},
    {
      get(target, propertyKey, receiver) {
        console.log("reading setting", propertyKey);
        return null;
      },
      set(target, propertyKey, receiver) {
        console.log("writing setting", propertyKey);
        return true;
      },
    }
  );

  const config = {
    // sketch: "1",
    // compressXml: true,
    // defaultFonts: ["Architects Daughter"],
    // // customFonts: [],
    // // presetColors: [],
    // // customPresetColors: [],
    // // defaultColors: [],
    // defaultVertexStyle: {
    //   sketch: "1",
    //   fillColor: "transparent",
    //   strokeColor: "currentColor",
    //   fontColor: "currentColor",
    //   hachureGap: "4",
    //   fontFamily: "Architects Daughter",
    //   fontSource:
    //     "https%3A%2F%2Ffonts.googleapis.com%2Fcss%3Ffamily%3DArchitects%2BDaughter",
    //   fontSize: "20",
    // },
    // defaultEdgeStyle: {
    //   sketch: "1",
    //   sourcePerimeterSpacing: "8",
    //   targetPerimeterSpacing: "8",
    //   startSize: "14",
    //   endSize: "14",
    //   jettySize: "auto",
    //   fillColor: "transparent",
    //   strokeColor: "currentColor",
    //   fontColor: "currentColor",
    //   fontFamily: "Architects Daughter",
    //   fontSource:
    //     "https%3A%2F%2Ffonts.googleapis.com%2Fcss%3Ffamily%3DArchitects%2BDaughter",
    //   fontSize: "20",
    // },
    // // defaultColorSchemes: [],
    // // customColorSchemes: [
    // //   {
    // //     fill: "transparent",
    // //     stroke: "currentColor",
    // //   },
    // // ],
    // // styles: [
    // //   {},
    // //   {
    // //     commonStyle: {
    // //       fontColor: "currentColor",
    // //       strokeColor: "currentColor",
    // //       fillColor: "transparent",
    // //     },
    // //   },
    // // ],
    // defaultLibraries: "general;basic",
    // enabledLibraries: ["basic", "general"],
    // // libraries: [],
    // // defaultCustomLibraries: [],
    // // enableCustomLibraries: false,
    // // css: "",
    // fontCss: `@import url('https://fonts.googleapis.com/css2?family=Architects+Daughter&display=swap');`,
  };

  // Default configuration
  Object.defineProperty(win, "DRAWIO_CONFIG", {
    value: settingsProxy,
  });

  Object.defineProperty(win, "urlParams", {
    value: settingsProxy,
  });

  let _mxSettings = {
    load(...args) {
      console.log("load mxSettings", ...args);
      _mxSettingsSettings = settingsProxy;
    },
  };

  let _mxSettingsSettings = null;

  Object.defineProperty(win, "mxSettings", {
    get() {
      return _mxSettings;
    },
    set(value) {
      Object.defineProperty(value, "settings", {
        set() {
          console.log("define mxSettings settings object");
          return true;
        },
        get() {
          return _mxSettingsSettings;
        },
      });
      Object.defineProperty(value, "parse", {
        value: () => {
          console.log("parse settings");
        },
      });
      _mxSettings = value;
      return true;
    },
  });

  const localStorageSettings = {
    // sketch: "1",
    // language: "en",
    // customFonts: [],
    // customLibraries: [],
    // plugins: [],
    // recentColors: [],
    // search: false,
    // showStartScreen: false,
    // autosave: false,
    // isNew: true,
    // isRulerOn: false,
  };

  const urlParams = {
    // sketch: "1",
    // ui: "min",
    // embed: "1",
    // configure: "0",
    // proto: "json",
    // noSaveBtn: "1",
    // noExitBtn: "1",
    // saveAndExit: "0",
    // noLangIcon: "1",
    // chrome: "1",
    // pages: "0",
  };

  function patch(obj, name, factory) {
    const fn = obj[name];
    obj[name] = factory(fn);
  }

  const resourceCache = {};

  function getResourceUrl(url) {
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
    if (resourceCache[url]) {
      return resourceCache[url];
    }

    // const fileScripts = Array.from(
    //   doc.head.querySelectorAll("script[type='text/plain'][data-href]")
    // );
    // const fileScript = fileScripts.find(
    //   (element) => element.getAttribute("data-href") === url
    // );
    // if (typeof fileScript === "undefined") {
    //   console.warn("Missing resource", url);
    //   return url;
    // }
    // const mediaType = fileScript.getAttribute("data-mediatype");

    // if (fileScript.text.length < 1024) {
    //   const dataUrl = `data:${mediaType},${fileScript.text}`;
    //   // Add result to cache
    //   resourceCache[url] = dataUrl;
    //   return dataUrl;
    // } else {
    //   const blob = new Blob(
    //     [
    //       mediaType.endsWith(";base64")
    //         ? atob(fileScript.text)
    //         : fileScript.text,
    //     ],
    //     { type: mediaType }
    //   );
    //   const blobUrl = URL.createObjectURL(blob);
    //   // Add result to cache
    //   resourceCache[url] = blobUrl;
    //   return blobUrl;
    // }

    const fileEntry = files.get(url);
    if (typeof fileEntry === "undefined") {
      console.warn("Missing resource", url);
      return url;
    }
    const mediaType = fileEntry.mediaType;
    const content = fileEntry.content;
    const blob = new Blob(
      [mediaType.endsWith(";base64") ? atob(content) : content],
      { type: mediaType }
    );
    const blobUrl = URL.createObjectURL(blob);
    // Add result to cache
    resourceCache[url] = blobUrl;
    return blobUrl;
  }

  function loadStylesheet(href) {
    const link = doc.createElement("link");
    link.setAttribute("rel", "stylesheet");
    link.setAttribute("href", href);
    doc.head.appendChild(link);
  }

  // TODO: Clean this up
  function mxscript(src, onLoad, id, dataAppKey, noWrite) {
    //if (onLoad != null || noWrite) {
    var s = document.createElement("script");
    s.setAttribute("type", "text/javascript");
    s.setAttribute("src", src);
    var r = false;

    if (id != null) {
      s.setAttribute("id", id);
    }

    if (dataAppKey != null) {
      s.setAttribute("data-app-key", dataAppKey);
    }

    if (onLoad != null) {
      s.onload = s.onreadystatechange = function () {
        if (!r && (!this.readyState || this.readyState == "complete")) {
          r = true;
          onLoad();
        }
      };
    }

    var t = document.getElementsByTagName("script")[0];

    if (t != null) {
      t.parentNode.insertBefore(s, t);
    }
    // } else {
    //   document.write(
    //     '<script src="' +
    //       src +
    //       '"' +
    //       (id != null ? ' id="' + id + '" ' : "") +
    //       (dataAppKey != null ? ' data-app-key="' + dataAppKey + '" ' : "") +
    //       "></scr" +
    //       "ipt>"
    //   );
    // }
  }

  Object.defineProperty(win, "mxscript", {
    value: mxscript,
  });

  /*
  patch(
    HTMLLinkElement.prototype,
    "setAttribute",
    (fn) =>
      function (qualifiedName, value) {
        if (qualifiedName === "href") {
          value = getResourceUrl(value);
        }
        return fn.call(this, qualifiedName, value);
      }
  );

  patch(
    HTMLScriptElement.prototype,
    "setAttribute",
    (fn) =>
      function (qualifiedName, value) {
        if (qualifiedName === "src") {
          value = getResourceUrl(value);
        }
        return fn.call(this, qualifiedName, value);
      }
  );

  patch(
    HTMLImageElement.prototype,
    "setAttribute",
    (fn) =>
      function (qualifiedName, value) {
        if (qualifiedName === "src") {
          value = getResourceUrl(value);
        }
        return fn.call(this, qualifiedName, value);
      }
  );

  Object.defineProperty(HTMLScriptElement.prototype, "src", {
    set(value) {
      this.setAttribute("src", value);
    },
  });

  Object.defineProperty(HTMLImageElement.prototype, "src", {
    set(value) {
      this.setAttribute("src", value);
    },
  });

  
  // Replace CSS background images with local resources
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
                (_, a, b, c) => `${a}${getResourceUrl(b)}${c}`
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
  */

  // Stub localStorage
  Object.defineProperty(win, "isLocalStorage", {
    value: true,
  });

  const storage = {};
  const localStorageStub = {
    getItem: function (key) {
      if (key.endsWith("-config")) {
        return JSON.stringify(localStorageSettings);
      }
      return storage[key];
    },
    setItem: function (key, val) {
      console.log("set localStorage", key, value);
      storage[key] = val;
    },
    removeItem: function (key) {
      delete storage[key];
    },
  };

  Object.defineProperty(win, "localStorage", {
    value: localStorageStub,
  });

  // Don't load additional resources
  Object.defineProperty(win, "mxLoadResources", {
    value: false,
  });

  Object.defineProperty(win, "mxLoadStylesheets", {
    value: true,
  });

  // Stub cookies
  Object.defineProperty(doc, "cookie", { value: "" });

  // Set parent as opener
  Object.defineProperty(win, "opener", {
    value: win.parent,
  });

  function patchApplication() {
    // Intercept XHR requests
    patch(
      mxUtils,
      "get",
      (fn) =>
        function (url, ...args) {
          url = getResourceUrl(url);
          return fn.call(this, url, ...args);
        }
    );

    // Intercept URL converter
    patch(
      mxUrlConverter.prototype,
      "convert",
      (fn) =>
        function (url) {
          url = getResourceUrl(url);
          return url;
        }
    );

    // Remove the "more shapes" sidebar footer
    patch(
      EditorUi.prototype,
      "createSidebarFooterContainer",
      (fn) =>
        function () {
          return doc.createElement("span");
        }
    );

    // Ignore save and exit buttons that would be added
    patch(EditorUi.prototype, "addEmbedButtons", (fn) => function () {});

    function setupMinUi(instance) {
      // Hide the button bar with "save and exit" buttons
      instance.buttonContainer.parentElement.style.display = "none";

      // Reposition the format pane
      instance.formatWindow.window.div.style.top = "10px";

      // Collapse format panel
      instance.toggleFormatPanel(false);
    }

    // Get a reference to the application instance
    const AppConstructor = win.App;
    win.App = new Proxy(AppConstructor, {
      construct(target, args) {
        const editorInstance = args[0];
        const instance = Reflect.construct(target, args);

        setupMinUi(instance);

        // Hide "page" so we have an expansive diagram
        instance.setPageVisible(false);

        // Attach an event listener to graph change events to keep the data in sync
        editorInstance.graph.model.addListener(mxEvent.CHANGE, () =>
          handleGraphChange(instance, editorInstance)
        );

        return instance;
      },
    });

    // Handle graph change events - get the SVG with the mx graph data embedded and send to the parent window
    function handleGraphChange(app, editor) {
      const graphXml = app.editor.getGraphXml();
      const xml = mxUtils.getXml(graphXml);
      const background = mxConstants.NONE;
      const scale = 1;
      const border = 0;

      const svg = app.editor.graph.getSvg(
        background,
        scale,
        border,
        null,
        null,
        null,
        null,
        null,
        null,
        false,
        null,
        false
      ); // keep theme

      // Embed the mxGraph into the SVG
      svg.setAttribute("content", xml);

      // Add font CSS to SVG
      console.log("FontCss", app.editor.fontCss);
      const svgDoc = svg.ownerDocument;
      const style = svgDoc.createElementNS(mxConstants.NS_SVG, "style");
      style.setAttribute("type", "text/css");
      style.appendChild(svgDoc.createTextNode(app.editor.fontCss));
      console.log(style);
      svg.insertBefore(style, svg.firstChild);

      // Add margin to SVG
      const margin = 10;
      const viewBox = svg.getAttribute("viewBox");
      const [a, b, c, d] = viewBox.split(" ").map((x) => Number.parseFloat(x));
      svg.setAttribute(
        "viewBox",
        [a - margin, b - margin, c + margin * 2, d + margin * 2].join(" ")
      );

      const fileData = new XMLSerializer().serializeToString(svg);

      // Send the SVG data to the parent window
      win.parent.postMessage(
        JSON.stringify({
          event: "filedata",
          fileData,
        }),
        "*"
      );
    }
  }

  win.addEventListener("message", (messageEvent) => {
    const messageData = JSON.parse(messageEvent.data);
    if (messageData.action === "host-init") {
      console.log(messageData);

      patchApplication();
      loadStylesheet("js/croppie/croppie.min.css");
      loadStylesheet("styles/grapheditor.css");
      App.main();
    }
  });

  // Tell the parent that the host script is ready
  win.parent.postMessage(
    JSON.stringify({
      event: "host-ready",
    }),
    "*"
  );
})(window, document);
