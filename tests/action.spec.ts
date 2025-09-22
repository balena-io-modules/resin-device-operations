import Promise from 'bluebird';
import { expect, use as chaiUse } from 'chai';
import chaiAsPromised from 'chai-as-promised';
chaiUse(chaiAsPromised);
import action from '../build/action';
import commands from '../build/commands';

describe('Command:', function () {
	describe('.getOperationProgress()', () =>
		describe('given a set of three operation', function () {
			beforeEach(function () {
				return (this.operations = [
					{ command: 'first' },
					{ command: 'second' },
					{ command: 'third' },
				]);
			});

			it('should return 33.3 for the first one', function () {
				const percentage = action.getOperationProgress(0, this.operations);
				expect(percentage).to.equal(33.3);
			});

			it('should return 66.7 for the second one', function () {
				const percentage = action.getOperationProgress(1, this.operations);
				expect(percentage).to.equal(66.7);
			});

			it('should return 100 for the third one', function () {
				const percentage = action.getOperationProgress(2, this.operations);
				expect(percentage).to.equal(100);
			});
		}));

	describe('.run()', function () {
		it('should be rejected if the command type is invalid', () => {
			expect(() => action.run('foo/bar', { command: 'foobar' })).to.throw(
				'Unknown command: foobar',
			);
		});

		describe('given the command type exists', function () {
			beforeEach(() => (commands.foobar = () => Promise.resolve('hello')));

			afterEach(() => delete commands.foobar);

			it('should return a function to call the command', function () {
				const promise = action.run('foo/bar', { command: 'foobar' });

				return expect(promise()).to.eventually.equal('hello');
			});
		});
	});
});
