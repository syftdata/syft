---
sidebar_position: 2
---

# Installation

```
npm install --save @syftdata/next
```

## Include the Analytics Script

### Page based routing

To enable Syft in your app you'll need to expose the Syft context. Include `<SyftProvider />`, at the top level of your application inside [`_app.js`](https://nextjs.org/docs/advanced-features/custom-app):

```jsx title="src/pages/_app.tsx"
import SyftProvider from "@syftdata/next";

export default function MyApp({ Component, pageProps }) {
  return (
    <SyftProvider>
      <Component {...pageProps} />
    </SyftProvider>
  );
}
```

### App based routing

If are using [the app directory](https://beta.nextjs.org/docs/routing/fundamentals#the-app-directory) include `SyftProvider` inside the root layout:

```jsx title="src/app/layout.tsx"
// app/layout.tsx
import SyftProvider from "@syftdata/next";

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
