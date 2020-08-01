/* ==================================================================
	AngularJS Datatype Editor - Text
	A directive to edit text in place

	Usage:
	<div ade-text ade-class="input-large" ade-id="1235" ade-max="20" ng-model="data"></div>

	Config:

	ade-id:
		If this id is set, it will be used in messages broadcast to the app on state changes.
	ade-class:
		A custom class to give to the input
	ade-readonly:
		If you don't want the stars to be editable	
	ade-max:
		The optional maximum length to enforce

	Messages:
		name: ADE-start
		data: id from config

		name: ADE-finish
		data: {id from config, old value, new value, exit value}

------------------------------------------------------------------*/

angular.module('ADE').directive('adeText', ['ADE','$compile','$sanitize',function(ADE,$compile,$sanitize) {
	return {
		require: '?ngModel', //optional dependency for ngModel
		restrict: 'A', //Attribute declaration eg: <div ade-text=""></div>

		scope: {
			adeId: "@",
			adeClass: "@",
			adeReadonly: "@",
			adeMax: "@",
			ngModel: "="
		},

		//The link step (after compile)
		link: function(scope, element, attrs) {
			var editing=false; //are we in edit mode or not
			var input = null; //a reference to the input DOM object
			var exit = 0; //0=click, 1=tab, -1= shift tab, 2=return, -2=shift return, 3=esc. controls if you exited the field so you can focus the next field if appropriate
			var maxlength = 0;
			var readonly = false;
			var inputClass = "";
			var stopObserving = null;
			var adeId = scope.adeId;

			if(scope.adeClass!==undefined) inputClass = scope.adeClass;
			if(scope.adeReadonly!==undefined && scope.adeReadonly=="1") readonly = true;
			if(scope.adeMax!==undefined) maxlength = parseInt(scope.adeMax);

			var makeHTML = function() {
				var html = "";
				var value = scope.ngModel;
				
				//TODO: truncate to maxlength for display of pre-existing data
				if(value!==undefined) {
					if(angular.isArray(value)) value = value[0];
					if(value===null || value===undefined) value="";
					if(!angular.isString(value)) value = value.toString();
					value = $sanitize(value).replace(/<[^>]+>/gm, '');

					html = value;
				}
				element.html(html);
			};

			//called once the edit is done, so we can save the new data	and remove edit mode
			var saveEdit = function(exited) {
				var oldValue = scope.ngModel;
				exit = exited;

				if(exited!=3) { //don't save value on esc
					scope.ngModel = input.val();
				}

				element.show();
				input.remove();
				editing=false;

				ADE.done(adeId, oldValue, scope.ngModel, exit);
				ADE.teardownBlur(input);
				ADE.teardownKeys(input);
			};

			var clickHandler = function() {
				if(editing) return;
				editing=true;
				exit = 0;

				adeId = scope.adeId;
				ADE.begin(adeId);

				var maxtag = '';
				if(maxlength!==undefined && maxlength!=0 && !isNaN(maxlength)) maxtag = "maxlength='"+maxlength+"'";

				var value = scope.ngModel;
				if(value==undefined || value==null) value="";
				if(!angular.isString(value)) value = value.toString();
				
				element.hide();
				$compile('<input type="text" class="ade-input '+inputClass+'" value="'+value.replace(/"/g,'&quot;')+'" '+maxtag+' />')(scope).insertAfter(element);
				input = element.next('input');
				input.focus();
				
				//put cursor at end
				input[0].selectionStart = input[0].selectionEnd = input.val().length; 

				ADE.setupBlur(input,saveEdit,scope);
				ADE.setupKeys(input,saveEdit,false,scope);
			};

			//setup events
			if(!readonly) {
				element.on('click.ADE', function(e) {
					scope.$apply(function() {
						clickHandler(e);
					})
				});
			}

			//A callback to observe for changes to the id and save edit
			//The model will still be connected, so it is safe, but don't want to cause problems
			var observeID = function(value) {
				 //this gets called even when the value hasn't changed, 
				 //so we need to check for changes ourselves
				 if(editing && adeId!==value) saveEdit(3);
			};

			//If ID changes during edit, something bad happened. No longer editing the right thing. Cancel
			stopObserving = attrs.$observe('adeId', observeID);

			scope.$on('$destroy', function() { //need to clean up the event watchers when the scope is destroyed
				if(element) element.off('click.ADE');
			
				if(stopObserving && stopObserving!=observeID) { //Angualar <=1.2 returns callback, not deregister fn
					stopObserving();
					stopObserving = null;
				} else {
					delete attrs.$$observers['adeId'];
				}
			});

			//need to watch the model for changes
			scope.$watch(function(scope) {
				return scope.ngModel;
			}, function () {
				makeHTML();
			});
		}
	};
}]);