---
sidebar_position: 3
---

# Event Collection

## Automatic Page view events

To track page views set the `trackPageViews` prop of the `SyftProvider` component to true.

```jsx title="src/pages/_app.tsx"
<SyftProvider trackPageViews />
```

By default hash changes are not treated as page views. you can enable it by providing `hashMode` as true.

## Automatic Link click events

To track Outbound link clicks set the `trackOutboundLinks` prop to true.

```jsx title="src/pages/_app.tsx"
<SyftProvider trackOutboundLinks />
```

## Custom Events

Use the `track()` method to log custom events.

```jsx title="src/components/MyButton.tsx"
import { useSyft } from "@syftdata/next";

export default function MyButton() {
  const syft = useSyft();
  return (
    <>
      <button
        onClick={() =>
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
