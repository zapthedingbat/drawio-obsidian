import { EditableFileView, Menu, WorkspaceLeaf } from "obsidian";
import DiagramPlugin from "./DiagramPlugin";

export default abstract class DiagramViewBase extends EditableFileView {
  protected plugin: DiagramPlugin;
  constructor(leaf: WorkspaceLeaf, plugin: DiagramPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  onMoreOptionsMenu(menu: Menu) {
    super.onPaneMenu(menu, 'more-options');
    menu.addItem((item) => {
      item.onClick((evt: MouseEvent) => {
        this.saveAsPng();
      });
      item.setIcon("image-file");
      item.setTitle("Export as png");
    });
  }

  private readBlob(blob: Blob): Promise<string> {
    const fileReader = new FileReader();
    return new Promise((resolve) => {
      fileReader.onload = (progresEvent) => {
        resolve(progresEvent.target.result as string);
      };
      fileReader.readAsDataURL(blob);
    });
  }

  private loadImage(src: string): Promise<HTMLImageElement> {
    const img = new Image();
    return new Promise((resolve) => {
      img.onload = () => resolve(img);
      img.src = src;
    });
  }

  protected async saveAsPng() {
    const fileData = await this.app.vault.read(this.file);

    // Draw the SVG into the canvas
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const svgBlob = new Blob([fileData], { type: "image/svg+xml" });
    const dataUrl = await this.readBlob(svgBlob);
    const img = await this.loadImage(dataUrl);
    // TODO: Maybe make the output resolution an option?
    canvas.height = img.naturalHeight;
    canvas.width = img.naturalWidth;
    // TODO: Make the background color an option?
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    const pngDataUrl = canvas.toDataURL("image/png");

    // Click a link with the download attribute to invoke the download dialog
    const link = document.createElement("a");
    link.setAttribute("href", pngDataUrl);
    link.setAttribute("download", this.file.basename + ".png");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
