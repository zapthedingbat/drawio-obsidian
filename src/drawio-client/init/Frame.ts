import {
  ActionMessage,
  ActionMessageActions,
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

    // Stub out the cookie that drawio tries to read - this would throw an error because
    // cookies aren't available in the page loaded from a data: url
    Object.defineProperty(document, "cookie", { value: "" });

    // Don't make requests for resources, use inline defaults.
    Object.defineProperty(window, "mxLoadResources", { value: true });

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
