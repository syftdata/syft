# Universal event analytics for nextjs

## Introduction

This is a [next.js](https://nextjs.org) library to capture rich analytics events with high-quality and without vendor lock-in.

### Data Quality

- Prevent data loss from Ad blockers: This library will automatically proxy events through your nextjs backend.
- Guarantee type safety: The library can leverage Typescript types to ensure events and fields adhere to a contract.

### No Lock-In

- Universal vendor-neutral API: A Segment-like API to log events in standard format. The same API can be used for client and server-side logging.
- Full control over your data: You can route events to multiple data destinations e.g. warehouses, CDP, analytics platforms with simple configuration. It acts as a lightweight-CDP similar to Segment.

### Rich events

- Enrich collected events on server-side state (e.g. from database) with transforms.
- Automatically collect page events and standard fields on each event.

## Usage

[Getting Started Guide](https://docs.syftdata.com)

## Support

For usage questions, bug reports, or feature requests, please open a github issue [here](https://github.com/syftdata/event-hub/issues). For general inquiries or reporting security issues, please contact us at hello@syftdata.com.

## Contributing

We welcome your contributions to make Syft better. Please follow [this doc](./CONTRIBUTING.md) to contribute to this repo.

## Build Status

![CI tests](https://github.com/syftdata/event-hub/actions/workflows/ci.yaml/badge.svg)
