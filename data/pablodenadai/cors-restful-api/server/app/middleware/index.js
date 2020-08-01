exports = module.exports = function(app) {
	require('./RedirectMiddleware')(app);
	require('./CORSMiddleware')(app);
	require('./AuthenticationMiddleware')(app);
}