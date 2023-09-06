---
sidebar_position: 19
---
# Hubspot

This page describes how to set up the Hubspot as a destination.

## Set up
An example setup for the Hubspot is shown below.

```ts title="src/pages/api/syft.ts"
import { type NextApiRequest, type NextApiResponse } from "next";
// highlight-next-line
import { NextSyftServer } from "@syftdata/next/lib/next";

const destinations = [
  // highlight-start
  {
    type: "hubspot",
    settings: {

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
| portalId | string | The Hub ID of your HubSpot account. | false |  | 


## Data Modeling
<details>
<summary>Preset 1</summary>

#### Matched events
type = "group"

#### Data Mapping
| Name                 | Type          | Description     | Default   |
| -------------------- | -------------- | -------------- | --------- |
| groupid | string | test description | (<br/>  "@if": (<br/>    "exists": (<br/>      "@path": "$.groupId"<br/>    ),<br/>    "then": (<br/>      "@path": "$.groupId"<br/>    ),<br/>    "else": (<br/>      "@path": "$.context.groupId"<br/>    )<br/>  )<br/>) |
| createNewCompany | string | test description | true |
| associateContact | string | test description | false |
| companysearchfields | string | test description | (<br/>  "@path": "$.companysearchfields"<br/>) |
| name | string | test description | (<br/>  "@path": "$.traits.name"<br/>) |
| description | string | test description | (<br/>  "@path": "$.traits.description"<br/>) |
| address | string | test description | (<br/>  "@path": "$.traits.address.street"<br/>) |
| city | string | test description | (<br/>  "@path": "$.traits.address.city"<br/>) |
| state | string | test description | (<br/>  "@path": "$.traits.address.state"<br/>) |
| zip | string | test description | (<br/>  "@if": (<br/>    "exists": (<br/>      "@path": "$.traits.address.postalCode"<br/>    ),<br/>    "then": (<br/>      "@path": "$.traits.address.postalCode"<br/>    ),<br/>    "else": (<br/>      "@path": "$.traits.address.postal_code"<br/>    )<br/>  )<br/>) |
| domain | string | test description | (<br/>  "@path": "$.traits.website"<br/>) |
| phone | string | test description | (<br/>  "@path": "$.traits.phone"<br/>) |
| numberofemployees | string | test description | (<br/>  "@path": "$.traits.employees"<br/>) |
| industry | string | test description | (<br/>  "@path": "$.traits.industry"<br/>) |
| lifecyclestage | string | test description | (<br/>  "@path": "$.lifecyclestage"<br/>) |
| properties | string | test description | (<br/>  "@path": "$.properties"<br/>) |
</details>
,<details>
<summary>Preset 2</summary>

#### Matched events
type = "identify"

#### Data Mapping
| Name                 | Type          | Description     | Default   |
| -------------------- | -------------- | -------------- | --------- |
| email | string | test description | (<br/>  "@path": "$.traits.email"<br/>) |
| company | string | test description | (<br/>  "@path": "$.traits.company"<br/>) |
| firstname | string | test description | (<br/>  "@if": (<br/>    "exists": (<br/>      "@path": "$.traits.first_name"<br/>    ),<br/>    "then": (<br/>      "@path": "$.traits.first_name"<br/>    ),<br/>    "else": (<br/>      "@path": "$.traits.firstName"<br/>    )<br/>  )<br/>) |
| lastname | string | test description | (<br/>  "@if": (<br/>    "exists": (<br/>      "@path": "$.traits.last_name"<br/>    ),<br/>    "then": (<br/>      "@path": "$.traits.last_name"<br/>    ),<br/>    "else": (<br/>      "@path": "$.traits.lastName"<br/>    )<br/>  )<br/>) |
| phone | string | test description | (<br/>  "@path": "$.traits.phone"<br/>) |
| address | string | test description | (<br/>  "@path": "$.traits.address.street"<br/>) |
| city | string | test description | (<br/>  "@path": "$.traits.address.city"<br/>) |
| state | string | test description | (<br/>  "@path": "$.traits.address.state"<br/>) |
| country | string | test description | (<br/>  "@path": "$.traits.address.country"<br/>) |
| zip | string | test description | (<br/>  "@if": (<br/>    "exists": (<br/>      "@path": "$.traits.address.postalCode"<br/>    ),<br/>    "then": (<br/>      "@path": "$.traits.address.postalCode"<br/>    ),<br/>    "else": (<br/>      "@path": "$.traits.address.postal_code"<br/>    )<br/>  )<br/>) |
| website | string | test description | (<br/>  "@path": "$.traits.website"<br/>) |
| lifecyclestage | string | test description | (<br/>  "@path": "$.lifecyclestage"<br/>) |
| properties | string | test description | (<br/>  "@path": "$.properties"<br/>) |
</details>


