declare module "drawio" {
  import { mxWindow } from "mxgraph";
  global {
    class App extends EditorUi {
      editor: Editor;
      menubar: any;
      menubarContainer: HTMLElement;
      ui: string;
      statusContainer: HTMLElement;
      formatWindow: { window: mxWindow };
      addListener(
        eventName: string,
        listener: EventListenerOrEventListenerObject
      ): void;
      getCurrentFile(): DrawioFile;
      toggleFormatPanel(visible: boolean): void;
      setPageVisible(visible: boolean): void;
      getBaseFilename(): string;
      static MODE_EMBED: string;
      static main(callback?: (app: App) => void, createUi?: () => void): void;
      static initMinimalTheme(): void;
      static initTheme(): void;
    }

    class Draw {
      static loadPlugin(plugin: (app: App) => void): void;
    }

    abstract class BaseFormatPanel {
      constructor(format: any, editorUi: any, container: any);
      createPanel: () => HTMLDivElement;
      createTitle: (titleText: string) => HTMLDivElement;
    }

    class Editor {
      constructor(chromeless: boolean, themes: any[]);
      fontCss: string;
      graph: Graph;
      addListener(
        eventName: string,
        listener: EventListenerOrEventListenerObject
      ): void;
      readGraphState: (a: any) => void;
      getGraphXml(): XMLDocument;
    }

    class EditorUi {
      protected emptyDiagramXml: string;
      mode: string;
      editor: Editor;
      buttonContainer: HTMLElement;
      toolbarContainer: HTMLElement;
      static initMinimalTheme(): void;
      static initTheme(): void;
      constructor(editor: Editor, container: HTMLElement, lightbox: any);
      addEmbedButtons(): void;
      init(): void;
      installShapePicker(): boolean;
      showShapePicker(
        x: number,
        y: number,
        source: any,
        callback: any,
        direction: any
      ): void;
      getCellsForShapePicker(cell: any): any;
      hideShapePicker(cancel: any): any;
      onKeyDown(evt: any): any;
      onKeyPress(evt: any): any;
      isImmediateEditingEvent(evt: any): boolean;
      installMessageHandler(callback: (xml: string) => any): void;
      setGraphEnabled(enabled: boolean): void;
      updateUi(): void;
      setFileData(xml: string): void;
    }

    class Actions {
      constructor(ui: any);
    }

    class Menus {
      defaultMenuItems: any;
      constructor(ui: any);
      createMenubar(container: HTMLDivElement): any;
    }

    class Menubar {
      addMenu(
        label: string,
        funct: (...args: any[]) => any,
        before: Node
      ): HTMLElement;
    }

    class EmbedFile {
      constructor(ui: EditorUi, data: string, desc: object);
    }

    class Sidebar {
      constructor(ui: EditorUi | any, container: HTMLDivElement);
      createTitle: (label: string) => HTMLElement;
      createSection: (title: string) => () => HTMLElement;
      createItem: (cells: any[]) => HTMLElement;
      createThumb: (
        cells: any[],
        width: number,
        height: number,
        parent: HTMLElement
      ) => any;
    }

    class Format {
      constructor(ui: EditorUi | any, container: HTMLDivElement);
      panels: any[];
      editorUi: EditorUi;
      container: HTMLElement;
      immediateRefresh(): void;
      getSelectionState(): void;
      clear(): void;
    }

    class Toolbar {
      container: any;
      constructor(ui: EditorUi | any, container: HTMLDivElement);
    }

    class Graph {
      model: any;
      defaultVertexStyle: any;
      defaultEdgeStyle: any;
      addListener(
        eventName: string,
        listener: EventListenerOrEventListenerObject
      ): void;
      getView(): any;
      getGraphBounds(): { height: number; width: number };
      setEnabled(enabled: boolean): void;
      getCustomFonts(): { name: string; url: string }[];
      getSvg(
        background: string,
        scale: number,
        border: number,
        nocrop: boolean,
        crisp: boolean,
        ignoreSelection: boolean,
        showText: boolean,
        imgExport: mxImageExport | null,
        linkTarget: string,
        hasShadow: boolean,
        incExtFonts: null,
        keepTheme: null,
        exportType: "page" | "diagram",
        cells: any[] | null
      ): SVGElement;
      isSelectionEmpty(): boolean;
      isEditing(): boolean;
    }

    class DrawioFile {
      filename: string;
      format: string;
    }

    class LocalFile extends DrawioFile {
      constructor(
        ui: EditorUi,
        data: string,
        title: string,
        temp: boolean,
        fileHandle?: any,
        desc?: any
      );
    }

    class TextFormatPanel extends BaseFormatPanel {}
    class StyleFormatPanel extends BaseFormatPanel {}
  }

  export type UiThemes = "kennedy" | "min" | "atlas" | "dark" | "sketch";
  export type UrlParamsFlag = "0" | "1";

  //https://www.diagrams.net/doc/faq/supported-url-parameters
  //https://www.diagrams.net/doc/faq/embed-mode
  export type UrlParams = {
    embed: "1";
    proto: "json";
    /** Sends the configure event and waits for the configure action. */
    configure: "1" | "0";
    /** Uses the Minimal, Atlas, Dark or Sketch UI theme (default is Kennedy). Note sketch=1 must also be set for the Sketch UI theme*/
    ui: UiThemes;
    /** Disables/enables dark mode in sketch and minimal theme. */
    dark: UrlParamsFlag;
    /** Disables/enables sketch style */
    rough: "0" | "1";
    /** Undocumented but seems to enable the Sketch UI theme */
    sketch: "0" | "1";
    saveAndExit: "0";
    noSaveBtn: "1";
    noExitBtn: "1";
    /** Disables all features that require external web services (such as PDF export). */
    stealth: "1";
    pages: "0";
    /** Sets the default pageVisible to false. */
    pv: "0";
    noFileMenu: "1";
  };
}
