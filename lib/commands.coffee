###
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
###

Promise = require('bluebird')
fs = Promise.promisifyAll(require('fs'))
child_process = require('child_process')
path = require('path')
imagefs = require('resin-image-fs')
imageWrite = require('resin-image-write')

module.exports =

	copy: (image, operation) ->

		# Default image to the given path
		operation.from.image ?= image
		operation.to.image ?= image

		return imagefs.copy(operation.from, operation.to)

	replace: (image, operation) ->

		# Default image to the given path
		operation.file.image ?= image

		return imagefs.replace(operation.file, operation.find, operation.replace)

	'run-script': (image, operation) ->

		operation.script = path.join(image, operation.script)
		operation.arguments ?= []

		fs.chmodAsync(operation.script, 0o755).then ->
			return child_process.spawn operation.script, operation.arguments,

				# Some scripts rely on other executable
				# files within the same directory
				cwd: image

	burn: (image, operation, options) ->

		# Default image to the given path
		operation.image ?= image

		Promise.try ->
			if not options?.drive?
				throw new Error('Missing drive option')

			return operation.image
		.then(fs.statAsync).get('size')
		.then (size) ->
			imageReadStream = fs.createReadStream(operation.image)

			# This is read by Resin Image Write to
			# emit correct `progress` events.
			imageReadStream.length ?= size

			return imageWrite.write(options.drive, imageReadStream)
