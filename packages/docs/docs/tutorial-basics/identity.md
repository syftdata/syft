---
sidebar_position: 4
---

# Identify users and companies

Syft's identify call's behavior is very similar to Segment's. Syft library generates and manages annonymous-id (UUID) for you. It stores it in the cookie and browser's local storage so that the developer has access to it both on the server and the client. This annonymous-id gets included in every event that is generated.

Annonymous-id get reset when an user clears their cookies and local-storage.

## Identify your users.

Use the `identify()` method to identify your product's users. This will help you track users who are triggering events. An example usage looks like this:

```jsx
import { useSyft } from "@syftdata/next";

const syft = useSyft();
useEffect(() => {
  if (user != null) {
    syft.identify(user.id, {
      email: user.email,
    });
  }
}, [syft, user]);
```

## Identify your users' companies.

Use the `group()` method to identify your user's groups / companies. **NOTE:** always call identify before calling group.

```jsx
import { useSyft } from "@syftdata/next";

const syft = useSyft();
useEffect(() => {
  if (user != null) {
    syft.group(user.orgId, {
      name: user.orgName,
    });
  }
}, [syft, user]);
```
