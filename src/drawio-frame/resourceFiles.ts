import appScript from "inline!./drawio/src/main/webapp/js/app.min.js";
import commonCss from "inline!./drawio/src/main/webapp/mxgraph/css/common.css";
import graphEditorCss from "inline!./src/assets/grapheditor.css";
import darkCss from "inline!./drawio/src/main/webapp/styles/dark.css";
import diaTxt from "inline!./drawio/src/main/webapp/resources/dia.txt";
import stencils from "inline!./drawio/src/main/webapp/js/stencils.min.js";
import extensions from "inline!./drawio/src/main/webapp/js/extensions.min.js";
import shapes from "inline!./drawio/src/main/webapp/js/shapes-14-6-5.min.js";
import maximizeGif from "base64!./drawio/src/main/webapp/mxgraph/images/maximize.gif";
import resizeGif from "base64!./drawio/src/main/webapp/mxgraph/images/resize.gif";
import drawlogoSvg from "base64!./drawio/src/main/webapp/images/drawlogo.svg";

export default [
  {
    mediaType: "text/css",
    href: "js/app.min.js",
    source: appScript,
  },
  {
    mediaType: "text/css",
    href: "assets/grapheditor.css",
    source: graphEditorCss,
  },
  {
    mediaType: "text/css",
    href: "mxgraph/css/common.css",
    source: commonCss,
  },
  {
    mediaType: "text/css",
    href: "styles/dark.css",
    source: darkCss,
  },
  {
    mediaType: "text/plain",
    href: "resources/dia.txt",
    source: diaTxt,
  },
  {
    mediaType: "text/javascript",
    href: "js/shapes-14-6-5.min.js",
    source: shapes,
  },
  {
    mediaType: "text/javascript",
    href: "js/stencils.min.js",
    source: stencils,
  },
  {
    mediaType: "text/javascript",
    href: "js/extensions.min.js",
    source: extensions,
  },
  {
    mediaType: "image/gif;base64",
    href: "mxgraph/images/maximize.gif",
    source: maximizeGif,
  },
  {
    mediaType: "image/gif;base64",
    href: "mxgraph/images/resize.gif",
    source: resizeGif,
  },
  {
    mediaType: "image/svg+xml;base64",
    href: "images/drawlogo.svg",
    source: drawlogoSvg,
  },
];
