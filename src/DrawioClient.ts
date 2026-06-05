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
import { Notice } from "obsidian";

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
  isInitialized: boolean;
  gotIframeMsg: boolean;

  constructor(contentEl: HTMLElement, settings: DiagramPluginSettings) {
    this.iframeElement = null;
    this.contentEl = contentEl;
    this.settings = settings;
    this.file = null;
    this.isInitialized = false;
    this.gotIframeMsg = false;

    // Create the iframe to contain drawio
    this.iframeElement = this.createFrameElement();

    // Start handling message communication between frames
    this.frameMessenger = new FrameMessenger(
      () => this.iframeElement.contentWindow,
      this.handleMessage.bind(this)
    );

    // Add elements into DOM
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

  private createFrameElement(): HTMLIFrameElement {
    // Bootstrap script listens for a message containing
    // the first script to inject into the iframe
    // Delivered via iframe.srcdoc (not a data: URL) so the frame inherits the
    // parent origin. On iOS/iPadOS (Capacitor WKWebView) a data: URL frame has
    // an opaque/null origin, which blocks dynamic <script> injection and the
    // parent<->child postMessage handshake, leaving the editor blank. srcdoc is
    // same-origin with the host, so injection + messaging work on mobile too.
    const bootstrapHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=yes">
  <style>
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      touch-action: manipulation;
    }
  </style>
</head>
<body>
<script>
window.__bootRan = true;
window.__bootErr = [];
window.addEventListener("error", function(e){ try{ window.__bootErr.push("err:" + (e.message || "?") + "@" + (e.filename || "?") + ":" + (e.lineno || 0)); }catch(_){} });
window.addEventListener("securitypolicyviolation", function(e){ try{ window.__bootErr.push("csp:" + e.violatedDirective + "|" + String(e.blockedURI || "").slice(0,48)); }catch(_){} });
const onWindowMessage = (messageEvent) => {
  const message = JSON.parse(messageEvent.data);
  if(message.action==="script"){
    try {
      const scriptElement = document.createElement("script");
      scriptElement.text = message.script;
      document.head.appendChild(scriptElement);
    } catch(err){ if(window.__bootErr){ window.__bootErr.push("inject:" + (err && err.message)); } }
  }
  window.removeEventListener("message", onWindowMessage);
}
window.addEventListener("message",onWindowMessage);
window.parent.postMessage("{\\"event\\":\\"iframe\\"}",'*');
</script>
</body>
</html>`;

    const frame = document.createElement("iframe");
    frame.setAttribute("frameborder", "0");
    frame.setAttribute(
      "style",
      "z-index:1;display:block;height:100%;width:100%;"
    );
    frame.srcdoc = bootstrapHtml;
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
    try {
      await this.frameMessenger.waitForMessage(
        (message: DrawioInitEventMessage) => message.event === "init",
        5000
      );
    } catch (e) {
      this.reportDiagnostics();
      throw e;
    }
  }

  // Surface why the editor frame failed to initialise (mobile diagnostics).
  // srcdoc is same-origin, so the host can introspect the frame directly.
  protected reportDiagnostics() {
    const lines: string[] = [];
    try {
      const w =
        this.iframeElement && (this.iframeElement.contentWindow as any);
      const d = this.iframeElement && this.iframeElement.contentDocument;
      lines.push("gotIframeMsg=" + this.gotIframeMsg);
      if (!w) {
        lines.push("contentWindow=null(blocked)");
      } else {
        lines.push("bootRan=" + !!w.__bootRan);
        lines.push("scripts=" + (d ? d.querySelectorAll("script").length : "?"));
        lines.push("mxLoadResources=" + w.mxLoadResources);
        lines.push("mxClient=" + (typeof w.mxClient !== "undefined"));
        lines.push("app=" + (typeof w.App !== "undefined" || typeof w.Draw !== "undefined"));
        const miss = (w.__missingRes as string[]) || [];
        lines.push(miss.length ? "missing=" + miss.slice(0, 8).join("|") : "missing=none");
        const errs = (w.__bootErr as string[]) || [];
        lines.push(errs.length ? "errs=" + errs.slice(0, 6).join(" ; ") : "errs=none");
      }
    } catch (e) {
      lines.push("introspect-failed=" + ((e as Error) && (e as Error).message));
    }
    const msg = "drawio mobile diag [b6]: " + lines.join(", ");
    console.error(msg);
    new Notice(msg, 0);
  }

  protected handleMessage(message: EventMessage) {
    switch (message.event) {
      case EventMessageEvents.Iframe:
        // This is the bootstrap message that comes from
        // the iframe once it has been put into the DOM
        this.gotIframeMsg = true;
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
