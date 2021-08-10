declare global {
  class FormatPanel extends BaseFormatPanel {
    constructor(format: any, editorUi: any, container: any);
  }
}

export function defineGlobalClasses() {
  class FormatPanel extends BaseFormatPanel {
    constructor(format: any, editorUi: any, container: any) {
      super(format, editorUi, container);
      const panel = this.createPanel();
      panel.appendChild(document.createTextNode("Format Panel"));
      container.appendChild(panel);
    }
  }
  Object.defineProperty(window, "FormatPanel", { value: FormatPanel });
}
