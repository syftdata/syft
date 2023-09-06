---
sidebar_position: 17
---
# Mixpanel

This page describes how to set up Mixpanel as a destination.

## Set up
An example setup for Mixpanel is shown below.

```ts title="src/pages/api/syft.ts"
// ...
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
// ...
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
| Destination Field                 | Type          | Description     | Source Field   |
| -------------------- | -------------- | -------------- | --------- |
| event | string | The name of the action being performed. | $.event |
| distinct_id | string | A distinct ID specified by you. | $.userId ?? $.anonymousId |
| anonymous_id | string | A distinct ID randomly generated prior to calling identify. | $.anonymousId |
| user_id | string | The distinct ID after calling identify. | $.userId |
| group_id | string | The unique identifier of the group that performed this event. | $.context.groupId |
| insert_id | string | A random id that is unique to an event. Mixpanel uses $insert_id to deduplicate events. | $.messageId |
| time | datetime | The timestamp of the event. Mixpanel expects epoch timestamp in millisecond or second. Please note, Mixpanel only accepts this field as the timestamp. If the field is empty, it will be set to the time Mixpanel servers receive it. | $.timestamp |
| app_name | string | The name of your application. | $.context.app.name |
| app_namespace | string | The namespace of your application. | $.context.app.namespace |
| app_build | string | The current build of your application. | $.context.app.build |
| app_version | string | The current version of your application. | $.context.app.version |
| os_name | string | The name of the mobile operating system or browser that the user is using. | $.context.os.name |
| os_version | string | The version of the mobile operating system or browser the user is using. | $.context.os.version |
| device_id | string | A unique identifier for the device the user is using. | $.context.device.id |
| device_type | string | The type of the user's device. | $.context.device.type |
| device_name | string | The name of the user's device. | $.context.device.name |
| device_manufacturer | string | The device manufacturer that the user is using. | $.context.device.manufacturer |
| device_model | string | The device model that the user is using. | $.context.device.model |
| bluetooth | boolean | Whether bluetooth is enabled. | $.context.network.bluetooth |
| carrier | string | The carrier that the user is using. | $.context.network.carrier |
| cellular | boolean | Whether cellular is enabled. | $.context.network.cellular |
| wifi | boolean | Set to true if user’s device has an active, available Wifi connection, false if not. | $.context.network.wifi |
| country | string | The current country of the user. | $.context.location.country |
| region | string | The current region of the user. | $.context.location.region |
| language | string | The language set by the user. | $.context.locale |
| library_name | string | The name of the SDK used to send events. | $.context.library.name |
| library_version | string | The version of the SDK used to send events. | $.context.library.version |
| ip | string | The IP address of the user. This is only used for geolocation and won't be stored. | $.context.ip |
| idfa | string | Identifier for Advertiser. _(iOS)_ | $.context.device.advertisingId ?? $.context.device.idfa |
| url | string | The full URL of the webpage on which the event is triggered. | $.context.page.url |
| screen_width | number | Width, in pixels, of the device screen. | $.context.screen.density |
| screen_height | number | Height, in pixels, of the device screen. | $.context.screen.density |
| screen_density | number | Pixel density of the device screen. | $.context.screen.density |
| referrer | string | Referrer url | $.context.page.referrer |
| userAgent | string | User agent | $.context.userAgent |
| advertising_id | string | Advertising ID | $.context.device.advertisingId |
| ad_tracking_enabled | string | Ad Tracking Enabled (true or false) | $.context.device.adTrackingEnabled |
| timezone | string | The event timezone | $.context.timezone |
| app_platform | string | The App Platform, if applicable | $.context.app.platform |
| name | string | The Event Original Name, if applicable | $.event ?? $.name |
| event_properties | object | An object of key-value pairs that represent additional data to be sent along with the event. | $.properties |
| context | object | An object of key-value pairs that provides useful context about the event. | $.context |
| utm_properties | object | UTM Tracking Properties | <pre>{<br/>  "utm_source": {<br/>    "@path": "$.context.campaign.source"<br/>  },<br/>  "utm_medium": {<br/>    "@path": "$.context.campaign.medium"<br/>  },<br/>  "utm_campaign": {<br/>    "@path": "$.context.campaign.name"<br/>  },<br/>  "utm_term": {<br/>    "@path": "$.context.campaign.term"<br/>  },<br/>  "utm_content": {<br/>    "@path": "$.context.campaign.content"<br/>  }<br/>}</pre> |
| enable_batching | boolean | Set as true to ensure Syft sends data to Mixpanel in batches. | true |
</details>
,<details>
<summary>Order Completed Calls</summary>

#### Track Purchase
Send an 'Order Completed' Event to Mixpanel.

#### Matched events
type = "track" and event = "Order Completed"

#### Data Mapping
| Destination Field                 | Type          | Description     | Source Field   |
| -------------------- | -------------- | -------------- | --------- |
| generatePurchaseEventPerProduct | boolean | When enabled, send "Product Purchased" with each product within the event. | true |
| distinct_id | string | A distinct ID specified by you. | $.userId ?? $.anonymousId |
| anonymous_id | string | A distinct ID randomly generated prior to calling identify. | $.anonymousId |
| user_id | string | The distinct ID after calling identify. | $.userId |
| group_id | string | The unique identifier of the group that performed this event. | $.context.groupId |
| insert_id | string | A random id that is unique to an event. Mixpanel uses $insert_id to deduplicate events. | $.messageId |
| time | datetime | The timestamp of the event. Mixpanel expects epoch timestamp in millisecond or second. Please note, Mixpanel only accepts this field as the timestamp. If the field is empty, it will be set to the time Mixpanel servers receive it. | $.timestamp |
| app_name | string | The name of your application. | $.context.app.name |
| app_namespace | string | The namespace of your application. | $.context.app.namespace |
| app_build | string | The current build of your application. | $.context.app.build |
| app_version | string | The current version of your application. | $.context.app.version |
| os_name | string | The name of the mobile operating system or browser that the user is using. | $.context.os.name |
| os_version | string | The version of the mobile operating system or browser the user is using. | $.context.os.version |
| device_id | string | A unique identifier for the device the user is using. | $.context.device.id |
| device_type | string | The type of the user's device. | $.context.device.type |
| device_name | string | The name of the user's device. | $.context.device.name |
| device_manufacturer | string | The device manufacturer that the user is using. | $.context.device.manufacturer |
| device_model | string | The device model that the user is using. | $.context.device.model |
| bluetooth | boolean | Whether bluetooth is enabled. | $.context.network.bluetooth |
| carrier | string | The carrier that the user is using. | $.context.network.carrier |
| cellular | boolean | Whether cellular is enabled. | $.context.network.cellular |
| wifi | boolean | Set to true if user’s device has an active, available Wifi connection, false if not. | $.context.network.wifi |
| country | string | The current country of the user. | $.context.location.country |
| region | string | The current region of the user. | $.context.location.region |
| language | string | The language set by the user. | $.context.locale |
| library_name | string | The name of the SDK used to send events. | $.context.library.name |
| library_version | string | The version of the SDK used to send events. | $.context.library.version |
| ip | string | The IP address of the user. This is only used for geolocation and won't be stored. | $.context.ip |
| idfa | string | Identifier for Advertiser. _(iOS)_ | $.context.device.advertisingId ?? $.context.device.idfa |
| url | string | The full URL of the webpage on which the event is triggered. | $.context.page.url |
| screen_width | number | Width, in pixels, of the device screen. | $.context.screen.density |
| screen_height | number | Height, in pixels, of the device screen. | $.context.screen.density |
| screen_density | number | Pixel density of the device screen. | $.context.screen.density |
| referrer | string | Referrer url | $.context.page.referrer |
| userAgent | string | User agent | $.context.userAgent |
| advertising_id | string | Advertising ID | $.context.device.advertisingId |
| ad_tracking_enabled | string | Ad Tracking Enabled (true or false) | $.context.device.adTrackingEnabled |
| timezone | string | The event timezone | $.context.timezone |
| app_platform | string | The App Platform, if applicable | $.context.app.platform |
| name | string | The Event Original Name, if applicable | $.event ?? $.name |
| event_properties | object | An object of key-value pairs that represent additional data to be sent along with the event. | $.properties |
| context | object | An object of key-value pairs that provides useful context about the event. | $.context |
| utm_properties | object | UTM Tracking Properties | <pre>{<br/>  "utm_source": {<br/>    "@path": "$.context.campaign.source"<br/>  },<br/>  "utm_medium": {<br/>    "@path": "$.context.campaign.medium"<br/>  },<br/>  "utm_campaign": {<br/>    "@path": "$.context.campaign.name"<br/>  },<br/>  "utm_term": {<br/>    "@path": "$.context.campaign.term"<br/>  },<br/>  "utm_content": {<br/>    "@path": "$.context.campaign.content"<br/>  }<br/>}</pre> |
| enable_batching | boolean | Set as true to ensure Syft sends data to Mixpanel in batches. | true |
| products | object | Products in the order. | <pre>{<br/>  "@arrayPath": [<br/>    "$.properties.products",<br/>    {<br/>      "product_id": {<br/>        "@path": "product_id"<br/>      },<br/>      "sku": {<br/>        "@path": "sku"<br/>      },<br/>      "category": {<br/>        "@path": "category"<br/>      },<br/>      "name": {<br/>        "@path": "name"<br/>      },<br/>      "brand": {<br/>        "@path": "brand"<br/>      },<br/>      "variant": {<br/>        "@path": "variant"<br/>      },<br/>      "price": {<br/>        "@path": "price"<br/>      },<br/>      "quantity": {<br/>        "@path": "quantity"<br/>      },<br/>      "coupon": {<br/>        "@path": "coupon"<br/>      },<br/>      "position": {<br/>        "@path": "position"<br/>      },<br/>      "url": {<br/>        "@path": "url"<br/>      },<br/>      "image_url": {<br/>        "@path": "image_url"<br/>      }<br/>    }<br/>  ]<br/>}</pre> |
| event | string | The name of the action being performed. | $.event |
</details>
,<details>
<summary>Page Calls</summary>

#### Track Event
Send an event to Mixpanel. [Learn more about Events in Mixpanel](https://help.mixpanel.com/hc/en-us/articles/360041995352-Mixpanel-Concepts-Events?source=segment-actions)

#### Matched events
type = "page"

#### Data Mapping
| Destination Field                 | Type          | Description     | Source Field   |
| -------------------- | -------------- | -------------- | --------- |
| event | string | The name of the action being performed. | "Viewed $.name" |
| distinct_id | string | A distinct ID specified by you. | $.userId ?? $.anonymousId |
| anonymous_id | string | A distinct ID randomly generated prior to calling identify. | $.anonymousId |
| user_id | string | The distinct ID after calling identify. | $.userId |
| group_id | string | The unique identifier of the group that performed this event. | $.context.groupId |
| insert_id | string | A random id that is unique to an event. Mixpanel uses $insert_id to deduplicate events. | $.messageId |
| time | datetime | The timestamp of the event. Mixpanel expects epoch timestamp in millisecond or second. Please note, Mixpanel only accepts this field as the timestamp. If the field is empty, it will be set to the time Mixpanel servers receive it. | $.timestamp |
| app_name | string | The name of your application. | $.context.app.name |
| app_namespace | string | The namespace of your application. | $.context.app.namespace |
| app_build | string | The current build of your application. | $.context.app.build |
| app_version | string | The current version of your application. | $.context.app.version |
| os_name | string | The name of the mobile operating system or browser that the user is using. | $.context.os.name |
| os_version | string | The version of the mobile operating system or browser the user is using. | $.context.os.version |
| device_id | string | A unique identifier for the device the user is using. | $.context.device.id |
| device_type | string | The type of the user's device. | $.context.device.type |
| device_name | string | The name of the user's device. | $.context.device.name |
| device_manufacturer | string | The device manufacturer that the user is using. | $.context.device.manufacturer |
| device_model | string | The device model that the user is using. | $.context.device.model |
| bluetooth | boolean | Whether bluetooth is enabled. | $.context.network.bluetooth |
| carrier | string | The carrier that the user is using. | $.context.network.carrier |
| cellular | boolean | Whether cellular is enabled. | $.context.network.cellular |
| wifi | boolean | Set to true if user’s device has an active, available Wifi connection, false if not. | $.context.network.wifi |
| country | string | The current country of the user. | $.context.location.country |
| region | string | The current region of the user. | $.context.location.region |
| language | string | The language set by the user. | $.context.locale |
| library_name | string | The name of the SDK used to send events. | $.context.library.name |
| library_version | string | The version of the SDK used to send events. | $.context.library.version |
| ip | string | The IP address of the user. This is only used for geolocation and won't be stored. | $.context.ip |
| idfa | string | Identifier for Advertiser. _(iOS)_ | $.context.device.advertisingId ?? $.context.device.idfa |
| url | string | The full URL of the webpage on which the event is triggered. | $.context.page.url |
| screen_width | number | Width, in pixels, of the device screen. | $.context.screen.density |
| screen_height | number | Height, in pixels, of the device screen. | $.context.screen.density |
| screen_density | number | Pixel density of the device screen. | $.context.screen.density |
| referrer | string | Referrer url | $.context.page.referrer |
| userAgent | string | User agent | $.context.userAgent |
| advertising_id | string | Advertising ID | $.context.device.advertisingId |
| ad_tracking_enabled | string | Ad Tracking Enabled (true or false) | $.context.device.adTrackingEnabled |
| timezone | string | The event timezone | $.context.timezone |
| app_platform | string | The App Platform, if applicable | $.context.app.platform |
| name | string | The Event Original Name, if applicable | $.event ?? $.name |
| event_properties | object | An object of key-value pairs that represent additional data to be sent along with the event. | $.properties |
| context | object | An object of key-value pairs that provides useful context about the event. | $.context |
| utm_properties | object | UTM Tracking Properties | <pre>{<br/>  "utm_source": {<br/>    "@path": "$.context.campaign.source"<br/>  },<br/>  "utm_medium": {<br/>    "@path": "$.context.campaign.medium"<br/>  },<br/>  "utm_campaign": {<br/>    "@path": "$.context.campaign.name"<br/>  },<br/>  "utm_term": {<br/>    "@path": "$.context.campaign.term"<br/>  },<br/>  "utm_content": {<br/>    "@path": "$.context.campaign.content"<br/>  }<br/>}</pre> |
| enable_batching | boolean | Set as true to ensure Syft sends data to Mixpanel in batches. | true |
</details>
,<details>
<summary>Screen Calls</summary>

#### Track Event
Send an event to Mixpanel. [Learn more about Events in Mixpanel](https://help.mixpanel.com/hc/en-us/articles/360041995352-Mixpanel-Concepts-Events?source=segment-actions)

#### Matched events
type = "screen"

#### Data Mapping
| Destination Field                 | Type          | Description     | Source Field   |
| -------------------- | -------------- | -------------- | --------- |
| event | string | The name of the action being performed. | "Viewed $.name" |
| distinct_id | string | A distinct ID specified by you. | $.userId ?? $.anonymousId |
| anonymous_id | string | A distinct ID randomly generated prior to calling identify. | $.anonymousId |
| user_id | string | The distinct ID after calling identify. | $.userId |
| group_id | string | The unique identifier of the group that performed this event. | $.context.groupId |
| insert_id | string | A random id that is unique to an event. Mixpanel uses $insert_id to deduplicate events. | $.messageId |
| time | datetime | The timestamp of the event. Mixpanel expects epoch timestamp in millisecond or second. Please note, Mixpanel only accepts this field as the timestamp. If the field is empty, it will be set to the time Mixpanel servers receive it. | $.timestamp |
| app_name | string | The name of your application. | $.context.app.name |
| app_namespace | string | The namespace of your application. | $.context.app.namespace |
| app_build | string | The current build of your application. | $.context.app.build |
| app_version | string | The current version of your application. | $.context.app.version |
| os_name | string | The name of the mobile operating system or browser that the user is using. | $.context.os.name |
| os_version | string | The version of the mobile operating system or browser the user is using. | $.context.os.version |
| device_id | string | A unique identifier for the device the user is using. | $.context.device.id |
| device_type | string | The type of the user's device. | $.context.device.type |
| device_name | string | The name of the user's device. | $.context.device.name |
| device_manufacturer | string | The device manufacturer that the user is using. | $.context.device.manufacturer |
| device_model | string | The device model that the user is using. | $.context.device.model |
| bluetooth | boolean | Whether bluetooth is enabled. | $.context.network.bluetooth |
| carrier | string | The carrier that the user is using. | $.context.network.carrier |
| cellular | boolean | Whether cellular is enabled. | $.context.network.cellular |
| wifi | boolean | Set to true if user’s device has an active, available Wifi connection, false if not. | $.context.network.wifi |
| country | string | The current country of the user. | $.context.location.country |
| region | string | The current region of the user. | $.context.location.region |
| language | string | The language set by the user. | $.context.locale |
| library_name | string | The name of the SDK used to send events. | $.context.library.name |
| library_version | string | The version of the SDK used to send events. | $.context.library.version |
| ip | string | The IP address of the user. This is only used for geolocation and won't be stored. | $.context.ip |
| idfa | string | Identifier for Advertiser. _(iOS)_ | $.context.device.advertisingId ?? $.context.device.idfa |
| url | string | The full URL of the webpage on which the event is triggered. | $.context.page.url |
| screen_width | number | Width, in pixels, of the device screen. | $.context.screen.density |
| screen_height | number | Height, in pixels, of the device screen. | $.context.screen.density |
| screen_density | number | Pixel density of the device screen. | $.context.screen.density |
| referrer | string | Referrer url | $.context.page.referrer |
| userAgent | string | User agent | $.context.userAgent |
| advertising_id | string | Advertising ID | $.context.device.advertisingId |
| ad_tracking_enabled | string | Ad Tracking Enabled (true or false) | $.context.device.adTrackingEnabled |
| timezone | string | The event timezone | $.context.timezone |
| app_platform | string | The App Platform, if applicable | $.context.app.platform |
| name | string | The Event Original Name, if applicable | $.event ?? $.name |
| event_properties | object | An object of key-value pairs that represent additional data to be sent along with the event. | $.properties |
| context | object | An object of key-value pairs that provides useful context about the event. | $.context |
| utm_properties | object | UTM Tracking Properties | <pre>{<br/>  "utm_source": {<br/>    "@path": "$.context.campaign.source"<br/>  },<br/>  "utm_medium": {<br/>    "@path": "$.context.campaign.medium"<br/>  },<br/>  "utm_campaign": {<br/>    "@path": "$.context.campaign.name"<br/>  },<br/>  "utm_term": {<br/>    "@path": "$.context.campaign.term"<br/>  },<br/>  "utm_content": {<br/>    "@path": "$.context.campaign.content"<br/>  }<br/>}</pre> |
| enable_batching | boolean | Set as true to ensure Syft sends data to Mixpanel in batches. | true |
</details>
,<details>
<summary>Identify Calls</summary>

#### Identify User
Set the user ID for a particular device ID or update user properties. Learn more about [User Profiles](https://help.mixpanel.com/hc/en-us/articles/115004501966?source=segment-actions) and [Identity Management](https://help.mixpanel.com/hc/en-us/articles/360041039771-Getting-Started-with-Identity-Management?source=segment-actions).

#### Matched events
type = "identify"

#### Data Mapping
| Destination Field                 | Type          | Description     | Source Field   |
| -------------------- | -------------- | -------------- | --------- |
| ip | string | The IP address of the user. This is only used for geolocation and won't be stored. | $.context.ip |
| user_id | string | The unique user identifier set by you | $.userId |
| anonymous_id | string | The generated anonymous ID for the user | $.anonymousId |
| traits | object | Properties to set on the user profile | $.traits |
</details>
,<details>
<summary>Group Calls</summary>

#### Group Identify User
Updates or adds properties to a group profile. The profile is created if it does not exist. [Learn more about Group Analytics.](https://help.mixpanel.com/hc/en-us/articles/360025333632-Group-Analytics?source=segment-actions)

#### Matched events
type = "group"

#### Data Mapping
| Destination Field                 | Type          | Description     | Source Field   |
| -------------------- | -------------- | -------------- | --------- |
| group_key | string | The group key you specified in Mixpanel under Project settings. If this is not specified, it will be defaulted to "$group_id". | $.group_key |
| group_id | string | The unique identifier of the group. If there is a trait that matches the group key, it will override this value. | $.groupId |
| traits | object | The properties to set on the group profile. | $.traits |
</details>


