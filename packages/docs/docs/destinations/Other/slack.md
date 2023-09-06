---
sidebar_position: 18
---
# Slack

This page describes how to set up Slack as a destination.

## Set up
An example setup for Slack is shown below.

```ts title="src/pages/api/syft.ts"
// ...
const destinations = [
  // highlight-start
  {
    type: "slack",
    settings: {

    },
  },
  // highlight-end
];
// ...
```

### Configuration options

| Name                 | Type           | Description     | Required | Default         |
| -------------------- | -------------- | --------------- | -------- | --------------- |
 



