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

/**
 * @module operations
 */

import { EventEmitter } from 'events';
import Promise from 'bluebird';
import rindle from 'rindle';
import * as _ from 'lodash';
import * as utils from './utils';
import * as action from './action';
import type { Operation } from './commands';

export interface OperationExecutionEvent extends EventEmitter {
	stdout?: EventEmitter;
	stderr?: EventEmitter;
}

/**
 * @summary Execute a set of operations over an image
 * @function
 * @public
 *
 * @description
 * This function returns an `EventEmitter` object that emits the following events:
 *
 * - `state (Object state)`: When an operation is going to be executed. The state object contains the `operation` and the progress `percentage` (0-100).
 * - `stdout (String data)`: When an operation prints to stdout.
 * - `stderr (String data)`: When an operation prints to stderr.
 * - `burn (String state)`: When the `burn` operation emits progress state.
 * - `error (Error error)`: When an error happens.
 * - `end`: When all the operations are completed successfully.
 *
 * @param {String} image - path to image
 * @param {Object[]} operations - array of operations
 * @param {Object} options - configuration options
 *
 * @returns {EventEmitter}
 *
 * @example
 * const execution = operations.execute(
 * 	'foo/bar.img',
 * 	[
 * 		{
 * 			command: 'copy',
 * 			from: {
 * 				partition: {
 * 					primary: 1
 * 				},
 * 				path: '/bitstreams/parallella_e16_headless_gpiose_7010.bit.bin'
 * 			},
 * 			to: {
 * 				partition: {
 * 					primary: 1
 * 				},
 * 				path: '/parallella.bit.bin'
 * 			},
 * 			when: {
 * 				coprocessorCore: '16',
 * 				processorType: 'Z7010'
 * 			}
 * 		},
 * 		{
 * 			command: 'copy',
 * 			from: {
 * 				partition: {
 * 					primary: 1
 * 				},
 * 				path: '/bistreams/parallella_e16_headless_gpiose_7020.bit.bin'
 * 			},
 * 			to: {
 * 				partition: {
 * 					primary: 1
 * 				},
 * 				path: '/parallella.bit.bin'
 * 			},
 * 			when: {
 * 				coprocessorCore: '16',
 * 				processorType: 'Z7020'
 * 			}
 * 		}
 * 	],
 * 	{
 * 		coprocessorCore: '16',
 * 		processorType: 'Z7010'
 * 	}
 * );
 *
 * execution.on('stdout', process.stdout.write);
 * execution.on('stderr', process.stderr.write);
 *
 * execution.on('state', function(state) {
 * 	console.log(state.operation.command);
 * 	console.log(state.percentage);
 * });
 *
 * execution.on('error', function(error) {
 * 	throw error;
 * });
 *
 * execution.on('end', () => console.log('Finished all operations'));
 */
export const execute = function(image: string, operations: Operation[], options?: { os?: string }): EventEmitter {
	options ??= {};
	options.os ??= utils.getOperatingSystem();

	const missingOptions = utils.getMissingOptions(operations, options);

	if (!_.isEmpty(missingOptions)) {
		throw new Error(`Missing options: ${missingOptions.join(', ')}`);
	}

	const emitter: EventEmitter & { ended?: boolean } = new EventEmitter();

	Promise.try(function() {
		operations = utils.filterWhenMatches(operations, options);
		const promises = _.map(operations, operation => action.run(image, operation, options));

		// There is an edge case where the event emitter instance
		// emits the `end` event before the client is able to
		// register a listener for it.
		const emitterOn = emitter.on;
		emitter.on = function(...args) {
			const [event, callback] = args;
			if ((event === 'end') && emitter.ended) {
				// Should this return 'emitterOn' to continue the 'this' chain as per the typings?
				return (callback as (...args: any[]) => unknown)();
			}
			return emitterOn.apply(emitter, args);
		};

		return Promise.delay(1).then(() => Promise.each(promises, function(promise, index) {
			const state = {
				operation: operations[index],
				percentage: action.getOperationProgress(index, operations)
			};

			emitter.emit('state', state);

			return promise().then(function(actionEvent: OperationExecutionEvent) {

				// Pipe stdout/stderr events
				if ((actionEvent == null)) {
					return;
				}
				if (actionEvent.stdout != null) {
					actionEvent.stdout.on('data', data => emitter.emit('stdout', data));
				}

				if (actionEvent.stderr != null) {
					actionEvent.stderr.on('data', data => emitter.emit('stderr', data));
				}

				// Emit burn command progress state as `burn`
				actionEvent.on('progress', stateEvent => emitter.emit('burn', stateEvent));

				return rindle.wait(actionEvent).spread(function(code: unknown) {
					// TODO: the number check is needed here because `rindle` is getting
					// the `{ sourceChecksum }` response that is otherwise treated as an error code
					// This hack is ugly and should be fixed in a better way.
					if (_.isNumber(code) && (code !== 0)) {
						throw new Error(`Exited with error code: ${code}`);
					}
				});
			});
		}));}).then(function() {
		emitter.emit('end');

		// Mark the emitter as ended.
		// Used to stub `emitter.on()` above.
		return emitter.ended = true;}).catch(error => emitter.emit('error', error));

	return emitter;
};
