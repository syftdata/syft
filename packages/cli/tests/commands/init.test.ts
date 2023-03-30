import * as yargs from 'yargs';
import * as mockfs from 'mock-fs';
import * as fs from 'fs';
import * as path from 'path';
import { setupCLICommonParams } from '../../src/cli';

const parser = setupCLICommonParams(yargs);
// eslint-disable-next-line @typescript-eslint/no-var-requires
parser.command(require('../../src/commands/init'));

function setupMockFS(): void {
  mockfs({
    assets: mockfs.load(path.resolve(__dirname, '../../assets'), {
      recursive: true,
      lazy: false
    })
  });
}

afterEach(() => {
  mockfs.restore();
});

describe('init', () => {
  it('init infers input folder and creates', async () => {
    setupMockFS();
    await parser.parse('init');
    const files = fs.readdirSync('syft');
    expect(files).toContainEqual('config.ts');
    expect(files).toContainEqual('events.ts');
  });

  it('init works with custom input folder', async () => {
    setupMockFS();
    await parser.parse('init --outDir custom');
    const files = fs.readdirSync('custom');
    expect(files).toContainEqual('config.ts');
  });
});
