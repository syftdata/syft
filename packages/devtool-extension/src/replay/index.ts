import { getCurrentTabId } from "../common/utils";

import { ExtensionDebuggerTransport } from "puppeteer-extension-transport";
import puppeteer from "puppeteer-core/lib/cjs/puppeteer/web";
import {
  createRunner,
  PuppeteerRunnerExtension,
  Runner,
} from "@puppeteer/replay";

export interface SyftRunner {
  runner: Runner;
  onComplete: () => Promise<void>;
  transport: ExtensionDebuggerTransport;
}

export async function createSyftRunner(): Promise<SyftRunner | undefined> {
  const tabId = getCurrentTabId();
  try {
    const extensionTransport = await ExtensionDebuggerTransport.create(tabId);
    extensionTransport.delay = 10;
    const browser = await puppeteer.connect({
      transport: extensionTransport,
      defaultViewport: null,
    });

    // use first page from pages instead of using browser.newPage()
    const [page] = await browser.pages();
    const runner = await createRunner(
      new PuppeteerRunnerExtension(browser, page, { timeout: 2000 })
    );

    extensionTransport.onclose = () => {
      console.log("Extension transport closed");
      // TODO: update our UI to reflect the same!!
    };

    await runner.runBeforeAllSteps();
    return {
      runner,
      transport: extensionTransport,
      onComplete: async () => {
        await runner.runAfterAllSteps();
        extensionTransport.close();
      },
    };
  } catch (e) {
    console.error(
      "Error running the test script. Did you give all requested permissions to the extension?",
      e
    );
  }
  return;
}
