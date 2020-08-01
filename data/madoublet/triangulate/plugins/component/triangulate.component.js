// create namespace
var triangulate = triangulate || {};
triangulate.component = triangulate.component || {};

// slideshow component
triangulate.component.slideshow = {

	// init slideshow
	init:function(){
		
		$(document).on('click', '.add-slideshow-image', function(){
		
			// get scope from page
			var scope = angular.element($("section.main")).scope();
			
			scope.retrieveImages();
		
			$('#imagesDialog').attr('data-plugin', 'triangulate.component.slideshow');
			$('#imagesDialog').modal('show');
		});
		
		// caption focus (for images)
		$(document).on('focus', '.caption input', function(){
			$(this.parentNode.parentNode).addClass('edit');
		});
	
		// caption blur (for images)
		$(document).on('blur', '.caption input', function(){
			var caption = $(this).val();
			$(this.parentNode.parentNode).find('img').attr('title', caption);
			$(this.parentNode.parentNode).removeClass('edit');
		});
		
		// remove-image click
		$(document).on('click', '.remove-image', function(){
			$(this.parentNode).remove();
			context.find('a.'+this.parentNode.className).show();
			return false;
		}); 
	
		// make parsed elements sortable
		$(document).on('triangulate.editor.contentLoaded', function(){	
			// make the elements sortable
			$('.triangulate-slideshow div').sortable({handle:'img', items:'span.image', placeholder: 'editor-highlight', opacity:'0.6', axis:'x'});
			
		});
		
	},
	
	// adds an image to the slideshow
	addImage:function(image){
	
		// get current node
		var node = $(triangulate.editor.currNode);
		
		// build html
		var html = '<span class="image"><img src="' + image.fullUrl + '" title="">' +
				   '<span class="caption"><input type="text" value="" placeholder="Enter Caption" maxwidth="140"></span>' +
				   '<a class="remove-image fa fa-minus-circle"></a></span>';
				   
		$(node).find('.images').append(html);
		
		$('#imagesDialog').modal('hide');
		
		return true;
	
	},

	// creates slideshow
	create:function(){
	
		// generate uniqId
		var id = triangulate.editor.generateUniqId('slideshow', 'slideshow');
		
		// build html
		var html = triangulate.editor.defaults.elementMenu +
					'<div class="images">' +
					'<button type="button" class="add-slideshow-image"><i class="fa fa-picture-o"></i></button>' +
					'</div>';		
					
		// tag attributes
		var attrs = [];
		attrs['id'] = id;
		attrs['data-id'] = id;
		attrs['class'] = 'triangulate-slideshow';
		attrs['data-cssclass'] = '';
		attrs['data-indicators'] = 'true';
		attrs['data-arrows'] = 'true';
		attrs['data-interval'] = '5000';
		attrs['data-wrap'] = 'true';
		
		// append element to the editor
		triangulate.editor.append(
			 utilities.element('div', attrs, html)
		);
		
		// make the elements sortable
		$('.triangulate-slideshow div').sortable({handle:'img', items:'span.image', placeholder: 'editor-highlight', opacity:'0.6', axis:'x'});
		
		return true;
		
	},
	
	// parse slideshow
	parse:function(node){
	
		// get params
		var id = $(node).attr('id');
		
		// build html
		var html = triangulate.editor.defaults.elementMenu +
					'<div class="images">' +
					'<button type="button" class="add-slideshow-image"><i class="fa fa-picture-o"></i></button>';
		
		// get images			
		var imgs = $(node).find('img');	
				
		for(var y=0; y<imgs.length; y++){
		
			// get caption
			var title = $(imgs[y]).attr('title');
			var src = $(imgs[y]).attr('ng-src');
		
			// get scope from page
			var scope = angular.element($("section.main")).scope();
			
			// get domain from scope
			var url = scope.site.ImagesURL;
			
			// replace the images URL with the URL from the site
			src = utilities.replaceAll(src, '{{site.ImagesURL}}', url);
			
			var image = '<img src="' + src + '" title="' + title + '">';
			
			// build html
			html +=	'<span class="image">' + image + 
					'<span class="caption">' +
					'<input type="text" value="' + title + '" placeholder="Enter caption" maxwidth="140">' +
					'</span>' +
					'<a class="remove-image fa fa-minus-circle"></a>' +
					'</span>';
		
		}			

		// add button				  	
		html += '</div>';				
					
		// tag attributes
		var attrs = [];
		attrs['id'] = id;
		attrs['data-id'] = id;
		attrs['class'] = 'triangulate-slideshow';
		attrs['data-cssclass'] = $(node).attr('class');
		attrs['data-indicators'] = $(node).attr('indicators');
		attrs['data-arrows'] = $(node).attr('arrows');
		attrs['data-interval'] = $(node).attr('interval');
		attrs['data-wrap'] = $(node).attr('wrap');
		
		// return element
		return utilities.element('div', attrs, html);
				
	},
	
	// generate slideshow
	generate:function(node){

  		// html for tag
  		var html = '';
  		
  		// get images
  		var imgs = $(node).find('img');
  		
  		for(var y=0; y<imgs.length; y++){
  		
  			var title = $(imgs[y]).attr('title');
  			var src = $(imgs[y]).attr('src');
  		
  			// removes the domain from the img
	  		if(src != ''){
		  		var parts = src.split('files/');
		  		src = 'files/' + parts[1];
	  		}
  			
  			var image = '<img ng-src="{{site.ImagesURL}}' + src + '" title="' + title + '">';
  			
			html += '<div>' + image + '</div>';
		}
  		
		// tag attributes
		var attrs = [];
		attrs['id'] = $(node).attr('data-id');
		attrs['class'] = $(node).attr('data-cssclass');
		attrs['indicators'] = $(node).attr('data-indicators');
		attrs['arrows'] = $(node).attr('data-arrows');
		attrs['interval'] = $(node).attr('data-interval');
		attrs['wrap'] = $(node).attr('data-wrap');
		
		// return element
		return utilities.element('triangulate-slideshow', attrs, html);
		
	},
	
	// config slideshow
	config:function(node, form){}
	
};

