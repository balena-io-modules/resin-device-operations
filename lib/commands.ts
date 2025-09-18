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

const Promise = require('bluebird');
const {
    EventEmitter
} = require('events');
const _ = require('lodash');
const fs = Promise.promisifyAll(require('fs'));
const child_process = require('child_process');
const path = require('path');
const imagefs = require('balena-image-fs');
const sdk = require('etcher-sdk');

const getDrive = drive => Promise.try(function() {
    if (_.isObject(drive) && drive.size && (drive.raw != null)) {
        return drive;
    }

    if (!_.isString(drive)) {
        throw new Error('Drive is not a string, nor an object with `raw` and `size` properties');
    }

    const adapter = new sdk.scanner.adapters.BlockDeviceAdapter({
        includeSystemDrives: () => false,
        unmountOnSuccess: false,
        write: true,
        direct: true,
    });
    const scanner = new sdk.scanner.Scanner([adapter]);
    return scanner.start().then(function() {
        try {
            const d = scanner.getBy('device', drive);
            if ((d === undefined) || !(d instanceof sdk.sourceDestination.BlockDevice)) {
                throw new Error(`Drive not found: ${drive}`);
            }
            return d;
        } finally {
            scanner.stop();
        }
    });
});

const normalizePartition = function(partition) {
	if (Number.isInteger(partition)) {
		return partition;
	} else {
		return partition.primary + (partition.logical || 0);
	}
};

const normalizeDefinition = function(definition) {
	const result = Object.assign({}, definition);
	if (definition.partition != null) {
		result.partition = normalizePartition(definition.partition);
	}
	return result;
};

module.exports = {

	copy(image, operation) {

		// Default image to the given path
		if (operation.from.image == null) { operation.from.image = image; }
		if (operation.to.image == null) { operation.to.image = image; }
		const fromDefinition = normalizeDefinition(operation.from);
		const toDefinition = normalizeDefinition(operation.to);

		return imagefs.interact(
			fromDefinition.image,
			fromDefinition.partition,
			function(_fs) {
				const readFileAsync = Promise.promisify(_fs.readFile);
				return readFileAsync(fromDefinition.path)
					.then(newContents => newContents.toString());
			}).then(content => imagefs.interact(
            toDefinition.image,
            toDefinition.partition,
            function(_fs) {
                const writeFileAsync = Promise.promisify(_fs.writeFile);
                return writeFileAsync(toDefinition.path, content);
        }));
	},

	replace(image, operation) {

		// Default image to the given path
		if (operation.file.image == null) { operation.file.image = image; }
		const fileDefinition = normalizeDefinition(operation.file);

		return imagefs.interact(
			fileDefinition.image,
			fileDefinition.partition,
			function(_fs) {
				const readFileAsync = Promise.promisify(_fs.readFile);
				const writeFileAsync = Promise.promisify(_fs.writeFile);
				return readFileAsync(fileDefinition.path)
					.then(function(contents) {
						const newContents = contents.toString().replace(operation.find, operation.replace);
						return writeFileAsync(fileDefinition.path, newContents);});
		});
	},

	'run-script'(image, operation) {

		operation.script = path.join(image, operation.script);
		if (operation.arguments == null) { operation.arguments = []; }

		return fs.chmodAsync(operation.script, 0o755).then(function() {
			return child_process.spawn(operation.script, operation.arguments, {

				// Some scripts rely on other executable
				// files within the same directory
				cwd: image,

				// Inherit stdio so we can interact with script.
				// We're not able to test this since stdin file
				// descriptor is not opened for writing when not
				// running the process in a tty.
				// Notice we pass `process.stdin` directly instead
				// of using 'inherit' since the latter one is
				// not supported in v0.10.
				stdio: [ process.stdin, 'pipe', 'pipe' ],
				shell: true
			}
			);
		});
	},

	burn(image, operation, options) {
		// Default image to the given path
		image = operation.image != null ? operation.image : image;
		const emitter = new EventEmitter();

		return Promise.try(function() {
			if (((options != null ? options.drive : undefined) == null)) {
				throw new Error('Missing drive option');
			}

			const file = new sdk.sourceDestination.File({
				path: image
			});
			return Promise.props({
				drive: getDrive(options.drive),
				source: file.getInnerSource()
			});}).then(function({ drive, source }) {
			const start = Date.now();
			let progressState = {
				transferred: 0
			};
			sdk.multiWrite.pipeSourceToDestinations({
				source,
				destinations: [drive],
				onFail(_, error) { return emitter.emit('error', error); },
				onProgress(progress) {
					let type = null;
					if (progress.type === 'flashing') {
						type = 'write';
					}
					if (progress.type === 'verifying') {
						type = 'check';
					}
					if ((type == null)) {
						return;
					}

					progress.type = type;
					progressState = {
						type,
						percentage: progress.percentage,
						transferred: progress.position,
						length: progress.bytes,
						remaining: progress.bytes - progress.position,
						eta: progress.eta,
						runtime: Date.now() - start,
						delta: progress.position - progressState.transferred,
						speed: progress.speed
					};
					return emitter.emit('progress', progressState);
				},
				verify: true,
			}).then(() => emitter.emit('end'));

			return emitter;
		});
	}
};
