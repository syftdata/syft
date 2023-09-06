---
sidebar_position: 11
---
# Amplitude

This page describes how to set up the Amplitude as a destination.

## Set up
An example setup for the Amplitude is shown below.

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

#### Matched events
type = "track" and event != "Order Completed"

#### Data Mapping
| Name                 | Type          | Description     | Default   |
| -------------------- | -------------- | -------------- | --------- |
| user_id | string | test description | (<br/>  "@path": "$.userId"<br/>) |
| device_id | string | test description | (<br/>  "@if": (<br/>    "exists": (<br/>      "@path": "$.context.device.id"<br/>    ),<br/>    "then": (<br/>      "@path": "$.context.device.id"<br/>    ),<br/>    "else": (<br/>      "@path": "$.anonymousId"<br/>    )<br/>  )<br/>) |
| event_type | string | test description | (<br/>  "@path": "$.event"<br/>) |
| session_id | string | test description | (<br/>  "@path": "$.integrations.Actions Amplitude.session_id"<br/>) |
| time | string | test description | (<br/>  "@path": "$.timestamp"<br/>) |
| event_properties | string | test description | (<br/>  "@path": "$.properties"<br/>) |
| user_properties | string | test description | (<br/>  "@path": "$.traits"<br/>) |
| app_version | string | test description | (<br/>  "@path": "$.context.app.version"<br/>) |
| platform | string | test description | (<br/>  "@path": "$.context.device.type"<br/>) |
| os_name | string | test description | (<br/>  "@path": "$.context.os.name"<br/>) |
| os_version | string | test description | (<br/>  "@path": "$.context.os.version"<br/>) |
| device_brand | string | test description | (<br/>  "@path": "$.context.device.brand"<br/>) |
| device_manufacturer | string | test description | (<br/>  "@path": "$.context.device.manufacturer"<br/>) |
| device_model | string | test description | (<br/>  "@path": "$.context.device.model"<br/>) |
| carrier | string | test description | (<br/>  "@path": "$.context.network.carrier"<br/>) |
| country | string | test description | (<br/>  "@path": "$.context.location.country"<br/>) |
| region | string | test description | (<br/>  "@path": "$.context.location.region"<br/>) |
| city | string | test description | (<br/>  "@path": "$.context.location.city"<br/>) |
| language | string | test description | (<br/>  "@path": "$.context.locale"<br/>) |
| price | string | test description | (<br/>  "@path": "$.properties.price"<br/>) |
| quantity | string | test description | (<br/>  "@path": "$.properties.quantity"<br/>) |
| revenue | string | test description | (<br/>  "@path": "$.properties.revenue"<br/>) |
| productId | string | test description | (<br/>  "@path": "$.properties.productId"<br/>) |
| revenueType | string | test description | (<br/>  "@path": "$.properties.revenueType"<br/>) |
| location_lat | string | test description | (<br/>  "@path": "$.context.location.latitude"<br/>) |
| location_lng | string | test description | (<br/>  "@path": "$.context.location.longitude"<br/>) |
| ip | string | test description | (<br/>  "@path": "$.context.ip"<br/>) |
| idfa | string | test description | (<br/>  "@if": (<br/>    "exists": (<br/>      "@path": "$.context.device.advertisingId"<br/>    ),<br/>    "then": (<br/>      "@path": "$.context.device.advertisingId"<br/>    ),<br/>    "else": (<br/>      "@path": "$.context.device.idfa"<br/>    )<br/>  )<br/>) |
| idfv | string | test description | (<br/>  "@path": "$.context.device.id"<br/>) |
| adid | string | test description | (<br/>  "@if": (<br/>    "exists": (<br/>      "@path": "$.context.device.advertisingId"<br/>    ),<br/>    "then": (<br/>      "@path": "$.context.device.advertisingId"<br/>    ),<br/>    "else": (<br/>      "@path": "$.context.device.idfa"<br/>    )<br/>  )<br/>) |
| library | string | test description | (<br/>  "@path": "$.context.library.name"<br/>) |
| products | string | test description | (<br/>  "@arrayPath": [<br/>    "$.properties.products",<br/>    (<br/>      "price": (<br/>        "@path": "price"<br/>      ),<br/>      "revenue": (<br/>        "@path": "revenue"<br/>      ),<br/>      "quantity": (<br/>        "@path": "quantity"<br/>      ),<br/>      "productId": (<br/>        "@path": "productId"<br/>      ),<br/>      "revenueType": (<br/>        "@path": "revenueType"<br/>      )<br/>    )<br/>  ]<br/>) |
| setOnce | string | test description | (<br/>  "initial_referrer": (<br/>    "@path": "$.context.page.referrer"<br/>  ),<br/>  "initial_utm_source": (<br/>    "@path": "$.context.campaign.source"<br/>  ),<br/>  "initial_utm_medium": (<br/>    "@path": "$.context.campaign.medium"<br/>  ),<br/>  "initial_utm_campaign": (<br/>    "@path": "$.context.campaign.name"<br/>  ),<br/>  "initial_utm_term": (<br/>    "@path": "$.context.campaign.term"<br/>  ),<br/>  "initial_utm_content": (<br/>    "@path": "$.context.campaign.content"<br/>  )<br/>) |
| setAlways | string | test description | (<br/>  "referrer": (<br/>    "@path": "$.context.page.referrer"<br/>  ),<br/>  "utm_source": (<br/>    "@path": "$.context.campaign.source"<br/>  ),<br/>  "utm_medium": (<br/>    "@path": "$.context.campaign.medium"<br/>  ),<br/>  "utm_campaign": (<br/>    "@path": "$.context.campaign.name"<br/>  ),<br/>  "utm_term": (<br/>    "@path": "$.context.campaign.term"<br/>  ),<br/>  "utm_content": (<br/>    "@path": "$.context.campaign.content"<br/>  )<br/>) |
| use_batch_endpoint | string | test description | false |
| userAgent | string | test description | (<br/>  "@path": "$.context.userAgent"<br/>) |
| userAgentParsing | string | test description | true |
</details>
,<details>
<summary>Order Completed Calls</summary>

