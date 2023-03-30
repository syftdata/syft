import * as yargs from 'yargs';
import * as fs from 'fs';
import * as mockfs from 'mock-fs';
import { setupCLICommonParams } from '../../src/cli';
import * as path from 'path';

function setupMockFS(): void {
  mockfs({
    syft: {
      'events.ts': mockfs.load(
        path.resolve(__dirname, '../test_schema/single_event/events.ts'),
        {}
      ),
      'config.ts': mockfs.load(
        path.resolve(__dirname, '../../assets/config.ts'),
        {}
      ),
      lint: mockfs.load(path.resolve(__dirname, '../../assets/lint/'), {})
    }
  });
}

afterEach(() => {
  mockfs.restore();
});

const parser = setupCLICommonParams(yargs);
// eslint-disable-next-line @typescript-eslint/no-var-requires
parser.command(require('../../src/commands/publish'));

describe('publish', () => {
  it('publish increments the version number', async () => {
    setupMockFS();
    await parser.parse('publish --apikey abcd');
    const fileContents = fs.readFileSync('syft/events.ts', 'utf8');
    expect(fileContents).toMatchSnapshot();
  });
});
