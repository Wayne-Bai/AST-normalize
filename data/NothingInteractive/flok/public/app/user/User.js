/**
 * @copyright  Nothing Interactive 2014
 * @author     Tobias Leugger <vibes@nothing.ch>
 */
angular.module('flokModule').service('User', [function() {
    'use strict';

    /**
     * Represents a Flok user
     *
     * @param {object} jsonData Data to initialize the user with
     * @constructor
     * @exports flokModule/User
     */
    function User(jsonData) {
        this.id = undefined;
        this.email = undefined;

        // Extend with the data from the backend
        angular.extend(this, jsonData);

        // TODO: temporary hack to get a displayable name
        this.nickname = this.email[0].toUpperCase() + this.email.substr(1, this.email.indexOf('@') - 1).toLowerCase();

        // TODO: temporary hack to get a user avatar picture
        this.avatarUrl = '/media/avatar/' + this.nickname.toLowerCase() + '.png';
    }

    return User;
}]);
