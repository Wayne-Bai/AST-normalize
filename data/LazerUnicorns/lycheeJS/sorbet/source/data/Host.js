
lychee.define('sorbet.data.Host').requires([
	'sorbet.data.Project'
]).includes([
	'lychee.event.Emitter'
]).exports(function(lychee, sorbet, global, attachments) {

	/*
	 * HELPERS
	 */

	var _on_update = function(project) {

		this.trigger('update', [ project ]);

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.projects = [];


		this.setProjects(settings.projects);


		lychee.event.Emitter.call(this);

		settings = null;

	};


	Class.prototype = {

		/*
		 * CUSTOM API
		 */

		deserialize: function(blob) {
		},

		serialize: function() {

			var data = lychee.event.Emitter.prototype.serialize.call(this);
			data['constructor'] = 'sorbet.data.Host';

			var settings = {};
			var blob     = (data['blob'] || {});


			if (this.projects.length > 0) {
			}


			data['blob'] = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},

		addProject: function(project) {

			project = project instanceof sorbet.data.Project ? project : null;


			if (project !== null) {

				if (this.projects.indexOf(project) === -1) {

					project.bind('#update', _on_update, this);
					this.projects.push(project);

					return true;

				}

			}


			return false;

		},

		getProject: function(id) {

			id = typeof id === 'string' ? id : null;


			var found = null;


			if (id !== null) {

				for (var p = 0, pl = this.projects.length; p < pl; p++) {

					var project = this.projects[p];
					if (project.identifier === id) {
						found = project;
						break;
					}

				}

			}


			return found;

		},

		removeProject: function(project) {

			project = project instanceof sorbet.data.Project ? project : null;


			if (project !== null) {

				var index = this.projects.indexOf(project);
				if (index !== -1) {

					project.unbind('#update', _on_update, this);
					this.projects.splice(index, 1);

					return true;

				}

			}


			return false;

		},

		setProjects: function(projects) {

			var all = true;

			if (projects instanceof Array) {

				for (var p = 0, pl = projects.length; p < pl; p++) {

					var result = this.addProject(projects[p]);
					if (result === false) {
						all = false;
					}

				}

			}


			return all;

		},

		removeProjects: function() {

			var projects = this.projects;

			for (var p = 0, pl = projects.length; p < pl; p++) {

				this.removeProject(projects[p]);

				pl--;
				p--;

			}

			return true;

		}

	};


	return Class;

});

