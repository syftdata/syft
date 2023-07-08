/* eslint-disable @typescript-eslint/no-unused-vars */
import { SyftEventType } from '@syftdata/client';
import * as mockfs from 'mock-fs';
import * as fs from 'fs';
import * as path from 'path';
import { generate } from '../../../src/codegen/generators/dbt_generator';
import { type Field, type AST } from '@syftdata/common/lib/types';
import {
  BQConfig,
  type ProviderConfig
} from '../../../src/config/sink_configs';
import { getZodTypeForSchema } from '@syftdata/codehandler';

const TEST_FIELDS: Field[] = [
  {
    name: 'backgrounded',
    type: {
      name: 'boolean',
      zodType: 'z.boolean()'
    },
    isOptional: false
  }
];
const TEST_ZOD_TYPE: string = getZodTypeForSchema(TEST_FIELDS);

afterEach(() => {
  mockfs.restore();
});

describe('generate', () => {
  it('with dbt parses an empty schema file', async () => {
    mockfs();
    const ast: AST = {
      eventSchemas: [],
      config: {
        projectName: 'test',
        version: '1.0.0'
      }
    };
    const bqConfig = new BQConfig('testProject', 'testDataset');
    const providerConfig: ProviderConfig = {
      destination: 'Segment'
    };
    generate(ast, 'dbt', bqConfig, providerConfig);
    // now read project file and models from fs.
    expect(
      fs.readFileSync(path.join('dbt', 'dbt_project.yml'), 'utf8')
    ).toMatchSnapshot();
    expect(
      fs.readFileSync(path.join('dbt', 'profiles.yml'), 'utf8')
    ).toMatchSnapshot();
    // creates a model directory with sources and staging models.
    expect(
      fs.readFileSync(path.join('dbt', 'models', 'schema.yml'), 'utf8')
    ).toMatchSnapshot();
    expect(
      fs.readFileSync(path.join('dbt', 'models', 'syft.yml'), 'utf8')
    ).toMatchSnapshot();
    expect(fs.readdirSync(path.join('dbt', 'models')).length).toEqual(2);
  });

  it('with dbt parses an event with Segment', async () => {
    mockfs();
    const ast: AST = {
      eventSchemas: [
        {
          name: 'TestEvent',
          fields: TEST_FIELDS,
          traits: [],
          eventType: SyftEventType.PAGE,
          exported: true,
          zodType: TEST_ZOD_TYPE
        }
      ],
      config: {
        projectName: 'test',
        version: '1.0.0'
      }
    };
    const bqConfig = new BQConfig('testProject', 'testDataset');
    const providerConfig: ProviderConfig = {
      destination: 'segment'
    };
    generate(ast, 'dbt', bqConfig, providerConfig);
    // now read project file and models from fs.
    expect(
      fs.readFileSync(path.join('dbt', 'dbt_project.yml'), 'utf8')
    ).toMatchSnapshot();
    expect(
      fs.readFileSync(path.join('dbt', 'profiles.yml'), 'utf8')
    ).toMatchSnapshot();
    expect(fs.readdirSync(path.join('dbt', 'models')).length).toEqual(3);
    expect(
      fs.readFileSync(path.join('dbt', 'models', 'stg_test_event.sql'), 'utf8')
    ).toMatchSnapshot();
    expect(
      fs.readFileSync(path.join('dbt', 'models', 'schema.yml'), 'utf8')
    ).toMatchSnapshot();
    expect(
      fs.readFileSync(path.join('dbt', 'models', 'syft.yml'), 'utf8')
    ).toMatchSnapshot();
  });

  it('with dbt parses an event with HeapIO', async () => {
    mockfs();
    const ast: AST = {
      eventSchemas: [
        {
          name: 'TestEvent',
          fields: TEST_FIELDS,
          traits: [],
          eventType: SyftEventType.PAGE,
          exported: true,
          zodType: TEST_ZOD_TYPE
        }
      ],
      config: {
        projectName: 'test',
        version: '1.0.0'
      }
    };
    const bqConfig = new BQConfig('testProject', 'testDataset');
    const providerConfig: ProviderConfig = {
      destination: 'heap',
      platform: 'Web'
    };
    generate(ast, 'dbt', bqConfig, providerConfig);
    // now read project file and models from fs.
    expect(
      fs.readFileSync(path.join('dbt', 'dbt_project.yml'), 'utf8')
    ).toMatchSnapshot();
    expect(
      fs.readFileSync(path.join('dbt', 'profiles.yml'), 'utf8')
    ).toMatchSnapshot();
    expect(fs.readdirSync(path.join('dbt', 'models')).length).toEqual(3);
    expect(
      fs.readFileSync(path.join('dbt', 'models', 'stg_test_event.sql'), 'utf8')
    ).toMatchSnapshot();
    expect(
      fs.readFileSync(path.join('dbt', 'models', 'schema.yml'), 'utf8')
    ).toMatchSnapshot();
    expect(
      fs.readFileSync(path.join('dbt', 'models', 'syft.yml'), 'utf8')
    ).toMatchSnapshot();
  });
  it('with dbt parses an event with Syft', async () => {
    mockfs();
    const ast: AST = {
      eventSchemas: [
        {
          name: 'TestEvent',
          fields: TEST_FIELDS,
          traits: [],
          eventType: SyftEventType.PAGE,
          exported: true,
          zodType: TEST_ZOD_TYPE
        }
      ],
      config: {
        projectName: 'test',
        version: '1.0.0'
      }
    };
    const bqConfig = new BQConfig('testProject', 'testDataset');
    const providerConfig: ProviderConfig = {
      destination: 'syft'
    };
    generate(ast, 'dbt', bqConfig, providerConfig);
    // now read project file and models from fs.
    expect(
      fs.readFileSync(path.join('dbt', 'dbt_project.yml'), 'utf8')
    ).toMatchSnapshot();
    expect(
      fs.readFileSync(path.join('dbt', 'profiles.yml'), 'utf8')
    ).toMatchSnapshot();
    expect(fs.readdirSync(path.join('dbt', 'models')).length).toEqual(3);
    expect(
      fs.readFileSync(path.join('dbt', 'models', 'stg_test_event.sql'), 'utf8')
    ).toMatchSnapshot();
    expect(
      fs.readFileSync(path.join('dbt', 'models', 'schema.yml'), 'utf8')
    ).toMatchSnapshot();
    expect(
      fs.readFileSync(path.join('dbt', 'models', 'syft.yml'), 'utf8')
    ).toMatchSnapshot();
  });
});
