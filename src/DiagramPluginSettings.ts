export enum SettingsTheme {
  full = "full",
  compact = "compact",
  sketch = "sketch",
}

type optionalBoolean = true | false | null;

export interface DiagramPluginSettings {
  welcomeComplete: boolean;
  theme: {
    dark: optionalBoolean;
    layout: SettingsTheme;
  };
  drawing: {
    sketch: optionalBoolean;
  };
  cssSnippets: string[];
}

export const DEFAULT_SETTINGS: DiagramPluginSettings = {
  welcomeComplete: false,
  theme: {
    dark: null,
    layout: SettingsTheme.sketch,
  },
  drawing: {
    sketch: true,
  },
  cssSnippets: [],
};
