---
sidebar_position: 11
---
# Amplitude

This page describes how to set up Amplitude as a destination.

## Set up
An example setup for Amplitude is shown below.

```ts title="src/pages/api/syft.ts"
import { type NextApiRequest, type NextApiResponse } from "next";
// highlight-next-line
import { NextSyftServer } from "@syftdata/next/lib/next";

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
| Name                 | Type          | Description     | Default   |
| -------------------- | -------------- | -------------- | --------- |
| user_id | string | A readable ID specified by you. Must have a minimum length of 5 characters. Required unless device ID is present. **Note:** If you send a request with a user ID that is not in the Amplitude system yet, then the user tied to that ID will not be marked new until their first event. | (<br/>  "@path": "$.userId"<br/>) |
| device_id | string | A device-specific identifier, such as the Identifier for Vendor on iOS. Required unless user ID is present. If a device ID is not sent with the event, it will be set to a hashed version of the user ID. | (<br/>  "@if": (<br/>    "exists": (<br/>      "@path": "$.context.device.id"<br/>    ),<br/>    "then": (<br/>      "@path": "$.context.device.id"<br/>    ),<br/>    "else": (<br/>      "@path": "$.anonymousId"<br/>    )<br/>  )<br/>) |
| event_type | string | A unique identifier for your event. | (<br/>  "@path": "$.event"<br/>) |
| session_id | datetime | The start time of the session, necessary if you want to associate events with a particular system. To use automatic Amplitude session tracking in browsers, enable Analytics 2.0 on your connected source. | (<br/>  "@path": "$.integrations.Actions Amplitude.session_id"<br/>) |
| time | datetime | The timestamp of the event. If time is not sent with the event, it will be set to the request upload time. | (<br/>  "@path": "$.timestamp"<br/>) |
| event_properties | object | An object of key-value pairs that represent additional data to be sent along with the event. You can store property values in an array, but note that Amplitude only supports one-dimensional arrays. Date values are transformed into string values. Object depth may not exceed 40 layers. | (<br/>  "@path": "$.properties"<br/>) |
| user_properties | object | An object of key-value pairs that represent additional data tied to the user. You can store property values in an array, but note that Amplitude only supports one-dimensional arrays. Date values are transformed into string values. Object depth may not exceed 40 layers. | (<br/>  "@path": "$.traits"<br/>) |
| app_version | string | The current version of your application. | (<br/>  "@path": "$.context.app.version"<br/>) |
| platform | string | Platform of the device. | (<br/>  "@path": "$.context.device.type"<br/>) |
| os_name | string | The name of the mobile operating system or browser that the user is using. | (<br/>  "@path": "$.context.os.name"<br/>) |
| os_version | string | The version of the mobile operating system or browser the user is using. | (<br/>  "@path": "$.context.os.version"<br/>) |
| device_brand | string | The device brand that the user is using. | (<br/>  "@path": "$.context.device.brand"<br/>) |
| device_manufacturer | string | The device manufacturer that the user is using. | (<br/>  "@path": "$.context.device.manufacturer"<br/>) |
| device_model | string | The device model that the user is using. | (<br/>  "@path": "$.context.device.model"<br/>) |
| carrier | string | The carrier that the user is using. | (<br/>  "@path": "$.context.network.carrier"<br/>) |
| country | string | The current country of the user. | (<br/>  "@path": "$.context.location.country"<br/>) |
| region | string | The current region of the user. | (<br/>  "@path": "$.context.location.region"<br/>) |
| city | string | The current city of the user. | (<br/>  "@path": "$.context.location.city"<br/>) |
| language | string | The language set by the user. | (<br/>  "@path": "$.context.locale"<br/>) |
| price | number | The price of the item purchased. Required for revenue data if the revenue field is not sent. You can use negative values to indicate refunds. | (<br/>  "@path": "$.properties.price"<br/>) |
| quantity | integer | The quantity of the item purchased. Defaults to 1 if not specified. | (<br/>  "@path": "$.properties.quantity"<br/>) |
| revenue | number | Revenue = price * quantity. If you send all 3 fields of price, quantity, and revenue, then (price * quantity) will be used as the revenue value. You can use negative values to indicate refunds. **Note:** You will need to explicitly set this if you are using the Amplitude in cloud-mode. | (<br/>  "@path": "$.properties.revenue"<br/>) |
| productId | string | An identifier for the item purchased. You must send a price and quantity or revenue with this field. | (<br/>  "@path": "$.properties.productId"<br/>) |
| revenueType | string | The type of revenue for the item purchased. You must send a price and quantity or revenue with this field. | (<br/>  "@path": "$.properties.revenueType"<br/>) |
| location_lat | number | The current Latitude of the user. | (<br/>  "@path": "$.context.location.latitude"<br/>) |
| location_lng | number | The current Longitude of the user. | (<br/>  "@path": "$.context.location.longitude"<br/>) |
| ip | string | The IP address of the user. Use "$remote" to use the IP address on the upload request. Amplitude will use the IP address to reverse lookup a user's location (city, country, region, and DMA). Amplitude has the ability to drop the location and IP address from events once it reaches our servers. You can submit a request to Amplitude's platform specialist team here to configure this for you. | (<br/>  "@path": "$.context.ip"<br/>) |
| idfa | string | Identifier for Advertiser. _(iOS)_ | (<br/>  "@if": (<br/>    "exists": (<br/>      "@path": "$.context.device.advertisingId"<br/>    ),<br/>    "then": (<br/>      "@path": "$.context.device.advertisingId"<br/>    ),<br/>    "else": (<br/>      "@path": "$.context.device.idfa"<br/>    )<br/>  )<br/>) |
| idfv | string | Identifier for Vendor. _(iOS)_ | (<br/>  "@path": "$.context.device.id"<br/>) |
| adid | string | Google Play Services advertising ID. _(Android)_ | (<br/>  "@if": (<br/>    "exists": (<br/>      "@path": "$.context.device.advertisingId"<br/>    ),<br/>    "then": (<br/>      "@path": "$.context.device.advertisingId"<br/>    ),<br/>    "else": (<br/>      "@path": "$.context.device.idfa"<br/>    )<br/>  )<br/>) |
| library | string | The name of the library that generated the event. | (<br/>  "@path": "$.context.library.name"<br/>) |
| products | object | The list of products purchased. | (<br/>  "@arrayPath": [<br/>    "$.properties.products",<br/>    (<br/>      "price": (<br/>        "@path": "price"<br/>      ),<br/>      "revenue": (<br/>        "@path": "revenue"<br/>      ),<br/>      "quantity": (<br/>        "@path": "quantity"<br/>      ),<br/>      "productId": (<br/>        "@path": "productId"<br/>      ),<br/>      "revenueType": (<br/>        "@path": "revenueType"<br/>      )<br/>    )<br/>  ]<br/>) |
| setOnce | object | The following fields will be set only once per session when using AJS2 as the source. | (<br/>  "initial_referrer": (<br/>    "@path": "$.context.page.referrer"<br/>  ),<br/>  "initial_utm_source": (<br/>    "@path": "$.context.campaign.source"<br/>  ),<br/>  "initial_utm_medium": (<br/>    "@path": "$.context.campaign.medium"<br/>  ),<br/>  "initial_utm_campaign": (<br/>    "@path": "$.context.campaign.name"<br/>  ),<br/>  "initial_utm_term": (<br/>    "@path": "$.context.campaign.term"<br/>  ),<br/>  "initial_utm_content": (<br/>    "@path": "$.context.campaign.content"<br/>  )<br/>) |
| setAlways | object | The following fields will be set every session when using AJS2 as the source. | (<br/>  "referrer": (<br/>    "@path": "$.context.page.referrer"<br/>  ),<br/>  "utm_source": (<br/>    "@path": "$.context.campaign.source"<br/>  ),<br/>  "utm_medium": (<br/>    "@path": "$.context.campaign.medium"<br/>  ),<br/>  "utm_campaign": (<br/>    "@path": "$.context.campaign.name"<br/>  ),<br/>  "utm_term": (<br/>    "@path": "$.context.campaign.term"<br/>  ),<br/>  "utm_content": (<br/>    "@path": "$.context.campaign.content"<br/>  )<br/>) |
| use_batch_endpoint | boolean | If true, events are sent to Amplitude's `batch` endpoint rather than their `httpapi` events endpoint. Enabling this setting may help reduce 429s – or throttling errors – from Amplitude. More information about Amplitude's throttling is available in [their docs](https://developers.amplitude.com/docs/batch-event-upload-api#429s-in-depth). | false |
| userAgent | string | The user agent of the device sending the event. | (<br/>  "@path": "$.context.userAgent"<br/>) |
| userAgentParsing | boolean | Enabling this setting will set the Device manufacturer, Device Model and OS Name properties based on the user agent string provided in the userAgent field. | true |
</details>
,<details>
<summary>Order Completed Calls</summary>

#### Log Purchase
Send an event to Amplitude.

#### Matched events
type = "track" and event = "Order Completed"

#### Data Mapping
| Name                 | Type          | Description     | Default   |
| -------------------- | -------------- | -------------- | --------- |
| trackRevenuePerProduct | boolean | When enabled, track revenue with each product within the event. When disabled, track total revenue once for the event. | false |
| user_id | string | A readable ID specified by you. Must have a minimum length of 5 characters. Required unless device ID is present. **Note:** If you send a request with a user ID that is not in the Amplitude system yet, then the user tied to that ID will not be marked new until their first event. | (<br/>  "@path": "$.userId"<br/>) |
| device_id | string | A device-specific identifier, such as the Identifier for Vendor on iOS. Required unless user ID is present. If a device ID is not sent with the event, it will be set to a hashed version of the user ID. | (<br/>  "@if": (<br/>    "exists": (<br/>      "@path": "$.context.device.id"<br/>    ),<br/>    "then": (<br/>      "@path": "$.context.device.id"<br/>    ),<br/>    "else": (<br/>      "@path": "$.anonymousId"<br/>    )<br/>  )<br/>) |
| event_type | string | A unique identifier for your event. | (<br/>  "@path": "$.event"<br/>) |
| session_id | datetime | The start time of the session, necessary if you want to associate events with a particular system. To use automatic Amplitude session tracking in browsers, enable Analytics 2.0 on your connected source. | (<br/>  "@path": "$.integrations.Actions Amplitude.session_id"<br/>) |
| time | datetime | The timestamp of the event. If time is not sent with the event, it will be set to the request upload time. | (<br/>  "@path": "$.timestamp"<br/>) |
| event_properties | object | An object of key-value pairs that represent additional data to be sent along with the event. You can store property values in an array, but note that Amplitude only supports one-dimensional arrays. Date values are transformed into string values. Object depth may not exceed 40 layers. | (<br/>  "@path": "$.properties"<br/>) |
| user_properties | object | An object of key-value pairs that represent additional data tied to the user. You can store property values in an array, but note that Amplitude only supports one-dimensional arrays. Date values are transformed into string values. Object depth may not exceed 40 layers. | (<br/>  "@path": "$.traits"<br/>) |
| app_version | string | The current version of your application. | (<br/>  "@path": "$.context.app.version"<br/>) |
| platform | string | Platform of the device. | (<br/>  "@path": "$.context.device.type"<br/>) |
| os_name | string | The name of the mobile operating system or browser that the user is using. | (<br/>  "@path": "$.context.os.name"<br/>) |
| os_version | string | The version of the mobile operating system or browser the user is using. | (<br/>  "@path": "$.context.os.version"<br/>) |
| device_brand | string | The device brand that the user is using. | (<br/>  "@path": "$.context.device.brand"<br/>) |
| device_manufacturer | string | The device manufacturer that the user is using. | (<br/>  "@path": "$.context.device.manufacturer"<br/>) |
| device_model | string | The device model that the user is using. | (<br/>  "@path": "$.context.device.model"<br/>) |
| carrier | string | The carrier that the user is using. | (<br/>  "@path": "$.context.network.carrier"<br/>) |
| country | string | The current country of the user. | (<br/>  "@path": "$.context.location.country"<br/>) |
| region | string | The current region of the user. | (<br/>  "@path": "$.context.location.region"<br/>) |
| city | string | The current city of the user. | (<br/>  "@path": "$.context.location.city"<br/>) |
| language | string | The language set by the user. | (<br/>  "@path": "$.context.locale"<br/>) |
| price | number | The price of the item purchased. Required for revenue data if the revenue field is not sent. You can use negative values to indicate refunds. | (<br/>  "@path": "$.properties.price"<br/>) |
| quantity | integer | The quantity of the item purchased. Defaults to 1 if not specified. | (<br/>  "@path": "$.properties.quantity"<br/>) |
| revenue | number | Revenue = price * quantity. If you send all 3 fields of price, quantity, and revenue, then (price * quantity) will be used as the revenue value. You can use negative values to indicate refunds. **Note:** You will need to explicitly set this if you are using the Amplitude in cloud-mode. | (<br/>  "@path": "$.properties.revenue"<br/>) |
| productId | string | An identifier for the item purchased. You must send a price and quantity or revenue with this field. | (<br/>  "@path": "$.properties.productId"<br/>) |
| revenueType | string | The type of revenue for the item purchased. You must send a price and quantity or revenue with this field. | (<br/>  "@path": "$.properties.revenueType"<br/>) |
| location_lat | number | The current Latitude of the user. | (<br/>  "@path": "$.context.location.latitude"<br/>) |
| location_lng | number | The current Longitude of the user. | (<br/>  "@path": "$.context.location.longitude"<br/>) |
| ip | string | The IP address of the user. Use "$remote" to use the IP address on the upload request. Amplitude will use the IP address to reverse lookup a user's location (city, country, region, and DMA). Amplitude has the ability to drop the location and IP address from events once it reaches our servers. You can submit a request to Amplitude's platform specialist team here to configure this for you. | (<br/>  "@path": "$.context.ip"<br/>) |
| idfa | string | Identifier for Advertiser. _(iOS)_ | (<br/>  "@if": (<br/>    "exists": (<br/>      "@path": "$.context.device.advertisingId"<br/>    ),<br/>    "then": (<br/>      "@path": "$.context.device.advertisingId"<br/>    ),<br/>    "else": (<br/>      "@path": "$.context.device.idfa"<br/>    )<br/>  )<br/>) |
| idfv | string | Identifier for Vendor. _(iOS)_ | (<br/>  "@path": "$.context.device.id"<br/>) |
| adid | string | Google Play Services advertising ID. _(Android)_ | (<br/>  "@if": (<br/>    "exists": (<br/>      "@path": "$.context.device.advertisingId"<br/>    ),<br/>    "then": (<br/>      "@path": "$.context.device.advertisingId"<br/>    ),<br/>    "else": (<br/>      "@path": "$.context.device.idfa"<br/>    )<br/>  )<br/>) |
| library | string | The name of the library that generated the event. | (<br/>  "@path": "$.context.library.name"<br/>) |
| products | object | The list of products purchased. | (<br/>  "@arrayPath": [<br/>    "$.properties.products",<br/>    (<br/>      "price": (<br/>        "@path": "price"<br/>      ),<br/>      "revenue": (<br/>        "@path": "revenue"<br/>      ),<br/>      "quantity": (<br/>        "@path": "quantity"<br/>      ),<br/>      "productId": (<br/>        "@path": "productId"<br/>      ),<br/>      "revenueType": (<br/>        "@path": "revenueType"<br/>      )<br/>    )<br/>  ]<br/>) |
| use_batch_endpoint | boolean | If true, events are sent to Amplitude's `batch` endpoint rather than their `httpapi` events endpoint. Enabling this setting may help reduce 429s – or throttling errors – from Amplitude. More information about Amplitude's throttling is available in [their docs](https://developers.amplitude.com/docs/batch-event-upload-api#429s-in-depth). | false |
| userAgent | string | The user agent of the device sending the event. | (<br/>  "@path": "$.context.userAgent"<br/>) |
| userAgentParsing | boolean | Enabling this setting will set the Device manufacturer, Device Model and OS Name properties based on the user agent string provided in the userAgent field | true |
| utm_properties | object | UTM Tracking Properties | (<br/>  "utm_source": (<br/>    "@path": "$.context.campaign.source"<br/>  ),<br/>  "utm_medium": (<br/>    "@path": "$.context.campaign.medium"<br/>  ),<br/>  "utm_campaign": (<br/>    "@path": "$.context.campaign.name"<br/>  ),<br/>  "utm_term": (<br/>    "@path": "$.context.campaign.term"<br/>  ),<br/>  "utm_content": (<br/>    "@path": "$.context.campaign.content"<br/>  )<br/>) |
| referrer | string | The referrer of the web request. Sent to Amplitude as both last touch “referrer” and first touch “initial_referrer” | (<br/>  "@path": "$.context.page.referrer"<br/>) |
</details>
,<details>
<summary>Page Calls</summary>

#### Log Event V2
Send an event to Amplitude

#### Matched events
type = "page"

#### Data Mapping
| Name                 | Type          | Description     | Default   |
| -------------------- | -------------- | -------------- | --------- |
| user_id | string | A readable ID specified by you. Must have a minimum length of 5 characters. Required unless device ID is present. **Note:** If you send a request with a user ID that is not in the Amplitude system yet, then the user tied to that ID will not be marked new until their first event. | (<br/>  "@path": "$.userId"<br/>) |
| device_id | string | A device-specific identifier, such as the Identifier for Vendor on iOS. Required unless user ID is present. If a device ID is not sent with the event, it will be set to a hashed version of the user ID. | (<br/>  "@if": (<br/>    "exists": (<br/>      "@path": "$.context.device.id"<br/>    ),<br/>    "then": (<br/>      "@path": "$.context.device.id"<br/>    ),<br/>    "else": (<br/>      "@path": "$.anonymousId"<br/>    )<br/>  )<br/>) |
| event_type | string | A unique identifier for your event. | (<br/>  "@template": "Viewed ((name))"<br/>) |
| session_id | datetime | The start time of the session, necessary if you want to associate events with a particular system. To use automatic Amplitude session tracking in browsers, enable Analytics 2.0 on your connected source. | (<br/>  "@path": "$.integrations.Actions Amplitude.session_id"<br/>) |
| time | datetime | The timestamp of the event. If time is not sent with the event, it will be set to the request upload time. | (<br/>  "@path": "$.timestamp"<br/>) |
| event_properties | object | An object of key-value pairs that represent additional data to be sent along with the event. You can store property values in an array, but note that Amplitude only supports one-dimensional arrays. Date values are transformed into string values. Object depth may not exceed 40 layers. | (<br/>  "@path": "$.properties"<br/>) |
| user_properties | object | An object of key-value pairs that represent additional data tied to the user. You can store property values in an array, but note that Amplitude only supports one-dimensional arrays. Date values are transformed into string values. Object depth may not exceed 40 layers. | (<br/>  "@path": "$.traits"<br/>) |
| app_version | string | The current version of your application. | (<br/>  "@path": "$.context.app.version"<br/>) |
| platform | string | Platform of the device. | (<br/>  "@path": "$.context.device.type"<br/>) |
| os_name | string | The name of the mobile operating system or browser that the user is using. | (<br/>  "@path": "$.context.os.name"<br/>) |
| os_version | string | The version of the mobile operating system or browser the user is using. | (<br/>  "@path": "$.context.os.version"<br/>) |
| device_brand | string | The device brand that the user is using. | (<br/>  "@path": "$.context.device.brand"<br/>) |
| device_manufacturer | string | The device manufacturer that the user is using. | (<br/>  "@path": "$.context.device.manufacturer"<br/>) |
| device_model | string | The device model that the user is using. | (<br/>  "@path": "$.context.device.model"<br/>) |
| carrier | string | The carrier that the user is using. | (<br/>  "@path": "$.context.network.carrier"<br/>) |
| country | string | The current country of the user. | (<br/>  "@path": "$.context.location.country"<br/>) |
| region | string | The current region of the user. | (<br/>  "@path": "$.context.location.region"<br/>) |
| city | string | The current city of the user. | (<br/>  "@path": "$.context.location.city"<br/>) |
| language | string | The language set by the user. | (<br/>  "@path": "$.context.locale"<br/>) |
| price | number | The price of the item purchased. Required for revenue data if the revenue field is not sent. You can use negative values to indicate refunds. | (<br/>  "@path": "$.properties.price"<br/>) |
| quantity | integer | The quantity of the item purchased. Defaults to 1 if not specified. | (<br/>  "@path": "$.properties.quantity"<br/>) |
| revenue | number | Revenue = price * quantity. If you send all 3 fields of price, quantity, and revenue, then (price * quantity) will be used as the revenue value. You can use negative values to indicate refunds. **Note:** You will need to explicitly set this if you are using the Amplitude in cloud-mode. | (<br/>  "@path": "$.properties.revenue"<br/>) |
| productId | string | An identifier for the item purchased. You must send a price and quantity or revenue with this field. | (<br/>  "@path": "$.properties.productId"<br/>) |
| revenueType | string | The type of revenue for the item purchased. You must send a price and quantity or revenue with this field. | (<br/>  "@path": "$.properties.revenueType"<br/>) |
| location_lat | number | The current Latitude of the user. | (<br/>  "@path": "$.context.location.latitude"<br/>) |
| location_lng | number | The current Longitude of the user. | (<br/>  "@path": "$.context.location.longitude"<br/>) |
| ip | string | The IP address of the user. Use "$remote" to use the IP address on the upload request. Amplitude will use the IP address to reverse lookup a user's location (city, country, region, and DMA). Amplitude has the ability to drop the location and IP address from events once it reaches our servers. You can submit a request to Amplitude's platform specialist team here to configure this for you. | (<br/>  "@path": "$.context.ip"<br/>) |
| idfa | string | Identifier for Advertiser. _(iOS)_ | (<br/>  "@if": (<br/>    "exists": (<br/>      "@path": "$.context.device.advertisingId"<br/>    ),<br/>    "then": (<br/>      "@path": "$.context.device.advertisingId"<br/>    ),<br/>    "else": (<br/>      "@path": "$.context.device.idfa"<br/>    )<br/>  )<br/>) |
| idfv | string | Identifier for Vendor. _(iOS)_ | (<br/>  "@path": "$.context.device.id"<br/>) |
| adid | string | Google Play Services advertising ID. _(Android)_ | (<br/>  "@if": (<br/>    "exists": (<br/>      "@path": "$.context.device.advertisingId"<br/>    ),<br/>    "then": (<br/>      "@path": "$.context.device.advertisingId"<br/>    ),<br/>    "else": (<br/>      "@path": "$.context.device.idfa"<br/>    )<br/>  )<br/>) |
| library | string | The name of the library that generated the event. | (<br/>  "@path": "$.context.library.name"<br/>) |
| products | object | The list of products purchased. | (<br/>  "@arrayPath": [<br/>    "$.properties.products",<br/>    (<br/>      "price": (<br/>        "@path": "price"<br/>      ),<br/>      "revenue": (<br/>        "@path": "revenue"<br/>      ),<br/>      "quantity": (<br/>        "@path": "quantity"<br/>      ),<br/>      "productId": (<br/>        "@path": "productId"<br/>      ),<br/>      "revenueType": (<br/>        "@path": "revenueType"<br/>      )<br/>    )<br/>  ]<br/>) |
| setOnce | object | The following fields will be set only once per session when using AJS2 as the source. | (<br/>  "initial_referrer": (<br/>    "@path": "$.context.page.referrer"<br/>  ),<br/>  "initial_utm_source": (<br/>    "@path": "$.context.campaign.source"<br/>  ),<br/>  "initial_utm_medium": (<br/>    "@path": "$.context.campaign.medium"<br/>  ),<br/>  "initial_utm_campaign": (<br/>    "@path": "$.context.campaign.name"<br/>  ),<br/>  "initial_utm_term": (<br/>    "@path": "$.context.campaign.term"<br/>  ),<br/>  "initial_utm_content": (<br/>    "@path": "$.context.campaign.content"<br/>  )<br/>) |
| setAlways | object | The following fields will be set every session when using AJS2 as the source. | (<br/>  "referrer": (<br/>    "@path": "$.context.page.referrer"<br/>  ),<br/>  "utm_source": (<br/>    "@path": "$.context.campaign.source"<br/>  ),<br/>  "utm_medium": (<br/>    "@path": "$.context.campaign.medium"<br/>  ),<br/>  "utm_campaign": (<br/>    "@path": "$.context.campaign.name"<br/>  ),<br/>  "utm_term": (<br/>    "@path": "$.context.campaign.term"<br/>  ),<br/>  "utm_content": (<br/>    "@path": "$.context.campaign.content"<br/>  )<br/>) |
| use_batch_endpoint | boolean | If true, events are sent to Amplitude's `batch` endpoint rather than their `httpapi` events endpoint. Enabling this setting may help reduce 429s – or throttling errors – from Amplitude. More information about Amplitude's throttling is available in [their docs](https://developers.amplitude.com/docs/batch-event-upload-api#429s-in-depth). | false |
| userAgent | string | The user agent of the device sending the event. | (<br/>  "@path": "$.context.userAgent"<br/>) |
| userAgentParsing | boolean | Enabling this setting will set the Device manufacturer, Device Model and OS Name properties based on the user agent string provided in the userAgent field. | true |
</details>
,<details>
<summary>Screen Calls</summary>

#### Log Event V2
Send an event to Amplitude

#### Matched events
type = "screen"

#### Data Mapping
| Name                 | Type          | Description     | Default   |
| -------------------- | -------------- | -------------- | --------- |
| user_id | string | A readable ID specified by you. Must have a minimum length of 5 characters. Required unless device ID is present. **Note:** If you send a request with a user ID that is not in the Amplitude system yet, then the user tied to that ID will not be marked new until their first event. | (<br/>  "@path": "$.userId"<br/>) |
| device_id | string | A device-specific identifier, such as the Identifier for Vendor on iOS. Required unless user ID is present. If a device ID is not sent with the event, it will be set to a hashed version of the user ID. | (<br/>  "@if": (<br/>    "exists": (<br/>      "@path": "$.context.device.id"<br/>    ),<br/>    "then": (<br/>      "@path": "$.context.device.id"<br/>    ),<br/>    "else": (<br/>      "@path": "$.anonymousId"<br/>    )<br/>  )<br/>) |
| event_type | string | A unique identifier for your event. | (<br/>  "@template": "Viewed ((name))"<br/>) |
| session_id | datetime | The start time of the session, necessary if you want to associate events with a particular system. To use automatic Amplitude session tracking in browsers, enable Analytics 2.0 on your connected source. | (<br/>  "@path": "$.integrations.Actions Amplitude.session_id"<br/>) |
| time | datetime | The timestamp of the event. If time is not sent with the event, it will be set to the request upload time. | (<br/>  "@path": "$.timestamp"<br/>) |
| event_properties | object | An object of key-value pairs that represent additional data to be sent along with the event. You can store property values in an array, but note that Amplitude only supports one-dimensional arrays. Date values are transformed into string values. Object depth may not exceed 40 layers. | (<br/>  "@path": "$.properties"<br/>) |
| user_properties | object | An object of key-value pairs that represent additional data tied to the user. You can store property values in an array, but note that Amplitude only supports one-dimensional arrays. Date values are transformed into string values. Object depth may not exceed 40 layers. | (<br/>  "@path": "$.traits"<br/>) |
| app_version | string | The current version of your application. | (<br/>  "@path": "$.context.app.version"<br/>) |
| platform | string | Platform of the device. | (<br/>  "@path": "$.context.device.type"<br/>) |
| os_name | string | The name of the mobile operating system or browser that the user is using. | (<br/>  "@path": "$.context.os.name"<br/>) |
| os_version | string | The version of the mobile operating system or browser the user is using. | (<br/>  "@path": "$.context.os.version"<br/>) |
| device_brand | string | The device brand that the user is using. | (<br/>  "@path": "$.context.device.brand"<br/>) |
| device_manufacturer | string | The device manufacturer that the user is using. | (<br/>  "@path": "$.context.device.manufacturer"<br/>) |
| device_model | string | The device model that the user is using. | (<br/>  "@path": "$.context.device.model"<br/>) |
| carrier | string | The carrier that the user is using. | (<br/>  "@path": "$.context.network.carrier"<br/>) |
| country | string | The current country of the user. | (<br/>  "@path": "$.context.location.country"<br/>) |
| region | string | The current region of the user. | (<br/>  "@path": "$.context.location.region"<br/>) |
| city | string | The current city of the user. | (<br/>  "@path": "$.context.location.city"<br/>) |
| language | string | The language set by the user. | (<br/>  "@path": "$.context.locale"<br/>) |
| price | number | The price of the item purchased. Required for revenue data if the revenue field is not sent. You can use negative values to indicate refunds. | (<br/>  "@path": "$.properties.price"<br/>) |
| quantity | integer | The quantity of the item purchased. Defaults to 1 if not specified. | (<br/>  "@path": "$.properties.quantity"<br/>) |
| revenue | number | Revenue = price * quantity. If you send all 3 fields of price, quantity, and revenue, then (price * quantity) will be used as the revenue value. You can use negative values to indicate refunds. **Note:** You will need to explicitly set this if you are using the Amplitude in cloud-mode. | (<br/>  "@path": "$.properties.revenue"<br/>) |
| productId | string | An identifier for the item purchased. You must send a price and quantity or revenue with this field. | (<br/>  "@path": "$.properties.productId"<br/>) |
| revenueType | string | The type of revenue for the item purchased. You must send a price and quantity or revenue with this field. | (<br/>  "@path": "$.properties.revenueType"<br/>) |
| location_lat | number | The current Latitude of the user. | (<br/>  "@path": "$.context.location.latitude"<br/>) |
| location_lng | number | The current Longitude of the user. | (<br/>  "@path": "$.context.location.longitude"<br/>) |
| ip | string | The IP address of the user. Use "$remote" to use the IP address on the upload request. Amplitude will use the IP address to reverse lookup a user's location (city, country, region, and DMA). Amplitude has the ability to drop the location and IP address from events once it reaches our servers. You can submit a request to Amplitude's platform specialist team here to configure this for you. | (<br/>  "@path": "$.context.ip"<br/>) |
| idfa | string | Identifier for Advertiser. _(iOS)_ | (<br/>  "@if": (<br/>    "exists": (<br/>      "@path": "$.context.device.advertisingId"<br/>    ),<br/>    "then": (<br/>      "@path": "$.context.device.advertisingId"<br/>    ),<br/>    "else": (<br/>      "@path": "$.context.device.idfa"<br/>    )<br/>  )<br/>) |
| idfv | string | Identifier for Vendor. _(iOS)_ | (<br/>  "@path": "$.context.device.id"<br/>) |
| adid | string | Google Play Services advertising ID. _(Android)_ | (<br/>  "@if": (<br/>    "exists": (<br/>      "@path": "$.context.device.advertisingId"<br/>    ),<br/>    "then": (<br/>      "@path": "$.context.device.advertisingId"<br/>    ),<br/>    "else": (<br/>      "@path": "$.context.device.idfa"<br/>    )<br/>  )<br/>) |
| library | string | The name of the library that generated the event. | (<br/>  "@path": "$.context.library.name"<br/>) |
| products | object | The list of products purchased. | (<br/>  "@arrayPath": [<br/>    "$.properties.products",<br/>    (<br/>      "price": (<br/>        "@path": "price"<br/>      ),<br/>      "revenue": (<br/>        "@path": "revenue"<br/>      ),<br/>      "quantity": (<br/>        "@path": "quantity"<br/>      ),<br/>      "productId": (<br/>        "@path": "productId"<br/>      ),<br/>      "revenueType": (<br/>        "@path": "revenueType"<br/>      )<br/>    )<br/>  ]<br/>) |
| setOnce | object | The following fields will be set only once per session when using AJS2 as the source. | (<br/>  "initial_referrer": (<br/>    "@path": "$.context.page.referrer"<br/>  ),<br/>  "initial_utm_source": (<br/>    "@path": "$.context.campaign.source"<br/>  ),<br/>  "initial_utm_medium": (<br/>    "@path": "$.context.campaign.medium"<br/>  ),<br/>  "initial_utm_campaign": (<br/>    "@path": "$.context.campaign.name"<br/>  ),<br/>  "initial_utm_term": (<br/>    "@path": "$.context.campaign.term"<br/>  ),<br/>  "initial_utm_content": (<br/>    "@path": "$.context.campaign.content"<br/>  )<br/>) |
| setAlways | object | The following fields will be set every session when using AJS2 as the source. | (<br/>  "referrer": (<br/>    "@path": "$.context.page.referrer"<br/>  ),<br/>  "utm_source": (<br/>    "@path": "$.context.campaign.source"<br/>  ),<br/>  "utm_medium": (<br/>    "@path": "$.context.campaign.medium"<br/>  ),<br/>  "utm_campaign": (<br/>    "@path": "$.context.campaign.name"<br/>  ),<br/>  "utm_term": (<br/>    "@path": "$.context.campaign.term"<br/>  ),<br/>  "utm_content": (<br/>    "@path": "$.context.campaign.content"<br/>  )<br/>) |
| use_batch_endpoint | boolean | If true, events are sent to Amplitude's `batch` endpoint rather than their `httpapi` events endpoint. Enabling this setting may help reduce 429s – or throttling errors – from Amplitude. More information about Amplitude's throttling is available in [their docs](https://developers.amplitude.com/docs/batch-event-upload-api#429s-in-depth). | false |
| userAgent | string | The user agent of the device sending the event. | (<br/>  "@path": "$.context.userAgent"<br/>) |
| userAgentParsing | boolean | Enabling this setting will set the Device manufacturer, Device Model and OS Name properties based on the user agent string provided in the userAgent field. | true |
</details>
,<details>
<summary>Identify Calls</summary>

#### Identify User
Set the user ID for a particular device ID or update user properties without sending an event to Amplitude.

#### Matched events
type = "identify"

#### Data Mapping
| Name                 | Type          | Description     | Default   |
| -------------------- | -------------- | -------------- | --------- |
| user_id | string | A UUID (unique user ID) specified by you. **Note:** If you send a request with a user ID that is not in the Amplitude system yet, then the user tied to that ID will not be marked new until their first event. Required unless device ID is present. | (<br/>  "@path": "$.userId"<br/>) |
| device_id | string | A device specific identifier, such as the Identifier for Vendor (IDFV) on iOS. Required unless user ID is present. | (<br/>  "@if": (<br/>    "exists": (<br/>      "@path": "$.context.device.id"<br/>    ),<br/>    "then": (<br/>      "@path": "$.context.device.id"<br/>    ),<br/>    "else": (<br/>      "@path": "$.anonymousId"<br/>    )<br/>  )<br/>) |
| user_properties | object | Additional data tied to the user in Amplitude. Each distinct value will show up as a user segment on the Amplitude dashboard. Object depth may not exceed 40 layers. **Note:** You can store property values in an array and date values are transformed into string values. | (<br/>  "@path": "$.traits"<br/>) |
| app_version | string | Version of the app the user is on. | (<br/>  "@path": "$.context.app.version"<br/>) |
| platform | string | The platform of the user's device. | (<br/>  "@path": "$.context.device.type"<br/>) |
| os_name | string | The mobile operating system or browser of the user's device. | (<br/>  "@path": "$.context.os.name"<br/>) |
| os_version | string | The version of the mobile operating system or browser of the user's device. | (<br/>  "@path": "$.context.os.version"<br/>) |
| device_brand | string | The brand of user's the device. | (<br/>  "@path": "$.context.device.brand"<br/>) |
| device_manufacturer | string | The manufacturer of the user's device. | (<br/>  "@path": "$.context.device.manufacturer"<br/>) |
| device_model | string | The model of the user's device. | (<br/>  "@path": "$.context.device.model"<br/>) |
| carrier | string | The user's mobile carrier. | (<br/>  "@path": "$.context.network.carrier"<br/>) |
| country | string | The country in which the user is located. | (<br/>  "@path": "$.context.location.country"<br/>) |
| region | string | The geographical region in which the user is located. | (<br/>  "@path": "$.context.location.region"<br/>) |
| city | string | The city in which the user is located. | (<br/>  "@path": "$.context.location.city"<br/>) |
| language | string | Language the user has set on their device or browser. | (<br/>  "@path": "$.context.locale"<br/>) |
| userAgent | string | The user agent of the device sending the event. | (<br/>  "@path": "$.context.userAgent"<br/>) |
| userAgentParsing | boolean | Enabling this setting will set the Device manufacturer, Device Model and OS Name properties based on the user agent string provided in the userAgent field | true |
| utm_properties | object | UTM Tracking Properties | (<br/>  "utm_source": (<br/>    "@path": "$.context.campaign.source"<br/>  ),<br/>  "utm_medium": (<br/>    "@path": "$.context.campaign.medium"<br/>  ),<br/>  "utm_campaign": (<br/>    "@path": "$.context.campaign.name"<br/>  ),<br/>  "utm_term": (<br/>    "@path": "$.context.campaign.term"<br/>  ),<br/>  "utm_content": (<br/>    "@path": "$.context.campaign.content"<br/>  )<br/>) |
| referrer | string | The referrer of the web request. Sent to Amplitude as both last touch “referrer” and first touch “initial_referrer” | (<br/>  "@path": "$.context.page.referrer"<br/>) |
| library | string | The name of the library that generated the event. | (<br/>  "@path": "$.context.library.name"<br/>) |
</details>
,

