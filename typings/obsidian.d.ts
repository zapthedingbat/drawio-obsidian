import { ViewCreator } from "obsidian";

declare module "obsidian" {
  export interface FileExplorerView extends View {
    headerDom: {
      addNavButton: (
        icon: String,
        title: string,
        onClick: () => void
      ) => HTMLElement;
    };
  }
  export interface PluginRegistration {
    enabled: boolean;
    instance: {
      id: string;
    };
  }
  export interface InternalPlugins {
    plugins: { [key: string]: PluginRegistration };
    on(
      name: "change",
      callback: (plugin: PluginRegistration) => any,
      ctx?: any
    ): EventRef;
  }

  export interface ViewRegistry {
    trigger(eventName: string, ...args: any[]): void;
    typeByExtension: { [key: string]: string };
  }

  export interface CustomCss {
    styleEl: HTMLStyleElement;
  }

  export interface MenuItem {
    dom: HTMLElement;
  }

  export interface Menu {
    dom: HTMLElement;
    items: MenuItem[];
  }

  export interface LoadProgress {
    setMessage(message: string): this;
    show(): this;
    hide(): this;
  }

  export interface App {
    customCss: CustomCss;
    internalPlugins: InternalPlugins;
    viewRegistry: ViewRegistry;
    account: any;
    loadProgress: LoadProgress;
  }
}
