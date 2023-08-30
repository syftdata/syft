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
// pages/_app.js
import SyftProvider from "@syftdata/next";

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
// app/layout.js
import SyftProvider from "@syftdata/next";

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <SyftProvider />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### Collect Events
Use the `track()` method.

```jsx
import { useSyft } from "@syftdata/next";

export default function MyButton() {
  const { track } = useSyft();

  return (
    <>
      <button
        id="foo"
        onClick={() =>
          track("customEventName", {
            props: {
              buttonId: "foo",
            },
          })
        }
      >
        Send with props
      </button>
    </>
  );
}
```

### Event Routing 
You can route events to multiple destinations with a simple configuration. You can also set controls such as event filtering and sampling.

```js
const { withSyft } = require("@syftdata/next");

module.exports = withSyft({
  destinations: [
    {
      type: "Amplitude",
      api_key: "<Amplitude Key>",
      exclude: ["UserAuth*", "PaymentInfo*"], // filters out UserAuth and PaymentInfo events.
      samplingRate: 10, // samples the data by 10%.
      samplingKey: ["user_id", "device_id"], // leave empty if you want sampling to be random.
    },
    {
      type: "Bigquery",
      projectId: "my-favorite-app",
      dataset: "product",
      key: "<secret>",
    },
  ],
})({
  // ...your next js config, if any
});
```

#### Proxying events

To avoid being blocked by adblockers, all analytics providers recommend serving their scripts (amplitude/segment/mixpanel/ga) and upload events via a proxy server. This library takes care of that behind the scenes. `withSyft` will set up the necessary rewrites and configure `SyftProvider` to use the local URLs so you don't have to make any changes in the client app.

**Notes:**

- Proxying will only work if you serve your site using `next start`. Statically generated sites won't be able to rewrite the requests.

### Event Transformations / Enrichment

You can define event transformations in TypeScript with the same conventions as request middleware. You'd write a file called syft/transformations.ts

```js
import { SyftEvent } from "@syftdata/client";

export function transform(event: SyftEvent) {
  event.revenue = Number(event.revenue);
  if (event.eventName.startsWith("OrderCancelled")) {
    event.cancelledAt = new Date();
  }
  if (event.eventName.startsWith("OrderPlaced")) {
    // get product title if it is missing.
    if (event.products.forEach(product => {
        if (product.name == null) {
            product.name = queryProduct(product.id)?.title;
        }
    }))
  }
  return event;
}

export const config = {
  matcher: "Order*",
};
```

### Type safety

If you use Typescript you can type check your custom events like this:

```tsx
import { useSyft } from "@syft/next";

type MyEvents = {
  customEventName: { buttonId?: string };
  event2: { prop2: string; prop3: number };
  event3: never;
};

const syft = useSyft<MyEvents>();
```

Only those events with the right props will be allowed to be sent using the `syft` function.

### Automatic Page view events

To track page views set the `trackPageViews` prop of the `SyftProvider` component to true.

```js
// pages/_app.js
...
    <SyftProvider trackPageViews />
...
```

By default it will be trigger on hash changes if `trackPageViews` is enabled, but you can ignore hash changes by providing an object to the `trackPageViews` prop:

```js
// pages/_app.js
...
    <SyftProvider trackPageViews={{ ignoreHashChange: true }} />
...
```

### User Identity Management

Syft's identify call's behavior is very similar to Segment's. Syft library generates and manages annonymous-id (UUID) for you. It stores it in the cookie and browser's local storage so that the developer has access to it both on the server and the client. This annonymous-id gets included in every event that is generated.

Annonymous-ids get reset when `.reset` method is called (or when an user clears their cookies and local-storage.)

For more info refer to [this](https://segment-docs.netlify.app/docs/connections/sources/catalog/libraries/website/javascript/identity/)

### Consent

You can use the `consent` function to update your users' cookie preferences (GDPR). You can set the consent at event name level.

```js
const consentValue: "denied" | "granted" | "not-set" =
  getUserCookiePreference();
consent({
  arg: "update",
  consent: consentValue,
  match: "*",
});
```

## Support

For usage questions, bug reports, or feature requests, please open a github issue [here](https://github.com/syftdata/event-hub/issues). For general inquiries or reporting security issues, please contact us at hello@syftdata.com.

## Contributing

We welcome your contributions to make Syft better. Please follow [this doc](./CONTRIBUTING.md) to contribute to this repo.

## Build Status

![CI tests](https://github.com/syftdata/event-hub/actions/workflows/ci.yaml/badge.svg)
