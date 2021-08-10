import { TFile, ViewState, WorkspaceLeaf } from "obsidian";
import HOST_FRAME_SOURCE from "bundle!main.js";
import { DIAGRAM_EDIT_VIEW_TYPE, DIAGRAM_VIEW_TYPE } from "./constants";
import DiagramPlugin from "./DiagramPlugin";
import DiagramViewBase from "./DiagramViewBase";
import { Configuration } from "drawio";
import { EventMessage, Message } from "./Messages";
import { createLoadProgress, LoadProgress } from "./LoadProgress";

const FILE_EXTENSIONS = ["svg", "drawio"];

export default class DiagramEditView extends DiagramViewBase {
  private frame: HTMLIFrameElement;
  private fileData: string;
  private isFrameReady: boolean;
  private isFileLoadPending: boolean;
  private loadProgress: LoadProgress;

  constructor(leaf: WorkspaceLeaf, plugin: DiagramPlugin) {
    super(leaf, plugin);
    this.app;
  }

  private async setImageView() {
    await this.leaf.setViewState({
      type: DIAGRAM_VIEW_TYPE,
      state: this.getState(),
      popstate: true,
    } as ViewState);
  }

  private addScriptToFrame(scriptSource: string) {
    const frameDoc = this.frame.contentWindow.document;
    const scriptElement = frameDoc.createElement("script");
    scriptElement.text = scriptSource;
    frameDoc.head.appendChild(scriptElement);
  }

  async onLoadFile(file: TFile) {
    this.isFileLoadPending = true;
    this.fileData = await this.app.vault.read(file);
    this.loadPendingFile();
  }

  async onUnloadFile(file: TFile) {
    this.isFileLoadPending = false;
    await this.app.vault.modify(file, this.fileData);
  }

  createFrame(): Promise<HTMLIFrameElement> {
    this.isFrameReady = false;
    return new Promise((resolve, reject) => {
      const frame = document.createElement("iframe");
      frame.setAttribute("frameborder", "0");
      frame.setAttribute("style", "display:block;height:100%;width:100%;");
      frame.addEventListener("load", async () => {
        resolve(frame);
      });
      this.contentEl.appendChild(frame);
    });
  }

  sendMessage(message: Message) {
    this.frame.contentWindow.postMessage(JSON.stringify(message), "*");
  }

  handleMessage(message: EventMessage) {
    switch (message.event) {
      case "frame-ready":
        this.sendFrameConfig();
        break;
      case "configure":
        this.sendAppConfig();
        break;
      case "init":
        this.drawioReady();
        this.loadProgress.hide();
        break;
      case "file-data":
        this.fileData = message.xml;
        this.app.vault.modify(this.file, this.fileData);
        break;
    }
  }

  drawioReady() {
    this.isFrameReady = true;
    this.loadPendingFile();
  }

  loadPendingFile() {
    if (this.isFileLoadPending && this.isFrameReady) {
      this.isFileLoadPending = false;
      this.sendMessage({
        action: "load",
        xml: this.fileData,
        title: this.getDisplayText(),
      });
    }
  }

  sendFrameConfig() {
    this.sendMessage({
      action: "frame-config",
      settings: this.plugin.settings,
      appThemeDark: this.plugin.isAppThemeDark(),
      frameFontCss: this.getFrameFontCss(),
    });
  }

  sendAppConfig() {
    this.sendMessage({
      action: "configure",
      config: this.getAppConfig(),
    });
  }

  getAppConfig(): Configuration {
    return {};
  }

  getFrameFontCss() {
    const defaultFont = window
      .getComputedStyle(document.documentElement)
      .getPropertyValue("--default-font");
    let uiFontCss = `
:root{
  --default-font: ${defaultFont};
  font-family: var(--default-font);
}
    `;

    for (const styleSheet of Array.from(document.styleSheets)) {
      for (const rule of Array.from(styleSheet.rules)) {
        if (rule.cssText.startsWith("@font-face")) {
          uiFontCss += rule.cssText + "\r\n";
        }
      }
    }

    return uiFontCss;
  }

  canAcceptExtension(extension: string) {
    return FILE_EXTENSIONS.contains(extension);
  }

  getViewType(): string {
    return DIAGRAM_EDIT_VIEW_TYPE;
  }

  async onload() {
    this.contentEl.empty();
    this.contentEl.style.margin = "0";
    this.contentEl.style.padding = "0";
    this.loadProgress = createLoadProgress(this.app, this.contentEl);
    this.loadProgress.setMessage("Loading diagram").show();

    this.addAction("image-file", "Preview", () => {
      this.setImageView();
    });

    // Create a host iframe to run drawio in
    this.frame = await this.createFrame();

    // Listen for messages from the frame
    this.registerDomEvent(window, "message", (message: any) => {
      const eventMessage = JSON.parse(message.data);
      this.handleMessage(eventMessage);
    });

    // Inject script the monkey patch bits of drawio and setup the iframe content
    this.addScriptToFrame(HOST_FRAME_SOURCE);
  }

  onunload() {
    // Cleanup the frame
    if (this.frame && this.frame.parentElement === this.contentEl) {
      this.contentEl.removeChild(this.frame);
    }
  }
}