#### Matched events
type = "track" and event = "Order Completed"

#### Data Mapping
| Name                 | Type          | Description     | Default   |
| -------------------- | -------------- | -------------- | --------- |
| trackRevenuePerProduct | string | test description | false |
| user_id | string | test description | (<br/>  "@path": "$.userId"<br/>) |
| device_id | string | test description | (<br/>  "@if": (<br/>    "exists": (<br/>      "@path": "$.context.device.id"<br/>    ),<br/>    "then": (<br/>      "@path": "$.context.device.id"<br/>    ),<br/>    "else": (<br/>      "@path": "$.anonymousId"<br/>    )<br/>  )<br/>) |
| event_type | string | test description | (<br/>  "@path": "$.event"<br/>) |
| session_id | string | test description | (<br/>  "@path": "$.integrations.Actions Amplitude.session_id"<br/>) |
| time | string | test description | (<br/>  "@path": "$.timestamp"<br/>) |
| event_properties | string | test description | (<br/>  "@path": "$.properties"<br/>) |
| user_properties | string | test description | (<br/>  "@path": "$.traits"<br/>) |
| app_version | string | test description | (<br/>  "@path": "$.context.app.version"<br/>) |
| platform | string | test description | (<br/>  "@path": "$.context.device.type"<br/>) |
| os_name | string | test description | (<br/>  "@path": "$.context.os.name"<br/>) |
| os_version | string | test description | (<br/>  "@path": "$.context.os.version"<br/>) |
| device_brand | string | test description | (<br/>  "@path": "$.context.device.brand"<br/>) |
| device_manufacturer | string | test description | (<br/>  "@path": "$.context.device.manufacturer"<br/>) |
| device_model | string | test description | (<br/>  "@path": "$.context.device.model"<br/>) |
| carrier | string | test description | (<br/>  "@path": "$.context.network.carrier"<br/>) |
| country | string | test description | (<br/>  "@path": "$.context.location.country"<br/>) |
| region | string | test description | (<br/>  "@path": "$.context.location.region"<br/>) |
| city | string | test description | (<br/>  "@path": "$.context.location.city"<br/>) |
| language | string | test description | (<br/>  "@path": "$.context.locale"<br/>) |
| price | string | test description | (<br/>  "@path": "$.properties.price"<br/>) |
| quantity | string | test description | (<br/>  "@path": "$.properties.quantity"<br/>) |
| revenue | string | test description | (<br/>  "@path": "$.properties.revenue"<br/>) |
| productId | string | test description | (<br/>  "@path": "$.properties.productId"<br/>) |
| revenueType | string | test description | (<br/>  "@path": "$.properties.revenueType"<br/>) |
| location_lat | string | test description | (<br/>  "@path": "$.context.location.latitude"<br/>) |
| location_lng | string | test description | (<br/>  "@path": "$.context.location.longitude"<br/>) |
| ip | string | test description | (<br/>  "@path": "$.context.ip"<br/>) |
| idfa | string | test description | (<br/>  "@if": (<br/>    "exists": (<br/>      "@path": "$.context.device.advertisingId"<br/>    ),<br/>    "then": (<br/>      "@path": "$.context.device.advertisingId"<br/>    ),<br/>    "else": (<br/>      "@path": "$.context.device.idfa"<br/>    )<br/>  )<br/>) |
| idfv | string | test description | (<br/>  "@path": "$.context.device.id"<br/>) |
| adid | string | test description | (<br/>  "@if": (<br/>    "exists": (<br/>      "@path": "$.context.device.advertisingId"<br/>    ),<br/>    "then": (<br/>      "@path": "$.context.device.advertisingId"<br/>    ),<br/>    "else": (<br/>      "@path": "$.context.device.idfa"<br/>    )<br/>  )<br/>) |
| library | string | test description | (<br/>  "@path": "$.context.library.name"<br/>) |
| products | string | test description | (<br/>  "@arrayPath": [<br/>    "$.properties.products",<br/>    (<br/>      "price": (<br/>        "@path": "price"<br/>      ),<br/>      "revenue": (<br/>        "@path": "revenue"<br/>      ),<br/>      "quantity": (<br/>        "@path": "quantity"<br/>      ),<br/>      "productId": (<br/>        "@path": "productId"<br/>      ),<br/>      "revenueType": (<br/>        "@path": "revenueType"<br/>      )<br/>    )<br/>  ]<br/>) |
| use_batch_endpoint | string | test description | false |
| userAgent | string | test description | (<br/>  "@path": "$.context.userAgent"<br/>) |
| userAgentParsing | string | test description | true |
| utm_properties | string | test description | (<br/>  "utm_source": (<br/>    "@path": "$.context.campaign.source"<br/>  ),<br/>  "utm_medium": (<br/>    "@path": "$.context.campaign.medium"<br/>  ),<br/>  "utm_campaign": (<br/>    "@path": "$.context.campaign.name"<br/>  ),<br/>  "utm_term": (<br/>    "@path": "$.context.campaign.term"<br/>  ),<br/>  "utm_content": (<br/>    "@path": "$.context.campaign.content"<br/>  )<br/>) |
| referrer | string | test description | (<br/>  "@path": "$.context.page.referrer"<br/>) |
</details>
,<details>
<summary>Page Calls</summary>

