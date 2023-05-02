import { getBestSelectorForAction } from "./selector";

import type {
  Action,
  SyftEventSource,
  SyftEvent,
  InputAction,
  KeydownAction,
  WheelAction,
} from "../types";
import {
  ActionType,
  BaseAction,
  ScriptType,
  TagName,
  isSupportedActionType,
} from "../types";
import { ResizeAction } from "../types";
import { NavigateAction } from "../types";

const FILLABLE_INPUT_TYPES = [
  "",
  "date",
  "datetime",
  "datetime-local",
  "email",
  "month",
  "number",
  "password",
  "search",
  "tel",
  "text",
  "time",
  "url",
  "week",
];

// only used in ActionContext
export const truncateText = (str: string, maxLen: number) => {
  return `${str.substring(0, maxLen)}${str.length > maxLen ? "..." : ""}`;
};

export const isActionStateful = (action: Action) => {
  return action.tagName === TagName.TextArea;
};

type ActionState = {
  causesNavigation: boolean;
  isStateful: boolean;
};

export class ActionContext extends BaseAction {
  private readonly action: Action;

  private readonly scriptType: ScriptType;

  private readonly actionState: ActionState;

  constructor(
    action: Action,
    scriptType: ScriptType,
    actionState: ActionState
  ) {
    super();
    this.action = action;
    this.actionState = actionState;
    this.scriptType = scriptType;
  }

  getType() {
    return this.action.type;
  }

  getTagName() {
    return this.action.tagName;
  }

  getValue() {
    return this.action.value;
  }

  getInputType() {
    return this.action.inputType;
  }

  // (FIXME: shouldn't expose action)
  getAction() {
    return this.action;
  }

  getActionState() {
    return this.actionState;
  }

  getDescription() {
    const { type, selectors, tagName, value } = this.action;

    switch (type) {
      case ActionType.Click:
        return `Click on <${tagName.toLowerCase()}> ${
          selectors.text != null && selectors.text.length > 0
            ? `"${truncateText(selectors.text.replace(/\s/g, " "), 25)}"`
            : getBestSelectorForAction(this.action, this.scriptType)
        }`;
      case ActionType.Hover:
        return `Hover over <${tagName.toLowerCase()}> ${
          selectors.text != null && selectors.text.length > 0
            ? `"${truncateText(selectors.text.replace(/\s/g, " "), 25)}"`
            : getBestSelectorForAction(this.action, this.scriptType)
        }`;
      case ActionType.Input:
        return `Fill ${truncateText(
          JSON.stringify(value ?? ""),
          16
        )} on <${tagName.toLowerCase()}> ${getBestSelectorForAction(
          this.action,
          this.scriptType
        )}`;
      case ActionType.Keydown:
        return `Press ${this.action.key} on ${tagName.toLowerCase()}`;
      case ActionType.Load:
        return `Load "${this.action.url}"`;
      case ActionType.Resize:
        return `Resize window to ${this.action.width} x ${this.action.height}`;
      case ActionType.Wheel:
        return `Scroll wheel by X:${this.action.deltaX}, Y:${this.action.deltaY}`;
      case ActionType.FullScreenshot:
        return `Take full page screenshot`;
      case ActionType.AwaitText:
        return `Wait for text ${truncateText(
          JSON.stringify(this.action.text),
          25
        )} to appear`;
      case ActionType.DragAndDrop:
        return `Drag n drop ${getBestSelectorForAction(
          this.action,
          this.scriptType
        )} from (${this.action.sourceX}, ${this.action.sourceY}) to (${
          this.action.targetX
        }, ${this.action.targetY})`;
      default:
        return "";
    }
  }

  getBestSelector(): string | null {
    return getBestSelectorForAction(this.action, this.scriptType);
  }
}

export abstract class ScriptBuilder {
  protected readonly codes: string[];

  protected readonly actionContexts: ActionContext[];

