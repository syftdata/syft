---
sidebar_position: 12
---
# Bigquery

This page describes how to set up the Bigquery as a destination.

## Set up
An example setup for the Bigquery is shown below.

```ts title="src/pages/api/syft.ts"
// ...
const destinations = [
  // highlight-start
  {
    type: "bigquery",
    settings: {
        projectId: "xxxx",
        dataset: "xxxx"
    },
  },
  // highlight-end
];
// ...
```

### Configuration options

| Name                 | Type           | Description     | Required | Default         |
| -------------------- | -------------- | --------------- | -------- | --------------- |
| projectId | string | Your Google Cloud project ID | true |  |
| dataset | string | The dataset to insert events into | true |  |
| keyFile | string | Path to your Google Cloud key file | false |  |
| keyData | string | The contents of your Google Cloud key file | false |  | 


## Data Modeling
<details>
<summary>Track Calls</summary>

#### Insert


#### Matched events
type = "track" or type = "screen" or type = "page"

#### Data Mapping
| Name                 | Type          | Description     | Default   |
| -------------------- | -------------- | -------------- | --------- |
| _id | string | The unique ID of the track call itself. | (<br/>  "@path": "$.messageId"<br/>) |
| anonymous_id | string | The anonymous ID of the user. | (<br/>  "@path": "$.anonymousId"<br/>) |
| user_id | string | The User ID. | (<br/>  "@path": "$.userId"<br/>) |
| context_ip | string | The IP address of the client. Non-user-related context fields sent with each track call. | (<br/>  "@path": "$.context.ip"<br/>) |
| context_library_name | string | The Logging library name. Non-user-related context fields sent with each track call. | (<br/>  "@path": "$.context.library.name"<br/>) |
| context_library_version | string | The Logging library version. Non-user-related context fields sent with each track call. | (<br/>  "@path": "$.context.library.version"<br/>) |
| context_page_path | string | The path of the page on which the event was logged. | (<br/>  "@path": "$.context.page.path"<br/>) |
| context_page_title | string | The title of the page on which the event was logged. | (<br/>  "@path": "$.context.page.title"<br/>) |
| context_page_url | string | The full url of the page on which the event was logged. | (<br/>  "@path": "$.context.page.url"<br/>) |
| context_locale | string | The browsers locale used when the event was logged. | (<br/>  "@path": "$.context.locale"<br/>) |
| context_user_agent | string | The browsers user-agent string. | (<br/>  "@path": "$.context.userAgent"<br/>) |
| event | string | The slug of the event name, so you can join the tracks table. | (<br/>  "@path": "$.event"<br/>) |
| name | string | The event name. | (<br/>  "@path": "$.name"<br/>) |
| received_at | datetime | When Segment received the track call. | (<br/>  "@path": "$.receivedAt"<br/>) |
| sent_at | datetime | When a user triggered the track call. This timestamp can also be affected by device clock skew | (<br/>  "@path": "$.sentAt"<br/>) |
| timestamp | datetime | The UTC-converted timestamp which is set by the Segment library | (<br/>  "@path": "$.timestamp"<br/>) |
| properties | object | JSON representation of the properties for the event. | (<br/>  "@path": "$.properties"<br/>) |
| context | object | JSON representation of the context | (<br/>  "@path": "$.context"<br/>) |
</details>
,<details>
<summary>Identify Calls</summary>

#### Insert


#### Matched events
type = "identify" or type = "group"

#### Data Mapping
| Name                 | Type          | Description     | Default   |
| -------------------- | -------------- | -------------- | --------- |
| _id | string | The unique ID of the track call itself. | (<br/>  "@path": "$.messageId"<br/>) |
| anonymous_id | string | The anonymous ID of the user. | (<br/>  "@path": "$.anonymousId"<br/>) |
| user_id | string | The User ID. | (<br/>  "@path": "$.userId"<br/>) |
| context_ip | string | The IP address of the client. Non-user-related context fields sent with each track call. | (<br/>  "@path": "$.context.ip"<br/>) |
| context_library_name | string | The Logging library name. Non-user-related context fields sent with each track call. | (<br/>  "@path": "$.context.library.name"<br/>) |
| context_library_version | string | The Logging library version. Non-user-related context fields sent with each track call. | (<br/>  "@path": "$.context.library.version"<br/>) |
| context_page_path | string | The path of the page on which the event was logged. | (<br/>  "@path": "$.context.page.path"<br/>) |
| context_page_title | string | The title of the page on which the event was logged. | (<br/>  "@path": "$.context.page.title"<br/>) |
| context_page_url | string | The full url of the page on which the event was logged. | (<br/>  "@path": "$.context.page.url"<br/>) |
| context_locale | string | The browsers locale used when the event was logged. | (<br/>  "@path": "$.context.locale"<br/>) |
| context_user_agent | string | The browsers user-agent string. | (<br/>  "@path": "$.context.userAgent"<br/>) |
| event | string | The slug of the event name, so you can join the tracks table. | (<br/>  "@path": "$.event"<br/>) |
| name | string | The event name. | (<br/>  "@path": "$.name"<br/>) |
| received_at | datetime | When Segment received the track call. | (<br/>  "@path": "$.receivedAt"<br/>) |
| sent_at | datetime | When a user triggered the track call. This timestamp can also be affected by device clock skew | (<br/>  "@path": "$.sentAt"<br/>) |
| timestamp | datetime | The UTC-converted timestamp which is set by the Segment library | (<br/>  "@path": "$.timestamp"<br/>) |
| properties | object | JSON representation of the properties for the event. | (<br/>  "@path": "$.properties"<br/>) |
| context | object | JSON representation of the context | (<br/>  "@path": "$.context"<br/>) |
</details>


