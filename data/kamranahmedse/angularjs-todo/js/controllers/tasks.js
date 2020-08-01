'use strict';

app.controller('TasksCtrl', ['$scope', 'Tasks', '$q', function ($scope, Tasks, $q) {

	$scope.page = {};

	$scope.printTasks = function () {
		window.open('prints/task-print.php', "Tasks List", "width=616, height=842");
	}

	function setPageStatus (status) {
		$scope.page.syncStatus = status;
	}

	function toggleTaskStatusClass ( taskPosition ) {
		var $taskAtHand = angular.element('.tasknum-' + taskPosition);

		var newStatusClass = $taskAtHand.hasClass('completed-true') ? 'completed-false' : 'completed-true';

		$taskAtHand.removeClass('completed-true');
		$taskAtHand.removeClass('completed-false');

		$taskAtHand.addClass( newStatusClass );
	}

	/**
	 * Toggles the status of task from completed to incomplete
	 * @param  {int} taskId       Number representing the id of the task
	 * @param  {int} taskPosition Number representing the index/position of the task in the list of tasks
	 */
	$scope.toggleTaskStatus = function ( taskId, taskPosition ) {
		
		toggleTaskStatusClass( taskPosition );

		setPageStatus('busy');
		
		Tasks.toggleTaskStatus( taskId ).then( function ( data ) {
			if ( data === 'TOGGLE_STATUS_SUCCESS') {
				alert('Task status succesfuly changed!');
			} else {	
				// Undo the status change in task, that was made before the request
				toggleTaskStatusClass( taskPosition );
			
				alert('An unknown error occured while status change! Process was unsuccesful.');
			}

			setPageStatus('idle');

		}, function ( error ) {
			setPageStatus('error');
			
			// Undo the status change in task, that was made before the request
			toggleTaskStatusClass( taskPosition );

			alert('An unknown error occured while status change! Process was unsuccesful.\nDetail: ' + error);
		});
	}

	function processTaskRemoval ( taskId, taskPosition ) {
		var taskRemoval = Tasks.removeTask( taskId );

		setPageStatus('busy');
		// Make a clone, so that if the process fails, we can put it back
		var taskClone = angular.element( '.tasknum-' + taskPosition ).clone();
		// Remove the original element
		angular.element( '.tasknum-' + taskPosition ).remove();

		taskRemoval.then(function( data ){

			if ( data === 'TASK_REMOVE_SUCCESS' ) {
				
				alert('Task succesfuly removed!');
				
				// Task succesfuly removed, no need to put back the item.
				// angular.element( '.tasknum-' + taskPosition ).remove();

				
			} else {
				
				// For some reason, appending the old task back isn't activating the events upon this element
				// angular.element('.tasks').append( taskClone );

				// So manually refreshing the events, FOR NOW
				Tasks.triggerEvent('tasksChanged');

				alert('Error removing the task! Please retry.');
			}
			setPageStatus('idle');

		}, function ( error ) {
			alert('An error occured while removing the task! Please retry.\nDetail: ' + error );
			setPageStatus('idle');
		});
	}

	/**
	 * Initiates the task remove
	 * @param  {int} taskId    ID of the task that is to be removed
	 * @param  {int} taskPosition A number representing the index/position of the task in the list of tasks being shown, it will be used for the task removal on success
	 */
	$scope.removeTask = function( taskId, taskPosition ) {

		var delConfirmation = confirm('Warning!\nOnce done, you won\'t be able to undo this. Are you sure to remove this task?');

		if ( delConfirmation === true ) {
			processTaskRemoval( taskId, taskPosition );
			// TODO : Task refresh code here!
		} else {
			// Do nothing!
		}
	}

	$scope.hideCompletedTasks = function ( ) {
		// Tasks.triggerEvent('changeTasksVisibility', { showCompleted : true });
	}

	$scope.showCompletedTasks = function ( ) {
		// Tasks.triggerEvent('changeTasksVisibility', { showCompleted : false });
	}

	$scope.sortBy = function ( what ) {
		$scope.orderFilter = what;
	}

}]);