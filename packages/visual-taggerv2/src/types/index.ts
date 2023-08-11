import { EventSchema } from "@syftdata/common/lib/types";

export enum ActionsMode {
  Actions = "actions",
  Code = "code",
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
  ReactElement = "react-ele", // used specifically to represent an element. THIS IS HACK. Ideally we should build a new type for this.
}

export enum TagName {
  A = "A",
  B = "B",
  Body = "BODY",
  BR = "BR",
  Button = "BUTTON",
  Cite = "CITE",
  Code = "CODE",
  Div = "DIV",
  EM = "EM",
  EMBED = "EMBED",
  HTML = "HTML",
  Img = "IMG",
  Input = "INPUT",
  Section = "SECTION",
  Select = "SELECT",
  Span = "SPAN",
  Strong = "STRONG",
  Table = "TABLE",
  TextArea = "TEXTAREA",
  Video = "VIDEO",
  Window = "WINDOW",
}

// (TODO) -> move to utils
export const isSupportedActionType = (actionType: ActionType) =>
  actionType != null;

export interface ReactSource {
  name: string;
  source: string;
  line: number;
  props: Record<string, unknown>;
  urlPath: string;

  handlers: string[];
  parent?: ReactSource;
}

export class BaseAction {
  type: ActionType;
  tagName: TagName;
  inputType?: string;
  value?: string;
  selectors: { [key: string]: string | null };
  timestamp: number;
  isPassword: boolean;
  hasOnlyText: boolean; // If the element only has text content inside (hint to use text selector)
}

export class ReactElement extends BaseAction {
  declare type: ActionType.ReactElement;
  reactSource: ReactSource;

  // to show the tree hierarchy.
  children?: ReactElement[];

  // we need to maintain a mapping between handlernames and events.
  handlerToEvents: Record<string, string[]>;
  committed?: boolean;
  instrumented?: boolean;
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
  | ResizeAction
  | ReactElement;

export type EventTag = ReactElement;

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
  screenshot?: string;
}

export enum MessageType {
  // Background to DevTools.
  SyftEvent = "syft-event",

  // DevTools to background
  InitDevTools = "init-devtools",
  CleanupDevTools = "cleanup-devtools",

  // Content to Content Script.
  GetReactEles = "get-react-eles",
  ReactElesResp = "react-eles-resp",

  // DevTools -> Background -> Content
  StartPreview = "start-preview",
  StopPreview = "stop-preview",
  // needs to collect elements from content and fire magicAPI.

  // Extension Native UI to DevTools.
  OnSearch = "on-search",
  OnShown = "on-shown",
  OnHidden = "on-hidden",

  // Webapp to Background
  LoggedIn = "logged-in",
  LoggedOut = "logged-out",
}

export interface EventSchemas {
  appName: string;
  appVersion: string;
  events: EventSchema[];
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

  eventTags: EventTag[];
  eventTagsSha?: string; // used to update the file without overwriting others changes.
}

export enum VisualMode {
  SELECTED,
  ALL,
  ALL_ELEMENTS,
}

export interface RecordingState {
  mode: VisualMode;
  tabId?: number;
  frameId?: number;

  rootElement?: ReactElement;

  selectedIndex?: number;
  elements: ReactElement[];
}
