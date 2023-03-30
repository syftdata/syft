export interface BigQueryConfig {
  projectId: string;
  dataset: string;
}

export interface ProviderConfig {
  destination: string;
  platform?: string;
}