#### Matched events
type = "page"

#### Data Mapping
| Name                 | Type          | Description     | Default   |
| -------------------- | -------------- | -------------- | --------- |
| user_id | string | test description | (<br/>  "@path": "$.userId"<br/>) |
| device_id | string | test description | (<br/>  "@if": (<br/>    "exists": (<br/>      "@path": "$.context.device.id"<br/>    ),<br/>    "then": (<br/>      "@path": "$.context.device.id"<br/>    ),<br/>    "else": (<br/>      "@path": "$.anonymousId"<br/>    )<br/>  )<br/>) |
| event_type | string | test description | (<br/>  "@template": "Viewed ((name))"<br/>) |
| session_id | string | test description | (<br/>  "@path": "$.integrations.Actions Amplitude.session_id"<br/>) |
| time | string | test description | (<br/>  "@path": "$.timestamp"<br/>) |
| event_properties | string | test description | (<br/>  "@path": "$.properties"<br/>) |
| user_properties | string | test description | (<br/>  "@path": "$.traits"<br/>) |
| app_version | string | test description | (<br/>  "@path": "$.context.app.version"<br/>) |
| platform | string | test description | (<br/>  "@path": "$.context.device.type"<br/>) |
| os_name | string | test description | (<br/>  "@path": "$.context.os.name"<br/>) |
| os_version | string | test description | (<br/>  "@path": "$.context.os.version"<br/>) |
| device_brand | string | test description | (<br/>  "@path": "$.context.device.brand"<br/>) |
| device_manufacturer | string | test description | (<br/>  "@path": "$.context.device.manufacturer"<br/>) |
| device_model | string | test description | (<br/>  "@path": "$.context.device.model"<br/>) |
| carrier | string | test description | (<br/>  "@path": "$.context.network.carrier"<br/>) |
| country | string | test description | (<br/>  "@path": "$.context.location.country"<br/>) |
| region | string | test description | (<br/>  "@path": "$.context.location.region"<br/>) |
| city | string | test description | (<br/>  "@path": "$.context.location.city"<br/>) |
| language | string | test description | (<br/>  "@path": "$.context.locale"<br/>) |
| price | string | test description | (<br/>  "@path": "$.properties.price"<br/>) |
| quantity | string | test description | (<br/>  "@path": "$.properties.quantity"<br/>) |
| revenue | string | test description | (<br/>  "@path": "$.properties.revenue"<br/>) |
| productId | string | test description | (<br/>  "@path": "$.properties.productId"<br/>) |
| revenueType | string | test description | (<br/>  "@path": "$.properties.revenueType"<br/>) |
| location_lat | string | test description | (<br/>  "@path": "$.context.location.latitude"<br/>) |
| location_lng | string | test description | (<br/>  "@path": "$.context.location.longitude"<br/>) |
| ip | string | test description | (<br/>  "@path": "$.context.ip"<br/>) |
| idfa | string | test description | (<br/>  "@if": (<br/>    "exists": (<br/>      "@path": "$.context.device.advertisingId"<br/>    ),<br/>    "then": (<br/>      "@path": "$.context.device.advertisingId"<br/>    ),<br/>    "else": (<br/>      "@path": "$.context.device.idfa"<br/>    )<br/>  )<br/>) |
| idfv | string | test description | (<br/>  "@path": "$.context.device.id"<br/>) |
| adid | string | test description | (<br/>  "@if": (<br/>    "exists": (<br/>      "@path": "$.context.device.advertisingId"<br/>    ),<br/>    "then": (<br/>      "@path": "$.context.device.advertisingId"<br/>    ),<br/>    "else": (<br/>      "@path": "$.context.device.idfa"<br/>    )<br/>  )<br/>) |
| library | string | test description | (<br/>  "@path": "$.context.library.name"<br/>) |
| products | string | test description | (<br/>  "@arrayPath": [<br/>    "$.properties.products",<br/>    (<br/>      "price": (<br/>        "@path": "price"<br/>      ),<br/>      "revenue": (<br/>        "@path": "revenue"<br/>      ),<br/>      "quantity": (<br/>        "@path": "quantity"<br/>      ),<br/>      "productId": (<br/>        "@path": "productId"<br/>      ),<br/>      "revenueType": (<br/>        "@path": "revenueType"<br/>      )<br/>    )<br/>  ]<br/>) |
| setOnce | string | test description | (<br/>  "initial_referrer": (<br/>    "@path": "$.context.page.referrer"<br/>  ),<br/>  "initial_utm_source": (<br/>    "@path": "$.context.campaign.source"<br/>  ),<br/>  "initial_utm_medium": (<br/>    "@path": "$.context.campaign.medium"<br/>  ),<br/>  "initial_utm_campaign": (<br/>    "@path": "$.context.campaign.name"<br/>  ),<br/>  "initial_utm_term": (<br/>    "@path": "$.context.campaign.term"<br/>  ),<br/>  "initial_utm_content": (<br/>    "@path": "$.context.campaign.content"<br/>  )<br/>) |
| setAlways | string | test description | (<br/>  "referrer": (<br/>    "@path": "$.context.page.referrer"<br/>  ),<br/>  "utm_source": (<br/>    "@path": "$.context.campaign.source"<br/>  ),<br/>  "utm_medium": (<br/>    "@path": "$.context.campaign.medium"<br/>  ),<br/>  "utm_campaign": (<br/>    "@path": "$.context.campaign.name"<br/>  ),<br/>  "utm_term": (<br/>    "@path": "$.context.campaign.term"<br/>  ),<br/>  "utm_content": (<br/>    "@path": "$.context.campaign.content"<br/>  )<br/>) |
| use_batch_endpoint | string | test description | false |
| userAgent | string | test description | (<br/>  "@path": "$.context.userAgent"<br/>) |
| userAgentParsing | string | test description | true |
</details>
,<details>
<summary>Screen Calls</summary>

