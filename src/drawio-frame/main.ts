/**
 * This is the entry point that is loaded into the iframe.
 * It configures global variables and patches the DOM to intercept requests
 *
 * This file is built as an entry point and then the output is included in
 * the obsidian plugin code as a string so it can be injected into the iframe.
 **/

import { setFrameMessageHandler, sendMessage } from "./messaging";
import handleMessages from "./handleFrameMessage";
import { interceptResourceRequests, loadStylesheet } from "./resourceRequests";
import { setMxScript } from "./setMxScript";

// Start handling inter-frame messages
setFrameMessageHandler(handleMessages);

// Intercept requests drawio tries to make
interceptResourceRequests();

// Setup drawio script loading method on the global scope
setMxScript();

// Generic UI CSS
loadStylesheet("assets/grapheditor.css");

// Tell the parent that the frame is ready and wait to to receive urlParams
sendMessage({
  event: "frame-ready",
});
