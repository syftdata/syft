#!/usr/bin/env node
import * as yargs from 'yargs';
import { setupCLICommonParams } from './cli';

const cli = setupCLICommonParams(yargs);
cli
  .commandDir('commands', {
    recurse: true,
    exclude: (path) => {
      return path.includes('login') || path.includes('publish');
    },
    extensions: ['js', 'ts']
  })
  .demandCommand(1)
  .wrap(72)
  .version()
  .help();
void cli.argv;
