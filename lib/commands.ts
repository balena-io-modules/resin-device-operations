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
EventEmitter = require('events').EventEmitter
_ = require('lodash')
fs = Promise.promisifyAll(require('fs'))
child_process = require('child_process')
path = require('path')
imagefs = require('balena-image-fs')
sdk = require('etcher-sdk')

getDrive = (drive) ->
	Promise.try ->
		if _.isObject(drive) and drive.size and drive.raw?
			return drive

		if not _.isString(drive)
			throw new Error('Drive is not a string, nor an object with `raw` and `size` properties')

		adapter = new sdk.scanner.adapters.BlockDeviceAdapter({
			includeSystemDrives: () => false,
			unmountOnSuccess: false,
			write: true,
			direct: true,
		});
		scanner = new sdk.scanner.Scanner([adapter]);
		scanner.start().then ->
			try
				d = scanner.getBy('device', drive);
				if d == undefined || !(d instanceof sdk.sourceDestination.BlockDevice)
					throw new Error("Drive not found: #{drive}")
				return d
			finally
				scanner.stop()

normalizePartition = (partition) ->
	if Number.isInteger(partition)
		return partition
	else
		return partition.primary + (partition.logical || 0)

normalizeDefinition = (definition) ->
	result = Object.assign({}, definition)
	if definition.partition?
		result.partition = normalizePartition(definition.partition)
	return result

module.exports =

	copy: (image, operation) ->

		# Default image to the given path
		operation.from.image ?= image
		operation.to.image ?= image
		fromDefinition = normalizeDefinition(operation.from)
		toDefinition = normalizeDefinition(operation.to)

		return imagefs.interact(
			fromDefinition.image
			fromDefinition.partition
			(_fs) ->
				readFileAsync = Promise.promisify(_fs.readFile)
				return readFileAsync(fromDefinition.path)
					.then (newContents) ->
						return newContents.toString()
			).then (content) ->
				return imagefs.interact(
					toDefinition.image
					toDefinition.partition
					(_fs) ->
						writeFileAsync = Promise.promisify(_fs.writeFile)
						return writeFileAsync(toDefinition.path, content)
				)

	replace: (image, operation) ->

		# Default image to the given path
		operation.file.image ?= image
		fileDefinition = normalizeDefinition(operation.file)

		return imagefs.interact(
			fileDefinition.image
			fileDefinition.partition
			(_fs) ->
				readFileAsync = Promise.promisify(_fs.readFile)
				writeFileAsync = Promise.promisify(_fs.writeFile)
				return readFileAsync(fileDefinition.path)
					.then (contents) ->
						newContents = contents.toString().replace(operation.find, operation.replace)
						return writeFileAsync(fileDefinition.path, newContents)
		)

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
				shell: true

	burn: (image, operation, options) ->
		# Default image to the given path
		image = operation.image ? image
		emitter = new EventEmitter()

		Promise.try ->
			if not options?.drive?
				throw new Error('Missing drive option')

			file = new sdk.sourceDestination.File({
				path: image
			})
			Promise.props
				drive: getDrive(options.drive)
				source: file.getInnerSource()
		.then ({ drive, source }) ->
			start = Date.now()
			progressState = {
				transferred: 0
			}
			sdk.multiWrite.pipeSourceToDestinations({
				source,
				destinations: [drive],
				onFail: (_, error) -> emitter.emit('error', error)
				onProgress: (progress) ->
					type = null
					if progress.type == 'flashing'
						type = 'write'
					if progress.type == 'verifying'
						type = 'check'
					if not type?
						return

					progress.type = type
					progressState = {
						type: type
						percentage: progress.percentage
						transferred: progress.position
						length: progress.bytes
						remaining: progress.bytes - progress.position
						eta: progress.eta
						runtime: Date.now() - start
						delta: progress.position - progressState.transferred
						speed: progress.speed
					}
					emitter.emit('progress', progressState)
				verify: true,
			}).then ->
				emitter.emit('end')

			emitter
