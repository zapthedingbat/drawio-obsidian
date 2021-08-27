import {
  ActionMessage,
  ActionMessageActions,
  FrameConfigActionMessage,
} from "../../Messages";
import { FrameMessenger } from "../../FrameMessenger";
import { loadScript } from "./RequestManager";
import { UrlParamManager } from "./UrlParamManager";

export class Frame {
  window: Window;
  frameMessenger: FrameMessenger;
  urlParams: Object;
  urlParamManager: UrlParamManager;

  public static main(window: Window, urlParamManager: UrlParamManager) {
    return new Frame(window, urlParamManager);
  }

  private constructor(window: Window, urlParamManager: UrlParamManager) {
    this.window = window;
    this.frameMessenger = new FrameMessenger(
      () => this.window.parent,
      this.handleMessages.bind(this)
    );
    this.urlParamManager = urlParamManager;

    // Stub out the cookie that drawio tries to read - this would throw an error because
    // cookies aren't available in the page loaded from a data: url
    Object.defineProperty(document, "cookie", { value: "" });

    // Don't make requests for resources, use inline defaults.
    Object.defineProperty(window, "mxLoadResources", { value: false });

    // Set the script loading function in the global scope
    Object.defineProperty(window, "mxscript", {
      value: loadScript,
    });
  }

  public addScript(scriptSource: string) {
    const scriptElement = document.createElement("script");
    scriptElement.text = scriptSource;
    document.head.appendChild(scriptElement);
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
    this.urlParamManager.setValues(settings);
    // this.frameMessenger.sendMessage({
    //   event: EventMessageEvents.FrameConfigSet,
    // });
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
