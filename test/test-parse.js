require('winston').level = 'debug'; // set to 'debug' for more logging
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
    console.log("\n*** APK READ SUCCESSFULLY! ***");
    console.log(m.package, m.versionName, "(" + m.versionCode + ")");
    return reader.readCertificate();
  })
  .then((certInfo) => {
    console.log("\n*** CERTIFICATE READ SUCCESSFULLY! ***");
    delete certInfo.raw;
    console.log(certInfo);
  })
  .catch((err) => {
    console.error("" + err);
  })
  .finally(() => {
    if (reader) reader.close();
    console.log("Done.");
  });
