/*global define, Backbone, $, document, Raven, console, require*/
// 'use strict';
define(['backbone', 'user', 'cobj'],
	function (Backbone, User, CObj) {


		function _resetViews() {
			if (this.activesView) {
				this.activesView.destroy();
				this.activesView = null;
			}
		}

		function _isAuthenticated() {
			return (this.user.get('_id')) ? true : false;
		}

		// and the function that parses the query string can be something like : 
		function _parseQueryString(queryString) {
			var params = {};
			if (queryString) {
				_.each(
					_.map(decodeURI(queryString).split(/&/g), function (el, i) {
						var aux = el.split('='),
							o = {};
						if (aux.length >= 1) {
							var val;
							if (aux.length == 2)
								val = aux[1];
							o[aux[0]] = val;
						}
						return o;
					}),
					function (o) {
						_.extend(params, o);
					}
				);
			}
			return params;
		}

		var router = Backbone.Router.extend({
			routes: {
				'?*queryString': 'showProfile',
				'': 'editProfile',
			},

			initialize: function () {
				this.user = new User({
					isLogged: false
				});

			},

			start: function () {
				this.user.currentUser({
					success: function () {
						Backbone.history.start({
							pushState: true,
							root: "/profile.html"
						});
					},
					error: function () {
						cb('FAIL getUserStatus');
					}
				});
			},

			showProfile: function (queryString) {
				_resetViews.call(this);
				var params = _parseQueryString(queryString);
				if (params.of) {
					var _this = this;

					require(['profile_view'], function (ProfileView) {
						var query = new Stamplay.Query('cobject', 'aboutpage');
						query.equalTo('profileId', params.of).exec().then(function (response) {
							if (response.data && response.data[0]) {
								var profileCobj = new CObj(response.data[0]);
								var profileView = new ProfileView({
									model: _this.user,
									profileCobj: profileCobj
								});
								_this.activesView = profileView;
							} else {
								//No user matching that profile id, redirecting to landing page
								document.location.href = '/';
							}
						}).catch(function (err) {
							console.log('ERROR ', err);
						});
					});

				} else {
					//"of" user parameter missing, redirecting to landing page
					document.location.href = '/';
				}

			},

			editProfile: function () {
				_resetViews.call(this);
				if (_isAuthenticated.call(this)) {
					//User is authenticated
					var _this = this;
					window.scroll(0, 0);
					require(['edit_view'], function (EditView) {
						var query = new Stamplay.Query('cobject', 'aboutpage');
						query.equalTo('user', _this.user.get('_id')).exec().then(function (response) {
							if (response.data.length !== 0) {
								_this.cobject = new CObj(response.data[0]);
							} else {
								_this.cobject = new CObj({
									isNew: true
								});
							}
							var editView = new EditView({
								model: _this.user,
								cobj: _this.cobject
							});
							_this.activesView = editView;
						}).catch(function (err) {
							console.log('Error ', err);
						});
					});

				} else {
					//Not authenticated
					document.location.href = '/';
				}
			}

		});

		return router;

	});