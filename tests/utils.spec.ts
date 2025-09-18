import * as _ from 'lodash';
import { expect } from 'chai';
import * as sinon from 'sinon';
import os from 'os';
import utils from '../build/utils';

describe('Utils:', function() {

	describe('.filterWhenMatches()', function() {

		describe('given operations without a when property', function() {

			beforeEach(function() {
				return this.operations = [
					{command: 'foo'}
				,
					{command: 'bar'}
				];});

			it('should return the same operations', function() {
				expect(utils.filterWhenMatches(this.operations)).to.deep.equal(this.operations);
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

			it('should return the operatiosn what match the options', function() {
				const operations = utils.filterWhenMatches(this.operations, {hello: 'planet'});
				expect(operations).to.deep.equal([{
					command: 'bar',
					when: {
						hello: 'planet'
					}
				}
				]);
		});
	});

		describe('given operations with a numbered when property', function() {

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
				expect(operations).to.deep.equal([{
					command: 'foo',
					when: {
						foo: 1
					}
				}
				]);
		});

			it('should not be able to match using strings', function() {
				const operations = utils.filterWhenMatches(this.operations, {foo: '1'});
				expect(operations).to.deep.equal([]);
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
				expect(result).to.deep.equal([ 'foo' ]);
			});

			it('should return a single item array if no options', function() {
				const result = utils.getMissingOptions(this.operations, null);
				expect(result).to.deep.equal([ 'foo' ]);
			});

			it('should return an empty array if not missing anything', function() {
				const result = utils.getMissingOptions(this.operations, {foo: 2});
				expect(result).to.deep.equal([]);
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
				expect(result).to.deep.equal([ 'foo', 'bar', 'baz' ]);
			});

			it('should return a 2 items array if one option exist', function() {
				const result = utils.getMissingOptions(this.operations, {bar: 4});
				expect(result).to.deep.equal([ 'foo', 'baz' ]);
			});

			it('should return an empty array if not missing anything', function() {
				const result = utils.getMissingOptions(this.operations, {
					foo: 1,
					bar: 2,
					baz: 3
				}
				);
				expect(result).to.deep.equal([]);
			});
		});

		describe('given multiple command operations asking for the same option', function() {

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

			it('should return the missing option once', function() {
				const result = utils.getMissingOptions(this.operations, null);
				expect(result).to.deep.equal([ 'os' ]);
			});
		});
	});

	describe('.getOperatingSystem()', function() {

		describe('given darwin', function() {

			beforeEach(function() {
				this.osPlatformStub = sinon.stub(os, 'platform');
				return this.osPlatformStub.returns('darwin');
			});

			afterEach(function() {
				return this.osPlatformStub.restore();
			});

			it('should return osx', () => expect(utils.getOperatingSystem()).to.equal('osx'));
		});

		describe('given win32', function() {

			beforeEach(function() {
				this.osPlatformStub = sinon.stub(os, 'platform');
				return this.osPlatformStub.returns('win32');
			});

			afterEach(function() {
				return this.osPlatformStub.restore();
			});

			it('should return win32', () => expect(utils.getOperatingSystem()).to.equal('win32'));
		});

		describe('given linux', function() {

			beforeEach(function() {
				this.osPlatformStub = sinon.stub(os, 'platform');
				return this.osPlatformStub.returns('linux');
			});

			afterEach(function() {
				return this.osPlatformStub.restore();
			});

			it('should return linux', () => expect(utils.getOperatingSystem()).to.equal('linux'));
		});
	});
});
