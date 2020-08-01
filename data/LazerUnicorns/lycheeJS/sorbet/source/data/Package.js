
lychee.define('sorbet.data.Package').includes([
	'lychee.event.Emitter'
]).exports(function(lychee, sorbet, global, attachments) {

	/*
	 * HELPERS
	 */

	var _parse_json = function(json) {

		if (json instanceof Object) {

			if (json.build instanceof Object) {

				// TODO: Parse build environments

				if (json.build.files instanceof Object) {
					_walk_directory(this.build, json.build.files, '');
				}

			}

			if (json.source instanceof Object) {

				// TODO: Parse source environments
				// TODO: Parse source tags


				if (json.source.files instanceof Object) {
					_walk_directory(this.source, json.source.files, '');
				}

			}


			this.json = json;

		}

	};

	var _walk_directory = function(files, node, path) {

		if (node instanceof Array) {

			node.forEach(function(ext) {

				if (ext.match(/msc|snd/)) {

					if (files.indexOf(path + '.' + ext) === -1) {
						files.push(path + '.' + ext);
					}

				} else if (ext.match(/js|json|fnt|png/)) {

					if (files.indexOf(path + '.' + ext) === -1) {
						files.push(path + '.' + ext);
					}

				}

			});

		} else if (node instanceof Object) {

			Object.keys(node).forEach(function(child) {
				_walk_directory(files, node[child], path + '/' + child);
			});

		}

	};



	/*
	 * IMPLEMENTATION
	 */


	var Class = function(buffer) {

		buffer = buffer instanceof Buffer ? buffer : null;


		this.build  = [];
		this.source = [];
		this.json   = {};


		if (buffer !== null) {
			_parse_json.call(this, JSON.parse(buffer.toString()));
		}


		lychee.event.Emitter.call(this);


// console.log(this.files);

	};


	Class.prototype = {

	};


	return Class;

});

