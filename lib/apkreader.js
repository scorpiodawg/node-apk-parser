(function () {
  var ApkReader, BinaryXmlParser, ManifestParser, Zip;

  const fs = require('fs-extra');
  const unzip = require('yauzl');
  const Promise = require('bluebird'); // Override built in Promise functionality
  const logger = require('winston');
  const streamBuffers = require('stream-buffers');
  const assert = require('assert');

  ManifestParser = require('./apkreader/parser/manifest');

  BinaryXmlParser = require('./apkreader/parser/binaryxml');

  /**
   * An object that contains details of an APK once load() has
   * been invoked successfully.
   */
  ApkReader = (function () {
    const MANIFEST = 'AndroidManifest.xml';

    /**
     * Returns a promise that upon fulfilment, returns
     * an ApkReader object that has successfully loaded the
     * APK file whose path is passed in.
     */
    ApkReader.load = function (apk) {
      logger.debug('Loading file "' + apk + "'");

      let existsPromisified = Promise.promisify((path, cb) => {
        fs.exists(path, (exists) => cb(null, exists));
      });

      return existsPromisified(apk)
        .then((exists) => {
          if (!exists) {
            throw Error("Apk file was not found.");
          }
          return Promise.promisify(unzip.open)(apk, {
            lazyEntries: false,
            autoClose: false
          })
        })
        .then((zipfile) => {
          logger.debug("Got zip file: ", zipfile);
          logger.debug("Number of entries: ", zipfile.entryCount);

          var apkReader = new ApkReader(zipfile);

          // This promise is resolved when the .on() method encounters
          // the Android manifest
          return new Promise((resolve, reject) => {
            let found = false;
            let apkReader = new ApkReader(zipfile);

            // Set up event handlers
            zipfile.on("error", function (err) {
              apkReaderPromise.reject(Error("Failed parsing APK or manifest"));
            });

            // Now ensure we capture info on all the entries in it that
            // we care about
            zipfile.on("entry", function (entry) {
              logger.debug("Got entry : ", entry);

              if (entry.fileName === MANIFEST) {
                logger.debug("Found ", MANIFEST);
                apkReader.manifestEntry = entry;
              }
            });

            zipfile.on("end", function () {
              //zipfile.close();
              if (apkReader.manifestEntry) {
                // Got a manifest, resolve promise
                resolve(apkReader);
              } else { // got nothing
                reject(Error("Failed parsing APK or manifest"));
              }
            });
          });
        });
    }

    /**
     * Constructor that takes a pre-loaded zip file
     */
    function ApkReader(apk) {
      this.apk = apk;
      this.manifestEntry = null;
    }

    /**
     * Returns a promise chain that reads the manifest XML data and
     * upon success, fulfils the promise with the a ManifestParser
     * instance that can be used to query details of the APK.
     */
    ApkReader.prototype.readManifest = function () {
      let that = this;
      return new Promise((resolve, reject) => {
        if (!that.manifestEntry) {
          return reject(Error("APK does not contain '" + MANIFEST));
        }
        that.apk.openReadStream(that.manifestEntry, function (err, readStream) {
          logger.debug('Readable stream opened.');
          if (err) throw err;
          var writableBuffer = new streamBuffers.WritableStreamBuffer({
            initialSize: that.manifestEntry.uncompressedSize + 1024,
            incrementAmount: (10 * 1024) // grow by 10 kilobytes each time buffer overflows.
          });

          writableBuffer.on('error', (err) => {
            logger.error('Got error while piping: ' + err);
            writableBuffer.end();
            reject(Error("Failed to read/parse '" + MANIFEST + "' due to: " + err));
          });

          // Start piping
          readStream.on('end', () => {
            writableBuffer.end();
            logger.debug('Writes are now complete.');
            resolve(new ManifestParser(writableBuffer.getContents()).parse());
          });

          logger.debug("About to pipe to writable stream...");
          readStream.pipe(writableBuffer, { end: false });
        });
      });
    };

    /**
     * Closes the internal zipfile and releases resources.
     */
    ApkReader.prototype.close = function () {
      if (this.apk) {
        this.apk.close();
      } else {
        throw new Error("APK was never loaded");
      }
    };

    // ApkReader.prototype.readXml = function (path) {
    //   var file;
    //   if (file = this.zip.getEntry(path)) {
    //     return new BinaryXmlParser(file.getData()).parse();
    //   } else {
    //     throw new Error("APK does not contain '" + path + "'");
    //   }
    // };

    return ApkReader;

  })();

  module.exports = ApkReader;

}).call(this);
