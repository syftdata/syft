// TODO this file is a duplicate of packages/client/src/types.ts
// Move it into its own core package and share.

export enum SyftEventType {
  TRACK,
  PAGE,
  SCREEN,
  IDENTIFY,
  GROUP_IDENTIFY,
  DB,
  OUTBOX
}

export enum SyftInputType {
  Debezium = 'debezium',
  Http = 'http'
}

export enum SyftSinkType {
  Amplitude = 'amplitude',
  BigQuery = 'bigquery',
  SnowFlake = 'snowflake',
  Postgres = 'postgres',
  Console = 'console'
}

export enum NamingCase {
  KEEP_AS_IS,
  SNAKE, // Replace spaces with underscore and lowercase.
  CAMEL, // Remove spaces/underscores and convert first letter to uppercase.
  PASCAL,
  TITLE,
  LOWER,
  UPPER
}

// config provided during code generation
export interface StaticConfig {
  projectName: string;
  version: string;
  strict?: boolean; // drops events if they fail invalid checks.
  eventNameCase?: NamingCase;
  propertyNameCase?: NamingCase;
  lintingDisabled?: boolean;
}
