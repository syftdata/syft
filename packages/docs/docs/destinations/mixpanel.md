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

#### Matched events
type = "track" and event != "Order Completed"

#### Data Mapping
| Name                 | Type          | Description     | Default   |
| -------------------- | -------------- | -------------- | --------- |
| event | string | test description | (<br/>  "@path": "$.event"<br/>) |
| distinct_id | string | test description | (<br/>  "@if": (<br/>    "exists": (<br/>      "@path": "$.userId"<br/>    ),<br/>    "then": (<br/>      "@path": "$.userId"<br/>    ),<br/>    "else": (<br/>      "@path": "$.anonymousId"<br/>    )<br/>  )<br/>) |
| anonymous_id | string | test description | (<br/>  "@path": "$.anonymousId"<br/>) |
| user_id | string | test description | (<br/>  "@path": "$.userId"<br/>) |
| group_id | string | test description | (<br/>  "@path": "$.context.groupId"<br/>) |
| insert_id | string | test description | (<br/>  "@path": "$.messageId"<br/>) |
| time | string | test description | (<br/>  "@path": "$.timestamp"<br/>) |
| app_name | string | test description | (<br/>  "@path": "$.context.app.name"<br/>) |
| app_namespace | string | test description | (<br/>  "@path": "$.context.app.namespace"<br/>) |
| app_build | string | test description | (<br/>  "@path": "$.context.app.build"<br/>) |
| app_version | string | test description | (<br/>  "@path": "$.context.app.version"<br/>) |
| os_name | string | test description | (<br/>  "@path": "$.context.os.name"<br/>) |
| os_version | string | test description | (<br/>  "@path": "$.context.os.version"<br/>) |
| device_id | string | test description | (<br/>  "@path": "$.context.device.id"<br/>) |
| device_type | string | test description | (<br/>  "@path": "$.context.device.type"<br/>) |
| device_name | string | test description | (<br/>  "@path": "$.context.device.name"<br/>) |
| device_manufacturer | string | test description | (<br/>  "@path": "$.context.device.manufacturer"<br/>) |
| device_model | string | test description | (<br/>  "@path": "$.context.device.model"<br/>) |
| bluetooth | string | test description | (<br/>  "@path": "$.context.network.bluetooth"<br/>) |
| carrier | string | test description | (<br/>  "@path": "$.context.network.carrier"<br/>) |
| cellular | string | test description | (<br/>  "@path": "$.context.network.cellular"<br/>) |
| wifi | string | test description | (<br/>  "@path": "$.context.network.wifi"<br/>) |
| country | string | test description | (<br/>  "@path": "$.context.location.country"<br/>) |
| region | string | test description | (<br/>  "@path": "$.context.location.region"<br/>) |
| language | string | test description | (<br/>  "@path": "$.context.locale"<br/>) |
| library_name | string | test description | (<br/>  "@path": "$.context.library.name"<br/>) |
| library_version | string | test description | (<br/>  "@path": "$.context.library.version"<br/>) |
| ip | string | test description | (<br/>  "@path": "$.context.ip"<br/>) |
| idfa | string | test description | (<br/>  "@if": (<br/>    "exists": (<br/>      "@path": "$.context.device.advertisingId"<br/>    ),<br/>    "then": (<br/>      "@path": "$.context.device.advertisingId"<br/>    ),<br/>    "else": (<br/>      "@path": "$.context.device.idfa"<br/>    )<br/>  )<br/>) |
| url | string | test description | (<br/>  "@path": "$.context.page.url"<br/>) |
| screen_width | string | test description | (<br/>  "@path": "$.context.screen.density"<br/>) |
| screen_height | string | test description | (<br/>  "@path": "$.context.screen.density"<br/>) |
| screen_density | string | test description | (<br/>  "@path": "$.context.screen.density"<br/>) |
| referrer | string | test description | (<br/>  "@path": "$.context.page.referrer"<br/>) |
| userAgent | string | test description | (<br/>  "@path": "$.context.userAgent"<br/>) |
| advertising_id | string | test description | (<br/>  "@path": "$.context.device.advertisingId"<br/>) |
| ad_tracking_enabled | string | test description | (<br/>  "@path": "$.context.device.adTrackingEnabled"<br/>) |
| timezone | string | test description | (<br/>  "@path": "$.context.timezone"<br/>) |
| app_platform | string | test description | (<br/>  "@path": "$.context.app.platform"<br/>) |
| name | string | test description | (<br/>  "@if": (<br/>    "exists": (<br/>      "@path": "$.event"<br/>    ),<br/>    "then": (<br/>      "@path": "$.event"<br/>    ),<br/>    "else": (<br/>      "@path": "$.name"<br/>    )<br/>  )<br/>) |
| event_properties | string | test description | (<br/>  "@path": "$.properties"<br/>) |
| context | string | test description | (<br/>  "@path": "$.context"<br/>) |
| utm_properties | string | test description | (<br/>  "utm_source": (<br/>    "@path": "$.context.campaign.source"<br/>  ),<br/>  "utm_medium": (<br/>    "@path": "$.context.campaign.medium"<br/>  ),<br/>  "utm_campaign": (<br/>    "@path": "$.context.campaign.name"<br/>  ),<br/>  "utm_term": (<br/>    "@path": "$.context.campaign.term"<br/>  ),<br/>  "utm_content": (<br/>    "@path": "$.context.campaign.content"<br/>  )<br/>) |
| enable_batching | string | test description | true |
</details>
,<details>
<summary>Order Completed Calls</summary>

