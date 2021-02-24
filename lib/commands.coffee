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
_ = require('lodash')
fs = Promise.promisifyAll(require('fs'))
child_process = require('child_process')
path = require('path')
imagefs = require('balena-image-fs')
imageWrite = require('etcher-image-write')
driveList = require('drivelist')

normalizeDrive = (drive) ->
	Promise.try ->
		if _.isObject(drive) and drive.size and drive.raw?
			return drive

		if not _.isString(drive)
			throw new Error('Drive is not a string, nor an object with `raw` and `size` properties')


		driveList.list().then (drives) ->
			foundDrive = _.find(drives, device: drive)
			if not foundDrive?
				throw new Error("Drive not found: #{drive}")
			return foundDrive
	.then (drive) ->
		Promise.props
			fd: fs.openAsync(drive.raw, 'rs+')
			device: drive.raw
			size: drive.size

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
						Bluebird = require('bluebird')
						writeFileAsync = Bluebird.promisify(_fs.writeFile)
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

		Promise.try ->
			if not options?.drive?
				throw new Error('Missing drive option')

			Promise.props
				drive: normalizeDrive(options.drive)
				imageSize: fs.statAsync(image).get('size')
				imageStream: fs.createReadStream(image)
		.then ({ drive, imageStream, imageSize }) ->
			imageWrite.write drive,
				stream: imageStream
				size: imageSize
			,
				check: true
