import * as yargs from 'yargs';
import * as compiler from '../../src/codegen/compiler';
import * as ts_generator from '../../src/codegen/generators/ts_generator';
import * as go_generator from '../../src/codegen/generators/go_generator';
import { setupCLICommonParams } from '../../src/cli';

// silence outputs
jest.mock('../../src/codegen/compiler');
jest.mock('../../src/codegen/generators/ts_generator');
jest.mock('../../src/codegen/generators/go_generator');

const generateAST = jest.spyOn(compiler, 'generateAST');
const generateTS = jest.spyOn(ts_generator, 'generate');
const generateGO = jest.spyOn(go_generator, 'generate');
generateAST.mockImplementation(() => {
  return {
    eventSchemas: [],
    config: {
      projectName: 'test',
      version: '1.0.0'
    }
  };
});

afterEach(() => {
  generateAST.mockClear();
  generateTS.mockClear();
  generateGO.mockClear();
});

const parser = setupCLICommonParams(yargs);
// eslint-disable-next-line @typescript-eslint/no-var-requires
parser.command(require('../../src/commands/generate'));

/* eslint-disable @typescript-eslint/no-unused-vars */
describe('generate', () => {
  it('generate infers lang and input folder', async () => {
    await parser.parse('generate --verbose');
    expect(generateAST).toHaveBeenCalledTimes(1);
    expect(generateAST.mock.calls[0][0]).toContain('syft');
    expect(generateTS).toHaveBeenCalledTimes(1);
  });

  it('generate lang and schema folder can be provided', async () => {
    await parser.parse('generate ts --input myschema');
    expect(generateAST).toHaveBeenCalledTimes(1);
    expect(generateAST.mock.calls[0][0]).toContain('myschema');
    // expect(generateGO).toHaveBeenCalledTimes(1);
  });
});
