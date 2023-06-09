export enum ActionsMode {
  Actions = "actions",
  Code = "code",
}

export enum ScriptType {
  Puppeteer = "puppeteer",
  Playwright = "playwright",
  Cypress = "cypress",
}

export enum ActionType {
  AwaitText = "awaitText",
  Click = "click",
  DragAndDrop = "dragAndDrop",
  FullScreenshot = "fullScreenshot",
  Hover = "hover",
  Input = "input",
  Keydown = "keydown",
  Load = "load",
  Navigate = "navigate",
  Resize = "resize",
  Wheel = "wheel",
}

export enum TagName {
  A = "A",
  B = "B",
  Cite = "CITE",
  EM = "EM",
  Input = "INPUT",
  Select = "SELECT",
  Span = "SPAN",
  Strong = "STRONG",
  TextArea = "TEXTAREA",
}

// (TODO) -> move to utils
export const isSupportedActionType = (actionType: ActionType) =>
  actionType != null;

export class SyftEventSource {
  name: string;
  source: string;
  owner: string;
  ownerSource: string;
}

export class BaseAction {
  type: ActionType;
  tagName: TagName;
  inputType: string | undefined;
  value: string | undefined;
  selectors: { [key: string]: string | null };
  timestamp: number;
  isPassword: boolean;
  hasOnlyText: boolean; // If the element only has text content inside (hint to use text selector)

  events?: SyftEvent[];
  eventSource?: SyftEventSource;
}

export class KeydownAction extends BaseAction {
  declare type: ActionType.Keydown;
  key: string;
}

export class InputAction extends BaseAction {
  declare type: ActionType.Input;
}

export class ClickAction extends BaseAction {
  declare type: ActionType.Click;
  offsetX: number;
  offsetY: number;
}

export class DragAndDropAction extends BaseAction {
  declare type: ActionType.DragAndDrop;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
}

export class HoverAction extends BaseAction {
  declare type: ActionType.Hover;
  offsetX: number;
  offsetY: number;
}

export class LoadAction extends BaseAction {
  declare type: ActionType.Load;
  url: string;
}

export class NavigateAction extends BaseAction {
  declare type: ActionType.Navigate;
  url: string;
  source: string;
}

export class WheelAction extends BaseAction {
  declare type: ActionType.Wheel;
  deltaX: number;
  deltaY: number;
  pageXOffset: number;
  pageYOffset: number;
}

export class FullScreenshotAction extends BaseAction {
  declare type: ActionType.FullScreenshot;
}

export class AwaitTextAction extends BaseAction {
  declare type: ActionType.AwaitText;
  text: string;
}

export class ResizeAction extends BaseAction {
  declare type: ActionType.Resize;
  width: number;
  height: number;
}

export type Action =
  | KeydownAction
  | InputAction
  | ClickAction
  | DragAndDropAction
  | HoverAction
  | LoadAction
  | NavigateAction
  | WheelAction
  | FullScreenshotAction
  | AwaitTextAction
  | ResizeAction;

export enum SyftEventTrackStatus {
  TRACKED, // event is modeled and instrumented using syft.
  SEMI_TRACKED, // event is modeled, but the library is not being used.
  NOT_TRACKED, // event is not modeled.
}

export enum SyftEventValidStatus {
  VALID, // event data is valid.
  NOT_VALID, // event data is not valid.
  UNKNOWN, // we don't know if the event data is valid.
}

export enum SyftEventInstrumentStatus {
  INSTRUMENTED, // event is instrumented.
  NOT_INSTRUMENTED, // event is not instrumented.
  NOT_INSTRUMENTED_VERBOSE, // event is not instrumented, and includes a lot of events.
}

export interface SyftEvent {
  createdAt: Date;
  name: string;
  props: Record<string, any>;
  syft_status: {
    track: string;
    valid: string;
  };
}

export enum MessageType {
  // Background to DevTools.
  SyftEvent = "syft-event",
  RecordedStep = "recorded-step",

  // Other way round. DevTools to background
  InitDevTools = "init-devtools",
  StartRecord = "start-record",
  StopRecord = "stop-record",
  ReplaceStep = "replace-step",

  // Background to Content Script.
  GetSourceFile = "get-source-file",
  GetSourceFileResponse = "get-source-file-response",

  // Extension UI to DevTools.
  OnSearch = "on-search",
  OnShown = "on-shown",

  // Webapp to Background
  LoggedIn = "logged-in",
  LoggedOut = "logged-out",
}

export enum FieldType {
  STRING = "STRING",
  INT = "INT",
  POSITIVE_INT = "POSITIVE_INT",
  FLOAT = "FLOAT",
  BOOLEAN = "BOOLEAN",
  NUMBER = "NUMBER",
  ARRAY = "ARRAY",
  OBJECT = "OBJECT",
  DATE = "DATE",
  CUID = "CUID",
  CUID2 = "CUID2",
  UUID = "UUID",
  EMAIL = "EMAIL",
  URL = "URL",
  COUNTRYCODE = "COUNTRYCODE",
}

export interface EventSchemas {
  appName: string;
  appVersion: string;
  events: Event[];
}

export interface EventField {
  name: string;
  type: FieldType;
  description?: string;
  isOptional: boolean;
  defaultValue?: string;
}

export interface Event {
  id: string;
  name: string;
  description?: string;
  updatedAt?: Date;
  fields: EventField[];
}

export interface User {
  id: string;
  name?: string;
  email?: string;
  image?: string;
}

export interface UserSession {
  jwt: string;
  user: User;
}

export interface EventSource {
  id: string;
  name: string;
}

export interface FileInfo {
  name: string;
  path: string;
  size: number;
  created?: Date;
  updated?: Date;
  updatedBy?: string;
  content?: string;
  sha: string;
}

export interface GitInfo {
  activeSourceId?: string;
  activeBranch?: string;
  sources: EventSource[];
  branches: string[];
  files: FileInfo[];

  eventSchemaSha?: string; // used to update the file without overwriting others changes.
  eventSchema: EventSchemas;
}
