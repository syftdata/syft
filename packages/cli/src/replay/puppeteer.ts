import { createRunner, parse } from '@puppeteer/replay';
import puppeteer, { type Browser } from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';
import { VerifyExtension } from './verify';
import { getEventNameFrom } from './utils';
import { glob } from 'glob';
import { logDetail, logError, logInfo } from '../utils';

async function getBrowser(headless: boolean): Promise<Browser> {
  const extensionsFolder: string = path.join(
    __dirname,
    '../../assets/chrome-extensions/react-devtools'
  );
  const a = await puppeteer.launch({
    headless: headless ? 'new' : false,
    devtools: true,
    args: [
      `--disable-extensions-except=${extensionsFolder}`,
      `--load-extension=${extensionsFolder}`
    ]
  });
  return a;
}

export async function verifyPuppeteerTest(
  filePath: string,
  headless: boolean
): Promise<boolean> {
  const recordingText = fs.readFileSync(filePath, 'utf8');
  // Validate & parse the file.
  const flow = parse(JSON.parse(recordingText));

  const browser = await getBrowser(headless);
  const page = await browser.newPage();
  const extension = new VerifyExtension(browser, page, { timeout: 10000 });
  const runner = await createRunner(flow, extension);

  await runner.run();
  await browser.close();

  const failedSteps = extension.failedEvents;
  if (failedSteps.length === 0) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    logInfo(`:heavy_check_mark: ${flow?.title ?? ''} completed.`);
  } else {
    logError(
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      `${flow?.title ?? 'Test'} failed with invalid instrumentation`
    );
    logDetail(
      `You could try using syft auto instrumentation. "npx syft instrument --help"`
    );
  }
  return failedSteps.length === 0;
}

export function getEventsFromPuppeteerTest(dirPath: string): string[] {
  const events = [] as string[];
  const files = glob.sync(`${dirPath}/**/*`, {
    nodir: true
  });
  files.forEach((filePath) => {
    const recordingText = fs.readFileSync(filePath, 'utf8');
    // Validate & parse the file.
    const recording = parse(JSON.parse(recordingText));
    for (let i = 0; i < recording.steps.length; i++) {
      if (i > 0) {
        const eventName = getEventNameFrom(recording.steps[i]);
        if (eventName != null) {
          if (!(eventName in events)) {
            events.push(eventName);
          }
        }
      }
    }
  });
  return events;
}
