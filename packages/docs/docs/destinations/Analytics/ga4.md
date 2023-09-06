---
sidebar_position: 13
---
# Google Analytics

This page describes how to set up Google Analytics 4 (GA4) as a destination.

## Set up
An example setup for the GA4 is shown below.

```ts title="src/pages/api/syft.ts"
// ...
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
// ...
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

#### Custom Event
Send any custom event

#### Matched events
type = "track"

#### Data Mapping
| Name                 | Type          | Description     | Default   |
| -------------------- | -------------- | -------------- | --------- |
| data_stream_type | string | The type of data stream this data belongs in. This can either be a web stream or a mobile app stream (iOS or Android). Possible values: "Web" (default) and "Mobile App". | "Web" |
| app_instance_id | string | Uniquely identifies a specific installation of a Firebase app. This value needs to be retrieved through the Firebase SDK. **Required for mobile app streams.** | (<br/>  "@path": "$.app_instance_id"<br/>) |
| clientId | string | Uniquely identifies a user instance of a web client. **Required for web streams.** | (<br/>  "@if": (<br/>    "exists": (<br/>      "@path": "$.userId"<br/>    ),<br/>    "then": (<br/>      "@path": "$.userId"<br/>    ),<br/>    "else": (<br/>      "@path": "$.anonymousId"<br/>    )<br/>  )<br/>) |
| user_id | string | A unique identifier for a user. See Google's [User-ID for cross-platform analysis](https://support.google.com/analytics/answer/9213390) and [Reporting: deduplicate user counts](https://support.google.com/analytics/answer/9355949?hl=en) documentation for more information on this identifier. | (<br/>  "@path": "$.user_id"<br/>) |
| timestamp_micros | string | A Unix timestamp (in microseconds) for the time to associate with the event. Segment will convert to Unix if not already converted. Events can be backdated up to 3 calendar days based on the property's timezone. | (<br/>  "@path": "$.timestamp"<br/>) |
| name | string | The unique name of the custom event created in GA4. GA4 does not accept spaces in event names so Segment will replace any spaces with underscores. More information about GA4 event name rules is available in [their docs](https://support.google.com/analytics/answer/10085872?hl=en&ref_topic=9756175#event-name-rules&zippy=%2Cin-this-article.%2Cin-this-article). | (<br/>  "@path": "$.event"<br/>) |
| lowercase | boolean | If true, the event name will be converted to lowercase before sending to Google. Event names are case sensitive in GA4 so enable this setting to avoid distinct events for casing differences. More information about GA4 event name rules is available in [their docs](https://support.google.com/analytics/answer/10085872?hl=en&ref_topic=9756175#event-name-rules&zippy=%2Cin-this-article.%2Cin-this-article). | false |
| user_properties | object | The user properties to send to Google Analytics 4. You must create user-scoped dimensions to ensure custom properties are picked up by Google. See Google’s [Custom user properties](https://support.google.com/analytics/answer/9269570) to learn how to set and register user properties.  | (<br/>  "@path": "$.user_properties"<br/>) |
| engagement_time_msec | number | The amount of time a user interacted with your site, in milliseconds. Google only counts users who interact with your site for a non-zero amount of time. By default, Segment sets engagement time to 1 so users are counted. | 1 |
| params | object | The event parameters to send to Google Analytics 4. | (<br/>  "@path": "$.params"<br/>) |
</details>
,<details>
<summary>Preset 2</summary>

#### Page View
Send page view when a user views a page

#### Matched events
type = "page" or type = "screen"

#### Data Mapping
| Name                 | Type          | Description     | Default   |
| -------------------- | -------------- | -------------- | --------- |
| data_stream_type | string | The type of data stream this data belongs in. This can either be a web stream or a mobile app stream (iOS or Android). Possible values: "Web" (default) and "Mobile App". | "Web" |
| app_instance_id | string | Uniquely identifies a specific installation of a Firebase app. This value needs to be retrieved through the Firebase SDK. **Required for mobile app streams.** | (<br/>  "@path": "$.app_instance_id"<br/>) |
| clientId | string | Uniquely identifies a user instance of a web client. **Required for web streams.** | (<br/>  "@if": (<br/>    "exists": (<br/>      "@path": "$.userId"<br/>    ),<br/>    "then": (<br/>      "@path": "$.userId"<br/>    ),<br/>    "else": (<br/>      "@path": "$.anonymousId"<br/>    )<br/>  )<br/>) |
| user_id | string | A unique identifier for a user. See Google's [User-ID for cross-platform analysis](https://support.google.com/analytics/answer/9213390) and [Reporting: deduplicate user counts](https://support.google.com/analytics/answer/9355949?hl=en) documentation for more information on this identifier. | (<br/>  "@path": "$.user_id"<br/>) |
| timestamp_micros | string | A Unix timestamp (in microseconds) for the time to associate with the event. Segment will convert to Unix if not already converted. Events can be backdated up to 3 calendar days based on the property's timezone. | (<br/>  "@path": "$.timestamp"<br/>) |
| page_location | string | The current page URL | (<br/>  "@path": "$.context.page.url"<br/>) |
| page_referrer | string | Previous page URL | (<br/>  "@path": "$.context.page.referrer"<br/>) |
| user_properties | object | The user properties to send to Google Analytics 4. You must create user-scoped dimensions to ensure custom properties are picked up by Google. See Google’s [Custom user properties](https://support.google.com/analytics/answer/9269570) to learn how to set and register user properties.  | (<br/>  "@path": "$.user_properties"<br/>) |
| page_title | string | The current page title | (<br/>  "@path": "$.context.page.title"<br/>) |
| engagement_time_msec | number | The amount of time a user interacted with your site, in milliseconds. Google only counts users who interact with your site for a non-zero amount of time. By default, Segment sets engagement time to 1 so users are counted. | 1 |
| params | object | The event parameters to send to Google Analytics 4. | (<br/>  "@path": "$.params"<br/>) |
</details>
,<details>
<summary>Preset 3</summary>

#### Login
Send event when a user logs in

#### Matched events
type = "identify"

#### Data Mapping
| Name                 | Type          | Description     | Default   |
| -------------------- | -------------- | -------------- | --------- |
| data_stream_type | string | The type of data stream this data belongs in. This can either be a web stream or a mobile app stream (iOS or Android). Possible values: "Web" (default) and "Mobile App". | "Web" |
| app_instance_id | string | Uniquely identifies a specific installation of a Firebase app. This value needs to be retrieved through the Firebase SDK. **Required for mobile app streams.** | (<br/>  "@path": "$.app_instance_id"<br/>) |
| client_id | string | Uniquely identifies a user instance of a web client. **Required for web streams.** | (<br/>  "@if": (<br/>    "exists": (<br/>      "@path": "$.userId"<br/>    ),<br/>    "then": (<br/>      "@path": "$.userId"<br/>    ),<br/>    "else": (<br/>      "@path": "$.anonymousId"<br/>    )<br/>  )<br/>) |
| user_id | string | A unique identifier for a user. See Google's [User-ID for cross-platform analysis](https://support.google.com/analytics/answer/9213390) and [Reporting: deduplicate user counts](https://support.google.com/analytics/answer/9355949?hl=en) documentation for more information on this identifier. | (<br/>  "@path": "$.user_id"<br/>) |
| timestamp_micros | string | A Unix timestamp (in microseconds) for the time to associate with the event. Segment will convert to Unix if not already converted. Events can be backdated up to 3 calendar days based on the property's timezone. | (<br/>  "@path": "$.timestamp"<br/>) |
| method | string | The method used to login. | (<br/>  "@path": "$.method"<br/>) |
| user_properties | object | The user properties to send to Google Analytics 4. You must create user-scoped dimensions to ensure custom properties are picked up by Google. See Google’s [Custom user properties](https://support.google.com/analytics/answer/9269570) to learn how to set and register user properties.  | (<br/>  "@path": "$.user_properties"<br/>) |
| engagement_time_msec | number | The amount of time a user interacted with your site, in milliseconds. Google only counts users who interact with your site for a non-zero amount of time. By default, Segment sets engagement time to 1 so users are counted. | 1 |
| params | object | The event parameters to send to Google Analytics 4. | (<br/>  "@path": "$.params"<br/>) |
</details>


