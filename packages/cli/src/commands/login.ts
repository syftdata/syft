import { logInfo } from '../utils';
import { prompt as ask } from 'inquirer';
import * as yargs from 'yargs'; // eslint-disable-line @typescript-eslint/no-unused-vars

async function askPassword(): Promise<string> {
  const { secret } = await ask([
    {
      type: 'password',
      name: 'secret',
      message: 'password:',
      mask: '*'
    }
  ]);
  return secret;
}

export interface Params {
  email: string;
}
export const command = 'login <email>';
export const desc = 'Login to Syft Cloud';
export async function handler({ email }: Params): Promise<void> {
  const password = await askPassword(); // eslint-disable-line @typescript-eslint/no-unused-vars
  logInfo(`Logged in as ${email}!`);
}
