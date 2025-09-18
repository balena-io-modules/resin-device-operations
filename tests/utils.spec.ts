const m = require('mochainon');
const _ = require('lodash');
const os = require('os');
const {
    EventEmitter
} = require('events');
const utils = require('../lib/utils');

describe('Utils:', function() {

	describe('.filterWhenMatches()', function() {

		describe('given operations without a when property', function() {

			beforeEach(function() {
				return this.operations = [
					{command: 'foo'}
				,
					{command: 'bar'}
				];});

			return it('should return the same operations', function() {
				return m.chai.expect(utils.filterWhenMatches(this.operations)).to.deep.equal(this.operations);
			});
		});

		describe('given operations with a when property', function() {

			beforeEach(function() {
				return this.operations = [{
					command: 'foo',
					when: {
						hello: 'world'
					}
				}
				, {
					command: 'bar',
					when: {
						hello: 'planet'
					}
				}
				];});

			return it('should return the operatiosn what match the options', function() {
				const operations = utils.filterWhenMatches(this.operations, {hello: 'planet'});
				return m.chai.expect(operations).to.deep.equal([{
					command: 'bar',
					when: {
						hello: 'planet'
					}
				}
				]);
		});
	});

		return describe('given operations with a numbered when property', function() {

			beforeEach(function() {
				return this.operations = [{
					command: 'foo',
					when: {
						foo: 1
					}
				}
				, {
					command: 'bar',
					when: {
						foo: 2
					}
				}
				];});

			it('should be able to match using numbers', function() {
				const operations = utils.filterWhenMatches(this.operations, {foo: 1});
				return m.chai.expect(operations).to.deep.equal([{
					command: 'foo',
					when: {
						foo: 1
					}
				}
				]);
		});

			return it('should not be able to match using strings', function() {
				const operations = utils.filterWhenMatches(this.operations, {foo: '1'});
				return m.chai.expect(operations).to.deep.equal([]);
			});
		});
	});

	describe('.getMissingOptions()', function() {

		describe('given a single command operations', function() {

			beforeEach(function() {
				return this.operations = [{
					command: 'foo',
					when: {
						foo: 1
					}
				}
				];});

			it('should return a single item array if missing foo', function() {
				const result = utils.getMissingOptions(this.operations, {bar: 2});
				return m.chai.expect(result).to.deep.equal([ 'foo' ]);
			});

			it('should return a single item array if no options', function() {
				const result = utils.getMissingOptions(this.operations, null);
				return m.chai.expect(result).to.deep.equal([ 'foo' ]);
			});

			return it('should return an empty array if not missing anything', function() {
				const result = utils.getMissingOptions(this.operations, {foo: 2});
				return m.chai.expect(result).to.deep.equal([]);
			});
		});

		describe('given multiple command operations', function() {

			beforeEach(function() {
				return this.operations = [{
					command: 'foo',
					when: {
						foo: 1
					}
				}
				, {
					command: 'foo',
					when: {
						bar: 1,
						baz: 1
					}
				}
				];});

			it('should return a 3 items array if no options', function() {
				const result = utils.getMissingOptions(this.operations, {});
				return m.chai.expect(result).to.deep.equal([ 'foo', 'bar', 'baz' ]);
			});

			it('should return a 2 items array if one option exist', function() {
				const result = utils.getMissingOptions(this.operations, {bar: 4});
				return m.chai.expect(result).to.deep.equal([ 'foo', 'baz' ]);
			});

			return it('should return an empty array if not missing anything', function() {
				const result = utils.getMissingOptions(this.operations, {
					foo: 1,
					bar: 2,
					baz: 3
				}
				);
				return m.chai.expect(result).to.deep.equal([]);
			});
		});

		return describe('given multiple command operations asking for the same option', function() {

			beforeEach(function() {
				return this.operations = [{
					command: 'foo',
					when: {
						os: 'osx'
					}
				}
				, {
					command: 'foo',
					when: {
						os: 'linux'
					}
				}
				, {
					command: 'foo',
					when: {
						os: 'win32'
					}
				}
				];});

			return it('should return the missing option once', function() {
				const result = utils.getMissingOptions(this.operations, null);
				return m.chai.expect(result).to.deep.equal([ 'os' ]);
			});
		});
	});

	return describe('.getOperatingSystem()', function() {

		describe('given darwin', function() {

			beforeEach(function() {
				this.osPlatformStub = m.sinon.stub(os, 'platform');
				return this.osPlatformStub.returns('darwin');
			});

			afterEach(function() {
				return this.osPlatformStub.restore();
			});

			return it('should return osx', () => m.chai.expect(utils.getOperatingSystem()).to.equal('osx'));
		});

		describe('given win32', function() {

			beforeEach(function() {
				this.osPlatformStub = m.sinon.stub(os, 'platform');
				return this.osPlatformStub.returns('win32');
			});

			afterEach(function() {
				return this.osPlatformStub.restore();
			});

			return it('should return win32', () => m.chai.expect(utils.getOperatingSystem()).to.equal('win32'));
		});

		return describe('given linux', function() {

			beforeEach(function() {
				this.osPlatformStub = m.sinon.stub(os, 'platform');
				return this.osPlatformStub.returns('linux');
			});

			afterEach(function() {
				return this.osPlatformStub.restore();
			});

			return it('should return linux', () => m.chai.expect(utils.getOperatingSystem()).to.equal('linux'));
		});
	});
});
