/* eslint-disable @typescript-eslint/no-unused-vars */
import { SyftEventType } from '@syftdata/client';
import { CodeBlockWriter } from 'ts-morph';
import { generateSource } from '../../../src/codegen/generators/ts_generator';
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
    isOptional: true,
    defaultValue: 'false'
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
    const writer: CodeBlockWriter = new CodeBlockWriter();
    generateSource(ast, writer);
    expect(writer.toString()).toMatchSnapshot();
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
    const writer: CodeBlockWriter = new CodeBlockWriter();
    generateSource(ast, writer);
    expect(writer.toString()).toMatchSnapshot();
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
    const writer: CodeBlockWriter = new CodeBlockWriter();
    generateSource(ast, writer);
    expect(writer.toString()).toMatchSnapshot();
  });
  // it('says generate with the right name, after asking it if not provided', async () => {
  //   await runWithAnswers(() => generate({}), ['gabro', ENTER]);
  //   expect(renderQuestion.mock.calls[0][0]).toMatchSnapshot();
  //   expect(logInfo).toHaveBeenCalledTimes(2);
  //   expect(logInfo.mock.calls[0][0]).toMatchSnapshot();
  //   expect(logInfo.mock.calls[1][0]).toMatchSnapshot();
  // });

  // it('says generate with the right name, without asking it if provided', async () => {
  //   await runWithAnswers(() => generate({ name: 'gabro' }));
  //   expect(renderQuestion).not.toHaveBeenCalled();
  //   expect(logInfo).toHaveBeenCalledTimes(1);
  //   expect(logInfo.mock.calls[0][0]).toMatchSnapshot();
  // });
});
