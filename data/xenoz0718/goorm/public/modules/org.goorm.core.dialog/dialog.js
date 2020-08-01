/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

/*jshint newcap:false, debug:true, unused: true, evil: true, devel: true, plusplus: false, browser: true, jquery: true, undef:false */
/*clientside jslint comment for global */
/*global org: false, core: false, YAHOO: false, notice: false, confirmation: false */
/*jshint unused: false */



org.goorm.core.dialog = function () {
	this.panel = null;
	this.container_id = null;
	this.context_menu = null;
	this.path = null;
	this.localization_key = null;
	this.title = null;
	this.type = null;
	this.left = null;
	this.top = null;
	this.width = null;
	this.height = null;
	this.yes = null;
	this.no = null;
	this.buttons = null;
	this.success = null;
	this.zindex = null;
	this.modal = null;
	this.opacity = null;

	this.handler_flag = true;
	this.handler_time = 2500;
};

org.goorm.core.dialog.prototype = {
	init: function (option, appendded) {
		var self = this;

		this.localization_key = option.localization_key;
		this.title = option.title;
		this.path = option.path;
		this.width = option.width;
		this.height = option.height;
		this.modal = option.modal;
		this.opacity = option.opacity;
		this.duplicated = option.duplicated || false;
		this.zindex = parseInt(option.zindex, 10);
		this.buttons = option.buttons;

		// option.buttons.forEach(function(o, i){
		// 	var id = o.id;
		// 	var handler = o.handler;

		// 	if ((!/cancel/i.test(id) && !/close/i.test(id)) && handler) {
		// 		self.buttons[i].handler = function() {
		// 			var panel = this;

		// 			if (self.handler_flag) {
		// 				self.handler_flag = false;
		// 				handler(panel);

		// 				setTimeout(function(){
		// 					self.handler_flag = true;
		// 				}, self.handler_time);
		// 			}
		// 		}
		// 	}
		// });

		this.success = option.success;

		this.title = this.title.split(" ").join("_");
		this.timestamp = new Date().getTime();

		if (appendded === undefined) {
			appendded = false;
		}

		var goorm_dialog_container = $("#goorm_dialog_container");

		if (goorm_dialog_container.find("#panelContainer_" + this.title)) {
			goorm_dialog_container.find("#panelContainer_" + this.title).remove();
		}

		this.container_id = "panelContainer_" + this.title + "_" + this.timestamp;

		goorm_dialog_container.append("<div id='" + this.container_id + "'></div>");

		var _fixedcenter = ((core.is_mobile) ? false : true);
		this.panel = new YAHOO.widget.Dialog(
			this.container_id, {
				width: self.width + 'px',
				height: self.height + 'px',
				visible: false,
				underlay: "none",
				close: true,
				autofillheight: "body",
				draggable: true,
				constraintoviewport: true,
				modal: false,
				zindex: self.zindex,
				fixedcenter: _fixedcenter,
				effect: {
					effect: YAHOO.widget.ContainerEffect.FADE,
					duration: 0.2
				},
				buttons: this.buttons

			}
		);

		this.panel.setHeader('<span localization_key="' + this.localization_key + '">' + this.title.split("_").join(" ") + '</span>');
		this.panel.setBody("Loading Data...");
		this.panel.render();

		$(document).keydown(function (e) {
			if (e.which == 27) {
				if (confirmation.panel === null || confirmation.panel === undefined) {
					confirmation.panel = {};
					confirmation.panel.cfg = {};
					confirmation.panel.cfg.config = {};
					confirmation.panel.cfg.config.visible = {};
					confirmation.panel.cfg.config.visible.value = false;
				}

				if (self.buttons && self.panel.cfg.config.visible.value && !core.status.keydown && !alert.panel.cfg.config.visible.value && !notice.panel.cfg.config.visible.value && !confirmation.panel.cfg.config.visible.value) {
					$(self.buttons).each(function (i) {
						if (/cancel/.test(this.text) || /close/.test(this.text)) {
							this.hide = function () {};
							this.handler();

							core.status.keydown = true;
							self.panel.hide();
						}
					});
				}
			}
		});

		$(document).on('keydown', 'return', function (e) {
			if (confirmation.panel === null || confirmation.panel === undefined) {
				confirmation.panel = {};
				confirmation.panel.cfg = {};
				confirmation.panel.cfg.config = {};
				confirmation.panel.cfg.config.visible = {};
				confirmation.panel.cfg.config.visible.value = false;
			}

			if (self.buttons && self.panel.cfg.config.visible.value && !core.status.keydown && !alert.panel.cfg.config.visible.value && !notice.panel.cfg.config.visible.value && !confirmation.panel.cfg.config.visible.value) {
				$(self.buttons).each(function (i) {
					if (this.isDefault) {
						this.hide = function () {};
						this.handler();

						core.status.keydown = true;
						e.preventDefault();
					}
				});
			}
		});

		if (core.is_optimization) {
			var get_name = function (path) {
				var full_dir = path.split('/');
				var full_name = full_dir[full_dir.length - 1].split('.');
				full_name.pop();
				full_name = full_name.join('.');
				full_name = full_name.trim();

				return full_name;
			};

			var clear = function () {
				core.status.selected_dialog = "";
				core.status.selected_dialog_container = "";
				core.status.foucs_on_dialog = false;
			};

			var full_name = get_name(self.path);
			var data = $('[id="head_' + full_name + '"]').clone(true).html();

			self.panel.setBody(data);
			if (!self.duplicated)
				$('[id="head_' + full_name + '"]').remove();

			if ($.isFunction(self.success)) {
				if (self.opacity)
					self.insert_opacity_slide();
				self.success();
			}

			self.panel.subscribe('show', function () {
				var left = self.panel.cfg.config.x.value;
				var top = self.panel.cfg.config.y.value;

				var container = goorm_dialog_container.find('[id="' + self.container_id + '"]').parent();
				if (core.is_mobile) {
					container.css('left', '50%').css('top', '20px');
					container.css('margin-left', -(container.width() * 0.4));
				} else {
					container.css('left', left + 'px').css('top', top + 'px');
				}
			});

			self.panel.subscribe('hide', function () {
				clear();

				var container = goorm_dialog_container.find('[id="' + self.container_id + '"]').parent();
				container.css('left', '-9999px').css('top', '-9999px');
			});

			$('input', goorm_dialog_container.find('[id="' + self.container_id + '"]')).on('click', function () {
				core.status.focus_on_inputbox = true;
			});

			$('input', goorm_dialog_container.find('[id="' + self.container_id + '"]')).on('blur', function () {
				core.status.focus_on_inputbox = false;
			});

			var container = goorm_dialog_container.find('[id="' + self.container_id + '"]').parent();
			container.css('left', '-9999px').css('top', '-9999px');

			self.bind_custom_button_id(this.buttons);

			if (!appendded) {

				core.dialog.loaded_count++;

				if (core.dialog.loaded_count == (Object.keys(core.dialog).length - 1)) {

				}
			}
		} else {
			var url = "file/get_contents";
			var ajax_data = (self.path.search("plugins") >= 0) ? "path=" + self.path : "path=public/" + self.path;
			$.ajax({
				url: url,
				type: "GET",
				data: ajax_data,
				success: function (data) {

					self.panel.setBody(data);

					if ($.isFunction(self.success)) {
						if (self.opacity)
							self.insert_opacity_slide();
						self.success();
					}

					var clear = function () {
						core.status.selected_dialog = "";
						core.status.selected_dialog_container = "";
						core.status.foucs_on_dialog = false;
					};

					self.panel.subscribe('show', function () {
						var left = self.panel.cfg.config.x.value;
						var top = self.panel.cfg.config.y.value;
						var container = goorm_dialog_container.find('[id="' + self.container_id + '"]').parent();

						if (core.is_mobile) {
							container.css('left', '50%').css('top', '20px');
							container.css('margin-left', -(container.width() * 0.4));
						} else {
							container.css('left', left + 'px').css('top', top + 'px');
						}
					});

					self.panel.subscribe('hide', function () {
						clear();

						var container = goorm_dialog_container.find('[id="' + self.container_id + '"]').parent();
						container.css('left', '-9999px').css('top', '-9999px');
					});

					var container = goorm_dialog_container.find('[id="' + self.container_id + '"]').parent();
					container.css('left', '-9999px').css('top', '-9999px');

					self.bind_custom_button_id(self.buttons);

					if (!appendded) {

						core.dialog.loaded_count++;

						if (core.dialog.loaded_count == (Object.keys(core.dialog).length - 1)) {

						}

						$(core).trigger("goorm_loading");
					}
				}
			});
		}

		return this;
	},

	insert_opacity_slide: function () {
		var slider = '<div id="opacity_sliderbg_' + this.container_id + '" class="yui-h-slider" tabindex="-1">';
		slider += '<div id="opacity_sliderthumb_' + this.container_id + '" class="yui-slider-thumb">';
		slider += '<img src="images/org.goorm.core.edit/thumb.png" style="cursor:pointer;">';
		slider += '</div></div>';
		var container = $("#" + this.container_id);
		container.find(".hd").append(slider);

		var slider = YAHOO.widget.Slider.getHorizSlider("opacity_sliderbg_" + this.container_id, "opacity_sliderthumb_" + this.container_id, 0, 50);
		slider.setValue(50);
		slider.subscribe('change', function (newOffset) {
			container.css('opacity', (((newOffset / 50) > 0.1) ? (newOffset / 50) : (0.1)));
		});
	},

	bind_custom_button_id: function (buttons) {
		var goorm_dialog_container = $("#goorm_dialog_container");
		var container = goorm_dialog_container.find('[id="' + this.container_id + '"]').parent();

		var get_button = function (buttons, text) {
			var target = null;

			for (var i = 0; i < buttons.length; i++) {
				var button = buttons[i];
				var html = button.innerHTML;

				if (html == text.replace(/'/g, '"')) {
					target = button;
					break;
				}
			}

			return target;
		};

		if (buttons && buttons.length !== 0) {
			var __buttons = container.find('.yui-button button');

			$.each(buttons, function (i, b) {
				if (b.id) {
					var button = get_button(__buttons, b.text);
					$(button).attr('id', b.id);
				}
			});
		}
	}
};