triangulate.component.slideshow.init();

// map component
triangulate.component.map = {

	// creates map
	create:function(){
	
		// generate uniqId
		var id = triangulate.editor.generateUniqId('map', 'map');
		
		// build html
		var html = triangulate.editor.defaults.elementMenu +
					'<i class="in-textbox fa fa-map-marker"></i>' +
					'<input type="text" value="" spellcheck="false" maxlength="512" placeholder="1234 Main Street, Some City, LA 90210">';
					
		// tag attributes
		var attrs = [];
		attrs['id'] = id;
		attrs['data-id'] = id;
		attrs['class'] = 'triangulate-map';
		attrs['data-cssclass'] = '';
		attrs['data-zoom'] = 'auto';
		
		// append element to the editor
		triangulate.editor.append(
			 utilities.element('div', attrs, html)
		);
	
		return true;
		
	},
	
	// parse map
	parse:function(node){
	
		// get params
		var id = $(node).attr('id');
		var address = $(node).attr('address');
		var zoom = $(node).attr('zoom');
		
		// build html
		var html = triangulate.editor.defaults.elementMenu +
					'<i class="in-textbox fa fa-map-marker"></i>' +
					'<input type="text" value="' + address + '" spellcheck="false" maxlength="512" placeholder="1234 Main Street, Some City, LA 90210">';
					
		// tag attributes
		var attrs = [];
		attrs['id'] = id;
		attrs['data-id'] = id;
		attrs['class'] = 'triangulate-map';
		attrs['data-cssclass'] = $(node).attr('class');
		attrs['data-zoom'] = $(node).attr('zoom');
		
		// return element
		return utilities.element('div', attrs, html);
				
	},
	
	// generate map
	generate:function(node){

		// tag attributes
		var attrs = [];
		attrs['id'] = $(node).attr('data-id');
		attrs['class'] = $(node).attr('data-cssclass');
		attrs['address'] = $(node).find('input').val();
		attrs['zoom'] = $(node).attr('data-zoom');
		
		// return element
		return utilities.element('triangulate-map', attrs, '');
		
	},
	
	// config map
	config:function(node, form){}
	
};

