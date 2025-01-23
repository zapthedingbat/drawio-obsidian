import diagramIconSvgContent from "inline!./src/assets/diagram-icon.svg";
import newDiagramIconSvgContent from "inline!./src/assets/new-diagram-icon.svg";
import {
  EMPTY_DIAGRAM_SVG,
  DIAGRAM_EDIT_VIEW_TYPE,
  DIAGRAM_VIEW_TYPE,
} from "./constants";
import { DiagramEditView } from "./DiagramEditView";
import {
  addIcon,
  App,
  Editor,
  FileExplorerView,
  MarkdownView,
  Menu,
  MenuItem,
  Plugin,
  PluginManifest,
  PluginRegistration,
  TAbstractFile,
  TFile,
  TFolder,
  WorkspaceLeaf,
} from "obsidian";
import DiagramView from "./DiagramView";
import {
  DiagramPluginSettings,
  DEFAULT_SETTINGS,
} from "./DiagramPluginSettings";
import DiagramSettingsTab from "./DiagramSettingsTab";
import DiagramViewBase from "./DiagramViewBase";
import { WelcomeModal } from "./WelcomeModal";

export default class DiagramPlugin extends Plugin {
  public settings: DiagramPluginSettings;
  private isFileExplorerButtonPresent: boolean;

  constructor(app: App, manifest: PluginManifest) {
    super(app, manifest);
    this.isFileExplorerButtonPresent = false;
  }

  private registerViewFactory(
    View: new (leaf: WorkspaceLeaf, plugin: DiagramPlugin) => DiagramViewBase,
    viewType: string
  ) {
    this.registerView(viewType, (leaf) => new View(leaf, this));
  }

  // Set the ordering of a menu item
  private moveMenuItem(menu: Menu, item: MenuItem, toIndex: number) {
    const itemAny = item as any;
    const items = menu.items;
    const fromIndex = items.findIndex((x) => itemAny === x);
    const menuDom = menu.dom;

    items.splice(fromIndex, 1);
    items.splice(toIndex, 0, item);

    // Fix for #99
    // items.forEach((menuItem) => {
      // menuDom.appendChild(menuItem.dom);
    // });
  }

  async onload() {
    await this.loadSettings();
    addIcon("diagram", diagramIconSvgContent);
    addIcon("create-new-diagram", newDiagramIconSvgContent);
    this.registerViewFactory(DiagramView, DIAGRAM_VIEW_TYPE);
    this.registerViewFactory(DiagramEditView, DIAGRAM_EDIT_VIEW_TYPE);
    this.registerExtensionsReplace(["svg"], DIAGRAM_VIEW_TYPE);
    this.registerExtensionsReplace(["drawio"], DIAGRAM_EDIT_VIEW_TYPE);
    this.registerEvents();
    this.registerCommands();
    this.addSettingTab(new DiagramSettingsTab(this.app, this));
    this.tryAddFileExplorerButton();
    // Show the welcome modal the first time the plugin is run
    if (this.settings.welcomeComplete !== true) {
      const welcome = new WelcomeModal(this.app, this);
      welcome.open();
    }
  }

  // Register a file extension that might already be registered
  private registerExtensionsReplace(extensions: string[], viewType: string) {
    /*
    The viewRegistry manages dictionaries of file extensions and view types.
    There's no stack, so if we replace one we should put the old one back
    */
    for (const extension of extensions) {
      const prev = this.app.viewRegistry.typeByExtension[extension];
      this.app.viewRegistry.typeByExtension[extension] = viewType;
      // Put back the previous registration
      this.register(() => {
        this.app.viewRegistry.typeByExtension[extension] = prev;
      });
    }
    this.app.viewRegistry.trigger("extensions-updated");
  }

  private registerEvents() {
    this.registerEvent(
      this.app.internalPlugins.on(
        "change",
        this.handleInternalPluginsChange,
        this
      )
    );
    this.registerEvent(
      this.app.workspace.on("file-menu", this.handleFileMenu, this)
    );
    this.registerEvent(
      this.app.workspace.on("editor-menu", this.handleEditorMenu, this)
    );
    this.registerEvent(
      this.app.workspace.on("layout-change", this.handleLayoutChange, this)
    );
  }

  private registerCommands() {
    this.addCommand({
      id: "create-new-diagram",
      name: "Create a new diagram",
      callback: () => {
        this.editNewDiagramFile()
      }
    });
  }

