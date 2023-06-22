import * as yargs from 'yargs';
import * as mockfs from 'mock-fs';
import * as fs from 'fs';
import * as path from 'path';
import { setupCLICommonParams } from '../../src/cli';

const parser = setupCLICommonParams(yargs);
// eslint-disable-next-line @typescript-eslint/no-var-requires
parser.command(require('../../src/commands/init'));

function setupMockFS(pkgLocation: string, srcLocation: string): void {

  mockfs({
    assets: mockfs.load(path.resolve(__dirname, '../../assets'), {
      recursive: true,
      lazy: false
    }),
    'package.json': mockfs.load(path.resolve(__dirname, pkgLocation), {
      recursive: true,
      lazy: false
    }),
    src: mockfs.load(path.resolve(__dirname, srcLocation))
  });
}

afterEach(() => {
  mockfs.restore();
});

describe('init', () => {
  it('init infers input folder and creates', async () => {
    setupMockFS('../test_package/package.testoneprovider.json', '../test_package/');
    await parser.parse('init');
    const files = fs.readdirSync('syft');
    expect(files).toContainEqual('config.ts');
    expect(files).toContainEqual('events.ts');
    const syftFileContent = fs.readFileSync(path.join('src', 'syft.ts'), 'utf8');
    expect(syftFileContent).toEqual(
      'import Syft, { AmplitudePlugin } from \'@syftdata/client\'\n' +
      'export const syft = new Syft({\n' +
      '  appVersion: \'1.0.0\',\n' +
      '  plugins: [new AmplitudePlugin()]\n' +
      '});\n' +
      'export default syft;\n');
  });

  it('init works with custom input folder', async () => {
    setupMockFS('../test_package/package.testoneprovider.json', '../test_package/');
    await parser.parse('init --outDir custom');
    const files = fs.readdirSync('custom');
    expect(files).toContainEqual('config.ts');
    const syftFileContent = fs.readFileSync(path.join('src', 'syft.ts'), 'utf8');
    expect(syftFileContent).toEqual(
      'import Syft, { AmplitudePlugin } from \'@syftdata/client\'\n' +
      'export const syft = new Syft({\n' +
      '  appVersion: \'1.0.0\',\n' +
      '  plugins: [new AmplitudePlugin()]\n' +
      '});\n' +
      'export default syft;\n');
  });

  it('init creates syft file with multiple plugins when package.json has multiple supported', async () => {
    setupMockFS('../test_package/package.testtwoprovider.json', '../test_package/');
    await parser.parse('init');
    const syftFileContent = fs.readFileSync(path.join('src', 'syft.ts'), 'utf8');
    expect(syftFileContent).toEqual(
      'import Syft, {\n' +
      '  AmplitudePlugin,\n' +
      '  GA4Plugin\n' +
      '} from \'@syftdata/client\'\n' +
      'export const syft = new Syft({\n' +
      '  appVersion: \'1.0.0\',\n' +
      '  plugins: [\n' +
      '    new AmplitudePlugin(),\n' +
      '    new GA4Plugin()\n' +
      '  ]\n' +
      '});\n' +
      'export default syft;\n');
  });

  it('init does not create syft file when package.json does not include any supported', async () => {
    setupMockFS('../test_package/package.testnoprovider.json', '../test_package/');
    await parser.parse('init');
    const srcFiles = fs.readdirSync('src');
    expect(srcFiles).not.toContainEqual('syft.ts');
  });

  it('init does not create syft file if it already exists', async () => {
    setupMockFS('../test_package/package.testtwoprovider.json', '../test_package/srcWithSyft');
    await parser.parse('init');
    const syftFileContent = fs.readFileSync(path.join('src', 'syft.ts'), 'utf8');
    expect(syftFileContent).toEqual('//NOT CHANGED');
  });

  it('init --force overwrites syft file', async () => {
    setupMockFS('../test_package/package.testoneprovider.json', '../test_package/srcWithSyft');
    await parser.parse('init --force');
    const syftFileContent = fs.readFileSync(path.join('src', 'syft.ts'), 'utf8');
    expect(syftFileContent).toEqual(
      'import Syft, { AmplitudePlugin } from \'@syftdata/client\'\n' +
      'export const syft = new Syft({\n' +
      '  appVersion: \'1.0.0\',\n' +
      '  plugins: [new AmplitudePlugin()]\n' +
      '});\n' +
      'export default syft;\n');
  });
});
