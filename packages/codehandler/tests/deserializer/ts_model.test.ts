/* eslint-disable @typescript-eslint/no-unused-vars */
import { deserialize } from '../../src/deserializer/ts_model';

describe('generateASTForProject', () => {
  it('with event annotations', async () => {
    const ast = deserialize(['./tests/test_schema/single_event']);

    expect(ast).toBeDefined();
    expect(ast?.eventSchemas.length).toBe(1);
    expect(JSON.stringify(ast?.eventSchemas, null, 2)).toMatchSnapshot();
  });

  it('with multiple schemas', async () => {
    const ast = deserialize(['./tests/test_schema/multiple_events']);
    expect(ast).toBeDefined();
    expect(ast?.eventSchemas.length).toBe(8);
    expect(JSON.stringify(ast?.eventSchemas, null, 2)).toMatchSnapshot();
  });
});
