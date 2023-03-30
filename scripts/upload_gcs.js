const { Storage } = require("@google-cloud/storage");
const fs = require("fs");
const path = require("path");

const gcsAuthToken = process.env.GCS_AUTH_TOKEN;
const gcsBucketName = process.env.GCS_BUCKET_NAME;

// This function takes a file path and uploads it to Google Cloud Storage bucket.
// It returns a promise that resolves with the public url of the file.
function upload(file, dest_path) {
  return new Promise((resolve, reject) => {
    const contents = fs.readFileSync(file);
    const storage = new Storage();
    const bucket = storage.bucket(gcsBucketName);
    const gcsfile = bucket.file(dest_path);
    const stream = gcsfile.createWriteStream();
    stream.on("error", (err) => {
      reject(err);
    });
    stream.on("finish", () => {
      resolve(file + dest_path);
    });
    // write contentd to gcs file stream
    stream.write(contents);
    stream.end();
  });
}

const LOCAL_DIST_PATH = path.join(__dirname, "packages/reflector/lib-bundle/");
const STORAGE_PATH = "syft-reflector";
const files = fs.readdirSync(LOCAL_DIST_PATH);
const uploadPromises = files.map((file) => {
  upload(path.join(LOCAL_DIST_PATH, file), `${STORAGE_PATH}/${file}`);
});
Promise.all(uploadPromises)
  .then((url) => {
    console.log(url);
  })
  .catch((err) => {
    console.log(err);
  });
