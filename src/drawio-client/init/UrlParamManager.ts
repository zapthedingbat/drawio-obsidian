import { UiThemes, UrlParams } from "drawio";

import {
  DiagramPluginSettings,
  SettingsTheme,
} from "../../DiagramPluginSettings";

function getUiFromTheme(settings: DiagramPluginSettings): UiThemes {
  const theme = settings.theme;
  if (theme.layout === "full") {
    if (theme.dark) {
      return "dark";
    }
    return "kennedy";
  } else if (theme.layout === "compact") {
    return "min";
  }
  return "sketch";
}

function getDarkFromTheme(settings: DiagramPluginSettings): "0" | "1" {
  const dark = settings.theme.dark;
  if (dark) {
    return "1";
  }
  return "0";
}

function getRough(settings: DiagramPluginSettings) {
  return settings.drawing.sketch ? "1" : "0";
}

function getSketch(settings: DiagramPluginSettings): "1" | "0" {
  return settings.theme.layout === SettingsTheme.sketch ? "1" : "0";
}

export class UrlParamManager {
  private params: any;

  constructor(targetWindow: Window, params: object) {
    this.params = params || {};
    this.defineUrlParams(targetWindow as any);
  }

  private defineUrlParams(target: any) {
    const urlParamsProxy = new Proxy(this.params, {
      get(target, propertyKey, receiver) {
        const value = Reflect.get(target, propertyKey, receiver);
        // NOTE: This is a really helpful place to debug values that drawio is reading
        return value;
      },
      set() {
        return true;
      },
    });

    Object.defineProperty(target, "urlParams", {
      value: urlParamsProxy,
    });
  }

  public setValues(settings: DiagramPluginSettings): void {
    const params: UrlParams = {
      embed: "1",
      configure: "0",
      noExitBtn: "1",
      noSaveBtn: "1",
      noFileMenu: "1",
      pages: "0",
      proto: "json",
      pv: "0",
      saveAndExit: "0",
      stealth: "1",
      ui: getUiFromTheme(settings),
      dark: getDarkFromTheme(settings),
      rough: getRough(settings),
      sketch: getSketch(settings),
    };
    this.setUrlParams(params);
  }

  public setUrlParams(params: UrlParams) {
    Object.assign(this.params, params);
  }
}
