//import commonCss from "inline!./drawio/src/main/webapp/mxgraph/css/common.css";
import drawioCss from "base64!./src/drawio-client/drawio.css";
import darkCss from "inline!./drawio/src/main/webapp/styles/dark.css";
import diaTxt from "inline!./drawio/src/main/webapp/resources/dia.txt";

//import stencils from "inline!./drawio/src/main/webapp/js/stencils.min.js";
import stencils from "inline!./src/assets/shapes.js";

//import extensions from "inline!./drawio/src/main/webapp/js/extensions.min.js";
import extensions from "inline!./src/assets/extensions.js";

//import shapes from "inline!./drawio/src/main/webapp/js/shapes-14-6-5.min.js";
import shapes from "inline!./src/assets/shapes.js";

import maximizeGif from "base64!./drawio/src/main/webapp/mxgraph/images/maximize.gif";
import resizeGif from "base64!./drawio/src/main/webapp/mxgraph/images/resize.gif";
import drawlogoSvg from "base64!./drawio/src/main/webapp/images/drawlogo.svg";

export default [
  {
    mediaType: "text/css;base64",
    href: "local://drawio.css",
    source: drawioCss,
  },
  {
    mediaType: "text/css",
    href: "mxgraph/css/common.css",
    source: "",
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
