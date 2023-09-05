---
slug: /
sidebar_position: 1
---

# Introduction

This is a [next.js](https://nextjs.org) library to capture rich analytics events with high-quality and without vendor lock-in.

## Data Quality

- Prevent data loss from Ad blockers: This library will automatically proxy events through your nextjs backend.
- Guarantee type safety: The library can leverage Typescript types to ensure events and fields adhere to a contract.

## No Lock-In

- Universal vendor-neutral API: A Segment-like API to log events in standard format. The same API can be used for client and server-side logging.
- Full control over your data: You can route events to multiple data destinations e.g. warehouses, CDP, analytics platforms with simple configuration. It acts as a lightweight-CDP similar to Segment.

## Rich events

- Enrich collected events on server-side state (e.g. from database) with transforms.
- Automatically collect page events and standard fields on each event.
