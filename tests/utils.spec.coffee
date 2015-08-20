m = require('mochainon')
_ = require('lodash')
Promise = require('bluebird')
EventEmitter = require('events').EventEmitter
utils = require('../lib/utils')

describe 'Utils:', ->

	describe '.waitStreamToClose()', ->

		describe 'given an object that emits a close event without an exit code', ->

			beforeEach ->
				@object = new EventEmitter()
				setTimeout =>
					@object.emit('close')
				, 100

			it 'should resolve the promise', ->
				m.chai.expect(utils.waitStreamToClose(@object)).to.be.resolved

		describe 'given an object that emits a close event with an exit code 0', ->

			beforeEach ->
				@object = new EventEmitter()
				setTimeout =>
					@object.emit('close', 0)
				, 100

			it 'should resolve the promise', ->
				m.chai.expect(utils.waitStreamToClose(@object)).to.be.resolved

		describe 'given an object that emits a close event with an exit code non 0', ->

			beforeEach ->
				@object = new EventEmitter()
				setTimeout =>
					@object.emit('close', 1)
				, 100

			it 'should resolve the promise', ->
				m.chai.expect(utils.waitStreamToClose(@object)).to.be.rejectedWith('Exitted with error code: 1')

		describe 'given an object that emits an end event', ->

			beforeEach ->
				@object = new EventEmitter()
				setTimeout =>
					@object.emit('end')
				, 100

			it 'should resolve the promise', ->
				m.chai.expect(utils.waitStreamToClose(@object)).to.be.resolved

		describe 'given an object that emits a done event', ->

			beforeEach ->
				@object = new EventEmitter()
				setTimeout =>
					@object.emit('done')
				, 100

			it 'should resolve the promise', ->
				m.chai.expect(utils.waitStreamToClose(@object)).to.be.resolved

		describe 'given an object that emits an error event', ->

			beforeEach ->
				@object = new EventEmitter()
				setTimeout =>
					@object.emit('error', new Error('event error'))
				, 100

			it 'should reject the promise with the error', ->
				promise = utils.waitStreamToClose(@object)
				m.chai.expect(promise).to.be.rejectedWith('event error')

	describe '.isObjectSubset()', ->

		describe 'given an object that is a subset of another object', ->

			beforeEach ->
				@object =
					foo: 'bar'
					bar: 'baz'

				@subset =
					foo: 'bar'

			it 'should return true', ->
				m.chai.expect(utils.isObjectSubset(@object, @subset)).to.be.true

		describe 'given an object that is not a subset of another object', ->

			beforeEach ->
				@object =
					foo: 'bar'
					bar: 'baz'

				@subset =
					foo: 'bar'
					bar: 'qux'

			it 'should return false', ->
				m.chai.expect(utils.isObjectSubset(@object, @subset)).to.be.false

		describe 'given a non empty object and an empty subset', ->

			beforeEach ->
				@object =
					foo: 'bar'
					bar: 'baz'

				@subset = {}

			it 'should return true', ->
				m.chai.expect(utils.isObjectSubset(@object, @subset)).to.be.true

		describe 'given an empty object and an empty subset', ->

			beforeEach ->
				@object = {}
				@subset = {}

			it 'should return true', ->
				m.chai.expect(utils.isObjectSubset(@object, @subset)).to.be.true

		describe 'given an empty object and a non empty subset', ->

			beforeEach ->
				@object = {}

				@subset =
					foo: 'bar'
					bar: 'baz'

			it 'should return false', ->
				m.chai.expect(utils.isObjectSubset(@object, @subset)).to.be.false

	describe '.filterWhenMatches()', ->

		describe 'given operations without a when property', ->

			beforeEach ->
				@operations = [
					command: 'foo'
				,
					command: 'bar'
				]

			it 'should return the same operations', ->
				m.chai.expect(utils.filterWhenMatches(@operations)).to.deep.equal(@operations)

		describe 'given operations with a when property', ->

			beforeEach ->
				@operations = [
					command: 'foo'
					when:
						hello: 'world'
				,
					command: 'bar'
					when:
						hello: 'planet'
				]

			it 'should return the operatiosn what match the options', ->
				operations = utils.filterWhenMatches(@operations, hello: 'planet')
				m.chai.expect(operations).to.deep.equal [
					command: 'bar'
					when:
						hello: 'planet'
				]

		describe 'given operations with a numbered when property', ->

			beforeEach ->
				@operations = [
					command: 'foo'
					when:
						foo: 1
				,
					command: 'bar'
					when:
						foo: 2
				]

			it 'should be able to match using numbers', ->
				operations = utils.filterWhenMatches(@operations, foo: 1)
				m.chai.expect(operations).to.deep.equal [
					command: 'foo'
					when:
						foo: 1
				]

			it 'should not be able to match using strings', ->
				operations = utils.filterWhenMatches(@operations, foo: '1')
				m.chai.expect(operations).to.deep.equal([])

	describe '.getMissingOptions()', ->

		describe 'given a single command operations', ->

			beforeEach ->
				@operations = [
					command: 'foo'
					when:
						foo: 1
				]

			it 'should return a single item array if missing foo', ->
				result = utils.getMissingOptions(@operations, bar: 2)
				m.chai.expect(result).to.deep.equal([ 'foo' ])

			it 'should return a single item array if no options', ->
				result = utils.getMissingOptions(@operations, null)
				m.chai.expect(result).to.deep.equal([ 'foo' ])

			it 'should return an empty array if not missing anything', ->
				result = utils.getMissingOptions(@operations, foo: 2)
				m.chai.expect(result).to.deep.equal([])

		describe 'given multiple command operations', ->

			beforeEach ->
				@operations = [
					command: 'foo'
					when:
						foo: 1
				,
					command: 'foo'
					when:
						bar: 1
						baz: 1
				]

			it 'should return a 3 items array if no options', ->
				result = utils.getMissingOptions(@operations, {})
				m.chai.expect(result).to.deep.equal([ 'foo', 'bar', 'baz' ])

			it 'should return a 2 items array if one option exist', ->
				result = utils.getMissingOptions(@operations, bar: 4)
				m.chai.expect(result).to.deep.equal([ 'foo', 'baz' ])

			it 'should return an empty array if not missing anything', ->
				result = utils.getMissingOptions @operations,
					foo: 1
					bar: 2
					baz: 3
				m.chai.expect(result).to.deep.equal([])
