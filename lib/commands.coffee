###
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

				# Inherit stdio so we can interact with script.
				# We're not able to test this since stdin file
				# descriptor is not opened for writing when not
				# running the process in a tty.
				# Notice we pass `process.stdin` directly instead
				# of using 'inherit' since the latter one is
				# not supported in v0.10.
				stdio: [ process.stdin, 'pipe', 'pipe' ]

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
