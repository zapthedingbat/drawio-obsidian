import { LoadProgress, Modal, TFile, ViewState, WorkspaceLeaf } from "obsidian";
import DiagramPlugin from "./DiagramPlugin";
import DiagramViewBase from "./DiagramViewBase";
import { DIAGRAM_EDIT_VIEW_TYPE, DIAGRAM_VIEW_TYPE } from "./constants";
import { createLoadProgress } from "./LoadProgress";
import DrawioClient, {
  FileChangeEvent,
  StateChangeEvent,
} from "./DrawioClient";
import DiagramView from "./DiagramView";

const FILE_EXTENSIONS = ["svg"];

export class DiagramEditView extends DiagramViewBase {
  protected loadProgress: LoadProgress;
  protected drawioClient: DrawioClient;

  constructor(leaf: WorkspaceLeaf, plugin: DiagramPlugin) {
    super(leaf, plugin);
    this.app;
    this.loadProgress = createLoadProgress(this.app, this.contentEl);
  }

  private async handleFileChange(event: FileChangeEvent) {
    await this.app.vault.modify(this.file, event.data);

    // Update other views with diagram changes
    const diagramViewLeafs =
      this.app.workspace.getLeavesOfType(DIAGRAM_VIEW_TYPE);
    for (const diagramViewLeaf of diagramViewLeafs) {
      const diagramView = diagramViewLeaf.view as DiagramView;
      if (diagramView.file.path === this.file.path) {
        // Reload the file
        diagramView.onLoadFile(diagramView.file);
      }
    }
  }

  private async handleStateChange(event: StateChangeEvent) {
    if (event.initialized) {
      const config = this.plugin.getDrawioConfiguration();
      this.drawioClient.toggleBodyClassName(
        config.theme.dark ? "theme-dark" : "theme-light",
        true
      );
      this.drawioClient.addCssToFrame(this.fontCss());

      if(this.plugin.settings.cssSnippets){
        for(let i = 0; i < this.plugin.settings.cssSnippets.length; i++){
          const snippet = this.plugin.settings.cssSnippets[i];
          const tFile = this.plugin.app.metadataCache.getFirstLinkpathDest(snippet, "");
          if(tFile){
            const cssSnippetSrc =  await this.app.vault.read(tFile)
            if(cssSnippetSrc){
              this.drawioClient.addCssToFrame(cssSnippetSrc)
            }
          }
        }
      }
      this.loadProgress.hide();
    } else {
      this.loadProgress.show();
    }
  }

  private fontCss() {
    const defaultFont = window
      .getComputedStyle(document.documentElement)
      .getPropertyValue("--default-font");
    const cssRules = [
      `
:root{
  font-family: ${defaultFont};
  font-size: 14px;
}
`,
    ];
    for (const styleSheet of Array.from(document.styleSheets)) {
      for (const rule of Array.from(styleSheet.cssRules)) {
        if (rule.cssText.startsWith("@font-face")) {
          cssRules.push(rule.cssText);
        }
      }
    }
    return cssRules.join("\n");
  }

  private async setImageView() {
    await this.leaf.setViewState({
      type: DIAGRAM_VIEW_TYPE,
      state: this.getState(),
      popstate: true,
    } as ViewState);
  }

  async onRename(file: TFile) {
    await super.onRename(file);
  }

  private openRenameModal() {
    if (!this.file) return;
    const basename = this.file.basename;
    new RenameModal(this.app, basename, async (newName) => {
      if (newName && newName !== basename) {
        const newPath = this.file.path.replace(/[^/]+$/, newName + "." + this.file.extension);
        await this.app.fileManager.renameFile(this.file, newPath);
      }
    }).open();
  }

  async onLoadFile(file: TFile) {
    const data = await this.app.vault.read(file);
    (async () => {
      const success = await this.drawioClient.loadFile(data);
      if (!success) {
        this.file = null;
        this.setImageView();
      }
    })();
  }

  async onUnloadFile() {}

  canAcceptExtension(extension: string) {
    return FILE_EXTENSIONS.contains(extension);
  }

  getViewType(): string {
    return DIAGRAM_EDIT_VIEW_TYPE;
  }

  getDisplayText(): string {
    return this.file?.name || "Diagram";
  }

  async onOpen() {
    this.loadProgress.setMessage(`Loading diagram editor`);

    const configuration = this.plugin.getDrawioConfiguration();
    // NOTE: Can't await the DrawioClient frame setup because the the application would
    // deadlock waiting for the frame before it puts the frame's parent element into the DOM
    // but the DrawioClient waits for the container element to be in the DOM.
    this.drawioClient = new DrawioClient(this.contentEl, configuration);
    this.drawioClient.addEventListener(
      "stateChange",
      this.handleStateChange.bind(this)
    );
    this.drawioClient.addEventListener(
      "fileChange",
      this.handleFileChange.bind(this)
    );

    // Set the active leaf because the blur event doesn't leave the iframe so Obsidian doesn't
    // handel it automatically
    this.drawioClient.addEventListener("focusin", () =>
      this.app.workspace.setActiveLeaf(this.leaf)
    );

    const headerTitle = this.containerEl.querySelector(".view-header-title") as HTMLElement;
    if (headerTitle) {
      this.registerDomEvent(headerTitle, "click", () => this.openRenameModal());
      headerTitle.style.cursor = "pointer";
    }

    this.registerEvent(this.app.vault.on("rename", (file: TFile, oldPath: string) => {
      if (this.file && this.file.path === file.path) {
        const titleEl = this.containerEl.querySelector(".view-header-title") as HTMLElement;
        if (titleEl) titleEl.textContent = file.name;
        (this.leaf as any).updateHeader?.();
      }
    }));
  }

  async onClose() {
    if (this.drawioClient) {
      this.drawioClient.destroy();
    }
    this.drawioClient = null;
  }

  async onload() {
    this.addAction("image-file", "Preview", () => {
      this.setImageView();
    });

    this.contentEl.style.margin = "0";
    this.contentEl.style.padding = "0";
    this.contentEl.style.position = "relative";
  }
}

class RenameModal extends Modal {
  private cur: string;
  private cb: (newName: string | null) => void;

  constructor(app: any, cur: string, cb: (newName: string | null) => void) {
    super(app);
    this.cur = cur;
    this.cb = cb;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.createEl("h3", { text: "Rename diagram" });
    const inp = contentEl.createEl("input", { type: "text" } as any);
    inp.value = this.cur;
    inp.style.width = "100%";
    inp.select();
    inp.addEventListener("keydown", (ev: KeyboardEvent) => {
      if (ev.key === "Enter") {
        this.cb(inp.value.trim() || null);
        this.close();
      }
      if (ev.key === "Escape") {
        this.cb(null);
        this.close();
      }
    });
    const row = contentEl.createDiv({ cls: "modal-button-container" });
    row.createEl("button", { text: "Rename", cls: "mod-cta" }).addEventListener("click", () => {
      this.cb(inp.value.trim() || null);
      this.close();
    });
    row.createEl("button", { text: "Cancel" }).addEventListener("click", () => {
      this.cb(null);
      this.close();
    });
  }

  onClose() {
    this.contentEl.empty();
  }
}
