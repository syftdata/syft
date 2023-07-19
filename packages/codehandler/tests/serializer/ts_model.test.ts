import { SyftEventType } from '@syftdata/client';
import { serialize } from '../../src/serializer/ts_model';

describe('serialize', () => {
  it('serialize regular primitive and syft types', async () => {
    const ast = {
      eventSchemas: [
        {
          name: 'TestEvent',
          eventType: SyftEventType.TRACK,
          documentation: 'This is a test event with two fields',
          fields: [
            {
              name: 'test',
              type: {
                name: 'string',
                zodType: 'z.string()',
                isArray: false
              },
              documentation: 'This is a test field',
              isOptional: false
            },
            {
              name: 'email',
              type: {
                name: 'string',
                syfttype: 'Email',
                zodType: 'z.string().email()',
                isArray: false
              },
              isOptional: false
            }
          ],
          exported: true,
          zodType: ''
        }
      ],
      config: {
        projectName: 'test',
        version: '1.0.0'
      },
      sinks: [],
      inputs: []
    };
    expect(serialize(ast)).toMatchSnapshot();
  });
});
