import diagramIconSvgContent from "inline!./src/assets/diagram.svg";
import {
  EMPTY_DIAGRAM_SVG,
  DIAGRAM_EDIT_VIEW_TYPE,
  DIAGRAM_VIEW_TYPE,
} from "./constants";
import EditDiagramView from "./DiagramEditView";
import {
  addIcon,
  App,
  Editor,
  InternalPlugins,
  MarkdownView,
  Menu,
  MenuItem,
  Plugin,
  PluginManifest,
  TAbstractFile,
  TFile,
  TFolder,
  ViewCreator,
  ViewRegistry,
  WorkspaceLeaf,
} from "obsidian";
import DiagramView from "./DiagramView";
import {
  DiagramPluginSettings,
  DEFAULT_SETTINGS,
} from "./DiagramPluginSettings";
import DiagramSettingsTab from "./DiagramSettingsTab";
import DiagramViewBase from "./DiagramViewBase";
import { getPropertyOf } from "./getPropertyOf";

const IS_PATCHED = Symbol("Diagram plugin patched applied");

export default class DiagramPlugin extends Plugin {
  public settings: DiagramPluginSettings;

  constructor(app: App, manifest: PluginManifest) {
    super(app, manifest);
  }

  private registerViewFactory(
    View: new (leaf: WorkspaceLeaf, plugin: DiagramPlugin) => DiagramViewBase,
    viewType: string
  ) {
    this.registerView(viewType, (leaf) => new View(leaf, this));
  }

  private moveMenuItem(menu: Menu, item: MenuItem, toIndex: number) {
    const itemAny = item as any;
    const items = getPropertyOf<any[]>(menu, "items");
    const fromIndex = items.findIndex((x) => itemAny === x);
    const menuDom = getPropertyOf<HTMLElement>(menu, "dom");

    items.splice(fromIndex, 1);
    items.splice(toIndex, 0, item);

    items.forEach((menuItemInDom: { dom: HTMLElement }) => {
      menuDom.appendChild(menuItemInDom.dom);
    });
  }

  async onload() {
    await this.loadSettings();
    addIcon("diagram", diagramIconSvgContent);
    this.registerViewFactory(DiagramView, DIAGRAM_VIEW_TYPE);
    this.registerViewFactory(EditDiagramView, DIAGRAM_EDIT_VIEW_TYPE);
    this.registerExtensionsReplace(["svg"], DIAGRAM_VIEW_TYPE);
    this.registerExtensionsReplace(["drawio"], DIAGRAM_EDIT_VIEW_TYPE);
    this.registerEvents();
    this.registerUiModification();
    this.addSettingTab(new DiagramSettingsTab(this.app, this));
  }

  private registerUiModification() {
    const viewRegistry = getPropertyOf<ViewRegistry>(this.app, "viewRegistry");
    const registerView = viewRegistry.registerView;

    const editNewDiagramFile = async () => {
      const file = await this.createNewDiagramFile();
      const leaf = this.app.workspace.activeLeaf;
      await leaf.setViewState({
        type: DIAGRAM_EDIT_VIEW_TYPE,
        state: { file: file.path },
      });
    };

    const register = (cb: () => any) => this.register(cb);
    viewRegistry.registerView = function (
      type: string,
      viewCreator: ViewCreator
    ) {
      // Ensure we never patch the function more than once
      if (
        type === "file-explorer" &&
        !Object.getOwnPropertySymbols(viewCreator).contains(IS_PATCHED)
      ) {
        const patchedViewCreator: ViewCreator = function (leaf) {
          const view = viewCreator(leaf) as any;
          const buttonElement = view.headerDom.addNavButton(
            "diagram",
            "New diagram",
            editNewDiagramFile
          );
          const parentElement: Element = buttonElement.parentElement;
          parentElement.insertBefore(
            buttonElement,
            parentElement.childNodes[1] || parentElement.firstChild
          );
          // Remove the button if the plugin is unloaded
          register(() => {
            parentElement.removeChild(buttonElement);
          });
          return view;
        };
        Object.defineProperty(patchedViewCreator, IS_PATCHED, {});
        const result = registerView.call(this, type, patchedViewCreator);
        return result;
      }
      return registerView.call(this, type, viewCreator);
    };

    // It's difficult to put the button back again one we've been unloaded once.
    // We would need to find a way to re-instantiate the patched file-explorer view.
    const internalPlugins = getPropertyOf<InternalPlugins>(
      this.app,
      "internalPlugins"
    );
    setTimeout(() => {
      //internalPlugins.plugins["file-explorer"].disable(true);
      internalPlugins.plugins["file-explorer"].enable(true);
    }, 100);
  }

