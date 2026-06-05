import {
  ActionMessage,
  ActionMessageActions,
  EventMessageEvents,
  FrameConfigActionMessage,
} from "../../Messages";
import { FrameMessenger } from "../../FrameMessenger";
import { loadScript } from "./RequestManager";
import { ConfigurationManager } from "./ConfigurationManager";

export class Frame {
  window: Window;
  frameMessenger: FrameMessenger;
  urlParams: Object;
  configurationManager: ConfigurationManager;

  public static main(
    window: Window,
    configurationManager: ConfigurationManager
  ) {
    return new Frame(window, configurationManager);
  }

  private constructor(
    window: Window,
    configurationManager: ConfigurationManager
  ) {
    this.window = window;
    this.frameMessenger = new FrameMessenger(
      () => this.window.parent,
      this.handleMessages.bind(this)
    );
    this.configurationManager = configurationManager;

    // Capture async errors with detail. iOS WKWebView reports errors thrown in
    // async callbacks of a srcdoc frame as an opaque "Script error." via
    // window.onerror. Wrapping the async entry points (this runs in init, before
    // drawio loads) lets a same-origin try/catch see the real Error for the
    // mobile diagnostics.
    const anyWin = window as any;
    const reportAsync = function (e: any) {
      try {
        anyWin.__bootErr = anyWin.__bootErr || [];
        anyWin.__bootErr.push(
          "async:" +
            ((e && e.message) || e) +
            " @ " +
            ((e && e.stack) || "").split("\n").slice(1, 3).join(" <- ")
        );
      } catch (_) {}
    };
    const wrapAsync = function (orig: any) {
      return function (cb: any) {
        if (typeof cb === "function") {
          const rest = Array.prototype.slice.call(arguments, 1);
          const wrapped = function () {
            try {
              return cb.apply(this, arguments);
            } catch (e) {
              reportAsync(e);
              throw e;
            }
          };
          return orig.apply(this, [wrapped].concat(rest));
        }
        return orig.apply(this, arguments);
      };
    };
    try {
      window.setTimeout = wrapAsync(window.setTimeout);
    } catch (_) {}
    try {
      window.requestAnimationFrame = wrapAsync(window.requestAnimationFrame);
    } catch (_) {}
    try {
      window.addEventListener("unhandledrejection", function (ev: any) {
        reportAsync(ev && ev.reason);
      });
    } catch (_) {}
    // drawio often logs its own errors via console.error even when window.onerror
    // is opaque on iOS - capture those (they carry the real message/stack).
    try {
      const origConsoleErr =
        (window.console && window.console.error) || function () {};
      window.console.error = function () {
        try {
          const parts = Array.prototype.map.call(arguments, function (a: any) {
            return a && a.message
              ? a.message + " " + ((a.stack || "").split("\n")[1] || "")
              : String(a);
          });
          anyWin.__bootErr = anyWin.__bootErr || [];
          anyWin.__bootErr.push("cerr:" + parts.join(" ").slice(0, 200));
        } catch (_) {}
        return origConsoleErr.apply(this, arguments);
      };
    } catch (_) {}
    // Wrap event-listener callbacks (App.main can run on the window 'load'
    // event, which setTimeout/rAF wrapping does not cover).
    try {
      const origAddEventListener = window.addEventListener;
      (window as any).addEventListener = function (
        type: any,
        listener: any,
        opts: any
      ) {
        if (typeof listener === "function") {
          const wrappedListener = function () {
            try {
              return listener.apply(this, arguments);
            } catch (e) {
              reportAsync(e);
              throw e;
            }
          };
          return origAddEventListener.call(this, type, wrappedListener, opts);
        }
        return origAddEventListener.apply(this, arguments);
      };
    } catch (_) {}

    // Stub out the cookie that drawio tries to read. On a data: url document
    // (opaque origin) reading cookie throws, so it needs a stub. On a srcdoc
    // frame (same-origin, used on mobile) document.cookie is a non-configurable
    // native accessor and redefining it throws - there the native cookie is fine.
    try {
      Object.defineProperty(document, "cookie", { value: "", configurable: true });
    } catch (e) {
      // Same-origin srcdoc/mobile: keep the native document.cookie.
    }

    // Don't make requests for resources, use inline defaults.
    Object.defineProperty(window, "mxLoadResources", { value: false });

    // Set the script loading function in the global scope
    Object.defineProperty(window, "mxscript", {
      value: loadScript,
    });

    // Disable use of local storage
    Object.defineProperty(window, "isLocalStorage", {
      value: false,
    });

    try {
      Object.defineProperty(window, "localStorage", {
        configurable: true,
        value: {
          getItem: function (key: string) {
            console.warn("Disabled localStorage getItem", key);
          },
          setItem: function (key: string, value: any) {
            console.warn("Disabled localStorage setItem", key, value);
          },
          removeItem: function (key: string) {
            console.warn("Disabled localStorage removeItem", key);
          },
        },
      });
    } catch (e) {
      // Same-origin srcdoc/mobile: window.localStorage is non-configurable and
      // cannot be replaced; isLocalStorage=false already disables its use.
    }

    window.addEventListener("focus", () => {
      this.frameMessenger.sendMessage({
        event: EventMessageEvents.FocusIn,
      });
    });

    window.addEventListener("blur", () => {
      this.frameMessenger.sendMessage({
        event: EventMessageEvents.FocusOut,
      });
    });
  }

  public addScript(scriptSource: string) {
    const scriptElement = document.createElement("script");
    scriptElement.text = scriptSource;
    try {
      // Inline scripts execute synchronously on append, so a top-level throw
      // surfaces here with full detail (window.onerror masks it as "Script
      // error." on iOS). Capture it for the mobile diagnostics.
      document.head.appendChild(scriptElement);
    } catch (e) {
      try {
        const err = e as any;
        const anyWin = window as any;
        anyWin.__bootErr = anyWin.__bootErr || [];
        anyWin.__bootErr.push(
          "addScript:" +
            ((err && err.message) || err) +
            " @ " +
            (((err && err.stack) || "").split("\n")[1] || "").trim()
        );
      } catch (_) {}
      throw e;
    }
  }

  addCss(cssSource: string) {
    const styleElement = document.createElement("style");
    styleElement.textContent = cssSource;
    document.head.appendChild(styleElement);
  }

  addStylesheet(href: string) {
    const linkElement = document.createElement("link");
    linkElement.rel = "stylesheet";
    linkElement.href = href;
    document.head.appendChild(linkElement);
  }

  toggleBodyClassName(className: string, force: boolean) {
    document.body.classList.toggle(className, force);
  }

  handleFrameConfigMessage(message: FrameConfigActionMessage) {
    const settings = message.settings;
    this.configurationManager.setConfig(settings);
  }

  handleMessages(message: ActionMessage) {
    if ("action" in message) {
      switch (message.action) {
        case ActionMessageActions.Script:
          this.addScript(message.script);
          break;
        case ActionMessageActions.Stylesheet:
          this.addStylesheet(message.stylesheet);
          break;
        case ActionMessageActions.Css:
          this.addCss(message.css);
          break;
        case ActionMessageActions.ToggleBodyClass:
          this.toggleBodyClassName(message.className, message.force);
          break;
        case ActionMessageActions.FrameConfig:
          this.handleFrameConfigMessage(message);
          break;
      }
    }
  }
}
