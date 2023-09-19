---
sidebar_position: 5
---

# Configure Destinations

You can route events to multiple destinations with simple configuration.

Syft supports popular analytics, warehouse, and CRM providers as destinations. You can also route your events to Slack to get alerts for user activity!

To add a destination, first create an API endpoint (/api/syft) in your next.js app by creating the file with the code below. This endpoint will receive the events from your client components and route them to the destinations.

The example below shows June as a destination. You can find the list of supported destinations with their configuration details [here](/category/destinations)

### Page based routing

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
  const server = new NextSyftServer({ destinations });
  if (process && process.env.NODE_ENV === "development") {
    if (!(await server.validateSetup())) throw new Error("Invalid setup");
  }
  await server.handlePageApi(req, res);
}
```

### App based routing

```ts title="src/app/api/syft/route.ts"
import { type NextRequest } from "next";
import { NextSyftServer } from "@syftdata/next/lib/next";

const destinations = [
  {
    type: "june",
    settings: {
      apiKey: "xxxx",
    },
  },
];
export default async function POST(req: NextRequest) {
  const server = new NextSyftServer({ destinations });
  if (process && process.env.NODE_ENV === "development") {
    if (!(await server.validateSetup())) throw new Error("Invalid setup");
  }
  return await server.handleAppApi(req);
}
```

### Destination Field Mapping

Syft internally represents all payloads from `identify()/track()/group()` calls in a "unified" event object. It transforms this event object to a target payload for each destination. You can find this "mapping" documented in the "Data Modeling" section of each Destination doc in this guide.

### Custom Upload Endpoint

If you want to upload events to something other than `/api/syft`, you can do so by specifying `uploadPath`

```ts title="src/pages/_app.jsx"
<SyftProvider uploadPath="/client/api/syft" />
```
