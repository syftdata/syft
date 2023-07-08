import { type AST } from '@syftdata/common/lib/types';

export interface DestinationConfig {
  getSource: () => {
    schema: string;
    database?: string;
  };
  generateDBTProfile: (ast: AST) => Record<string, any>;
  generateDBTProject: (ast: AST) => Record<string, any>;
}

export class BQConfig implements DestinationConfig {
  projectId: string;
  dataset: string;

  constructor(projectId: string, dataset: string) {
    this.projectId = projectId;
    this.dataset = dataset;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  getSource = () => ({ schema: this.projectId, database: this.dataset });

  generateDBTProject = (ast: AST): Record<string, any> => {
    return {
      models: {
        [ast.config.projectName]: {
          '+materialized': 'table'
        }
      }
    };
  };

  generateDBTProfile = (ast: AST): Record<string, any> => {
    return {
      [ast.config.projectName]: {
        target: 'dev',
        outputs: {
          dev: {
            type: 'bigquery',
            method: 'oauth',
            project: this.projectId,
            dataset: `${this.dataset}_dev`,
            timeout_seconds: 300
          }
        }
      }
    };
  };

  materializedModels: () => boolean = () => true;
}

export class PGConfig implements DestinationConfig {
  schema: string;

  constructor(schema: string) {
    this.schema = schema;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  getSource = () => ({ schema: this.schema, database: undefined });

  generateDBTProject = (ast: AST): Record<string, any> => {
    return {};
  };

  generateDBTProfile = (ast: AST): Record<string, any> => {
    return {
      [ast.config.projectName]: {
        target: 'dev',
        outputs: {
          dev: {
            type: 'postgres',
            host: 'localhost',
            user: 'postgres',
            password: 'postgres',
            port: 54322,
            dbname: 'postgres',
            schema: 'analytics'
          }
        }
      }
    };
  };

  materializedModels: () => boolean = () => false;
}

export interface ProviderConfig {
  destination: string;
  platform?: string;
}
