
/*
The MIT License

Copyright (c) 2015 Resin.io, Inc. https://resin.io.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
 */
var Promise, child_process, imagefs, path;

Promise = require('bluebird');

child_process = require('child_process');

path = require('path');

imagefs = require('resin-image-fs');

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
    return Promise["try"](function() {
      return child_process.spawn(operation.script, operation["arguments"]);
    });
  }
};
