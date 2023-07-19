/* eslint-disable @typescript-eslint/no-unused-vars */
import { SyftEventType } from '@syftdata/client';
import * as mockfs from 'mock-fs';
import * as fs from 'fs';
import * as path from 'path';
import { generate } from '../../../src/codegen/generators/dbt_generator';
import { type Field, type AST } from '@syftdata/common/lib/types';
import { type ProviderConfig } from '../../../src/config/sink_configs';
import { getZodTypeForSchema } from '@syftdata/codehandler';

const TEST_FIELDS: Field[] = [
  {
    name: 'backgrounded',
    type: {
      name: 'boolean',
      zodType: 'z.boolean()',
      isArray: false
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
      },
      sinks: [
        {
          id: 'testSink',
          type: 'bigquery',
          config: {
            dataset: 'testDataset',
            projectId: 'testProject'
          }
        }
      ],
      inputs: []
    };
    const providerConfig: ProviderConfig = {
      sdkType: 'Segment'
    };
    generate(ast, 'dbt', providerConfig);
    // now read project file and models from fs.
    expect(
      fs.readFileSync(path.join('dbt', 'testSink', 'dbt_project.yml'), 'utf8')
    ).toMatchSnapshot();
    expect(
      fs.readFileSync(path.join('dbt', 'testSink', 'profiles.yml'), 'utf8')
    ).toMatchSnapshot();
    // creates a model directory with sources and staging models.
    // expect(
    //   fs.readFileSync(
    //     path.join('dbt', 'testSink', 'models', 'schema.yml'),
    //     'utf8'
    //   )
    // ).toMatchSnapshot();
    expect(
      fs.readFileSync(
        path.join('dbt', 'testSink', 'models', 'syft.yml'),
        'utf8'
      )
    ).toMatchSnapshot();
    // expect(
    //   fs.readdirSync(path.join('dbt', 'testSink', 'models')).length
    // ).toEqual(2);
  });

  it('with dbt parses an event with Segment', async () => {
    mockfs();
    const ast: AST = {
      eventSchemas: [
        {
          name: 'TestEvent',
          fields: TEST_FIELDS,
          eventType: SyftEventType.PAGE,
          exported: true,
          zodType: TEST_ZOD_TYPE
        }
      ],
      config: {
        projectName: 'test',
        version: '1.0.0'
      },
      sinks: [
        {
          id: 'testSink',
          type: 'bigquery',
          config: {
            dataset: 'testDataset',
            projectId: 'testProject'
          }
        }
      ],
      inputs: []
    };
    const providerConfig: ProviderConfig = {
      sdkType: 'segment'
    };
    generate(ast, 'dbt', providerConfig);
    // now read project file and models from fs.
    expect(
      fs.readFileSync(path.join('dbt', 'testSink', 'dbt_project.yml'), 'utf8')
    ).toMatchSnapshot();
    expect(
      fs.readFileSync(path.join('dbt', 'testSink', 'profiles.yml'), 'utf8')
    ).toMatchSnapshot();
    // expect(
    //   fs.readdirSync(path.join('dbt', 'testSink', 'models')).length
    // ).toEqual(3);
    // expect(
    //   fs.readFileSync(
    //     path.join('dbt', 'testSink', 'models', 'stg_test_event.sql'),
    //     'utf8'
    //   )
    // ).toMatchSnapshot();
    // expect(
    //   fs.readFileSync(
    //     path.join('dbt', 'testSink', 'models', 'schema.yml'),
    //     'utf8'
    //   )
    // ).toMatchSnapshot();
    expect(
      fs.readFileSync(
        path.join('dbt', 'testSink', 'models', 'syft.yml'),
        'utf8'
      )
    ).toMatchSnapshot();
  });

  it('with dbt parses an event with HeapIO', async () => {
    mockfs();
    const ast: AST = {
      eventSchemas: [
        {
          name: 'TestEvent',
          fields: TEST_FIELDS,
          eventType: SyftEventType.PAGE,
          exported: true,
          zodType: TEST_ZOD_TYPE
        }
      ],
      config: {
        projectName: 'test',
        version: '1.0.0'
      },
      sinks: [
        {
          id: 'testSink',
          type: 'bigquery',
          config: {
            dataset: 'testDataset',
            projectId: 'testProject'
          }
        }
      ],
      inputs: []
    };
    const providerConfig: ProviderConfig = {
      sdkType: 'heap',
      platform: 'Web'
    };
    generate(ast, 'dbt', providerConfig);
    // now read project file and models from fs.
    expect(
      fs.readFileSync(path.join('dbt', 'testSink', 'dbt_project.yml'), 'utf8')
    ).toMatchSnapshot();
    expect(
      fs.readFileSync(path.join('dbt', 'testSink', 'profiles.yml'), 'utf8')
    ).toMatchSnapshot();
    // expect(
    //   fs.readdirSync(path.join('dbt', 'testSink', 'models')).length
    // ).toEqual(3);
    // expect(
    //   fs.readFileSync(
    //     path.join('dbt', 'testSink', 'models', 'stg_test_event.sql'),
    //     'utf8'
    //   )
    // ).toMatchSnapshot();
    // expect(
    //   fs.readFileSync(
    //     path.join('dbt', 'testSink', 'models', 'schema.yml'),
    //     'utf8'
    //   )
    // ).toMatchSnapshot();
    expect(
      fs.readFileSync(
        path.join('dbt', 'testSink', 'models', 'syft.yml'),
        'utf8'
      )
    ).toMatchSnapshot();
  });
  it('with dbt parses an event with Syft', async () => {
    mockfs();
    const ast: AST = {
      eventSchemas: [
        {
          name: 'TestEvent',
          fields: TEST_FIELDS,
          eventType: SyftEventType.PAGE,
          exported: true,
          zodType: TEST_ZOD_TYPE
        }
      ],
      config: {
        projectName: 'test',
        version: '1.0.0'
      },
      sinks: [
        {
          id: 'testSink',
          type: 'bigquery',
          config: {
            dataset: 'testDataset',
            projectId: 'testProject'
          }
        }
      ],
      inputs: []
    };
    const providerConfig: ProviderConfig = {
      sdkType: 'syft'
    };
    generate(ast, 'dbt', providerConfig);
    // now read project file and models from fs.
    expect(
      fs.readFileSync(path.join('dbt', 'testSink', 'dbt_project.yml'), 'utf8')
    ).toMatchSnapshot();
    expect(
      fs.readFileSync(path.join('dbt', 'testSink', 'profiles.yml'), 'utf8')
    ).toMatchSnapshot();
    // expect(
    //   fs.readdirSync(path.join('dbt', 'testSink', 'models')).length
    // ).toEqual(3);
    // expect(
    //   fs.readFileSync(
    //     path.join('dbt', 'testSink', 'models', 'stg_test_event.sql'),
    //     'utf8'
    //   )
    // ).toMatchSnapshot();
    // expect(
    //   fs.readFileSync(
    //     path.join('dbt', 'testSink', 'models', 'schema.yml'),
    //     'utf8'
    //   )
    // ).toMatchSnapshot();
    expect(
      fs.readFileSync(
        path.join('dbt', 'testSink', 'models', 'syft.yml'),
        'utf8'
      )
    ).toMatchSnapshot();
  });
});
