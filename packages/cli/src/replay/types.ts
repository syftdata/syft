export interface TSSourcePath {
  fileName: string;
}
export interface EventSource {
  name: string;
  uiEventType: string;
  source: TSSourcePath;
  owner?: string;
  ownerSource?: TSSourcePath;
}
