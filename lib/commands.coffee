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
child_process = require('child_process')
path = require('path')
imagefs = require('resin-image-fs')
utils = require('./utils')

module.exports =

	copy: (image, operation) ->

		# Default image to the given path
		operation.from.image ?= image
		operation.to.image ?= image

		return imagefs.copy(operation.from, operation.to)
			.then(utils.waitStreamToClose)

	replace: (image, operation) ->

		# Default image to the given path
		operation.file.image ?= image

		return imagefs.replace(operation.file, operation.find, operation.replace)
			.then(utils.waitStreamToClose)

	'run-script': (image, operation) ->

		operation.script = path.join(image, operation.script)
		operation.arguments ?= []

		Promise.try ->
			script = child_process.spawn(operation.script, operation.arguments)

			# Pipe to stdout/stderr manually instead of using
			# stdio: 'inherit' since with the latter approach
			# we're unable to intercept stdio from the unit tests.
			script.stdout.on('data', process.stdout.write)
			script.stderr.on('data', process.stderr.write)

			return utils.waitStreamToClose(script)
