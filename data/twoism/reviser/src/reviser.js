var DS = {
	Modal:function(cfg){
		this.displayElem = cfg.displayElem;
		this._w		  		 = cfg._w || '598px';
		this._h		  		 = cfg._h || 'auto';
		this.winHTML 	   = $('<table class="twoism_modal">\
													<tr>\
														<td colspan="3" class="tm_top"></td>\
													</tr>\
													<tr>\
														<td class="tm_left">&nbsp;</td>\
														<td valign="top" style="vertical-align:top;padding:1px;" id="tm_content">&nbsp;</td>\
														<td class="tm_right">&nbsp;</td>\
													</tr>\
													<tr>\
														<td colspan="3" class="tm_btm"></td>\
													</tr>\
												</table>');
		this.closeModal  = function() {
			var win = this.winHTML;
			this.winHTML.fadeOut('medium',function(){
				$('#modal_overlay').remove();
				win.remove();
			});
			return false;
		};
		this.drawModal   = function() {
			$('#tm_content', this.winHTML).html(this.displayElem);
			var x = ($('body').width()/2)-(this._w/2);
			this.winHTML.css({
				'width':this._w + 'px',
				'height':this._h + 'px',
				'position':'absolute',
				'z-index':100005,
				'display':'none',
				'left':x,
				'top':$(document).scrollTop()+20
			});
			$('body').append(this.winHTML);
			this.winHTML.fadeIn('medium');
			return this;
		};
		return this.drawModal();
	},
	Reviser:function(cfg) {
		/* initialization */
		this.cfg 								= cfg;
		this.threshold					= cfg.threshold || 600;
		this.overlay  					= cfg.overlay   || true;
		this.imageDir		        = cfg.imageDir || "/reviser/images"
		// Assign CallBacks
		this.beforeSaveCallBack = cfg.beforeSave || function(html){return html;};
		this.afterSaveCallBack  = cfg.afterSave  || function(){return false;};
		
		// the elem we are editing
		this.editorElement = $(cfg.elm);
		this.actualElement = this.editorElement; // Used by modal
		
		// editorType, inline || modal. If undefined Reviser guesses based on width < cfg.threshold
		this.editorType    = cfg.editorType || ((this.editorElement.width() < this.threshold) ? 'modal':'inline');		
		
		/*-------- Editor Core ---------------*/
		this.drawModalEditor = function(){
			var frame = $('<div id="modal_reviser"></div>');
			var editorContent = $('<div id="editorContent" contenteditable="true"></div>');
			editorContent.html(this.editorElement.html());
			frame.append(this.menu.html);
			frame.append(editorContent);
			this.modal = new DS.Modal({
				_w: 598,

				displayElem:frame
			});
			this.editorElement = editorContent;
		};
		this.setupEditor = function() {
			// create a new Menu and pass it an editor instance
			this.menu = new DS.Menu(this); 
			if (this.editorType == 'inline') {
				this.appendMenuToElement();
				this.setElementToEditable();
			}else{
				this.drawModalEditor();
			}
			if (this.overlay) this.drawOverlay();
			// save the content for revert
			this.contentBackup = this.editorElement.html(); 
		};
		this.appendMenuToElement = function() {
			var coords = this.editorElement.offset();
			this.menu.html.attr("id",this.editorElement[0].id + '_reviser');
			$('body').append(this.menu.html);
			// postioning the menu
			this.menu.html.css({
				'position':'absolute',
				'display':'none',
				'top':coords.top-48,
				'left':coords.left,
				'z-index':1000003,
				'display':'none',
			});
			this.menu.html.fadeIn('medium');
			//this.menu.html.animate({ marginLeft: 500+coords.left, opacity: 'show'}, "medium");
		};
		this.drawOverlay = function(){
			// if the bgcolor of the element is transparent
			// the element will not show above the overlay.
			var bgcolor = (this.editorElement.css('background-color') != 'transparent') ? this.editorElement.css('background-color') : '#fff'
			$('body').append('<div id="modal_overlay"></div>');
			$('#modal_overlay').css({
				'background-color':'#000000',
				'height':$(document).height(),
				'left':0,
				'opacity':0.7,
				'position':'absolute',
				'top':0,
				'width':'100%',
				'z-index':100002,
				'display':'none'
			});
			this.editorElement.css({
				'z-index':1000003,
				'position':'relative',
				'background':bgcolor
			});
			$('#modal_overlay').fadeIn('medium').click(this.menu.revert);
		};
		// get rid of the click and start editing
		this.setElementToEditable = function(){
			this.editorElement.unbind('click'); 
			this.editorElement.attr('contenteditable',true);
			return true;
		};
		// kill the menu and re-bind
		this.setElementToNonEditable = function(){
			this.menu.html.fadeOut('medium');
			$('#modal_overlay').fadeOut('medium');
			this.editorElement.attr('contenteditable',false).css('z-index',100);
			$(this.editorElement).click(function(){
				this.editor = new DS.Reviser(this.editor.cfg);
			});
			return false;
		};
		/*------------------------------------*/
		
		// starting up
		this.setupEditor();
	},
	Menu:function(editor){
		this.sourceMode = false;
		// Loading the Commands
		$.extend(this,DS.Commands);
		this.editor = editor;
		// This should be passed in through a cfg at soem point
		this.html = this.editor.cfg.menuHTML || $('<div class="reviser_menu" >\
									<a href="#" class="reviser_btn" id="boldSelection" alt="Text Bold"><img src="'+this.editor.imageDir+'/btn_strong.png" border="0"></a>\
									<a href="#" class="reviser_btn" id="italicSelection" alt="Text Italic"><img src="'+this.editor.imageDir+'/btn_em.png" border="0"></a>\
									<a href="#" class="reviser_btn" id="strikethroughSelection" alt="Text Strike"><img src="'+this.editor.imageDir+'/btn_strike.png" border="0"></a>\
									<a href="#" class="reviser_btn" id="underlineSelection" alt="Text Under"><img src="'+this.editor.imageDir+'/btn_underline.png" border="0"></a>\
									<a href="#" class="reviser_btn" id="insertP" alt="Insert Paragraph"><img src="'+this.editor.imageDir+'/btn_para.png" border="0"></a>\
									<a href="#" class="reviser_btn" id="insertH1" alt="Insert H1"><img src="'+this.editor.imageDir+'/btn_h1.png" border="0"></a>\
									<a href="#" class="reviser_btn" id="insertH2" alt="Insert H2"><img src="'+this.editor.imageDir+'/btn_h2.png" border="0"></a>\
									<a href="#" class="reviser_btn" id="insertH3" alt="Insert H3"><img src="'+this.editor.imageDir+'/btn_h3.png" border="0"></a>\
									<a href="#" class="reviser_btn" id="insertH4" alt="Insert H4"><img src="'+this.editor.imageDir+'/btn_h4.png" border="0"></a>\
									<a href="#" class="reviser_btn" id="insertImage" alt="Insert Image"><img src="'+this.editor.imageDir+'/btn_image.png" border="0"></a>\
									<a href="#" class="reviser_btn" id="createLink" alt="Insert Link"><img src="'+this.editor.imageDir+'/btn_link.png" border="0"></a>\
									<a href="#" class="reviser_btn" id="insertOrderedList" alt="Insert Ordered List"><img src="'+this.editor.imageDir+'/btn_ul.png" border="0"></a>\
									<a href="#" class="reviser_btn" id="insertUnorderedList" alt="Insert Ordered List"><img src="'+this.editor.imageDir+'/btn_ul.png" border="0"></a>\
									<a href="#" class="reviser_btn" id="sourceMode" alt="HTML"><img src="'+this.editor.imageDir+'/btn_source.png" border="0"></a>\
									<a href="#" class="reviser_btn" id="save" alt="Save"><img src="'+this.editor.imageDir+'/btn_save.png" border="0"></a>\
									<a href="#" class="reviser_btn" id="revert" alt="Cancel"><img src="'+this.editor.imageDir+'/btn_cancel.png" border="0"></a>\
								</div>');
		// Bind that trick
		this.bindMenu = function(){
			// Assign scope to Menu
			var scope 	= this;
			$('.reviser_btn',this.html).each(function(){
				$(this).click(function(){
					// Methods bound to dom elems but scoped to Menu 
					scope[this.id].call(scope);
					return false
				});
			});
		};
		// Kill editing and send callbacks with elems innerHtml
		this.save = function(){
			if (this.sourceModeActive) this.exitSourceMode();
			// pre-process through beforeSave
			if (editor.editorType=='inline') {
				editor.editorElement.html(editor.beforeSaveCallBack(editor.editorElement.html()));
				editor.setElementToNonEditable();
			}else{
				editor.modal.closeModal();
				editor.actualElement.html(editor.editorElement.html());
			}
			// send afterSave with elems innerHtml
			editor.afterSaveCallBack(editor.editorElement.html());
		};
		// Don't like it, revert it.
		this.revert = function(){
			editor.editorElement.html(editor.contentBackup);
			editor.setElementToNonEditable();
			if (editor.editorType=='modal') editor.modal.closeModal();
			return false;
		};
		// bind that trick
		this.bindMenu();
		return this;
	},
	// Base commands for an editable area.
	Commands:{
		createLink:function() {
			url = this.needInput("What url? (Use http://)");
			return this.exec('createLink',url);
		},
		boldSelection: function() {
			this.exec('bold', null);
		},
		underlineSelection: function() {
			return this.exec('underline', null);
		},
		italicSelection: function() {
			return this.exec('italic', null);
		},
		strikethroughSelection: function() {
			return this.exec('strikethrough', null);
		},
		blockquoteSelection: function() {
			return this.exec('blockquote', null);
		},
		colorSelection: function(color) {
			return this.exec('forecolor', color);
		},
		insertOrderedList: function() {
			return this.exec('insertorderedlist', null);
		},
		insertUnorderedList: function() {
			return this.exec('insertunorderedlist', null);
		},
		insertImage: function() {
			url = this.needInput("What url? (Use http://)");
			return this.exec('insertImage', url);
		},
		insertHTML: function(html) {
	 		if ($.browser.msie) {
		     var range = this.editingElement._selection.getRange();
		     range.pasteHTML(html);
		     range.collapse(false);
		     range.select();
		   } else {
				 var html = this.needInput('HTML?');
		     return this.exec('insertHTML', html);
		   }
		},
		insertH1: function() {
	 		return this.exec('FormatBlock', "h1");
		},
		insertH2: function() {
	 		return this.exec('FormatBlock', "h2");
		},
		insertH3: function() {
	 		return this.exec('FormatBlock', "h3");
		},
		insertH4: function() {
	 		return this.exec('FormatBlock', "h4");
		},
		insertP: function() {
	 		return this.exec('FormatBlock', "p");
		},
		exitSourceMode:function(){
			this.sourceModeActive = false;
			var scope   		= this;
			var content 		= $('#reviser_source').val().replace("\n","").replace("\t","");
			$('#reviser_source',this.editorElement).replaceWith(content);
			$('#sourceMode',this.html).unbind('click').click(function(){ scope.sourceMode(); return false; });
			return false;
		},
		sourceMode:function(){
			this.sourceModeActive = true; // tell the menu we are editing source
			var ta 					= $('<textarea id="reviser_source"></textarea>');
			var el 					= this.editor.editorElement;
			var content 		= el.html();
			var scope   		= this; // needed for rebind of the btn
			
			/* wrap the elem in the textarea. You would think this 
			would place the innerHTML in the ta but this is not so.
			so we store the content and set the val after wrapping*/
			el.children().wrapAll(ta); 
			$('#reviser_source').val(content);
			$('#reviser_source').css({
				'width':el.width()-10,
				'height':el.height()
			});
			// bind the exit method
			$('#sourceMode',this.html).unbind('click').click(function(){ scope.exitSourceMode(); return false; });
		},
		needInput:function(msg) {
			var resp = prompt(msg);
			if (resp == "") {
				this.needInput(msg);
			}else{
				return resp;
			}
		},
		exec:function(fn,val){
			document.execCommand(fn,false,val);
			return false;
		}
	}
};