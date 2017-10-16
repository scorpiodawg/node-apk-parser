(function () {
  var ApkReader, BinaryXmlParser, ManifestParser, Zip;

  Zip = require('adm-zip');
  const fs = require('fs-extra');
  const unzip = require('yauzl');
  const promise = require('bluebird');
  const logger = require('winston');

  ManifestParser = require('./apkreader/parser/manifest');

  BinaryXmlParser = require('./apkreader/parser/binaryxml');

  ApkReader = (function () {
    const MANIFEST = 'AndroidManifest.xml';

    /**
     * Returns a promise that upon fulfilment, returns
     * an ApkReader object that has successfully loaded the
     * APK file whose path is passed in.
     */
    ApkReader.load = function (apk) {
      let promise = fs.exists(apk)
        .then((exists) => {
          if (!exists) {
            throw Error("Apk file was not found.");
          }
          return promise.promisify(unzip.open)(apk, { lazyEntries: false })
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
              zipfile.close();
              if (apkReader.manifestEntry) {
                // Got a manifest, resolve promise
                resolve(apkReader);
              } else { // got nothing
                reject(Error("Failed parsing APK or manifest"));
              }
            });
          });
        });

      return promise;
    }

    /**
     * Constructor that takes a pre-loaded zip file
     */
    function ApkReader(apk) {
      this.apk = apk;
    }

    /**
     * Returns a promise that unzips the APK, reads the manifest, and
     * upon fulfilment returns the manifest object.
     */
    ApkReader.prototype.readManifest = function () {
      var manifest;
      if (manifest = this.zip.Entry(MANIFEST)) {
        return new ManifestParser(manifest.getData()).parse();
      } else {
        throw new Error("APK does not contain '" + MANIFEST + "'");
      }
    };

    ApkReader.prototype.readXml = function (path) {
      var file;
      if (file = this.zip.getEntry(path)) {
        return new BinaryXmlParser(file.getData()).parse();
      } else {
        throw new Error("APK does not contain '" + path + "'");
      }
    };

    return ApkReader;

  })();

  module.exports = ApkReader;

}).call(this);
