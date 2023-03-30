export const SyftEnv = {
  Prod: 'prod',
  Dev: 'dev'
} as const;

export type SyftEnvType = typeof SyftEnv;
export type SyftEnvValueType = SyftEnvType[keyof SyftEnvType];

export interface ApiField {
  name: string;
  alias?: string;
  type: string;
  children?: ApiField[];
}

export interface ApiEvent {
  name: string;
  alias?: string;
  eventType: string;
  fields: ApiField[];
}
