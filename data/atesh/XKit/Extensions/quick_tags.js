//* TITLE Quick Tags **//
//* VERSION 0.4 REV C **//
//* DESCRIPTION Quickly add tags to posts **//
//* DETAILS Allows you to create tag bundles and add tags to posts without leaving the dashboard. **//
//* DEVELOPER STUDIOXENIX **//
//* FRAME false **//
//* BETA false **//

XKit.extensions.quick_tags = new Object({

	running: false,

	button_icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBNYWNpbnRvc2giIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6REUyOTgzM0UwM0RBMTFFMzk4MjNDQ0YzRkVDODBDQkIiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6REUyOTgzM0YwM0RBMTFFMzk4MjNDQ0YzRkVDODBDQkIiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpFNkYwOTk2QjAzQUQxMUUzOTgyM0NDRjNGRUM4MENCQiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpFNkYwOTk2QzAzQUQxMUUzOTgyM0NDRjNGRUM4MENCQiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PtfUnGQAAAEPSURBVHjarJM/DsIgGMXBaKf2BDq7eTRHd4+glzAewEPo4GDSwX+jg4ODiY2JqRHfZ8BQ+iGtKclLS4Af7+OBVEqJJltLNNza5kdKGbKaoJqsjsNnYO4Sm8ZBi3SG+hzv1NXgGbTWfVtbKDZrOHHAMdSBeuSKge50+SyQC+WGgRzfM/RixvvQyls+4/ACTaEF485WSuWXOBbwYU3Onb5PByrfB8wqAJQnqIQDDskZm1wYmhqovYjaxByJJVHRKaUfSwNDaoWsrH/p9H+1edW3TFDaXAbm5XXOSQXmHaGoKeCeYG4o/wJ3H2f6LropC0/K39fA3MGoMF4R2IVO3DUpbVjD4QC6Qhto5MIM8C3AAHzrYQgVtFTHAAAAAElFTkSuQmCC",
	button_ok_icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBNYWNpbnRvc2giIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6REUyOTgzNDIwM0RBMTFFMzk4MjNDQ0YzRkVDODBDQkIiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6REUyOTgzNDMwM0RBMTFFMzk4MjNDQ0YzRkVDODBDQkIiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpERTI5ODM0MDAzREExMUUzOTgyM0NDRjNGRUM4MENCQiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpERTI5ODM0MTAzREExMUUzOTgyM0NDRjNGRUM4MENCQiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PqyFhvoAAAE0SURBVHjaYvz//z8DNQETA5UBC4yRs0yHkFN5p0Rd+UKKC/8QUHsCaCkPKQb+htJ/gXg5EJ9DU6sNxGcIGYotDFuAOB6I/YH4JJqcOhCfBRrKS4qBn4FhBXLtCyD+h0VeDWQRLpcywpINUME3IMUJxG+BeCkQKwOxNx7fXQViC/SIQnYhM5QWBuIsIHYlEP6gMD2P7n1skQJLTmxEJDsVID6NbCiyl3OBVB/QC6zouohIoyDvWwL1foYnbCBnMlCjMroBQHFGIlwKS1LGKLEM1FxAQa4Dxf5sFmJUIruSgPd/E8zLJHj/LhCnUKu0uQ3EWkALf1HDwFtArAMyDKX4whVOBLx5E4j1YIahGIgPAC2QhhYU0mguM0E2jOgSG6jpKZDyBOKPQHwJiMuA2BhbgQsQYAB+k3Pj/Off2gAAAABJRU5ErkJggg==",

	preferences: {
		"sep0": {
			text: "Options",
			type: "separator"
		},
		"append_not_replace": {
			text: "Append, do not replace tags when adding them",
			value: true,
			default: true
		},
		"show_in_one_click_postage": {
			text: "Enable Quick Tags in One-Click Postage popup",
			value: true,
			default: true
		},
		"append_not_replace_one_click": {
			text: "Also append and do not replace tags when adding them using One-Click Postage",
			value: false,
			default: false
		},
		"sep1": {
			text: "My Tag Bundles",
			type: "separator"
		}
	},

	tag_array: new Array(),

	cancel_menu_close: function() {
		clearTimeout(XKit.extensions.quick_tags.menu_closer_int);
		XKit.extensions.quick_tags.user_on_box = true;
	},

	menu_close: function() {
		XKit.extensions.quick_tags.menu_closer_int = setTimeout(function() { XKit.extensions.quick_tags.close_window(); }, 500);
	},

	run: function() {
		this.running = true;
		if ($(".post.post_full").length <= 0) {return; }

		XKit.tools.init_css("quick_tags");

		XKit.interface.post_window.create_control_button("xkit-quick-tags-window", this.button_icon, "Quick Tags in a window!");
		XKit.interface.create_control_button("xkit-quick-tags", this.button_icon, "Quick Tags!", "", this.button_ok_icon);

		$(document).on("mouseover","#xkit-quick-tags-window", XKit.extensions.quick_tags.cancel_menu_close);
		$(document).on("mouseout","#xkit-quick-tags-window", XKit.extensions.quick_tags.menu_close);

		$(document).on('mouseover', '.xkit-quick-tags, .xkit-quick-tags-window', XKit.extensions.quick_tags.move_window);
		$(document).on('mouseout', '.xkit-quick-tags, .xkit-quick-tags-window', XKit.extensions.quick_tags.menu_close);

		$(document).on('click', '.xkit-tag', XKit.extensions.quick_tags.button_clicked);

		XKit.interface.post_window_listener.add("quick_tags", XKit.extensions.quick_tags.post_window);
		XKit.post_listener.add("quick_tags", XKit.extensions.quick_tags.do_posts);
		this.do_posts();

	},

	post_window: function() {

		XKit.interface.post_window.add_control_button("xkit-quick-tags-window", "data-in-window=\"true\"");

	},

	submit: function(tags, button) {

		// Are we in post window?
		if ($(button).attr('data-in-window') === "true") {
			if (XKit.extensions.quick_tags.preferences.append_not_replace.value !== true) {
				XKit.interface.post_window.remove_all_tags();
			}
			XKit.interface.post_window.add_tag(tags.split(","));
			XKit.interface.switch_control_button($(button), false);
			return;
		}

		// Find the post object.
		var m_post = XKit.interface.find_post($(button).attr('data-post-id'));

		var m_button = $(button);

		// Fetch info about it!
		if (m_post.error == false) {
			XKit.interface.fetch(m_post, function(data) {

				// Use Interface to edit the post's tags:
				var m_tags = data.data.post.tags;

				if (m_tags === "undefined" || typeof m_tags === "undefined" || m_tags == "null") {
					m_tags = "";
				}

				if (XKit.extensions.quick_tags.preferences.append_not_replace.value === true) {
					m_tags = m_tags + "," + tags;
				} else {
					m_tags = tags;
				}

				if (m_tags.indexOf(",") != -1) {

					var split_tags = m_tags.split(",");
					var new_data = "";

					for (var i=0;i<split_tags.length;i++) {

						if (split_tags[i] != "null" && typeof split_tags[i] != "undefined" && split_tags[i] != null) {
							if (new_data == "") {
								new_data = split_tags[i];
							} else {
								new_data = new_data + "," + split_tags[i];
							}
						}

					}

					m_tags = new_data;

				}

				var m_post_object = XKit.interface.edit_post_object(data.data, { tags: m_tags });

				// Now submit it back to the server:
				XKit.interface.edit(m_post_object, function(data) {

					XKit.interface.switch_control_button($(m_button), false);

					if (data.error === false && data.data.errors === false) {

						XKit.interface.switch_control_button($(m_button), false);
						XKit.interface.update_view.tags(m_post, m_tags);

					} else {
						// Oops?
						if (data.error === true) {
							XKit.window.show("Unable to edit post","Something went wrong, my apologizes.<br/>Please try again later or file a bug report with the error code:<br/>QT01B" + data.status + "<br/>" + data.message,"error","<div id=\"xkit-close-message\" class=\"xkit-button default\">OK</div>");
						} else {
							XKit.window.show("Unable to edit post","Something went wrong, my apologizes.<br/>Please try again later or file a bug report with the error code:<br/>QT01A" + data.status + "<br/>" + data.data.errors,"error","<div id=\"xkit-close-message\" class=\"xkit-button default\">OK</div>");
						}
					}

				});

			}, false);
		} else {
			XKit.window.show("Unable to edit post","Something went wrong, my apologizes.<br/>Please try again later or file a bug report with the error code:<br/>QT02","error","<div id=\"xkit-close-message\" class=\"xkit-button default\">OK</div>");
		}

	},

	custom_tag: function() {

		XKit.interface.switch_control_button($(XKit.extensions.quick_tags.current_button), true);
		XKit.extensions.quick_tags.close_window();

		var m_tags = $("#xkit-tag-input").val();
		XKit.extensions.quick_tags.submit(m_tags, XKit.extensions.quick_tags.current_button);

	},

	button_clicked: function(e) {

		var obj = $(e.target);

		if ($(obj).hasClass("xkit-tag") === false) {
			obj = $(obj).parent();
		}

		XKit.interface.switch_control_button($(XKit.extensions.quick_tags.current_button), true);
		XKit.extensions.quick_tags.close_window();

		var m_tags = $(obj).attr('data-tags');

		var m_one_click = $(obj).attr('data-one-click-postage');
		if (m_one_click !== "true") {
			XKit.extensions.quick_tags.submit(m_tags, XKit.extensions.quick_tags.current_button);
		} else {
			if (XKit.extensions.quick_tags.preferences.append_not_replace_one_click.value !== true) {
				$("#x1cpostage_tags").val(m_tags);
			} else {
				if ($("#x1cpostage_tags").val() === "") {
					$("#x1cpostage_tags").val(m_tags);
				} else {
					var m_u_tags = $("#x1cpostage_tags").val();
					if (typeof m_u_tags === "undefined" ||m_u_tags == "null") {
						m_u_tags = "";
					}
					$("#x1cpostage_tags").val(m_u_tags + "," + m_tags);
				}
			}
		}
	},

	menu_closer_int: 0,
	user_on_box: false,
	current_button: "",

	close_window: function() {

		$("#xkit-quick-tags-window").fadeOut('fast');

	},

	load_tag_prefs: function() {

		// Get the user tags.
		var user_tags = XKit.storage.get("quick_tags","user_tags");
		try {
			var user_tag_array = JSON.parse(user_tags);
		} catch(e) {
			var user_tag_array = new Array();
		}

		XKit.extensions.quick_tags.tag_array = user_tag_array;

		return user_tag_array;

	},

	render_tags_from_array: function(user_tag_array, for_one_click) {

		var m_user_tags = "";

		if (user_tag_array.length === 0) {

			m_user_tags = "<div class=\"xkit-no-tags\">You have no custom tag bundles. You can use XKit Control Panel > Quick Tags to define your own.</div>";

		} else {

			for (var tag in user_tag_array) {

				var m_title = user_tag_array[tag].title;
				var m_tags = user_tag_array[tag].tags;

				var add_data = "";
				if (for_one_click === true) {
					add_data = "data-one-click-postage=\"true\"";
				}

				m_user_tags = m_user_tags + "<div " + add_data + " data-tags=\"" + m_tags + "\" class=\"xkit-tag user\"><div class=\"xkit-tag-name\">" + m_title + "</div>";
				if (for_one_click !== true) {
					m_user_tags = m_user_tags + "<div class=\"xkit-tag-data\">" + m_tags + "</div>";
				}
				m_user_tags = m_user_tags + "</div>";

			}

		}

		return m_user_tags;

	},

	move_window: function(e) {

		var obj = $(e.target);

		if ($(obj).hasClass("xkit-interface-working") === true) { return; }

		var user_tag_array = XKit.extensions.quick_tags.load_tag_prefs();
		var m_user_tags = XKit.extensions.quick_tags.render_tags_from_array(user_tag_array);

		var add_class = "nano";
		var add_class_2 = "content";
		if (user_tag_array.length <= 3) {
			add_class = "no-scroll-needed";
			add_class_2 = "";
		}

		// Let's create our popup first.
		var m_html = 	"<div id=\"xkit-quick-tags-window\">" +
					"<div id=\"xkit-quick-tags-user-tags\" class=\"" + add_class + "\">" +
						"<div class=\"" + add_class_2 + "\">" + m_user_tags + "</div>" +
					"</div>" +
					"<div class=\"xkit-tag-other\">" +
						"<div class=\"xkit-tag-name\">Other: <span style=\"font-weight: normal\">type and press enter</span></div>" +
						"<input id=\"xkit-tag-input\" placeholder=\"comma separated tags\" type=\"text\">" +
					"</div>" +
				"</div>";

		$("#xkit-quick-tags-window").remove();
		$("body").append(m_html);

		$("#xkit-tag-input").bind("focus", XKit.extensions.quick_tags.cancel_menu_close);
		$("#xkit-tag-input").bind("blur", XKit.extensions.quick_tags.menu_close);

		$("#xkit-tag-input").bind("keydown", function(event) {
			if (event.which == 13) {
				XKit.extensions.quick_tags.custom_tag();
			}
			event.stopPropagation();
			event.stopImmediatePropagation();
		});

		if ($(obj).attr('data-in-window') === "true") {
			$("#xkit-quick-tags-window, #xkit-quick-tags-user-tags").addClass("no-other-section");
			$(".xkit-tag-other").css("display","none");
		} else {
			$("#xkit-quick-tags-window, #xkit-quick-tags-user-tags").removeClass("no-other-section");
			$(".xkit-tag-other").css("display","block");
		}

		clearTimeout(XKit.extensions.quick_tags.menu_closer_int);

		if (user_tag_array.length >= 4) {
			setTimeout(function() {
				$("#xkit-quick-tags-user-tags").nanoScroller();
				$("#xkit-quick-tags-user-tags").nanoScroller({ scroll: 'top' });
			}, 100);
		}

		var offset = $(obj).offset();

		var box_left = offset.left - ($("#xkit-quick-tags-window").width() / 2) + 10;
		var box_top = offset.top - ($("#xkit-quick-tags-window").height() + 7);

		XKit.extensions.quick_tags.user_on_box = true;
		XKit.extensions.quick_tags.current_button = $(obj);

		$("#xkit-quick-tags-window").css("top", box_top + "px");
		$("#xkit-quick-tags-window").css("left", box_left + "px");
		$("#xkit-quick-tags-window").fadeIn('fast');

	},

	show: function(button, post) {

		// if (m_post.error == true) { return; }



	},

	return_for_one_click_postage: function() {

		var user_tag_array = XKit.extensions.quick_tags.load_tag_prefs();
		var m_user_tags = XKit.extensions.quick_tags.render_tags_from_array(user_tag_array, true);

		return m_user_tags;

	},

	do_posts: function() {

		// get posts:
		var posts = XKit.interface.get_posts("xkit-quick-tags-done", true, true);

		$(posts).each(function() {

			$(this).addClass("xkit-quick-tags-done");

			if ($(this).hasClass("is_note") && XKit.interface.where().inbox === true) { return; }

			XKit.interface.add_control_button(this, "xkit-quick-tags", "");

		});

	},

	destroy: function() {

		this.running = false;

		XKit.interface.post_window_listener.remove("quick_tags");
		XKit.post_listener.remove("quick_tags");

		$(document).off("mouseover","#xkit-quick-tags-window", XKit.extensions.quick_tags.cancel_menu_close);
		$(document).off("mouseout","#xkit-quick-tags-window", XKit.extensions.quick_tags.menu_close);

		$(document).off('mouseover', '.xkit-quick-tags, .xkit-quick-tags-window', XKit.extensions.quick_tags.move_window);
		$(document).off('mouseout', '.xkit-quick-tags, .xkit-quick-tags-window', XKit.extensions.quick_tags.menu_close);

		$(document).off('click', '.xkit-tag', XKit.extensions.quick_tags.button_clicked);

		$("#xkit-tag-input").unbind("focus");
		$("#xkit-tag-input").unbind("blur");
		$("#xkit-tag-input").unbind("keydown");

		$("#xkit-quick-tags-window").remove();
		$(".xkit-quick-tags, .xkit-quick-tags-window").remove();

	},

	create_div: function(obj, id, max) {

		var m_html =	"<div data-id=\"" + id + "\" class=\"xkit-quick-tags-cp-tag\">" +
					"<div class=\"xkit-tag-title\">" + obj.title + "</div>" +
					"<div class=\"xkit-tag-tags\">" + obj.tags + "</div>";

		m_html = m_html + "<div class=\"xkit-quick-tags-cp-down\">&nbsp;</div>";

		if (id === 0) {
			m_html = m_html + "<div class=\"xkit-quick-tags-cp-up\" style=\"display: none;\">&nbsp;</div>";
		} else {
			m_html = m_html + "<div class=\"xkit-quick-tags-cp-up\">&nbsp;</div>";
		}

		m_html = m_html + "</div>";

		return m_html;

	},

	check_div_move_buttons: function() {

		var m_count = 0;

		$(".xkit-quick-tags-cp-tag").each(function() {

			if (m_count === 0) {
				$(this).find(".xkit-quick-tags-cp-up").css("display","none");
			} else {
				$(this).find(".xkit-quick-tags-cp-up").css("display","block");
			}

			if ($(this).is(":last-child")) {
				$(this).find(".xkit-quick-tags-cp-down").css("display","none");
			} else {
				$(this).find(".xkit-quick-tags-cp-down").css("display","block");
			}

			m_count++;

		});

	},

	save_div_positions: function() {

		var temp_array = [];

		$(".xkit-quick-tags-cp-tag").each(function() {

			var m_object = new Object();
			m_object.title = $(this).find(".xkit-tag-title").text();
			m_object.tags = $(this).find(".xkit-tag-tags").text();

			temp_array.push(m_object);

		});

		XKit.storage.set("quick_tags","user_tags", JSON.stringify(temp_array));
		XKit.extensions.xkit_preferences.restart_extension("quick_tags");

	},

	cpanel: function(m_div) {

		if ($("#xkit-quick-tags-custom-panel").length > 0) {
			// Panel already exists, probably in refresh mode.
			// Remove it first.
			$("#xkit-quick-tags-custom-panel").remove();
		}

		XKit.extensions.quick_tags.load_tag_prefs();

		var m_html = "<div id=\"xkit-quick-tags-custom-panel\"><div id=\"quick-tags-toolbar\"><div id=\"quick-tags-add-button\" class=\"xkit-button\">Add new tag bundle</div></div>"

		if (XKit.extensions.quick_tags.tag_array.length <= 0) {
			m_html = m_html + "<div id=\"xkit-quick-tags-none\"><b>You have no tag bundles.</b><br/>Create some by clicking on the button above to quickly tag your posts.</div>";
		} else {
			for (i=0;i<XKit.extensions.quick_tags.tag_array.length;i++) {
				if (XKit.extensions.quick_tags.tag_array[i] !== "") {
					m_html = m_html + XKit.extensions.quick_tags.create_div(XKit.extensions.quick_tags.tag_array[i], i, XKit.extensions.quick_tags.tag_array.length);
				}
			}
		}

		$(m_div).append(m_html);

		$(".xkit-quick-tags-cp-down").click(function() {

			 var box = $(this).parent();
			 $(box).next().after($(box));

			 XKit.extensions.quick_tags.check_div_move_buttons();
			 XKit.extensions.quick_tags.save_div_positions();

		});

		$(".xkit-quick-tags-cp-up").click(function() {

			 var box = $(this).parent();
			  $(box).prev().before($(box));

			 XKit.extensions.quick_tags.check_div_move_buttons();
			 XKit.extensions.quick_tags.save_div_positions();

		});

		$("#quick-tags-add-button").click(function() {

			var remaining = 30 - XKit.extensions.quick_tags.tag_array.length;

			if (remaining <= 0) {
				XKit.window.show("No slots left.","You can not add more than 30 bundles.<br/>Please delete some before adding new bundles.","error","<div class=\"xkit-button default\" id=\"xkit-close-message\">OK</div>");
				return;
			}

			XKit.window.show("Create new bundle","<b>Bundle Title</b><input type=\"text\" maxlength=\"40\" placeholder=\"eg: Doctor Who\" class=\"xkit-textbox\" id=\"xkit-quick-tags-add-title\"><b>Bundled Tags, comma separated</b><input type=\"text\" maxlength=\"250\" placeholder=\"eg: Doctor Who, Dr. Who, Non-Medical Tv Show Doctor\" class=\"xkit-textbox\" id=\"xkit-quick-tags-add-tags\">You have <b>" + remaining + "</b> bundle slots left.","question","<div class=\"xkit-button default\" id=\"xkit-quick-tags-create-bundle\">Create Bundle</div><div class=\"xkit-button\" id=\"xkit-close-message\">Cancel</div>")

			$("#xkit-quick-tags-create-bundle").click(function() {

				var title = $("#xkit-quick-tags-add-title").val();
				var tags = $("#xkit-quick-tags-add-tags").val();

				if ($.trim(title) === "") {
					alert("Please enter a title for your bundle.");
					return;
				}

				if ($.trim(tags) === "") {
					alert("Please enter the tags for your bundle.");
					return;
				}

				var m_object = new Object();
				m_object.title = title;
				m_object.tags = tags;
				XKit.extensions.quick_tags.tag_array.push(m_object);

				XKit.storage.set("quick_tags","user_tags", JSON.stringify(XKit.extensions.quick_tags.tag_array));

				XKit.window.close();
				XKit.extensions.quick_tags.cpanel(m_div);
				XKit.extensions.xkit_preferences.restart_extension("quick_tags");

			});

		});

		$(".xkit-quick-tags-cp-tag").click(function(event) {

			if ($(event.target).hasClass("xkit-quick-tags-cp-up") ||$(event.target).hasClass("xkit-quick-tags-cp-down")) { return; }

			var m_id = parseInt($(this).attr('data-id'));

			var m_tags = XKit.extensions.quick_tags.tag_array[m_id].tags;
			var m_title = XKit.extensions.quick_tags.tag_array[m_id].title;
			XKit.window.show("Edit bundle","<b>Bundle Title</b><input type=\"text\" maxlength=\"40\" value=\"" + m_title + "\" placeholder=\"eg: Doctor Who\" class=\"xkit-textbox\" id=\"xkit-quick-tags-add-title\"><b>Bundled Tags, comma separated</b><input value=\"" + m_tags + "\" type=\"text\" maxlength=\"250\" placeholder=\"eg: Doctor Who, Dr. Who, Non-Medical Tv Show Doctor\" class=\"xkit-textbox\" id=\"xkit-quick-tags-add-tags\">","question","<div class=\"xkit-button default\" id=\"xkit-quick-tags-create-bundle\">Create Bundle</div><div class=\"xkit-button\" id=\"xkit-quick-tags-delete-bundle\">Delete This Bundle</div><div class=\"xkit-button\" id=\"xkit-close-message\">Cancel</div>")

			$("#xkit-quick-tags-delete-bundle").click(function() {

				XKit.extensions.quick_tags.tag_array.splice(m_id, 1);

				XKit.storage.set("quick_tags","user_tags", JSON.stringify(XKit.extensions.quick_tags.tag_array));

				XKit.window.close();
				XKit.extensions.quick_tags.cpanel(m_div);
				XKit.extensions.xkit_preferences.restart_extension("quick_tags");

			});

			$("#xkit-quick-tags-create-bundle").click(function() {

				var title = $("#xkit-quick-tags-add-title").val();
				var tags = $("#xkit-quick-tags-add-tags").val();

				if ($.trim(title) === "") {
					alert("Please enter a title for your bundle.");
					return;
				}

				if ($.trim(tags) === "") {
					alert("Please enter the tags for your bundle.");
					return;
				}

				var m_object = new Object();
				XKit.extensions.quick_tags.tag_array[m_id].title = title;
				XKit.extensions.quick_tags.tag_array[m_id].tags = tags;

				XKit.storage.set("quick_tags","user_tags", JSON.stringify(XKit.extensions.quick_tags.tag_array));

				XKit.window.close();
				XKit.extensions.quick_tags.cpanel(m_div);
				XKit.extensions.xkit_preferences.restart_extension("quick_tags");

			});


		});

		$(".xkit-quick-tags-tag-delete").click(function() {

			try {

				var m_id = parseInt($(this).attr('data-id'));

				XKit.extensions.quick_tags.tag_array.splice(m_id, 1);

				XKit.storage.set("quick_tags","user_tags", JSON.stringify(XKit.extensions.quick_tags.tag_array));

				XKit.extensions.quick_tags.cpanel(m_div);
				XKit.extensions.xkit_preferences.restart_extension("quick_tags");

			} catch(e) {

				console.log("quick-tags cp delete -> " + e.message);

			}

		});

		$("#xkit-extensions-panel-right").nanoScroller();
		$("#xkit-extensions-panel-right").nanoScroller({ scroll: 'top' });

	}

});