---
sidebar_position: 5
---

# Configure Destinations

You can route events to multiple destinations with simple configuration. 

Syft supports popular analytics, warehouse, and CRM providers as destinations. You can also route your events to Slack to get alerts for user activity!

To add a destination, first create an API endpoint (/api/syft) in your next.js app by creating the file with the code below. This endpoint will receive the events from your client components and route them to the destinations.

The example below shows June as a destination. You can find the list of supported destinations with their configuration details [here](/category/destinations)

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

### Custom Upload Endpoint

If you want to upload events to something other than `/api/syft`, you can do so by specifying `uploadPath`

```js
// pages/_app.jsx
<SyftProvider uploadPath="/client/api/syft" />
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
