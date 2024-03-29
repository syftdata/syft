---
sidebar_position: 3
---

# Event Collection

Automatically capture page views, link clicks, and add custom events.

## Automatic Page view events

To track page views set the `trackPageViews` prop of the `SyftProvider` component to true.

```jsx title="src/pages/_app.tsx"
// ...
<SyftProvider trackPageViews />
// ...
```

By default hash changes are not treated as page views. you can enable it by providing `hashMode` as true.

## Automatic Link click events

To track Outbound link clicks set the `trackOutboundLinks` prop to true.

```jsx title="src/pages/_app.tsx"
// ...
<SyftProvider trackOutboundLinks />
// ...
```

## Custom Events

Use the `track()` method to log custom events.

```jsx title="src/components/MyButton.tsx"
// highlight-next-line
import { useSyft } from "@syftdata/next";

export default function MyButton() {
  // highlight-next-line
  const syft = useSyft();
  return (
    <>
      <button
        onClick={() =>
          // highlight-next-line
          syft.track("Button Clicked", {
            buttonId: "foo",
          })
        }
      >
        Send with props
      </button>
    </>
  );
}
```

## Privacy friendly

Syft makes it easy to handle privacy preferences as required by laws such as GDPR and CCPA. This functionality needs to be enabled explicitly as shown below.

```jsx title="src/pages/_app.tsx"
// ...
<SyftProvider consent />
// ...
```

#### Helper methods

```js
import { consent } from "@syft/next";

/**
 * call this method when user opts in / accepts.
 */
consent.optIn();

/**
 * call this method when user opts out / rejects.
 */
consent.optOut();

/**
 * This method helps to decide if consent popup needs to be shown.
 * returns true if user had either opted in or opted out.
 */
consent.hasGivenConsent();

/**
 * This method helps to check if data can be collected or not.
 * returns true if it is okay to collect data.
 */
consent.canLog();
```

#### Respect [Do Not Track](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/doNotTrack).

```jsx title="src/pages/_app.tsx"
// ...
<SyftProvider consent={{ respectDNT: true }} />
// ...
```

## Type Safe Events

If you use Typescript, you can define type-safe events as below:

```jsx
import { useSyft } from '@syft/next';

type EventDefs = {
  page: never;
  "OutboundLink Clicked": { href: string };
  "Button Clicked": { buttonId?: string };
};

const syft = useSyft<EventDefs>();
syft.track("Button Clicked", { buttonId: 10}); // this throws error as buttonId type is incompatible.
```

Only those events with the right props will be allowed to be sent using the `syft` function.
