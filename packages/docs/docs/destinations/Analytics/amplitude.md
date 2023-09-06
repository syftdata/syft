---
sidebar_position: 11
---
# Amplitude

This page describes how to set up Amplitude as a destination.

## Set up
An example setup for Amplitude is shown below.

```ts title="src/pages/api/syft.ts"
// ...
const destinations = [
  // highlight-start
  {
    type: "amplitude",
    settings: {
        apiKey: "xxxx",
        secretKey: "xxxx"
    },
  },
  // highlight-end
];
// ...
```

### Configuration options

| Name                 | Type           | Description     | Required | Default         |
| -------------------- | -------------- | --------------- | -------- | --------------- |
| apiKey | string | Amplitude project API key. You can find this key in the "General" tab of your Amplitude project. | true |  |
| secretKey | string | Amplitude project secret key. You can find this key in the "General" tab of your Amplitude project. | true |  |
| endpoint | string | The region to send your data. | false | north_america | 


## Data Modeling
<details>
<summary>Track Calls</summary>

#### Log Event V2
Send an event to Amplitude

#### Matched events
type = "track" and event != "Order Completed"

#### Data Mapping
| Destination Field                 | Type          | Description     | Source Field   |
| -------------------- | -------------- | -------------- | --------- |
| user_id | string | A readable ID specified by you. Must have a minimum length of 5 characters. Required unless device ID is present. **Note:** If you send a request with a user ID that is not in the Amplitude system yet, then the user tied to that ID will not be marked new until their first event. | $.userId |
| device_id | string | A device-specific identifier, such as the Identifier for Vendor on iOS. Required unless user ID is present. If a device ID is not sent with the event, it will be set to a hashed version of the user ID. | $.context.device.id ?? $.anonymousId |
| event_type | string | A unique identifier for your event. | $.event |
| session_id | datetime | The start time of the session, necessary if you want to associate events with a particular system. To use automatic Amplitude session tracking in browsers, enable Analytics 2.0 on your connected source. | $.integrations.Actions Amplitude.session_id |
| time | datetime | The timestamp of the event. If time is not sent with the event, it will be set to the request upload time. | $.timestamp |
| event_properties | object | An object of key-value pairs that represent additional data to be sent along with the event. You can store property values in an array, but note that Amplitude only supports one-dimensional arrays. Date values are transformed into string values. Object depth may not exceed 40 layers. | $.properties |
| user_properties | object | An object of key-value pairs that represent additional data tied to the user. You can store property values in an array, but note that Amplitude only supports one-dimensional arrays. Date values are transformed into string values. Object depth may not exceed 40 layers. | $.traits |
| groups | object | Groups of users for the event as an event-level group. You can only track up to 5 groups. **Note:** This Amplitude feature is only available to Enterprise customers who have purchased the Accounts add-on. | $.groups |
| app_version | string | The current version of your application. | $.context.app.version |
| platform | string | Platform of the device. | $.context.device.type |
| os_name | string | The name of the mobile operating system or browser that the user is using. | $.context.os.name |
| os_version | string | The version of the mobile operating system or browser the user is using. | $.context.os.version |
| device_brand | string | The device brand that the user is using. | $.context.device.brand |
| device_manufacturer | string | The device manufacturer that the user is using. | $.context.device.manufacturer |
| device_model | string | The device model that the user is using. | $.context.device.model |
| carrier | string | The carrier that the user is using. | $.context.network.carrier |
| country | string | The current country of the user. | $.context.location.country |
| region | string | The current region of the user. | $.context.location.region |
| city | string | The current city of the user. | $.context.location.city |
| dma | string | The current Designated Market Area of the user. | $.dma |
| language | string | The language set by the user. | $.context.locale |
| price | number | The price of the item purchased. Required for revenue data if the revenue field is not sent. You can use negative values to indicate refunds. | $.properties.price |
| quantity | integer | The quantity of the item purchased. Defaults to 1 if not specified. | $.properties.quantity |
| revenue | number | Revenue = price * quantity. If you send all 3 fields of price, quantity, and revenue, then (price * quantity) will be used as the revenue value. You can use negative values to indicate refunds. **Note:** You will need to explicitly set this if you are using the Amplitude in cloud-mode. | $.properties.revenue |
| productId | string | An identifier for the item purchased. You must send a price and quantity or revenue with this field. | $.properties.productId |
| revenueType | string | The type of revenue for the item purchased. You must send a price and quantity or revenue with this field. | $.properties.revenueType |
| location_lat | number | The current Latitude of the user. | $.context.location.latitude |
| location_lng | number | The current Longitude of the user. | $.context.location.longitude |
| ip | string | The IP address of the user. Use "$remote" to use the IP address on the upload request. Amplitude will use the IP address to reverse lookup a user's location (city, country, region, and DMA). Amplitude has the ability to drop the location and IP address from events once it reaches our servers. You can submit a request to Amplitude's platform specialist team here to configure this for you. | $.context.ip |
| idfa | string | Identifier for Advertiser. _(iOS)_ | $.context.device.advertisingId ?? $.context.device.idfa |
| idfv | string | Identifier for Vendor. _(iOS)_ | $.context.device.id |
| adid | string | Google Play Services advertising ID. _(Android)_ | $.context.device.advertisingId ?? $.context.device.idfa |
| android_id | string | Android ID (not the advertising ID). _(Android)_ | $.android_id |
| event_id | integer | An incrementing counter to distinguish events with the same user ID and timestamp from each other. Amplitude recommends you send an event ID, increasing over time, especially if you expect events to occur simultanenously. | $.event_id |
| insert_id | string | Amplitude will deduplicate subsequent events sent with this ID we have already seen before within the past 7 days. Amplitude recommends generating a UUID or using some combination of device ID, user ID, event type, event ID, and time. | $.insert_id |
| library | string | The name of the library that generated the event. | $.context.library.name |
| products | object | The list of products purchased. | <pre>{<br/>  "@arrayPath": [<br/>    "$.properties.products",<br/>    {<br/>      "price": {<br/>        "@path": "price"<br/>      },<br/>      "revenue": {<br/>        "@path": "revenue"<br/>      },<br/>      "quantity": {<br/>        "@path": "quantity"<br/>      },<br/>      "productId": {<br/>        "@path": "productId"<br/>      },<br/>      "revenueType": {<br/>        "@path": "revenueType"<br/>      }<br/>    }<br/>  ]<br/>}</pre> |
| setOnce | object | The following fields will be set only once per session when using AJS2 as the source. | <pre>{<br/>  "initial_referrer": {<br/>    "@path": "$.context.page.referrer"<br/>  },<br/>  "initial_utm_source": {<br/>    "@path": "$.context.campaign.source"<br/>  },<br/>  "initial_utm_medium": {<br/>    "@path": "$.context.campaign.medium"<br/>  },<br/>  "initial_utm_campaign": {<br/>    "@path": "$.context.campaign.name"<br/>  },<br/>  "initial_utm_term": {<br/>    "@path": "$.context.campaign.term"<br/>  },<br/>  "initial_utm_content": {<br/>    "@path": "$.context.campaign.content"<br/>  }<br/>}</pre> |
| setAlways | object | The following fields will be set every session when using AJS2 as the source. | <pre>{<br/>  "referrer": {<br/>    "@path": "$.context.page.referrer"<br/>  },<br/>  "utm_source": {<br/>    "@path": "$.context.campaign.source"<br/>  },<br/>  "utm_medium": {<br/>    "@path": "$.context.campaign.medium"<br/>  },<br/>  "utm_campaign": {<br/>    "@path": "$.context.campaign.name"<br/>  },<br/>  "utm_term": {<br/>    "@path": "$.context.campaign.term"<br/>  },<br/>  "utm_content": {<br/>    "@path": "$.context.campaign.content"<br/>  }<br/>}</pre> |
| add | object | Increment a user property by a number with add. If the user property doesn't have a value set yet, it's initialized to 0. | $.add |
| use_batch_endpoint | boolean | If true, events are sent to Amplitude's `batch` endpoint rather than their `httpapi` events endpoint. Enabling this setting may help reduce 429s – or throttling errors – from Amplitude. More information about Amplitude's throttling is available in [their docs](https://developers.amplitude.com/docs/batch-event-upload-api#429s-in-depth). | false |
| userAgent | string | The user agent of the device sending the event. | $.context.userAgent |
| userAgentParsing | boolean | Enabling this setting will set the Device manufacturer, Device Model and OS Name properties based on the user agent string provided in the userAgent field. | true |
| min_id_length | integer | Amplitude has a default minimum id length of 5 characters for user_id and device_id fields. This field allows the minimum to be overridden to allow shorter id lengths. | $.min_id_length |
</details>
,<details>
<summary>Order Completed Calls</summary>

#### Log Purchase
Send an event to Amplitude.

#### Matched events
type = "track" and event = "Order Completed"

#### Data Mapping
| Destination Field                 | Type          | Description     | Source Field   |
| -------------------- | -------------- | -------------- | --------- |
| trackRevenuePerProduct | boolean | When enabled, track revenue with each product within the event. When disabled, track total revenue once for the event. | false |
| user_id | string | A readable ID specified by you. Must have a minimum length of 5 characters. Required unless device ID is present. **Note:** If you send a request with a user ID that is not in the Amplitude system yet, then the user tied to that ID will not be marked new until their first event. | $.userId |
| device_id | string | A device-specific identifier, such as the Identifier for Vendor on iOS. Required unless user ID is present. If a device ID is not sent with the event, it will be set to a hashed version of the user ID. | $.context.device.id ?? $.anonymousId |
| event_type | string | A unique identifier for your event. | $.event |
| session_id | datetime | The start time of the session, necessary if you want to associate events with a particular system. To use automatic Amplitude session tracking in browsers, enable Analytics 2.0 on your connected source. | $.integrations.Actions Amplitude.session_id |
| time | datetime | The timestamp of the event. If time is not sent with the event, it will be set to the request upload time. | $.timestamp |
| event_properties | object | An object of key-value pairs that represent additional data to be sent along with the event. You can store property values in an array, but note that Amplitude only supports one-dimensional arrays. Date values are transformed into string values. Object depth may not exceed 40 layers. | $.properties |
| user_properties | object | An object of key-value pairs that represent additional data tied to the user. You can store property values in an array, but note that Amplitude only supports one-dimensional arrays. Date values are transformed into string values. Object depth may not exceed 40 layers. | $.traits |
| groups | object | Groups of users for the event as an event-level group. You can only track up to 5 groups. **Note:** This Amplitude feature is only available to Enterprise customers who have purchased the Accounts add-on. | $.groups |
| app_version | string | The current version of your application. | $.context.app.version |
| platform | string | Platform of the device. | $.context.device.type |
| os_name | string | The name of the mobile operating system or browser that the user is using. | $.context.os.name |
| os_version | string | The version of the mobile operating system or browser the user is using. | $.context.os.version |
| device_brand | string | The device brand that the user is using. | $.context.device.brand |
| device_manufacturer | string | The device manufacturer that the user is using. | $.context.device.manufacturer |
| device_model | string | The device model that the user is using. | $.context.device.model |
| carrier | string | The carrier that the user is using. | $.context.network.carrier |
| country | string | The current country of the user. | $.context.location.country |
| region | string | The current region of the user. | $.context.location.region |
| city | string | The current city of the user. | $.context.location.city |
| dma | string | The current Designated Market Area of the user. | $.dma |
| language | string | The language set by the user. | $.context.locale |
| price | number | The price of the item purchased. Required for revenue data if the revenue field is not sent. You can use negative values to indicate refunds. | $.properties.price |
| quantity | integer | The quantity of the item purchased. Defaults to 1 if not specified. | $.properties.quantity |
| revenue | number | Revenue = price * quantity. If you send all 3 fields of price, quantity, and revenue, then (price * quantity) will be used as the revenue value. You can use negative values to indicate refunds. **Note:** You will need to explicitly set this if you are using the Amplitude in cloud-mode. | $.properties.revenue |
| productId | string | An identifier for the item purchased. You must send a price and quantity or revenue with this field. | $.properties.productId |
| revenueType | string | The type of revenue for the item purchased. You must send a price and quantity or revenue with this field. | $.properties.revenueType |
| location_lat | number | The current Latitude of the user. | $.context.location.latitude |
| location_lng | number | The current Longitude of the user. | $.context.location.longitude |
| ip | string | The IP address of the user. Use "$remote" to use the IP address on the upload request. Amplitude will use the IP address to reverse lookup a user's location (city, country, region, and DMA). Amplitude has the ability to drop the location and IP address from events once it reaches our servers. You can submit a request to Amplitude's platform specialist team here to configure this for you. | $.context.ip |
| idfa | string | Identifier for Advertiser. _(iOS)_ | $.context.device.advertisingId ?? $.context.device.idfa |
| idfv | string | Identifier for Vendor. _(iOS)_ | $.context.device.id |
| adid | string | Google Play Services advertising ID. _(Android)_ | $.context.device.advertisingId ?? $.context.device.idfa |
| android_id | string | Android ID (not the advertising ID). _(Android)_ | $.android_id |
| event_id | integer | An incrementing counter to distinguish events with the same user ID and timestamp from each other. Amplitude recommends you send an event ID, increasing over time, especially if you expect events to occur simultanenously. | $.event_id |
| insert_id | string | Amplitude will deduplicate subsequent events sent with this ID we have already seen before within the past 7 days. Amplitude recommends generating a UUID or using some combination of device ID, user ID, event type, event ID, and time. | $.insert_id |
| library | string | The name of the library that generated the event. | $.context.library.name |
| products | object | The list of products purchased. | <pre>{<br/>  "@arrayPath": [<br/>    "$.properties.products",<br/>    {<br/>      "price": {<br/>        "@path": "price"<br/>      },<br/>      "revenue": {<br/>        "@path": "revenue"<br/>      },<br/>      "quantity": {<br/>        "@path": "quantity"<br/>      },<br/>      "productId": {<br/>        "@path": "productId"<br/>      },<br/>      "revenueType": {<br/>        "@path": "revenueType"<br/>      }<br/>    }<br/>  ]<br/>}</pre> |
| use_batch_endpoint | boolean | If true, events are sent to Amplitude's `batch` endpoint rather than their `httpapi` events endpoint. Enabling this setting may help reduce 429s – or throttling errors – from Amplitude. More information about Amplitude's throttling is available in [their docs](https://developers.amplitude.com/docs/batch-event-upload-api#429s-in-depth). | false |
| userAgent | string | The user agent of the device sending the event. | $.context.userAgent |
| userAgentParsing | boolean | Enabling this setting will set the Device manufacturer, Device Model and OS Name properties based on the user agent string provided in the userAgent field | true |
| utm_properties | object | UTM Tracking Properties | <pre>{<br/>  "utm_source": {<br/>    "@path": "$.context.campaign.source"<br/>  },<br/>  "utm_medium": {<br/>    "@path": "$.context.campaign.medium"<br/>  },<br/>  "utm_campaign": {<br/>    "@path": "$.context.campaign.name"<br/>  },<br/>  "utm_term": {<br/>    "@path": "$.context.campaign.term"<br/>  },<br/>  "utm_content": {<br/>    "@path": "$.context.campaign.content"<br/>  }<br/>}</pre> |
| referrer | string | The referrer of the web request. Sent to Amplitude as both last touch “referrer” and first touch “initial_referrer” | $.context.page.referrer |
| min_id_length | integer | Amplitude has a default minimum id lenght of 5 characters for user_id and device_id fields. This field allows the minimum to be overridden to allow shorter id lengths. | $.min_id_length |
</details>
,<details>
<summary>Page Calls</summary>

#### Log Event V2
Send an event to Amplitude

#### Matched events
type = "page"

#### Data Mapping
| Destination Field                 | Type          | Description     | Source Field   |
| -------------------- | -------------- | -------------- | --------- |
| user_id | string | A readable ID specified by you. Must have a minimum length of 5 characters. Required unless device ID is present. **Note:** If you send a request with a user ID that is not in the Amplitude system yet, then the user tied to that ID will not be marked new until their first event. | $.userId |
| device_id | string | A device-specific identifier, such as the Identifier for Vendor on iOS. Required unless user ID is present. If a device ID is not sent with the event, it will be set to a hashed version of the user ID. | $.context.device.id ?? $.anonymousId |
| event_type | string | A unique identifier for your event. | "Viewed $.name" |
| session_id | datetime | The start time of the session, necessary if you want to associate events with a particular system. To use automatic Amplitude session tracking in browsers, enable Analytics 2.0 on your connected source. | $.integrations.Actions Amplitude.session_id |
| time | datetime | The timestamp of the event. If time is not sent with the event, it will be set to the request upload time. | $.timestamp |
| event_properties | object | An object of key-value pairs that represent additional data to be sent along with the event. You can store property values in an array, but note that Amplitude only supports one-dimensional arrays. Date values are transformed into string values. Object depth may not exceed 40 layers. | $.properties |
| user_properties | object | An object of key-value pairs that represent additional data tied to the user. You can store property values in an array, but note that Amplitude only supports one-dimensional arrays. Date values are transformed into string values. Object depth may not exceed 40 layers. | $.traits |
| groups | object | Groups of users for the event as an event-level group. You can only track up to 5 groups. **Note:** This Amplitude feature is only available to Enterprise customers who have purchased the Accounts add-on. | $.groups |
| app_version | string | The current version of your application. | $.context.app.version |
| platform | string | Platform of the device. | $.context.device.type |
| os_name | string | The name of the mobile operating system or browser that the user is using. | $.context.os.name |
| os_version | string | The version of the mobile operating system or browser the user is using. | $.context.os.version |
| device_brand | string | The device brand that the user is using. | $.context.device.brand |
| device_manufacturer | string | The device manufacturer that the user is using. | $.context.device.manufacturer |
| device_model | string | The device model that the user is using. | $.context.device.model |
| carrier | string | The carrier that the user is using. | $.context.network.carrier |
| country | string | The current country of the user. | $.context.location.country |
| region | string | The current region of the user. | $.context.location.region |
| city | string | The current city of the user. | $.context.location.city |
| dma | string | The current Designated Market Area of the user. | $.dma |
| language | string | The language set by the user. | $.context.locale |
| price | number | The price of the item purchased. Required for revenue data if the revenue field is not sent. You can use negative values to indicate refunds. | $.properties.price |
| quantity | integer | The quantity of the item purchased. Defaults to 1 if not specified. | $.properties.quantity |
| revenue | number | Revenue = price * quantity. If you send all 3 fields of price, quantity, and revenue, then (price * quantity) will be used as the revenue value. You can use negative values to indicate refunds. **Note:** You will need to explicitly set this if you are using the Amplitude in cloud-mode. | $.properties.revenue |
| productId | string | An identifier for the item purchased. You must send a price and quantity or revenue with this field. | $.properties.productId |
| revenueType | string | The type of revenue for the item purchased. You must send a price and quantity or revenue with this field. | $.properties.revenueType |
| location_lat | number | The current Latitude of the user. | $.context.location.latitude |
| location_lng | number | The current Longitude of the user. | $.context.location.longitude |
| ip | string | The IP address of the user. Use "$remote" to use the IP address on the upload request. Amplitude will use the IP address to reverse lookup a user's location (city, country, region, and DMA). Amplitude has the ability to drop the location and IP address from events once it reaches our servers. You can submit a request to Amplitude's platform specialist team here to configure this for you. | $.context.ip |
| idfa | string | Identifier for Advertiser. _(iOS)_ | $.context.device.advertisingId ?? $.context.device.idfa |
| idfv | string | Identifier for Vendor. _(iOS)_ | $.context.device.id |
| adid | string | Google Play Services advertising ID. _(Android)_ | $.context.device.advertisingId ?? $.context.device.idfa |
| android_id | string | Android ID (not the advertising ID). _(Android)_ | $.android_id |
| event_id | integer | An incrementing counter to distinguish events with the same user ID and timestamp from each other. Amplitude recommends you send an event ID, increasing over time, especially if you expect events to occur simultanenously. | $.event_id |
| insert_id | string | Amplitude will deduplicate subsequent events sent with this ID we have already seen before within the past 7 days. Amplitude recommends generating a UUID or using some combination of device ID, user ID, event type, event ID, and time. | $.insert_id |
| library | string | The name of the library that generated the event. | $.context.library.name |
| products | object | The list of products purchased. | <pre>{<br/>  "@arrayPath": [<br/>    "$.properties.products",<br/>    {<br/>      "price": {<br/>        "@path": "price"<br/>      },<br/>      "revenue": {<br/>        "@path": "revenue"<br/>      },<br/>      "quantity": {<br/>        "@path": "quantity"<br/>      },<br/>      "productId": {<br/>        "@path": "productId"<br/>      },<br/>      "revenueType": {<br/>        "@path": "revenueType"<br/>      }<br/>    }<br/>  ]<br/>}</pre> |
| setOnce | object | The following fields will be set only once per session when using AJS2 as the source. | <pre>{<br/>  "initial_referrer": {<br/>    "@path": "$.context.page.referrer"<br/>  },<br/>  "initial_utm_source": {<br/>    "@path": "$.context.campaign.source"<br/>  },<br/>  "initial_utm_medium": {<br/>    "@path": "$.context.campaign.medium"<br/>  },<br/>  "initial_utm_campaign": {<br/>    "@path": "$.context.campaign.name"<br/>  },<br/>  "initial_utm_term": {<br/>    "@path": "$.context.campaign.term"<br/>  },<br/>  "initial_utm_content": {<br/>    "@path": "$.context.campaign.content"<br/>  }<br/>}</pre> |
| setAlways | object | The following fields will be set every session when using AJS2 as the source. | <pre>{<br/>  "referrer": {<br/>    "@path": "$.context.page.referrer"<br/>  },<br/>  "utm_source": {<br/>    "@path": "$.context.campaign.source"<br/>  },<br/>  "utm_medium": {<br/>    "@path": "$.context.campaign.medium"<br/>  },<br/>  "utm_campaign": {<br/>    "@path": "$.context.campaign.name"<br/>  },<br/>  "utm_term": {<br/>    "@path": "$.context.campaign.term"<br/>  },<br/>  "utm_content": {<br/>    "@path": "$.context.campaign.content"<br/>  }<br/>}</pre> |
| add | object | Increment a user property by a number with add. If the user property doesn't have a value set yet, it's initialized to 0. | $.add |
| use_batch_endpoint | boolean | If true, events are sent to Amplitude's `batch` endpoint rather than their `httpapi` events endpoint. Enabling this setting may help reduce 429s – or throttling errors – from Amplitude. More information about Amplitude's throttling is available in [their docs](https://developers.amplitude.com/docs/batch-event-upload-api#429s-in-depth). | false |
| userAgent | string | The user agent of the device sending the event. | $.context.userAgent |
| userAgentParsing | boolean | Enabling this setting will set the Device manufacturer, Device Model and OS Name properties based on the user agent string provided in the userAgent field. | true |
| min_id_length | integer | Amplitude has a default minimum id length of 5 characters for user_id and device_id fields. This field allows the minimum to be overridden to allow shorter id lengths. | $.min_id_length |
</details>
,<details>
<summary>Screen Calls</summary>

#### Log Event V2
Send an event to Amplitude

#### Matched events
type = "screen"

#### Data Mapping
| Destination Field                 | Type          | Description     | Source Field   |
| -------------------- | -------------- | -------------- | --------- |
| user_id | string | A readable ID specified by you. Must have a minimum length of 5 characters. Required unless device ID is present. **Note:** If you send a request with a user ID that is not in the Amplitude system yet, then the user tied to that ID will not be marked new until their first event. | $.userId |
| device_id | string | A device-specific identifier, such as the Identifier for Vendor on iOS. Required unless user ID is present. If a device ID is not sent with the event, it will be set to a hashed version of the user ID. | $.context.device.id ?? $.anonymousId |
| event_type | string | A unique identifier for your event. | "Viewed $.name" |
| session_id | datetime | The start time of the session, necessary if you want to associate events with a particular system. To use automatic Amplitude session tracking in browsers, enable Analytics 2.0 on your connected source. | $.integrations.Actions Amplitude.session_id |
| time | datetime | The timestamp of the event. If time is not sent with the event, it will be set to the request upload time. | $.timestamp |
| event_properties | object | An object of key-value pairs that represent additional data to be sent along with the event. You can store property values in an array, but note that Amplitude only supports one-dimensional arrays. Date values are transformed into string values. Object depth may not exceed 40 layers. | $.properties |
| user_properties | object | An object of key-value pairs that represent additional data tied to the user. You can store property values in an array, but note that Amplitude only supports one-dimensional arrays. Date values are transformed into string values. Object depth may not exceed 40 layers. | $.traits |
| groups | object | Groups of users for the event as an event-level group. You can only track up to 5 groups. **Note:** This Amplitude feature is only available to Enterprise customers who have purchased the Accounts add-on. | $.groups |
| app_version | string | The current version of your application. | $.context.app.version |
| platform | string | Platform of the device. | $.context.device.type |
| os_name | string | The name of the mobile operating system or browser that the user is using. | $.context.os.name |
| os_version | string | The version of the mobile operating system or browser the user is using. | $.context.os.version |
| device_brand | string | The device brand that the user is using. | $.context.device.brand |
| device_manufacturer | string | The device manufacturer that the user is using. | $.context.device.manufacturer |
| device_model | string | The device model that the user is using. | $.context.device.model |
| carrier | string | The carrier that the user is using. | $.context.network.carrier |
| country | string | The current country of the user. | $.context.location.country |
| region | string | The current region of the user. | $.context.location.region |
| city | string | The current city of the user. | $.context.location.city |
| dma | string | The current Designated Market Area of the user. | $.dma |
| language | string | The language set by the user. | $.context.locale |
| price | number | The price of the item purchased. Required for revenue data if the revenue field is not sent. You can use negative values to indicate refunds. | $.properties.price |
| quantity | integer | The quantity of the item purchased. Defaults to 1 if not specified. | $.properties.quantity |
| revenue | number | Revenue = price * quantity. If you send all 3 fields of price, quantity, and revenue, then (price * quantity) will be used as the revenue value. You can use negative values to indicate refunds. **Note:** You will need to explicitly set this if you are using the Amplitude in cloud-mode. | $.properties.revenue |
| productId | string | An identifier for the item purchased. You must send a price and quantity or revenue with this field. | $.properties.productId |
| revenueType | string | The type of revenue for the item purchased. You must send a price and quantity or revenue with this field. | $.properties.revenueType |
| location_lat | number | The current Latitude of the user. | $.context.location.latitude |
| location_lng | number | The current Longitude of the user. | $.context.location.longitude |
| ip | string | The IP address of the user. Use "$remote" to use the IP address on the upload request. Amplitude will use the IP address to reverse lookup a user's location (city, country, region, and DMA). Amplitude has the ability to drop the location and IP address from events once it reaches our servers. You can submit a request to Amplitude's platform specialist team here to configure this for you. | $.context.ip |
| idfa | string | Identifier for Advertiser. _(iOS)_ | $.context.device.advertisingId ?? $.context.device.idfa |
| idfv | string | Identifier for Vendor. _(iOS)_ | $.context.device.id |
| adid | string | Google Play Services advertising ID. _(Android)_ | $.context.device.advertisingId ?? $.context.device.idfa |
| android_id | string | Android ID (not the advertising ID). _(Android)_ | $.android_id |
| event_id | integer | An incrementing counter to distinguish events with the same user ID and timestamp from each other. Amplitude recommends you send an event ID, increasing over time, especially if you expect events to occur simultanenously. | $.event_id |
| insert_id | string | Amplitude will deduplicate subsequent events sent with this ID we have already seen before within the past 7 days. Amplitude recommends generating a UUID or using some combination of device ID, user ID, event type, event ID, and time. | $.insert_id |
| library | string | The name of the library that generated the event. | $.context.library.name |
| products | object | The list of products purchased. | <pre>{<br/>  "@arrayPath": [<br/>    "$.properties.products",<br/>    {<br/>      "price": {<br/>        "@path": "price"<br/>      },<br/>      "revenue": {<br/>        "@path": "revenue"<br/>      },<br/>      "quantity": {<br/>        "@path": "quantity"<br/>      },<br/>      "productId": {<br/>        "@path": "productId"<br/>      },<br/>      "revenueType": {<br/>        "@path": "revenueType"<br/>      }<br/>    }<br/>  ]<br/>}</pre> |
| setOnce | object | The following fields will be set only once per session when using AJS2 as the source. | <pre>{<br/>  "initial_referrer": {<br/>    "@path": "$.context.page.referrer"<br/>  },<br/>  "initial_utm_source": {<br/>    "@path": "$.context.campaign.source"<br/>  },<br/>  "initial_utm_medium": {<br/>    "@path": "$.context.campaign.medium"<br/>  },<br/>  "initial_utm_campaign": {<br/>    "@path": "$.context.campaign.name"<br/>  },<br/>  "initial_utm_term": {<br/>    "@path": "$.context.campaign.term"<br/>  },<br/>  "initial_utm_content": {<br/>    "@path": "$.context.campaign.content"<br/>  }<br/>}</pre> |
| setAlways | object | The following fields will be set every session when using AJS2 as the source. | <pre>{<br/>  "referrer": {<br/>    "@path": "$.context.page.referrer"<br/>  },<br/>  "utm_source": {<br/>    "@path": "$.context.campaign.source"<br/>  },<br/>  "utm_medium": {<br/>    "@path": "$.context.campaign.medium"<br/>  },<br/>  "utm_campaign": {<br/>    "@path": "$.context.campaign.name"<br/>  },<br/>  "utm_term": {<br/>    "@path": "$.context.campaign.term"<br/>  },<br/>  "utm_content": {<br/>    "@path": "$.context.campaign.content"<br/>  }<br/>}</pre> |
| add | object | Increment a user property by a number with add. If the user property doesn't have a value set yet, it's initialized to 0. | $.add |
| use_batch_endpoint | boolean | If true, events are sent to Amplitude's `batch` endpoint rather than their `httpapi` events endpoint. Enabling this setting may help reduce 429s – or throttling errors – from Amplitude. More information about Amplitude's throttling is available in [their docs](https://developers.amplitude.com/docs/batch-event-upload-api#429s-in-depth). | false |
| userAgent | string | The user agent of the device sending the event. | $.context.userAgent |
| userAgentParsing | boolean | Enabling this setting will set the Device manufacturer, Device Model and OS Name properties based on the user agent string provided in the userAgent field. | true |
| min_id_length | integer | Amplitude has a default minimum id length of 5 characters for user_id and device_id fields. This field allows the minimum to be overridden to allow shorter id lengths. | $.min_id_length |
</details>
,<details>
<summary>Identify Calls</summary>

#### Identify User
Set the user ID for a particular device ID or update user properties without sending an event to Amplitude.

#### Matched events
type = "identify"

#### Data Mapping
| Destination Field                 | Type          | Description     | Source Field   |
| -------------------- | -------------- | -------------- | --------- |
| user_id | string | A UUID (unique user ID) specified by you. **Note:** If you send a request with a user ID that is not in the Amplitude system yet, then the user tied to that ID will not be marked new until their first event. Required unless device ID is present. | $.userId |
| device_id | string | A device specific identifier, such as the Identifier for Vendor (IDFV) on iOS. Required unless user ID is present. | $.context.device.id ?? $.anonymousId |
| user_properties | object | Additional data tied to the user in Amplitude. Each distinct value will show up as a user syft on the Amplitude dashboard. Object depth may not exceed 40 layers. **Note:** You can store property values in an array and date values are transformed into string values. | $.traits |
| groups | object | Groups of users for Amplitude's account-level reporting feature. Note: You can only track up to 5 groups. Any groups past that threshold will not be tracked. **Note:** This feature is only available to Amplitude Enterprise customers who have purchased the Amplitude Accounts add-on. | $.groups |
| app_version | string | Version of the app the user is on. | $.context.app.version |
| platform | string | The platform of the user's device. | $.context.device.type |
| os_name | string | The mobile operating system or browser of the user's device. | $.context.os.name |
| os_version | string | The version of the mobile operating system or browser of the user's device. | $.context.os.version |
| device_brand | string | The brand of user's the device. | $.context.device.brand |
| device_manufacturer | string | The manufacturer of the user's device. | $.context.device.manufacturer |
| device_model | string | The model of the user's device. | $.context.device.model |
| carrier | string | The user's mobile carrier. | $.context.network.carrier |
| country | string | The country in which the user is located. | $.context.location.country |
| region | string | The geographical region in which the user is located. | $.context.location.region |
| city | string | The city in which the user is located. | $.context.location.city |
| dma | string | The Designated Market Area in which the user is located. | $.dma |
| language | string | Language the user has set on their device or browser. | $.context.locale |
| paying | boolean | Whether the user is paying or not. | $.paying |
| start_version | string | The version of the app the user was first on. | $.start_version |
| insert_id | string | Amplitude will deduplicate subsequent events sent with this ID we have already seen before within the past 7 days. Amplitude recommends generating a UUID or using some combination of device ID, user ID, event type, event ID, and time. | $.insert_id |
| userAgent | string | The user agent of the device sending the event. | $.context.userAgent |
| userAgentParsing | boolean | Enabling this setting will set the Device manufacturer, Device Model and OS Name properties based on the user agent string provided in the userAgent field | true |
| utm_properties | object | UTM Tracking Properties | <pre>{<br/>  "utm_source": {<br/>    "@path": "$.context.campaign.source"<br/>  },<br/>  "utm_medium": {<br/>    "@path": "$.context.campaign.medium"<br/>  },<br/>  "utm_campaign": {<br/>    "@path": "$.context.campaign.name"<br/>  },<br/>  "utm_term": {<br/>    "@path": "$.context.campaign.term"<br/>  },<br/>  "utm_content": {<br/>    "@path": "$.context.campaign.content"<br/>  }<br/>}</pre> |
| referrer | string | The referrer of the web request. Sent to Amplitude as both last touch “referrer” and first touch “initial_referrer” | $.context.page.referrer |
| min_id_length | integer | Amplitude has a default minimum id length of 5 characters for user_id and device_id fields. This field allows the minimum to be overridden to allow shorter id lengths. | $.min_id_length |
| library | string | The name of the library that generated the event. | $.context.library.name |
</details>
,

