/**
 * passport strategy
 * Springload - 2014
 *
 **/

var LocalStrategy = require('passport-local').Strategy;
var LocalAPIKeyStrategy = require('passport-localapikey').Strategy;


module.exports = function (application) {

    // serialize sessions
    var db = application.db,
        utils = application.lib.utils,
        passport = application.passport;

            passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        db.users.getById(id, function (err, results) {
            done(err, results);
        });
    });


    // use local strategy
    passport.use(new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
        function (req, email, password, done) {
            db.users.find({where: { email: email }})
                .success(function (item) {
                    if (item) {
                        if (!utils.authenticate(password, item)) {

                            if (item.allow_access_key && req.body.access == item.access_key) {
                                return done(null, item);
                            }
                            return done(null, false, { type: "error", message: 'Invalid password' })

                        }
                        return done(null, item);
                    } else {
                        return done(null, false, { type: "message", message: 'Unknown user' })
                    }
                })
                .error(function (error) {
                    return done({
                        status: "error",
                        data: "No Item found"
                    });
                });

        }
    ));


    /**
     * All API Security via a key
     */
    passport.use(new LocalAPIKeyStrategy(
        function(apikey, done) {
            db.users.find({ where: { apikey: apikey }}).done(function (err, user) {
                if (err) {
                    return done(err);
                }

                if (!user) {
                    return done(null, false);
                }

                return done(null, user);
            });
        }
    ));

    
    return passport;
}
