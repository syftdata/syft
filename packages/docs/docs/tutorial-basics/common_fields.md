---
sidebar_position: 9
---

# Common Fields

## Context

Syft library collects useful parameters from clients and puts them in the context. Below are those fields and how you can access them.

| name          | type   | description                                                                                                                                                                                                                                                                                 |
| ------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| campaign      | Object | Dictionary of information about the campaign that resulted in the API call, containing name, source, medium, term, content, and any other custom UTM parameter. This maps directly to the common UTM campaign parameters.                                                                   |
| country       | String | Current user's country based on the IP address.                                                                                                                                                                                                                                             |
| geo           | Object | Current user's geo information based on IP                                                                                                                                                                                                                                                  |
| ip            | String | Current user’s IP address.                                                                                                                                                                                                                                                                  |
| locale        | String | Locale string for the current user, for example en-US.                                                                                                                                                                                                                                      |
| page          | Object | Dictionary of information about the current page in the browser, containing path, referrer, search, title and url.                                                                                                                                                                          |
| referrer      | Object | Dictionary of information about the way the user was referred to the website or app, containing type, name, url, and link.                                                                                                                                                                  |
| userAgent     | String | User agent of the device making the request.                                                                                                                                                                                                                                                |
| userAgentData | Object | The user agent data of the device making the request. This always contains brands, mobile, platform, and may contain bitness, model, platformVersion,uaFullVersion, fullVersionList, wow64, if requested and available. This populates if the Client Hints API is available on the browser. |

```ts title="Common Field Types"
interface Page {
  path: string;
  referrer: Document["referrer"] | null;
  search?: string;
  title: string;
  url: Location["href"];
}

interface Referrer {
  id?: string;
  type?: string;

  name?: string;
  url?: string;
  link?: string;

  btid?: string;
  urid?: string;
}

interface Campaign {
  name?: string;
  term?: string;
  source?: string;
  medium?: string;
  content?: string;
}

interface Geo {
  country?: string;
  region?: string;
  city?: string;
}
```

## Timestamps

Every event has three timestamps, timestamp, sentAt, and receivedAt. They’re used for very different purposes. All timestamps are ISO-8601 date strings.

| Timestamp  | Calculated                                                                                                               |
| ---------- | ------------------------------------------------------------------------------------------------------------------------ |
| timestamp  | Time on the client device when call was invoked OR The timestamp value manually passed in through server-side libraries. |
| sentAt     | Time on client device when call was sent. OR sentAt value manually passed in.                                            |
| receivedAt | Time on Segment server clock when call was received                                                                      |
