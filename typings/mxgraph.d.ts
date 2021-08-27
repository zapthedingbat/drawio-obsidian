declare module "mxgraph" {
  global {
    class mxUtils {
      static bind: Function;
    }
    interface mxEventObject {
      getProperty(propertyName: string): any;
    }
    interface mxGraphModel {}
    class mxImageExport {
      getLinkForCellState(state: any, canvas: any): any;
      drawState(cellState: any, svgCanvas: mxSvgCanvas2D): void;
    }
    class mxSvgCanvas2D {
      constructor(node: Node);
      translate(x: number, y: number): void;
    }
  }
  interface mxWindow {
    getX(): number;
    setLocation(x: number, y: number): void;
  }
  interface mxPopupMenu {}
}
