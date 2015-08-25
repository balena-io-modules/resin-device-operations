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

###*
# @summary Wait for a writable stream to be closed
# @function
# @protected
#
# @param {WriteStream} stream - writable stream
# @returns {Promise}
#
# @example
# stream = fs.createReadStream('foo').pipe(fs.createWriteStream('bar'))
# utils.waitStreamToClose(stream).then ->
# 	console.log('The stream finished piping')
###
exports.waitStreamToClose = (stream) ->
	return new Promise (resolve, reject) ->
		stream.on('error', reject)
		stream.on('end', resolve)
		stream.on('done', resolve)
		stream.on 'close', (code) ->
			if code? and code isnt 0
				return reject(new Error("Exitted with error code: #{code}"))
			return resolve()

###*
# @summary Determine if an object is a subset of another object
# @function
# @protected
#
# @param {Object} object - source object
# @param {Object} subset - object to determine if its a subset of the other object
#
# @returns {Boolean} whether the object is a subset of the other
#
# @example
# utils.isObjectSubset
# 	foo: 'bar'
# 	bar: 'baz'
# ,
# 	foo: 'bar'
# > true
###
exports.isObjectSubset = (object, subset) ->

	# An empty object is a subset of every object
	return true if object? and _.isEmpty(subset)

	return _.findWhere([ object ], subset)?

###*
# @summary Filter operations based on when properties
# @function
# @protected
#
# @description
# This function discards the operations that don't match given certain options.
#
# @param {Object[]} operations - array of operations
# @param {Object} options - configuration options
#
# @returns {Object[]} filtered operations
#
# @example
# operations = utils.filterWhenMatches [
# 	command: 'foo'
# 	when:
# 		name: 'john'
# ,
# 	command: 'bar'
# 	when:
# 		name: 'jane'
# ],
# 	name: 'john'
###
exports.filterWhenMatches = (operations, options = {}) ->
	return _.filter operations, (operation) ->
		return exports.isObjectSubset(options, operation.when)

###*
# @summary Get missing options from operations `when` properties
# @function
# @protected
#
# @param {Object[]} operations - array of operations
# @param {Object} options - configuration options
#
# @returns {String[]} missing options
#
# @example
# missingOptions = utils.getMissingOptions [
# 	command: 'foo'
# 	when:
# 		foo: 1
# ],
# 	bar: 2
#
# console.log(missingOptions)
# > [ 'foo' ]
###
exports.getMissingOptions = (operations, options = {}) ->
	usedOptions = _.flatten(_.map(_.pluck(operations, 'when'), _.keys))
	return _.uniq(_.difference(usedOptions, _.keys(options)))
