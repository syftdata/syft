---
sidebar_position: 9
---

# Other Features

### Type safety

If you use Typescript you can enable type check to your events like below:

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

### Custom Upload Endpoint

If you want to upload events to something other than `/api/syft`, you can do so by specifying `uploadPath`

```js
// pages/_app.jsx
<SyftProvider uploadPath="/client/api/syft" />
```
