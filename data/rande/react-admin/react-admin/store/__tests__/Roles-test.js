jest.dontMock('../Roles.jsx');
jest.dontMock('lodash');
jest.dontMock('reflux');

describe('Roles', function () {
    it('Test role', function () {
        var Roles = require('../Roles.jsx');

        var store = Roles.Store;

        store.addRole("ADMIN");

        expect(store.hasRole(["SUPER_ADMIN"])).toEqual(false);
        expect(store.hasRole(["ADMIN"])).toEqual(true);
        expect(store.hasRole([])).toEqual(true);
        expect(store.hasRole()).toEqual(true);
        expect(store.hasRole(undefined)).toEqual(true);
    });
});