// form component
triangulate.component.form = {

	// inits the form
	init:function(){
	
		// adds a field
		$(document).on('click', '.add-field', function(){
			
			var node = $(triangulate.editor.currNode);
			
			// add temp field
			node.find('.field-list').append(
				triangulate.component.form.buildMock('text', 'Field', 'field-1', 'false', '', '', '', '')
			);
			
		});
		
		
		// make parsed elements sortable
		$(document).on('triangulate.editor.contentLoaded', function(){	
			// make the elements sortable
			$('.triangulate-form>div').sortable({handle: '.mock-field', placeholder: 'editor-highlight', opacity:'0.6', axis:'y'});
			
		});
		
		// get a reference to the form
		$(document).on('keyup', '.config[data-action="triangulate.component.form"] [name="field-label"]', function(){
			var $el = $(this);
		
			var id = utilities.toTitleCase($el.val());
		
			// get fields scope
			var fscope = angular.element($el).scope();
			
			// set id in scope
			fscope.element.id = id;
		});
		
	},
	
	// builds a mock
	buildMock:function(type, label, id, required, helper, placeholder, cssClass, options){
	
		// create field
  		var field = '<label for="field" element-text="label">' + label + '</label>' +
				'<div class="mock-field">' +
				'<span class="placeholder" element-text="placeholder">' + placeholder + '</span>' +
				'<span class="field-type" element-text="type">' + type + '</span></div>' +
				'<span class="helper-text" element-text="helper">' + helper + '</label>';
		
		// tag attributes
		var attrs = [];
		attrs['class'] = 'triangulate-field triangulate-element';
		attrs['data-type'] = type;
		attrs['data-label'] = label;
		attrs['data-required'] = required;
		attrs['data-helper'] = helper;
		attrs['data-placeholder'] = placeholder;
		attrs['data-id'] = id;
		attrs['data-cssclass'] = cssClass;
		attrs['data-options'] = options;
		
		// return element
		return utilities.element('div', attrs, field);
		
	},
	

	// builds a field
	buildField:function(type, label, id, required, helper, placeholder, cssClass, options){
	
		// create model from id
		var model = utilities.toTitleCase(id);
	
		// set label
		var html = '<label for="' + id + '"'; 
		var prefix = '';
		
		if(id != null){
		
			// get scope
			var scope = angular.element($("section.main")).scope();
			
			// get pageId
			prefix = scope.page.PageId + '.';
		
			html += 'id="' + id + '-label" ng-i18next="[html]' + prefix + id + '-label">';
		}
		else{
			html += '>';
		}
		
		html += label + '</label>';
		
		var req = '';
		
		if(required == 'true'){
			req = ' required';
		}

		// create textbox
		if(type=='text'){
			html += '<input id="' + id + '" name="' + id + 
					'" type="text" class="form-control" placeholder="'+placeholder+'"' + req +
					' ng-model="temp.' + model + '"' +
					'>';
		}

		// create textarea
		if(type=='textarea'){
			html += '<textarea id="' + id + '" name="' + id + '" class="form-control"' + req + 
					' ng-model="temp.' + model + '"' +
					'></textarea>';
		}

		// create select
		if(type=='select'){
			html += '<select id="' + id + '" name="' + id + '" class="form-control"' + req + 
			' ng-model="temp.' + model + '"' +
			'>';

			var arr = options.split(',');

			for(x=0; x<arr.length; x++){
			
				if(id != null){
					html += '<option id="' + id + '-option' + (x+1) + '" ng-i18next="[html]' + prefix + id + '-option' + (x+1) + '">' + $.trim(arr[x]) + '</option>';
				}
				else{
	  				html += '<option>' + $.trim(arr[x]) + '</option>';
	  			}
			}

			html += '</select>'
		}

		// create checkboxlist
		if(type=='checkboxlist'){
			html += '<span class="list">';

			var arr = options.split(',');

			for(x=0; x<arr.length; x++){
				
				var val = utilities.toTitleCase($.trim(arr[x]));
			
	  			html += '<label class="checkbox"><input name="' + id + '" type="checkbox" value="' + $.trim(arr[x]) + '"' + 
	  				' ng-model="temp.' + model + '.' + val + 
	  				'" ng-true-value="' + $.trim(arr[x]) + '"' +
	  				'" ng-false-value=""' +
	  				'>';
	  			
	  			if(id != null){
		  			html += '<span id="' + id + '-checkbox' + (x+1) + '" ng-i18next="[html]' + prefix + id + '-checkbox' + (x+1) + '">';
				}
				else{
					html += '<span>';
				}
	  				
	  			html += $.trim(arr[x]) + '</span></label>';
			}

			html += '</span>';
		}

		// create radio list
		if(type=='radiolist'){
			html += '<span class="list">';

			var arr = options.split(',');

			for(x=0; x<arr.length; x++){
	  			html += '<label class="radio"><input name="' + id + '" type="radio" value="' + $.trim(arr[x]) + '" name="' + id + '"' +
	  				' ng-model="temp.' + model + '"' +
	  				'>';
	  			
	  			if(id != null){
		  			html += '<span id="' + id + '-radio' + (x+1) + '" ng-i18next="[html]' + prefix + id + '-radio' + (x+1) + '">';
				}
				else{
					html += '<span>';
				}
	  				
	  			html += $.trim(arr[x]) + '</span></label>';
			}

			html += '</span>';
		}

		// create helper
		if(helper != '') {
		
			if(id != null){
	  			html += '<span id="' + id + '-help" ng-i18next="[html]' + prefix + id + '-help" class="help-block">' + helper + '</span>';
			}
			else{
				html += '<span class="help-block">' + helper + '</span>';
			}
	  		
		}

		// tag attributes
		var attrs = [];
		attrs['id'] = id;
		attrs['data-id'] = id;
		attrs['data-model'] = model;
		attrs['class'] = 'form-group';
		attrs['data-type'] = type;
		attrs['data-label'] = label;
		attrs['data-required'] = required;
		attrs['data-helper'] = helper;
		attrs['data-placeholder'] = placeholder;
		attrs['data-id'] = id;
		attrs['data-cssclass'] = cssClass;
		attrs['data-options'] = options;
		
		// return element
		return utilities.element('div', attrs, html);
		
	},

	// creates form
	create:function(){
	
		// generate uniqId
		var id = triangulate.editor.generateUniqId('form', 'form');
		
		// build html
		var html = triangulate.editor.defaults.elementMenu +
					'<div class="field-list">' +
					triangulate.component.form.buildMock('text', 'Field', 'field1', 'false', '', '', 'form-control', '') +
					'</div>';
					
		html += '<button type="button" class="add-field"><i class="fa fa-plus-circle"></i></button>';
					
		// tag attributes
		var attrs = [];
		attrs['id'] = id;
		attrs['data-id'] = id;
		attrs['class'] = 'triangulate-form';
		attrs['data-cssclass'] = '';
		attrs['data-action'] = '';
		attrs['data-success'] = 'Form submitted successfully.';
		attrs['data-error'] = 'There was an error submitting your form.';
		attrs['data-submit'] = 'Submit';
		attrs['data-field-count'] = '1';
		
		// append element to the editor
		triangulate.editor.append(
			 utilities.element('div', attrs, html)
		);
		
		$('.triangulate-form>div').sortable({handle: '.mock-field', placeholder: 'editor-highlight', opacity:'0.6', axis:'y'});
	
		return true;
		
	},
	
	// parse form
	parse:function(node){
	
		// get params
		var id = $(node).attr('id');
		
		// build html
		var html = triangulate.editor.defaults.elementMenu + '<div class="field-list">';
		
		var fields = $(node).find('div');
		
		for(y=0; y<fields.length; y++){
		
			// get type
			var type = $(fields[y]).attr('data-type');
			
			if(type != null){
					
				
				// get attributes
				var label = $(fields[y]).attr('data-label') || '';
				var required = $(fields[y]).attr('data-required') || '';
				var helper = $(fields[y]).attr('data-helper') || '';
				var placeholder = $(fields[y]).attr('data-placeholder') || '';
				var id = $(fields[y]).attr('data-id') || '';
				var cssClass = $(fields[y]).attr('data-cssclass') || '';
				var options = $(fields[y]).attr('data-options') || '';
				
				// build mock element
				html += triangulate.component.form.buildMock(type, label, id, required, helper, placeholder, cssClass, options)
	
			}
			  	
		}
		
		html += '</div>';
		
		html += '<button type="button" class="add-field"><i class="fa fa-plus-circle"></i></button>';
					
		// tag attributes
		var attrs = [];
		attrs['id'] = id;
		attrs['data-id'] = id;
		attrs['class'] = 'triangulate-form';
		attrs['data-cssclass'] = $(node).attr('class');
		attrs['data-action'] = $(node).attr('action');
		attrs['data-success'] = $(node).attr('success');
		attrs['data-error'] = $(node).attr('error');
		attrs['data-submit'] = $(node).attr('submit');
		
		// return element
		return utilities.element('div', attrs, html);
				
	},
	
	// generate form
	generate:function(node){
	
		var fields = $(node).find('.field-list>div');
		var html = '<div class="triangulate-form-fields">';
		    
		  
  		for(var y=0; y<fields.length; y++){
  			field = $(fields[y]);
  			
  			// build field
  			html += triangulate.component.form.buildField(
  				field.attr('data-type') || '', 
  				field.attr('data-label') || '', 
  				field.attr('data-id') || '', 
  				field.attr('data-required') || '', 
  				field.attr('data-helper') || '', 
  				field.attr('data-placeholder') || '', 
  				field.attr('data-cssclass') || '', 
  				field.attr('data-options') || '');  				
  		}
  		
  		html += '</div>';
	
		// tag attributes
		var attrs = [];
		attrs['id'] = $(node).attr('data-id');
		attrs['class'] = $(node).attr('data-cssclass');
		attrs['type'] = $(node).attr('data-type');
		attrs['action'] = $(node).attr('data-action');
		attrs['success'] = $(node).attr('data-success');
		attrs['error'] = $(node).attr('data-error');
		attrs['submit'] = $(node).attr('data-submit');
		
		
		// return element
		return utilities.element('triangulate-form', attrs, html);
		
	},
	
	// config form
	config:function(node, form){}
	
};

