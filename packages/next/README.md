# Syft library for Next

## Introduction

A [next.js](https://nextjs.org) library to improve your analytics data quality and give you ability to route events to your data destinations. (eg: warehouses, CDP, analytics platforms.. [see for supported list](http://google.com))

### Data Quality

This library helps you improve data quality in two ways.

- Data loss caused by Ad blockers.
  - To avoid being blocked by adblockers all analytics providers recommend to serve their scripts (amplitude/segment/mixpanel/ga) and upload events via a proxy server. This library makes it easy for you.
- Type safety
  - The library can leverage typescript strength to give you typesafe guarantees, improve the quality at each field level.

### A Segment alternative

Segment is a popular framework that lets you transform and route your events wherever you want.

Syft lets you do event transformations and routing from your backend giving you 100% control and transparency. This is a powerful paradigm as you can enrich your events by directly accessing your backend state.

## Usage

### Include the Analytics Script

To enable Syft analytics in your app you'll need to expose the Syft context. Include `<SyftProvider />`, at the top level of your application inside [`_app.js`](https://nextjs.org/docs/advanced-features/custom-app):

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

```jsx
import { useSyft } from "@syft/next";

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

### Event Routing / Data Destinations

```js
const { withSyft } = require("@syft/next");

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

#### Prevent Data Loss

To avoid being blocked by adblockers all analytics providers recommend to serve their scripts (amplitude/segment/mixpanel/ga) and upload events via a proxy server. This library makes it easy for you. `withSyft` will set up the necessary rewrites and configure `SyftProvider` to use the local URLs so you don't have to make any changes in the client app.

**Notes:**

- Proxying will only work if you serve your site using `next start`. Statically generated sites won't be able to rewrite the requests.
- Bear in mind that tracking requests will be made to the same domain, so cookies will be forwarded. If this is an issue for you, from `next@13.0.0` you can use [middleware](https://nextjs.org/docs/advanced-features/middleware#setting-headers) to strip the cookies like this:

  ```js
  import { NextResponse } from "next/server";

  export function middleware(request) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("cookie", "");
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  export const config = {
    matcher: "/proxy/api/event",
  };
  ```

### Event Transformations / Enrichment

You can define event transformations in TS with the same conventions as request middleware. You'd write a file called syft/transformations.ts

```js
import { SyftEvent } from "@syftdata/client";

export function middleware(event: SyftEvent) {
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

## Support

For usage questions, bug reports, or feature requests, please open a github issue [here](https://github.com/syftdata/event-hub/issues). For general inquiries or reporting security issues, please contact us at hello@syftdata.com.

## Contributing

We welcome your contributions to make Syft better. Please follow [this doc](./CONTRIBUTING.md) to contribute to this repo.

## Build Status

![CI tests](https://github.com/syftdata/event-hub/actions/workflows/ci.yaml/badge.svg)
