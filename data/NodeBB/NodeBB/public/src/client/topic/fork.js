'use strict';

/* globals define, app, ajaxify, socket */

define('forum/topic/fork', ['components'], function(components) {

	var Fork = {},
		forkModal,
		forkCommit,
		pids = [];

	Fork.init = function() {
		components.get('topic/fork').on('click', onForkThreadClicked);
	};

	function disableClicks() {
		return false;
	}

	function disableClicksOnPosts() {
		components.get('post').on('click', 'button,a', disableClicks);
	}

	function enableClicksOnPosts() {
		components.get('post').off('click', 'button,a', disableClicks);
	}

	function onForkThreadClicked() {
		forkModal = $('#fork-thread-modal');
		forkCommit = forkModal.find('#fork_thread_commit');
		pids.length = 0;

		showForkModal();
		showNoPostsSelected();

		forkModal.find('.close,#fork_thread_cancel').on('click', closeForkModal);
		forkModal.find('#fork-title').on('change', checkForkButtonEnable);
		components.get('topic').on('click', '[data-pid]', function() {
			togglePostSelection($(this));
		});

		disableClicksOnPosts();

		forkCommit.on('click', createTopicFromPosts);
	}

	function showForkModal() {
		forkModal.removeClass('hide')
			.css('position', 'fixed')
			.css('left', Math.max(0, (($(window).width() - $(forkModal).outerWidth()) / 2) + $(window).scrollLeft()) + 'px')
			.css('top', '0px')
			.css('z-index', '2000');
	}

	function createTopicFromPosts() {
		socket.emit('topics.createTopicFromPosts', {
			title: forkModal.find('#fork-title').val(),
			pids: pids
		}, function(err, newTopic) {
			function fadeOutAndRemove(pid) {
				components.get('post', 'pid', pid).fadeOut(500, function() {
					$(this).remove();
				});
			}

			if (err) {
				return app.alertError(err.message);
			}

			app.alert({
				timeout: 5000,
				title: '[[global:alert.success]]',
				message: '[[topic:fork_success]]',
				type: 'success',
				clickfn: function() {
					ajaxify.go('topic/' + newTopic.slug);
				}
			});

			for(var i=0; i<pids.length; ++i) {
				fadeOutAndRemove(pids[i]);
			}
			closeForkModal();
		});
	}

	function togglePostSelection(post) {
		var newPid = post.attr('data-pid');

		if(parseInt(post.attr('data-index'), 10) === 0) {
			return;
		}

		if(newPid) {
			var index = pids.indexOf(newPid);
			if(index === -1) {
				pids.push(newPid);
				post.css('opacity', '0.5');
			} else {
				pids.splice(index, 1);
				post.css('opacity', '1.0');
			}

			if (pids.length) {
				pids.sort(function(a,b) { return a - b; });
				forkModal.find('#fork-pids').html(pids.toString());
			} else {
				showNoPostsSelected();
			}
			checkForkButtonEnable();
		}
	}

	function showNoPostsSelected() {
		forkModal.find('#fork-pids').translateHtml('[[topic:fork_no_pids]]');
	}

	function checkForkButtonEnable() {
		if(forkModal.find('#fork-title').length && pids.length) {
			forkCommit.removeAttr('disabled');
		} else {
			forkCommit.attr('disabled', true);
		}
	}

	function closeForkModal() {
		for(var i=0; i<pids.length; ++i) {
			components.get('post', 'pid', pids[i]).css('opacity', 1);
		}

		forkModal.addClass('hide');
		components.get('topic').off('click', '[data-pid]');
		enableClicksOnPosts();
	}

	return Fork;
});
