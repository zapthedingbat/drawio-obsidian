import FRAME_INIT_SOURCE from "bundle!src/drawio-client/init/index.ts";
import FRAME_DRAWIO_SOURCE from "inline!drawio/src/main/webapp/js/app.min.js";
import FRAME_APP_SOURCE from "bundle!src/drawio-client/app/index.ts";
import {
  ActionMessageActions,
  DrawioInitEventMessage,
  DrawioLoadEventMessage,
  EventMessage,
  EventMessageEvents,
} from "./Messages";
import { FrameMessenger } from "./FrameMessenger";
import { DiagramPluginSettings } from "./DiagramPluginSettings";

export class FileChangeEvent extends Event {
  public readonly data: string;
  constructor(data: string) {
    super("fileChange");
    this.data = data;
  }
}

export class FileLoadEvent extends Event {
  public readonly data: string;
  constructor(data: string) {
    super("fileLoad");
    this.data = data;
  }
}

export class StateChangeEvent extends Event {
  public readonly initialized: boolean;
  constructor(initialized: boolean) {
    super("stateChange");
    this.initialized = initialized;
  }
}

export default class DrawioClient implements EventTarget {
  frameMessenger: FrameMessenger;
  contentEl: HTMLElement;
  settings: DiagramPluginSettings;
  file: {
    data: string;
  };
  appCss: string;
  iframeElement: HTMLIFrameElement;
  overlayElement: HTMLElement;
  isInitialized: boolean;

  constructor(contentEl: HTMLElement, settings: DiagramPluginSettings) {
    this.iframeElement = null;
    this.contentEl = contentEl;
    this.settings = settings;
    this.file = null;
    this.isInitialized = false;

    // Create the iframe to contain drawio
    this.overlayElement = this.createOverlayElement();
    this.iframeElement = this.createFrameElement();

    // Start handling message communication between frames
    this.frameMessenger = new FrameMessenger(
      () => this.iframeElement.contentWindow,
      this.handleMessage.bind(this)
    );

    // Hide overlay when it's clicked
    this.iframeElement.addEventListener("focusout", () => {
      this.overlayElement.style.visibility = "visible";
    });

    this.overlayElement.addEventListener("mousedown", () => {
      this.overlayElement.style.visibility = "hidden";
    });

    // Add elements into DOM
    this.contentEl.appendChild(this.overlayElement);
    this.contentEl.appendChild(this.iframeElement);
  }

  public destroy() {
    if (this.iframeElement) {
      if (this.iframeElement.parentElement) {
        this.iframeElement.parentElement.removeChild(this.iframeElement);
      }
      this.iframeElement = null;
    }

    if (this.frameMessenger) {
      this.frameMessenger.destroy();
    }
  }

  public async loadFile(data: string) {
    // Clear the current file;
    this.file = null;

    // Wait for any outstanding initialization stuff to complete
    if (!this.isInitialized) {
      await this.waitForInit();
    }

    // Tell drawio to load the file
    this.frameMessenger.sendMessage({
      action: ActionMessageActions.Load,
      xml: data,
    });

    // Wait for drawio to respond with a load message
    const loadMessage: DrawioLoadEventMessage =
      (await this.frameMessenger.waitForMessage(
        (message: DrawioLoadEventMessage) => message.event === "load",
        5000
      )) as DrawioLoadEventMessage;
    const success = loadMessage.xml !== "undefined";

    // If it was successful then cache the file
    // data so we can load it if the frame is reinitialized
    if (success) {
      this.file = {
        data,
      };
    }

    return success;
  }

  public addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void {
    return this.iframeElement.addEventListener.call(
      this.iframeElement,
      type,
      listener,
      options
    );
  }

  public dispatchEvent(event: Event): boolean {
    return this.iframeElement.dispatchEvent.call(this.iframeElement, event);
  }