#### Matched events
type = "screen"

#### Data Mapping
| Name                 | Type          | Description     | Default   |
| -------------------- | -------------- | -------------- | --------- |
| user_id | string | test description | (<br/>  "@path": "$.userId"<br/>) |
| device_id | string | test description | (<br/>  "@if": (<br/>    "exists": (<br/>      "@path": "$.context.device.id"<br/>    ),<br/>    "then": (<br/>      "@path": "$.context.device.id"<br/>    ),<br/>    "else": (<br/>      "@path": "$.anonymousId"<br/>    )<br/>  )<br/>) |
| event_type | string | test description | (<br/>  "@template": "Viewed ((name))"<br/>) |
| session_id | string | test description | (<br/>  "@path": "$.integrations.Actions Amplitude.session_id"<br/>) |
| time | string | test description | (<br/>  "@path": "$.timestamp"<br/>) |
| event_properties | string | test description | (<br/>  "@path": "$.properties"<br/>) |
| user_properties | string | test description | (<br/>  "@path": "$.traits"<br/>) |
| app_version | string | test description | (<br/>  "@path": "$.context.app.version"<br/>) |
| platform | string | test description | (<br/>  "@path": "$.context.device.type"<br/>) |
| os_name | string | test description | (<br/>  "@path": "$.context.os.name"<br/>) |
| os_version | string | test description | (<br/>  "@path": "$.context.os.version"<br/>) |
| device_brand | string | test description | (<br/>  "@path": "$.context.device.brand"<br/>) |
| device_manufacturer | string | test description | (<br/>  "@path": "$.context.device.manufacturer"<br/>) |
| device_model | string | test description | (<br/>  "@path": "$.context.device.model"<br/>) |
| carrier | string | test description | (<br/>  "@path": "$.context.network.carrier"<br/>) |
| country | string | test description | (<br/>  "@path": "$.context.location.country"<br/>) |
| region | string | test description | (<br/>  "@path": "$.context.location.region"<br/>) |
| city | string | test description | (<br/>  "@path": "$.context.location.city"<br/>) |
| language | string | test description | (<br/>  "@path": "$.context.locale"<br/>) |
| price | string | test description | (<br/>  "@path": "$.properties.price"<br/>) |
| quantity | string | test description | (<br/>  "@path": "$.properties.quantity"<br/>) |
| revenue | string | test description | (<br/>  "@path": "$.properties.revenue"<br/>) |
| productId | string | test description | (<br/>  "@path": "$.properties.productId"<br/>) |
| revenueType | string | test description | (<br/>  "@path": "$.properties.revenueType"<br/>) |
| location_lat | string | test description | (<br/>  "@path": "$.context.location.latitude"<br/>) |
| location_lng | string | test description | (<br/>  "@path": "$.context.location.longitude"<br/>) |
| ip | string | test description | (<br/>  "@path": "$.context.ip"<br/>) |
| idfa | string | test description | (<br/>  "@if": (<br/>    "exists": (<br/>      "@path": "$.context.device.advertisingId"<br/>    ),<br/>    "then": (<br/>      "@path": "$.context.device.advertisingId"<br/>    ),<br/>    "else": (<br/>      "@path": "$.context.device.idfa"<br/>    )<br/>  )<br/>) |
| idfv | string | test description | (<br/>  "@path": "$.context.device.id"<br/>) |
| adid | string | test description | (<br/>  "@if": (<br/>    "exists": (<br/>      "@path": "$.context.device.advertisingId"<br/>    ),<br/>    "then": (<br/>      "@path": "$.context.device.advertisingId"<br/>    ),<br/>    "else": (<br/>      "@path": "$.context.device.idfa"<br/>    )<br/>  )<br/>) |
| library | string | test description | (<br/>  "@path": "$.context.library.name"<br/>) |
| products | string | test description | (<br/>  "@arrayPath": [<br/>    "$.properties.products",<br/>    (<br/>      "price": (<br/>        "@path": "price"<br/>      ),<br/>      "revenue": (<br/>        "@path": "revenue"<br/>      ),<br/>      "quantity": (<br/>        "@path": "quantity"<br/>      ),<br/>      "productId": (<br/>        "@path": "productId"<br/>      ),<br/>      "revenueType": (<br/>        "@path": "revenueType"<br/>      )<br/>    )<br/>  ]<br/>) |
| setOnce | string | test description | (<br/>  "initial_referrer": (<br/>    "@path": "$.context.page.referrer"<br/>  ),<br/>  "initial_utm_source": (<br/>    "@path": "$.context.campaign.source"<br/>  ),<br/>  "initial_utm_medium": (<br/>    "@path": "$.context.campaign.medium"<br/>  ),<br/>  "initial_utm_campaign": (<br/>    "@path": "$.context.campaign.name"<br/>  ),<br/>  "initial_utm_term": (<br/>    "@path": "$.context.campaign.term"<br/>  ),<br/>  "initial_utm_content": (<br/>    "@path": "$.context.campaign.content"<br/>  )<br/>) |
| setAlways | string | test description | (<br/>  "referrer": (<br/>    "@path": "$.context.page.referrer"<br/>  ),<br/>  "utm_source": (<br/>    "@path": "$.context.campaign.source"<br/>  ),<br/>  "utm_medium": (<br/>    "@path": "$.context.campaign.medium"<br/>  ),<br/>  "utm_campaign": (<br/>    "@path": "$.context.campaign.name"<br/>  ),<br/>  "utm_term": (<br/>    "@path": "$.context.campaign.term"<br/>  ),<br/>  "utm_content": (<br/>    "@path": "$.context.campaign.content"<br/>  )<br/>) |
| use_batch_endpoint | string | test description | false |
| userAgent | string | test description | (<br/>  "@path": "$.context.userAgent"<br/>) |
| userAgentParsing | string | test description | true |
</details>
,<details>
<summary>Identify Calls</summary>