#### Matched events
type = "track" and event = "Order Completed"

#### Data Mapping
| Name                 | Type          | Description     | Default   |
| -------------------- | -------------- | -------------- | --------- |
| generatePurchaseEventPerProduct | string | test description | true |
| distinct_id | string | test description | (<br/>  "@if": (<br/>    "exists": (<br/>      "@path": "$.userId"<br/>    ),<br/>    "then": (<br/>      "@path": "$.userId"<br/>    ),<br/>    "else": (<br/>      "@path": "$.anonymousId"<br/>    )<br/>  )<br/>) |
| anonymous_id | string | test description | (<br/>  "@path": "$.anonymousId"<br/>) |
| user_id | string | test description | (<br/>  "@path": "$.userId"<br/>) |
| group_id | string | test description | (<br/>  "@path": "$.context.groupId"<br/>) |
| insert_id | string | test description | (<br/>  "@path": "$.messageId"<br/>) |
| time | string | test description | (<br/>  "@path": "$.timestamp"<br/>) |
| app_name | string | test description | (<br/>  "@path": "$.context.app.name"<br/>) |
| app_namespace | string | test description | (<br/>  "@path": "$.context.app.namespace"<br/>) |
| app_build | string | test description | (<br/>  "@path": "$.context.app.build"<br/>) |
| app_version | string | test description | (<br/>  "@path": "$.context.app.version"<br/>) |
| os_name | string | test description | (<br/>  "@path": "$.context.os.name"<br/>) |
| os_version | string | test description | (<br/>  "@path": "$.context.os.version"<br/>) |
| device_id | string | test description | (<br/>  "@path": "$.context.device.id"<br/>) |
| device_type | string | test description | (<br/>  "@path": "$.context.device.type"<br/>) |
| device_name | string | test description | (<br/>  "@path": "$.context.device.name"<br/>) |
| device_manufacturer | string | test description | (<br/>  "@path": "$.context.device.manufacturer"<br/>) |
| device_model | string | test description | (<br/>  "@path": "$.context.device.model"<br/>) |
| bluetooth | string | test description | (<br/>  "@path": "$.context.network.bluetooth"<br/>) |
| carrier | string | test description | (<br/>  "@path": "$.context.network.carrier"<br/>) |
| cellular | string | test description | (<br/>  "@path": "$.context.network.cellular"<br/>) |
| wifi | string | test description | (<br/>  "@path": "$.context.network.wifi"<br/>) |
| country | string | test description | (<br/>  "@path": "$.context.location.country"<br/>) |
| region | string | test description | (<br/>  "@path": "$.context.location.region"<br/>) |
| language | string | test description | (<br/>  "@path": "$.context.locale"<br/>) |
| library_name | string | test description | (<br/>  "@path": "$.context.library.name"<br/>) |
| library_version | string | test description | (<br/>  "@path": "$.context.library.version"<br/>) |
| ip | string | test description | (<br/>  "@path": "$.context.ip"<br/>) |
| idfa | string | test description | (<br/>  "@if": (<br/>    "exists": (<br/>      "@path": "$.context.device.advertisingId"<br/>    ),<br/>    "then": (<br/>      "@path": "$.context.device.advertisingId"<br/>    ),<br/>    "else": (<br/>      "@path": "$.context.device.idfa"<br/>    )<br/>  )<br/>) |
| url | string | test description | (<br/>  "@path": "$.context.page.url"<br/>) |
| screen_width | string | test description | (<br/>  "@path": "$.context.screen.density"<br/>) |
| screen_height | string | test description | (<br/>  "@path": "$.context.screen.density"<br/>) |
| screen_density | string | test description | (<br/>  "@path": "$.context.screen.density"<br/>) |
| referrer | string | test description | (<br/>  "@path": "$.context.page.referrer"<br/>) |
| userAgent | string | test description | (<br/>  "@path": "$.context.userAgent"<br/>) |
| advertising_id | string | test description | (<br/>  "@path": "$.context.device.advertisingId"<br/>) |
| ad_tracking_enabled | string | test description | (<br/>  "@path": "$.context.device.adTrackingEnabled"<br/>) |
| timezone | string | test description | (<br/>  "@path": "$.context.timezone"<br/>) |
| app_platform | string | test description | (<br/>  "@path": "$.context.app.platform"<br/>) |
| name | string | test description | (<br/>  "@if": (<br/>    "exists": (<br/>      "@path": "$.event"<br/>    ),<br/>    "then": (<br/>      "@path": "$.event"<br/>    ),<br/>    "else": (<br/>      "@path": "$.name"<br/>    )<br/>  )<br/>) |
| event_properties | string | test description | (<br/>  "@path": "$.properties"<br/>) |
| context | string | test description | (<br/>  "@path": "$.context"<br/>) |
| utm_properties | string | test description | (<br/>  "utm_source": (<br/>    "@path": "$.context.campaign.source"<br/>  ),<br/>  "utm_medium": (<br/>    "@path": "$.context.campaign.medium"<br/>  ),<br/>  "utm_campaign": (<br/>    "@path": "$.context.campaign.name"<br/>  ),<br/>  "utm_term": (<br/>    "@path": "$.context.campaign.term"<br/>  ),<br/>  "utm_content": (<br/>    "@path": "$.context.campaign.content"<br/>  )<br/>) |
| enable_batching | string | test description | true |
| products | string | test description | (<br/>  "@arrayPath": [<br/>    "$.properties.products",<br/>    (<br/>      "product_id": (<br/>        "@path": "product_id"<br/>      ),<br/>      "sku": (<br/>        "@path": "sku"<br/>      ),<br/>      "category": (<br/>        "@path": "category"<br/>      ),<br/>      "name": (<br/>        "@path": "name"<br/>      ),<br/>      "brand": (<br/>        "@path": "brand"<br/>      ),<br/>      "variant": (<br/>        "@path": "variant"<br/>      ),<br/>      "price": (<br/>        "@path": "price"<br/>      ),<br/>      "quantity": (<br/>        "@path": "quantity"<br/>      ),<br/>      "coupon": (<br/>        "@path": "coupon"<br/>      ),<br/>      "position": (<br/>        "@path": "position"<br/>      ),<br/>      "url": (<br/>        "@path": "url"<br/>      ),<br/>      "image_url": (<br/>        "@path": "image_url"<br/>      )<br/>    )<br/>  ]<br/>) |
| event | string | test description | (<br/>  "@path": "$.event"<br/>) |
</details>
,<details>
<summary>Page Calls</summary>

