
/*
Copyright 2016 Resin.io

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */
var Promise, child_process, fs, imageWrite, imagefs, path, zipImage;

Promise = require('bluebird');

fs = Promise.promisifyAll(require('fs'));

child_process = require('child_process');

path = require('path');

zipImage = require('resin-zip-image');

imagefs = require('resin-image-fs');

imageWrite = require('resin-image-write');

module.exports = {
  copy: function(image, operation) {
    var base, base1;
    if ((base = operation.from).image == null) {
      base.image = image;
    }
    if ((base1 = operation.to).image == null) {
      base1.image = image;
    }
    return imagefs.copy(operation.from, operation.to);
  },
  replace: function(image, operation) {
    var base;
    if ((base = operation.file).image == null) {
      base.image = image;
    }
    return imagefs.replace(operation.file, operation.find, operation.replace);
  },
  'run-script': function(image, operation) {
    operation.script = path.join(image, operation.script);
    if (operation["arguments"] == null) {
      operation["arguments"] = [];
    }
    return fs.chmodAsync(operation.script, 0x1ed).then(function() {
      return child_process.spawn(operation.script, operation["arguments"], {
        cwd: image,
        stdio: [process.stdin, 'pipe', 'pipe']
      });
    });
  },
  burn: function(image, operation, options) {
    if (operation.image == null) {
      operation.image = image;
    }
    return Promise["try"](function() {
      if ((options != null ? options.drive : void 0) == null) {
        throw new Error('Missing drive option');
      }
      if (zipImage.isZip(operation.image)) {
        if (!zipImage.isValidZipImage(operation.image)) {
          throw new Error('Invalid zip image');
        }
        return zipImage.extractImage(operation.image);
      } else {
        return fs.statAsync(operation.image).then(function(stat) {
          var imageReadStream;
          imageReadStream = fs.createReadStream(operation.image);
          if (imageReadStream.length == null) {
            imageReadStream.length = stat.size;
          }
          return imageReadStream;
        });
      }
    }).then(function(imageReadStream) {
      return imageWrite.write(options.drive, imageReadStream);
    });
  }
};
