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
