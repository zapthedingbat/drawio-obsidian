declare module "drawio" {
  import { mxWindow } from "mxgraph";

  export interface DrawioFile {}

  export interface Graph {
    model: any;
    addListener(
      eventName: string,
      listener: EventListenerOrEventListenerObject
    ): void;
    getView(): any;
    getCustomFonts(): Array<{ name: string; url: string }>;
  }

  global {
    class Menus {
      defaultMenuItems: Array<string>;
    }
    class Editor {
      graph: Graph;
      getGraphXml(): XMLDocument;
    }
    class EditorUi {}
    class App {
      editor: Editor;
      menubarContainer: HTMLElement;
      statusContainer: HTMLElement;
      formatWindow: { window: mxWindow };
      getCurrentFile(): DrawioFile;
      toggleFormatPanel(visible: boolean): void;
      setPageVisible(visible: boolean): void;
      static main(callback?: (app: App) => void, createUi?: () => void): void;
    }
  }
}