#### Matched events
type = "identify"

#### Data Mapping
| Name                 | Type          | Description     | Default   |
| -------------------- | -------------- | -------------- | --------- |
| user_id | string | test description | (<br/>  "@path": "$.userId"<br/>) |
| device_id | string | test description | (<br/>  "@if": (<br/>    "exists": (<br/>      "@path": "$.context.device.id"<br/>    ),<br/>    "then": (<br/>      "@path": "$.context.device.id"<br/>    ),<br/>    "else": (<br/>      "@path": "$.anonymousId"<br/>    )<br/>  )<br/>) |
| user_properties | string | test description | (<br/>  "@path": "$.traits"<br/>) |
| app_version | string | test description | (<br/>  "@path": "$.context.app.version"<br/>) |
| platform | string | test description | (<br/>  "@path": "$.context.device.type"<br/>) |
| os_name | string | test description | (<br/>  "@path": "$.context.os.name"<br/>) |
| os_version | string | test description | (<br/>  "@path": "$.context.os.version"<br/>) |
| device_brand | string | test description | (<br/>  "@path": "$.context.device.brand"<br/>) |
| device_manufacturer | string | test description | (<br/>  "@path": "$.context.device.manufacturer"<br/>) |
| device_model | string | test description | (<br/>  "@path": "$.context.device.model"<br/>) |
| carrier | string | test description | (<br/>  "@path": "$.context.network.carrier"<br/>) |
| country | string | test description | (<br/>  "@path": "$.context.location.country"<br/>) |
| region | string | test description | (<br/>  "@path": "$.context.location.region"<br/>) |
| city | string | test description | (<br/>  "@path": "$.context.location.city"<br/>) |
| language | string | test description | (<br/>  "@path": "$.context.locale"<br/>) |
| userAgent | string | test description | (<br/>  "@path": "$.context.userAgent"<br/>) |
| userAgentParsing | string | test description | true |
| utm_properties | string | test description | (<br/>  "utm_source": (<br/>    "@path": "$.context.campaign.source"<br/>  ),<br/>  "utm_medium": (<br/>    "@path": "$.context.campaign.medium"<br/>  ),<br/>  "utm_campaign": (<br/>    "@path": "$.context.campaign.name"<br/>  ),<br/>  "utm_term": (<br/>    "@path": "$.context.campaign.term"<br/>  ),<br/>  "utm_content": (<br/>    "@path": "$.context.campaign.content"<br/>  )<br/>) |
| referrer | string | test description | (<br/>  "@path": "$.context.page.referrer"<br/>) |
| library | string | test description | (<br/>  "@path": "$.context.library.name"<br/>) |
</details>
,<details>
<summary>Browser Session Tracking</summary>

#### Matched events
type = "track" or type = "identify" or type = "group" or type = "page" or type = "alias"

#### Data Mapping
| Name                 | Type          | Description     | Default   |
| -------------------- | -------------- | -------------- | --------- |

</details>


