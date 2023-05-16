import { SyftEventType } from '@syftdata/client';
import { serialize } from '../../src/serializer/ts_model';

describe('serialize', () => {
  it('with ts parses an empty schema file', async () => {
    const ast = {
      eventSchemas: [
        {
          name: 'TestEvent',
          eventType: SyftEventType.TRACK,
          fields: [
            {
              name: 'test',
              type: {
                name: 'string',
                zodType: 'z.string()'
              },
              isOptional: false
            },
            {
              name: 'email',
              type: {
                name: 'string',
                zodType: 'z.string().email()'
              },
              syfttype: 'Email',
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
      }
    };
    expect(serialize(ast)).toMatchSnapshot();
  });
});
