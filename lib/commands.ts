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

import Promise from 'bluebird';
import { EventEmitter } from 'events';
import * as _ from 'lodash';
import fs from 'fs/promises';
import child_process from 'child_process';
import path from 'path';
import * as imagefs from 'balena-image-fs';
import * as sdk from 'etcher-sdk';
import type { AdapterSourceDestination } from 'etcher-sdk/build/scanner/adapters';

const getDrive = (drive: AdapterSourceDestination | string) => Promise.try(function() {
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

const normalizePartition = function(partition: NonNullable<DeviceTypeConfigurationConfig['partition']>) {
	if (typeof partition === 'number') {
		return partition;
	} else {
		return partition.primary + (partition.logical ?? 0);
	}
};

const normalizeDefinition = function<T extends DeviceTypeConfigurationConfig>(definition: T) {
	const result = {
		...definition,
		...(definition.partition != null && {
			partition: normalizePartition(definition.partition)
		})
	};
	return result;
};

export interface Operation {
	command: string;
	when?: object;
}

export interface DeviceTypeConfigurationConfig {
	/** eg "/config.json" */
	path: string;
	/** Only the intel-edison does NOT have this defined */
	partition?: number | {
		primary: number;
		logical?: number;
	};
	/** I only found this in the intel-edison eg "my/rpi.img" */
	image?: string;
}

export type DeviceTypeConfigurationConfigWithImage = DeviceTypeConfigurationConfig & Required<Pick<DeviceTypeConfigurationConfig, 'image'>>

export interface CopyOperation extends Operation {
	command: 'copy';
	from: DeviceTypeConfigurationConfig;
	to: DeviceTypeConfigurationConfig;
}

export interface ReplaceOperation extends Operation {
	command: 'replace';
	copy: string;
	find: string;
	replace: string;
	file: {
		path: string;
		// Set by commands
		image?: string;
	};
}

export interface RunScriptOperation extends Operation {
	command: 'run-script';
	script: string;
	arguments?: string[];
}

export interface BurnOperation extends Operation {
	command: 'burn';
	image?: string;
}

export const commands = {
	copy(image: string, operation: CopyOperation) {
		// Default image to the given path
		operation.from.image ??= image;
		operation.to.image ??= image;
		const fromDefinition = normalizeDefinition(operation.from as typeof operation.from & Required<Pick<typeof operation.from, 'image'>>);
		const toDefinition = normalizeDefinition(operation.to as typeof operation.to & Required<Pick<typeof operation.to, 'image'>>);

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

	replace(image: string, operation: ReplaceOperation) {
		// Default image to the given path
		operation.file.image ??= image;
		const fileDefinition = normalizeDefinition(operation.file as typeof operation.file & Required<Pick<typeof operation.file, 'image'>>);

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

	'run-script'(image: string, operation: RunScriptOperation) {

		operation.script = path.join(image, operation.script);
		const operationArguments = operation.arguments ??= [];

		return fs.chmod(operation.script, 0o755).then(function() {
			return child_process.spawn(operation.script, operationArguments , {

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

	burn(image: string, operation: BurnOperation, options?: { drive: AdapterSourceDestination | string }) {
		// Default image to the given path
		image = operation.image ?? image;
		const emitter = new EventEmitter();

		return Promise.try(function() {
			if (((options?.drive) == null)) {
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
			let transferred = 0;
			void sdk.multiWrite.pipeSourceToDestinations({
				source,
				destinations: [drive],
				onFail(_dest, error) { return emitter.emit('error', error); },
				onProgress(progress) {
					let type = null;
					if (progress.type === 'flashing') {
						type = 'write' as const;
					}
					if (progress.type === 'verifying') {
						type = 'check' as const;
					}
					if ((type == null)) {
						return;
					}

					progress.type = type as typeof progress.type;
					const progressState = {
						type,
						percentage: progress.percentage,
						transferred: progress.position,
						length: progress.bytes,
						remaining: progress.bytes - progress.position,
						eta: progress.eta,
						runtime: Date.now() - start,
						delta: progress.position - transferred,
						speed: progress.speed
					};
					transferred = progressState.transferred;
					return emitter.emit('progress', progressState);
				},
				verify: true,
			}).then(() => emitter.emit('end'));

			return emitter;
		});
	}
};
