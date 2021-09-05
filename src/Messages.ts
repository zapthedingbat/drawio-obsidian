export enum ActionMessageActions {
  Script = "script",
  Stylesheet = "stylesheet",
  Css = "css",
  FrameConfig = "frame-config",
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
  | DrawioLoadActionMessage;

export enum EventMessageEvents {
  Change = "change",
  Iframe = "iframe",
  Init = "init",
  Load = "load",
  FocusIn = "focusin",
  FocusOut = "focusout",
}

export type FileChangeEventMessage = {
  event: EventMessageEvents.Change;
  data: string;
};

export type FrameEventMessage = {
  event: EventMessageEvents.Iframe;
};

export type FocusInEventMessage = {
  event: EventMessageEvents.FocusIn;
};

export type FocusOutEventMessage = {
  event: EventMessageEvents.FocusOut;
};

export type DrawioInitEventMessage = {
  event: EventMessageEvents.Init;
};

export type DrawioLoadEventMessage = {
  event: EventMessageEvents.Load;
  xml: string;
};

export type EventMessage =
  | FrameEventMessage
  | FocusInEventMessage
  | FocusOutEventMessage
  | DrawioInitEventMessage
  | DrawioLoadEventMessage
  | FileChangeEventMessage;

export type Message = ActionMessage | EventMessage;