triangulate.component.form.init();

// content component
triangulate.component.content = {

	// creates content
	create:function(){
	
		// generate uniqId
		var id = triangulate.editor.generateUniqId('content', 'content');
		
		// build html
		var html = triangulate.editor.defaults.elementMenu +
					'<div class="title triangulate-element"><i class="fa fa-cube"></i> <span node-text="url">Not Selected</span></div>';		
					
		// tag attributes
		var attrs = [];
		attrs['id'] = id;
		attrs['data-id'] = id;
		attrs['class'] = 'triangulate-content';
		attrs['data-cssclass'] = '';
		attrs['data-url'] = '';
		
		// append element to the editor
		triangulate.editor.append(
			 utilities.element('div', attrs, html)
		);
	
		return true;
		
	},
	
	// parse content
	parse:function(node){
	
		// get params
		var id = $(node).attr('id');
		var url = $(node).attr('url');
		
		// build html
		var html = triangulate.editor.defaults.elementMenu +
					'<div class="title triangulate-element"><i class="fa fa-cube"></i> <span node-text="url">' + url + '</span></div>';
					
		// tag attributes
		var attrs = [];
		attrs['id'] = id;
		attrs['data-id'] = id;
		attrs['class'] = 'triangulate-content';
		attrs['data-cssclass'] = $(node).attr('class');
		attrs['data-url'] = $(node).attr('url');
		
		// return element
		return utilities.element('div', attrs, html);
				
	},
	
	// generate content
	generate:function(node){

		// tag attributes
		var attrs = [];
		attrs['id'] = $(node).attr('data-id');
		attrs['class'] = $(node).attr('data-cssclass');
		attrs['url'] = $(node).attr('data-url');
		
		// return element
		return utilities.element('triangulate-content', attrs, '');
		
	},
	
	// config content
	config:function(node, form){
		
	}
	
};