#### Matched events
type = "page"

#### Data Mapping
| Name                 | Type          | Description     | Default   |
| -------------------- | -------------- | -------------- | --------- |
| event | string | test description | (<br/>  "@template": "Viewed ((name))"<br/>) |
| distinct_id | string | test description | (<br/>  "@if": (<br/>    "exists": (<br/>      "@path": "$.userId"<br/>    ),<br/>    "then": (<br/>      "@path": "$.userId"<br/>    ),<br/>    "else": (<br/>      "@path": "$.anonymousId"<br/>    )<br/>  )<br/>) |
| anonymous_id | string | test description | (<br/>  "@path": "$.anonymousId"<br/>) |
| user_id | string | test description | (<br/>  "@path": "$.userId"<br/>) |
| group_id | string | test description | (<br/>  "@path": "$.context.groupId"<br/>) |
| insert_id | string | test description | (<br/>  "@path": "$.messageId"<br/>) |
| time | string | test description | (<br/>  "@path": "$.timestamp"<br/>) |
| app_name | string | test description | (<br/>  "@path": "$.context.app.name"<br/>) |
| app_namespace | string | test description | (<br/>  "@path": "$.context.app.namespace"<br/>) |
| app_build | string | test description | (<br/>  "@path": "$.context.app.build"<br/>) |
| app_version | string | test description | (<br/>  "@path": "$.context.app.version"<br/>) |
| os_name | string | test description | (<br/>  "@path": "$.context.os.name"<br/>) |
| os_version | string | test description | (<br/>  "@path": "$.context.os.version"<br/>) |
| device_id | string | test description | (<br/>  "@path": "$.context.device.id"<br/>) |
| device_type | string | test description | (<br/>  "@path": "$.context.device.type"<br/>) |
| device_name | string | test description | (<br/>  "@path": "$.context.device.name"<br/>) |
| device_manufacturer | string | test description | (<br/>  "@path": "$.context.device.manufacturer"<br/>) |
| device_model | string | test description | (<br/>  "@path": "$.context.device.model"<br/>) |
| bluetooth | string | test description | (<br/>  "@path": "$.context.network.bluetooth"<br/>) |
| carrier | string | test description | (<br/>  "@path": "$.context.network.carrier"<br/>) |
| cellular | string | test description | (<br/>  "@path": "$.context.network.cellular"<br/>) |
| wifi | string | test description | (<br/>  "@path": "$.context.network.wifi"<br/>) |
| country | string | test description | (<br/>  "@path": "$.context.location.country"<br/>) |
| region | string | test description | (<br/>  "@path": "$.context.location.region"<br/>) |
| language | string | test description | (<br/>  "@path": "$.context.locale"<br/>) |
| library_name | string | test description | (<br/>  "@path": "$.context.library.name"<br/>) |
| library_version | string | test description | (<br/>  "@path": "$.context.library.version"<br/>) |
| ip | string | test description | (<br/>  "@path": "$.context.ip"<br/>) |
| idfa | string | test description | (<br/>  "@if": (<br/>    "exists": (<br/>      "@path": "$.context.device.advertisingId"<br/>    ),<br/>    "then": (<br/>      "@path": "$.context.device.advertisingId"<br/>    ),<br/>    "else": (<br/>      "@path": "$.context.device.idfa"<br/>    )<br/>  )<br/>) |
| url | string | test description | (<br/>  "@path": "$.context.page.url"<br/>) |
| screen_width | string | test description | (<br/>  "@path": "$.context.screen.density"<br/>) |
| screen_height | string | test description | (<br/>  "@path": "$.context.screen.density"<br/>) |
| screen_density | string | test description | (<br/>  "@path": "$.context.screen.density"<br/>) |
| referrer | string | test description | (<br/>  "@path": "$.context.page.referrer"<br/>) |
| userAgent | string | test description | (<br/>  "@path": "$.context.userAgent"<br/>) |
| advertising_id | string | test description | (<br/>  "@path": "$.context.device.advertisingId"<br/>) |
| ad_tracking_enabled | string | test description | (<br/>  "@path": "$.context.device.adTrackingEnabled"<br/>) |
| timezone | string | test description | (<br/>  "@path": "$.context.timezone"<br/>) |
| app_platform | string | test description | (<br/>  "@path": "$.context.app.platform"<br/>) |
| name | string | test description | (<br/>  "@if": (<br/>    "exists": (<br/>      "@path": "$.event"<br/>    ),<br/>    "then": (<br/>      "@path": "$.event"<br/>    ),<br/>    "else": (<br/>      "@path": "$.name"<br/>    )<br/>  )<br/>) |
| event_properties | string | test description | (<br/>  "@path": "$.properties"<br/>) |
| context | string | test description | (<br/>  "@path": "$.context"<br/>) |
| utm_properties | string | test description | (<br/>  "utm_source": (<br/>    "@path": "$.context.campaign.source"<br/>  ),<br/>  "utm_medium": (<br/>    "@path": "$.context.campaign.medium"<br/>  ),<br/>  "utm_campaign": (<br/>    "@path": "$.context.campaign.name"<br/>  ),<br/>  "utm_term": (<br/>    "@path": "$.context.campaign.term"<br/>  ),<br/>  "utm_content": (<br/>    "@path": "$.context.campaign.content"<br/>  )<br/>) |
| enable_batching | string | test description | true |
</details>
,<details>
<summary>Screen Calls</summary>

