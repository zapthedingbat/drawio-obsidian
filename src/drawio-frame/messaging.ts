import { ActionMessage, EventMessage } from "src/Messages";

export function sendMessage(message: EventMessage) {
  window.parent.postMessage(JSON.stringify(message), "*");
}

export function setFrameMessageHandler(
  handleFrameMessage: (message: ActionMessage) => void
) {
  window.addEventListener("message", (messageEvent) => {
    const message: ActionMessage = JSON.parse(messageEvent.data);
    handleFrameMessage(message);
  });
}
