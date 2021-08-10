export enum SettingsTheme {
  full = "full",
  compact = "compact",
  sketch = "sketch",
}

type optionalBoolean = true | false | undefined;

export interface DiagramPluginSettings {
  theme: {
    dark: optionalBoolean;
    layout: SettingsTheme;
  };
  drawing: {
    sketch: optionalBoolean;
  };
}

export const DEFAULT_SETTINGS: DiagramPluginSettings = {
  theme: {
    dark: null,
    layout: SettingsTheme.sketch,
  },
  drawing: {
    sketch: true,
  },
};