  protected readonly showComments: boolean;

  constructor(showComments: boolean) {
    this.codes = [];
    this.actionContexts = [];
    this.showComments = showComments;
  }

  abstract click: (selector: string, causesNavigation: boolean) => this;

  abstract hover: (selector: string, causesNavigation: boolean) => this;

  abstract load: (url: string) => this;

  abstract resize: (width: number, height: number) => this;

  abstract fill: (
    selector: string,
    value: string,
    causesNavigation: boolean
  ) => this;

  abstract type: (
    selector: string,
    value: string,
    causesNavigation: boolean
  ) => this;

  abstract keydown: (
    selector: string,
    key: string,
    causesNavigation: boolean
  ) => this;

  abstract select: (
    selector: string,
    key: string,
    causesNavigation: boolean
  ) => this;

  abstract wheel: (
    deltaX: number,
    deltaY: number,
    pageXOffset?: number,
    pageYOffset?: number
  ) => this;

  abstract dragAndDrop: (
    sourceX: number,
    sourceY: number,
    targetX: number,
    targetY: number
  ) => this;

  abstract fullScreenshot: () => this;

  abstract awaitText: (test: string) => this;

  abstract buildScript: () => string;

  abstract syftEvent: (event: SyftEvent, source?: SyftEventSource) => this;

  private transformActionIntoCodes = (actionContext: ActionContext) => {
    if (this.showComments) {
      const actionDescription = actionContext.getDescription();
      this.pushComments(`// ${actionDescription}`);
    }

    const bestSelector = actionContext.getBestSelector();
    const tagName = actionContext.getTagName();
    const value = actionContext.getValue();
    const inputType = actionContext.getInputType();
    const { causesNavigation } = actionContext.getActionState();
    // (FIXME: getters for special fields)
    const action: any = actionContext.getAction();

    switch (actionContext.getType()) {
      case ActionType.Click:
        this.click(bestSelector as string, causesNavigation);
        break;
      case ActionType.Hover:
        this.hover(bestSelector as string, causesNavigation);
        break;
      case ActionType.Keydown:
        this.keydown(
          bestSelector as string,
          action.key ?? "",
          causesNavigation
        );
        break;
      case ActionType.Input: {
        if (tagName === TagName.Select) {
          this.select(bestSelector as string, value ?? "", causesNavigation);
        } else if (
          // If the input is "fillable" or a text area
          tagName === TagName.Input &&
          inputType != null &&
          FILLABLE_INPUT_TYPES.includes(inputType)
        ) {
          // Do more actionability checks
          this.fill(bestSelector as string, value ?? "", causesNavigation);
        } else if (tagName === TagName.TextArea) {
          this.fill(bestSelector as string, value ?? "", causesNavigation);
        } else {
          this.type(bestSelector as string, value ?? "", causesNavigation);
        }
        break;
      }
      case ActionType.Load:
        this.load(action.url);
        break;
      case ActionType.Resize:
        this.resize(action.width, action.height);
        break;
      case ActionType.Wheel:
        this.wheel(
          action.deltaX,
          action.deltaY,
          action.pageXOffset,
          action.pageYOffset
        );
        break;
      case ActionType.FullScreenshot:
        this.fullScreenshot();
        break;
      case ActionType.AwaitText:
        this.awaitText(action.text);
        break;
      case ActionType.DragAndDrop:
        this.dragAndDrop(
          action.sourceX,
          action.sourceY,
          action.targetX,
          action.targetY
        );
        break;
      default:
        break;
    }

    const typedAction = actionContext.getAction();
    if (typedAction.events) {
      for (const event of typedAction.events) {
        this.syftEvent(event, typedAction.eventSource);
      }
    }
  };

  protected pushComments = (comments: string) => {
    this.codes.push(`\n  ${comments}`);
    return this;
  };

  protected pushCodes = (codes: string) => {
    this.codes.push(`\n  ${codes}\n`);
    return this;
  };

