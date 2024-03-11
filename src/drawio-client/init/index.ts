import { Frame } from "./Frame";
import Responses from "./Responses";
import { RequestManager } from "./RequestManager";
import { ConfigurationManager } from "./ConfigurationManager";
import drawioCss from "inline!./src/drawio-client/drawio.css";
import darkmodeCss from "inline!./src/assets/dark.css";

/**
 * This is the entry point that is loaded into the iframe.
 * It configures global variables and patches the DOM to intercept requests
 *
 * This file is built as an entry point and then the output is included in
 * the obsidian plugin code as a string so it can be injected into the iframe.
 **/

function init(win: Window) {
  // Intercept requests for resources made by drawio so it can run offline
  RequestManager.interceptRequests(Responses);
  // Prepare the window to inject the drawio application code into it.
  const frame = Frame.main(win, new ConfigurationManager(win));
  // load the css files in directly into to the frame
  // to get around obsidian's new content security policy
  frame.addCss(drawioCss);
  frame.addCss(darkmodeCss);
}

init(window);
