---
sidebar_position: 9
---

# Event Enrichment

Enrich events with client and server-side data.

## Automatic enrichment

Syft library automatically captures the following fields on the client for each event. They are available in the `context` dictionary in the event object.

| name          | type   | description                                                                                                                                                                                                                                                                                 |
| ------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| campaign      | Object | Dictionary of information about the campaign that resulted in the API call, containing name, source, medium, term, content, and any other custom UTM parameter. This maps directly to the common UTM campaign parameters.                                                                   |
| geo           | Object | Current user's geo information based on IP                                                                                                                                                                                                                                                  |
| ip            | String | Current user’s IP address.                                                                                                                                                                                                                                                                  |
| locale        | String | Locale string for the current user, for example en-US.                                                                                                                                                                                                                                      |
| page          | Object | Dictionary of information about the current page in the browser, containing path, referrer, search, title and url.                                                                                                                                                                          |
| referrer      | Object | Dictionary of information about the way the user was referred to the website or app, containing type, name, url, and link.                                                                                                                                                                  |
| userAgent     | String | User agent of the device making the request.                                                                                                                                                                                                                                                |
| userAgentData | Object | The user agent data of the device making the request. This always contains brands, mobile, platform, and may contain bitness, model, platformVersion,uaFullVersion, fullVersionList, wow64, if requested and available. This populates if the Client Hints API is available on the browser. |
| timestamp  | String | Time on the client device when call was invoked OR The timestamp value manually passed in through server-side libraries. |
| sentAt     | String | Time on client device when call was sent. OR sentAt value manually passed in.                                            |
| receivedAt | String | Time on your next.js server clock when call was received                                                                 |


```ts title="Example event with Enriched Fields"
{
  "context": {
    "anonymousId": "617fe90e800c58629af870ef",
    "campaign": {
      "name": "New board games launched",
      "source": "Newsletter",
      "medium": "email",
      "term": "new products",
      "content": "image link"
    },
    "ip": "1.2.3.4",
    "locale": "en-US",
    "page": {
      "path": "/product/monopoly",
      "referrer": "",
      "search": "",
      "title": "ACME - Monopoly Game",
      "url": "https://acme.com/product/monopoly"
    },
    "referrer": {
      "id": "DEFG922DEFFFAF21815",
      "type": "foo"
    },
    "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36",
    "userAgentData": {
      "brands": [
        {
          "brand": "Google Chrome",
          "version": "116"
        },
        {
          "brand": "Chromium",
          "version": "116"
        }
      ],
      "mobile": false,
      "platform": "macOS"
    }
  },
  "messageId": "3a8e5f0d-cf1e-4a77-9c33-6b2098e84672",
  "timestamp": "2023-09-06T21:47:08Z",
  "sentAt": "2023-09-06T21:47:10Z",
  "receivedAt": "2023-09-06T21:47:11Z",
  "event": "Order Placed",
  "properties": {
    "productId": "507f1f77bcf86cd799439011",
    "sku": "45790-32",
    "category": "Games",
    "name": "Monopoly: 3rd Edition",
    "brand": "Hasbro",
    "variant": "200 pieces",
    "price": 18.99
  },
  "type": "track",
  "userId": "16980daea0118"
  "groupId": "12345",
}
```

## Server-side enrichment with Transforms

You can enrich events on the backend with 'server-side' data using transformations. For example, you can
-  Add a `isDiscounted` field to the `Product Viewed` tracking event using data that is only available on the server (the discount status of the Product in the database). 
-  Add extra fields such as the user's title/role to the `identify` event. 

Transforms allow you to build out 'fully complete' events without requiring expensive 'joins' in a post-collection phase.

#### Examples

```ts title="Enrich Product Impression event"
const server = new NextSyftServer({
  destinations,
  // highlight-next-line
  enricher: async (event) => {
    if (event.type === "track" && event.event === "Product Viewed") {
      // highlight-start
      const product = await prisma.products.findUnique({
        where: { id: event.properties.productId },
      });
      // highlight-end
      if (product != null) {
        return {
          ...event,
          properties: {
            ...event.properties,
            // highlight-next-line
            isDiscounted: product.isDiscounted,
          },
        };
      }
    }
    return event;
  },
});
```

```ts title="Validate and Enrich Identify calls"
const server = new NextSyftServer({
  destinations,
  // highlight-next-line
  enricher: async (event) => {
    if (event.type === "identify") {
      // highlight-start
      const user = await prisma.user.findUnique({
        where: { id: event.userId as string },
      });
      // highlight-end
      if (user == null) return; // validate identify calls.
      return {
        ...event,
        traits: {
          ...event.traits,
          // highlight-next-line
          role: user.title,
        },
      };
    }
    return event;
  },
});
```
