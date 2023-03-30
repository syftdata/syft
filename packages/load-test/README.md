# load-testing
Repository for load testing which uses k6 (https://k6.io/docs/get-started/running-k6/)

## Before you run
Install k6:
```
brew install k6
```


Ensure that you are running node 16 (https://github.com/webpack/webpack/issues/14532)


## How to run
Because k6 is not node-based, we need to first run webpack to bundle dependencies used in `src/test.js`:
```
npm start
```
Once the command runs, run the following command to execute the test:
```
k6 run dist/syft-test.js
```
