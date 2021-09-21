declare module "mxgraph" {
  export interface mxEventObject {
    getProperty<T>(propertyName: string): T;
  }

  export interface mxSvgCanvas2D {}

  export interface mxPopupMenu {}

  export interface mxCell {
    children: Array<mxCell> | null;
    style?: string;
  }

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
      scale(scale: number): void;
      translate(x: number, y: number): void;
    }
  }
}
