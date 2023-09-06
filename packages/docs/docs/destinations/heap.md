---
sidebar_position: 12
---
# Heap

This page describes how to set up the Heap as a destination.

## Set up
An example setup for the Heap is shown below.

```ts title="src/pages/api/syft.ts"
import { type NextApiRequest, type NextApiResponse } from "next";
// highlight-next-line
import { NextSyftServer } from "@syftdata/next/lib/next";

const destinations = [
  // highlight-start
  {
    type: "heap",
    settings: {
        appId: "xxxx"
    },
  },
  // highlight-end
];
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const server = new NextSyftServer({ destinations });
  await server.handlePageApi(req, res);
}
```

### Configuration options

| Name                 | Type           | Description     | Required | Default         |
| -------------------- | -------------- | --------------- | -------- | --------------- |
| appId | string | The app_id corresponding to one of your projects. | true |  | 


## Data Modeling
<details>
<summary>Track Calls</summary>

#### Matched events
type = "track" or type = "page" or type = "screen"

#### Data Mapping
| Name                 | Type          | Description     | Default   |
| -------------------- | -------------- | -------------- | --------- |
| message_id | string | test description | (<br/>  "@path": "$.messageId"<br/>) |
| anonymous_id | string | test description | (<br/>  "@path": "$.anonymousId"<br/>) |
| event | string | test description | (<br/>  "@path": "$.event"<br/>) |
| properties | string | test description | (<br/>  "@path": "$.properties"<br/>) |
| timestamp | string | test description | (<br/>  "@path": "$.timestamp"<br/>) |
| type | string | test description | (<br/>  "@path": "$.type"<br/>) |
| name | string | test description | (<br/>  "@path": "$.name"<br/>) |
| traits | string | test description | (<br/>  "@path": "$.context.traits"<br/>) |
</details>
,<details>
<summary>Identify Calls</summary>

#### Matched events
type = "identify"

#### Data Mapping
| Name                 | Type          | Description     | Default   |
| -------------------- | -------------- | -------------- | --------- |
| user_id | string | test description | (<br/>  "@path": "$.userId"<br/>) |
| anonymous_id | string | test description | (<br/>  "@path": "$.anonymousId"<br/>) |
| traits | string | test description | (<br/>  "@path": "$.traits"<br/>) |
</details>


