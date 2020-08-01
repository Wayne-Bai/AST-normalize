/* jshint node: true */

describe('rxLocalStorage', function () {
    var storage;

    beforeEach(function () {
        module('encore.ui.rxLocalStorage');
        inject(function (LocalStorage) {
            storage = LocalStorage;
        });
    });

    afterEach(function () {
        storage.clear();
    });

    it('LocalStorage should exist', function () {
        expect(storage).to.exist;
    });

    it('LocalStorage should be empty after clear', function () {
        storage.setItem('Joker', 'Harley quinn');
        expect(storage.length).to.be.eq(1);
        storage.clear();
        expect(storage.length).to.be.eq(0);
    });

    it('LocalStorage should be able to retrieve the key for an item', function () {
        storage.setItem('joker', 'robin');
        expect(storage.key(0)).not.be.empty;
        expect(storage.key(0)).to.be.eq('joker');
    });

    it('LocalStorage should be able to set/get a value in Local storage', function () {
        storage.setItem('joker', 'harley');
        expect(storage.length).to.be.eq(1);
        expect(storage.getItem('joker')).to.be.eq('harley');
    });

    it('LocalStorage should be able to set/get objects in Local storage', function () {
        var joker = { name: 'joker', realName: 'Jack' };
        storage.setObject('villan', joker);
        expect(storage.length).to.be.eq(1);
        expect(storage.getObject('villan')).to.deep.eq(joker);
    });

    it('LocalStorage should be able to set/get arrays in Local storage', function () {
        var villans = [ { name: 'joker' }, { name: 'penguin' } ];
        storage.setObject('villans', villans);
        expect(storage.length).to.be.eq(1);
        expect(storage.getObject('villans')).to.deep.eq(villans);
    });

    it('LocalStorage should be able to remove item by key name', function () {
        storage.setItem('poison', 'ivy');
        expect(storage.length).to.eq(1);
        storage.removeItem('poison');
        expect(storage.length).to.eq(0);
    });

    it('LocalStorage should return null for non-existent keys', function () {
        expect(storage.getItem('someRandomKeyThatDoesNotExist')).to.be.null;
    });
});
