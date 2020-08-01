/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

/*jshint newcap:false, debug:true, unused: true, evil: true, devel: true, plusplus: false, browser: true, jquery: true, undef:false */
/*clientside jslint comment for global */
/*global org: false, core: false, YAHOO: false */
/*jshint unused: false */



org.goorm.core.dialog.notice = function () {
	this.panel = null;
	this.context_menu = null;
	this.path = null;
	this.title = null;
	this.message = null;
	this.image_url = null;
	this.type = null;
	this.left = null;
	this.top = null;
	this.width = null;
	this.height = null;
};

org.goorm.core.dialog.notice.prototype = {
	init: function () {
		var self = this;

		this.title = "Notice";
		this.image_url = "images/org.goorm.core.dialog/dialog_notice.png";

		this.title = this.title.split(" ").join("_");
		this.timestamp = new Date().getTime();

		var goorm_dialog_container = $("#goorm_dialog_container");

		var handle_yes = function () {
			this.hide();
		};

		if (goorm_dialog_container.find("#panelContainer_" + this.title)) {
			goorm_dialog_container.find("#panelContainer_" + this.title).remove();
		}

		goorm_dialog_container.append("<div id='panelContainer_" + this.title + "'></div>");

		this.buttons = [{ text: "<span localization_key='button_ok'>OK</span>", handler: handle_yes, isDefault: true }];

		this.panel = new YAHOO.widget.SimpleDialog(
			"panelContainer_" + this.title, {
				width: '300px',
				height: '160px',
				visible: false,
				underlay: "none",
				close: true,
				draggable: true,
				modal: true,
				text: "",
				constraintoviewport: true,
				fixedcenter: true,
				effect: {
					effect: YAHOO.widget.ContainerEffect.FADE,
					duration: 0.2
				},
				buttons: self.buttons
			}
		);

		this.panel.setHeader(this.title.split("_").join(" "));
		this.panel.setBody("Loading Data...");
		this.panel.render();

		$("#panelContainer_" + this.title).find(".button-group").css("text-align", "center");
		$("#panelContainer_" + this.title).css('font-size', '11px');

		$(document).keydown(function (e) {
			if (e.which == 27) {
				if (self.panel.cfg.config.visible.value && !core.status.keydown) {
					self.panel.hide();
				}
			}
			else if (e.which == 13) {
				if (self.buttons && self.panel.cfg.config.visible.value && !core.status.keydown) {
					$(self.buttons).each(function (i) {
						if (this.isDefault) {
							this.hide = function () {};
							this.handler();

							self.panel.hide();
							core.status.keydown = true;
						}
					});
				}
			}
		});

		self.panel.subscribe('show', function () {
			var left = self.panel.cfg.config.x.value;
			var top = self.panel.cfg.config.y.value;

			var container = goorm_dialog_container.find("#panelContainer_" + self.title).parent();
			container.css('left', left + 'px').css('top', top + 'px');
		});

		self.panel.subscribe('hide', function () {
			var container = goorm_dialog_container.find("#panelContainer_" + self.title).parent();
			container.css('left', '-9999px').css('top', '-9999px');
		});

		var container = goorm_dialog_container.find("#panelContainer_" + this.title).parent();
		container.css('left', '-9999px').css('top', '-9999px');

		container.find('.yui-button button').attr('id', 'g_n_btn_ok');
	},

	show: function (message, option_image_url, no_image) {
		this.message = message;
		//this.title="Notice";
		var panelContainer_bd = $("#panelContainer_" + this.title).find(".bd");

		panelContainer_bd.empty();
		panelContainer_bd.append(this.message);

		if(!no_image) {
			panelContainer_bd.css('text-align', 'left');

			if (!option_image_url) {
				panelContainer_bd.prepend("<div class='notice_image_div'><img src='" + this.image_url + "'/></div>").css("text-align", "left");
			} else {
				panelContainer_bd.prepend("<div class='notice_image_div'><img style='width:80%; height:80%' src='" + option_image_url + "'/></div>").css("text-align", "left");
			}
		}
		else {
			panelContainer_bd.css('text-align', 'center');
		}

		this.panel.show();
	},
	msg_assistant: function (message) {
		this.message = message;

		var panelContainer_bd = $("#panelContainer_" + this.title).find(".bd");

		//this.title="Message from Assistant";
		panelContainer_bd.empty();
		$("#panelContainer_" + this.title).find('.hd').html(core.module.localization.msg.alert_assistant_msg);
		panelContainer_bd.append(this.message).prepend("<div class='notice_image_div'><img src='" + this.image_url + "'/></div>").css("text-align", "left");

		this.panel.show();
	}

};
