import * as emoji from 'node-emoji';
import * as chalk from 'chalk';

export const SYFT_DOCUMENTATION = `https://github.com/syftdata/syft/`;
export const FILE_A_BUG = 'https://github.com/syftdata/syft/issues/new';
export const DISCORD_LINK = 'https://discord.gg/2VsD9XsJwK';

const log = console.log; // eslint-disable-line no-console
const logException = console.error; // eslint-disable-line no-console

export const logError = (s: string): void => {
  log(emoji.emojify(chalk.bold.red(s)));
};

export const logUnknownError = (s: string, e: any): void => {
  if (s != null) {
    logError(s);
  }
  logInfo(`We are sorry that you ran into this error.
Please file a bug here: ${FILE_A_BUG}
We hang out on this discord channel: ${DISCORD_LINK}.
`);
  if (e.stack != null) {
    logVerbose(`Stack trace: ${e.stack as string}`);
  }
};

export const logFatal = (s: string): void => {
  logException(s);
  logInfo(`For more details: ${SYFT_DOCUMENTATION}.
We hang out on this discord channel: ${DISCORD_LINK}.`);
};
export const logInfo = (s: string): void => {
  log(emoji.emojify(chalk.bold(s)));
};
export const logDetail = (s: string): void => {
  log(emoji.emojify(chalk.dim(s)));
};

let VERBOSE_ENABLED = false;
export const toggleVerbosity = (val: boolean): void => {
  VERBOSE_ENABLED = val;
};

export const logVerbose = (s: string): void => {
  if (VERBOSE_ENABLED) {
    logDetail(s);
  }
};

export function lowerize(s: string): string {
  return s[0].toLocaleLowerCase() + s.slice(1);
}

export function capitalize(s: string): string {
  return s[0].toLocaleUpperCase() + s.slice(1);
}

/** Used to match words composed of alphanumeric characters. */
// eslint-disable-next-line no-control-regex
const reAsciiWord = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g;
export function asciiWords(val: string): string[] {
  return val.replace(/['\u2019]/g, '').match(reAsciiWord) ?? [];
}

export function getHumanizedEventName(name: string): string {
  return asciiWords(name).map(capitalize).join(' ');
}

export function getSQLFriendlyEventName(name: string): string {
  return lowerize(name)
    .replace(/([A-Z])/g, '_$1')
    .toLocaleLowerCase();
}

export function isEmptyString(value: string | null | undefined): boolean {
  return value == null || value.trim().length === 0;
}