  private registerExtensionsReplace(extensions: string[], viewType: string) {
    /*
    The viewRegistry manages dictionaries of file extensions and view types.
    There's no stack, so if we replace one we have to put the old one back
    */
    const viewRegistry = getPropertyOf<ViewRegistry>(this.app, "viewRegistry");
    for (const extension of extensions) {
      const prev = viewRegistry.typeByExtension[extension];
      viewRegistry.typeByExtension[extension] = viewType;
      // Put back the previous registration
      this.register(() => {
        viewRegistry.typeByExtension[extension] = prev;
      });
    }
    viewRegistry.trigger("extensions-updated");
  }

  private registerEvents() {
    this.registerEvent(
      this.app.workspace.on("file-menu", this.handleFileMenu, this)
    );
    this.registerEvent(
      this.app.workspace.on("editor-menu", this.handleEditorMenu, this)
    );
  }

  private async handleEditorMenu(
    menu: Menu,
    editor: Editor,
    view: MarkdownView
  ) {
    console.log("handleEditorMenu", arguments);
    menu.addItem((item: MenuItem) => {
      item
        .setTitle("Insert new diagram")
        .setIcon("create-new")
        .onClick(async () => {
          const file = await this.createNewDiagramFile(view.file.parent);
          editor.replaceSelection(`![[${file.path}]]`);
          const leaf = this.app.workspace.splitActiveLeaf("horizontal");
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
    console.log("handleFileMenu", arguments);
    if (source === "link-context-menu") {
      menu.addItem((item: MenuItem) => {
        this.moveMenuItem(menu, item, 2);
        item
          .setTitle("Edit diagram")
          .setIcon("diagram")
          .onClick(async () => {
            const leaf = this.app.workspace.splitActiveLeaf("horizontal");
            await leaf.setViewState({
              type: DIAGRAM_EDIT_VIEW_TYPE,
              state: { file: abstractFile.path },
            });
          });
      });
    } else if (abstractFile instanceof TFolder) {
      menu.addItem((item: MenuItem) => {
        this.moveMenuItem(menu, item, 2);
        item
          .setTitle("New diagram")
          .setIcon("create-new")
          .onClick(async () => {
            const file = await this.createNewDiagramFile(abstractFile);
            const leaf = this.app.workspace.activeLeaf;
            await leaf.setViewState({
              type: DIAGRAM_EDIT_VIEW_TYPE,
              state: { file: file.path },
            });
          });
      });
    }
  }

  private isDiagramFileExtension(file: TFile) {
    return file.extension && ["svg", "drawio"].includes(file.extension);
  }

  private async isDiagramFileFormat(file: TFile) {
    const fileData = await this.app.vault.cachedRead(file);
    const svgPattern = /(&lt;|\<)(mxfile|mxgraph)/i;
    if (svgPattern.test(fileData)) {
      return true;
    }
    return false;
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
    const targetFolder = folder
      ? folder
      : this.app.fileManager.getNewFileParent("");
    const newFilePath = await this.getNewDiagramFilePath(
      targetFolder,
      "Untitled Diagram",
      "svg"
    );
    const file = await this.app.vault.create(newFilePath, EMPTY_DIAGRAM_SVG);
    return file;
  }

  isAppThemeDark(): boolean {
    return document.body.classList.contains("theme-dark");
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  public async saveSettings() {
    await this.saveData(this.settings);
  }
}
