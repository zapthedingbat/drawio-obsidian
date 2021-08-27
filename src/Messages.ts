export enum ActionMessageActions {
  Script = "script",
  Stylesheet = "stylesheet",
  Css = "css",
  FrameConfig = "frame-config",
  Configure = "configure",
  Load = "load",
  ToggleBodyClass = "toggle-body-class",
}

export type FrameConfigActionMessage = {
  action: ActionMessageActions.FrameConfig;
  settings: any;
};

export type ScriptActionMessage = {
  action: ActionMessageActions.Script;
  script: string;
};

export type StylesheetActionMessage = {
  action: ActionMessageActions.Stylesheet;
  stylesheet: string;
};

export type CssActionMessage = {
  action: ActionMessageActions.Css;
  css: string;
};

export type ToggleBodyClassActionMessage = {
  action: ActionMessageActions.ToggleBodyClass;
  className: string;
  force: boolean;
};

// export type DrawioConfigActionMessage = {
//   action: ActionMessageActions.Configure;
//   config: any;
// };

export type DrawioLoadActionMessage = {
  action: ActionMessageActions.Load;
  xml: string;
};

export type ActionMessage =
  | ScriptActionMessage
  | StylesheetActionMessage
  | CssActionMessage
  | ToggleBodyClassActionMessage
  | FrameConfigActionMessage
  // | DrawioConfigActionMessage
  | DrawioLoadActionMessage;

export enum EventMessageEvents {
  Change = "change",
  Iframe = "iframe",
  FrameReady = "iframe-ready",
  FrameConfig = "iframe-config",
  FrameConfigSet = "iframe-config-set",
  Init = "init",
  RequestConfig = "configure",
  Load = "load",
}

export type FileChangeEventMessage = {
  event: EventMessageEvents.Change;
  data: string;
};

export type FrameEventMessage = {
  event: EventMessageEvents.Iframe;
};

// export type FrameReadyEventMessage = {
//   event: EventMessageEvents.FrameReady;
// };

// export type FrameConfigSetEventMessage = {
//   event: EventMessageEvents.FrameConfigSet;
// };

export type DrawioInitEventMessage = {
  event: EventMessageEvents.Init;
};

export type DrawioConfigureEventMessage = {
  event: EventMessageEvents.RequestConfig;
};

export type DrawioLoadEventMessage = {
  event: EventMessageEvents.Load;
  xml: string;
};

export type EventMessage =
  | FrameEventMessage
  | DrawioConfigureEventMessage
  | DrawioInitEventMessage
  | DrawioLoadEventMessage
  | FileChangeEventMessage;

export type Message = ActionMessage | EventMessage;
