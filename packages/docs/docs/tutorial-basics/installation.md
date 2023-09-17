---
sidebar_position: 2
---

# Installation

Add Syft to your next.js application in less than 5 minutes.

```bash npm2yarn
npm install --save @syftdata/next
```

## Include the Analytics Script

### Page based routing

To enable Syft in your app you'll need to expose the Syft context. Include `<SyftProvider />`, at the top level of your application inside [`_app.js`](https://nextjs.org/docs/advanced-features/custom-app):

```jsx title="src/pages/_app.tsx"
// highlight-next-line
import { SyftProvider } from "@syftdata/next";

export default function MyApp({ Component, pageProps }) {
  return (
    // highlight-next-line
    <SyftProvider>
      <Component {...pageProps} />
      // highlight-next-line
    </SyftProvider>
  );
}
```

### App based routing

If are using [the app directory](https://beta.nextjs.org/docs/routing/fundamentals#the-app-directory) include `SyftProvider` inside the root layout:

```jsx title="src/app/layout.tsx"
// highlight-next-line
import { SyftProvider } from "@syftdata/next";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        // highlight-next-line
        <SyftProvider>{children}</SyftProvider>
      </body>
    </html>
  );
}
```
