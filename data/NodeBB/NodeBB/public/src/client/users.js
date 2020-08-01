'use strict';

/* globals define, socket, app, ajaxify, templates */

define('forum/users', ['translator'], function(translator) {
	var	Users = {};

	var loadingMoreUsers = false;

	Users.init = function() {

		var active = getActiveSection();

		$('.nav-pills li').removeClass('active');
		$('.nav-pills li a').each(function() {
			var $this = $(this);
			if ($this.attr('href').match(active)) {
				$this.parent().addClass('active');
				return false;
			}
		});

		handleSearch();

		socket.removeListener('event:user_status_change', onUserStatusChange);
		socket.on('event:user_status_change', onUserStatusChange);

		$('#load-more-users-btn').on('click', loadMoreUsers);

		$(window).off('scroll').on('scroll', function() {
			var bottom = ($(document).height() - $(window).height()) * 0.9;

			if ($(window).scrollTop() > bottom && !loadingMoreUsers) {
				loadMoreUsers();
			}
		});
	};

	function loadMoreUsers() {
		var set = '';
		var activeSection = getActiveSection();
		if (activeSection === 'latest') {
			set = 'users:joindate';
		} else if (activeSection === 'sort-posts') {
			set = 'users:postcount';
		} else if (activeSection === 'sort-reputation') {
			set = 'users:reputation';
		} else if (activeSection === 'online' || activeSection === 'users') {
			set = 'users:online';
		}

		if (set) {
			startLoading(set, $('#users-container').children('.registered-user').length);
		}
	}

	function startLoading(set, after) {
		loadingMoreUsers = true;

		socket.emit('user.loadMore', {
			set: set,
			after: after
		}, function(err, data) {
			if (data && data.users.length) {
				onUsersLoaded(data);
				$('#load-more-users-btn').removeClass('disabled');
			} else {
				$('#load-more-users-btn').addClass('disabled');
			}
			loadingMoreUsers = false;
		});
	}

	function onUsersLoaded(data) {
		data.users = data.users.filter(function(user) {
			return !$('.users-box[data-uid="' + user.uid + '"]').length;
		});

		templates.parse('users', 'users', data, function(html) {
			translator.translate(html, function(translated) {
				translated = $(translated);
				translated.find('span.timeago').timeago();
				$('#users-container').append(translated);
				$('#users-container .anon-user').appendTo($('#users-container'));
			});
		});
	}

	function handleSearch() {
		var timeoutId = 0;

		$('#search-user').on('keyup', function() {
			if (timeoutId) {
				clearTimeout(timeoutId);
				timeoutId = 0;
			}

			timeoutId = setTimeout(doSearch, 250);
		});

		$('.search select, .search input[type="checkbox"]').on('change', function() {
			doSearch();
		});

		$('.users').on('click', '.pagination a', function() {
			doSearch($(this).attr('data-page'));
			return false;
		});
	}

	function doSearch(page) {
		function reset() {
			notify.html('<i class="fa fa-search"></i>');
			notify.parent().removeClass('btn-warning label-warning btn-success label-success');
		}

		var username = $('#search-user').val();
		var notify = $('#user-notfound-notify');
		page = page || 1;

		notify.html('<i class="fa fa-spinner fa-spin"></i>');
		var filters = [];
		$('.user-filter').each(function() {
			var $this = $(this);
			if($this.is(':checked')) {
				filters.push({
					field:$this.attr('data-filter-field'),
					type: $this.attr('data-filter-type'),
					value: $this.attr('data-filter-value')
				});
			}
		});

		socket.emit('user.search', {
			query: username,
			page: page,
			searchBy: ['username', 'fullname'],
			sortBy: $('.search select').val(),
			filterBy: filters
		}, function(err, data) {
			if (err) {
				reset();
				return app.alertError(err.message);
			}

			if (!data) {
				return reset();
			}

			templates.parse('partials/paginator', {pagination: data.pagination}, function(html) {
				$('.pagination-container').replaceWith(html);
			});

			templates.parse('users', 'users', data, function(html) {
				translator.translate(html, function(translated) {
					$('#users-container').html(translated);

					if (!data.users.length) {
						translator.translate('[[error:no-user]]', function(translated) {
							notify.html(translated);
							notify.parent().removeClass('btn-success label-success').addClass('btn-warning label-warning');
						});
					} else {
						translator.translate('[[users:users-found-search-took, ' + data.matchCount + ', ' + data.timing + ']]', function(translated) {
							notify.html(translated);
							notify.parent().removeClass('btn-warning label-warning').addClass('btn-success label-success');
						});
					}
				});
			});
		});
	}

	function onUserStatusChange(data) {
		var section = getActiveSection();
		
		if ((section.startsWith('online') || section.startsWith('users'))) {
			updateUser(data);
		}
	}

	function updateUser(data) {
		app.updateUserStatus($('#users-container [data-uid="' + data.uid +'"] [component="user/status"]'), data.status);
	}

	function getActiveSection() {
		var url = window.location.href,
			parts = url.split('/');
		return parts[parts.length - 1];
	}

	return Users;
});