// list component
triangulate.component.list = {

	// creates list
	create:function(){
	
		// generate uniqId
		var id = triangulate.editor.generateUniqId('list', 'list');
		
		// build html
		var html = triangulate.editor.defaults.elementMenu +
					'<div class="title triangulate-element"><i class="fa fa-cubes"></i> <span node-text="type">Not Selected</span></div>';		
					
		// tag attributes
		var attrs = [];
		attrs['id'] = id;
		attrs['data-id'] = id;
		attrs['class'] = 'triangulate-list';
		attrs['data-cssclass'] = '';
		attrs['data-type'] = '';
		attrs['data-display'] = 'list-default';
		attrs['data-pagesize'] = '10';
		attrs['data-orderby'] = 'Name';
		attrs['data-pageresults'] = 'false';
		attrs['data-tag'] = '';
		attrs['data-desclength'] = '';
		
		// append element to the editor
		triangulate.editor.append(
			 utilities.element('div', attrs, html)
		);
	
		return true;
		
	},
	
	// parse list
	parse:function(node){
	
		// get params
		var id = $(node).attr('id');
		var type = $(node).attr('type');
		
		// build html
		var html = triangulate.editor.defaults.elementMenu +
					'<div class="title triangulate-element"><i class="fa fa-cubes"></i> <span node-text="type">' + type + '</span></div>';
		
		// tag attributes
		var attrs = [];
		attrs['id'] = id;
		attrs['data-id'] = id;
		attrs['class'] = 'triangulate-list';
		attrs['data-cssclass'] = $(node).attr('class');
		attrs['data-type'] = $(node).attr('type');
		attrs['data-display'] = $(node).attr('display');
		attrs['data-pagesize'] = $(node).attr('pagesize');
		attrs['data-orderby'] =  $(node).attr('orderby');
		attrs['data-pageresults'] =  $(node).attr('pageresults');
		attrs['data-tag'] =  $(node).attr('tag');
		attrs['data-desclength'] = $(node).attr('desclength');
		
		utilities.element('div', attrs, html)
		
		// return element
		return utilities.element('div', attrs, html);
				
	},
	
	// generate list
	generate:function(node){

		// tag attributes
		var attrs = [];
		attrs['id'] = $(node).attr('data-id');
		attrs['class'] = $(node).attr('data-cssclass');
		attrs['type'] = $(node).attr('data-type');
		attrs['display'] = $(node).attr('data-display');
		attrs['pagesize'] = $(node).attr('data-pagesize');
		attrs['orderby'] = $(node).attr('data-orderby');
		attrs['pageresults'] = $(node).attr('data-pageresults');
		attrs['tag'] = $(node).attr('data-tag');
		attrs['desclength'] = $(node).attr('data-desclength');
		
		// return element
		return utilities.element('triangulate-list', attrs, '');
		
	},
	
	// config list
	config:function(node, form){}
	
};

// html component
triangulate.component.html = {

	init:function(){
		
		// handle html div click
		$(document).on('click', '.triangulate-html div', function(){
			$(this).parent().toggleClass('active');	
		});
		
	},

	// creates html
	create:function(){
	
		// generate uniqId
		var id = triangulate.editor.generateUniqId('html', 'html');
		
		// build html
		var html = triangulate.editor.defaults.elementMenu +
					'<div class="title triangulate-element"><i class="fa fa-html5"></i> '+
					'<span node-text="description">HTML</span>' +
					'<i class="fa fa-angle-down"></i></div>' +
					'<textarea></textarea>';
					
		// tag attributes
		var attrs = [];
		attrs['id'] = id;
		attrs['data-id'] = id;
		attrs['class'] = 'triangulate-html';
		attrs['data-cssclass'] = '';
		attrs['data-description'] = 'HTML';
		
		// append element to the editor
		triangulate.editor.append(
			 utilities.element('div', attrs, html)
		);
	
		return true;
		
	},
	
	// parse html
	parse:function(node){
	
		// get params
		var id = $(node).attr('id');
		var description = $(node).attr('description');
		var code = $(node).html();
		
		// create pretty code for display
		var pretty = utilities.replaceAll(code, '<', '&lt;');
		pretty = utilities.replaceAll(pretty, '>', '&gt;');
		
		// build html
		var html = triangulate.editor.defaults.elementMenu +
					'<div class="title triangulate-element"><i class="fa fa-html5"></i> '+
					'<span node-text="description">' + description + '</span>' +
					'<i class="fa fa-angle-down"></i></div>' +
					'<textarea>' + code + '</textarea>';
					
		// tag attributes
		var attrs = [];
		attrs['id'] = id;
		attrs['data-id'] = id;
		attrs['class'] = 'triangulate-html';
		attrs['data-cssclass'] = $(node).attr('class');
		attrs['data-description'] = description;
		
		// return element
		return utilities.element('div', attrs, html);
				
	},
	
	// generate html
	generate:function(node){

		// tag attributes
		var attrs = [];
		attrs['id'] = $(node).attr('data-id');
		attrs['class'] = $(node).attr('data-cssclass');
		attrs['description'] = $(node).attr('data-description');
		
		var html = $(node).find('textarea').val();
		
		// return element
		return utilities.element('triangulate-html', attrs, html);
		
	},
	
	// config html
	config:function(node, form){}
	
};

triangulate.component.html.init();

