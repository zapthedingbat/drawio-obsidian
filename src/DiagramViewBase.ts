import { EditableFileView, WorkspaceLeaf } from "obsidian";
import DiagramPlugin from "./DiagramPlugin";

export default abstract class DiagramViewBase extends EditableFileView {
  protected plugin: DiagramPlugin;
  constructor(leaf: WorkspaceLeaf, plugin: DiagramPlugin) {
    super(leaf);
    this.plugin = plugin;
  }
}
