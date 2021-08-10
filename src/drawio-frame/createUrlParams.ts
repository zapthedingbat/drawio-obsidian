import { UiThemes, UrlParams } from "drawio";
import { DiagramPluginSettings, SettingsTheme } from "../DiagramPluginSettings";

function getUiFromTheme(
  settings: DiagramPluginSettings,
  isAppThemeDark: boolean
): UiThemes {
  const theme = settings.theme;
  if (theme.layout === "full") {
    if (theme.dark === true) {
      return "dark";
    }
    if (theme.dark === false) {
      return "kennedy";
    }
    if (isAppThemeDark) {
      return "dark";
    }
    return "kennedy";
  } else if (theme.layout === "compact") {
    return "min";
  }
  return "sketch";
}

function getDarkFromTheme(
  settings: DiagramPluginSettings,
  isAppThemeDark: boolean
): "0" | "1" {
  const dark = settings.theme.dark;
  if (dark === true) {
    return "1";
  }
  if (dark === false) {
    return "0";
  }
  if (isAppThemeDark) {
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

export function createUrlParams(
  settings: DiagramPluginSettings,
  appThemeDark: boolean
): UrlParams {
  const urlParams: UrlParams = {
    embed: "1",
    configure: "1",
    noExitBtn: "1",
    noSaveBtn: "1",
    pages: "0",
    proto: "json",
    pv: "0",
    saveAndExit: "0",
    stealth: "1",
    ui: getUiFromTheme(settings, appThemeDark),
    dark: getDarkFromTheme(settings, appThemeDark),
    rough: getRough(settings),
    sketch: getSketch(settings),
  };
  return urlParams;
}
