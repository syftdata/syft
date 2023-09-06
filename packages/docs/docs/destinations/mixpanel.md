---
sidebar_position: 14
---
# Mixpanel

This page describes how to set up the Mixpanel as a destination.

## Set up
An example setup for the Mixpanel is shown below.

```ts title="src/pages/api/syft.ts"
import { type NextApiRequest, type NextApiResponse } from "next";
// highlight-next-line
import { NextSyftServer } from "@syftdata/next/lib/next";

const destinations = [
  // highlight-start
  {
    type: "mixpanel",
    settings: {
        projectToken: "xxxx",
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
| projectToken | string | Mixpanel project token. | true |  |
| apiSecret | string | Mixpanel project secret. | true |  |
| apiRegion | string | Learn about [EU data residency](https://help.mixpanel.com/hc/en-us/articles/360039135652-Data-Residency-in-EU) | false | US 🇺🇸 |
| sourceName | string | This value, if it's not blank, will be sent as syft_source_name to Mixpanel for every event/page/screen call. | false |  |
| strictMode | string | This value, if it's 1 (recommended), Mixpanel will validate the events you are trying to send and return errors per event that failed. Learn more about the Mixpanel [Import Events API](https://developer.mixpanel.com/reference/import-events) | false | 1 | 


## Data Modeling
<details>
<summary>Track Calls</summary>

#### Track Event
Send an event to Mixpanel. [Learn more about Events in Mixpanel](https://help.mixpanel.com/hc/en-us/articles/360041995352-Mixpanel-Concepts-Events?source=segment-actions)

#### Matched events
type = "track" and event != "Order Completed"

#### Data Mapping
| Name                 | Type          | Description     | Default   |
| -------------------- | -------------- | -------------- | --------- |
| event | string | The name of the action being performed. | (<br/>  "@path": "$.event"<br/>) |
| distinct_id | string | A distinct ID specified by you. | (<br/>  "@if": (<br/>    "exists": (<br/>      "@path": "$.userId"<br/>    ),<br/>    "then": (<br/>      "@path": "$.userId"<br/>    ),<br/>    "else": (<br/>      "@path": "$.anonymousId"<br/>    )<br/>  )<br/>) |
| anonymous_id | string | A distinct ID randomly generated prior to calling identify. | (<br/>  "@path": "$.anonymousId"<br/>) |
| user_id | string | The distinct ID after calling identify. | (<br/>  "@path": "$.userId"<br/>) |
| group_id | string | The unique identifier of the group that performed this event. | (<br/>  "@path": "$.context.groupId"<br/>) |
| insert_id | string | A random id that is unique to an event. Mixpanel uses $insert_id to deduplicate events. | (<br/>  "@path": "$.messageId"<br/>) |
| time | datetime | The timestamp of the event. Mixpanel expects epoch timestamp in millisecond or second. Please note, Mixpanel only accepts this field as the timestamp. If the field is empty, it will be set to the time Mixpanel servers receive it. | (<br/>  "@path": "$.timestamp"<br/>) |
| app_name | string | The name of your application. | (<br/>  "@path": "$.context.app.name"<br/>) |
| app_namespace | string | The namespace of your application. | (<br/>  "@path": "$.context.app.namespace"<br/>) |
| app_build | string | The current build of your application. | (<br/>  "@path": "$.context.app.build"<br/>) |
| app_version | string | The current version of your application. | (<br/>  "@path": "$.context.app.version"<br/>) |
| os_name | string | The name of the mobile operating system or browser that the user is using. | (<br/>  "@path": "$.context.os.name"<br/>) |
| os_version | string | The version of the mobile operating system or browser the user is using. | (<br/>  "@path": "$.context.os.version"<br/>) |
| device_id | string | A unique identifier for the device the user is using. | (<br/>  "@path": "$.context.device.id"<br/>) |
| device_type | string | The type of the user's device. | (<br/>  "@path": "$.context.device.type"<br/>) |
| device_name | string | The name of the user's device. | (<br/>  "@path": "$.context.device.name"<br/>) |
| device_manufacturer | string | The device manufacturer that the user is using. | (<br/>  "@path": "$.context.device.manufacturer"<br/>) |
| device_model | string | The device model that the user is using. | (<br/>  "@path": "$.context.device.model"<br/>) |
| bluetooth | boolean | Whether bluetooth is enabled. | (<br/>  "@path": "$.context.network.bluetooth"<br/>) |
| carrier | string | The carrier that the user is using. | (<br/>  "@path": "$.context.network.carrier"<br/>) |
| cellular | boolean | Whether cellular is enabled. | (<br/>  "@path": "$.context.network.cellular"<br/>) |
| wifi | boolean | Set to true if user’s device has an active, available Wifi connection, false if not. | (<br/>  "@path": "$.context.network.wifi"<br/>) |
| country | string | The current country of the user. | (<br/>  "@path": "$.context.location.country"<br/>) |
| region | string | The current region of the user. | (<br/>  "@path": "$.context.location.region"<br/>) |
| language | string | The language set by the user. | (<br/>  "@path": "$.context.locale"<br/>) |
| library_name | string | The name of the SDK used to send events. | (<br/>  "@path": "$.context.library.name"<br/>) |
| library_version | string | The version of the SDK used to send events. | (<br/>  "@path": "$.context.library.version"<br/>) |
| ip | string | The IP address of the user. This is only used for geolocation and won't be stored. | (<br/>  "@path": "$.context.ip"<br/>) |
| idfa | string | Identifier for Advertiser. _(iOS)_ | (<br/>  "@if": (<br/>    "exists": (<br/>      "@path": "$.context.device.advertisingId"<br/>    ),<br/>    "then": (<br/>      "@path": "$.context.device.advertisingId"<br/>    ),<br/>    "else": (<br/>      "@path": "$.context.device.idfa"<br/>    )<br/>  )<br/>) |
| url | string | The full URL of the webpage on which the event is triggered. | (<br/>  "@path": "$.context.page.url"<br/>) |
| screen_width | number | Width, in pixels, of the device screen. | (<br/>  "@path": "$.context.screen.density"<br/>) |
| screen_height | number | Height, in pixels, of the device screen. | (<br/>  "@path": "$.context.screen.density"<br/>) |
| screen_density | number | Pixel density of the device screen. | (<br/>  "@path": "$.context.screen.density"<br/>) |
| referrer | string | Referrer url | (<br/>  "@path": "$.context.page.referrer"<br/>) |
| userAgent | string | User agent | (<br/>  "@path": "$.context.userAgent"<br/>) |
| advertising_id | string | Advertising ID | (<br/>  "@path": "$.context.device.advertisingId"<br/>) |
| ad_tracking_enabled | string | Ad Tracking Enabled (true or false) | (<br/>  "@path": "$.context.device.adTrackingEnabled"<br/>) |
| timezone | string | The event timezone | (<br/>  "@path": "$.context.timezone"<br/>) |
| app_platform | string | The App Platform, if applicable | (<br/>  "@path": "$.context.app.platform"<br/>) |
| name | string | The Event Original Name, if applicable | (<br/>  "@if": (<br/>    "exists": (<br/>      "@path": "$.event"<br/>    ),<br/>    "then": (<br/>      "@path": "$.event"<br/>    ),<br/>    "else": (<br/>      "@path": "$.name"<br/>    )<br/>  )<br/>) |
| event_properties | object | An object of key-value pairs that represent additional data to be sent along with the event. | (<br/>  "@path": "$.properties"<br/>) |
| context | object | An object of key-value pairs that provides useful context about the event. | (<br/>  "@path": "$.context"<br/>) |
| utm_properties | object | UTM Tracking Properties | (<br/>  "utm_source": (<br/>    "@path": "$.context.campaign.source"<br/>  ),<br/>  "utm_medium": (<br/>    "@path": "$.context.campaign.medium"<br/>  ),<br/>  "utm_campaign": (<br/>    "@path": "$.context.campaign.name"<br/>  ),<br/>  "utm_term": (<br/>    "@path": "$.context.campaign.term"<br/>  ),<br/>  "utm_content": (<br/>    "@path": "$.context.campaign.content"<br/>  )<br/>) |
| enable_batching | boolean | Set as true to ensure Segment sends data to Mixpanel in batches. | true |
</details>
,<details>
<summary>Order Completed Calls</summary>

#### Track Purchase
Send an 'Order Completed' Event to Mixpanel.

#### Matched events
type = "track" and event = "Order Completed"

#### Data Mapping
| Name                 | Type          | Description     | Default   |
| -------------------- | -------------- | -------------- | --------- |
| generatePurchaseEventPerProduct | boolean | When enabled, send "Product Purchased" with each product within the event. | true |
| distinct_id | string | A distinct ID specified by you. | (<br/>  "@if": (<br/>    "exists": (<br/>      "@path": "$.userId"<br/>    ),<br/>    "then": (<br/>      "@path": "$.userId"<br/>    ),<br/>    "else": (<br/>      "@path": "$.anonymousId"<br/>    )<br/>  )<br/>) |
| anonymous_id | string | A distinct ID randomly generated prior to calling identify. | (<br/>  "@path": "$.anonymousId"<br/>) |
| user_id | string | The distinct ID after calling identify. | (<br/>  "@path": "$.userId"<br/>) |
| group_id | string | The unique identifier of the group that performed this event. | (<br/>  "@path": "$.context.groupId"<br/>) |
| insert_id | string | A random id that is unique to an event. Mixpanel uses $insert_id to deduplicate events. | (<br/>  "@path": "$.messageId"<br/>) |
| time | datetime | The timestamp of the event. Mixpanel expects epoch timestamp in millisecond or second. Please note, Mixpanel only accepts this field as the timestamp. If the field is empty, it will be set to the time Mixpanel servers receive it. | (<br/>  "@path": "$.timestamp"<br/>) |
| app_name | string | The name of your application. | (<br/>  "@path": "$.context.app.name"<br/>) |
| app_namespace | string | The namespace of your application. | (<br/>  "@path": "$.context.app.namespace"<br/>) |
| app_build | string | The current build of your application. | (<br/>  "@path": "$.context.app.build"<br/>) |
| app_version | string | The current version of your application. | (<br/>  "@path": "$.context.app.version"<br/>) |
| os_name | string | The name of the mobile operating system or browser that the user is using. | (<br/>  "@path": "$.context.os.name"<br/>) |
| os_version | string | The version of the mobile operating system or browser the user is using. | (<br/>  "@path": "$.context.os.version"<br/>) |
| device_id | string | A unique identifier for the device the user is using. | (<br/>  "@path": "$.context.device.id"<br/>) |
| device_type | string | The type of the user's device. | (<br/>  "@path": "$.context.device.type"<br/>) |
| device_name | string | The name of the user's device. | (<br/>  "@path": "$.context.device.name"<br/>) |
| device_manufacturer | string | The device manufacturer that the user is using. | (<br/>  "@path": "$.context.device.manufacturer"<br/>) |
| device_model | string | The device model that the user is using. | (<br/>  "@path": "$.context.device.model"<br/>) |
| bluetooth | boolean | Whether bluetooth is enabled. | (<br/>  "@path": "$.context.network.bluetooth"<br/>) |
| carrier | string | The carrier that the user is using. | (<br/>  "@path": "$.context.network.carrier"<br/>) |
| cellular | boolean | Whether cellular is enabled. | (<br/>  "@path": "$.context.network.cellular"<br/>) |
| wifi | boolean | Set to true if user’s device has an active, available Wifi connection, false if not. | (<br/>  "@path": "$.context.network.wifi"<br/>) |
| country | string | The current country of the user. | (<br/>  "@path": "$.context.location.country"<br/>) |
| region | string | The current region of the user. | (<br/>  "@path": "$.context.location.region"<br/>) |
| language | string | The language set by the user. | (<br/>  "@path": "$.context.locale"<br/>) |
| library_name | string | The name of the SDK used to send events. | (<br/>  "@path": "$.context.library.name"<br/>) |
| library_version | string | The version of the SDK used to send events. | (<br/>  "@path": "$.context.library.version"<br/>) |
| ip | string | The IP address of the user. This is only used for geolocation and won't be stored. | (<br/>  "@path": "$.context.ip"<br/>) |
| idfa | string | Identifier for Advertiser. _(iOS)_ | (<br/>  "@if": (<br/>    "exists": (<br/>      "@path": "$.context.device.advertisingId"<br/>    ),<br/>    "then": (<br/>      "@path": "$.context.device.advertisingId"<br/>    ),<br/>    "else": (<br/>      "@path": "$.context.device.idfa"<br/>    )<br/>  )<br/>) |
| url | string | The full URL of the webpage on which the event is triggered. | (<br/>  "@path": "$.context.page.url"<br/>) |
| screen_width | number | Width, in pixels, of the device screen. | (<br/>  "@path": "$.context.screen.density"<br/>) |
| screen_height | number | Height, in pixels, of the device screen. | (<br/>  "@path": "$.context.screen.density"<br/>) |
| screen_density | number | Pixel density of the device screen. | (<br/>  "@path": "$.context.screen.density"<br/>) |
| referrer | string | Referrer url | (<br/>  "@path": "$.context.page.referrer"<br/>) |
| userAgent | string | User agent | (<br/>  "@path": "$.context.userAgent"<br/>) |
| advertising_id | string | Advertising ID | (<br/>  "@path": "$.context.device.advertisingId"<br/>) |
| ad_tracking_enabled | string | Ad Tracking Enabled (true or false) | (<br/>  "@path": "$.context.device.adTrackingEnabled"<br/>) |
| timezone | string | The event timezone | (<br/>  "@path": "$.context.timezone"<br/>) |
| app_platform | string | The App Platform, if applicable | (<br/>  "@path": "$.context.app.platform"<br/>) |
| name | string | The Event Original Name, if applicable | (<br/>  "@if": (<br/>    "exists": (<br/>      "@path": "$.event"<br/>    ),<br/>    "then": (<br/>      "@path": "$.event"<br/>    ),<br/>    "else": (<br/>      "@path": "$.name"<br/>    )<br/>  )<br/>) |
| event_properties | object | An object of key-value pairs that represent additional data to be sent along with the event. | (<br/>  "@path": "$.properties"<br/>) |
| context | object | An object of key-value pairs that provides useful context about the event. | (<br/>  "@path": "$.context"<br/>) |
| utm_properties | object | UTM Tracking Properties | (<br/>  "utm_source": (<br/>    "@path": "$.context.campaign.source"<br/>  ),<br/>  "utm_medium": (<br/>    "@path": "$.context.campaign.medium"<br/>  ),<br/>  "utm_campaign": (<br/>    "@path": "$.context.campaign.name"<br/>  ),<br/>  "utm_term": (<br/>    "@path": "$.context.campaign.term"<br/>  ),<br/>  "utm_content": (<br/>    "@path": "$.context.campaign.content"<br/>  )<br/>) |
| enable_batching | boolean | Set as true to ensure Segment sends data to Mixpanel in batches. | true |
| products | object | Products in the order. | (<br/>  "@arrayPath": [<br/>    "$.properties.products",<br/>    (<br/>      "product_id": (<br/>        "@path": "product_id"<br/>      ),<br/>      "sku": (<br/>        "@path": "sku"<br/>      ),<br/>      "category": (<br/>        "@path": "category"<br/>      ),<br/>      "name": (<br/>        "@path": "name"<br/>      ),<br/>      "brand": (<br/>        "@path": "brand"<br/>      ),<br/>      "variant": (<br/>        "@path": "variant"<br/>      ),<br/>      "price": (<br/>        "@path": "price"<br/>      ),<br/>      "quantity": (<br/>        "@path": "quantity"<br/>      ),<br/>      "coupon": (<br/>        "@path": "coupon"<br/>      ),<br/>      "position": (<br/>        "@path": "position"<br/>      ),<br/>      "url": (<br/>        "@path": "url"<br/>      ),<br/>      "image_url": (<br/>        "@path": "image_url"<br/>      )<br/>    )<br/>  ]<br/>) |
| event | string | The name of the action being performed. | (<br/>  "@path": "$.event"<br/>) |
</details>
,<details>
<summary>Page Calls</summary>

#### Track Event
Send an event to Mixpanel. [Learn more about Events in Mixpanel](https://help.mixpanel.com/hc/en-us/articles/360041995352-Mixpanel-Concepts-Events?source=segment-actions)

#### Matched events
type = "page"

#### Data Mapping
| Name                 | Type          | Description     | Default   |
| -------------------- | -------------- | -------------- | --------- |
| event | string | The name of the action being performed. | (<br/>  "@template": "Viewed ((name))"<br/>) |
| distinct_id | string | A distinct ID specified by you. | (<br/>  "@if": (<br/>    "exists": (<br/>      "@path": "$.userId"<br/>    ),<br/>    "then": (<br/>      "@path": "$.userId"<br/>    ),<br/>    "else": (<br/>      "@path": "$.anonymousId"<br/>    )<br/>  )<br/>) |
| anonymous_id | string | A distinct ID randomly generated prior to calling identify. | (<br/>  "@path": "$.anonymousId"<br/>) |
| user_id | string | The distinct ID after calling identify. | (<br/>  "@path": "$.userId"<br/>) |
| group_id | string | The unique identifier of the group that performed this event. | (<br/>  "@path": "$.context.groupId"<br/>) |
| insert_id | string | A random id that is unique to an event. Mixpanel uses $insert_id to deduplicate events. | (<br/>  "@path": "$.messageId"<br/>) |
| time | datetime | The timestamp of the event. Mixpanel expects epoch timestamp in millisecond or second. Please note, Mixpanel only accepts this field as the timestamp. If the field is empty, it will be set to the time Mixpanel servers receive it. | (<br/>  "@path": "$.timestamp"<br/>) |
| app_name | string | The name of your application. | (<br/>  "@path": "$.context.app.name"<br/>) |
| app_namespace | string | The namespace of your application. | (<br/>  "@path": "$.context.app.namespace"<br/>) |
| app_build | string | The current build of your application. | (<br/>  "@path": "$.context.app.build"<br/>) |
| app_version | string | The current version of your application. | (<br/>  "@path": "$.context.app.version"<br/>) |
| os_name | string | The name of the mobile operating system or browser that the user is using. | (<br/>  "@path": "$.context.os.name"<br/>) |
| os_version | string | The version of the mobile operating system or browser the user is using. | (<br/>  "@path": "$.context.os.version"<br/>) |
| device_id | string | A unique identifier for the device the user is using. | (<br/>  "@path": "$.context.device.id"<br/>) |
| device_type | string | The type of the user's device. | (<br/>  "@path": "$.context.device.type"<br/>) |
| device_name | string | The name of the user's device. | (<br/>  "@path": "$.context.device.name"<br/>) |
| device_manufacturer | string | The device manufacturer that the user is using. | (<br/>  "@path": "$.context.device.manufacturer"<br/>) |
| device_model | string | The device model that the user is using. | (<br/>  "@path": "$.context.device.model"<br/>) |
| bluetooth | boolean | Whether bluetooth is enabled. | (<br/>  "@path": "$.context.network.bluetooth"<br/>) |
| carrier | string | The carrier that the user is using. | (<br/>  "@path": "$.context.network.carrier"<br/>) |
| cellular | boolean | Whether cellular is enabled. | (<br/>  "@path": "$.context.network.cellular"<br/>) |
| wifi | boolean | Set to true if user’s device has an active, available Wifi connection, false if not. | (<br/>  "@path": "$.context.network.wifi"<br/>) |
| country | string | The current country of the user. | (<br/>  "@path": "$.context.location.country"<br/>) |
| region | string | The current region of the user. | (<br/>  "@path": "$.context.location.region"<br/>) |
| language | string | The language set by the user. | (<br/>  "@path": "$.context.locale"<br/>) |
| library_name | string | The name of the SDK used to send events. | (<br/>  "@path": "$.context.library.name"<br/>) |
| library_version | string | The version of the SDK used to send events. | (<br/>  "@path": "$.context.library.version"<br/>) |
| ip | string | The IP address of the user. This is only used for geolocation and won't be stored. | (<br/>  "@path": "$.context.ip"<br/>) |
| idfa | string | Identifier for Advertiser. _(iOS)_ | (<br/>  "@if": (<br/>    "exists": (<br/>      "@path": "$.context.device.advertisingId"<br/>    ),<br/>    "then": (<br/>      "@path": "$.context.device.advertisingId"<br/>    ),<br/>    "else": (<br/>      "@path": "$.context.device.idfa"<br/>    )<br/>  )<br/>) |
| url | string | The full URL of the webpage on which the event is triggered. | (<br/>  "@path": "$.context.page.url"<br/>) |
| screen_width | number | Width, in pixels, of the device screen. | (<br/>  "@path": "$.context.screen.density"<br/>) |
| screen_height | number | Height, in pixels, of the device screen. | (<br/>  "@path": "$.context.screen.density"<br/>) |
| screen_density | number | Pixel density of the device screen. | (<br/>  "@path": "$.context.screen.density"<br/>) |
| referrer | string | Referrer url | (<br/>  "@path": "$.context.page.referrer"<br/>) |
| userAgent | string | User agent | (<br/>  "@path": "$.context.userAgent"<br/>) |
| advertising_id | string | Advertising ID | (<br/>  "@path": "$.context.device.advertisingId"<br/>) |
| ad_tracking_enabled | string | Ad Tracking Enabled (true or false) | (<br/>  "@path": "$.context.device.adTrackingEnabled"<br/>) |
| timezone | string | The event timezone | (<br/>  "@path": "$.context.timezone"<br/>) |
| app_platform | string | The App Platform, if applicable | (<br/>  "@path": "$.context.app.platform"<br/>) |
| name | string | The Event Original Name, if applicable | (<br/>  "@if": (<br/>    "exists": (<br/>      "@path": "$.event"<br/>    ),<br/>    "then": (<br/>      "@path": "$.event"<br/>    ),<br/>    "else": (<br/>      "@path": "$.name"<br/>    )<br/>  )<br/>) |
| event_properties | object | An object of key-value pairs that represent additional data to be sent along with the event. | (<br/>  "@path": "$.properties"<br/>) |
| context | object | An object of key-value pairs that provides useful context about the event. | (<br/>  "@path": "$.context"<br/>) |
| utm_properties | object | UTM Tracking Properties | (<br/>  "utm_source": (<br/>    "@path": "$.context.campaign.source"<br/>  ),<br/>  "utm_medium": (<br/>    "@path": "$.context.campaign.medium"<br/>  ),<br/>  "utm_campaign": (<br/>    "@path": "$.context.campaign.name"<br/>  ),<br/>  "utm_term": (<br/>    "@path": "$.context.campaign.term"<br/>  ),<br/>  "utm_content": (<br/>    "@path": "$.context.campaign.content"<br/>  )<br/>) |
| enable_batching | boolean | Set as true to ensure Segment sends data to Mixpanel in batches. | true |
</details>
,<details>
<summary>Screen Calls</summary>

#### Track Event
Send an event to Mixpanel. [Learn more about Events in Mixpanel](https://help.mixpanel.com/hc/en-us/articles/360041995352-Mixpanel-Concepts-Events?source=segment-actions)

#### Matched events
type = "screen"

#### Data Mapping
| Name                 | Type          | Description     | Default   |
| -------------------- | -------------- | -------------- | --------- |
| event | string | The name of the action being performed. | (<br/>  "@template": "Viewed ((name))"<br/>) |
| distinct_id | string | A distinct ID specified by you. | (<br/>  "@if": (<br/>    "exists": (<br/>      "@path": "$.userId"<br/>    ),<br/>    "then": (<br/>      "@path": "$.userId"<br/>    ),<br/>    "else": (<br/>      "@path": "$.anonymousId"<br/>    )<br/>  )<br/>) |
| anonymous_id | string | A distinct ID randomly generated prior to calling identify. | (<br/>  "@path": "$.anonymousId"<br/>) |
| user_id | string | The distinct ID after calling identify. | (<br/>  "@path": "$.userId"<br/>) |
| group_id | string | The unique identifier of the group that performed this event. | (<br/>  "@path": "$.context.groupId"<br/>) |
| insert_id | string | A random id that is unique to an event. Mixpanel uses $insert_id to deduplicate events. | (<br/>  "@path": "$.messageId"<br/>) |
| time | datetime | The timestamp of the event. Mixpanel expects epoch timestamp in millisecond or second. Please note, Mixpanel only accepts this field as the timestamp. If the field is empty, it will be set to the time Mixpanel servers receive it. | (<br/>  "@path": "$.timestamp"<br/>) |
| app_name | string | The name of your application. | (<br/>  "@path": "$.context.app.name"<br/>) |
| app_namespace | string | The namespace of your application. | (<br/>  "@path": "$.context.app.namespace"<br/>) |
| app_build | string | The current build of your application. | (<br/>  "@path": "$.context.app.build"<br/>) |
| app_version | string | The current version of your application. | (<br/>  "@path": "$.context.app.version"<br/>) |
| os_name | string | The name of the mobile operating system or browser that the user is using. | (<br/>  "@path": "$.context.os.name"<br/>) |
| os_version | string | The version of the mobile operating system or browser the user is using. | (<br/>  "@path": "$.context.os.version"<br/>) |
| device_id | string | A unique identifier for the device the user is using. | (<br/>  "@path": "$.context.device.id"<br/>) |
| device_type | string | The type of the user's device. | (<br/>  "@path": "$.context.device.type"<br/>) |
| device_name | string | The name of the user's device. | (<br/>  "@path": "$.context.device.name"<br/>) |
| device_manufacturer | string | The device manufacturer that the user is using. | (<br/>  "@path": "$.context.device.manufacturer"<br/>) |
| device_model | string | The device model that the user is using. | (<br/>  "@path": "$.context.device.model"<br/>) |
| bluetooth | boolean | Whether bluetooth is enabled. | (<br/>  "@path": "$.context.network.bluetooth"<br/>) |
| carrier | string | The carrier that the user is using. | (<br/>  "@path": "$.context.network.carrier"<br/>) |
| cellular | boolean | Whether cellular is enabled. | (<br/>  "@path": "$.context.network.cellular"<br/>) |
| wifi | boolean | Set to true if user’s device has an active, available Wifi connection, false if not. | (<br/>  "@path": "$.context.network.wifi"<br/>) |
| country | string | The current country of the user. | (<br/>  "@path": "$.context.location.country"<br/>) |
| region | string | The current region of the user. | (<br/>  "@path": "$.context.location.region"<br/>) |
| language | string | The language set by the user. | (<br/>  "@path": "$.context.locale"<br/>) |
| library_name | string | The name of the SDK used to send events. | (<br/>  "@path": "$.context.library.name"<br/>) |
| library_version | string | The version of the SDK used to send events. | (<br/>  "@path": "$.context.library.version"<br/>) |
| ip | string | The IP address of the user. This is only used for geolocation and won't be stored. | (<br/>  "@path": "$.context.ip"<br/>) |
| idfa | string | Identifier for Advertiser. _(iOS)_ | (<br/>  "@if": (<br/>    "exists": (<br/>      "@path": "$.context.device.advertisingId"<br/>    ),<br/>    "then": (<br/>      "@path": "$.context.device.advertisingId"<br/>    ),<br/>    "else": (<br/>      "@path": "$.context.device.idfa"<br/>    )<br/>  )<br/>) |
| url | string | The full URL of the webpage on which the event is triggered. | (<br/>  "@path": "$.context.page.url"<br/>) |
| screen_width | number | Width, in pixels, of the device screen. | (<br/>  "@path": "$.context.screen.density"<br/>) |
| screen_height | number | Height, in pixels, of the device screen. | (<br/>  "@path": "$.context.screen.density"<br/>) |
| screen_density | number | Pixel density of the device screen. | (<br/>  "@path": "$.context.screen.density"<br/>) |
| referrer | string | Referrer url | (<br/>  "@path": "$.context.page.referrer"<br/>) |
| userAgent | string | User agent | (<br/>  "@path": "$.context.userAgent"<br/>) |
| advertising_id | string | Advertising ID | (<br/>  "@path": "$.context.device.advertisingId"<br/>) |
| ad_tracking_enabled | string | Ad Tracking Enabled (true or false) | (<br/>  "@path": "$.context.device.adTrackingEnabled"<br/>) |
| timezone | string | The event timezone | (<br/>  "@path": "$.context.timezone"<br/>) |
| app_platform | string | The App Platform, if applicable | (<br/>  "@path": "$.context.app.platform"<br/>) |
| name | string | The Event Original Name, if applicable | (<br/>  "@if": (<br/>    "exists": (<br/>      "@path": "$.event"<br/>    ),<br/>    "then": (<br/>      "@path": "$.event"<br/>    ),<br/>    "else": (<br/>      "@path": "$.name"<br/>    )<br/>  )<br/>) |
| event_properties | object | An object of key-value pairs that represent additional data to be sent along with the event. | (<br/>  "@path": "$.properties"<br/>) |
| context | object | An object of key-value pairs that provides useful context about the event. | (<br/>  "@path": "$.context"<br/>) |
| utm_properties | object | UTM Tracking Properties | (<br/>  "utm_source": (<br/>    "@path": "$.context.campaign.source"<br/>  ),<br/>  "utm_medium": (<br/>    "@path": "$.context.campaign.medium"<br/>  ),<br/>  "utm_campaign": (<br/>    "@path": "$.context.campaign.name"<br/>  ),<br/>  "utm_term": (<br/>    "@path": "$.context.campaign.term"<br/>  ),<br/>  "utm_content": (<br/>    "@path": "$.context.campaign.content"<br/>  )<br/>) |
| enable_batching | boolean | Set as true to ensure Segment sends data to Mixpanel in batches. | true |
</details>
,<details>
<summary>Identify Calls</summary>

#### Identify User
Set the user ID for a particular device ID or update user properties. Learn more about [User Profiles](https://help.mixpanel.com/hc/en-us/articles/115004501966?source=segment-actions) and [Identity Management](https://help.mixpanel.com/hc/en-us/articles/360041039771-Getting-Started-with-Identity-Management?source=segment-actions).

#### Matched events
type = "identify"

#### Data Mapping
| Name                 | Type          | Description     | Default   |
| -------------------- | -------------- | -------------- | --------- |
| ip | string | The IP address of the user. This is only used for geolocation and won't be stored. | (<br/>  "@path": "$.context.ip"<br/>) |
| user_id | string | The unique user identifier set by you | (<br/>  "@path": "$.userId"<br/>) |
| anonymous_id | string | The generated anonymous ID for the user | (<br/>  "@path": "$.anonymousId"<br/>) |
| traits | object | Properties to set on the user profile | (<br/>  "@path": "$.traits"<br/>) |
</details>
,<details>
<summary>Group Calls</summary>

#### Group Identify User
Updates or adds properties to a group profile. The profile is created if it does not exist. [Learn more about Group Analytics.](https://help.mixpanel.com/hc/en-us/articles/360025333632-Group-Analytics?source=segment-actions)

#### Matched events
type = "group"

#### Data Mapping
| Name                 | Type          | Description     | Default   |
| -------------------- | -------------- | -------------- | --------- |
| group_id | string | The unique identifier of the group. If there is a trait that matches the group key, it will override this value. | (<br/>  "@path": "$.groupId"<br/>) |
| traits | object | The properties to set on the group profile. | (<br/>  "@path": "$.traits"<br/>) |
</details>


