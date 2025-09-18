m = require('mochainon')
operations = require('../lib/operations')

describe 'Operations:', ->

	describe 'given a multiple command operation', ->

		beforeEach ->
			@operations = [
				command: 'foo'
				when:
					foo: 1
			,
				command: 'foo'
				when:
					bar: 2
			]

		it 'should throw an error if missing both options', ->
			m.chai.expect =>
				operations.execute('foo.img', @operations, {})
			.to.throw('Missing options: foo, bar')

		it 'should throw an error if options is null', ->
			m.chai.expect =>
				operations.execute('foo.img', @operations, null)
			.to.throw('Missing options: foo, bar')

		it 'should throw an error if missing one option', ->
			m.chai.expect =>
				operations.execute('foo.img', @operations, foo: 2)
			.to.throw('Missing options: bar')
