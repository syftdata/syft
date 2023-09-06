---
sidebar_position: 4
---

# Identify users and companies

Identify the users and the companies who are using your app.

## Identify your users.

Use the `identify()` call to identify which users are triggering events. Call it every time the user changes in your app. Syft's `identify()` call behaves very similarly to [Segment's](https://segment.com/docs/connections/sources/catalog/libraries/website/javascript/identity/). 

An example usage looks like this:

```jsx
// highlight-next-line
import { useSyft } from "@syftdata/next";

export default function NavBar() {
  // highlight-next-line
  const syft = useSyft();
  useEffect(() => {
    if (user != null) {
      // highlight-next-line
      syft.identify(user.id, {
        email: user.email,
      });
    }
  }, [user]);
  // ...
}
```

## Identify your users' companies.

Use the `group()` method to identify your user's groups / companies. **NOTE:** always call identify before calling group.

```jsx
// highlight-next-line
import { useSyft } from "@syftdata/next";

export default function NavBar() {
  // highlight-next-line
  const syft = useSyft();
  useEffect(() => {
    if (user != null) {
      // highlight-next-line
      syft.group(user.orgId, {
        name: user.orgName,
      });
    }
  }, [user]);
  // ...
}
```
