import { type Sink, type AST, type Field } from '@syftdata/common/lib/types';
import { logError } from '@syftdata/common/lib/utils';

export interface DestinationConfig {
  sink: Sink;
  getColumnType: (field: Field) => string;
  getSource: () => {
    schema: string;
    database?: string;
  };
  generateDBTProfile: (ast: AST) => Record<string, any>;
}

export class BQConfig implements DestinationConfig {
  sink: Sink;
  projectId: string;
  dataset: string;

  constructor(
    sink: Sink,
    { projectId, dataset }: { projectId: string; dataset: string }
  ) {
    this.sink = sink;
    this.projectId = projectId;
    this.dataset = dataset;
  }

  getColumnType = (field: Field): string => {
    if (field.name === '_id') return 'bignumeric';
    switch (field.type.name) {
      case 'string':
        return 'string';
      case 'object':
      case '__type':
        return 'json';
      case 'number':
        return 'numeric';
      case 'boolean':
        return 'bool';
      case 'timestamp':
        return 'timestamp';
      default:
        return 'string';
    }
  };

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  getSource = () => ({ schema: this.dataset, database: this.projectId });

  generateDBTProfile = (ast: AST): Record<string, any> => {
    return {
      type: 'bigquery',
      method: 'oauth',
      project: this.projectId,
      dataset: `${this.dataset}`,
      timeout_seconds: 300,
      threads: 4
    };
  };
}

export class PGConfig implements DestinationConfig {
  sink: Sink;
  uri: string;
  schema: string;
  username: string;
  password: string;
  host: string;
  port: number;
  database: string;

  constructor(sink: Sink, { uri, schema }: { uri: string; schema: string }) {
    this.sink = sink;
    this.uri = uri;
    const test = uri.replace('postgres://', '');
    const [username, password, host, port, database] = test.split(/[:@/]/);
    this.username = username;
    this.password = password;
    this.host = host;
    this.port = parseInt(port, 10);
    this.database = database;
    this.schema = schema;
  }

  getColumnType = (field: Field): string => {
    if (field.name === '_id') return 'bigserial primary key';
    switch (field.type.name) {
      case 'string':
        return 'text';
      case 'object':
      case '__type':
        return 'json';
      case 'number':
        return 'numeric';
      case 'boolean':
        return 'boolean';
      case 'timestamp':
        return 'timestamp';
      default:
        return 'text';
    }
  };

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  getSource = () => ({ schema: this.schema, database: undefined });

  generateDBTProfile = (ast: AST): Record<string, any> => {
    return {
      type: 'postgres',
      host: this.host,
      user: this.username,
      password: this.password,
      port: this.port,
      dbname: this.database,
      schema: this.schema
    };
  };
}

export function getDestinationConfig(
  sink: Sink
): DestinationConfig | undefined {
  if (sink.type === 'bigquery') {
    if (sink.config?.projectId == null || sink.config?.dataset == null) {
      logError(`Sink ${sink.id} is missing projectId or dataset`);
      return;
    }
    return new BQConfig(sink, {
      projectId: sink.config.projectId as string,
      dataset: sink.config.dataset as string
    });
  } else if (sink.type === 'postgres') {
    if (sink.config?.uri == null || sink.config?.schema == null) {
      logError(`Sink ${sink.id} is missing uri or schema`);
      return;
    }
    return new PGConfig(sink, {
      uri: sink.config.uri as string,
      schema: sink.config.schema as string
    });
  }
  return undefined;
}

export interface ProviderConfig {
  sdkType: string;
  platform?: string;
}
