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

import * as _ from 'lodash';
import { commands, type Operation } from './commands';

/**
 * @summary Get percentage progress of an operation
 * @function
 * @protected
 *
 * @param {Number} index - operation index
 * @param {Object[]} operations - all operations
 *
 * @returns {Number} percentage from 0-100
 *
 * @example
 * const percentage = action.getOperationProgress(
 * 	0,
 * 	[
 * 		{
 * 			command: 'copy',
 * 			// ...
 * 		},
 * 		{
 * 			command: 'replace',
 * 			// ...
 * 		},
 * 		{
 * 			command: 'copy',
 * 			// ...
 * 		},
 * 	],
 * );
 */
export const getOperationProgress = function(index: number, operations: Operation[]) {
	const progress = ((index + 1) / operations.length) * 100;
	return parseFloat(progress.toFixed(1));
};

/**
 * @summary Run a single operation command
 * @function
 * @protected
 *
 * @param {String} image - path to image
 * @param {Object} operation - command operation
 *
 * @returns {Promise}
 *
 * @example
 * action.run('foo/bar', {
 * 	command: 'copy',
 * 	from: {
 * 		partition: {
 * 			primary: 1
 * 		},
 * 		path: '/foo',
 * 	},
 * 	to: {
 * 		partition: {
 * 			primary: 4,
 * 			logical: 1
 * 		},
 * 		path: '/bar',
 * 	},
 * });
 */
export const run = function(image: string, operation: Operation, options: object) {
	const action = commands[operation.command as keyof typeof commands];

	if ((action == null)) {
		throw new Error(`Unknown command: ${operation.command}`);
	}

	return _.partial(action, image, operation, options);
};
