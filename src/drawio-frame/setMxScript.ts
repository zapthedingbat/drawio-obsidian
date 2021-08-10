import { loadScript } from "./resourceRequests";

export function setMxScript() {
  Object.defineProperty(window, "mxscript", {
    value: loadScript,
  });
}
