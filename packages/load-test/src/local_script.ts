import Syft from "../../client/src";

function logEvent(syft: Syft): Promise<void> {
  return new Promise((resolve) => {
    for (let i = 0; i < 10; i++) {
      syft.batcher.reflectEvent("TestEvent", {
        name: "Peter Gibbons",
        email: "peter@example.com",
        plan: "premium",
        logins: 5,
      });
    }
    syft.batcher.flush();
    resolve();
  });
}

const syft = new Syft({
  apiKey: "clezv0jwx0000mr6uty60kpir",
  appVersion: "1.0.0",
  plugins: [],
  monitor: {
    batchSize: 10,
    samplingRate: 1.0, // 100% of the data
    // remote: 'https://events.syftdata.com/reflect/v1',
    remote: "http://localhost:8080/reflect/v1",
  },
});

const promises: Promise<void>[] = [];
console.time(`process`);
for (let i = 0; i < 1000; i++) {
  promises.push(logEvent(syft));
}
const start = Date.now();
Promise.all(promises).then(() => {
  const end = Date.now();
  console.log("executed all");
  console.log("time diff: " + (end - start));
  console.timeEnd(`process`);
});
