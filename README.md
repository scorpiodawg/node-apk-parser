node-apk-parser-promise
===

This is a library to enable parsing and inspecting an Android APK file
asynchronously via promises (using `bluebird`). It currently exposes
information about:
* the APK manifest (`AndroidManifest.xml`)
* the signing certificate with details on the Issuer and Subject, whether
  or not it is signed with the Android debug certificate, as well as expiry
  status.

>NOTE: This code is under development.

# Install via NPM:

```bash
npm install --save node-apk-parser-promise
```

# Usage

Basic usage via promises looks like this:

```javascript
var reader;

require('node-apk-parser-promise')
  .load('./test.apk') // Start the open+read of the ZIP file
  .then((r) => {
    // Got an ApkReader object, cache it here for later use, or start reading
    // the manifest
    reader = r;
    return reader.readManifest();
  })
  .then((manifest) => {
    // Got the APK's AndroidManifest.xml object
    console.log(manifest);
    // Now read the certificate info
    return reader.readCertificate();
  })
  .then((certInfo) => {
    console.log(JSON.stringify(certInfo));
  })
  .catch((err) => {
    console.error("ERROR: " + err);
  })
  .finally(() => {
    reader && reader.close();
  });
```

Run `node test/test-parse.js [path-to-apk]` to see the output.

# Credits

* [@arthur-zhang](https://github.com/arthur-zhang) whose work this is derived from
* [@rubenv](https://github.com/rubenv) whose [work](https://github.com/rubenv/node-apk-parser)
  was the original basis for the aforementioned project
* ADB parsing courtesy [adbkit-apkparser](https://github.com/openstf/adbkit-apkreader) from the
  excellent OpenSTF folks
