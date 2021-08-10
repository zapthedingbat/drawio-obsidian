import DrawioPlugin from "./DrawioPlugin";

export function startApp() {
  App.main();
  Draw.loadPlugin(DrawioPlugin.plugin);
}
