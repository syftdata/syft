import {
  PuppeteerRunnerExtension,
  type Step,
  type UserFlow
} from '@puppeteer/replay';
import { logError, logInfo, logVerbose } from '@syftdata/common/lib/utils';
import { getEventNameFrom, isSyftStep } from './utils';
import { getSyftEvents, getSyftTester } from './browser_funcs';

export interface FailedEvent {
  eventName: string;
  stepNum: number;
}
export class VerifyExtension extends PuppeteerRunnerExtension {
  failedEvents: FailedEvent[] = [];
  previousEventCount = 0;

  async beforeAllSteps(flow?: UserFlow): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    logInfo(`Running test spec ${flow?.title ?? ''}`);
  }

  async beforeEachStep(step: Step, flow?: UserFlow | undefined): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 600));
    if (super.beforeEachStep != null) {
      await super.beforeEachStep(step, flow);
    }
    if (isSyftStep(step)) {
      return;
    }

    // TODO: set a test environment.
    // TODO: make syft expose syft.test object if the environment is test.
    await this.page.evaluate(getSyftTester);
  }

  async runStep(step: Step, flow?: UserFlow): Promise<void> {
    const eventName = getEventNameFrom(step);
    if (eventName != null) {
      const events = (await this.page.evaluate(getSyftEvents)) as any[];
      const latestEvents = events.slice(this.previousEventCount);
      const latestEvent = latestEvents.find(
        (event) => event.syft.eventName === eventName
      );
      if (latestEvent == null) {
        // Fail puppeteer.
        const index = flow?.steps.indexOf(step);
        this.failedEvents.push({
          eventName,
          stepNum: index ?? -1
        });
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        logError(`${eventName} is not found at step ${index}`);
      }
      this.previousEventCount = events.length;
    } else {
      await super.runStep(step, flow);
    }
  }

  async afterAllSteps(flow?: UserFlow): Promise<void> {
    if (super.afterAllSteps != null) {
      await super.afterAllSteps(flow);
    }
    const events = (await this.page.evaluate(getSyftEvents)) as any[];
    const eventNames = events
      .map((e: any) => e.syft.eventName as string)
      .reduce((counts, name) => {
        counts.set(name, (counts.get(name) ?? 0) + 1);
        return counts;
      }, new Map<string, number>());
    const eventLog = [...eventNames.entries()]
      .map((v) => `${v[0]}: ${v[1]}`)
      .join(', ');
    logVerbose(`Logged events: ${eventLog}`);
  }
}
