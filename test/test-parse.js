require('winston').level = 'debug';
const apkreader = require('../lib/apkreader');
const process = require('process');

apkreader
  .load(process.argv.find((i) => i.endsWith("apk")) || '/Users/ravisu/Downloads/com.antutu.ABenchMark.apk')
  .then((reader) => {
    return reader.readManifest();
  })
  .then((manifest) => {
    console.log(m);
    console.log("Done.");
  })
  .catch((err) => {
    console.error("ERROR: " + err);
  });
