// for editor.
// drag image to editor
var urlPrefix = UrlPrefix; // window.location.protocol + "//" + window.location.host;
define('editor_drop_paste', ['jquery.ui.widget', 'fileupload'], function(){
	function Process(editor) {
		var id = '__mcenew' + (new Date()).getTime();
		var str = '<div contenteditable="false" id="' + id + '" class="leanote-image-container">' + 
			'<img class="loader" src="/images/ajax-loader.gif">' + 
				'<div class="progress">' + 
					'<div class="progress-bar progress-bar-success progress-bar-striped" role="progressbar" aria-valuenow="2" aria-valuemin="0" aria-valuemax="100" style="width: 0%;">' + 
						'0%' + 
					'</div>' + 
				'</div>' + 
			'</div>';
		this.containerStr = str;
		editor.insertContent(str);
		var container = $('#' + id);
		this.container = container;
		this.id = id;
		this.processBar = container.find('.progress-bar');
	}
	Process.prototype.update = function(process) {
		var me = this;
		// 98%, 不要小数
		process = Math.ceil(process * 100);
		if(process >= 100) {
			process = 99;
		}
		process += "%";
		$('#' + me.id + ' .progress-bar').html(process).css('width', process);
	}
	Process.prototype.replace = function(src) {
		var me = this;
		getImageSize(src, function() {
			$('#' + me.id).replaceWith('<img src="' + src + '" />');
		});
	}
	Process.prototype.remove = function() {
		var me = this;
		$('#' + me.id).remove();
	}

	// 当url改变时, 得到图片的大小
	function getImageSize(url, callback) {
		var img = document.createElement('img');
	
		function done(width, height) {
			img.parentNode.removeChild(img);
			callback({width: width, height: height});
		}
	
		img.onload = function() {
			done(img.clientWidth, img.clientHeight);
		};
	
		img.onerror = function() {
			done();
		};
	
		img.src = url;
	
		var style = img.style;
		style.visibility = 'hidden';
		style.position = 'fixed';
		style.bottom = style.left = 0;
		style.width = style.height = 'auto';
	
		document.body.appendChild(img);
	}
	
	var i = 1;
	function insertImage(data) {
		var editor = tinymce.activeEditor;
		var dom = editor.dom;
	
		var renderImage = function(data2) {
			// 这里, 如果图片宽度过大, 这里设置成500px
			var d = {};
			var imgElm;
			// 先显示loading...
			d.id = '__mcenew' + (i++);
			d.src = "http://leanote.com/images/loading-24.gif";
			imgElm = dom.createHTML('img', d);
			tinymce.activeEditor.insertContent(imgElm);
			imgElm = dom.get(d.id);
			
			function callback (wh) {
				dom.setAttrib(imgElm, 'src', data2.src);
				// dom.setAttrib(imgElm, 'width', data2.width);
				if(data2.title) {
					dom.setAttrib(imgElm, 'title', data2.title);
				}
				
				dom.setAttrib(imgElm, 'id', null);
			};
			getImageSize(data.src, callback);
		}
		
		//-------------
		// outputImage?fileId=123232323
		var fileId = "";
		fileIds = data.src.split("fileId=")
		if(fileIds.length == 2 && fileIds[1].length == "53aecf8a8a039a43c8036282".length) {
			fileId = fileIds[1];
		}
		if(fileId) {
			// 得到fileId, 如果这个笔记不是我的, 那么肯定是协作的笔记, 那么需要将图片copy给原note owner
			var curNote = Note.getCurNote();
			if(curNote && curNote.UserId != UserInfo.UserId) {
				(function(data) {
					ajaxPost("/file/copyImage", {userId: UserInfo.UserId, fileId: fileId, toUserId: curNote.UserId}, function(re) {
						if(reIsOk(re) && re.Id) {
							var urlPrefix = window.location.protocol + "//" + window.location.host;
							data.src = urlPrefix + "/file/outputImage?fileId=" + re.Id;
						}
						renderImage(data);
					});
				})(data);
			} else {
				renderImage(data);
			}
		} else {
			renderImage(data);
		}
	}
	
	var initUploader =  function() {
		var ul = $('#upload ul');
	
	    $('#drop a').click(function() {
	        // trigger to show file select
	        $(this).parent().find('input').click();
	    });
	
	    // Initialize the jQuery File Upload plugin
	    $('#upload').fileupload({
	        dataType: 'json',
	        pasteZone: '', // 不允许paste
	        acceptFileTypes: /(\.|\/)(gif|jpg|jpeg|png|jpe)$/i,
	        maxFileSize: 210000,
	
	        // This element will accept file drag/drop uploading
	        dropZone: $('#drop'),
	        formData: function(form) {
	        	return [{name: 'albumId', value: ""}]
	        },
	        // This function is called when a file is added to the queue;
	        // either via the browse button, or via drag/drop:
	        add: function(e, data) {
	            var tpl = $('<li><div class="alert alert-info"><img class="loader" src="/tinymce/plugins/leaui_image/public/images/ajax-loader.gif"> <a class="close" data-dismiss="alert">×</a></div></li>');
	
	            // Append the file name and file size
	            tpl.find('div').append(data.files[0].name + ' <small>[<i>' + formatFileSize(data.files[0].size) + '</i>]</small>');
	
	            // Add the HTML to the UL element
	            data.context = tpl.appendTo(ul);
	
	            // data.form[0].action += "&album_id=" + $("#albumsForUpload").val();
	
	            // Automatically upload the file once it is added to the queue
	            var jqXHR = data.submit();
	        },
	
	        done: function(e, data) {
	            if (data.result.Ok == true) {
	                data.context.remove();
	                // life
	                var data2 = {src: urlPrefix + "/file/outputImage?fileId=" + data.result.Id}
	                insertImage(data2);
	            } else {
	                data.context.empty();
	                var tpl = $('<li><div class="alert alert-danger"><a class="close" data-dismiss="alert">×</a></div></li>');
	                tpl.find('div').append('<b>Error:</b> ' + data.files[0].name + ' <small>[<i>' + formatFileSize(data.files[0].size) + '</i>]</small> ' + data.result.Msg);
	                data.context.append(tpl);
	                setTimeout((function(tpl) {
	                	return function() {
		                	tpl.remove();
	                	}
	                })(tpl), 2000);
	            }
	            $("#uploadMsg").scrollTop(1000);
	        },
	        fail: function(e, data) {
	            data.context.empty();
	            var tpl = $('<li><div class="alert alert-danger"><a class="close" data-dismiss="alert">×</a></div></li>');
	            tpl.find('div').append('<b>Error:</b> ' + data.files[0].name + ' <small>[<i>' + formatFileSize(data.files[0].size) + '</i>]</small> ' + data.errorThrown);
	            data.context.append(tpl);
	            setTimeout((function(tpl) {
	                	return function() {
		                	tpl.remove();
	                	}
	                })(tpl), 2000);
	
	            $("#uploadMsg").scrollTop(1000);
	        }
	    });
	
	    // Prevent the default action when a file is dropped on the window
	    $(document).on('drop dragover', function(e) {
	        e.preventDefault();
	    });
	
	    // Helper function that formats the file sizes
	    function formatFileSize(bytes) {
	        if (typeof bytes !== 'number') {
	            return '';
	        }
	        if (bytes >= 1000000000) {
	            return (bytes / 1000000000).toFixed(2) + ' GB';
	        }
	        if (bytes >= 1000000) {
	            return (bytes / 1000000).toFixed(2) + ' MB';
	        }
	        return (bytes / 1000).toFixed(2) + ' KB';
	    }
	    
	    function showUpload() {
	    	$("#upload").css("z-index", 12);
	    	var top = +$("#mceToolbar").css("height").slice(0, -2); // px
	    	$("#upload").css("top", top - 8);
	    	$("#upload").show();
	    }
	    
	    function hideUpload() {
	    	$("#upload").css("z-index", 0).css("top", "auto").hide();
	    }
	    
	    // drag css
		$(document).bind('dragover', function (e) {
		    var dropZone = $('#drop'),
		        timeout = window.dropZoneTimeout;
		    if (!timeout) {
		        dropZone.addClass('in');
		        showUpload();
		    } else {
		        clearTimeout(timeout);
		    }
		    
		    var found = false,
		        node = e.target;
		    do {
		        if (node === dropZone[0]) {
		            found = true;
		            break;
		        }
		        node = node.parentNode;
		    } while (node != null);
		    if (found) {
		        dropZone.addClass('hover');
		    } else {
		        dropZone.removeClass('hover');
		    }
		    window.dropZoneTimeout = setTimeout(function () {
		        window.dropZoneTimeout = null;
		        dropZone.removeClass('in hover');
		        hideUpload();
		    }, 100);
		});
	};


	// pasteImage
	var pasteImageInit =  function() {
	    // Initialize the jQuery File Upload plugin
	    var dom, editor;
	    $('#editorContent').fileupload({
	        dataType: 'json',
	        pasteZone: $('#editorContent'),
	        dropZone: '', // 只允许paste
	        maxFileSize: 210000,
	        url: "/file/pasteImage",
	        paramName: 'file',
	        formData: function(form) {
	        	return [{name: 'from', value: 'pasteImage'}, {name: 'noteId', value: Note.curNoteId}]
	        },
	        /*
	        paste: function(e, data) {
	        	var jqXHR = data.submit();
	        },
	        */
	        progress: function(e, data) {
	        	data.process.update(data.loaded / data.total);
	        },
	        add: function(e, data) {
	        	var note = Note.getCurNote();
	        	if(!note || note.IsNew) {
	        		alert("This note hasn't saved, please save it firstly!")
	        		return;
	        	}
	        	// 先显示loading...
				editor = tinymce.EditorManager.activeEditor; 
				var process = new Process(editor);
				data.process = process;
	            var jqXHR = data.submit();
				/*
				d.id = '__mcenew' + (new Date()).getTime();
				d.src = "http://leanote.com/images/loading-24.gif"; // 写死了
				var img = '<img src="' + d.src + '" id="' + d.id + '" />';
				editor.insertContent(img);
				var imgElm = $(d.id);
				data.imgId = d.id;
				data.context = imgElm;
				*/

	        	/*
	        	// 上传之
		      	var c = new FormData;
			    c.append("from", "pasteImage");
			    // var d;
			    // d = $.ajaxSettings.xhr();
			    // d.withCredentials = i;var d = {};
			    
				// 先显示loading...
				var editor = tinymce.EditorManager.activeEditor; 
				var dom = editor.dom;
				var d = {};						
				d.id = '__mcenew';
				d.src = "http://leanote.com/images/loading-24.gif"; // 写死了
				editor.insertContent(dom.createHTML('img', d));
				var imgElm = dom.get('__mcenew');
			    $.ajax({url: "/file/pasteImage", contentType:false, processData:false , data: c, type: "POST"}
			    	).done(function(re) {
			    		if(!re || typeof re != "object" || !re.Ok) {
			    			// 删除
			    			dom.remove(imgElm);
			    			return;
			    		}
			    		// 这里, 如果图片宽度过大, 这里设置成500px
						var urlPrefix = UrlPrefix; // window.location.protocol + "//" + window.location.host;
						var src = urlPrefix + "/file/outputImage?fileId=" + re.Id;
						getImageSize(src, function(wh) {
							// life 4/25
							if(wh && wh.width) {
								if(wh.width > 600) {
									wh.width = 600;
								}
								d.width = wh.width;
								dom.setAttrib(imgElm, 'width', d.width);
							}
							dom.setAttrib(imgElm, 'src', src);
						});
						dom.setAttrib(imgElm, 'id', null);
			    	});
			    };
			    reader.readAsDataURL(blob);
			    */
	        },
	
	        done: function(e, data) {
	            if (data.result.Ok == true) {
		    		// 这里, 如果图片宽度过大, 这里设置成500px
		    		var re = data.result;
					var urlPrefix = UrlPrefix; // window.location.protocol + "//" + window.location.host;
					var src = urlPrefix + "/file/outputImage?fileId=" + re.Id;

					data.process.replace(src);
					/*
					getImageSize(src, function() {
						$img.attr('src', src);
						$img.removeAttr('id');
					});
					*/
	            } else {
					data.process.remove();
	            }
	        },
	        fail: function(e, data) {
				data.process.remove();
	        }
	    });
	};
	
	initUploader();
	pasteImageInit();
});