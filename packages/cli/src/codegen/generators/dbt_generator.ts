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
  getDestinationConfig,
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

function generateSourcesYaml(
  ast: AST,
  destinationDir: string,
  destinationConfig: DestinationConfig
): void {
  const schemas = ast.eventSchemas.filter((val) => !ignoreSchema(val));
  const tables = schemas.map((val) => getSource(val));
  // create source file.
  fs.writeFileSync(
    path.join(destinationDir, 'models', 'syft.yml'),
    yaml.dump({
      version: 2,
      sources: [
        {
          ...destinationConfig.getSource(),
          name: destinationConfig.sink.id,
          description: 'Loaded from Syft',
          tables
        }
      ]
    })
  );
}

// function generateConfigYaml(ast: AST, destinationDir: string): void {
//   const models = ast.eventSchemas
//     .filter((val) => !ignoreSchema(val))
//     .map((val) => getModel(val));

//   fs.writeFileSync(
//     path.join(destinationDir, 'models', 'schema.yml'),
//     yaml.dump({
//       version: 2,
//       models
//     })
//   );
// }

// function generateColumns(schema: EventSchema): string {
//   return schema.fields
//     .map((field) => {
//       const name = field.name;
//       if (name === name.toLowerCase()) return name;
//       return `"${name}"`;
//     })
//     .join(', ');
// }

// function getModelName(eventName: string): string {
//   const sqlName = getSQLFriendlyEventName(eventName);
//   return `stg_${sqlName}`;
// }

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
// function getModel(schema: EventSchema) {
//   const eventName = getSQLFriendlyEventName(schema.name);
//   const modelName = getModelName(eventName);
//   return {
//     name: modelName,
//     description: schema.documentation,
//     columns: schema.fields.map((field) => getColumn(field))
//   };
// }

// function generateModel(schema: EventSchema): string {
//   const sqlName = getSQLFriendlyEventName(schema.name);
//   return `
// SELECT

// ${generateColumns(schema)}

// FROM {{ source ('syft', '${sqlName}') }}`;
// }

// function generateStagingModels(ast: AST, destinationDir: string): void {
//   ast.eventSchemas.forEach((schema) => {
//     if (ignoreSchema(schema)) return;
//     fs.writeFileSync(
//       path.join(destinationDir, 'models', `${getModelName(schema.name)}.sql`),
//       generateModel(schema)
//     );
//   });
// }

function getColumnTypesForSeed(
  dest: DestinationConfig,
  schema: EventSchema
): object {
  return schema.fields.reduce((acc, field) => {
    acc[field.name] = dest.getColumnType(field);
    return acc;
  }, {});
}

function generateSeeds(
  ast: AST,
  dest: DestinationConfig,
  outputDir: string
): void {
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
            column_types: getColumnTypesForSeed(dest, val)
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
  profileName: string
): void {
  const projectName = ast.config.projectName;
  const data = {
    name: projectName.replace(/\s+/g, '_').toLowerCase(),
    version: ast.config?.version ?? '0.0.1',
    'config-version': 2,
    profile: profileName,
    'model-paths': ['models'],
    'test-paths': ['tests'],
    'seed-paths': ['seeds'],
    'target-path': 'target',
    'clean-targets': ['target', 'dbt_packages']
  };
  fs.writeFileSync(path.join(outputDir, 'dbt_project.yml'), yaml.dump(data));
}

export function generateForSink(
  ast: AST,
  parentDir: string,
  destinationConfig: DestinationConfig,
  providerConfig: ProviderConfig
): void {
  const outputDir = path.join(parentDir, destinationConfig.sink.id);
  createDir(outputDir);
  createDir(path.join(outputDir, 'models'));
  createDir(path.join(outputDir, 'target'));
  createDir(path.join(outputDir, 'seeds'));
  createDir(path.join(outputDir, 'tests'));

  addExtraColumns(ast, providerConfig);

  logInfo(`Generating seed files..`);
  generateSeeds(ast, destinationConfig, outputDir);

  logInfo(`Generating DBT profiles file..`);
  const PROFILE_NAME = 'default';
  const profiles = {
    [PROFILE_NAME]: {
      target: 'dev',
      outputs: {
        dev: destinationConfig.generateDBTProfile(ast)
      }
    }
  };
  fs.writeFileSync(path.join(outputDir, 'profiles.yml'), yaml.dump(profiles));

  logInfo(`Generating DBT project file`);
  generateDbtProject(ast, outputDir, PROFILE_NAME);

  logInfo(`Generating Sources`);
  generateSourcesYaml(ast, outputDir, destinationConfig);

  // logInfo(`Generating DBT models..`);
  // generateStagingModels(ast, outputDir);
  // logInfo(`Generating documentation..`);
  // generateConfigYaml(ast, outputDir);
}

export function generate(
  ast: AST,
  outputDir: string,
  providerConfig: ProviderConfig
): void {
  const destinationConfigs = ast.sinks
    .map((sink) => getDestinationConfig(sink))
    .filter((val) => val != null) as DestinationConfig[];

  if (destinationConfigs.length === 0) {
    logInfo(
      'No valid sinks found. We support BigQuery, Snowflake and Postgres only.'
    );
    return;
  }

  destinationConfigs.forEach((destinationConfig) => {
    generateForSink(ast, outputDir, destinationConfig, providerConfig);
  });
  logInfo(`:sparkles: DBT models are generated successfully!`);
}
