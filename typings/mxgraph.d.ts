declare module "mxgraph" {
  global {
    class mxGraphModel {}
    class mxEventObject {}
    class mxRectangle {
      constructor(x: number, y: number, width: number, height: number);
    }
    class mxImageExport {
      //  drawState(state: any, svgCanvas: mxSvgCanvas2D): void;
    }
    // class mxSvgCanvas2D {
    //   constructor(root: SVGElement);
    // }
  }
}
