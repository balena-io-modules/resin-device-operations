const m = require('mochainon');
const operations = require('../lib/operations');

describe('Operations:', () => describe('given a multiple command operation', function() {

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
                bar: 2
            }
        }
        ];});

    it('should throw an error if missing both options', function() {
        return m.chai.expect(() => {
            return operations.execute('foo.img', this.operations, {});
    }).to.throw('Missing options: foo, bar');
    });

    it('should throw an error if options is null', function() {
        return m.chai.expect(() => {
            return operations.execute('foo.img', this.operations, null);
    }).to.throw('Missing options: foo, bar');
    });

    return it('should throw an error if missing one option', function() {
        return m.chai.expect(() => {
            return operations.execute('foo.img', this.operations, {foo: 2});
    }).to.throw('Missing options: bar');
    });
}));
