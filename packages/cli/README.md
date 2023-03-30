# Syft

Syft enables developers to model application or analytics events in native Typescript code. It generates the code for instrumenting events in your application and integrates with your event publishing systems. You can use it with Amplitude, Mixpanel, Segment, Heap, or your own event publishing library.

## Why Syft?

Almost all applications emit events, either for analytics, performance telemetry, or for inter-service messaging. However, the structure and behavior of these events is often not well specified or documented. Absent this specification, events cannot be generated or consumed reliably. Analytics events, for example, generally get persisted to an analytical store such as a data warehouse or a datalake. Engineers or data/ML scientists cannot effectively query these events for analytics/ML without knowing: when does an event fire? which fields does it contain and what do they mean? why and how has the behavior and structure changed over a period of time? Unfortunately, today, answering these questions is difficult - knowledge is tribal or scattered across outdated documents (PRDs or spreadsheets). Syft fixes this problem by providing a developer-centric platform to define, generate, and discover events.

## Getting Started

In this guide, you'll learn how to get started with Syft and use it in your TypeScript/Javascript project. Syft has the following components:

[**Syft CLI**](#set-up-syft): CLI tool to create, manage and deploy event models.

[**Syft Client**](#generate-syft-client): Auto-generated and type-safe event instrumentation layer for Node.js & TypeScript.

To use Syft, navigate to your project's root directory and install it as a development dependency:

```sh
$ npm install @syftdata/cli --save-dev
$ npm install @syftdata/client --save
```

Next, setup Syft for your project with the `init` command.

```sh
$ npx syft init
$ ls syft
config.ts   events.ts   lint
```

This will create a 'syft' folder with the following files:

- config.ts: contains Syft configuration. It stores the event model version.
- events.ts: contains your application specific event models. This is the file that you will usually work with directly.
- lint: contains rules and config to apply custom linting rules on your event models.

### Modeling events

Syft provides an intuitive way to model events. Application developers can define the structure of events as Typescript objects with composition and inhertiance. In Syft, the event model acts a "Source of Truth" for all your events. There is no need to keep a separate artifact like a "tracking plan" (and those go out of date anyway!). You can change, update, and collaboratively evolve your event model with the git tooling and workflows that you are familiar with.

Syft comes with basic event objects out of the box that you can build upon. These can be found in events.ts:

**`events.ts`**

```ts
/**
 * This model generates the "User Identity" event.
 * @type {SyftEventType.IDENTIFY}
 */
export class UserIdentity {
  /**
   * Id of the user.
   */
  userId: type.UUID;
}

/**
 * This model generates the "Page Viewed" event.
 * @type {SyftEventType.PAGE}
 */
export class PageViewed {
  /**
   * Name of the page.
   */
  name: string;

  /**
   * Path portion of the page’s URL. Equivalent to canonical path which defaults to location.pathname from the DOM API.
   */
  path?: string;

  /**
   * Page’s title. Equivalent to document.title from the DOM API.
   * @min 3 @max 30
   */
  title?: string;
}
```

Here we defined a UserIdentity and PageViewed event models with `IDENTIFY` and `PAGE` types respectively. We can use this information and call appropriate log methods. For example, we could call `.identify` and `.page` methods if events are routed to Segment.

If you observe closely PageViewed has one required field (name) and two optional fields. Syft comes with built-in types to model fields - url, email in the examples above - and also provides annotations to declare valid values for certain types (title above). Other Syft-defined types and validations can be found in the Appendix at the end of this guide. You can also look at this example project and [model file](https://github.com/syftdata/examples/blob/main/todo-app/syft/events.ts).

### Instrumenting code

Once you have the event model defined, you can use syft to auto-generate the code to instrument your application for generating events. The command below does so with a scaffolding for you to integrate with Segment. Note that there is no direct dependency on Segment in the instrumentation. One benefit of using Syft is that you can swap out your analytics provider in the future without changing any of your existing instrumentation.

```sh
$ npx syft generate
```

Once the client library is generated, you can instrument your code as shown below. With the strictly typed auto-generated methods, you can instrument code with ease and fewer errors.

**`your_code.ts`**

```ts
import Syft, { AmplitudePlugin } from '@syftdata/client';
const syft = new Syft({
  appVersion: '1.0.0',
  plugins: [new AmplitudePlugin()]
});

syft.userIdentity({ userId: '6756bcab-8ebc-40ec-a9f3-65c86be344f9' });
syft.pageEvent({ name: 'index' });
```

#### Integration with your existing Analytics SDK

The library relies on your existing analytics SDK to publish events. It does so through plugins that implement the interface described below. We provide plugins for popular SDKs like Amplitude, Segment, Mixpanel, and Heap. You can also write a [custom plugin](#plugins) for your own eventing system. Plugins are registered through Syft initialization.

```ts
const syft = new Syft({
  appVersion: '1.0.0',
  plugins: [new AmplitudePlugin(), new MyCustomPlugin()]
});
```

**NOTE:** Plugins get called in the order of registration.

#### Plugins

Plugins can also be used as event filters and transformers. A plugin is expected to implement the interface below.

```ts
interface ISyftPlugin {
  /**
   * Give a unique name to your plugin
   */
  id: string;

  /**
   * Gives you an opportunity to start loading the plugin dependencies
   */
  load?: () => void;
  /**
   * Return true when the plugin loaded its dependencies
   * @returns true when the plugin is ready
   */
  isLoaded: () => boolean;

  /**
   * Initialize your plugin and make it ready to start logging.
   * @param reflector pass events to the reflector to reflect events that are logged outside syft.
   */
  init: (reflector: IReflector) => void;

  /** Gets called when an event is logged.
   * A plugin can use `eventName` and `eventType` properties to route the event.
   */
  logEvent: (event: SyftEvent) => boolean;

  /** Gets called when syft.resetUser() is called. */
  resetUserProperties: () => void;
}
```

### Testing event instrumentation

Syft also generates a testing library that helps developers write unit or integration tests for validating your instrumentation. This library can be integrated into your existing test frameworks (such as UI tests) to check if events are firing at the right time with the right fields.

```ts
const syftTester = syft.getTester();

afterEach(() => {
  syftTester.reset();
});

describe('application', () => {
  it('when application is opened', async () => {
    // test setup and execution logic.
    expect(syftTester.hasEvent('Application Opened')).toBeTruthy();
    expect(syftTester.allValidEvents()).toBeTruthy();
  });
  it('when application is used', async () => {
    // test setup and execution logic.
    expect(syftTester.events).toMatchSnapshot();
  });
});
```

In the example above, tests ensure that "application opened" event is logged when the app is opened. You can access all logged `events` and make sure they are valid. This is extremely powerful when incorporated within integration testing.

### Appendix: Syft Types and Annotations

Syft provides Integer, UUID, Email, Url, PhoneNumber, Currency as types out of the box. These types can provide coercion and runtime validation.

Syft also allows annotation driven runtime validation. Some of the annotations are:

```ts
// @min 0, @max 2000
const num: number;

// @positive
const positive_num: number;

// @min 3, @max 20 characters
const str: string;

// @regex \w+
const str: string;

const enumValue: MyEnum;
```

## Support

For usage questions, bug reports, or feature requests, please open a github issue [here](https://github.com/syftdata/syft/issues). For general inquiries or reporting security issues, please contact us at hello@syftdata.com.

## Contributing

We welcome your contributions to make Syft better. Please follow [this doc](../../CONTRIBUTING.md) to contribute to this repo.

## Build Status

![CI tests](https://github.com/syftdata/syft/actions/workflows/ci.yaml/badge.svg)
