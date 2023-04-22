import { test as baseTest, type TestInfo, type Page } from '@playwright/test';

declare global {
  interface Window {
    syft: any;
  }
}

// TODO: best solution would be to provide something like page.waitForEvent() / page.waitForSyftEvent()
// may be we can emit events on the page object ?
class SyftPlayWrightUtils {
  // one instance per test.

  constructor(private readonly page: Page, private readonly test: TestInfo) {}
  async reset(): Promise<void> {
    await this.page.evaluate(() => {
      if (typeof window.syft !== 'undefined') {
        return window.syft.getTester().reset();
      }
    });
  }

  async getEvents(): Promise<Array<Record<string, any>>> {
    const events = (await this.page.evaluate(() => {
      if (typeof window.syft !== 'undefined') {
        return window.syft.getTester().events;
      }
      return [];
    })) as Array<Record<string, any>>;
    return events;
  }

  async wait(eventName: string): Promise<Record<string, any>> {
    await this.page.coverage.startJSCoverage();
    const existingEvents = await this.getEvents();
    const startTime = new Date().getTime();
    return await new Promise((resolve, reject) => {
      // const customReject = async (): Promise<void> => {
      //   const coverage = await this.page.coverage.stopJSCoverage();
      //   coverage.forEach((c) => {
      //     if (c.url.includes('localhost') === true) {
      //       console.log(
      //         c.functions
      //           .filter((f) => f.isBlockCoverage)
      //           .map((f) => f.functionName)
      //       );
      //     }
      //   });
      //   // this.test.fixme(true, `Event not found: ${eventName}`);
      //   reject(new Error(`Event not found: ${eventName}`));
      // };
      // const customResolve = async (
      //   event: Record<string, any>
      // ): Promise<void> => {
      //   await this.page.coverage.stopJSCoverage();
      //   resolve(event);
      // };
      const testAsyncFunc = async (): Promise<void> => {
        const events = await this.getEvents();
        const newEvents = events.slice(existingEvents.length);
        if (newEvents.length > 0) {
          const event = newEvents.find((e) => e.syft.eventName === eventName);
          if (event != null) {
            // await customResolve(event);
            resolve(event);
            return;
          }
        }
        const currentTime = new Date().getTime();
        if (currentTime - startTime >= 2000) {
          // await customReject();
          reject(new Error(`Event not found: ${eventName}`));
        } else {
          setTimeout(testfunc, 100);
        }
      };
      const testfunc = (): void => {
        void testAsyncFunc().then(() => {});
      };
      setTimeout(testfunc, 100);
    });
  }

  async hasEvent(
    eventName: string,
    props?: Record<string, any>
  ): Promise<boolean> {
    const events = await this.getEvents();
    const matches = events.filter((event) => {
      if (event.syft.eventName === eventName) {
        if (props != null) {
          return Object.keys(props).every((key) => {
            return event.syft[key] === props[key];
          });
        }
        return true;
      }
      return false;
    });
    return matches.length > 0;
  }
}

interface SyftPlayWrightTest {
  syft: SyftPlayWrightUtils;
}

export const test = baseTest.extend<SyftPlayWrightTest>({
  syft: async ({ page }, use, testInfo) => {
    // we can attach the failure on test info.
    // testInfo.attach();
    await use(new SyftPlayWrightUtils(page, testInfo));
  }
});
