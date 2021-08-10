import { ActionMessage, FrameConfigActionMessage } from "src/Messages";
import { createUrlParams } from "./createUrlParams";
import { setUrlParams } from "./setUrlParams";
import { setFrameFontCss } from "./setFrameFontCss";
import { loadScript } from "./resourceRequests";
import { startApp } from "./startApp";
import customizeUi from "./customizeUi";

function handleFrameConfigMessage(message: FrameConfigActionMessage) {
  const settings = message.settings;
  const appThemeDark = message.appThemeDark;

  setUrlParams(createUrlParams(settings, appThemeDark));

  setFrameFontCss(message.frameFontCss);

  loadScript("js/app.min.js", () => {
    customizeUi();
    startApp();
  });
}

export default function handleMessages(message: ActionMessage) {
  if ("action" in message) {
    switch (message.action) {
      case "frame-config":
        handleFrameConfigMessage(message);
      case "configure":
      case "load":
        // These are handled natively by drawio
        break;
    }
  }
}