// login
triangulate.component.login = {

	// creates login
	create:function(){
	
		// generate uniqId
		var id = triangulate.editor.generateUniqId('login', 'login');
		
		// build html
		var html = triangulate.editor.defaults.elementMenu +
					'<div class="title triangulate-element"><i class="fa fa-key"></i> <span>Login</span></div>';		
					
		// tag attributes
		var attrs = [];
		attrs['id'] = id;
		attrs['data-id'] = id;
		attrs['class'] = 'triangulate-login';
		attrs['data-cssclass'] = '';
		attrs['data-success'] = 'Login successful.';
		attrs['data-error'] = 'Your username or password is invalid. Please try again.';
		attrs['data-button'] = 'Login';
		
		// append element to the editor
		triangulate.editor.append(
			 utilities.element('div', attrs, html)
		);
	
		return true;
		
	},
	
	// parse login
	parse:function(node){
	
		// get params
		var id = $(node).attr('id');
		
		// build html
		var html = triangulate.editor.defaults.elementMenu +
					'<div class="title triangulate-element"><i class="fa fa-key"></i> <span>Login</span></div>';
					
		// tag attributes
		var attrs = [];
		attrs['id'] = id;
		attrs['data-id'] = id;
		attrs['class'] = 'triangulate-login';
		attrs['data-cssclass'] = $(node).attr('class');
		attrs['data-success'] = $(node).attr('success');
		attrs['data-error'] = $(node).attr('error');
		attrs['data-button'] = $(node).attr('button');
		
		// return element
		return utilities.element('div', attrs, html);
				
	},
	
	// generate login
	generate:function(node){

		// tag attributes
		var attrs = [];
		attrs['id'] = $(node).attr('data-id');
		attrs['class'] = $(node).attr('data-cssclass');
		attrs['success'] = $(node).attr('data-success');
		attrs['error'] = $(node).attr('data-error');
		attrs['button'] = $(node).attr('data-button');
		
		// return element
		return utilities.element('triangulate-login', attrs, '');
		
	},
	
	// config login
	config:function(node, form){}
	
};

// registration
triangulate.component.registration = {

	// creates registration
	create:function(){
	
		// generate uniqId
		var id = triangulate.editor.generateUniqId('registration', 'registration');
		
		// build html
		var html = triangulate.editor.defaults.elementMenu +
					'<div class="title triangulate-element"><i class="fa fa-key"></i> <span>Registration</span></div>';		
					
		// tag attributes
		var attrs = [];
		attrs['id'] = id;
		attrs['data-id'] = id;
		attrs['class'] = 'triangulate-registration';
		attrs['data-cssclass'] = '';
		attrs['data-success'] = 'Registration successful.';
		attrs['data-error'] = 'There was a problem registering. Please try again.';
		attrs['data-required'] = 'All fields are required.';
		attrs['data-button'] = 'Register';
		
		// append element to the editor
		triangulate.editor.append(
			 utilities.element('div', attrs, html)
		);
	
		return true;
		
	},
	
	// parse registration
	parse:function(node){
	
		// get params
		var id = $(node).attr('id');
		var type = $(node).attr('type');
		
		// build html
		var html = triangulate.editor.defaults.elementMenu +
					'<div class="title triangulate-element"><i class="fa fa-key"></i> <span>Registration</span></div>';
					
		// tag attributes
		var attrs = [];
		attrs['id'] = id;
		attrs['data-id'] = id;
		attrs['class'] = 'triangulate-registration';
		attrs['data-cssclass'] = $(node).attr('class');
		attrs['data-success'] = $(node).attr('success');
		attrs['data-error'] = $(node).attr('error');
		attrs['data-required'] = $(node).attr('required');
		attrs['data-button'] = $(node).attr('button');
		
		// return element
		return utilities.element('div', attrs, html);
				
	},
	
	// generate registration
	generate:function(node){

		// tag attributes
		var attrs = [];
		attrs['id'] = $(node).attr('data-id');
		attrs['class'] = $(node).attr('data-cssclass');
		attrs['success'] = $(node).attr('data-success');
		attrs['error'] = $(node).attr('data-error');
		attrs['required'] = $(node).attr('data-required');
		attrs['button'] = $(node).attr('data-button');
		
		// return element
		return utilities.element('triangulate-registration', attrs, '');
		
	},
	
	// config list
	config:function(node, form){}
	
};

