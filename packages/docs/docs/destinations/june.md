---
sidebar_position: 13
---
# June

This page describes how to set up the June as a destination.

## Set up
An example setup for the June is shown below.

```ts title="src/pages/api/syft.ts"
import { type NextApiRequest, type NextApiResponse } from "next";
// highlight-next-line
import { NextSyftServer } from "@syftdata/next/lib/next";

const destinations = [
  // highlight-start
  {
    type: "june",
    settings: {
        apiKey: "xxxx"
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
| apiKey | string | Your June API Key | true |  | 


## Data Modeling
<details>
<summary>Track Calls</summary>

#### Matched events
type = "track"

#### Data Mapping
| Name                 | Type          | Description     | Default   |
| -------------------- | -------------- | -------------- | --------- |
| event | string | test description | (<br/>  "@path": "$.event"<br/>) |
| properties | string | test description | (<br/>  "@path": "$.properties"<br/>) |
| timestamp | string | test description | (<br/>  "@path": "$.timestamp"<br/>) |
| anonymousId | string | test description | (<br/>  "@path": "$.anonymousId"<br/>) |
| userId | string | test description | (<br/>  "@path": "$.userId"<br/>) |
| context | string | test description | (<br/>  "@path": "$.context"<br/>) |
| messageId | string | test description | (<br/>  "@path": "$.messageId"<br/>) |
</details>
,<details>
<summary>Page Calls</summary>

#### Matched events
type = "page"

#### Data Mapping
| Name                 | Type          | Description     | Default   |
| -------------------- | -------------- | -------------- | --------- |
| anonymousId | string | test description | (<br/>  "@path": "$.anonymousId"<br/>) |
| userId | string | test description | (<br/>  "@path": "$.userId"<br/>) |
| properties | string | test description | (<br/>  "@path": "$.properties"<br/>) |
| name | string | test description | (<br/>  "@path": "$.properties.name"<br/>) |
| context | string | test description | (<br/>  "@path": "$.context"<br/>) |
| timestamp | string | test description | (<br/>  "@path": "$.timestamp"<br/>) |
| messageId | string | test description | (<br/>  "@path": "$.messageId"<br/>) |
</details>
,<details>
<summary>Identify Calls</summary>

#### Matched events
type = "identify"

#### Data Mapping
| Name                 | Type          | Description     | Default   |
| -------------------- | -------------- | -------------- | --------- |
| anonymousId | string | test description | (<br/>  "@path": "$.anonymousId"<br/>) |
| userId | string | test description | (<br/>  "@path": "$.userId"<br/>) |
| traits | string | test description | (<br/>  "@path": "$.traits"<br/>) |
| context | string | test description | (<br/>  "@path": "$.context"<br/>) |
| timestamp | string | test description | (<br/>  "@path": "$.timestamp"<br/>) |
| messageId | string | test description | (<br/>  "@path": "$.messageId"<br/>) |
</details>
,<details>
<summary>Group Calls</summary>

#### Matched events
type = "group"

#### Data Mapping
| Name                 | Type          | Description     | Default   |
| -------------------- | -------------- | -------------- | --------- |
| anonymousId | string | test description | (<br/>  "@path": "$.anonymousId"<br/>) |
| userId | string | test description | (<br/>  "@path": "$.userId"<br/>) |
| groupId | string | test description | (<br/>  "@path": "$.groupId"<br/>) |
| traits | string | test description | (<br/>  "@path": "$.traits"<br/>) |
| context | string | test description | (<br/>  "@path": "$.context"<br/>) |
| timestamp | string | test description | (<br/>  "@path": "$.timestamp"<br/>) |
| messageId | string | test description | (<br/>  "@path": "$.messageId"<br/>) |
</details>