  pushActionContext = (actionContext: ActionContext) => {
    this.actionContexts.push(actionContext);
  };

  buildCodes = () => {
    let prevActionContext: ActionContext | undefined;

    for (const actionContext of this.actionContexts) {
      if (!actionContext.getActionState().isStateful) {
        if (
          prevActionContext !== undefined &&
          prevActionContext.getActionState().isStateful
        ) {
          this.transformActionIntoCodes(prevActionContext);
        }
        this.transformActionIntoCodes(actionContext);
      }
      prevActionContext = actionContext;
    }

    // edge case
    if (
      prevActionContext !== undefined &&
      prevActionContext.getActionState().isStateful
    ) {
      this.transformActionIntoCodes(prevActionContext);
    }
    return this;
  };

  // for test
  getLatestCode = () => this.codes[this.codes.length - 1];
}

export class PlaywrightScriptBuilder extends ScriptBuilder {
  private waitForNavigation() {
    return `page.waitForNavigation()`;
  }

  private waitForActionAndNavigation(action: string) {
    return `await Promise.all([\n    ${action},\n    ${this.waitForNavigation()}\n  ]);`;
  }

  click = (selector: string, causesNavigation: boolean) => {
    const actionStr = `page.click('${selector}')`;
    const action = causesNavigation
      ? this.waitForActionAndNavigation(actionStr)
      : `await ${actionStr};`;
    this.pushCodes(action);
    return this;
  };

  hover = (selector: string, causesNavigation: boolean) => {
    const actionStr = `page.hover('${selector}')`;
    const action = causesNavigation
      ? this.waitForActionAndNavigation(actionStr)
      : `await ${actionStr};`;
    this.pushCodes(action);
    return this;
  };

  load = (url: string) => {
    this.pushCodes(`await page.goto('${url}');`);
    return this;
  };

  resize = (width: number, height: number) => {
    this.pushCodes(
      `await page.setViewportSize({ width: ${width}, height: ${height} });`
    );
    return this;
  };

  fill = (selector: string, value: string, causesNavigation: boolean) => {
    const actionStr = `page.fill('${selector}', ${JSON.stringify(value)})`;
    const action = causesNavigation
      ? this.waitForActionAndNavigation(actionStr)
      : `await ${actionStr};`;
    this.pushCodes(action);
    return this;
  };

  type = (selector: string, value: string, causesNavigation: boolean) => {
    const actionStr = `page.type('${selector}', ${JSON.stringify(value)})`;
    const action = causesNavigation
      ? this.waitForActionAndNavigation(actionStr)
      : `await ${actionStr};`;
    this.pushCodes(action);
    return this;
  };

  select = (selector: string, option: string, causesNavigation: boolean) => {
    const actionStr = `page.selectOption('${selector}', '${option}')`;
    const action = causesNavigation
      ? this.waitForActionAndNavigation(actionStr)
      : `await ${actionStr};`;
    this.pushCodes(action);
    return this;
  };

  keydown = (selector: string, key: string, causesNavigation: boolean) => {
    const actionStr = `page.press('${selector}', '${key}')`;
    const action = causesNavigation
      ? this.waitForActionAndNavigation(actionStr)
      : `await ${actionStr};`;
    this.pushCodes(action);
    return this;
  };

  wheel = (deltaX: number, deltaY: number) => {
    this.pushCodes(
      `await page.mouse.wheel(${Math.floor(deltaX)}, ${Math.floor(deltaY)});`
    );
    return this;
  };

  fullScreenshot = () => {
    this.pushCodes(
      `await page.screenshot({ path: 'screenshot.png', fullPage: true });`
    );
    return this;
  };

  awaitText = (text: string) => {
    this.pushCodes(`await page.waitForSelector('text=${text}');`);
    return this;
  };

