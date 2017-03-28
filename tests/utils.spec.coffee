m = require('mochainon')
_ = require('lodash')
os = require('os')
EventEmitter = require('events').EventEmitter
utils = require('../lib/utils')

describe 'Utils:', ->

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

		describe 'given multiple command operations asking for the same option', ->

			beforeEach ->
				@operations = [
					command: 'foo'
					when:
						os: 'osx'
				,
					command: 'foo'
					when:
						os: 'linux'
				,
					command: 'foo'
					when:
						os: 'win32'
				]

			it 'should return the missing option once', ->
				result = utils.getMissingOptions(@operations, null)
				m.chai.expect(result).to.deep.equal([ 'os' ])

	describe '.getOperatingSystem()', ->

		describe 'given darwin', ->

			beforeEach ->
				@osPlatformStub = m.sinon.stub(os, 'platform')
				@osPlatformStub.returns('darwin')

			afterEach ->
				@osPlatformStub.restore()

			it 'should return osx', ->
				m.chai.expect(utils.getOperatingSystem()).to.equal('osx')

		describe 'given win32', ->

			beforeEach ->
				@osPlatformStub = m.sinon.stub(os, 'platform')
				@osPlatformStub.returns('win32')

			afterEach ->
				@osPlatformStub.restore()

			it 'should return win32', ->
				m.chai.expect(utils.getOperatingSystem()).to.equal('win32')

		describe 'given linux', ->

			beforeEach ->
				@osPlatformStub = m.sinon.stub(os, 'platform')
				@osPlatformStub.returns('linux')

			afterEach ->
				@osPlatformStub.restore()

			it 'should return linux', ->
				m.chai.expect(utils.getOperatingSystem()).to.equal('linux')
