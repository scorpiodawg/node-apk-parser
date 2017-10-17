require('winston').level = 'info'; // set to 'debug' for more logging
const apkreader = require('../lib/apkreader');
const process = require('process');

var reader, manifest;

apkreader
  .load(process.argv.find((i) => i.endsWith("apk")) || './test.apk')
  .then((r) => {
    reader = r;
    return reader.readManifest();
  })
  .then((m) => {
    manifest = m;
    console.log("\n*** APK READ SUCCESSFULLY! ***")
    console.log(m.package, m.versionName, "(" + m.versionCode + ")");
    console.log("Done.");
  })
  .then(() => {
    reader.close();
  })
  .catch((err) => {
    console.error("ERROR: " + err);
  });
