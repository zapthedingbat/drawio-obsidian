import { TFile, ViewState, WorkspaceLeaf } from "obsidian";
import { DIAGRAM_EDIT_VIEW_TYPE, DIAGRAM_VIEW_TYPE } from "./constants";
import DiagramPlugin from "./DiagramPlugin";
import DiagramViewBase from "./DiagramViewBase";

const FILE_EXTENSIONS = ["svg"];

export default class DiagramView extends DiagramViewBase {
  constructor(leaf: WorkspaceLeaf, plugin: DiagramPlugin) {
    super(leaf, plugin);
  }

  async onload() {
    console.log("image view onload");
    super.onload();
    this.addAction("pencil", "Edit", () => {
      this.setEditView();
    });
  }

  async setEditView() {
    await this.leaf.setViewState({
      type: DIAGRAM_EDIT_VIEW_TYPE,
      state: this.getState(),
      popstate: true,
    } as ViewState);
  }

  async onLoadFile(file: TFile) {
    const fileData = await this.app.vault.read(file);
    const template = document.createElement("template");
    template.innerHTML = fileData;
    this.contentEl.appendChild(template.content);
  }

  async onUnloadFile(file: TFile) {
    this.contentEl.empty();
  }

  canAcceptExtension(extension: string) {
    return FILE_EXTENSIONS.contains(extension);
  }

  getViewType(): string {
    return DIAGRAM_VIEW_TYPE;
  }
}
