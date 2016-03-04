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

os = require('os')
_ = require('lodash')

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

###*
# @summary Get operating system
# @function
# @protected
#
# @returns {String} operating system
#
# @example
# os = utils.getOperatingSystem()
###
exports.getOperatingSystem = ->
	platform = os.platform()

	switch platform
		when 'darwin' then 'osx'
		else platform
