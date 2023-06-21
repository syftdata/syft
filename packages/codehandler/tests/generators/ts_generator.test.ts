/* eslint-disable @typescript-eslint/no-unused-vars */
import { SyftEventType } from '@syftdata/client';
import { generateSource } from '../../src/generators/ts_generator';
import { type Field, type AST } from '@syftdata/common/lib/types';
import { getZodTypeForSchema } from '@syftdata/codehandler';

const TEST_FIELDS: Field[] = [
  {
    name: 'backgrounded',
    type: {
      name: 'boolean',
      zodType: 'z.boolean()'
    },
    isOptional: false
  },
  {
    name: 'has_focus',
    type: {
      name: 'boolean',
      zodType: 'z.boolean()'
    },
    defaultValue: 'false',
    isOptional: true
  }
];

const TEST_ZOD_TYPE: string = getZodTypeForSchema(TEST_FIELDS);

describe('generate', () => {
  it('with ts parses an empty schema file', async () => {
    const ast: AST = {
      eventSchemas: [],
      config: {
        projectName: 'test',
        version: '1.0.0'
      }
    };
    expect(generateSource(ast)).toMatchSnapshot();
  });

  it('with ts parses an event that is not exported', async () => {
    const ast: AST = {
      eventSchemas: [
        {
          name: 'TestEvent',
          fields: TEST_FIELDS,
          traits: [],
          eventType: SyftEventType.PAGE,
          exported: false,
          zodType: TEST_ZOD_TYPE
        }
      ],
      config: {
        projectName: 'test',
        version: '1.0.0'
      }
    };
    expect(generateSource(ast)).toMatchSnapshot();
  });

  it('with ts parses an event that is exported', async () => {
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
    expect(generateSource(ast)).toMatchSnapshot();
  });
});
