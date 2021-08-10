/**
 * Patch bits of drawio to integrate more seamlessly
 * */
export default function customizeUi() {
  // Ignore the addEmbedButtons calls
  EditorUi.prototype.addEmbedButtons = () => {};

  // Set defaults
  Editor.prototype.readGraphState = function (a) {
    this.graph.gridEnabled = true;
    this.graph.gridSize = 10;
    this.graph.graphHandler.guidesEnabled = true;
    this.graph.connectionArrowsEnabled = true;
    this.graph.foldingEnabled = true;
    this.graph.cellRenderer.forceControlClickHandler = true;
    this.graph.pageScale = 1;
    this.graph.pageVisible = false;
    this.graph.defaultPageVisible = false;
    this.graph.pageBreaksVisible = false;
    this.graph.preferPageSize = false;
    this.graph.pageFormat = new mxRectangle(0, 0, 1, 1);
    this.graph.background = null;
  };

  Sidebar.prototype.createThumb = function (
    cells: any[],
    width: number,
    height: number,
    parent: HTMLElement
  ) {
    this.graph.view.scaleAndTranslate(1, 0, 0);
    this.graph.addCells(cells);
    const bounds = this.graph.getGraphBounds();

    // Some kind of ratio
    const aspectRatio =
      Math.floor(Math.min(width / bounds.width, height / bounds.height) * 100) /
      100;

    this.graph.view.scaleAndTranslate(
      aspectRatio,
      Math.floor(
        (width - bounds.width * aspectRatio) / 2 / aspectRatio - bounds.x
      ),
      Math.floor(
        (height - bounds.height * aspectRatio) / 2 / aspectRatio - bounds.y
      )
    );

    const svgElement = this.graph.view
      .getCanvas()
      .ownerSVGElement.cloneNode(true);
    this.graph.getModel().clear();
    svgElement.style.position = "relative";
    svgElement.style.overflow = "hidden";
    svgElement.style.width = width + "px";
    svgElement.style.height = height + "px";
    parent.appendChild(svgElement);

    return bounds;
  };

  Sidebar.prototype.createItem = function (cells: any[]) {
    const itemElement = document.createElement("a");
    itemElement.className = "geItem";

    itemElement.style.overflow = "hidden";
    itemElement.style.width = this.thumbWidth + "px";
    itemElement.style.height = this.thumbHeight + "px";
    itemElement.style.padding = this.thumbPadding + "px";

    itemElement.addEventListener("click", (event) => {
      event.preventDefault();
    });

    const width = 20;
    const height = 20;

    this.createThumb(cells, width, height, itemElement);

    const bounds = new mxRectangle(0, 0, width, height);

    if (cells.length > 1 || cells[0].vertex) {
      const dropHandler = this.createDropHandler(cells, true, true, bounds);
      const dragPreview = this.createDragPreview(width, height);
      const dragSource = this.createDragSource(
        itemElement,
        dropHandler,
        dragPreview,
        cells,
        bounds
      );
      this.addClickHandler(itemElement, dragSource, cells);
    } else if (cells[0] != null && cells[0].edge) {
      const dropHandler = this.createDropHandler(cells, true, true, bounds);
      const dragPreview = this.createDragPreview(width, height);
      const dragSource = this.createDragSource(
        itemElement,
        dropHandler,
        dragPreview,
        cells,
        bounds
      );
      this.addClickHandler(itemElement, dragSource, cells);
    }
    return itemElement;
  };

  Sidebar.prototype.createTitle = function (label: string) {
    const titleElement = document.createElement("a");
    titleElement.className = "nav-folder is-collapsed";
    titleElement.appendChild(document.createTextNode(label));
    return titleElement;
  };

  Sidebar.prototype.createSection = function (title: string) {
    return () => {
      const titleElement = document.createElement("div");
      titleElement.className = "test-section";
      titleElement.appendChild(document.createTextNode(title));
      return titleElement;
    };
  };
}
