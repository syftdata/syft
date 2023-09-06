---
sidebar_position: 5
---

# Destination setup

You can route events to multiple destinations with a simple configuration. Create an API endpoint (/api/syft) by creating the file with the below code. This example shows routing events to June.
You can setup cool stuff like slack alerts when a user becomes active / runs into a problem.

You can find list of supported [destinations here](/category/destinations)

```ts title="src/pages/api/syft.ts"
import { type NextApiRequest, type NextApiResponse } from "next";
import { NextSyftServer } from "@syftdata/next/lib/next";

const destinations = [
  {
    type: "june",
    settings: {
      apiKey: "xxxx",
    },
  },
];
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const server = new NextSyftServer({
    destinations,
  });
  await server.handlePageApi(req, res);
}
```

### Event Transformations / Enrichment

You can define event transformations and enrichments on the backend. You can query your DB and denormalize your events.

```ts title="src/pages/api/syft.ts"
const server = new NextSyftServer({
  destinations,
  enricher: (event) => {
    event.context.ab_featurex_enabled = true;
  },
});
```
