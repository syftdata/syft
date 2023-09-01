# Universal event analytics for nextjs

## Introduction

This is a [next.js](https://nextjs.org) library to capture rich analytics events with high-quality and without vendor lock-in.

### Data Quality

- Prevent data loss from Ad blockers: This library will automatically proxy events through your nextjs backend.
- Guarantee type safety: The library can leverage Typescript types to ensure events and fields adhere to a contract.

### No Lock-In

- Universal vendor-neutral API: A Segment-like API to log events in standard format. The same API can be used for client and server-side logging.
- Full control over your data: You can route events to multiple data destinations e.g. warehouses, CDP, analytics platforms with simple configuration. It acts as a lightweight-CDP similar to Segment.

### Rich events

- Enrich collected events on server-side state (e.g. from database) with transforms.
- Automatically collect page events and standard fields on each event.

## Usage

### Installation

```
npm install --save @syftdata/next
```

### Include the Analytics Script

To enable Syft in your app you'll need to expose the Syft context. Include `<SyftProvider />`, at the top level of your application inside [`_app.js`](https://nextjs.org/docs/advanced-features/custom-app):

```jsx
// pages/_app.tsx
import SyftProvider from '@syftdata/next';

export default function MyApp({ Component, pageProps }) {
  return (
    <SyftProvider>
      <Component {...pageProps} />
    </SyftProvider>
  );
}
```

If are using [the app directory](https://beta.nextjs.org/docs/routing/fundamentals#the-app-directory) include `SyftProvider` inside the root layout:

```jsx
// app/layout.tsx
import SyftProvider from '@syftdata/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SyftProvider>{children}</SyftProvider>
      </body>
    </html>
  );
}
```

### Identity Management

Syft's identify call's behavior is very similar to Segment's. Syft library generates and manages annonymous-id (UUID) for you. It stores it in the cookie and browser's local storage so that the developer has access to it both on the server and the client. This annonymous-id gets included in every event that is generated.

Annonymous-id get reset when an user clears their cookies and local-storage.

#### Identify your users.

Use the `identify()` method to identify your product's users. This will help you track users who are triggering events. An example usage looks like this:

```jsx
import { useSyft } from '@syftdata/next';

const syft = useSyft();
useEffect(() => {
  if (user != null) {
    syft.identify(user.id, {
      email: user.email
    });
  }
}, [syft, user]);
```

#### Identify your users' companies.

Use the `group()` method to identify your user's groups / companies. **NOTE:** always call identify before calling group.

```jsx
import { useSyft } from '@syftdata/next';

const syft = useSyft();
useEffect(() => {
  if (user != null) {
    syft.group(user.orgId, {
      name: user.orgName
    });
  }
}, [syft, user]);
```

### Collect Custom Events

Use the `track()` method to log custom events.

```jsx
import { useSyft } from '@syftdata/next';

export default function MyButton() {
  const syft = useSyft();
  return (
    <>
      <button
        onClick={() =>
          syft.track('Button Clicked', {
            buttonId: 'foo'
          })
        }
      >
        Send with props
      </button>
    </>
  );
}
```

### Event Routing Setup

You can route events to multiple destinations with a simple configuration. Create an API endpoint (/api/syft) by creating the file with the below code. This example shows routing events to June. (You can do more cool stuff like sending slack alerts when a user becomes active / runs into a problem.)

```ts
// pages/api/syft.ts
import { type NextApiRequest, type NextApiResponse } from 'next';
import { NextSyftServer } from '@syftdata/next/lib/next';

const destinations = [
  {
    name: 'june',
    settings: {
      apiKey: 'xxxx'
    }
  }
];
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const server = new NextSyftServer({
    destinations
  });
  await server.handlePageApi(req, res);
}
```

#### Proxying events

To avoid being blocked by adblockers, all analytics providers recommend serving their scripts (amplitude/segment/mixpanel/ga) and upload events via a proxy server. This library takes care of that behind the scenes.

### Event Transformations / Enrichment

You can define event transformations and enrichments on the backend. You can query your DB and denormalize your events.

```js
const server = new NextSyftServer({
  destinations,
  enricher: (event) => {
    event.context.ab_featurex_enabled = true;
  }
});
```

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

### Automatic Page view events

To track page views set the `trackPageViews` prop of the `SyftProvider` component to true.

```js
// pages/_app.jsx
<SyftProvider trackPageViews />
```

By default hash changes are not treated as page views. you can enable it by providing `hashMode` as true.

### Automatic Link click events

To track Outbound link clicks set the `trackOutboundLinks` prop to true.

```js
// pages/_app.jsx
<SyftProvider trackOutboundLinks />
```

### Custom Upload Endpoint

If you want to upload events to something other than `/api/syft`, you can do so by specifying `uploadPath`

```js
// pages/_app.jsx
<SyftProvider uploadPath="/client/api/syft" />
```

## Support

For usage questions, bug reports, or feature requests, please open a github issue [here](https://github.com/syftdata/event-hub/issues). For general inquiries or reporting security issues, please contact us at hello@syftdata.com.

## Contributing

We welcome your contributions to make Syft better. Please follow [this doc](./CONTRIBUTING.md) to contribute to this repo.

## Build Status

![CI tests](https://github.com/syftdata/event-hub/actions/workflows/ci.yaml/badge.svg)
