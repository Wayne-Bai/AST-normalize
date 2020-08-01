/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

/*jshint newcap:false, debug:true, unused: true, evil: true, devel: true, plusplus: false, browser: true, jquery: true, undef:false */
/*clientside jslint comment for global */
/*global org: false, core: false, YAHOO: false, localStorage: false */
/*jshint unused: false */




org.goorm.core.preference.language = {
	preference: null,

	init: function () {

		var language = "";
		var language_button = new YAHOO.widget.Button("language_button", {
			type: "menu",
			menu: "language_select"
		});

		language_button.getMenu().subscribe("click", function (type, menuitems) {
			var menuitem = menuitems[1];
			if (menuitem) {
				$("#language_button-button").text($(menuitem.element).text());

				if (!core.is_mobile) {
					core.module.localization.change_language(menuitem.value, true);
				}
			}

		});

		if (localStorage.getItem("language") === null) {
			if (core.server_language == "client") {
				if (navigator.language == "ko") {
					language = "kor";
				} else {
					language = "us";
				}
			} else {
				language = core.server_language;
			}

			if (!core.is_mobile) {
				core.module.localization.change_language(language);
			}
		} else {
			if (!core.is_mobile) {
				core.module.localization.change_language(localStorage.getItem("language"));
			}
		}
	}
};
