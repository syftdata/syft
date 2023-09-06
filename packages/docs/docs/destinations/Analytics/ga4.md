---
sidebar_position: 13
---
# Google Analytics 4

This page describes how to set up Google Analytics 4 as a destination.

## Set up
An example setup for Google Analytics 4 is shown below.

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
<summary>Custom Event</summary>

#### Custom Event
Send any custom event

#### Matched events
type = "track"

#### Data Mapping
| Destination Field                 | Type          | Description     | Source Field   |
| -------------------- | -------------- | -------------- | --------- |
| data_stream_type | string | The type of data stream this data belongs in. This can either be a web stream or a mobile app stream (iOS or Android). Possible values: "Web" (default) and "Mobile App". | "Web" |
| app_instance_id | string | Uniquely identifies a specific installation of a Firebase app. This value needs to be retrieved through the Firebase SDK. **Required for mobile app streams.** | $.app_instance_id |
| clientId | string | Uniquely identifies a user instance of a web client. **Required for web streams.** | $.userId ?? $.anonymousId |
| user_id | string | A unique identifier for a user. See Google's [User-ID for cross-platform analysis](https://support.google.com/analytics/answer/9213390) and [Reporting: deduplicate user counts](https://support.google.com/analytics/answer/9355949?hl=en) documentation for more information on this identifier. | $.user_id |
| timestamp_micros | string | A Unix timestamp (in microseconds) for the time to associate with the event. Syft will convert to Unix if not already converted. Events can be backdated up to 3 calendar days based on the property's timezone. | $.timestamp |
| name | string | The unique name of the custom event created in GA4. GA4 does not accept spaces in event names so Syft will replace any spaces with underscores. More information about GA4 event name rules is available in [their docs](https://support.google.com/analytics/answer/10085872?hl=en&ref_topic=9756175#event-name-rules&zippy=%2Cin-this-article.%2Cin-this-article). | $.event |
| lowercase | boolean | If true, the event name will be converted to lowercase before sending to Google. Event names are case sensitive in GA4 so enable this setting to avoid distinct events for casing differences. More information about GA4 event name rules is available in [their docs](https://support.google.com/analytics/answer/10085872?hl=en&ref_topic=9756175#event-name-rules&zippy=%2Cin-this-article.%2Cin-this-article). | false |
| user_properties | object | The user properties to send to Google Analytics 4. You must create user-scoped dimensions to ensure custom properties are picked up by Google. See Google’s [Custom user properties](https://support.google.com/analytics/answer/9269570) to learn how to set and register user properties.  | $.user_properties |
| engagement_time_msec | number | The amount of time a user interacted with your site, in milliseconds. Google only counts users who interact with your site for a non-zero amount of time. By default, Syft sets engagement time to 1 so users are counted. | 1 |
| params | object | The event parameters to send to Google Analytics 4. | $.params |
</details>
,<details>
<summary>Page View</summary>

#### Page View
Send page view when a user views a page

#### Matched events
type = "page" or type = "screen"

#### Data Mapping
| Destination Field                 | Type          | Description     | Source Field   |
| -------------------- | -------------- | -------------- | --------- |
| data_stream_type | string | The type of data stream this data belongs in. This can either be a web stream or a mobile app stream (iOS or Android). Possible values: "Web" (default) and "Mobile App". | "Web" |
| app_instance_id | string | Uniquely identifies a specific installation of a Firebase app. This value needs to be retrieved through the Firebase SDK. **Required for mobile app streams.** | $.app_instance_id |
| clientId | string | Uniquely identifies a user instance of a web client. **Required for web streams.** | $.userId ?? $.anonymousId |
| user_id | string | A unique identifier for a user. See Google's [User-ID for cross-platform analysis](https://support.google.com/analytics/answer/9213390) and [Reporting: deduplicate user counts](https://support.google.com/analytics/answer/9355949?hl=en) documentation for more information on this identifier. | $.user_id |
| timestamp_micros | string | A Unix timestamp (in microseconds) for the time to associate with the event. Syft will convert to Unix if not already converted. Events can be backdated up to 3 calendar days based on the property's timezone. | $.timestamp |
| page_location | string | The current page URL | $.context.page.url |
| page_referrer | string | Previous page URL | $.context.page.referrer |
| user_properties | object | The user properties to send to Google Analytics 4. You must create user-scoped dimensions to ensure custom properties are picked up by Google. See Google’s [Custom user properties](https://support.google.com/analytics/answer/9269570) to learn how to set and register user properties.  | $.user_properties |
| page_title | string | The current page title | $.context.page.title |
| engagement_time_msec | number | The amount of time a user interacted with your site, in milliseconds. Google only counts users who interact with your site for a non-zero amount of time. By default, Syft sets engagement time to 1 so users are counted. | 1 |
| params | object | The event parameters to send to Google Analytics 4. | $.params |
</details>
,<details>
<summary>Login</summary>

#### Login
Send event when a user logs in

#### Matched events
type = "identify"

#### Data Mapping
| Destination Field                 | Type          | Description     | Source Field   |
| -------------------- | -------------- | -------------- | --------- |
| data_stream_type | string | The type of data stream this data belongs in. This can either be a web stream or a mobile app stream (iOS or Android). Possible values: "Web" (default) and "Mobile App". | "Web" |
| app_instance_id | string | Uniquely identifies a specific installation of a Firebase app. This value needs to be retrieved through the Firebase SDK. **Required for mobile app streams.** | $.app_instance_id |
| client_id | string | Uniquely identifies a user instance of a web client. **Required for web streams.** | $.userId ?? $.anonymousId |
| user_id | string | A unique identifier for a user. See Google's [User-ID for cross-platform analysis](https://support.google.com/analytics/answer/9213390) and [Reporting: deduplicate user counts](https://support.google.com/analytics/answer/9355949?hl=en) documentation for more information on this identifier. | $.user_id |
| timestamp_micros | string | A Unix timestamp (in microseconds) for the time to associate with the event. Syft will convert to Unix if not already converted. Events can be backdated up to 3 calendar days based on the property's timezone. | $.timestamp |
| method | string | The method used to login. | $.method |
| user_properties | object | The user properties to send to Google Analytics 4. You must create user-scoped dimensions to ensure custom properties are picked up by Google. See Google’s [Custom user properties](https://support.google.com/analytics/answer/9269570) to learn how to set and register user properties.  | $.user_properties |
| engagement_time_msec | number | The amount of time a user interacted with your site, in milliseconds. Google only counts users who interact with your site for a non-zero amount of time. By default, Syft sets engagement time to 1 so users are counted. | 1 |
| params | object | The event parameters to send to Google Analytics 4. | $.params |
</details>