  public removeEventListener(
    type: string,
    callback: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void {
    return this.iframeElement.removeEventListener.call(
      this.iframeElement,
      type,
      callback,
      options
    );
  }

  private createOverlayElement(): HTMLElement {
    // Add an overlay element over the iframe so that mouse events still bubble up to the root document.
    // The overlay is hidden when clicked so the iframe can still get focus, but is show again when focus leaves the iframe
    const overlayEl = document.createElement("div");
    overlayEl.className = "drawioViewOverlay";
    overlayEl.style.position = "absolute";
    overlayEl.style.top = "0";
    overlayEl.style.left = "0";
    overlayEl.style.height = "100%";
    overlayEl.style.width = "100%";
    overlayEl.style.zIndex = "2";
    overlayEl.style.opacity = "0.1";
    overlayEl.style.backgroundColor = "rgba(0,0,0,.1)";

    return overlayEl;
  }

  private createFrameElement(): HTMLIFrameElement {
    // Bootstrap script listens for a message containing
    // the first script to inject into the iframe
    const frameSrc =
      "data:text/html," +
      encodeURIComponent(`
<script>
const onWindowMessage = (messageEvent) => {
  const message = JSON.parse(messageEvent.data);
  if(message.action==="script"){
    const scriptElement = document.createElement("script");
    scriptElement.text = message.script;
    document.head.appendChild(scriptElement);
  }
  window.removeEventListener("message", onWindowMessage);
}
window.addEventListener("message",onWindowMessage);
window.parent.postMessage("{\\"event\\":\\"iframe\\"}",'*');
</script>`);

    const frame = document.createElement("iframe");
    frame.setAttribute("frameborder", "0");
    frame.setAttribute(
      "style",
      "z-index:1;display:block;height:100%;width:100%;"
    );
    frame.setAttribute("src", frameSrc);
    return frame;
  }

  public toggleBodyClassName(className: string, force: boolean) {
    this.frameMessenger.sendMessage({
      action: ActionMessageActions.ToggleBodyClass,
      className,
      force,
    });
  }

  public addScriptToFrame(scriptSource: string) {
    this.frameMessenger.sendMessage({
      action: ActionMessageActions.Script,
      script: scriptSource,
    });
  }

  public addCssToFrame(cssSource: string) {
    this.frameMessenger.sendMessage({
      action: ActionMessageActions.Css,
      css: cssSource,
    });
  }

  public addStylesheetToFrame(href: string) {
    this.frameMessenger.sendMessage({
      action: ActionMessageActions.Stylesheet,
      stylesheet: href,
    });
  }

  // Wait for drawio to send an init message
  protected async waitForInit() {
    await this.frameMessenger.waitForMessage(
      (message: DrawioInitEventMessage) => message.event === "init",
      5000
    );
  }

  protected handleMessage(message: EventMessage) {
    switch (message.event) {
      case EventMessageEvents.Iframe:
        // This is the bootstrap message that comes from
        // the iframe once it has been put into the DOM
        this.isInitialized = false;
        this.dispatchEvent(new StateChangeEvent(this.isInitialized));
        this.addScriptToFrame(FRAME_INIT_SOURCE);
        this.sendFrameConfig();
        this.addScriptToFrame(FRAME_DRAWIO_SOURCE);
        this.addScriptToFrame(FRAME_APP_SOURCE);
        break;
      case EventMessageEvents.Init:
        this.isInitialized = true;
        this.dispatchEvent(new StateChangeEvent(this.isInitialized));
        if (this.file) {
          this.loadFile(this.file.data);
        }
        break;
      case EventMessageEvents.Load:
        this.dispatchEvent(new FileLoadEvent(message.xml));
        break;
      case EventMessageEvents.Change:
        // Update the file data so it can be reloaded if the frame is reinitialized
        this.file.data = message.data;
        this.dispatchEvent(new FileChangeEvent(message.data));
        break;
      case EventMessageEvents.FocusIn:
        this.dispatchEvent(new Event("focusin"));
        break;
      case EventMessageEvents.FocusOut:
        this.dispatchEvent(new Event("focusout"));
        break;
    }
  }

  // Sends the URL params configuration that controls the drawio app
  protected sendFrameConfig() {
    this.frameMessenger.sendMessage({
      action: ActionMessageActions.FrameConfig,
      settings: this.settings,
    });
  }
}
