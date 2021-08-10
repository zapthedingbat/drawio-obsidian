declare module "drawio" {
  global {
    class App {
      editor: Editor;
      loadProgress: any;
      toggleFormatPanel(visible: boolean): void;
      setPageVisible(visible: boolean): void;
      static main(): void;
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
      readGraphState: (a: any) => void;
      getGraphXml(): XMLDocument;
    }

    class EditorUi {
      constructor(editor: Editor);
      addEmbedButtons: () => void;
    }

    class Sidebar {
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
      immediateRefresh: () => void;
    }

    class TextFormatPanel extends BaseFormatPanel {}
    class StyleFormatPanel extends BaseFormatPanel {}
  }

  export class CustomDiagramFormatPanel extends BaseFormatPanel {}

  export class DiagramFormatPanel extends BaseFormatPanel {
    static showPageView: boolean;
    showBackgroundImageOption: boolean;
    init: () => void;
  }

  export class Graph {
    model: any;
    getView(): any;
    getGraphBounds(): { height: number; width: number };
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
  }

  export type UiThemes = "kennedy" | "min" | "atlas" | "dark" | "sketch";
  export type UrlParamsFlag = "0" | "1";

  //https://www.diagrams.net/doc/faq/supported-url-parameters
  //https://www.diagrams.net/doc/faq/embed-mode
  export type UrlParams = {
    embed: "1";
    proto: "json";
    /** Sends the configure event and waits for the configure action. */
    configure: "1";
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
  };

  export type Configuration = {};
}
