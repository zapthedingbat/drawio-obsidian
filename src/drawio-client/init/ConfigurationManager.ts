import {
  DiagramPluginSettings,
  SettingsTheme,
} from "src/DiagramPluginSettings";

export type DrawioUiThemes = "kennedy" | "min" | "atlas" | "dark" | "sketch";

export type DrawioUrlParamsFlag = "0" | "1";

/**
 * UrlParams configuration read by drawio
 * See: https://www.diagrams.net/doc/faq/supported-url-parameters
 * See: https://www.diagrams.net/doc/faq/embed-mode
 */
export interface DrawioUrlParams {
  /**
   * Runs diagrams.net in embed mode. Use this mode with embed.diagrams.net only.
   */
  embed?: "1";

  /**
   * Uses JSON for message passing in embed and client mode.
   */
  proto?: "json";

  /**
   * Sends the configure event and waits for the configure action.
   */
  configure?: DrawioUrlParamsFlag;

  /**
   * Uses the Minimal, Atlas, Dark or Sketch UI theme (default is Kennedy).
   * Note sketch=1 must also be set for the Sketch UI theme
   */
  ui?: DrawioUiThemes;

  /**
   * Disables/enables dark mode in sketch and minimal theme.
   */
  dark?: DrawioUrlParamsFlag;

  /**
   * Disables/enables sketch style (default is 1 for sketch theme and 0 for all other themes).
   */
  rough?: DrawioUrlParamsFlag;

  /**
   * Undocumented but seems to enable the Sketch UI theme
   */
  sketch?: DrawioUrlParamsFlag;

  /**
   * Displays an additional Save and Exit button. Instead of using this URL parameter, you can specify this setting in the load message. If noSaveBtn=1 is used, this can be disabled with saveAndExit=0
   */
  saveAndExit?: "0";

  /**
   * Displays a Save and Exit button instead of a Save button.
   * Instead of using this URL parameter, you can specify this setting in the load message. If this is used, then the saveAndExit URL parameter is ignored.
   */
  noSaveBtn?: "1";

  /**
   * Hides the Exit button. Instead of using this URL parameter, you can specify this setting in the load message.
   * Note: To hide all buttons in embed mode, use saveAndExit=0&noSaveBtn=1&noExitBtn=1
   */
  noExitBtn?: "1";

  /**
   * Undocumented. Hides the file menu.
   */
  noFileMenu?: "1";

  /**
   * Disables all features that require external web services (such as PDF export).
   */
  stealth?: "1";

  /**
   * Undocumented. Hides page controls.
   */
  pages?: "0";

  /**
   * Sets the default pageVisible to false.
   */
  pv?: "0";
}

export interface DrawioResource {
  main: string;
}

export interface DrawioLibrarySection {
  title: DrawioResource;
  entries: {
    id: string;
    preview?: string;
    title: DrawioResource;
    desc?: DrawioResource;
    libs: ({
      title: DrawioResource;
      tags?: string;
    } & ({ data: unknown } | { url: string }))[];
  }[];
}

export interface ColorScheme {
  fill?: string;
  stroke?: string;
  gradient?: string;
}

interface DrawioCellStyle {
  fontColor?: string;
  fillColor?: string;
  strokeColor?: string;
  gradientColor?: string;
}

interface DrawioGraphStyle {
  background?: string;
  gridColor?: string;
}

interface DrawioStyles {
  commonStyle?: DrawioCellStyle;
  vertexStyle?: DrawioCellStyle;
  edgeStyle?: DrawioCellStyle;
  graph?: DrawioGraphStyle;
}

/**
 * Configuration read by Drawio
 */
export interface DrawioConfig {
  /**
   * An array of font family names in the format panel font drop-down list.
   */
  defaultFonts?: Array<string>;

  /**
   * An array of font family names to be added before defaultFonts (9.2.4 and later).
   * Note: Fonts must be installed on the server and all client devices, or be added using the fontCss option. (6.5.4 and later).
   */
  customFonts?: Array<string>;

  /**
   * Colour codes for the upper palette in the colour dialog (no leading # for the colour codes).
   */
  presetColors?: Array<string>;

  /**
   * Colour codes to be added before presetColors (no leading # for the colour codes) (9.2.5 and later).
   */
  customPresetColors?: Array<string>;

  /**
   * Available colour schemes in the style section at the top of the format panel (use leading # for the colour codes).
   * Possible colour keys are fill, stroke, gradient and font (font is ignored for connectors).
   */
  defaultColorSchemes?: Array<string>;

  /**
   * Colour schemes to be added before defaultColorSchemes (9.2.4 and later).
   */
  customColorSchemes?: Array<Array<ColorScheme>>;

  /**
   * Defines the initial default styles for vertices and edges (connectors).
   * Note that the styles defined here are copied to the styles of new cells, for each cell.
   * This means that these values override everything else that is inherited from other styles or themes
   * (which may be supported at a later time).
   * Therefore, it is recommended to use a minimal set of values for the default styles.
   * To find the key/value pairs to be used, set the style in the application and find the key and value via Edit Style (Ctrl+E) (6.5.2 and later).
   * For example, to assign a default fontFamily of Courier New to all edges and vertices (and override all other default styles),
   * use
   * ```json
   * {
   * 	"defaultVertexStyle": {"fontFamily": "Courier New"},
   * 	"defaultEdgeStyle": {"fontFamily": "Courier New"}
   * }
   * ```
   * (6.5.2 and later).
   */
  defaultVertexStyle?: Record<string, string>;

