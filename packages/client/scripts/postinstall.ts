import * as path from 'path';
import * as fs from 'fs';
import * as childProcess from 'child_process';

async function run(
  cmd: string,
  params: string[],
  cwd = process.cwd()
): Promise<void> {
  const child = childProcess.spawn(cmd, params, {
    stdio: ['pipe', 'inherit', 'inherit'],
    cwd
  });

  await new Promise<void>((resolve, reject) => {
    child.on('close', () => {
      resolve();
    });
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(code);
      }
    });
    child.on('error', () => {
      reject(new Error('unknown process error'));
    });
  });
}

function copyRecursiveSync(src: string, dest: string): void {
  const exists = fs.existsSync(src);
  const stats = exists ? fs.statSync(src) : null;
  const isDirectory = stats?.isDirectory();
  if (isDirectory === true) {
    fs.mkdirSync(dest);
    fs.readdirSync(src).forEach(function (childItemName) {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

/**
 * Copy the lib into .syft/client folder and generate files in .syft/client.
 * This is required for two reasons:
 * 1. Keep the library fail safe. Our library loads files from .syft/client only.
 * 2. Package managers like pnpm maintain symboling links to the packages.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function copyGeneratedFiles(): Promise<void> {
  try {
    const dotSyftClientDir = path.join(__dirname, '../../../../.syft/client');
    fs.mkdirSync(dotSyftClientDir, { recursive: true });
    copyRecursiveSync(path.join(__dirname, '..'), dotSyftClientDir);
  } catch (e) {
    console.error(e);
  }
}

function getLocalPackagePath(pkg: string): string | null {
  try {
    const packagePath = require.resolve(`${pkg}/package.json`);
    if (packagePath != null) {
      return require.resolve(pkg);
    }
  } catch (e) {} // eslint-disable-line no-empty
  return null;
}

async function main(): Promise<void> {
  if (process.env.INIT_CWD != null) {
    process.chdir(process.env.INIT_CWD); // necessary, because npm chooses __dirname as process.cwd()
    // in the postinstall hook
  }

  // await copyGeneratedFiles();
  const localPath = getLocalPackagePath('@syftdata/cli');
  try {
    if (localPath != null) {
      await run('node', [localPath, 'generate', 'ts']);
    } else {
      console.error("Couldn't find Syft CLI.");
    }
  } catch (e) {
    // if exit code = 1 do not print
    if (e !== 1) {
      console.error(e);
    }
  }
}

if (process.env.SYFT_SKIP_POSTINSTALL_GENERATE == null) {
  main().catch((e) => {
    if (e.stderr != null) {
      console.error(e.stderr);
    } else {
      console.error(e);
    }
    process.exit(0);
  });
}