  private tryAddFileExplorerButton() {
    if (
      this.isFileExplorerButtonPresent ||
      !this.app.internalPlugins.plugins["file-explorer"].enabled
    ) {
      return;
    }

    const fileExplorerLeaf =
      this.app.workspace.getLeavesOfType("file-explorer")[0];
    if (fileExplorerLeaf && "headerDom" in fileExplorerLeaf.view) {
      const fileExplorerView = fileExplorerLeaf.view as FileExplorerView;
      const buttonElement = fileExplorerView.headerDom.addNavButton(
        "diagram",
        "New diagram",
        this.editNewDiagramFile.bind(this)
      );
      const parentElement: Element = buttonElement.parentElement;
      parentElement.insertBefore(
        buttonElement,
        parentElement.childNodes[1] || parentElement.firstChild
      );
      // Remove the button if the plugin is unloaded
      this.register(() => {
        parentElement.removeChild(buttonElement);
      });
      this.isFileExplorerButtonPresent = true;
    }
  }

  private handleLayoutChange() {
    this.tryAddFileExplorerButton();
  }

  private handleInternalPluginsChange(plugin: PluginRegistration) {
    if (plugin.instance.id === "file-explorer") {
      if (plugin.enabled) {
        this.tryAddFileExplorerButton();
      } else {
        this.isFileExplorerButtonPresent = false;
      }
    }
  }

  private handleEditorMenu(menu: Menu, editor: Editor, view: MarkdownView) {
    // TODO: handle the case that this is a right-click on an existing link
    menu.addItem((item: MenuItem) => {
      item
        .setTitle("Insert new diagram")
        .setIcon("create-new-diagram")
        .onClick(async () => {
          const file = await this.createNewDiagramFile(view.file.parent);
          editor.replaceSelection(`![[${file.path}]]`);
          const leaf = this.app.workspace.getLeaf(true);
          await leaf.setViewState({
            type: DIAGRAM_EDIT_VIEW_TYPE,
            state: { file: file.path },
          });
        });
    });
  }

  private handleFileMenu(
    menu: Menu,
    abstractFile: TAbstractFile,
    source: string
  ) {
    if (abstractFile instanceof TFile) {
      if (this.isDiagramFileExtension(abstractFile)) {
        // User clicked on an a diagram
        menu.addItem((item: MenuItem) => {
          this.moveMenuItem(menu, item, 0);
          item
            .setTitle("Edit diagram")
            .setIcon("diagram")
            .onClick(async () => {
              // Open the editor in a horizontal split if this is the link context menu
              const targetLeaf = this.app.workspace.getLeaf(source === "link-context-menu");
              await targetLeaf.setViewState({
                type: DIAGRAM_EDIT_VIEW_TYPE,
                state: { file: abstractFile.path },
              });
            });
        });
      }
    } else if (abstractFile instanceof TFolder) {
      // User clicked on a folder
      menu.addItem((item: MenuItem) => {
        this.moveMenuItem(menu, item, 1);
        item
          .setTitle("New diagram")
          .setIcon("create-new-diagram")
          .onClick(async () => {
            const file = await this.createNewDiagramFile(abstractFile);
            const leaf = this.app.workspace.getLeaf(false);
            await leaf.setViewState({
              type: DIAGRAM_EDIT_VIEW_TYPE,
              state: { file: file.path },
            });
          });
      });
    }
  }

  public getDrawioConfiguration(): DiagramPluginSettings {
    const configuration: DiagramPluginSettings = Object.assign(
      {},
      this.settings
    );
    if (typeof configuration.theme.dark !== "boolean") {
      configuration.theme.dark = this.isAppThemeDark();
    }
    return configuration;
  }

  private isDiagramFileExtension(file: TFile) {
    return file.extension && ["svg", "drawio"].contains(file.extension);
  }

  private async isDiagramFileFormat(file: TFile) {
    const fileData = await this.app.vault.cachedRead(file);
    const svgPattern = /(&lt;|\<)(mxfile|mxgraph)/i;
    return svgPattern.test(fileData);
  }

  private async getNewDiagramFilePath(
    folder: TFolder,
    name: string,
    extension: string
  ) {
    let filePath = `${folder.path}/${name}.${extension}`;
    let index = 0;
    while (await this.app.vault.adapter.exists(filePath)) {
      filePath = `${folder.path}/${name} ${++index}.${extension}`;
    }
    return filePath;
  }

  private async createNewDiagramFile(folder?: TFolder) {
    const activeFile = this.app.workspace.getActiveFile()
    const targetFolder = folder
      ? folder
      : activeFile.parent ? activeFile.parent :
        this.app.fileManager.getNewFileParent("");
    const newFilePath = await this.getNewDiagramFilePath(
      targetFolder,
      activeFile.basename ?? "Untitled Diagram",
      "drawio.svg"
    );
    const file = await this.app.vault.create(newFilePath, EMPTY_DIAGRAM_SVG);
    return file;
  }

  private async editNewDiagramFile() {
    const file = await this.createNewDiagramFile();
    const leaf = this.app.workspace.getLeaf(false);
    await leaf.openFile(file);
  }

  isAppThemeDark(): boolean {
    return document.body.classList.contains("theme-dark");
  }

  async loadSettings() {
    const loadedSettings = await this.loadData();
    this.settings = Object.assign({}, DEFAULT_SETTINGS, loadedSettings);
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
