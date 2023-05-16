import {
  PuppeteerRunnerExtension,
  type Step,
  type UserFlow
} from '@puppeteer/replay';
import { type Browser, type Page } from 'puppeteer';
import { logInfo } from '../utils';

export class InitExtension extends PuppeteerRunnerExtension {
  private readonly eventSet = new Set<string>();
  private readonly events = new Array<string>();
  private readonly srcDir: string;
  constructor(browser: Browser, page: Page, srcDir: string) {
    super(browser, page);
    this.srcDir = srcDir;
  }

  async beforeEachStep(step: Step, flow?: UserFlow | undefined): Promise<void> {
    if (super.beforeEachStep != null) {
      await super.beforeEachStep(step, flow);
    }
    const instrumentEvent: string = (step as any).instrumentEvent;
    if (instrumentEvent == null) {
      return;
    }
    if (!this.eventSet.has(instrumentEvent)) {
      this.events.push(instrumentEvent);
      this.eventSet.add(instrumentEvent);
    }
  }

  async afterAllSteps(flow?: UserFlow | undefined): Promise<void> {
    logInfo(`Initializing missing events in ${this.srcDir}`);
    // const ast = generateAST([input]);
  }
}
