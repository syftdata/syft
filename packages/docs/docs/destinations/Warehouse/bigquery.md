---
sidebar_position: 12
---
# Bigquery

This page describes how to set up Bigquery as a destination.

## Set up
An example setup for Bigquery is shown below.

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
| Destination Field                 | Type          | Description     | Source Field   |
| -------------------- | -------------- | -------------- | --------- |
| _id | string | The unique ID of the track call itself. | $.messageId |
| anonymous_id | string | The anonymous ID of the user. | $.anonymousId |
| user_id | string | The User ID. | $.userId |
| context_ip | string | The IP address of the client. Non-user-related context fields sent with each track call. | $.context.ip |
| context_library_name | string | The Logging library name. Non-user-related context fields sent with each track call. | $.context.library.name |
| context_library_version | string | The Logging library version. Non-user-related context fields sent with each track call. | $.context.library.version |
| context_page_path | string | The path of the page on which the event was logged. | $.context.page.path |
| context_page_title | string | The title of the page on which the event was logged. | $.context.page.title |
| context_page_url | string | The full url of the page on which the event was logged. | $.context.page.url |
| context_locale | string | The browsers locale used when the event was logged. | $.context.locale |
| context_user_agent | string | The browsers user-agent string. | $.context.userAgent |
| event | string | The slug of the event name, so you can join the tracks table. | $.event |
| name | string | The event name. | $.name |
| received_at | datetime | When Syft received the track call. | $.receivedAt |
| sent_at | datetime | When a user triggered the track call. This timestamp can also be affected by device clock skew | $.sentAt |
| timestamp | datetime | The UTC-converted timestamp which is set by the Syft library | $.timestamp |
| properties | object | JSON representation of the properties for the event. | $.properties |
| context | object | JSON representation of the context | $.context |
</details>
,<details>
<summary>Identify Calls</summary>

#### Insert


#### Matched events
type = "identify" or type = "group"

#### Data Mapping
| Destination Field                 | Type          | Description     | Source Field   |
| -------------------- | -------------- | -------------- | --------- |
| _id | string | The unique ID of the track call itself. | $.messageId |
| anonymous_id | string | The anonymous ID of the user. | $.anonymousId |
| user_id | string | The User ID. | $.userId |
| context_ip | string | The IP address of the client. Non-user-related context fields sent with each track call. | $.context.ip |
| context_library_name | string | The Logging library name. Non-user-related context fields sent with each track call. | $.context.library.name |
| context_library_version | string | The Logging library version. Non-user-related context fields sent with each track call. | $.context.library.version |
| context_page_path | string | The path of the page on which the event was logged. | $.context.page.path |
| context_page_title | string | The title of the page on which the event was logged. | $.context.page.title |
| context_page_url | string | The full url of the page on which the event was logged. | $.context.page.url |
| context_locale | string | The browsers locale used when the event was logged. | $.context.locale |
| context_user_agent | string | The browsers user-agent string. | $.context.userAgent |
| event | string | The slug of the event name, so you can join the tracks table. | $.event |
| name | string | The event name. | $.name |
| received_at | datetime | When Syft received the track call. | $.receivedAt |
| sent_at | datetime | When a user triggered the track call. This timestamp can also be affected by device clock skew | $.sentAt |
| timestamp | datetime | The UTC-converted timestamp which is set by the Syft library | $.timestamp |
| properties | object | JSON representation of the properties for the event. | $.properties |
| context | object | JSON representation of the context | $.context |
</details>


