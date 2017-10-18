(function () {
  const openssl = require('openssl-wrapper');
  const logger = require('winston');
  const Promise = require('bluebird');

  function makeKeys(line, obj) {
    try {
      let kvs = line.split(':')[1].split(',');
      for (let kv of kvs) {
        let x = kv.split('=');
        if (x && x.length > 1) {
          obj[x[0].trim()] = x[1].trim();
        }
      }
    } finally {
      // Treat as soft failure
    }
  }

  function extractCertInfo(data) {
    // Parse things here and return a CertificateInfo object
    // Subject: CN=Android Debug, O=Android, C=US
    // Issuer: CN=Android Debug, O=Android, C=US
    // Not After : May 24 07:28:19 2047 GMT
    let certInfo = { raw: data, isDebug: false };
    let lines = data.split('\n');
    for (let one of lines) {
      let line = one.trim();
      if (line.match(/^Subject:/)) {
        certInfo.subject = {};
        makeKeys(line, certInfo.subject);
        if (line.match(/Subject: CN=Android Debug, O=Android, C=US/)) {
          certInfo.isDebug = true;
        }
      } else if (line.match(/^Issuer:/)) {
        certInfo.issuer = {};
        makeKeys(line, certInfo.issuer);
      } else if (line.match(/^Not After/)) {
        // Parse out the date from this line template
        // Not After : May 24 07:28:19 2047 GMT
        certInfo.isExpired = Date.parse(line.substr(line.indexOf(':') + 1).trim()) <= Date.parse(Date());
      }
    }

    return certInfo;
  }

  var CertificateParser = (function () {
    function CertificateParser(buffer) {
      this.buffer = buffer;
    }

    CertificateParser.prototype.parse = function () {
      const opensslAsync = Promise.promisify(openssl.exec);

      // Extract enveloped data
      return opensslAsync('pkcs7', this.buffer, {
        inform: 'DER', noout: true, print_certs: true, text: true
      })
        // Parse decrypted data
        .then((data) => { // data is a Buffer
          return extractCertInfo(data.toString());
        });
    };

    return CertificateParser;

  })();

  module.exports = CertificateParser;

}).call(this);
