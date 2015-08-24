
/*
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
 */

/**
 * @module operations
 */
var EventEmitter, Promise, _, action, utils;

EventEmitter = require('events').EventEmitter;

Promise = require('bluebird');

_ = require('lodash');

_.str = require('underscore.string');

utils = require('./utils');

action = require('./action');


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
 * execution = operations.execute 'foo/bar.img', [
 * 	command: 'copy'
 * 	from:
 * 		partition:
 * 			primary: 1
 * 		path: '/bitstreams/parallella_e16_headless_gpiose_7010.bit.bin'
 * 	to:
 * 		partition:
 * 			primary: 1
 * 		path: '/parallella.bit.bin'
 * 	when:
 * 		coprocessorCore: '16'
 * 		processorType: 'Z7010'
 * ,
 * 	command: 'copy'
 * 	from:
 * 		partition:
 * 			primary: 1
 * 		path: '/bistreams/parallella_e16_headless_gpiose_7020.bit.bin'
 * 	to:
 * 		partition:
 * 			primary: 1
 * 		path: '/parallella.bit.bin'
 * 	when:
 * 		coprocessorCore: '16'
 * 		processorType: 'Z7020'
 * ],
 * 	coprocessorCore: '16'
 * 	processorType: 'Z7010'
 *
 * execution.on('stdout', process.stdout.write)
 * execution.on('stderr', process.stderr.write)
 *
 * execution.on 'state', (state) ->
 * 	console.log(state.operation.command)
 * 	console.log(state.percentage)
 *
 * execution.on 'error', (error) ->
 * 	throw error
 *
 * execution.on 'end', ->
 * 	console.log('Finished all operations')
 */

exports.execute = function(image, operations, options) {
  var emitter, missingOptions;
  missingOptions = utils.getMissingOptions(operations, options);
  if (!_.isEmpty(missingOptions)) {
    throw new Error("Missing options: " + (_.str.toSentence(missingOptions)));
  }
  emitter = new EventEmitter();
  Promise["try"](function() {
    var emitterOn, promises;
    operations = utils.filterWhenMatches(operations, options);
    promises = _.map(operations, function(operation) {
      return action.run(image, operation, options);
    });
    emitterOn = emitter.on;
    emitter.on = function(event, callback) {
      if (event === 'end' && emitter.ended) {
        return callback();
      }
      return emitterOn.apply(emitter, arguments);
    };
    return Promise.delay(1).then(function() {
      return Promise.each(promises, function(promise, index) {
        var state;
        state = {
          operation: operations[index],
          percentage: action.getOperationProgress(index, operations)
        };
        emitter.emit('state', state);
        return promise().then(function(actionEvent) {
          var ref, ref1;
          if ((ref = actionEvent.stdout) != null) {
            ref.on('data', function(data) {
              return emitter.emit('stdout', data);
            });
          }
          if ((ref1 = actionEvent.stderr) != null) {
            ref1.on('data', function(data) {
              return emitter.emit('stderr', data);
            });
          }
          actionEvent.on('progress', function(state) {
            return emitter.emit('burn', state);
          });
          return utils.waitStreamToClose(actionEvent);
        });
      });
    });
  }).then(function() {
    emitter.emit('end');
    return emitter.ended = true;
  })["catch"](function(error) {
    return emitter.emit('error', error);
  });
  return emitter;
};
