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

#### Track Event
Send an event to June. [Learn more about Events in June](https://www.june.so/docs/users/track)

#### Matched events
type = "track"

#### Data Mapping
| Name                 | Type          | Description     | Default   |
| -------------------- | -------------- | -------------- | --------- |
| event | string | The event name | (<br/>  "@path": "$.event"<br/>) |
| properties | object | Properties to send with the event | (<br/>  "@path": "$.properties"<br/>) |
| timestamp | string | The timestamp of the event | (<br/>  "@path": "$.timestamp"<br/>) |
| anonymousId | string | The anonymous ID associated with the user | (<br/>  "@path": "$.anonymousId"<br/>) |
| userId | string | The ID associated with the user | (<br/>  "@path": "$.userId"<br/>) |
| context | object | Context properties to send with the event | (<br/>  "@path": "$.context"<br/>) |
| messageId | string | The Segment messageId | (<br/>  "@path": "$.messageId"<br/>) |
</details>
,<details>
<summary>Page Calls</summary>

#### Page Event
Send a page event to June. [Learn more about Events in June](https://www.june.so/docs/users/track)

#### Matched events
type = "page"

#### Data Mapping
| Name                 | Type          | Description     | Default   |
| -------------------- | -------------- | -------------- | --------- |
| anonymousId | string | An anonymous identifier | (<br/>  "@path": "$.anonymousId"<br/>) |
| userId | string | The ID associated with the user | (<br/>  "@path": "$.userId"<br/>) |
| properties | object | Page properties | (<br/>  "@path": "$.properties"<br/>) |
| name | string | The name of the page | (<br/>  "@path": "$.properties.name"<br/>) |
| context | object | Context properties to send with the event | (<br/>  "@path": "$.context"<br/>) |
| timestamp | string | The timestamp of the event | (<br/>  "@path": "$.timestamp"<br/>) |
| messageId | string | The Segment messageId | (<br/>  "@path": "$.messageId"<br/>) |
</details>
,<details>
<summary>Identify Calls</summary>

#### Identify
Identify user in June

#### Matched events
type = "identify"

#### Data Mapping
| Name                 | Type          | Description     | Default   |
| -------------------- | -------------- | -------------- | --------- |
| anonymousId | string | An anonymous identifier | (<br/>  "@path": "$.anonymousId"<br/>) |
| userId | string | The ID associated with the user | (<br/>  "@path": "$.userId"<br/>) |
| traits | object | Traits to associate with the user | (<br/>  "@path": "$.traits"<br/>) |
| context | object | Context properties to send with the event | (<br/>  "@path": "$.context"<br/>) |
| timestamp | string | The timestamp of the event | (<br/>  "@path": "$.timestamp"<br/>) |
| messageId | string | The Segment messageId | (<br/>  "@path": "$.messageId"<br/>) |
</details>
,<details>
<summary>Group Calls</summary>

#### Group
Group user in June

#### Matched events
type = "group"

#### Data Mapping
| Name                 | Type          | Description     | Default   |
| -------------------- | -------------- | -------------- | --------- |
| anonymousId | string | Anonymous id | (<br/>  "@path": "$.anonymousId"<br/>) |
| userId | string | The ID associated with the user | (<br/>  "@path": "$.userId"<br/>) |
| groupId | string | The group id | (<br/>  "@path": "$.groupId"<br/>) |
| traits | object | Traits to associate with the group | (<br/>  "@path": "$.traits"<br/>) |
| context | object | Context properties to send with the event | (<br/>  "@path": "$.context"<br/>) |
| timestamp | string | The timestamp of the event | (<br/>  "@path": "$.timestamp"<br/>) |
| messageId | string | The Segment messageId | (<br/>  "@path": "$.messageId"<br/>) |
</details>


