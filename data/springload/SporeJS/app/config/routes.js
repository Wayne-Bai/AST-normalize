/**
 * Routing configuration
 * Springload - 2014
 *
 **/

var async = require('async');

/**
 * Routes
 */

module.exports = function (application) {

    // User routes
	var con = application.controllers,
        auth = application.configs.middleware.authorization,
        app = application.app,
        passport = application.passport,
        router = application.express.Router(),
        helpers = application.lib.helpers,
        adminAuth = auth.hasGroups(["admin", "root", "superadmin"]);

    router.route('/token')
        .get(con.baseAuth.getCSRFToken);

    router.route('/register')
        .get(con.baseAuth.getRegister)
        .post(con.baseAuth.postRegister);

    router.route('/registered')
        .get(adminAuth, con.baseAuth.getRegistered);


    router.route('/login')
        .get(auth.notAuthenticated, con.baseAuth.getLogin)
        .post(con.baseAuth.basicLoginAuthentication);


    router.route('/access/:accesskey')
        .get(con.baseAuth.accessAuthenticate);

    router.param('accesskey', con.baseAuth.findAccessKey);

    router.route('/logout')
        .get(auth.isAuthenticated, con.baseAuth.getLogout);

    router.route('/change-password')
        .get(adminAuth, auth.isAuthenticated, con.baseAuth.getChangePassword)
        .post(adminAuth, auth.isAuthenticated, con.baseAuth.postChangePassword);

    router.route('/forgot-password-sent')
        .get(con.baseAuth.getPasswordEmailSent);

    router.route('/forgot-password')
        .get(con.baseAuth.getForgotPassword)
        .post(con.baseAuth.postForgotPassword);


    router.route('/change-password-success')
        .get(adminAuth, con.baseAuth.getPasswordResetSuccess);

    router.route('/reset/:token')
        .get(con.baseAuth.getResetPassword)
        .post(con.baseAuth.postResetPassword);


    router.route('/delete-account')
        .get(adminAuth, con.baseAuth.getDeleteAccount)
        .post(adminAuth, con.baseAuth.postDeleteAccount);

    router.route("/deleted-account")
        .get(adminAuth, con.baseAuth.getDeleteAccountSuccess);


    router.route('/dashboard')
        .get(auth.isAuthenticated, con.index.dashboard);


    // role actions
	var roleRouter = helpers.routeCRUDFactory(application, con.roles, [adminAuth]);
    app.use('/roles', roleRouter);

    // user actions
    var usersRouter = helpers.routeCRUDFactory(application, con.users, [adminAuth]);
    app.use('/users', usersRouter);


    router.route('/')
        .get(con.index.home);


    // Front-end API stuff
    var apiAuth = passport.authenticate('localapikey', {
        session: false,
        failureRedirect: '/api/unauthorized'
    });

    // Use router
    app.use('/', router);

    // CSRF Token error handling
	app.use(function (err, req, res, next) {
        if (err.code !== 'EBADCSRFTOKEN') return next(err)

        // handle CSRF token errors here
        res.status(403)
        res.render("error.j2", {
            status: "error",
            error: 'session has expired or form tampered with'
        });

	})

    // Custome error handling
    app.use(function (err, req, res, next) {
        if (err) {
        	
        	console.log(err.code);
            res.status(err.status || 404);

            if (req.accepts('application/json') != undefined && req.accepts('text/html') == false) {
                res.json({
                    status: "error",
                    error: err.toString()
                });
            } else {
                res.render('error.j2', {
                    status: "error",
                    error: err
                });
            }
        } else {
            next();
        }

    });

    return app;
};