  /**
   * See `defaultVertexStyle`.
   */
  defaultEdgeStyle?: Record<string, string>;

  /**
   * Defines a string with CSS rules to be used to configure the diagrams.net user interface.
   * For example, to change the background colour of the menu bar, use the following:
   * ```css
   * .geMenubarContainer { background-color: #c0c0c0 !important; }
   * .geMenubar { background-color: #c0c0c0 !important; }
   * ```
   * (6.5.2 and later).
   */
  css?: string;

  /**
   * Defines a string with CSS rules for web fonts to be used in diagrams.
   */
  fontCss?: string;

  /**
   * Defines a semicolon-separated list of library keys (unique names)
   * in a string to be initially displayed in the left panel (e.g. "general;uml;company-graphics").
   * Possible keys include custom entry IDs from the libraries field,
   * or keys for the libs URL parameter (6.5.2 and later).
   * The default value is `"general;uml;er;bpmn;flowchart;basic;arrows2"`.
   */
  defaultLibraries?: string;

  /**
   * Defines an array of objects that list additional libraries and sections
   * in the left panel and the More Shapes dialog.
   */
  libraries?: Array<DrawioLibrarySection>;

  /**
   * Defines the XML for blank diagrams and libraries (6.5.4 and later).
   */
  emptyDiagramXml?: string;

  /**
   * Specifies if the XML output should be compressed. The default is true.
   */
  compressXml?: boolean;

  /**
   * Defines an array of objects that contain the colours (fontColor, fillColor,
   * strokeColor and gradientColor) for the Style tab of the format panel if the
   * selection is empty. These objects can have a commonStyle (which is applied to
   * both vertices and edges), vertexStyle (applied to vertices) and edgeStyle
   * (applied to edges), and a graph with background and gridColor. An empty object
   * will apply the default colors.
   */
  styles?: Array<{} | DrawioStyles>;
}

const defaultConfiguration: DrawioConfig = {
  defaultLibraries: "general",
  libraries: [],
  defaultEdgeStyle: {
    strokeColor: "currentColor",
  },
  defaultVertexStyle: {
    fillColor: "#ffffff",
    strokeColor: "currentColor",
  },
  styles: [
    {},
    {
      commonStyle: {
        fillColor: "#ffffff",
        strokeColor: "currentColor",
      },
    },
  ],
};

const defaultUrlParams: DrawioUrlParams = {
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
  ui: "sketch",
  dark: "0",
  rough: "1",
  sketch: "1",
};

export class ConfigurationManager {
  private drawioConfig: any;
  private urlParams: any;

  constructor(win: Window) {
    this.urlParams = {};
    this.drawioConfig = {};
    this.defineUrlParams(win);
    this.defineDrawioConfig(win);
    this.setDrawioConfig(defaultConfiguration);
    this.setUrlParams(defaultUrlParams);
  }

  private defineUrlParams(win: Window) {
    const urlParamsProxy = new Proxy(this.urlParams, {
      get(target, propertyKey, receiver) {
        const value = Reflect.get(target, propertyKey, receiver);
        // NOTE: This is a really helpful place to debug values that drawio is reading
        return value;
      },
      set() {
        return true;
      },
    });

    Object.defineProperty(win, "urlParams", {
      value: urlParamsProxy,
    });
  }

  private defineDrawioConfig(win: Window) {
    const drawioConfigProxy = new Proxy(this.drawioConfig, {
      get(target, propertyKey, receiver) {
        const value = Reflect.get(target, propertyKey, receiver);
        // NOTE: This is a really helpful place to debug values that drawio is reading
        return value;
      },
      set() {
        return true;
      },
    });

    Object.defineProperty(win, "DRAWIO_CONFIG", {
      value: drawioConfigProxy,
    });

    Object.defineProperty(win, "mxLoadSettings", {
      value: false,
    });
  }

  public setConfig(settings: DiagramPluginSettings) {
    // Apply configuration from settings
    const config: DrawioConfig = {
      // TODO: Make some reasonable settings configurable
    };
    this.setDrawioConfig(config);

    // Apply UrlParams from settings
    const urlParams: DrawioUrlParams = {
      ui: this.getUiTheme(settings),
      dark: this.getDarkFromTheme(settings),
      rough: this.getRough(settings),
      sketch: this.getSketch(settings),
    };
    this.setUrlParams(urlParams);
  }

  private setDrawioConfig(drawioConfig: DrawioConfig) {
    Object.assign(this.drawioConfig, drawioConfig);
  }

  private setUrlParams(urlParams: DrawioUrlParams) {
    Object.assign(this.urlParams, urlParams);
  }

  private getUiTheme(settings: DiagramPluginSettings): DrawioUiThemes {
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

  private getDarkFromTheme(
    settings: DiagramPluginSettings
  ): DrawioUrlParamsFlag {
    const dark = settings.theme.dark;
    if (dark) {
      return "1";
    }
    return "0";
  }

  private getRough(settings: DiagramPluginSettings): DrawioUrlParamsFlag {
    return settings.drawing.sketch ? "1" : "0";
  }

  private getSketch(settings: DiagramPluginSettings): DrawioUrlParamsFlag {
    return settings.theme.layout === SettingsTheme.sketch ? "1" : "0";
  }
}
