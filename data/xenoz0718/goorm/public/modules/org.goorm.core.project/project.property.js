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



org.goorm.core.project.property = {
	dialog: null,
	tabview: null,
	treeview: null,
	buttons: null,
	manager: null,
	property: null,
	property_default: null,
	plugin: null,
	firstShow: true,

	init: function () {
		var self = this;

		this.manager = org.goorm.core.project.property.manager;

		this.property = {};

		this.init_dialog();

		$(core).on("on_project_open", function () {
			self.firstShow = true;

			self.load_property(core.status.current_project_path, function (contents) {
				self.property = contents || {};
				core.property = self.property;
				if (core.property.type) {

					// if (core.property.type.indexOf('example') > 0) {
					// 	$('.menu-import-project').addClass('yuimenuitem-disabled');
					// 	$('.menu-import-project').addClass('yuimenuitemlabel-disabled').hide();
					// } else {
					// 	$('.menu-import-project').removeClass('yuimenuitem-disabled');
					// 	$('.menu-import-project').removeClass('yuimenuitemlabel-disabled').show();
					// }

					switch (core.property.type) {
					case 'python':
					case 'web':
					case 'nodejs':
					case 'php':
					case 'ruby':
						$('.build_project').hide();
						$('.build_clean').hide();
						$('.help_about_private_url').show();
						break;
					case 'jsp':
						$('.build_project').show();
						$('.build_clean').show();
						$('.help_about_private_url').show();
						break;
					default:
						$('.build_project').show();
						$('.build_clean').show();
						$('.help_about_private_url').hide();
					}
				}

				self.property.plugins || (self.property.plugins = {});
				if (contents) {
					var node = self.manager.treeview.getNodeByProperty("html", "<span localization_key='plugin'>Plugin</span>");
					var last_node;
					for (var i = 0; i < node.children.length; i++) {
						var plugin = node.children[i];

						if (plugin.html.toLowerCase() == contents.type.toLowerCase()) {
							$("#" + plugin.contentElId).prev().removeClass("ygtvln").addClass("ygtvtn").parent().show();
							last_node = $("#" + plugin.contentElId);

							for (var name in core.preference.plugins) {
								if (self.property.plugins[name] === undefined && name.search("org.goorm.plugin." + contents.type.toLowerCase()) != -1) {
									self.property.plugins[name] = core.preference.plugins[name];
								}
							}
						} else {
							$("#" + plugin.contentElId).prev().removeClass("ygtvln").addClass("ygtvtn").parent().hide();
						}
					}
					last_node && last_node.prev().removeClass("ygtvtn").addClass("ygtvln").addClass("current_plugin_info_node");

					self.fill_dialog(self.property);
					self.property_default = $.extend(true, {}, self.property);

					$("#property_tabview > *").hide();
					$("#property_tabview #property_Information").show();
				}
			});

			$("#property_tabview .yui-navset").hide();
		});
	},

	show: function () {
		if (core.status.current_project_path !== "") {
			$("span[tab_action|='Information']").click();
			this.dialog.panel.show();

			if (this.firstShow) {
				$("#property_tabview > div").hide();
				$("#property_tabview #property_Information").show();
				this.firstShow = false;
			}
			
			$("span[tab_action|='Information']").parent().addClass("ygtvfocus");
			setTimeout(function(){
				$("span[tab_action|='Information']").click();
			},700)
		} else {
			var result = {
				result: false,
				code: 5
			};
			core.module.project.display_error_message(result, 'alert');
		}
	},

	refresh_toolbox: function () {

	},

	// save current property(core.property) to project.json
	save: function (callback) {
		var path = core.status.current_project_path,
			property = core.property;

		property.description = property.description.replace(/&(lt|gt);/g, function (strMatch, p1) {
			return (p1 == "lt") ? "<" : ">";
		});
		property.description = property.description.replace(/<\/?[^>]+(>|$)/g, "");

		$.get("project/set_property", {
			project_path: path,
			data: JSON.stringify(property)
		}, function (data) {
			if (data.err_code === 0) {
				$.extend(true, core.workspace[path], property);
				callback && callback();
			} else {
				alert.show(data.message);
			}
		});
	},

	apply: function () {
		this.read_dialog(core.property);
		$(core).trigger("on_property_confirmed");
	},

	restore_default: function () {
		this.fill_dialog(this.property_default);
	},

	read_dialog: function (property) {
		var target = "#property_tabview";

		var targets = $(target).children('div');

		var key = null;
		$.each(targets, function (index) {
			var target_index = $(targets[index]);

			if (target_index.attr('plugin') == 'null') {
				key = property;
			} else {
				key = property.plugins[target_index.attr('plugin')];

				if (key === undefined) return;
			}

			target_index.find("input").each(function () {
				if ($(this).attr("name") !== undefined) {
					var value;
					if ($(this).attr("type") == "checkbox") {
						value = $(this).prop("checked");
					} else if ($(this).attr("type") == "radio" && $(this).prop("checked") == true) {
						value = $(this).val();
					} else {
						value = $(this).val();
					}
					key[$(this).attr("name")] = value;
				}
			});

			target_index.find("textarea").each(function () {
				if ($(this).attr("name") !== undefined) {
					key[$(this).attr("name")] = $(this).val();
				}
			});

			target_index.find("select").each(function () {
				if ($(this).attr("name") !== undefined) {
					key[$(this).attr("name")] = $(this).children("option:selected").val();
				}
			});
		});
	},

	fill_dialog: function (property) {
		var target = "#property_tabview";

		var targets = $(target).children('div');

		var key = null;

		$.each(targets, function (index) {
			var target_index = $(targets[index]);

			var plugin_name = target_index.attr('plugin');
			if (target_index.attr('plugin') == 'null') {
				key = property;
			} else {
				key = property.plugins[plugin_name];
				if (key === undefined) return;
			}

			target_index.find("input").each(function () {
				if (key[$(this).attr("name")] !== undefined && key[$(this).attr("name")] !== null) {
					if ($(this).attr("type") == "checkbox") {
						if (key[$(this).attr("name")] == "true" || key[$(this).attr("name")] === true)
							$(this).prop("checked", true);
					} else if ($(this).attr("type") == "radio") {
						if (key[$(this).attr("name")] == $(this).val())
							$(this).prop("checked", true);
					} else {
						$(this).val(key[$(this).attr("name")]);
					}
				}
			});
			target_index.find("textarea").each(function () {
				if (key[$(this).attr("name")] !== undefined && key[$(this).attr("name")] !== null) {
					$(this).val(key[$(this).attr("name")]);
				}
			});
			target_index.find("select").each(function () {
				if (key[$(this).attr("name")] !== undefined && key[$(this).attr("name")] !== null) {
					$(this).children("option[value = " + key[$(this).attr("name")] + "]").attr("selected", "true");
					$(this).val(key[$(this).attr("name")]);
				}
			});
		});
	},

	load_property: function (path, callback) {
		$.get("project/get_property", {
			project_path: path
		}, function (data) {
			if (data.err_code === 0) {
				callback && callback(data.contents);
			} else {
				alert.show(data.message);
			}
		});
	},

	set_before: function () {
		var self = this;
		$("#property_tabview").find("input").each(function () {
			if (self.property[$(this).attr("name")] !== undefined && self.property[$(this).attr("name")] !== null) {
				if ($(this).attr("type") == "checkbox") {
					if (self.property[$(this).attr("name")] == "true")
						$(this).prop("checked", true);
					else $(this).prop("checked", false);
				} else {
					$(this).val(self.property[$(this).attr("name")]);
				}
			}
		});
		$("#property_tabview").find("textarea").each(function () {
			if (self.property[$(this).attr("name")] !== undefined && self.property[$(this).attr("name")] !== null) {
				$(this).val(self.property[$(this).attr("name")]);
			}
		});
		$("#property_tabview").find("select").each(function () {
			if (self.property[$(this).attr("name")] !== undefined && self.property[$(this).attr("name")] !== null) {
				$(this).children("option[value = " + self.property[$(this).attr("name")] + "]").attr("selected", "ture");
				$(this).val(self.property[$(this).attr("name")]);
			}
		});
	},

	init_dialog: function () {
		var self = this;
		// Handler for OK button
		var handle_ok = function (panel) {
			self.apply();
			self.save(function () {
				core.module.layout.project_explorer.refresh();
			});

			if (typeof(this.hide) !== 'function' && panel) {
				panel.hide();
			}
			else{
				this.hide();
			}

			self.fill_dialog(core.property);
		};

		var handle_cancel = function () {
			self.set_before();
			this.hide();
		};

		var set_dialog_button = function () {
			// set Apply, restore_default Button
			$("#property_tabview").find(".apply").each(function (i) {
				$(this).attr("id", "property_applyBt_" + i);
				new YAHOO.widget.Button("property_applyBt_" + i, {
					onclick: {
						fn: function () {
							self.apply($("#property_tabview #property_applyBt_" + i).parents(".yui-navset").attr("id"));
						}
					},
					label: '<span localization_key="apply">Apply</span>'
				});
			});

			$("#property_tabview").find(".restore_default").each(function (i) {
				$(this).attr("id", "property_restore_defaultBt_" + i);
				new YAHOO.widget.Button("property_restore_defaultBt_" + i, {
					onclick: {
						fn: function () {
							self.restore_default($("#property_tabview #property_restore_defaultBt_" + i).parents(".yui-navset").attr("id"));
						}
					},
					label: '<span localization_key="restore_previous">Restore Previous</span>'
				});
			});
		};

		var load_plugin_tree = function () {
			var plugin_node = null,
				plugin_list = core.module.plugin_manager.list,
				plugin_count = plugin_list.length;

			var get_plugin_data = function (plugin_name) {
				if (core.is_optimization) {
					var json_string = external_json.plugins[plugin_name]['tree.json'];
					var json = null;

					if(json_string) {
						json = JSON.parse(external_json.plugins[plugin_name]['tree.json']);
					}

					if(!json) {
						console.log(plugin_name, 'Project Plugin Load Fail');
					}

					if (!plugin_node) {
						plugin_node = self.manager.treeview.getNodeByProperty("html", "<span localization_key='plugin'>Plugin</span>");
					}
					if (json && json.property) {
						// construct basic tree structure
						self.manager.add_treeview(plugin_node, json.property);
						self.manager.add_tabview(json.property, plugin_name);
						self.manager.treeview.render();
						self.manager.treeview.expandAll();
					}

					if (--plugin_count === 0) {
						// when all plugin tree loaded, render dialog buttons.
						set_dialog_button();
					}
				} else {
					$.getJSON("/" + plugin_name + "/tree.json", function (json) {
						if (!plugin_node) {
							plugin_node = self.manager.treeview.getNodeByProperty("html", "<span localization_key='plugin'>Plugin</span>");
						}
						if (json && json.property) {
							// construct basic tree structure
							self.manager.add_treeview(plugin_node, json.property);
							self.manager.add_tabview(json.property, plugin_name);
							self.manager.treeview.render();
							self.manager.treeview.expandAll();
						}
					}).complete(function () {
						if (--plugin_count === 0) {
							// when all plugin tree loaded, render dialog buttons.
							set_dialog_button();
						}
					});
				}
			};

			// load plugin tree.json
			$.each(core.module.plugin_manager.list, function (index, plugin) {
				var plugin_name = plugin.name;

				if (core.is_mobile) {
					var mobile_plugin_list = core.mobile.plugin_list;
					if (mobile_plugin_list.indexOf(plugin_name) < 0) {
						--plugin_count;
					} else {
						get_plugin_data(plugin_name);
					}
				} else {
					get_plugin_data(plugin_name);
				}
			});
		};

		this.buttons = [{
			id: "g_project_property_btn_ok",
			text: "<span localization_key='ok'>OK</span>",
			handler: handle_ok,
			isDefault: true
		}, {
			id: "g_project_property_btn_cancel",
			text: "<span localization_key='cancel'>Cancel</span>",
			handler: handle_cancel
		}];

		this.dialog = org.goorm.core.project.property.dialog;
		this.dialog.init({
			localization_key: "title_project_property",
			title: "Project Property",
			path: "configs/dialogs/org.goorm.core.project/project.property.html",
			width: 700,
			height: 500,
			modal: true,
			opacity: true,
			buttons: this.buttons,
			success: function () {
				if (core.is_optimization) {
					var json = JSON.parse(external_json['public']['configs']['dialogs']['org.goorm.core.project']['tree.json']);

					// construct basic tree structure
					self.manager.create_treeview(json);
					self.manager.create_tabview(json);

					// load plugin tree
					load_plugin_tree();

					// TreeView labelClick function
					self.manager.treeview.subscribe("clickEvent", function (nodedata) {
						var label = nodedata.node.html;
						label = label.replace(/[/#. ]/, "");
						if (/localization_key/.test(label)) label = $('#' + nodedata.node.contentElId).children().attr('tab_action');
						$("#property_tabview > *").hide();
						$("#property_tabview #property_" + label).show();
						$($("#property_tabview #property_" + label).find('input')[0]).focus();
					});

					self.grid_opacity_slider = YAHOO.widget.Slider.getHorizSlider("grid_opacity_sliderBg", "grid_opacity_slider_thumb", 0, 200, 20);
					self.grid_opacity_slider.animate = true;
					self.grid_opacity_slider.getRealValue = function () {
						return ((this.getValue() / 200).toFixed(1));
					};
					self.grid_opacity_slider.subscribe("change", function () {
						$("#grid_opacity_slider_value").val(self.grid_opacity_slider.getRealValue());
						$("#grid_opacity_slider_value_text").text((self.grid_opacity_slider.getRealValue() * 100) + "%");
					});

				} else {
					$.getJSON("configs/dialogs/org.goorm.core.project/tree.json", function (json) {
						// construct basic tree structure
						self.manager.create_treeview(json);
						self.manager.create_tabview(json);

						// load plugin tree
						load_plugin_tree();

						// TreeView labelClick function
						self.manager.treeview.subscribe("clickEvent", function (nodedata) {
							var label = nodedata.node.html;
							label = label.replace(/[/#. ]/, "");
							if (/localization_key/.test(label)) label = $('#' + nodedata.node.contentElId).children().attr('tab_action');
							$("#property_tabview > *").hide();
							$("#property_tabview #property_" + label).show();
							$($("#property_tabview #property_" + label).find('input')[0]).focus();
						});

						self.grid_opacity_slider = YAHOO.widget.Slider.getHorizSlider("grid_opacity_sliderBg", "grid_opacity_slider_thumb", 0, 200, 20);
						self.grid_opacity_slider.animate = true;
						self.grid_opacity_slider.getRealValue = function () {
							return ((this.getValue() / 200).toFixed(1));
						};
						self.grid_opacity_slider.subscribe("change", function () {
							$("#grid_opacity_slider_value").val(self.grid_opacity_slider.getRealValue());
							$("#grid_opacity_slider_value_text").text((self.grid_opacity_slider.getRealValue() * 100) + "%");
						});

					});
				}
			}
		});

		this.dialog = this.dialog.dialog;
	}
};
