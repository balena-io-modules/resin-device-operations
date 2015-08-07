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
fs = require('fs')
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

		Promise.try ->
			spawn = child_process.spawn(operation.script, operation.arguments)

			spawn.stdout.on 'data', (data) ->
				return spawn.emit('run-script:stdout', data)

			spawn.stderr.on 'data', (data) ->
				return spawn.emit('run-script:stderr', data)

			return spawn

	burn: (image, operation, options) ->

		# Default image to the given path
		operation.image ?= image

		Promise.try ->
			throw new Error('Missing drive option') if not options.drive?
			imageStream = fs.createReadStream(operation.image)
			emitter = imageWrite.write(options.drive, imageStream)

			emitter.on 'progress', (state) ->
				return emitter.emit('burn:progress', state)

			return emitter
