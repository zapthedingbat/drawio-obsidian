import { EditableFileView, Menu, Notice, Platform, WorkspaceLeaf } from "obsidian";
import DiagramPlugin from "./DiagramPlugin";

export default abstract class DiagramViewBase extends EditableFileView {
  protected plugin: DiagramPlugin;
  constructor(leaf: WorkspaceLeaf, plugin: DiagramPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  onMoreOptionsMenu(menu: Menu) {
    // fix for #99
    // super.onPaneMenu(menu, 'more-options');
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

    // On mobile, <a download> is a no-op in the WKWebView, so write the PNG
    // into the vault instead. On desktop, keep the native download dialog.
    if (Platform.isMobile) {
      try {
        // Convert the data URL to bytes for vault.createBinary()
        const base64String = pngDataUrl.split(",")[1];
        const binaryString = atob(base64String);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        // Write the PNG next to the source diagram file
        const pngFileName = this.file.basename + ".png";
        const parentPath = this.file.parent?.path || "";
        const pngPath = parentPath ? parentPath + "/" + pngFileName : pngFileName;
        // Overwrite any existing PNG at the target path
        const existingFile = this.app.vault.getAbstractFileByPath(pngPath);
        if (existingFile) {
          await this.app.vault.delete(existingFile);
        }
        await this.app.vault.createBinary(pngPath, bytes.buffer);
        new Notice("Diagram exported to " + pngPath);
      } catch (error) {
        console.error("Failed to export PNG to vault:", error);
        new Notice("Failed to export diagram as PNG");
      }
    } else {
      // Desktop: trigger the native download dialog
      const link = document.createElement("a");
      link.setAttribute("href", pngDataUrl);
      link.setAttribute("download", this.file.basename + ".png");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}
