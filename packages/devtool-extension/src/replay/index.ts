import { getCurrentTabId } from "../common/utils";

import { ExtensionDebuggerTransport } from "puppeteer-extension-transport";
import puppeteer from "puppeteer-core/lib/cjs/puppeteer/web";
import {
  createRunner,
  PuppeteerRunnerExtension,
  Step,
} from "@puppeteer/replay";

export async function runScriptSteps(steps: Step[]) {
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
      new PuppeteerRunnerExtension(browser, page)
    );
    await runner.runBeforeAllSteps();
    for (const step of steps) {
      await runner.runStep(step);
    }
    await runner.runAfterAllSteps();
    extensionTransport.close();
  } catch (e) {
    console.error(
      "Error running the test script. Did you give all requested permissions to the extension?",
      e
    );
  }
}
