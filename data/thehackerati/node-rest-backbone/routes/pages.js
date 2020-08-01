/**
 * pages.js
 *
 * Routes to site pages.
 */

module.exports = function(app, db_conn, passport) {
    /**
     * GET home page.
     */
    app.get('/', function (req, res) {
        res.render('index.ejs', { user: req.user });
    });

    /**
     * GET about page.
     */
    app.get('/about', function (req, res) {
        res.render('about.ejs', { user: req.user });
    });

    /**
     * GET contact page.
     */
    app.get('/contact', function (req, res) {
        res.render('contact.ejs', { user: req.user });
    });

    /**
     * GET Backbone app container page.
     */
    app.get('/app', isAuthenticated, function (req, res) {
        console.log("GET /app: user=" + req.user);
        res.render('app.ejs', { user: req.user });
    });

    // Simple route middleware to ensure user is authenticated.
	//   Use this route middleware on any resource that needs to be protected.  If
	//   the request is authenticated (typically via a persistent login session),
	//   the request will proceed.  Otherwise, the user will be redirected to the
	//   login page.
	function isAuthenticated(req, res, next) {
		if (req.isAuthenticated()) { return next(); }
		res.redirect('/login');
	}
};