// shelf component
triangulate.component.shelf = {

	// inits the shelf
	init:function(){
	
		// adds a field
		$(document).on('click', '.add-sku', function(){
		
			var node = $(triangulate.editor.currNode);
			
			var uniqId = utilities.uniqid();
			
			// add temp shelf item
			node.find('.shelf-items').append(
				triangulate.component.shelf.buildMock(uniqId, uniqId, 'New Product', '9.99', 'not shipped', '', '')
			);
			
		});
		
		
		// make parsed elements sortable
		$(document).on('triangulate.editor.contentLoaded', function(){	
		
			// make the elements sortable
			$('.triangulate-shelf>div').sortable({placeholder: 'editor-highlight', opacity:'0.6', axis:'y'});
			
		});
		
	},
	
	// builds a mock
	buildMock:function(productId, sku, name, price, shipping, weight, download){
	
		// create field
  		var html = '<i class="fa fa-tag"></i><h4 element-text="name">' + name + '</h4>' +
  					'<small><span element-text="sku">' + sku + '</span> - <span element-text="price">' + price + '</span></small>';
		
		// tag attributes
		var attrs = [];
		attrs['class'] = 'shelf-item triangulate-element';
		attrs['data-productid'] = productId;
		attrs['data-sku'] = sku;
		attrs['data-name'] = name;
		attrs['data-price'] = price;
		attrs['data-shipping'] = shipping;
		attrs['data-weight'] = weight;
		attrs['data-download'] = download;
		
		// return element
		return utilities.element('div', attrs, html);
		
	},
	
	// builds a shelf item
	buildItem:function(productId, sku, name, price, shipping, weight, download){
	
		var html = '';
	
		// tag attributes
		var attrs = [];
		attrs['productid'] = productId;
		attrs['sku'] = sku;
		attrs['name'] = name;
		attrs['price'] = price;
		attrs['shipping'] = shipping;
		attrs['weight'] = weight;
		attrs['download'] = download;
		
		// return element
		return utilities.element('triangulate-shelf-item', attrs, html);
	},
	
	// creates shelf
	create:function(){
	
		// generate uniqId
		var id = triangulate.editor.generateUniqId('shelf', 'shelf');
		
		// create a uniqid
		var uniqId = utilities.uniqid();
		
		// build html
		var html = triangulate.editor.defaults.elementMenu +
					'<div class="shelf-items">' +
					triangulate.component.shelf.buildMock(uniqId, uniqId, 
						'New Product', '9.99', 'not shipped', '', '') +
					'</div>';
					
		html += '<button type="button" class="add-sku"><i class="fa fa-plus-circle"></i></button>';
					
		// tag attributes
		var attrs = [];
		attrs['id'] = id;
		attrs['data-id'] = id;
		attrs['class'] = 'triangulate-shelf';
		attrs['data-cssclass'] = '';
		
		// append element to the editor
		triangulate.editor.append(
			 utilities.element('div', attrs, html)
		);
		
		$('.triangulate-shelf>div').sortable({placeholder: 'editor-highlight', opacity:'0.6', axis:'y'});
	
		return true;
		
	},
	
	// parse shelf
	parse:function(node){
	
		// get params
		var id = $(node).attr('id');
		
		// build html
		var html = triangulate.editor.defaults.elementMenu + '<div class="shelf-items">';
		
		var items = $(node).find('triangulate-shelf-item');
		
		for(y=0; y<items.length; y++){
					
			// get attributes
			var productid = $(items[y]).attr('productid') || '';
			var sku = $(items[y]).attr('sku') || '';
			var name = $(items[y]).attr('name') || '';
			var price = $(items[y]).attr('price') || '';
			var shipping = $(items[y]).attr('shipping') || '';
			var weight = $(items[y]).attr('weight') || '';
			var download = $(items[y]).attr('download') || '';
			
			// build mock element
			html += triangulate.component.shelf.buildMock(productid, sku, name, price, shipping, weight, download);

		}
		
		html += '</div>';
		
		html += '<button type="button" class="add-sku"><i class="fa fa-plus-circle"></i></button>';
					
		// tag attributes
		var attrs = [];
		attrs['id'] = id;
		attrs['data-id'] = id;
		attrs['class'] = 'triangulate-shelf';
		attrs['data-cssclass'] = $(node).attr('class');
		
		// return element
		return utilities.element('div', attrs, html);
				
	},
	
	// generate shelf
	generate:function(node){
	
		var items = $(node).find('.shelf-items>div');
		var html = '';
		
		// get scope from page
		var scope = angular.element($("section.main")).scope();
		
		// clear products for the page
		scope.clearProducts();
	  
  		for(var y=0; y<items.length; y++){
  			item = $(items[y]);
  			
  			// build a product
  			var product = {
  					productId: item.attr('data-productid') || '', 
					sku: item.attr('data-sku') || '', 
					name: item.attr('data-name') || '',
					price: item.attr('data-price') || '',
					shipping: item.attr('data-shipping') || '',
					weight: item.attr('data-weight') || '',
					download: item.attr('data-download') || ''};
  			
  			// build item
  			html += triangulate.component.shelf.buildItem(
  				product.productId, 
  				product.sku, 
  				product.name, 
  				product.price, 
  				product.shipping, 
  				product.weight,
  				product.download);
  				
  			// add products for the page
  			scope.addProduct(product);
  										
  		}
  	
		// tag attributes
		var attrs = [];
		attrs['id'] = $(node).attr('data-id');
		attrs['class'] = $(node).attr('data-cssclass');
		
		// return element
		return utilities.element('triangulate-shelf', attrs, html);
		
	},
	
	// config shelf
	config:function(node, shelf){}
	
};

triangulate.component.shelf.init();

// video component
triangulate.component.video = {

	init:function(){
		
		// handle html div click
		$(document).on('click', '.triangulate-video div', function(){
			$(this).parent().toggleClass('active');	
		});
		
	},

	// creates video
	create:function(){
	
		// generate uniqId
		var id = triangulate.editor.generateUniqId('video', 'video');
		
		// build html
		var html = triangulate.editor.defaults.elementMenu +
					'<div class="title triangulate-element"><i class="fa fa-video-camera"></i> '+
					'<span node-text="description">Video</span>' +
					'<i class="fa fa-angle-down"></i></div>' +
					'<textarea></textarea>';
					
		// tag attributes
		var attrs = [];
		attrs['id'] = id;
		attrs['data-id'] = id;
		attrs['class'] = 'triangulate-video';
		attrs['data-cssclass'] = '';
		attrs['data-description'] = 'Video';
		
		// append element to the editor
		triangulate.editor.append(
			 utilities.element('div', attrs, html)
		);
	
		return true;
		
	},
	
	// parse video
	parse:function(node){
	
		// get params
		var id = $(node).attr('id');
		var description = $(node).attr('description');
		var code = $(node).html();
		
		// create pretty code for display
		var pretty = utilities.replaceAll(code, '<', '&lt;');
		pretty = utilities.replaceAll(pretty, '>', '&gt;');
		
		// build html
		var html = triangulate.editor.defaults.elementMenu +
					'<div class="title triangulate-element"><i class="fa fa-video-camera"></i> '+
					'<span node-text="description">' + description + '</span>' +
					'<i class="fa fa-angle-down"></i></div>' +
					'<textarea>' + code + '</textarea>';
					
		// tag attributes
		var attrs = [];
		attrs['id'] = id;
		attrs['data-id'] = id;
		attrs['class'] = 'triangulate-video';
		attrs['data-cssclass'] = $(node).attr('class');
		attrs['data-description'] = description;
		
		// return element
		return utilities.element('div', attrs, html);
				
	},
	
	// generate video
	generate:function(node){

		// tag attributes
		var attrs = [];
		attrs['id'] = $(node).attr('data-id');
		attrs['class'] = $(node).attr('data-cssclass');
		attrs['description'] = $(node).attr('data-description');
		
		var html = $(node).find('textarea').val();
		
		// return element
		return utilities.element('triangulate-video', attrs, html);
		
	},
	
	// config html
	config:function(node, form){}
	
};

