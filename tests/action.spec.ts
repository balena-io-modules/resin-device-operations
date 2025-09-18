m = require('mochainon')
Promise = require('bluebird')
action = require('../lib/action')
commands = require('../lib/commands')

describe 'Command:', ->

	describe '.getOperationProgress()', ->

		describe 'given a set of three operation', ->

			beforeEach ->
				@operations = [
					{ command: 'first' }
					{ command: 'second' }
					{ command: 'third' }
				]

			it 'should return 33.3 for the first one', ->
				percentage = action.getOperationProgress(0, @operations)
				m.chai.expect(percentage).to.equal(33.3)

			it 'should return 66.7 for the second one', ->
				percentage = action.getOperationProgress(1, @operations)
				m.chai.expect(percentage).to.equal(66.7)

			it 'should return 100 for the third one', ->
				percentage = action.getOperationProgress(2, @operations)
				m.chai.expect(percentage).to.equal(100)

	describe '.run()', ->

		it 'should be rejected if the command type is invalid', ->
			m.chai.expect ->
				action.run 'foo/bar',
				command: 'foobar'
			.to.throw('Unknown command: foobar')

		describe 'given the command type exists', ->

			beforeEach ->
				commands.foobar = ->
					return Promise.resolve('hello')

			afterEach ->
				delete commands.foobar

			it 'should return a function to call the command', ->
				promise = action.run 'foo/bar',
					command: 'foobar'

				m.chai.expect(promise()).to.eventually.equal('hello')
