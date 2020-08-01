/*global angular*/
'use strict';
/*
When this controller starts it initializes two variables 
in the `$scope`: `cobj` and `questionSubmitted`. 
The former represent the new instance for the question 
while the latter is a boolean value to check that the 
question has been submitted succesfully.
It also implement the function `getTags` for autocompleting 
the tag that users can bind to the question.
*/
angular
	.module('stack')
	.controller('askCtrl', ['$rootScope', '$http', '$location', 'userService', 'tagsService', 'questionsService',
		function ($rootScope, $http, $location, userService, tagsService, questionsService) {
			var askModel = this;
			askModel.cobj = {};
			askModel.cobj.tags = [];
			askModel.cobj.answers = [];
			askModel.cobj.views = 0;
			askModel.questionSubmitted = false;

			userService.getUserModel().then(function (response) {
				askModel.cobj.author = response.get('_id');
			});

			askModel.tags = [];
			var tagName2Id = {};

			/* Used from typeahead to retrieve tags that matches the user search */
			askModel.getTags = function (val) {
				var reg = '".*' + val + '.*"';
				var query = {
					'where': '{"name": {"$regex" : ' + reg + '}}'
				};

				return tagsService.searchTag(query)
					.then(function (tagsRetrived) {
						tagsRetrived.forEach(function (tagItem) {
							var instance = tagItem.instance;
							tagName2Id[instance.name] = instance.id;
							var alreadyExists = false;
							for (var i = 0, j = askModel.tags.length; i < j && !alreadyExists; i++) {
								var element = askModel.tags[i];
								if (element.id === instance.id) {
									alreadyExists = true;
								}
							}
							if (!alreadyExists) {
								askModel.tags.push({
									name: instance.name,
									id: instance._id
								});
							}
						});
						return askModel.tags;
					});
			};

			askModel.onSelect = function ($item, $model, $label) { //jshint ignore:line
				askModel.cobj.tags = $item.id;
			};

			/* Creates a new question */
			askModel.createQuestion = function () {
				if (typeof askModel.cobj.tags === 'string') {
					askModel.cobj.tags = [askModel.cobj.tags];
				}

				questionsService.saveQuestion(askModel.cobj)
					.then(function () {
						askModel.cobj = {};
						askModel.cobj.tags = [];
						askModel.cobj.answers = [];
						askModel.cobj.views = 0;
						askModel.cobj.author = $rootScope.user.id;
						askModel.cobj.text = '';
						askModel.current = '';
						askModel.questionSubmitted = true;
						$location.url('/index');

					})
					.catch(function () {
						alert('Error during question submit'); //jshint ignore:line
					});
			};

		}
	]);