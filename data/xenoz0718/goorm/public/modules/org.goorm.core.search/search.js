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



org.goorm.core.search = {
	dialog: null,
	buttons: null,
	last_pos: null,
	last_query: null,
	marked: [],
	match_case: false,
	ignore_whitespace: false,
	use_regexp: false,
	replace_cursor: null,
	matched_file_list: [],
	treeview: null,
	query: null,

	init: function () {
		var self = this;

		this.buttons = [{
			'id': 'g_search_btn_find',
			text: "<span localization_key='find'>Find</span>",
			handler: function () {
				self.search();
			},
			isDefault: true
		}, {
			'id': 'g_search_btn_close',
			text: "<span localization_key='close'>Close</span>",
			handler: function () {
				self.hide();
			}
		}];

		this.dialog = org.goorm.core.search.dialog;
		this.dialog.init({
			localization_key: "title_search",
			title: "Search",
			path: "configs/dialogs/org.goorm.core.search/search.html",
			width: 550,
			height: 245,
			modal: false,
			opacity: true,
			buttons: this.buttons,
			draggable: true,
			success: function () {
				$("#search_project_explorer").append("<div id='search_project_selector' style='width: 460px; float: right'></div>");
				$("#search_project_selector").append("<label class='selectbox'><select id='search_project_selectbox' style='width: 220px;'></select></label>");
				$("#search_project_selector").append("<label id='search_path_input' style='display:none'>hi</label>");

				$("#search_project_selectbox").change(function () {
				});

				$("#search_query_inputbox").keydown(function (e) {
					var ev = e || event;

					if (ev.keyCode == 27) {
						// esc key
						self.hide();
					}

					if (ev.keyCode == 13) {
						self.search();

						e.stopPropagation();
						e.preventDefault();
						return false;
					}

				});

				// focus find inputbox by native javascript
				var moveCaretToEnd = function (el) {
					if (typeof el.selectionStart == "number") {
						el.selectionStart = el.selectionEnd = el.value.length;
					} else if (typeof el.createTextRange != "undefined") {
						el.focus();

						var range = el.createTextRange();
						range.collapse(false);
						range.select();
					}
				};

				var input_box = document.getElementById("search_query_inputbox");
				input_box.onfocus = function () {
					moveCaretToEnd(input_box);

					// Work around Chrome's little problem
					window.window.setTimeout(function () {
						moveCaretToEnd(input_box);
					}, 5);
				};

				// Checkbox event handler
				$("#search_match_case").change(function () {
					if ($("#search_match_case")[0].checked === true)
						self.match_case = true;
					else
						self.match_case = false;
				});

				$("#search_match_case_checkbox_name").click(function () {
					if ($("#search_match_case")[0].checked === true) {
						$("#search_match_case")[0].checked = false;
						self.match_case = false;
					} else {
						$("#search_match_case")[0].checked = true;
						self.match_case = true;
					}
				});

				$("#search_ignore_whitespace").change(function () {
					if ($("#search_ignore_whitespace")[0].checked === true)
						self.ignore_whitespace = true;
					else
						self.ignore_whitespace = false;
				});

				$("#search_ignore_whitespace_checkbox_name").click(function () {
					if ($("#search_ignore_whitespace")[0].checked === true) {
						$("#search_ignore_whitespace")[0].checked = false;
						self.ignore_whitespace = false;
					} else {
						$("#search_ignore_whitespace")[0].checked = true;
						self.ignore_whitespace = true;
					}
				});

				$("#search_use_regexp").change(function (e) {
					if ($("#search_use_regexp")[0].checked === true) {
						self.use_regexp = true;
						$("#search_match_case")[0].checked = false;
						$("#search_match_case")[0].disabled = true;
						$("#search_ignore_whitespace")[0].checked = false;
						$("#search_ignore_whitespace")[0].disabled = true;
					} else {
						self.use_regexp = false;
						$("#search_match_case")[0].disabled = false;
						$("#search_ignore_whitespace")[0].disabled = false;
					}
				});

				$("#search_use_regexp_checkbox_name").click(function () {
					if ($("#search_use_regexp")[0].checked === true) {
						$("#search_use_regexp")[0].checked = false;
						self.use_regexp = false;
						$("#search_match_case")[0].disabled = false;
						$("#search_ignore_whitespace")[0].disabled = false;
					} else {
						$("#search_use_regexp")[0].checked = true;
						self.use_regexp = true;
						$("#search_match_case")[0].checked = false;
						$("#search_match_case")[0].disabled = true;
						$("#search_ignore_whitespace")[0].checked = false;
						$("#search_ignore_whitespace")[0].disabled = true;
					}
				});

				if (core.is_optimization) {
					self.dialog.dialog.panel.hideEvent.subscribe(function (e) {
						self.unmark();
					});

					self.dialog.dialog.panel.subscribe('show', function () {
						$("#search_query_inputbox").focus();
					});
				} else {
					self.dialog.panel.hideEvent.subscribe(function (e) {
						self.unmark();
					});

					self.dialog.panel.subscribe('show', function () {
						$("#search_query_inputbox").focus();
					});
				}
			}
		});

		this.dialog = this.dialog.dialog;

	},

	search: function () {
		var self = this;
		var search_path;
		if($("#search_path_input").css('display')!='none'){
			search_path=$("#search_path_input").text();
		}else{
			search_path=$("#search_project_selectbox option:selected").attr("value");
		}
		
		if(!search_path){
			return;
		}
		var keyword = $("#search_query_inputbox").val();
		if (!keyword)
			return;

		var grep_option = " -r -n -R";
		var text = keyword;
		var caseFold = true;

		if (this.use_regexp === true) {
			grep_option += " -E";
		} else {
			if (this.match_case === true) {
				caseFold = false;
			} else {
				grep_option += " -i";
			}

			if (this.ignore_whitespace === true)
				text = text.replace(/\s*/g, '');
		}
		this.query = text;
		text = "\"" + text + "\"";

		grep_option += " --exclude '.*'";
		
		self.get_matched_file(text, grep_option,search_path);

	},
	set_search_treeview: function (data) {
		var self = this;
		core.module.layout.inner_bottom_tabview.selectTab(2);
		core.module.layout.inner_layout.getUnitByPosition("bottom").expand();
		var window_manager = core.module.layout.workspace.window_manager;
		var firstActivate = window_manager.active_window;

		var search = function(filename, filetype, filepath, matched_line) {
			var __window = window_manager.open(filepath, filename, filetype);

			setTimeout(function () {
				var cm = __window.editor.editor;
				cm.focus();
				cm.setCursor(matched_line - 1);

				if (self.query) {
					var caseFold = true;

					if (self.use_regexp !== true && self.match_case === true) {
						caseFold = false;
					}

					var theme = cm.getOption('theme');
					var search_class = 'searched';

					if (__window.editor.dark_themes.indexOf(theme) > -1) {
						search_class = 'searched-opacity';
					}

					for (var cursor = cm.getSearchCursor(self.query, null, caseFold); cursor.findNext();) {
						self.marked.push(
							cm.markText(cursor.from(), cursor.to(), {
								'className' : search_class
							})
						);
					}
				}
			}, 400);
		}

		if (data) {
			var sorting_data = [];
			for (key in data) {
				sorting_data.push(data[key]);
			}
			self.treeview = new YAHOO.widget.TreeView("search_treeview", sorting_data);

			self.treeview.subscribe("clickEvent", function (nodedata) {
				var filename = nodedata.node.data.filename;
				var filetype = nodedata.node.data.filetype;
				var filepath = nodedata.node.data.filepath;
				var matched_line = nodedata.node.data.matched_line;

				search(filename, filetype, filepath, matched_line);
			});

			self.treeview.subscribe("dblClickEvent", function (nodedata) {
				var filename = nodedata.node.data.filename;
				var filetype = nodedata.node.data.filetype;
				var filepath = nodedata.node.data.filepath;
				var matched_line = nodedata.node.data.matched_line;

				search(filename, filetype, filepath, matched_line);
			});
			
			self.treeview.render();
		} else {
			if (window_manager.window[window_manager.active_window]) {
				window_manager.window[window_manager.active_window].editor.clear_highlight();
			}

			$("#search_treeview").empty();
			var html = "<div class='node' style='font-size: 11px; padding: 2px 5px;'>" + core.module.localization.msg.notice_no_matched_fild + "</div>";
			$("#search_treeview").append(html);
			core.module.toast.show(core.module.localization.msg.alert_cannot_find_word, null, function (){
				$("#find_query_inputbox").focus();
			});
		}

		if (window_manager.window[firstActivate])
			window_manager.window[firstActivate].activate();
	},
	get_matched_file: function (text, grep_option, search_path) {
		var self = this;
		var path_arr=search_path.split('/');
		var folder_path=path_arr.slice(2).join('/');

		var postdata = {
			find_query: text,
			project_path:  '/'+path_arr[1],
			folder_path : folder_path,
			grep_option: grep_option
		};

		self.matched_file_list = [];

		core.module.loading_bar.start("Searching......");

		$.get("file/search_on_project", postdata, function (data) {
			var length = 0;
			if (data) {
				for(var attr in data) {length++;}
			}

			if (length == 0) {
				core.module.loading_bar.stop();
				
				core.module.toast.show(core.module.localization.msg.alert_cannot_find_word, null, function (){
					$('#search_query_inputbox').focus();
				});
			}
			else {
				self.set_search_treeview(data);
				core.module.loading_bar.stop();
			}
		});

	},

	unmark: function () {
		for (var i = 0; i < this.marked.length; ++i) this.marked[i].clear();
		this.marked.length = 0;
	},

	show: function (path) {
		if(path){
			$("#search_project_selectbox").parent().css('display','none');
			$("#search_path_input").css('display','');
			$("#search_path_input").text(path);
		}else{
			$("#search_project_selectbox").parent().css('display','');
			$("#search_path_input").css('display','none');
		}
		this.make_search_project_selectbox();

		// Get current active_window's editor
		var window_manager = core.module.layout.workspace.window_manager;
		if (window_manager.window[window_manager.active_window] && window_manager.window[window_manager.active_window].editor !== undefined) {
			// Get current active_window's CodeMirror editor
			var editor = window_manager.window[window_manager.active_window].editor.editor;

			if (editor.getSelection() !== "") {
				$("#search_query_inputbox").val(editor.getSelection());
			}
		}

		this.dialog.panel.show();
		$("#search_query_inputbox").focus();
	},

	hide: function () {
		this.dialog.panel.hide();
	},

	make_search_project_selectbox: function () {
		var self = this;
		$("#search_project_selectbox").empty();

		$("#search_project_selectbox").append("<option value='null' localization_key='dialog_search_project_select_guide' selected>" + core.module.localization.msg.notice_search_select_project + "</option>");

		var max_num = parseInt($("#search_project_selector").width() / 8, 10);

		if (core.module.layout.project_explorer.project_data) {
			for (var project_idx = 0; project_idx < core.module.layout.project_explorer.project_data.length; project_idx++) {
				var temp_name = core.module.layout.project_explorer.project_data[project_idx].name;

				if (temp_name.length > max_num) {
					temp_name = temp_name.substring(0, max_num - 1);
					temp_name += " …";
				}

				if (core.module.layout.project_explorer.project_data[project_idx].name == core.status.current_project_path) {
					$("#search_project_selectbox").append("<option value='/" + core.module.layout.project_explorer.project_data[project_idx].name + "' selected>" + temp_name + "</option>");
				} else {
					$("#search_project_selectbox").append("<option value='/" + core.module.layout.project_explorer.project_data[project_idx].name + "'>" + temp_name + "</option>");
				}
			}

			$("#search_project_selectbox").append("<option value=''>All Projects</option>");
		}
	}
};
