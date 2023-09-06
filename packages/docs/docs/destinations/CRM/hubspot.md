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
<summary>Upsert Company</summary>

#### Upsert Company
Create or update a company in HubSpot.

#### Matched events
type = "group"

#### Data Mapping
| Destination Field                 | Type          | Description     | Source Field   |
| -------------------- | -------------- | -------------- | --------- |
| groupid | string | A unique identifier you assign to a company. Syft creates a custom property in HubSpot to store this value for each company so it can be used as a unique search field. Syft recommends not changing this value once set to avoid creating duplicate companies. | $.groupId ?? $.context.groupId |
| createNewCompany | boolean | If true, Syft will attempt to update an existing company in HubSpot and if no company is found, Syft will create a new company. If false, Syft will only attempt to update an existing company and never create a new company. This is set to true by default. | true |
| associateContact | boolean | If true, Syft will associate the company with the user identified in your payload. If no contact is found in HubSpot, an error is thrown and the company is not created/updated. If false, Syft will not attempt to associate a contact with the company and companies can be created/updated without requiring a contact association. This is set to true by default. | false |
| companysearchfields | object | The unique field(s) used to search for an existing company in HubSpot to update. By default, Syft creates a custom property to store groupId for each company and uses this property to search for companies. If a company is not found, the fields provided here are then used to search. If a company is still not found, a new one is created. | $.companysearchfields |
| name | string | The name of the company. | $.traits.name |
| description | string | A short statement about the company’s mission and goals. | $.traits.description |
| address | string | The street address of the company. | $.traits.address.street |
| city | string | The city where the company is located. | $.traits.address.city |
| state | string | The state or region where the company is located. | $.traits.address.state |
| zip | string | The postal or zip code of the company. | $.traits.address.postalCode ?? $.traits.address.postal_code |
| domain | string | The company’s website domain. | $.traits.website |
| phone | string | The company’s primary phone number. | $.traits.phone |
| numberofemployees | integer | The total number of people who work for the company. | $.traits.employees |
| industry | string | The type of business the company performs. | $.traits.industry |
| lifecyclestage | string | The company’s stage within the marketing/sales process. See more information on default and custom stages in [HubSpot’s documentation](https://knowledge.hubspot.com/contacts/use-lifecycle-stages). Syft supports moving status forwards or backwards. | $.lifecyclestage |
| properties | object | Any other default or custom company properties. On the left-hand side, input the internal name of the property as seen in your HubSpot account. On the right-hand side, map the Syft field that contains the value. Custom properties must be predefined in HubSpot. See more information in [HubSpot’s documentation](https://knowledge.hubspot.com/crm-setup/manage-your-properties#create-custom-properties). Important: Do not use ’syft_group_id’ here as it is an internal property and will result in an an error. | $.properties |
</details>
,<details>
<summary>Upsert Contact</summary>

#### Upsert Contact
Create or update a contact in HubSpot.

#### Matched events
type = "identify"

#### Data Mapping
| Destination Field                 | Type          | Description     | Source Field   |
| -------------------- | -------------- | -------------- | --------- |
| email | string | The contact’s email. Email is used to uniquely identify contact records in HubSpot. If an existing contact is found with this email, we will update the contact. If a contact is not found, we will create a new contact. | $.traits.email |
| company | string | The contact’s company. | $.traits.company |
| firstname | string | The contact’s first name. | $.traits.first_name ?? $.traits.firstName |
| lastname | string | The contact’s last name. | $.traits.last_name ?? $.traits.lastName |
| phone | string | The contact’s phone number. | $.traits.phone |
| address | string | The contact's street address, including apartment or unit number. | $.traits.address.street |
| city | string | The contact's city of residence. | $.traits.address.city |
| state | string | The contact's state of residence. | $.traits.address.state |
| country | string | The contact's country of residence. | $.traits.address.country |
| zip | string | The contact's zip code. | $.traits.address.postalCode ?? $.traits.address.postal_code |
| website | string | The contact’s company/other website. | $.traits.website |
| lifecyclestage | string | The contact’s stage within the marketing/sales process. See more information on default and custom stages in [HubSpot’s documentation](https://knowledge.hubspot.com/contacts/use-lifecycle-stages). Syft supports moving status forwards or backwards. | $.lifecyclestage |
| properties | object | Any other default or custom contact properties. On the left-hand side, input the internal name of the property as seen in your HubSpot account. On the right-hand side, map the Syft field that contains the value. Custom properties must be predefined in HubSpot. See more information in [HubSpot’s documentation](https://knowledge.hubspot.com/crm-setup/manage-your-properties#create-custom-properties). | $.properties |
</details>


