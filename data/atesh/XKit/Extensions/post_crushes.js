//* TITLE Post Crushes **//
//* VERSION 2.0 REV A **//
//* DESCRIPTION Lets you share your Tumblr Crushes **//
//* DEVELOPER STUDIOXENIX **//
//* DETAILS To use this extension, go to the 'Following' page on your dashboard, and click on the 'Post My Crushes' button below your Tumblr Crushes. **//
//* FRAME false **//
//* BETA false **//

XKit.extensions.post_crushes = new Object({

	running: false,

	preferences: {
		"sep0": {
			text: "Appearance",
			type: "separator"
		},
		"default_title": {
			text: "Default post title",
			type: "text",
			default: "My Tumblr Crushes",
			value: "My Tumblr Crushes"
		},
		"show_percentage": {
			text: "Show percentages on the post next to their usernames",
			default: false,
			value: true
		},
		"sep1": {
			text: "Tagging",
			type: "separator"
		},
		"tag_people": {
			text: "Tag the people in the post",
			default: true,
			value: true
		},
		"auto_tag": {
			text: "Auto-tag all my crush posts with a custom tag",
			default: false,
			value: true
		},
		"auto_tag_text": {
			text:  "Custom tag for all crush posts",
			type: "text",
			default: "",
			value: ""
		}
	},

	run: function() {

		if (document.location.href.indexOf("www.tumblr.com/following") !== -1) {
			this.put_button();
		}

	},

	put_button: function() {

		$("#crushes").after('<div class="xkit-button xkit-wide-button" id="xkit_post_crushes" style="display: block; font-size: 12px; font-weight: bold; text-align: center; margin-bottom: 10px; border-radius: 4px; margin-top: 15px;">Post My Crushes</div>');

		$("#xkit_post_crushes").click(function() {
			if($(this).hasClass("xkit_button_gray") === true) { return; }
			XKit.extensions.post_crushes.post();
		});

	},

	post: function() {

		var blog_url = $("#search_form").find("[name='t']").val();
		var send_url = "http://www.studioxenix.com/xkit/crushes/index.php";
		var send_string = "?xkit=xkitnext";
		var crush_img = new Array();
		var crush_name = new Array();
		var crush_url = new Array();
		var crush_val = new Array();
		var i = 0;

		$("#xkit_post_crushes").removeClass("xkit_button_green");
		$("#xkit_post_crushes").addClass("disabled");
		$("#xkit_post_crushes").html("Please wait...");

		for (i=1; i<=9; i++) {
			var crush_img_src = $("#crush_" + i).attr('style').substring($("#crush_" + i).attr('style').indexOf("url('") + 5);
				crush_img_src = crush_img_src.substring(0, crush_img_src.indexOf("'"));
			crush_img.push(crush_img_src);
			crush_url.push($("#crush_" + i).attr('href'));
			crush_name.push($("#crush_" + i).attr('data-tumblelog-name'));
			crush_val.push($("#crush_" + i).find("span").html().replace("%",""));
		}

		for (i=0; i<=8; i++) {
			send_string = send_string + "&img" + (i+1) + "=" + crush_img[i] + "&val" + (i+1) + "=" + crush_val[i];
		}

		send_url = send_url + encodeURI(send_string);

		var m_tags = "";
		var send_txt = "<strong>" + XKit.extensions.post_crushes.preferences.default_title.value + ":</strong><ol>";

		for (i=0; i<=8; i++) {
			var perc = '<small> (' + crush_val[i] + '%)</small>';
			if (XKit.extensions.post_crushes.preferences.show_percentage.value === false) { perc = ""; }
			send_txt = send_txt + '<li><a href="' + crush_url[i] + '">' + crush_name[i] + '</a>' + perc + '</li>';
			m_tags = m_tags + "," + crush_name[i];
		}

		send_txt = send_txt + '</ol><p> </p>';

		var m_object = new Object;

		m_object.channel_id = blog_url;

		m_object.form_key = $("#form_key").val();

		m_object.context_page = "dashboard";

		m_object.context_id = "dashboard";

		// Not sure about this part:
		m_object["is_rich_text[one]"] = "0";
		m_object["is_rich_text[two]"] = "1";
		m_object["is_rich_text[three]"] = "0";

		m_object["MAX_FILE_SIZE"] = "10485760";

		m_object["post[slug]"] = "";
		m_object["post[draft_status]"] = "";
		m_object["post[date]"] ="";


		m_object["post[type]"] = "photo";

		var blog_selector_html = "<select id=\"xkit-post-crushes-blog\" style=\"margin-top: 7px; width: 100%; -webkit-box-sizing: border-box; -moz-box-sizing: border-box;  box-sizing: border-box; height: 25px;\">";

		var m_blogs = XKit.tools.get_blogs();

		if (m_blogs === "") {
			alert("Unable to Post Crushes\nCan't get list of current blogs, please visit dashboard first.");
			return;
		} else {
			for(i=0;i<m_blogs.length;i++) {
				if (m_blogs[i] !== "") {
					blog_selector_html = blog_selector_html + "<option value=\"" + m_blogs[i] + "\">" + m_blogs[i] + "</option>";
				}
			}
		}

		blog_selector_html = blog_selector_html + "</select>";

		if (XKit.extensions.post_crushes.preferences.tag_people.value === false) {
			m_object["post[tags]"] = "";
		}else {
			m_object["post[tags]"] = m_tags;
		}
		m_object["post[publish_on]"] ="";
		m_object.custom_tweet = "";

		m_object["post[photoset_order]"] = "o1";
		m_object["post[photoset_layout]"] = "1";
		m_object["photo_src[]"] = send_url;
		m_object["images[o1]"] = send_url;

		XKit.window.show("Post Crushes","<b>Post Caption:</b><input id=\"xkit-post-crushes-additional-text\" type=\"text\" class=\"xkit-textbox\" maxlength=\"256\" placeholder=\"optional additional text for this post\"><b>Blog to Post to:</b><br/>" + blog_selector_html + "<div style=\"margin-top: 10px; font-size: 13px; color: rgb(130,130,130);\">For additional options please check the Post Crushes control panel.</div>","question","<div data-status=\"0\" class=\"xkit-button default xkit-post-crushes-proceed\">Publish</div><div data-status=\"1\" class=\"xkit-button xkit-post-crushes-proceed\">Draft</div><div data-status=\"2\" class=\"xkit-button xkit-post-crushes-proceed\">Queue</div><div id=\"xkit-post-crushes-ignore\" class=\"xkit-button\">Cancel</div>");

		$(".xkit-post-crushes-proceed").click(function() {

			if ($(this).hasClass("disabled")) { return; }

			m_object["post[state]"] = $(this).attr('data-status');

			var m_text = $.trim($("#xkit-post-crushes-additional-text").val());

			if (m_text !== "") {
				m_object["post[two]"] = send_txt + "<p>" + m_text + "</p>";
			} else {
				m_object["post[two]"] = send_txt;
			}

			m_object.channel_id = $("#xkit-post-crushes-blog").val();

			$("#xkit-window .xkit-button").addClass("disabled");

			$("#xkit-post-crushes-additional-text, #xkit-post-crushes-blog").attr('disabled', 'disabled');

			XKit.extensions.post_crushes.actually_post(m_object);

		});

		$("#xkit-post-crushes-ignore").click(function() {

			if ($(this).hasClass("disabled")) { return; }

			$("#xkit_post_crushes").addClass("xkit_button_green");
			$("#xkit_post_crushes").removeClass("disabled");
			$("#xkit_post_crushes").html("Post My Crushes");

			XKit.window.close();

		});

	},

	actually_post: function(m_object) {

		XKit.interface.kitty.get(function(kitty_data) {

			if (kitty_data.errors === true) {

				XKit.extensions.post_crushes.post_crushes_error("Can't post crushes", "Unable to authorize post transaction. Please try again later.");
				return;

			}

			GM_xmlhttpRequest({
				method: "POST",
				url: "http://www.tumblr.com/svc/post/update",
				data: JSON.stringify(m_object),
				headers: {
					"X-tumblr-puppies": kitty_data.kitten,
					"X-tumblr-form-key": XKit.interface.form_key(),
					"Content-Type": "application/json"
				},
				onerror: function(response) {
					XKit.interface.kitty.set("");
					XKit.extensions.post_crushes.post_crushes_error("Can't post crushes", "Server returned invalid/blank page or could not be reached. Maybe you hit your post limit for today, or your account has been suspended. Please check your internet connection and try again later.");
				},
				onload: function(response) {
					XKit.interface.kitty.set(response.getResponseHeader("X-tumblr-kittens"));
					var m_obj = jQuery.parseJSON(response.responseText);
					console.log(m_obj);
					if (m_obj.errors === false) {
						$("#xkit_post_crushes").html("Posted!");
						XKit.window.close();
						if (m_object["post[state]"] === "0") {
							XKit.notifications.add("Your crushes have been posted to <b>" + m_object.channel_id + "</b>", "ok");
						}
						if (m_object["post[state]"] === "1") {
							XKit.notifications.add("Your crushes have been drafted to <b>" + m_object.channel_id + "</b>", "ok");
						}
						if (m_object["post[state]"] === "2") {
							XKit.notifications.add("Your crushes have been queued to <b>" + m_object.channel_id + "</b>", "ok");
						}
					} else {
						XKit.extensions.post_crushes.post_crushes_error("Can't post crushes", "Server returned a non-JSON object. Maybe you hit your post limit for today, or your account has been suspended. Please try again later.");
					}
				}
			});


		});

	},

	post_crushes_error: function(title, message) {

		XKit.window.show(title, message, "error", "<div class=\"xkit-button default\" id=\"xkit-close-message\">OK</div>");

	},

	destroy: function() {
		$("#xkit_post_crushes").remove();
	}

});