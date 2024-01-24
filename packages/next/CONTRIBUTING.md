### Testing

Open two terminals and run below commands:

- `npm run dev-bundle`
- `npm run preview`

And point your webapp

### Release branc

./scripts/release.sh from the root folder.

### Publish

GCS_BUCKET_NAME=syft_cdn node ./scripts/upload_gcs.js
