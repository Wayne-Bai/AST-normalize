/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

/*jslint evil: true, devel: true, node: true, plusplus: true, unparam: false */
/*global mongoose: true, Scheme: true, org: true, core: true, goorm: true, io: true */

org.goorm.plugin.jsp = function () {
	this.name = "jsp";
	this.mainmenu = null;
};

org.goorm.plugin.jsp.prototype = {
	init: function () {
		
		this.add_project_item();
		
		this.mainmenu = core.module.layout.mainmenu;
		
		//this.debugger = new org.uizard.core.debug();
		//this.debug_message = new org.uizard.core.debug.message();
		
		this.cErrorFilter = /[A-Za-z]* error: [A-Za-z0-9 '",:_\\\/\.\+\-\*\#\@]*/;
		this.cWarningFilter = /[A-Za-z]* warning: [A-Za-z0-9 '",:_\\\/\.\+\-\*\#\@]*/;
		this.lineFilter = /:[0-9]*:/;
		
		this.add_mainmenu();
		
		this.add_menu_action();
		
		//core.dictionary.loadDictionary("plugins/org.uizard.plugin.c/dictionary.json");
	},
	
	
	add_project_item: function () {
		$("div[id='project_new']").find(".project_types").append("<div class='project_wizard_first_button' project_type='jspp'><div class='project_type_icon'><img src='/org.goorm.plugin.jsp/images/jsp.png' class='project_icon' /></div><div class='project_type_title'>JSP Project</div><div class='project_type_description'>JSP Project (HTML5/Javascript)</div></div>");
		
		$("div[id='project_new']").find(".project_items").append("<div class='project_wizard_second_button all jspp' description='  Create New Project for jsp' project_type='jsp' plugin_name='org.goorm.plugin.jsp'><img src='/org.goorm.plugin.jsp/images/jsp_console.png' class='project_item_icon' /><br /><a>JSP Project</a></div>");
		
		$(".project_dialog_type").append("<option value='jsp'>jsp Projects</option>").attr("selected", "");
		
	},

	add_mainmenu: function () {
		var self = this;
		
		$("ul[id='plugin_new_project']").append("<li class=\"yuimenuitem\"><a class=\"yuimenuitemlabel\" href=\"#\" action=\"new_file_jsp\" localizationKey='file_new_jsp_project'>JSP Project</a></li>");
		//this.mainmenu.render();
	},
	
	add_menu_action: function () {
		$("a[action=new_file_jsp]").unbind("click");
		$("a[action=new_file_jsp]").click(function () {
			core.dialog.new_project.show();
			$(".project_wizard_first_button[project_type=jspp]").trigger("click");
			$("#project_new").find(".project_types").scrollTop($(".project_wizard_first_button[project_type=jspp]").position().top - 100);
		});
	},
	
	new_project: function(data) {
		/* data = 
		   { 
			project_type,
			project_detailed_type,
			project_author,
			project_name,
			project_desc,
			use_collaboration
		   }
		*/
		var send_data = {
				"plugin" : "org.goorm.plugin.jsp",
				"data" : data
		};
		
		$.get('/plugin/new', send_data, function(result){
			setTimeout(function(){
				var filepath = core.status.current_project_path + '/';
				var filename = 'index.jsp';
				var filetype = 'jsp';

				core.module.layout.workspace.window_manager.open(filepath, filename, filetype, null, {});
				core.module.layout.project_explorer.refresh();
				$(core).trigger("on_project_open");
			}, 500);

	
				
		});
	},
	
	run: function(path) {
		var property = core.property.plugins['org.goorm.plugin.jsp'];
		var main = property['plugin.jsp.main'];
		var run_path = property['plugin.jsp.run_path'];
		var deploy_path = property['plugin.jsp.deploy_path'];

		
		var send_data = {
				"plugin" : "org.goorm.plugin.jsp",
				"data" : {
					"project_path" : path,
					"deploy_path" : deploy_path
				}
		};

		$.get('/plugin/run', send_data, function(result){
			if(result.code == 200){
				//success 
				window.open(run_path + path +'/'+main, '_blank', 'width=600 height=400');
			}
			else{
				//failure
//				console.log("err!",result);
				alert.show("Cannot run this project! <br>Check deploy path");
			}
		});
		

		
	},
	
	build: function (projectName, callback) {
		var self=this;
		var workspace = core.preference.workspace_path;
		var property = core.property;
		if(projectName) {
			core.workspace[projectName] && (property = core.workspace[projectName])
		}
		else {
			projectName = core.status.current_project_path;
		}
		var plugin = property.plugins['org.goorm.plugin.jsp'];
		var buildOptions = " "+plugin['plugin.jsp.build_option'];
		var buildPath = " "+workspace+projectName+"/"+plugin['plugin.jsp.build_path'];
		var sourcePath = " "+workspace+projectName+"/"+plugin['plugin.jsp.source_path'];
		
		var buildPath_guarantee_cmd='';
		buildPath_guarantee_cmd+= 'if [ ! -d '+workspace+projectName+'/'+plugin['plugin.jsp.build_path']+' ];';
		buildPath_guarantee_cmd+= 'then mkdir -p '+workspace+projectName+'/'+plugin['plugin.jsp.build_path']+';';
		buildPath_guarantee_cmd+= 'fi;clear;\n\r';


		var cmd = workspace+projectName+"/"+"make"+sourcePath+buildPath+buildOptions;
		core.module.layout.terminal.send_command(buildPath_guarantee_cmd, null);
		core.module.layout.terminal.send_command(cmd+'\r', null, function(result){
			// if(/Build Complete/g.test(result)){
			// 	notice.show(core.module.localization.msg['alert_plugin_build_success']);
			// }
			// else {
			// 	alert.show(core.module.localization.msg['alert_plugin_build_error']);
			// }
			//core.module.toast.show(core.module.localization.msg['alert_plugin_check_terminal']);
			core.module.layout.project_explorer.refresh();
		});
		setTimeout(function(){
			core.module.toast.show(core.module.localization.msg['alert_plugin_check_terminal']);
		},1000);
		
		if(callback) callback();
	},
	
	clean: function(project_name){
		var workspace = core.preference.workspace_path;
		var property = core.property;
		if(project_name) {
			core.workspace[project_name] && (property = core.workspace[project_name])
		}
		else {
			var project_name = core.status.current_project_path;
		}
		var plugin = property.plugins['org.goorm.plugin.jsp'];
		var buildPath = plugin['plugin.jsp.build_path'];
		core.module.layout.terminal.send_command("rm -rf "+workspace+project_name+"/"+buildPath+"* \r", null, function(){
			core.module.layout.project_explorer.refresh();
		});
	}
};
