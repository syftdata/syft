const { Storage } = require('@google-cloud/storage');
const fs = require('fs');
const path = require('path');
const PackageJson = require('../package.json');

const gcsBucketName = process.env.GCS_BUCKET_NAME;
const STORAGE_PATH = 'syftnext';

const storage = new Storage({
  projectId: 'ornate-acronym-372603'
});

// This function takes a file path and uploads it to Google Cloud Storage bucket.
// It returns a promise that resolves with the public url of the file.
function upload(file, destPath) {
  return new Promise((resolve, reject) => {
    const contents = fs.readFileSync(file);
    const bucket = storage.bucket(gcsBucketName);
    const gcsfile = bucket.file(destPath);
    const stream = gcsfile.createWriteStream();
    stream.on('error', (err) => {
      reject(err);
    });
    stream.on('finish', () => {
      resolve(file + destPath);
    });
    // write contentd to gcs file stream
    stream.write(contents);
    stream.end();
  });
}

const LOCAL_DIST_PATH = 'dist/';
const files = fs.readdirSync(LOCAL_DIST_PATH);
const uploadPromises = files
  .flatMap((file) => {
    if (file.endsWith('.js')) {
      return [
        upload(
          path.join(LOCAL_DIST_PATH, file),
          path.join(STORAGE_PATH, PackageJson.version, file)
        ),
        upload(path.join(LOCAL_DIST_PATH, file), path.join(STORAGE_PATH, file))
      ];
    }
    return null;
  })
  .filter((promise) => promise != null);
Promise.all(uploadPromises)
  .then((url) => {
    console.log(url);
  })
  .catch((err) => {
    console.log(err);
  });