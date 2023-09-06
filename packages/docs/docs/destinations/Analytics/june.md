---
sidebar_position: 16
---
# June

This page describes how to set up June as a destination.

## Set up
An example setup for June is shown below.

```ts title="src/pages/api/syft.ts"
// ...
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
// ...
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
| Destination Field                 | Type          | Description     | Source Field   |
| -------------------- | -------------- | -------------- | --------- |
| event | string | The event name | $.event |
| properties | object | Properties to send with the event | $.properties |
| timestamp | string | The timestamp of the event | $.timestamp |
| anonymousId | string | The anonymous ID associated with the user | $.anonymousId |
| userId | string | The ID associated with the user | $.userId |
| context | object | Context properties to send with the event | $.context |
| messageId | string | The Syft messageId | $.messageId |
</details>
,<details>
<summary>Page Calls</summary>

#### Page Event
Send a page event to June. [Learn more about Events in June](https://www.june.so/docs/users/track)

#### Matched events
type = "page"

#### Data Mapping
| Destination Field                 | Type          | Description     | Source Field   |
| -------------------- | -------------- | -------------- | --------- |
| anonymousId | string | An anonymous identifier | $.anonymousId |
| userId | string | The ID associated with the user | $.userId |
| properties | object | Page properties | $.properties |
| name | string | The name of the page | $.properties.name |
| context | object | Context properties to send with the event | $.context |
| timestamp | string | The timestamp of the event | $.timestamp |
| messageId | string | The Syft messageId | $.messageId |
</details>
,<details>
<summary>Identify Calls</summary>

#### Identify
Identify user in June

#### Matched events
type = "identify"

#### Data Mapping
| Destination Field                 | Type          | Description     | Source Field   |
| -------------------- | -------------- | -------------- | --------- |
| anonymousId | string | An anonymous identifier | $.anonymousId |
| userId | string | The ID associated with the user | $.userId |
| traits | object | Traits to associate with the user | $.traits |
| context | object | Context properties to send with the event | $.context |
| timestamp | string | The timestamp of the event | $.timestamp |
| messageId | string | The Syft messageId | $.messageId |
</details>
,<details>
<summary>Group Calls</summary>

#### Group
Group user in June

#### Matched events
type = "group"

#### Data Mapping
| Destination Field                 | Type          | Description     | Source Field   |
| -------------------- | -------------- | -------------- | --------- |
| anonymousId | string | Anonymous id | $.anonymousId |
| userId | string | The ID associated with the user | $.userId |
| groupId | string | The group id | $.groupId |
| traits | object | Traits to associate with the group | $.traits |
| context | object | Context properties to send with the event | $.context |
| timestamp | string | The timestamp of the event | $.timestamp |
| messageId | string | The Syft messageId | $.messageId |
</details>


