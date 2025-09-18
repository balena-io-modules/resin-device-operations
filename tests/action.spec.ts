const m = require('mochainon');
const Promise = require('bluebird');
const action = require('../lib/action');
const commands = require('../lib/commands');

describe('Command:', function() {

	describe('.getOperationProgress()', () => describe('given a set of three operation', function() {

        beforeEach(function() {
            return this.operations = [
                { command: 'first' },
                { command: 'second' },
                { command: 'third' }
            ];});

        it('should return 33.3 for the first one', function() {
            const percentage = action.getOperationProgress(0, this.operations);
            return m.chai.expect(percentage).to.equal(33.3);
        });

        it('should return 66.7 for the second one', function() {
            const percentage = action.getOperationProgress(1, this.operations);
            return m.chai.expect(percentage).to.equal(66.7);
        });

        return it('should return 100 for the third one', function() {
            const percentage = action.getOperationProgress(2, this.operations);
            return m.chai.expect(percentage).to.equal(100);
        });
    }));

	return describe('.run()', function() {

		it('should be rejected if the command type is invalid', () => m.chai.expect(() => action.run('foo/bar',
        {command: 'foobar'})).to.throw('Unknown command: foobar'));

		return describe('given the command type exists', function() {

			beforeEach(() => commands.foobar = () => Promise.resolve('hello'));

			afterEach(() => delete commands.foobar);

			return it('should return a function to call the command', function() {
				const promise = action.run('foo/bar',
					{command: 'foobar'});

				return m.chai.expect(promise()).to.eventually.equal('hello');
			});
		});
	});
});
