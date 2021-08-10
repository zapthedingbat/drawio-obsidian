import { ViewCreator } from "obsidian";

declare module "obsidian" {
  export interface ViewRegistry {
    trigger(eventName: string, ...args: any[]): void;
    registerExtensions(extensions: string[], type: string): void;
    registerView(type: string, viewCreator: ViewCreator): void;
    typeByExtension: { [key: string]: string };
  }

  export interface PluginRegistryItem {
    enable(flag: boolean): void;
    disable(flag: boolean): void;
  }

  export interface InternalPlugins {
    plugins: { [key: string]: PluginRegistryItem };
  }
}
