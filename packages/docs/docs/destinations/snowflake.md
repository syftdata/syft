---
sidebar_position: 16
---
# Snowflake

This page describes how to set up the Snowflake as a destination.

## Set up
An example setup for the Snowflake is shown below.

```ts title="src/pages/api/syft.ts"
import { type NextApiRequest, type NextApiResponse } from "next";
// highlight-next-line
import { NextSyftServer } from "@syftdata/next/lib/next";

const destinations = [
  // highlight-start
  {
    type: "snowflake",
    settings: {
        account: "xxxx",
        warehouse: "xxxx",
        database: "xxxx",
        schema: "xxxx",
        username: "xxxx",
        password: "xxxx"
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
| account | string | Your Snowflake Account | true |  |
| warehouse | string | Your Snowflake Warehouse | true |  |
| database | string | Your Snowflake Database | true |  |
| schema | string | Your Snowflake Schema | true |  |
| username | string | Your Snowflake Username | true |  |
| password | string | Your Snowflake Password. This is a secret field. | true |  | 


## Data Modeling
<details>
<summary>Track Calls</summary>

#### Matched events
type = "track" or type = "screen" or type = "page"

#### Data Mapping
| Name                 | Type          | Description     | Default   |
| -------------------- | -------------- | -------------- | --------- |
| _id | string | test description | (<br/>  "@path": "$.messageId"<br/>) |
| anonymous_id | string | test description | (<br/>  "@path": "$.anonymousId"<br/>) |
| user_id | string | test description | (<br/>  "@path": "$.userId"<br/>) |
| context_ip | string | test description | (<br/>  "@path": "$.context.ip"<br/>) |
| context_library_name | string | test description | (<br/>  "@path": "$.context.library.name"<br/>) |
| context_library_version | string | test description | (<br/>  "@path": "$.context.library.version"<br/>) |
| context_page_path | string | test description | (<br/>  "@path": "$.context.page.path"<br/>) |
| context_page_title | string | test description | (<br/>  "@path": "$.context.page.title"<br/>) |
| context_page_url | string | test description | (<br/>  "@path": "$.context.page.url"<br/>) |
| context_locale | string | test description | (<br/>  "@path": "$.context.locale"<br/>) |
| context_user_agent | string | test description | (<br/>  "@path": "$.context.userAgent"<br/>) |
| event | string | test description | (<br/>  "@path": "$.event"<br/>) |
| name | string | test description | (<br/>  "@path": "$.name"<br/>) |
| received_at | string | test description | (<br/>  "@path": "$.receivedAt"<br/>) |
| sent_at | string | test description | (<br/>  "@path": "$.sentAt"<br/>) |
| timestamp | string | test description | (<br/>  "@path": "$.timestamp"<br/>) |
| properties | string | test description | (<br/>  "@path": "$.properties"<br/>) |
| context | string | test description | (<br/>  "@path": "$.context"<br/>) |
</details>
,<details>
<summary>Identify Calls</summary>

#### Matched events
type = "identify" or type = "group"

#### Data Mapping
| Name                 | Type          | Description     | Default   |
| -------------------- | -------------- | -------------- | --------- |
| _id | string | test description | (<br/>  "@path": "$.messageId"<br/>) |
| anonymous_id | string | test description | (<br/>  "@path": "$.anonymousId"<br/>) |
| user_id | string | test description | (<br/>  "@path": "$.userId"<br/>) |
| context_ip | string | test description | (<br/>  "@path": "$.context.ip"<br/>) |
| context_library_name | string | test description | (<br/>  "@path": "$.context.library.name"<br/>) |
| context_library_version | string | test description | (<br/>  "@path": "$.context.library.version"<br/>) |
| context_page_path | string | test description | (<br/>  "@path": "$.context.page.path"<br/>) |
| context_page_title | string | test description | (<br/>  "@path": "$.context.page.title"<br/>) |
| context_page_url | string | test description | (<br/>  "@path": "$.context.page.url"<br/>) |
| context_locale | string | test description | (<br/>  "@path": "$.context.locale"<br/>) |
| context_user_agent | string | test description | (<br/>  "@path": "$.context.userAgent"<br/>) |
| event | string | test description | (<br/>  "@path": "$.event"<br/>) |
| name | string | test description | (<br/>  "@path": "$.name"<br/>) |
| received_at | string | test description | (<br/>  "@path": "$.receivedAt"<br/>) |
| sent_at | string | test description | (<br/>  "@path": "$.sentAt"<br/>) |
| timestamp | string | test description | (<br/>  "@path": "$.timestamp"<br/>) |
| properties | string | test description | (<br/>  "@path": "$.properties"<br/>) |
| context | string | test description | (<br/>  "@path": "$.context"<br/>) |
</details>


