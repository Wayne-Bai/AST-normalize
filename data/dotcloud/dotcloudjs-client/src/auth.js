/**
    Sub-module providing the authentication API. 

    @name dotcloud.auth
    @namespace
*/
define(function(require) {
    return function(config, io) {
        return {
            /**
                Register a new user in the user database

                @public
                @function
                @name dotcloud.auth#register
                @param {String} user username
                @param {String} password Password
                @param {String} password2 Password verification
                @param {Function} cb Callback function
                @example
dotcloud.auth.register('shin', 's3cur3', 's3cur3', function(err, registered) {
    if (err)
        console.log('An error occured when registering', err);
    else if (!registered)
        console.log('This username is already taken');
    else
        console.log('Successfully registered');
});

            */
            register: function(user, password, password2, cb) {
                if (password !== password2)
                    return cb({ error: 'Passwords do not match.' });
                io.call('auth', 'register')(user, password, cb);
            },

            /**
                Login/authenticate against user database

                @public
                @function
                @name dotcloud.auth#login
                @param {String} user Username
                @param {String} password Password
                @param {Function} cb Callback function
                @example
dotcloud.auth.login('shin', 's3cur3', function(err, success) {
    if (err)
        console.log('An error occured while logging in', err);
    else if (!success)
        console.log('Username doesn\'t exist or password is invalid');
    else
        console.log('Logged in!');
});
            */
            login: function(user, password, cb) {
                io.call('_stackio', 'login')(user, password, cb);
            },
            /**
                Log out, destroying the current session

                @public
                @function
                @name dotcloud.auth#logout
                @param {Function} cb Callback function
            */
            logout: function(cb) {
                io.call('auth', 'logout')(cb);
            },
            /**
                Check the availability of the username provided as argument.

                @public
                @function
                @name dotcloud.auth#checkAvailable
                @param {String} user Username
                @param {Function} cb Callback function
                @example
dotcloud.auth.checkAvailable('shin', function(err, available) {
    if (err) {
        console.log('An error occured:', err);
    } else {
        console.log('Username is available: ', available);
    }
});
            */
            checkAvailable: function(user, cb) {
                io.call('auth', 'hasUser')(user, function(err, hasUser) {
                    return cb(err, !hasUser);
                });
            }
        }
    }
});