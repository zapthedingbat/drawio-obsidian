import { Frame } from "./Frame";
import Responses from "./Responses";
import { loadStylesheet, RequestManager } from "./RequestManager";
import { ConfigurationManager } from "./ConfigurationManager";

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
  loadStylesheet("local://drawio.css");

  // Prepare the window to inject the drawio application code into it.
  Frame.main(win, new ConfigurationManager(win));
}

init(window);
