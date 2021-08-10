import { App as ObsidianApp } from "obsidian";
import { getPropertyOf } from "./getPropertyOf";

export declare interface LoadProgress {
  setMessage(message: string): LoadProgress;
  show(): LoadProgress;
  hide(): LoadProgress;
}
export function createLoadProgress(
  app: ObsidianApp,
  container: HTMLElement
): LoadProgress {
  const obsidianAppLoadProgress = getPropertyOf<any>(app, "loadProgress");
  const ObsidianLoadProgress = Object.getPrototypeOf(
    obsidianAppLoadProgress
  ).constructor;
  const loadProgress = new ObsidianLoadProgress();
  const proto = {
    container,
    show() {
      clearTimeout(this.showTimeout);
      this.showTimeout = 0;
      this.container.appendChild(this.el);
      this.el.style.opacity = "";
      return this;
    },
    hide() {
      clearTimeout(this.showTimeout);
      this.showTimeout = 0;
      this.el.remove();
      return this;
    },
  };
  Object.setPrototypeOf(proto, Object.getPrototypeOf(loadProgress));
  Object.setPrototypeOf(loadProgress, proto);
  return loadProgress;
}
