node-apk-parser-promise
===

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
require('node-apk-parser-promise')
  .load('./test.apk') // Start the open+read of the ZIP file
  .then((reader) => {
    // Got an ApkReader object, start reading the manifest
    return reader.readManifest();
  })
  .then((manifest) => {
    // Got the APK's AndroidManifest.xml object
    console.log(manifest);
  })
  .catch((err) => {
    console.error("ERROR: " + err);
  });
```

Run the file `test/test-parse.js` to see the output.
