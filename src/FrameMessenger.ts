import { Message } from "./Messages";

type MessageHandler = (message: Message) => void;
type MessageFilter = (message: Message) => boolean;
type AwaitedMessage = {
  filter: MessageFilter;
  callback: (message: Message) => void;
};
type MessageTarget = {
  postMessage(
    message: any,
    targetOrigin: string,
    transfer?: Transferable[]
  ): void;
};
type MessageTargetFactory = () => MessageTarget;

export class FrameMessenger {
  private awaitedMessages: Set<AwaitedMessage> = new Set();
  private listener: (messageEvent: MessageEvent) => void;
  readonly targetFactory: MessageTargetFactory;

  constructor(targetFactory: MessageTargetFactory, onMessage?: MessageHandler) {
    this.targetFactory = targetFactory;
    this.listener = (messageEvent: MessageEvent) => {
      const targetWindow = targetFactory();
      if (messageEvent.source !== targetWindow) {
        return;
      }

      const message: any = JSON.parse(messageEvent.data);

      // Invoke the message callback
      if (onMessage) {
        onMessage(message);
      }

      // Resolve promises waiting for a matching message
      const items = Array.from(this.awaitedMessages.values());
      items.forEach((item) => {
        if (item.filter(message)) {
          this.awaitedMessages.delete(item);
          item.callback(message);
        }
      });
    };
    window.addEventListener("message", this.listener);
  }

  protected validateTarget(target: MessageTarget) {
    if (typeof target !== "object" || target === null) {
      throw Error("Target window is not an object");
    }
    if (typeof target.postMessage !== "function") {
      throw Error("Target window does not have a postMessage function");
    }
  }

  waitForMessage(filter: MessageFilter, timeout: number): Promise<Message> {
    return new Promise((resolve, reject) => {
      const timeoutHandle = setTimeout(() => {
        this.awaitedMessages.delete(item);
        reject("Timeout waiting for message");
      }, timeout);

      const callback = (message: Message) => {
        this.awaitedMessages.delete(item);
        clearTimeout(timeoutHandle);
        resolve(message);
      };

      const item = {
        filter,
        callback,
      };

      this.awaitedMessages.add(item);
    });
  }

  sendMessageAndWait(message: Message, filter: MessageFilter, timeout: number) {
    const target = this.targetFactory();
    this.validateTarget(target);
    const promise = this.waitForMessage(filter, timeout);
    target.postMessage(JSON.stringify(message), "*");
    return promise;
  }

  sendMessage(message: Message) {
    const target = this.targetFactory();
    this.validateTarget(target);
    target.postMessage(JSON.stringify(message), "*");
  }

  destroy() {
    window.removeEventListener("message", this.listener);
  }
}