  syftEvent = (event: SyftEvent, source?: SyftEventSource) => {
    this.pushCodes(`await syft.hasEvent("${event.name}", ${JSON.stringify(
      event.props
    )}, 
${JSON.stringify(source, null, 2)});`);
    return this;
  };

  dragAndDrop = (
    sourceX: number,
    sourceY: number,
    targetX: number,
    targetY: number
  ) => {
    this.pushCodes(
      [
        `await page.mouse.move(${sourceX}, ${sourceY});`,
        "  await page.mouse.down();",
        `  await page.mouse.move(${targetX}, ${targetY});`,
        "  await page.mouse.up();",
      ].join("\n")
    );
    return this;
  };

  buildScript = () => {
    return `import { expect } from '@playwright/test';
import { PlayWrightTest as test } from "@syftdata/testing";

test('Written with Syft Studio', async ({ page, syft }) => {${this.codes.join(
      ""
    )}});`;
  };
}

export class PuppeteerScriptBuilder extends ScriptBuilder {
  private waitForSelector(selector: string) {
    return `page.waitForSelector('${selector}')`;
  }
  private waitForNavigation() {
    return `page.waitForNavigation()`;
  }
  private waitForSelectorAndNavigation(selector: string, action: string) {
    return `await ${this.waitForSelector(
      selector
    )};\n  await Promise.all([\n    ${action},\n    ${this.waitForNavigation()}\n  ]);`;
  }

  click = (selector: string, causesNavigation: boolean) => {
    const pageClick = `page.click('${selector}')`;
    if (causesNavigation) {
      this.pushCodes(this.waitForSelectorAndNavigation(selector, pageClick));
    } else {
      this.pushCodes(
        `await ${this.waitForSelector(selector)};\n  await ${pageClick};`
      );
    }
    return this;
  };

  hover = (selector: string, causesNavigation: boolean) => {
    const pageHover = `page.hover('${selector}')`;
    if (causesNavigation) {
      this.pushCodes(this.waitForSelectorAndNavigation(selector, pageHover));
    } else {
      this.pushCodes(
        `await ${this.waitForSelector(selector)};\n  await ${pageHover};`
      );
    }
    return this;
  };

  load = (url: string) => {
    this.pushCodes(`await page.goto('${url}');`);
    return this;
  };

  resize = (width: number, height: number) => {
    this.pushCodes(
      `await page.setViewport({ width: ${width}, height: ${height} });`
    );
    return this;
  };

  type = (selector: string, value: string, causesNavigation: boolean) => {
    const pageType = `page.type('${selector}', ${JSON.stringify(value)})`;
    if (causesNavigation) {
      this.pushCodes(this.waitForSelectorAndNavigation(selector, pageType));
    } else {
      this.pushCodes(
        `await ${this.waitForSelector(selector)};\n  await ${pageType};`
      );
    }
    return this;
  };

  // Puppeteer doesn't support `fill` so we'll do our own actionability checks
  // but still type
  fill = (selector: string, value: string, causesNavigation: boolean) => {
    const pageType = `page.type('${selector}', ${JSON.stringify(value)})`;
    if (causesNavigation) {
      this.pushCodes(
        this.waitForSelectorAndNavigation(
          `${selector}:not([disabled])`,
          pageType
        )
      );
    } else {
      // Do more actionability checks
      this.pushCodes(
        `await ${this.waitForSelector(
          `${selector}:not([disabled])`
        )};\n  await ${pageType};`
      );
    }
    return this;
  };

  select = (selector: string, option: string, causesNavigation: boolean) => {
    const pageSelectOption = `page.select('${selector}', '${option}')`;
    if (causesNavigation) {
      this.pushCodes(
        this.waitForSelectorAndNavigation(selector, pageSelectOption)
      );
    } else {
      this.pushCodes(
        `await ${this.waitForSelector(selector)};\n  await ${pageSelectOption};`
      );
    }
    return this;
  };