triangulate.component.video.init();

// tabset element
triangulate.component.tabset = {

	// initialize tabset
	init:function(){
	
		// handle column change
		$(document).on('change', '.config[data-action="triangulate.component.tabset"] [name="tabs"]', function(){
			
			var node = $(triangulate.editor.currNode);
			var form = $('.config[data-action="triangulate.component.tabset"]');
			
			var tabs = $(form).find('input[name=tabs]').val();
			var curr_tabs = $(node).find('.nav-tabs li').length;
			var nav = $(node).find('.nav-tabs');
			
			// update columns
            if(tabs > curr_tabs){ // add columns
	            
	            var toBeAdded = tabs - curr_tabs;
	            
	            for(x=0; x<toBeAdded; x++){
		            $(nav).append('<li class="triangulate-element"><a contentEditable="true">Tab</a></li>');
	            }
				
	            
            }
            else if(tabs < curr_tabs){ // remove columns
            
            	var toBeRemoved = curr_tabs - tabs;
            	
				for(var x=0; x<toBeRemoved; x++){
					$(nav).find('li').last().remove();
				}
		
            }

		});
		
	},

	// creates tabset
	create:function(){
	
		// generate uniqId
		var id = triangulate.editor.generateUniqId('tabset', 'tabset');
		
		// build html
		var html = triangulate.editor.defaults.elementMenu +
					'<ul class="nav nav-tabs" role="tablist">' +
					  '<li class="active triangulate-element"><a contentEditable="true">Tab</a></li>' +
					  '<li class="triangulate-element"><a contentEditable="true">Tab</a></li>' +
					  '<li class="triangulate-element"><a contentEditable="true">Tab</a></li>' +
					'</ul>';			
					
					
		// tag attributes
		var attrs = [];
		attrs['id'] = id;
		attrs['data-id'] = id;
		attrs['class'] = 'triangulate-tabset';
		attrs['data-cssclass'] = '';
		attrs['data-tabs'] = '3';
		
		// append element to the editor
		triangulate.editor.append(
			 utilities.element('div', attrs, html)
		);
		
		// setup paste filter
		$('#'+id+' [contentEditable=true]').paste();
		
		return true;
		
	},
	
	// parse tabset
	parse:function(node){
	
		// build html
		var html = triangulate.editor.defaults.elementMenu +
					'<ul class="nav nav-tabs" role="tablist">';
				
		// parse links				
		var lis = $(node).find('li');			
					
		for(y=0; y<lis.length; y++){
		
			// tag attributes
			var attrs = [];
			
			if(y == 0){
				attrs['class'] = 'active triangulate-element';
			}
			else{
				attrs['class'] = 'triangulate-element';
			}
			
			attrs['data-id'] = $(lis[y]).attr('id');
			attrs['data-target'] = $(lis[y]).attr('target');
			
			var text = $(lis[y]).find('a').text();
			var link = '<a contentEditable="true">' + text + '</a>';
			
			// return element
			html += utilities.element('li', attrs, link);
		}
		
		html += '</ul>';
		
		// get params
		var id = $(node).attr('id');
		
		// tag attributes
		var attrs = [];
		attrs['id'] = id;
		attrs['data-id'] = id;
		attrs['class'] = 'triangulate-tabset';
		attrs['data-cssclass'] = $(node).attr('class');
		attrs['data-tabs'] = lis.length;
		
		// return element
		return utilities.element('div', attrs, html);
				
	},
	
	// generate tabset
	generate:function(node){
	
  		// html for tag
  		var html = '<ul class="nav nav-tabs" role="tablist">';
  		
  		// get lis
  		var lis = $(node).find('li');
  		
  		for(var y=0; y<lis.length; y++){
  		
			// tag attributes
			var attrs = [];
			attrs['id'] = $(lis[y]).attr('data-id');
			
			if(y == 0){
				attrs['class'] = 'active';
			}
			
			var target = $(lis[y]).attr('data-target');
			
			attrs['target'] = target;
			
			var text = $(lis[y]).find('a').text();
			var link = '<a data-target="' + target + '" role="tab" data-toggle="tab" triangulate-showtab>' + text + '</a>';
		
			// create li
			html += utilities.element('li', attrs, link, true);
			
	  	}
	  	
	  	html += '</ul>';
	  	
		// tag attributes
		var attrs = [];
		attrs['id'] = $(node).attr('data-id');
		attrs['class'] = $(node).attr('data-cssclass');
		
		// return element
		return utilities.element('triangulate-tabset', attrs, html);
	}
	
};

triangulate.component.tabset.init();


