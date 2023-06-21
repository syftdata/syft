/* eslint-disable @typescript-eslint/no-unused-vars */
import { analyzeAST } from '../../src/analyzers/index';
import { createTSProject } from '../../src/deserializer/ts_model';

describe('analyze source code', () => {
  it('finds amplitude usages', async () => {
    const proj = createTSProject(['./tests/test_project/']);
    const ast = analyzeAST(proj);

    // expect(ast.eventSchemas).toHaveLength(4);
    expect(JSON.stringify(ast?.eventSchemas, null, 2)).toMatchSnapshot();
  });
});