  keydown = (selector: string, key: string, causesNavigation: boolean) => {
    const pagePress = `page.keyboard.press('${key}')`;
    if (causesNavigation) {
      this.pushCodes(this.waitForSelectorAndNavigation(selector, pagePress));
    } else {
      this.pushCodes(
        `await page.waitForSelector('${selector}');\n  await page.keyboard.press('${key}');`
      );
    }
    return this;
  };

  wheel = (deltaX: number, deltaY: number) => {
    this.pushCodes(
      `await page.evaluate(() => window.scrollBy(${deltaX}, ${deltaY}));`
    );
    return this;
  };

  fullScreenshot = () => {
    this.pushCodes(
      `await page.screenshot({ path: 'screenshot.png', fullPage: true });`
    );
    return this;
  };

  awaitText = (text: string) => {
    this.pushCodes(
      `await page.waitForFunction("document.body.innerText.includes('${text}')");`
    );
    return this;
  };

  dragAndDrop = (
    sourceX: number,
    sourceY: number,
    targetX: number,
    targetY: number
  ) => {
    this.pushCodes(
      [
        `await page.mouse.move(${sourceX}, ${sourceY});`,
        "  await page.mouse.down();",
        `  await page.mouse.move(${targetX}, ${targetY});`,
        "  await page.mouse.up();",
      ].join("\n")
    );
    return this;
  };

  syftEvent = (event: SyftEvent, source?: SyftEventSource) => {
    // TODO -> IMPLEMENT ME
    this.pushCodes(`// Syft is building Puppeteer support soon!`);
    return this;
  };

  buildScript = () => {
    return `const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({
    // headless: false, slowMo: 100, // Uncomment to visualize test
  });
  const page = await browser.newPage();
${this.codes.join("")}
  await browser.close();
})();`;
  };
}

export class CypressScriptBuilder extends ScriptBuilder {
  // Cypress automatically detects and waits for the page to finish loading
  click = (selector: string, causesNavigation: boolean) => {
    this.pushCodes(`cy.get('${selector}').click();`);
    return this;
  };

  hover = (selector: string, causesNavigation: boolean) => {
    this.pushCodes(`cy.get('${selector}').trigger('mouseover');`);
    return this;
  };

  load = (url: string) => {
    this.pushCodes(`cy.visit('${url}');`);
    return this;
  };

  resize = (width: number, height: number) => {
    this.pushCodes(`cy.viewport(${width}, ${height});`);
    return this;
  };

  fill = (selector: string, value: string, causesNavigation: boolean) => {
    this.pushCodes(`cy.get('${selector}').type(${JSON.stringify(value)});`);
    return this;
  };

  type = (selector: string, value: string, causesNavigation: boolean) => {
    this.pushCodes(`cy.get('${selector}').type(${JSON.stringify(value)});`);
    return this;
  };

  select = (selector: string, option: string, causesNavigation: boolean) => {
    this.pushCodes(`cy.get('${selector}').select('${option}');`);
    return this;
  };

  keydown = (selector: string, key: string, causesNavigation: boolean) => {
    this.pushCodes(`cy.get('${selector}').type('{${key}}');`);
    return this;
  };

  wheel = (
    deltaX: number,
    deltaY: number,
    pageXOffset?: number,
    pageYOffset?: number
  ) => {
    this.pushCodes(
      `cy.scrollTo(${Math.floor(pageXOffset ?? 0)}, ${Math.floor(
        pageYOffset ?? 0
      )});`
    );
    return this;
  };

  fullScreenshot = () => {
    this.pushCodes(`cy.screenshot();`);
    return this;
  };

  awaitText = (text: string) => {
    this.pushCodes(`cy.contains('${text}');`);
    return this;
  };

  dragAndDrop = (
    sourceX: number,
    sourceY: number,
    targetX: number,
    targetY: number
  ) => {
    // TODO -> IMPLEMENT ME
    this.pushCodes("");
    return this;
  };

