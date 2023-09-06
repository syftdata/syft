---
sidebar_position: 15
---
# Hubspot

This page describes how to set up Hubspot as a destination.

## Set up
An example setup for Hubspot is shown below.

```ts title="src/pages/api/syft.ts"
// ...
const destinations = [
  // highlight-start
  {
    type: "hubspot",
    settings: {
        portalId: "xxxx",
        access_token: "xxxx"
    },
  },
  // highlight-end
];
// ...
```

### Configuration options

| Name                 | Type           | Description     | Required | Default         |
| -------------------- | -------------- | --------------- | -------- | --------------- |
| portalId | string | The Hub ID of your HubSpot account. | true |  |
| access_token | string | Access token to access the destination. | true |  |
| refresh_token | string | Refresh Token (If applicable) | false |  |
| refresh_token_url | string | Refresh token URL (If applicable) | false |  |
| clientId | string | Client ID (If applicable) | false |  |
| clientSecret | string | Client Secret (If applicable) | false |  | 


## Data Modeling
<details>
<summary>Preset 1</summary>

#### Upsert Company
Create or update a company in HubSpot.

#### Matched events
type = "group"

#### Data Mapping
| Name                 | Type          | Description     | Default   |
| -------------------- | -------------- | -------------- | --------- |
| groupid | string | A unique identifier you assign to a company. Segment creates a custom property in HubSpot to store this value for each company so it can be used as a unique search field. Segment recommends not changing this value once set to avoid creating duplicate companies. | (<br/>  "@if": (<br/>    "exists": (<br/>      "@path": "$.groupId"<br/>    ),<br/>    "then": (<br/>      "@path": "$.groupId"<br/>    ),<br/>    "else": (<br/>      "@path": "$.context.groupId"<br/>    )<br/>  )<br/>) |
| createNewCompany | boolean | If true, Segment will attempt to update an existing company in HubSpot and if no company is found, Segment will create a new company. If false, Segment will only attempt to update an existing company and never create a new company. This is set to true by default. | true |
| associateContact | boolean | If true, Segment will associate the company with the user identified in your payload. If no contact is found in HubSpot, an error is thrown and the company is not created/updated. If false, Segment will not attempt to associate a contact with the company and companies can be created/updated without requiring a contact association. This is set to true by default. | false |
| companysearchfields | object | The unique field(s) used to search for an existing company in HubSpot to update. By default, Segment creates a custom property to store groupId for each company and uses this property to search for companies. If a company is not found, the fields provided here are then used to search. If a company is still not found, a new one is created. | (<br/>  "@path": "$.companysearchfields"<br/>) |
| name | string | The name of the company. | (<br/>  "@path": "$.traits.name"<br/>) |
| description | string | A short statement about the company’s mission and goals. | (<br/>  "@path": "$.traits.description"<br/>) |
| address | string | The street address of the company. | (<br/>  "@path": "$.traits.address.street"<br/>) |
| city | string | The city where the company is located. | (<br/>  "@path": "$.traits.address.city"<br/>) |
| state | string | The state or region where the company is located. | (<br/>  "@path": "$.traits.address.state"<br/>) |
| zip | string | The postal or zip code of the company. | (<br/>  "@if": (<br/>    "exists": (<br/>      "@path": "$.traits.address.postalCode"<br/>    ),<br/>    "then": (<br/>      "@path": "$.traits.address.postalCode"<br/>    ),<br/>    "else": (<br/>      "@path": "$.traits.address.postal_code"<br/>    )<br/>  )<br/>) |
| domain | string | The company’s website domain. | (<br/>  "@path": "$.traits.website"<br/>) |
| phone | string | The company’s primary phone number. | (<br/>  "@path": "$.traits.phone"<br/>) |
| numberofemployees | integer | The total number of people who work for the company. | (<br/>  "@path": "$.traits.employees"<br/>) |
| industry | string | The type of business the company performs. | (<br/>  "@path": "$.traits.industry"<br/>) |
| lifecyclestage | string | The company’s stage within the marketing/sales process. See more information on default and custom stages in [HubSpot’s documentation](https://knowledge.hubspot.com/contacts/use-lifecycle-stages). Segment supports moving status forwards or backwards. | (<br/>  "@path": "$.lifecyclestage"<br/>) |
| properties | object | Any other default or custom company properties. On the left-hand side, input the internal name of the property as seen in your HubSpot account. On the right-hand side, map the Segment field that contains the value. Custom properties must be predefined in HubSpot. See more information in [HubSpot’s documentation](https://knowledge.hubspot.com/crm-setup/manage-your-properties#create-custom-properties). Important: Do not use ’segment_group_id’ here as it is an internal property and will result in an an error. | (<br/>  "@path": "$.properties"<br/>) |
</details>
,<details>
<summary>Preset 2</summary>

#### Upsert Contact
Create or update a contact in HubSpot.

#### Matched events
type = "identify"

#### Data Mapping
| Name                 | Type          | Description     | Default   |
| -------------------- | -------------- | -------------- | --------- |
| email | string | The contact’s email. Email is used to uniquely identify contact records in HubSpot. If an existing contact is found with this email, we will update the contact. If a contact is not found, we will create a new contact. | (<br/>  "@path": "$.traits.email"<br/>) |
| company | string | The contact’s company. | (<br/>  "@path": "$.traits.company"<br/>) |
| firstname | string | The contact’s first name. | (<br/>  "@if": (<br/>    "exists": (<br/>      "@path": "$.traits.first_name"<br/>    ),<br/>    "then": (<br/>      "@path": "$.traits.first_name"<br/>    ),<br/>    "else": (<br/>      "@path": "$.traits.firstName"<br/>    )<br/>  )<br/>) |
| lastname | string | The contact’s last name. | (<br/>  "@if": (<br/>    "exists": (<br/>      "@path": "$.traits.last_name"<br/>    ),<br/>    "then": (<br/>      "@path": "$.traits.last_name"<br/>    ),<br/>    "else": (<br/>      "@path": "$.traits.lastName"<br/>    )<br/>  )<br/>) |
| phone | string | The contact’s phone number. | (<br/>  "@path": "$.traits.phone"<br/>) |
| address | string | The contact's street address, including apartment or unit number. | (<br/>  "@path": "$.traits.address.street"<br/>) |
| city | string | The contact's city of residence. | (<br/>  "@path": "$.traits.address.city"<br/>) |
| state | string | The contact's state of residence. | (<br/>  "@path": "$.traits.address.state"<br/>) |
| country | string | The contact's country of residence. | (<br/>  "@path": "$.traits.address.country"<br/>) |
| zip | string | The contact's zip code. | (<br/>  "@if": (<br/>    "exists": (<br/>      "@path": "$.traits.address.postalCode"<br/>    ),<br/>    "then": (<br/>      "@path": "$.traits.address.postalCode"<br/>    ),<br/>    "else": (<br/>      "@path": "$.traits.address.postal_code"<br/>    )<br/>  )<br/>) |
| website | string | The contact’s company/other website. | (<br/>  "@path": "$.traits.website"<br/>) |
| lifecyclestage | string | The contact’s stage within the marketing/sales process. See more information on default and custom stages in [HubSpot’s documentation](https://knowledge.hubspot.com/contacts/use-lifecycle-stages). Segment supports moving status forwards or backwards. | (<br/>  "@path": "$.lifecyclestage"<br/>) |
| properties | object | Any other default or custom contact properties. On the left-hand side, input the internal name of the property as seen in your HubSpot account. On the right-hand side, map the Segment field that contains the value. Custom properties must be predefined in HubSpot. See more information in [HubSpot’s documentation](https://knowledge.hubspot.com/crm-setup/manage-your-properties#create-custom-properties). | (<br/>  "@path": "$.properties"<br/>) |
</details>


