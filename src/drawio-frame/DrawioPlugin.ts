import { defineGlobalClasses } from "./defineGlobalClasses";
import { sendMessage } from "./messaging";

async function setupFormatPanels() {
  // Replace the contents of the format panel
  Format.prototype.immediateRefresh = function () {
    this.clear();
    this.getSelectionState();
    const editorUi = this.editorUi;
    const graph = this.editorUi.editor.graph;
    const container = document.createElement("div");
    if (!graph.isSelectionEmpty()) {
      if (graph.isEditing()) {
        this.panels.push(new TextFormatPanel(this, editorUi, container));
      } else {
        this.panels.push(new StyleFormatPanel(this, editorUi, container));
      }
    } else {
      this.panels.push(new FormatPanel(this, editorUi, container));
    }
    this.container.appendChild(container);
  };
}

export default class DrawioPlugin {
  app: App;

  public static plugin(app: App) {
    defineGlobalClasses();
    setupFormatPanels();

    Object.defineProperty(window, "app", { value: app });

    new DrawioPlugin(app);
  }

  private constructor(app: App) {
    this.app = app;

    // Hide page view
    app.setPageVisible(false);

    // Hide format panel
    app.toggleFormatPanel(false);

    // Update the file when the diagram changes
    app.editor.graph.model.addListener(
      "change",
      this.handleGraphChange.bind(this)
    );
  }

  handleGraphChange(_graphModel: mxGraphModel, _event: mxEventObject) {
    const svg = this.getSvg(this.app.editor);
    sendMessage({
      event: "file-data",
      xml: svg,
    });
  }

  xmlToString(xml: Node) {
    return new XMLSerializer().serializeToString(xml);
  }

  getSvg(editor: Editor) {
    const imageExport = new mxImageExport();
    const svg = editor.graph.getSvg(
      "none",
      1,
      0,
      false,
      true,
      true,
      true,
      imageExport,
      "_blank",
      false,
      null,
      null,
      "diagram",
      null
    );

    // Embed the graph xml into the SVG
    this.embedGraph(editor, svg);

    // Add font CSS to SVG
    this.embedFonts(svg, editor);

    // Add margin to SVG
    this.addSvgMargin(svg);

    return this.xmlToString(svg);
  }

  private embedGraph(editor: Editor, svg: SVGElement) {
    const graphXml = editor.getGraphXml();
    const graphXmlContent = this.xmlToString(graphXml);
    svg.setAttribute("content", graphXmlContent);
  }

  private embedFonts(svg: SVGElement, editor: Editor) {
    const customFonts = editor.graph.getCustomFonts();

    const fontCssRules: string[] = [];
    for (const customFont of customFonts) {
      if (isCssImport(customFont.url)) {
        fontCssRules.push(`@import url(${customFont.url});`);
      } else {
        fontCssRules.push(`
@font-face {
  font-family: '${customFont.name};
  src: url('${customFont.url}')
}`);
      }
    }

    const svgDoc = svg.ownerDocument;
    const style = svgDoc.createElementNS("http://www.w3.org/2000/svg", "style");
    style.setAttribute("type", "text/css");
    style.appendChild(svgDoc.createTextNode(fontCssRules.join("\r\n")));
    svg.insertBefore(style, svg.firstChild);
  }

  private addSvgMargin(svg: SVGElement) {
    const margin = 10;
    const viewBox = svg.getAttribute("viewBox");
    const [a, b, c, d] = viewBox
      .split(" ")
      .map((x: string) => Number.parseFloat(x));
    svg.setAttribute(
      "viewBox",
      [a - margin, b - margin, c + margin * 2, d + margin * 2].join(" ")
    );
  }
}
function isCssImport(url: string): boolean {
  return /^https:\/\/fonts\.googleapis\.com/.test(url);
}
