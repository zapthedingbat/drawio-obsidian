import { App as ObsidianApp, LoadProgress } from "obsidian";

export function createLoadProgress(
  app: ObsidianApp,
  container: HTMLElement
): LoadProgress {
  const obsidianAppLoadProgress = app.loadProgress;
  if(!obsidianAppLoadProgress) {
    return {
      setMessage: function (message: string){
        console.log('Set message', message);
        return this
      },
      show: function (){
        console.log('Set loading');
        return this
      },
      hide: function (){
        console.log('Set hiding');
        return this
      }
    }
  }
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
