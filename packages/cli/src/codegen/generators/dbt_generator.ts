import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';
import {
  type Field,
  type AST,
  type EventSchema
} from '@syftdata/common/lib/types';
import { createDir } from '../../utils';
import { getSQLFriendlyEventName, logInfo } from '@syftdata/common/lib/utils';
import {
  type DestinationConfig,
  type ProviderConfig
} from '../../config/sink_configs';
import { addExtraColumns } from '../helpers/dbt_extra_columns';

// HACK: ignore user identity and index too. they don't exist in BQ yet.
const EXCLUDED = ['UserIdentity'];
function ignoreSchema(schema: EventSchema): boolean {
  if (!(schema.exported ?? false)) return true;
  if (EXCLUDED.includes(schema.name)) return true;
  return false;
}

function getModelName(eventName: string): string {
  const sqlName = getSQLFriendlyEventName(eventName);
  return `stg_${sqlName}`;
}

function getColumn(field: Field): Record<string, any> {
  let metabaseType: string | undefined;
  if (field.name === '_id') {
    metabaseType = 'PK';
  } else if (field.name === 'country') {
    metabaseType = 'Country';
  } else if (field.name === 'city') {
    metabaseType = 'City';
  } else if (field.name === 'eventName' || field.name === 'eventType') {
    metabaseType = 'Category';
  } else if (field.name === 'receivedAt') {
    metabaseType = 'CreationTimestamp';
  } else if (field.type.syfttype === 'URL') {
    metabaseType = 'URL';
  } else if (field.type.syfttype === 'Email') {
    metabaseType = 'Email';
  }
  const data = {
    name: field.name,
    description: field.documentation,
    meta: {
      type: field.type.name
    },
    quote: field.name !== field.name.toLowerCase()
  };

  if (metabaseType != null) {
    data.meta['metabase.semantic_type'] = `type/${metabaseType}`;
  }
  return data;
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function getSource(schema: EventSchema) {
  const tableName = getSQLFriendlyEventName(schema.name);
  return {
    name: tableName,
    description: schema.documentation,
    columns: schema.fields.map((field) => {
      const column = {
        ...getColumn(field),
        tests: [] as string[]
      };
      if (!field.isOptional) {
        column.tests.push('not_null');
      }
      return column;
    })
  };
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function getModel(schema: EventSchema) {
  const eventName = getSQLFriendlyEventName(schema.name);
  const modelName = getModelName(eventName);
  return {
    name: modelName,
    description: schema.documentation,
    columns: schema.fields.map((field) => getColumn(field))
  };
}

function generateSourcesYaml(
  ast: AST,
  destinationDir: string,
  destinationConfig: DestinationConfig
): void {
  const models = ast.eventSchemas
    .filter((val) => !ignoreSchema(val))
    .map((val) => getSource(val));

  // create source file.
  fs.writeFileSync(
    path.join(destinationDir, 'models', 'syft.yml'),
    yaml.dump({
      version: 2,
      sources: [
        {
          ...destinationConfig.getSource(),
          name: 'syft',
          description: 'Loaded from Syft',
          tables: models
        }
      ]
    })
  );
}

function generateConfigYaml(ast: AST, destinationDir: string): void {
  const models = ast.eventSchemas
    .filter((val) => !ignoreSchema(val))
    .map((val) => getModel(val));

  fs.writeFileSync(
    path.join(destinationDir, 'models', 'schema.yml'),
    yaml.dump({
      version: 2,
      models
    })
  );
}

function generateColumns(schema: EventSchema): string {
  return schema.fields
    .map((field) => {
      const name = field.name;
      if (name === name.toLowerCase()) return name;
      return `"${name}"`;
    })
    .join(', ');
}

function generateModel(schema: EventSchema): string {
  const sqlName = getSQLFriendlyEventName(schema.name);
  return `
SELECT

${generateColumns(schema)}

FROM {{ source ('syft', '${sqlName}') }}`;
}

function generateStagingModels(ast: AST, destinationDir: string): void {
  ast.eventSchemas.forEach((schema) => {
    if (ignoreSchema(schema)) return;
    fs.writeFileSync(
      path.join(destinationDir, 'models', `${getModelName(schema.name)}.sql`),
      generateModel(schema)
    );
  });
}

function getPostgresColumnType(name: string, type: string): string {
  if (name === '_id') return 'bigserial primary key';
  switch (type) {
    case 'string':
      return 'text';
    case 'object':
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
}

function getColumnTypesForSeed(schema: EventSchema): object {
  return schema.fields.reduce((acc, field) => {
    acc[field.name] = getPostgresColumnType(field.name, field.type.name);
    return acc;
  }, {});
}

function generateSeeds(ast: AST, outputDir: string): void {
  const seeds = {
    version: 2,
    seeds: ast.eventSchemas
      .filter((val) => !ignoreSchema(val))
      .map((val) => {
        const tableName = getSQLFriendlyEventName(val.name);
        return {
          name: tableName,
          config: {
            quote_columns: true,
            column_types: getColumnTypesForSeed(val)
          }
        };
      })
  };
  fs.writeFileSync(
    path.join(outputDir, 'seeds', 'properties.yml'),
    yaml.dump(seeds)
  );

  // write individual seed files.
  ast.eventSchemas.forEach((schema) => {
    if (ignoreSchema(schema)) return;
    const tableName = getSQLFriendlyEventName(schema.name);
    fs.writeFileSync(
      path.join(outputDir, 'seeds', `${tableName}.csv`),
      schema.fields.map((field) => field.name).join(',')
    );
  });
}

function generateDbtProject(
  ast: AST,
  outputDir: string,
  destinationConfig: DestinationConfig
): void {
  const projectName = ast.config.projectName;
  const profileName = projectName;
  const data = {
    name: projectName,
    version: ast.config?.version ?? '0.0.1',
    'config-version': 2,
    profile: profileName,
    'model-paths': ['models'],
    'test-paths': ['tests'],
    'seed-paths': ['seeds'],
    'target-path': 'target',
    'clean-targets': ['target', 'dbt_packages'],
    ...destinationConfig.generateDBTProject(ast)
  };
  fs.writeFileSync(path.join(outputDir, 'dbt_project.yml'), yaml.dump(data));
}

export function generate(
  ast: AST,
  outputDir: string,
  destinationConfig: DestinationConfig,
  providerConfig: ProviderConfig
): void {
  createDir(outputDir);
  createDir(path.join(outputDir, 'models'));
  createDir(path.join(outputDir, 'target'));
  createDir(path.join(outputDir, 'seeds'));
  createDir(path.join(outputDir, 'tests'));

  addExtraColumns(ast, providerConfig);

  logInfo(`Generating DBT project file..`);
  generateDbtProject(ast, outputDir, destinationConfig);

  logInfo(`Generating seed files..`);
  generateSeeds(ast, outputDir);

  logInfo(`Generating sample DBT profiles file..`);
  fs.writeFileSync(
    path.join(outputDir, 'profiles.yml'),
    yaml.dump(destinationConfig.generateDBTProfile(ast))
  );

  logInfo(`Generating Sources..`);
  generateSourcesYaml(ast, outputDir, destinationConfig);

  logInfo(`Generating DBT models..`);
  generateStagingModels(ast, outputDir);

  logInfo(`Generating documentation..`);
  generateConfigYaml(ast, outputDir);
  logInfo(`:sparkles: DBT models are generated successfully!`);
}
