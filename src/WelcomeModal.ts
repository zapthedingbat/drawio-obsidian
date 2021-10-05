import { App as ObsidianApp, Modal } from "obsidian";
import DiagramPlugin from "./DiagramPlugin";
import { SettingsTheme } from "./DiagramPluginSettings";

export class WelcomeModal extends Modal {
  plugin: DiagramPlugin;
  closeButtonEl: HTMLElement;

  constructor(app: ObsidianApp, plugin: DiagramPlugin) {
    super(app);
    this.plugin = plugin;
  }

  async onOpen() {
    const welcomeHtml = `
    <div>
      Thanks for installing the diagrams plugin. Before we get started...
    </div>
    <div class="setting-item" style="display:block">
      <div class="setting-item-description">
        As an alternative to the normal Diagrams.net (Draw.io) interface you may want to use "sketch" mode for your notes.
        Sketch mode has a simpler interface and hand-draw diagram style.
      </div>
      <div style="display:flex;justify-content:space-around;padding-top:1em;padding-bottom:1em;">
        <div style="text-align:center;">
          <div class="setting-item-heading">Sketch</div>
          <div><button id="UseSketchStyle" class="mod-cta">Use Sketch As Default</button></div>
        </div>
        <div style="text-align:center;">
          <div class="setting-item-heading">Full</div>
          <div><button id="UseFullStyle" class="mod-cta">Use Full As Default</button></div>
        </div>
      </div>
      <div class="setting-item-description">
        You can change this setting at any time by going to <b>Settings</b> &gt; <b>Diagrams</b>.
      </div>
    </div>
    <div>
      If you find any issues or have feature requests, please add them to the 
      <a href="https://github.com/zapthedingbat/drawio-obsidian/issues" target="_blank">GitHub</a> repository.
      Pull requests or any other contributions are very welcome!
    </div>
    `;
    this.titleEl.appendChild(document.createTextNode("Diagrams"));
    this.contentEl.innerHTML = welcomeHtml;
    this.closeButtonEl = this.containerEl.querySelector(".modal-close-button");
    this.closeButtonEl.style.display = "none";

    this.containerEl
      .querySelector("#UseSketchStyle")
      .addEventListener("click", async () => {
        this.plugin.settings.theme.layout = SettingsTheme.sketch;
        this.plugin.settings.drawing.sketch = true;
        this.plugin.settings.welcomeComplete = true;
        this.close();
        await this.plugin.saveSettings();
      });

    this.containerEl
      .querySelector("#UseFullStyle")
      .addEventListener("click", async () => {
        this.plugin.settings.theme.layout = SettingsTheme.full;
        this.plugin.settings.drawing.sketch = false;
        this.plugin.settings.welcomeComplete = true;
        this.close();
        await this.plugin.saveSettings();
      });
  }
}
