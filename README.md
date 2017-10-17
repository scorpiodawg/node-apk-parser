node-apk-parser-promise
===

>NOTE: This code is under development.

This is a fork of `@arthur-zhang`'s [node-apk-parser library](https://github.com/arthur-zhang/node-apk-parser)
to enable an asynchronous API for use in servers. It uses the promises API and is based on the
`bluebird` Node.js library.

## Credits

* [@arthur-zhang](https://github.com/arthur-zhang) whose work this is derived from
* [@rubenv](https://github.com/rubenv) whose [work](https://github.com/rubenv/node-apk-parser)
  was the original basis for the aforementioned project
* ADB parsing courtesy [adbkit-apkparser](https://github.com/openstf/adbkit-apkreader) from the
  excellent OpenSTF folks

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
  })
  .catch((err) => {
    console.error("ERROR: " + err);
  }).
  done(() => {
    reader.close();
  });
```

Run the file `test/test-parse.js` to see the output.
