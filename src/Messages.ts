export type FrameConfigActionMessage = {
  action: "frame-config";
  settings: any;
  appThemeDark: boolean;
  frameFontCss: string;
};

export type DrawioConfigActionMessage = {
  action: "configure";
  config: any;
};

export type DrawioLoadActionMessage = {
  action: "load";
  xml: string;
  title: string;
};

export type ActionMessage =
  | FrameConfigActionMessage
  | DrawioConfigActionMessage
  | DrawioLoadActionMessage;

export type FileDataEventMessage = {
  event: "file-data";
  xml: string;
};

export type FrameReadyEventMessage = {
  event: "frame-ready";
};

export type DrawioReadyEventMessage = {
  event: "init";
};

export type DrawioConfigEventMessage = {
  event: "configure";
};

export type EventMessage =
  | FrameReadyEventMessage
  | DrawioConfigEventMessage
  | DrawioReadyEventMessage
  | FileDataEventMessage;

export type Message = ActionMessage | EventMessage;
