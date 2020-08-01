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



org.goorm.core.folder.upload = {
	dialog: null,
	buttons: null,
	dialog_explorer: null,
	


	init: function () {
		var self = this;

		var handle_ok = function () {
			this.hide();
			var postdata={};
			postdata.dir_arr=self.dir_arr;
			postdata.target_path=$('#folder_upload_location_path').val() ;
			if (postdata.target_path === "" || postdata.target_path === "/") {
			 	alert.show(core.module.localization.msg.alert_deny_make_file_in_workspace_root);
			 	return;
			}
			core.module.loading_bar.start("Folder upload processing...");
			
			$.post('/upload/dir_skeleton', postdata, function(res){
				if(!res){
					core.module.loading_bar.stop();
					return false;
				}

				//2. file upload
			    var formData = new FormData();
			    for (var i = 0; i < self.file_arr.length; i++) {
				  formData.append('file', self.file_arr[i]);
				}
				formData.append('target_path', postdata.target_path)


				console.log(formData);
				var xhr = new XMLHttpRequest();
				xhr.open('POST', '/upload/dir_file');
				xhr.onload = function () {
					console.log(xhr);

					if (xhr.status === 200) {
						console.log('all done: ' + xhr.status);
				  	} else {
				  		alert.show('Upload Fail');
						console.log('Something went terribly wrong...');
				  	}
				  	core.module.loading_bar.stop();
				  	self.refresh();
				  	core.module.layout.project_explorer.refresh()
				  	

				};

				xhr.send(formData);
				




			});


			
		};

		var handle_cancel = function () {
			//hide && empty 
			this.hide();
			self.refresh();
		};

		this.buttons = [{
			id: "g_folder_upload_btn_ok",
			text: "<span localization_key='ok'>OK</span>",
			handler: handle_ok,
			isDefault: true
		}, {
			id: "g_folder_upload_btn_cancel",
			text: "<span localization_key='cancel'>Cancel</span>",
			handler: handle_cancel
		}];

		this.dialog = org.goorm.core.folder.upload.dialog;
		this.dialog.init({
			localization_key: "title_import_file",
			title: "Upload Folder",
			path: "configs/dialogs/org.goorm.core.file/folder.upload.html",
			width: 800,
			height: 500,
			modal: true,
			opacity: true,
			buttons: this.buttons,
			kind: "import",
			success: function () {

				var resize = new YAHOO.util.Resize("folder_upload_dialog_left", {
					handles: ['r'],
					minWidth: 200,
					maxWidth: 400
				});

				resize.on('resize', function (ev) {
					var width = $("#folder_upload_dialog_middle").width();
					var w = ev.width;

					$("#folder_upload_files").css('width', (width - w - 9) + 'px');
				});

				

				self.input = document.getElementById("folder_upload_file");

				self.input.addEventListener("change", function(e){
					self.folder_upload_handle(e);
				});




			}
		});
		this.dialog = this.dialog.dialog;

		this.dialog_explorer = new org.goorm.core.dialog.explorer();
	},

	show: function () {
		var self = this;
		self.dialog_explorer.init("#folder_upload", false);
		this.dialog.panel.show();
		self.refresh();
	},
	refresh :function(){
		var self=this;
		self.dir_arr = [];
		self.file_arr = [];
		 $("#folder_upload_file").val("");

	},

	folder_upload_handle : function(e){
		var self=this;
		var files = e.target.files;
		if(!files || !files[0])return false;
		var root_dir=files[0].webkitRelativePath.split('/')[0];
	    var total_size=0;
	    

	    self.dir_arr.push(root_dir);


	    for(var i=0;i<files.length;i++){
			total_size+=files[i].size;
			console.log(i, files[i].webkitRelativePath);



			//!!dir
			if(files[i].name==='.'){
				if(/[^a-zA-Z0-9_\-\.\/]/.test(files[i].webkitRelativePath)){
					alert.show('Filename ['+files[i].webkitRelativePath+'] is not allowed');
					self.refresh();
					files=[];
					return false;
				}
				self.dir_arr.push(files[i].webkitRelativePath);
			}else{
				if(/[^a-zA-Z0-9_\-\.]/.test(files[i].name)){
					alert.show('Filename ['+files[i].name+'] is not allowed');
					self.refresh();
					files=[];
					return false;
				}
				self.file_arr.push(files[i]);
			}
		}
		if(total_size>= 10000000){
			self.refresh();
			files=[];
			alert.show('too big file size');
		}



	},
};
