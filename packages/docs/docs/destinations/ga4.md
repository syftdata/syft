---
sidebar_position: 18
---
# Ga4

This page describes how to set up the Ga4 as a destination.

## Set up
An example setup for the Ga4 is shown below.

```ts title="src/pages/api/syft.ts"
import { type NextApiRequest, type NextApiResponse } from "next";
// highlight-next-line
import { NextSyftServer } from "@syftdata/next/lib/next";

const destinations = [
  // highlight-start
  {
    type: "ga4",
    settings: {
        apiSecret: "xxxx"
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
| measurementId | string | The Measurement ID associated with a stream. Found in the Google Analytics UI under: Admin > Data Streams > choose your stream > Measurement ID. **Required for web streams.** | false |  |
| firebaseAppId | string | The Firebase App ID associated with the Firebase app. Found in the Firebase console under: Project Settings > General > Your Apps > App ID. **Required for mobile app streams.** | false |  |
| apiSecret | string | An API SECRET generated in the Google Analytics UI, navigate to: Admin > Data Streams > choose your stream > Measurement Protocol > Create | true |  | 


## Data Modeling
<details>
<summary>Preset 1</summary>

#### Matched events
type = "track"

#### Data Mapping
| Name                 | Type          | Description     | Default   |
| -------------------- | -------------- | -------------- | --------- |
| data_stream_type | string | test description | "Web" |
| app_instance_id | string | test description | (<br/>  "@path": "$.app_instance_id"<br/>) |
| clientId | string | test description | (<br/>  "@if": (<br/>    "exists": (<br/>      "@path": "$.userId"<br/>    ),<br/>    "then": (<br/>      "@path": "$.userId"<br/>    ),<br/>    "else": (<br/>      "@path": "$.anonymousId"<br/>    )<br/>  )<br/>) |
| user_id | string | test description | (<br/>  "@path": "$.user_id"<br/>) |
| timestamp_micros | string | test description | (<br/>  "@path": "$.timestamp"<br/>) |
| name | string | test description | (<br/>  "@path": "$.event"<br/>) |
| lowercase | string | test description | false |
| user_properties | string | test description | (<br/>  "@path": "$.user_properties"<br/>) |
| engagement_time_msec | string | test description | 1 |
| params | string | test description | (<br/>  "@path": "$.params"<br/>) |
</details>
,<details>
<summary>Preset 2</summary>

#### Matched events
type = "page" or type = "screen"

#### Data Mapping
| Name                 | Type          | Description     | Default   |
| -------------------- | -------------- | -------------- | --------- |
| data_stream_type | string | test description | "Web" |
| app_instance_id | string | test description | (<br/>  "@path": "$.app_instance_id"<br/>) |
| clientId | string | test description | (<br/>  "@if": (<br/>    "exists": (<br/>      "@path": "$.userId"<br/>    ),<br/>    "then": (<br/>      "@path": "$.userId"<br/>    ),<br/>    "else": (<br/>      "@path": "$.anonymousId"<br/>    )<br/>  )<br/>) |
| user_id | string | test description | (<br/>  "@path": "$.user_id"<br/>) |
| timestamp_micros | string | test description | (<br/>  "@path": "$.timestamp"<br/>) |
| page_location | string | test description | (<br/>  "@path": "$.context.page.url"<br/>) |
| page_referrer | string | test description | (<br/>  "@path": "$.context.page.referrer"<br/>) |
| user_properties | string | test description | (<br/>  "@path": "$.user_properties"<br/>) |
| page_title | string | test description | (<br/>  "@path": "$.context.page.title"<br/>) |
| engagement_time_msec | string | test description | 1 |
| params | string | test description | (<br/>  "@path": "$.params"<br/>) |
</details>
,<details>
<summary>Preset 3</summary>

#### Matched events
type = "identify"

#### Data Mapping
| Name                 | Type          | Description     | Default   |
| -------------------- | -------------- | -------------- | --------- |
| data_stream_type | string | test description | "Web" |
| app_instance_id | string | test description | (<br/>  "@path": "$.app_instance_id"<br/>) |
| client_id | string | test description | (<br/>  "@if": (<br/>    "exists": (<br/>      "@path": "$.userId"<br/>    ),<br/>    "then": (<br/>      "@path": "$.userId"<br/>    ),<br/>    "else": (<br/>      "@path": "$.anonymousId"<br/>    )<br/>  )<br/>) |
| user_id | string | test description | (<br/>  "@path": "$.user_id"<br/>) |
| timestamp_micros | string | test description | (<br/>  "@path": "$.timestamp"<br/>) |
| method | string | test description | (<br/>  "@path": "$.method"<br/>) |
| user_properties | string | test description | (<br/>  "@path": "$.user_properties"<br/>) |
| engagement_time_msec | string | test description | 1 |
| params | string | test description | (<br/>  "@path": "$.params"<br/>) |
</details>