  syftEvent = (event: SyftEvent, source?: SyftEventSource) => {
    // TODO -> IMPLEMENT ME
    this.pushCodes(`// Syft is building Puppeteer support soon!`);
    return this;
  };

  buildScript = () => {
    return `it('Written with Syft Studio', () => {${this.codes.join("")}});`;
  };
}

export const genCode = (
  actions: Action[],
  showComments: boolean,
  scriptType: ScriptType
): string => {
  let scriptBuilder: ScriptBuilder;

  switch (scriptType) {
    case ScriptType.Playwright:
      scriptBuilder = new PlaywrightScriptBuilder(showComments);
      break;
    case ScriptType.Puppeteer:
      scriptBuilder = new PuppeteerScriptBuilder(showComments);
      break;
    case ScriptType.Cypress:
      scriptBuilder = new CypressScriptBuilder(showComments);
      break;
    default:
      throw new Error("Unsupported script type");
  }

  for (let i = 0; i < actions.length; i++) {
    const action = actions[i];

    if (!isSupportedActionType(action.type)) {
      continue;
    }

    const nextAction = actions[i + 1];
    const causesNavigation = nextAction?.type === ActionType.Navigate;

    scriptBuilder.pushActionContext(
      new ActionContext(action, scriptType, {
        causesNavigation,
        isStateful: isActionStateful(action),
      })
    );
  }

  return scriptBuilder.buildCodes().buildScript();
};

const SupportedJSONActionTypes = new Set([
  ActionType.Navigate,
  ActionType.Click,
  ActionType.Input,
  ActionType.Keydown,
  ActionType.Resize,
]);
function getSelectors(action: BaseAction): string[] {
  return Object.values(action.selectors).filter((s) => s != null) as string[];
}
export const genJson = (actions: Action[]): string => {
  const transformedSteps: Record<string, any>[] = [];
  for (let i = 0; i < actions.length; i++) {
    const action: BaseAction = actions[i];
    if (!SupportedJSONActionTypes.has(action.type)) {
      continue;
    }
    switch (action.type) {
      case ActionType.Navigate:
        transformedSteps.push({
          type: "navigate",
          url: (action as NavigateAction).url,
          assertedEvents: [
            {
              type: "navigation",
              url: (action as NavigateAction).url,
            },
          ],
        });
        break;
      case ActionType.Click:
        transformedSteps.push({
          type: "click",
          target: "main",
          selectors: getSelectors(action),
          offsetX: 1,
          offsetY: 1,
        });
        break;
      case ActionType.Input:
        transformedSteps.push({
          type: "change",
          value: (action as InputAction).value,
          target: "main",
          selectors: getSelectors(action),
        });
        break;
      case ActionType.Keydown:
        transformedSteps.push({
          type: "keyDown",
          key: (action as KeydownAction).key,
          target: "main",
          selectors: getSelectors(action),
        });
        transformedSteps.push({
          type: "keyUp",
          key: (action as KeydownAction).key,
          target: "main",
          selectors: getSelectors(action),
        });
        break;
      case ActionType.Resize:
        transformedSteps.push({
          type: "setViewport",
          width: (action as ResizeAction).width,
          height: (action as ResizeAction).height,
          deviceScaleFactor: 1,
          isMobile: false,
          hasTouch: false,
          isLandscape: false,
        });
        break;
      case ActionType.Wheel:
        transformedSteps.push({
          type: "scroll",
          deltaX: (action as WheelAction).pageXOffset,
          deltaY: (action as WheelAction).pageYOffset,
        });
        break;
    }
    if (action.events != null) {
      action.events.forEach((event) => {
        transformedSteps.push({
          type: "customStep",
          name: "syft",
          parameters: {
            name: event.name,
            props: event.props,
          },
        });
      });
    }
  }

  return JSON.stringify(
    {
      title: "Syft Studio",
      steps: transformedSteps,
    },
    null,
    2
  );
};