#### Matched events
type = "screen"

#### Data Mapping
| Name                 | Type          | Description     | Default   |
| -------------------- | -------------- | -------------- | --------- |
| event | string | test description | (<br/>  "@template": "Viewed ((name))"<br/>) |
| distinct_id | string | test description | (<br/>  "@if": (<br/>    "exists": (<br/>      "@path": "$.userId"<br/>    ),<br/>    "then": (<br/>      "@path": "$.userId"<br/>    ),<br/>    "else": (<br/>      "@path": "$.anonymousId"<br/>    )<br/>  )<br/>) |
| anonymous_id | string | test description | (<br/>  "@path": "$.anonymousId"<br/>) |
| user_id | string | test description | (<br/>  "@path": "$.userId"<br/>) |
| group_id | string | test description | (<br/>  "@path": "$.context.groupId"<br/>) |
| insert_id | string | test description | (<br/>  "@path": "$.messageId"<br/>) |
| time | string | test description | (<br/>  "@path": "$.timestamp"<br/>) |
| app_name | string | test description | (<br/>  "@path": "$.context.app.name"<br/>) |
| app_namespace | string | test description | (<br/>  "@path": "$.context.app.namespace"<br/>) |
| app_build | string | test description | (<br/>  "@path": "$.context.app.build"<br/>) |
| app_version | string | test description | (<br/>  "@path": "$.context.app.version"<br/>) |
| os_name | string | test description | (<br/>  "@path": "$.context.os.name"<br/>) |
| os_version | string | test description | (<br/>  "@path": "$.context.os.version"<br/>) |
| device_id | string | test description | (<br/>  "@path": "$.context.device.id"<br/>) |
| device_type | string | test description | (<br/>  "@path": "$.context.device.type"<br/>) |
| device_name | string | test description | (<br/>  "@path": "$.context.device.name"<br/>) |
| device_manufacturer | string | test description | (<br/>  "@path": "$.context.device.manufacturer"<br/>) |
| device_model | string | test description | (<br/>  "@path": "$.context.device.model"<br/>) |
| bluetooth | string | test description | (<br/>  "@path": "$.context.network.bluetooth"<br/>) |
| carrier | string | test description | (<br/>  "@path": "$.context.network.carrier"<br/>) |
| cellular | string | test description | (<br/>  "@path": "$.context.network.cellular"<br/>) |
| wifi | string | test description | (<br/>  "@path": "$.context.network.wifi"<br/>) |
| country | string | test description | (<br/>  "@path": "$.context.location.country"<br/>) |
| region | string | test description | (<br/>  "@path": "$.context.location.region"<br/>) |
| language | string | test description | (<br/>  "@path": "$.context.locale"<br/>) |
| library_name | string | test description | (<br/>  "@path": "$.context.library.name"<br/>) |
| library_version | string | test description | (<br/>  "@path": "$.context.library.version"<br/>) |
| ip | string | test description | (<br/>  "@path": "$.context.ip"<br/>) |
| idfa | string | test description | (<br/>  "@if": (<br/>    "exists": (<br/>      "@path": "$.context.device.advertisingId"<br/>    ),<br/>    "then": (<br/>      "@path": "$.context.device.advertisingId"<br/>    ),<br/>    "else": (<br/>      "@path": "$.context.device.idfa"<br/>    )<br/>  )<br/>) |
| url | string | test description | (<br/>  "@path": "$.context.page.url"<br/>) |
| screen_width | string | test description | (<br/>  "@path": "$.context.screen.density"<br/>) |
| screen_height | string | test description | (<br/>  "@path": "$.context.screen.density"<br/>) |
| screen_density | string | test description | (<br/>  "@path": "$.context.screen.density"<br/>) |
| referrer | string | test description | (<br/>  "@path": "$.context.page.referrer"<br/>) |
| userAgent | string | test description | (<br/>  "@path": "$.context.userAgent"<br/>) |
| advertising_id | string | test description | (<br/>  "@path": "$.context.device.advertisingId"<br/>) |
| ad_tracking_enabled | string | test description | (<br/>  "@path": "$.context.device.adTrackingEnabled"<br/>) |
| timezone | string | test description | (<br/>  "@path": "$.context.timezone"<br/>) |
| app_platform | string | test description | (<br/>  "@path": "$.context.app.platform"<br/>) |
| name | string | test description | (<br/>  "@if": (<br/>    "exists": (<br/>      "@path": "$.event"<br/>    ),<br/>    "then": (<br/>      "@path": "$.event"<br/>    ),<br/>    "else": (<br/>      "@path": "$.name"<br/>    )<br/>  )<br/>) |
| event_properties | string | test description | (<br/>  "@path": "$.properties"<br/>) |
| context | string | test description | (<br/>  "@path": "$.context"<br/>) |
| utm_properties | string | test description | (<br/>  "utm_source": (<br/>    "@path": "$.context.campaign.source"<br/>  ),<br/>  "utm_medium": (<br/>    "@path": "$.context.campaign.medium"<br/>  ),<br/>  "utm_campaign": (<br/>    "@path": "$.context.campaign.name"<br/>  ),<br/>  "utm_term": (<br/>    "@path": "$.context.campaign.term"<br/>  ),<br/>  "utm_content": (<br/>    "@path": "$.context.campaign.content"<br/>  )<br/>) |
| enable_batching | string | test description | true |
</details>
,<details>
<summary>Identify Calls</summary>

#### Matched events
type = "identify"

#### Data Mapping
| Name                 | Type          | Description     | Default   |
| -------------------- | -------------- | -------------- | --------- |
| ip | string | test description | (<br/>  "@path": "$.context.ip"<br/>) |
| user_id | string | test description | (<br/>  "@path": "$.userId"<br/>) |
| anonymous_id | string | test description | (<br/>  "@path": "$.anonymousId"<br/>) |
| traits | string | test description | (<br/>  "@path": "$.traits"<br/>) |
</details>
,<details>
<summary>Group Calls</summary>

#### Matched events
type = "group"

#### Data Mapping
| Name                 | Type          | Description     | Default   |
| -------------------- | -------------- | -------------- | --------- |
| group_id | string | test description | (<br/>  "@path": "$.groupId"<br/>) |
| traits | string | test description | (<br/>  "@path": "$.traits"<br/>) |
</details>


