declare module "mxgraph" {
  export interface mxEventObject {
    getProperty<T>(propertyName: string): T;
  }

  export interface mxSvgCanvas2D {}

  export interface mxPopupMenu {}

  global {
    class mxImageExport {
      getLinkForCellState(state: any, canvas: any): any;
      drawState(cellState: any, svgCanvas: mxSvgCanvas2D): void;
    }

    class mxUtils {
      static bind: Function;
    }

    class mxSvgCanvas2D {
      constructor(node: Node);
      translate(x: number, y: number): void;
    }
  }
}
