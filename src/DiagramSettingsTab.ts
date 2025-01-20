import { App, PluginSettingTab, Setting } from "obsidian";
import DiagramPlugin from "./DiagramPlugin";
import { SettingsTheme } from "./DiagramPluginSettings";

function mapBooleanString(
  value: any,
  trueString: string,
  falseString: string,
  otherString: string
) {
  if (value === true) {
    return trueString;
  }
  if (value === false) {
    return falseString;
  }
  return otherString;
}

export default class DiagramSettingsTab extends PluginSettingTab {
  plugin: DiagramPlugin;

  constructor(app: App, plugin: DiagramPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName("Theme")
      .setDesc("Interface theme")
      .addDropdown((component) => {
        component
          .addOptions({
            [SettingsTheme.full]: "Full",
            [SettingsTheme.compact]: "Compact",
            [SettingsTheme.sketch]: "Sketch",
          })
          .setValue(this.plugin.settings.theme.layout)
          .onChange(async (value) => {
            this.plugin.settings.theme.layout = value as SettingsTheme;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName("Dark")
      .setDesc("Use dark mode")
      .addDropdown((component) => {
        component
          .addOptions({
            automatic: "Automatic",
            dark: "Dark",
            light: "Light",
          })
          .setValue(
            mapBooleanString(
              this.plugin.settings.theme.dark,
              "dark",
              "light",
              "automatic"
            )
          )
          .onChange(async (value) => {
            if (value === "dark") {
              this.plugin.settings.theme.dark = true;
            } else if (value === "light") {
              this.plugin.settings.theme.dark = false;
            } else {
              this.plugin.settings.theme.dark = undefined;
            }
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName("Sketch")
      .setDesc("Use sketch style drawing")
      .addToggle((component) => {
        component
          .setValue(this.plugin.settings.drawing.sketch)
          .onChange(async (value) => {
            this.plugin.settings.drawing.sketch = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName("CSS snippets")
      .setDesc("Add paths to CSS snippets within the Vault, one by line. The snippets are used to modify the style of the diagram editor.")
        .addTextArea(text => text
        .setPlaceholder("Example: style.css\nsnippetsFolder/diagrams.css")
        .setValue(this.plugin.settings.cssSnippets.join("\n"))
        .onChange(async (value) => {
            this.plugin.settings.cssSnippets = value.split("\n")
            await this.plugin.saveSettings();
        }));
  }
}
