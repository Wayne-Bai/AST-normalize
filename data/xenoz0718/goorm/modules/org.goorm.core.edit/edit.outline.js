
var exec = require('child_process').exec;
var EventEmitter = require("events").EventEmitter;
var fs = require('fs');
var spawn = require('child_process').spawn;

var __parser = {
	'html' : require('htmlparser'),
	'css' : require('css-parse')
}

module.exports = {

	c_loader: function (data, evt) {
		var tmp = {
			type: 'c',
			global_var: [],
			global_struct: [],
			global_function: [],
			struct_property: [],
			children : []
		};

		for (var i=0; i<data.length; i++) {
			var item = data[i];

			switch (item.type) {
				case 'variable':
					tmp.global_var.push(item);
					break;

				case 'struct':
					tmp.global_struct.push(item);
					break;

				case 'function':
					tmp.global_function.push(item);
					break;

				case 'property':
					tmp.struct_property.push(item);
					break;
			}
		}

		for (var i = 0; i < tmp.global_struct.length; i++) {

			//get property
			for (var k = 0; k < tmp.struct_property.length; k++) {
				if (tmp.struct_property[k].parent == tmp.global_struct[i].name) {
					tmp.global_struct[i].children.push(tmp.struct_property[k]);
				}
			}

		}

		for (var i = 0; i < tmp.global_struct.length; i++) {
			tmp.children.push({
				type: 'struct',
				name: tmp.global_struct[i].name,
				filetype: 'c/cpp',
				'use_detailed' : false,
				line: tmp.global_struct[i].line,
				children: tmp.global_struct[i].children
			});
		}
		for (var i = 0; i < tmp.global_function.length; i++) {
			tmp.children.push({
				type: 'function',
				filetype: 'c/cpp',
				'use_detailed' : false,
				line: tmp.global_function[i].line,
				name: tmp.global_function[i].name 
			});
		}
		for (var i = 0; i < tmp.global_var.length; i++) {
			tmp.children.push({
				type: 'var',
				filetype: 'c/cpp',
				'use_detailed' : false,
				line: tmp.global_var[i].line,
				name: tmp.global_var[i].name 
			});
		}

		evt.emit("got_object_explorer", tmp);
	},

	cpp_loader: function (data, evt) {
		var tmp = {
			type: 'cpp',
			global_var: [],
			global_struct: [],
			global_class: [],
			global_function: [],
			class_property: [],
			class_method: [],
			struct_property: [],
			children : []
		};		

		for (var i=0; i<data.length; i++) {
			var item = data[i];

			switch (item.type) {
				case 'variable':
					tmp.global_var.push(item);
					break;

				case 'class':
					tmp.global_class.push(item);
					break;

				case 'struct':
					tmp.global_struct.push(item);
					break;

				case 'function':
					tmp.global_function.push(item);
					break;

				case 'method':
					tmp.class_method.push(item);
					break;

				case 'property':
					if (tmp.parent_type == 'class') {
						tmp.class_property.push(item);
					}
					else {
						tmp.struct_property.push(item);
					}
					break;
			}
		}

		//build tree

		for (var i = 0; i < tmp.global_class.length; i++) {

			//get property
			for (var k = 0; k < tmp.class_property.length; k++) {
				if (tmp.class_property[k].parent == tmp.global_class[i].name) {
					tmp.global_class[i].children.push(tmp.class_property[k]);
				}
			}

			for (var k = 0; k < tmp.class_method.length; k++) {
				if (tmp.class_method[k].parent == tmp.global_class[i].name) {
					tmp.global_class[i].children.push(tmp.class_method[k]);
				}
			}
		}

		for (var i = 0; i < tmp.global_struct.length; i++) {

			//get property
			for (var k = 0; k < tmp.struct_property.length; k++) {
				if (tmp.struct_property[k].parent == tmp.global_struct[i].name) {
					tmp.global_struct[i].children.push(tmp.struct_property[k]);
				}
			}

		}
		//self.object_explorer_data = tmp;

		// self.object_explorer_data = {
		// 	children: []
		// };

		for (var i = 0; i < tmp.global_class.length; i++) {
			tmp.children.push({
				type: 'class',
				name: tmp.global_class[i].name,
				'use_detailed' : false,
				filetype: 'c/cpp',
				line: tmp.global_class[i].line,
				children: tmp.global_class[i].children
			});
		}
		for (var i = 0; i < tmp.global_struct.length; i++) {
			tmp.children.push({
				type: 'struct',
				name: tmp.global_struct[i].name,
				'use_detailed' : false,
				filetype: 'c/cpp',
				line: tmp.global_struct[i].line,
				children: tmp.global_struct[i].children
			});
		}
		for (var i = 0; i < tmp.global_function.length; i++) {
			tmp.children.push({
				type: 'function',
				filetype: 'c/cpp',
				'use_detailed' : false,
				line: tmp.global_function[i].line,
				name: tmp.global_function[i].name
			});
		}
		for (var i = 0; i < tmp.global_var.length; i++) {
			tmp.children.push({
				type: 'var',
				filetype: 'c/cpp',
				'use_detailed' : false,
				line: tmp.global_var[i].line,
				name: tmp.global_var[i].name
			});
		}

		evt.emit("got_object_explorer", tmp);
	},

	java_loader: function (data, evt) {
		var tmp = {
			type: 'java',
			global_class: [],
			global_package: [],
			class_property: [],
			class_method: [],
			children : []
		}

		for (var i=0; i<data.length; i++) {
			var item = data[i];

			switch (item.type) {
				case 'f':
					item.type = 'property';
					item.use_detailed = false;
					item.filetype = 'java';
					tmp.class_property.push(item);
					break;

				case 'c':
					tmp.global_class.push(item);
					break;

				case 'p':
					tmp.global_package.push(item);
					break;

				case 'm':
					item.type = 'method';
					item.use_detailed = false;
					item.filetype = 'java';
					tmp.class_method.push(item);
					break;
			}
		}

		for (var i = 0; i < tmp.global_class.length; i++) {
			if (!tmp.global_class[i].children) {
				tmp.global_class[i].children = [];
			}

			//get property
			for (var k = 0; k < tmp.class_property.length; k++) {
				if (tmp.class_property[k].class == ('class:'+tmp.global_class[i].name)) {
					tmp.global_class[i].children.push(tmp.class_property[k]);
				}
			}

			for (var k = 0; k < tmp.class_method.length; k++) {
				if (tmp.class_method[k].class == ('class:'+tmp.global_class[i].name)) {
					tmp.global_class[i].children.push(tmp.class_method[k]);
				}
			}
		}

		for (var i = 0; i < tmp.global_package.length; i++) {
			tmp.children.push({
				type: 'package',
				filetype: 'java',
				'use_detailed' : false,
				line: tmp.global_package[i].line,
				name: tmp.global_package[i].name
			});
		}

		for (var i = 0; i < tmp.global_class.length; i++) {
			tmp.children.push({
				type: 'class',
				name: tmp.global_class[i].name,
				'use_detailed' : false,
				filetype: 'java',
				line: tmp.global_class[i].line,
				children: tmp.global_class[i].children
			});
		}

		evt.emit("got_object_explorer", tmp);
	},

	python_loader: function (data, evt) {
		var tmp = {
			type: 'py',
			global_class: [],
			global_var: [],
			global_function: [],
			class_method: [],
			children : []
		}

		for (var i=0; i<data.length; i++) {
			var item = data[i];

			switch (item.type) {
				case 'f':
					tmp.global_function.push(item);
					break;

				case 'c':
					tmp.global_class.push(item);
					break;

				case 'v':
					item.type = 'property';
					item.use_detailed = false;
					item.filetype = 'py';
					tmp.global_var.push(item);
					break;

				case 'm':
					item.type = 'method';
					item.use_detailed = false;
					item.filetype = 'py';
					tmp.class_method.push(item);
					break;
			}
		}

		for (var i = 0; i < tmp.global_class.length; i++) {
			if (!tmp.global_class[i].children) {
				tmp.global_class[i].children = [];
			}

			//get property
			for (var k = 0; k < tmp.global_var.length; k++) {
				if (tmp.global_var[k].class == ('class:'+tmp.global_class[i].name)) {
					tmp.global_class[i].children.push(tmp.global_var[k]);
				}
			}

			for (var k = 0; k < tmp.class_method.length; k++) {
				if (tmp.class_method[k].class == ('class:'+tmp.global_class[i].name)) {
					tmp.global_class[i].children.push(tmp.class_method[k]);
				}
			}
		}

		for (var i = 0; i < tmp.global_class.length; i++) {
			tmp.children.push({
				type: 'class',
				name: tmp.global_class[i].name,
				'use_detailed' : false,
				filetype: 'py',
				line: tmp.global_class[i].line,
				children: tmp.global_class[i].children
			});
		}

		for (var i = 0; i < tmp.global_var.length; i++) {
			if (!tmp.global_var[i].class) {
				tmp.children.push({
					type: 'var',
					name: tmp.global_var[i].name,
					'use_detailed' : false,
					filetype: 'py',
					line: tmp.global_var[i].line,
					children: tmp.global_var[i].children
				});
			}
		}

		for (var i = 0; i < tmp.global_function.length; i++) {
			tmp.children.push({
				type: 'function',
				filetype: 'py',
				'use_detailed' : false,
				line: tmp.global_function[i].line,
				name: tmp.global_function[i].name
			});
		}

		evt.emit("got_object_explorer", tmp);
	},

	html_loader: function (options, evt) {
		var data = options.data;

		var tmp = {
			'children' : [],
			'err_code' : null
		};
		var filepath = options.filepath;

		var get_css_script = function(input){
			var extract = function(data, target_name, is_all) {
				var target = [];
				var list = [];
				list.push(data);

				while( list.length != 0 ) {
					var node = list.shift();

					for(var i=0; i<node.length; i++) {
						var item = node[i];

						if(item.name == target_name) {
							if(is_all) {
								target.push(item);
							}
							else{
								target = item;
								list = [];
								break;
							}
						}
						
						if(item.children){
							list.unshift(item.children);
						}
					}
				}

				return target;
			}

			try {
				var head_data = extract(input, 'head');
				var link_data = extract(head_data.children, 'link', true);
				var css_data = link_data.filter(function(o){
					if(o.attribs && o.attribs.href && o.attribs.href.split('.').pop() == 'css') return true;
					else return false;
				});
			} catch (e) {
				console.log('Error html parsing error');
				css_data = [];
				tmp.err_code = 0;
			}

			return css_data;
		};

		var evaluate_path = function(relative_path) {
			var path = relative_path.split('/');

			for(var i=0; i<path.length; i++) {
				var item = path[i];

				if( item == '.') {
					path.remove(i, i);
				}
				else if( item == '..') {
					path.remove(i-1, i-1);
					path.remove(i-1, i-1);
				}
			}

			return path.join('/');
		};

		var css_data = get_css_script(data);
		if(css_data.length == 0) {
			evt.emit("got_object_explorer", tmp);
		}
		else {
			var count = 0;
			for(var i=0; i<css_data.length; i++) {
				(function(index){
					var item = css_data[index];
					var href = item.attribs.href;

					var css_file_path = __workspace + filepath + href;
					fs.exists(css_file_path, function(exists){
						if(exists) {
							fs.readFile(css_file_path, 'utf8', function(err, css){
								if(!err){
									var relative_filepath = (filepath + href).split('/');
									var filename = relative_filepath.pop();
									relative_filepath = evaluate_path(relative_filepath.join('/')) + '/' + filename;

									var parsed_css_data = __parser.css(css, {position:true});

									if(parsed_css_data.stylesheet && parsed_css_data.stylesheet.rules) {
										var rules = parsed_css_data.stylesheet.rules;

										for(var j=0; j<rules.length; j++) {
											if(rules[j].type == 'rule') {
												var data = {
													'name' : rules[j].selectors.pop(),
													'type' : 'struct',
													'detailed_type' : 'Selector',
													'use_detailed' : false,
													'expanded' : true,
													'children' : []
												};

												rules[j].declarations.map(function(o){
													data.children.push({
														'name' : o.property + ':' + o.value,
														'type' : 'property',
														'detailed_type' : 'property',
														'use_detailed' : false,
														'filetype' : 'html',
														'filepath' : relative_filepath,
														'line' : o.position.start.line
													});
												});

												tmp.children.push(data);
											}
										}

										count++;
										if( count == css_data.length) {
											evt.emit("got_object_explorer", tmp);
										}
									}else{
										count++;
										if( count == css_data.length) {
											evt.emit("got_object_explorer", tmp);
										}
									}
								}
								else{
									count++;
									if( count == css_data.length) {
										evt.emit("got_object_explorer", tmp);
									}
								}
							});
						}
						else{
							count++;
							if( count == css_data.length) {
								evt.emit("got_object_explorer", tmp);
							}
						}
					});
				})(i);
			}
		}
	},

	css_loader: function (options, evt) {
		var data = options.data;
		var tmp = {
			'children' : []
		};

		var parsed_css_data = __parser.css(data, {position:true});
		if(parsed_css_data.stylesheet && parsed_css_data.stylesheet.rules) {
			var rules = parsed_css_data.stylesheet.rules;

			for(var j=0; j<rules.length; j++) {
				if(rules[j].type == 'rule') {
					var data = {
						'name' : rules[j].selectors.pop(),
						'type' : 'struct',
						'detailed_type' : 'Selector',
						'use_detailed' : false,
						'expanded' : true,
						'children' : []
					};

					rules[j].declarations.map(function(o){
						data.children.push({
							'name' : o.property + ':' + o.value,
							'type' : 'property',
							'detailed_type' : 'property',
							'use_detailed' : false,
							'filetype': 'css',
							'line' : o.position.start.line
						});
					});

					tmp.children.push(data);
				}
			}

			evt.emit("got_object_explorer", tmp);
		}
	}
}