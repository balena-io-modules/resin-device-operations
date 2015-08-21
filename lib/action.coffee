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
_ = require('lodash')
commands = require('./commands')

###*
# @summary Get percentage progress of an operation
# @function
# @protected
#
# @param {Number} index - operation index
# @param {Object[]} operations - all operations
#
# @returns {Number} percentage from 0-100
#
# @example
# percentage = action.getOperationProgress 0, [
# 	command: 'copy'
# 	...
# ,
# 	command: 'replace'
# 	...
# ,
# 	command: 'copy'
# 	...
# ]
###
exports.getOperationProgress = (index, operations) ->
	progress = (index + 1) / operations.length * 100
	return parseFloat(progress.toFixed(1))

###*
# @summary Run a single operation command
# @function
# @protected
#
# @param {String} image - path to image
# @param {Object} operation - command operation
#
# @returns {Promise}
#
# @example
# action.run 'foo/bar',
# 	command: 'copy'
# 	from:
# 		partition:
# 			primary: 1
# 		path: '/foo'
# 	to:
# 		partition:
# 			primary: 4
# 			logical: 1
# 		path: '/bar'
###
exports.run = (image, operation, options) ->
	action = commands[operation.command]

	if not action?
		throw new Error("Unknown command: #{operation.command}")

	return _.partial(action, image, operation, options)
