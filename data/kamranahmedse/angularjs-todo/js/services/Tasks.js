app.factory('Tasks', ['$rootScope', '$timeout', '$q', '$http', 'SysDates', function ( $rootScope, $timeout, $q, $http, sysDates ) {

	var projects = [
		{ project_id : '001', project_title : 'Inbox', slug : 'inbox', category : 'generic' },
		{ project_id : '002', project_title : 'Doctadroid', slug : 'doctadroid', category : 'user_defined' },
		{ project_id : '003', project_title : 'Web security analyser', slug : 'web-security', category : 'user_defined' },
		{ project_id : '004', project_title : 'Time logging application', slug : 'time-logging-app', category : 'user_defined' },
		{ project_id : '005', project_title : 'Digital Manager', slug : 'digital-manager', category : 'user_defined' },
		{ project_id : '006', project_title : 'Linkoo : A URL Shortener', slug : 'linkoo-a-url-shortener', category : 'user_defined' },
		{ project_id : '007', project_title : 'Toodloo: Being productive', slug : 'toodloo-being-productive', category : 'user_defined' }
	];

	var tasks = [
		{ id : '001', project_id: '006', title : 'Do some research on timezones in javascript!', trackedTime : '0:10:00', due_date : 'Mar 30, 2014 @ 01:00pm', isCompleted : true, showTask : true },
		{ id : '002', project_id: '005', title : 'Checkout the angular projects for structure on git.', trackedTime : '0:01:00', due_date : 'Mar 30, 2014', isComplete : false, showTask: true },
		{ id : '003', project_id: '005', title : 'Mould the project to repository!', trackedTime : '0:11:00', due_date : 'Feb 12, 2014', isComplete : false, showTask: true },
		{ id : '004', project_id: '001', title : 'Security concerns in offline applications.', trackedTime : '0:02:00', due_date : 'Jan 12, 2014 @ 02:00pm', isComplete : false, showTask: true },
		{ id : '005', project_id: '001', title : 'Office : ct.digitalmanager.pk domain republish.', trackedTime : '2:01:00', due_date : 'Mar 28, 2014', isComplete : false, showTask: true },
		{ id : '006', project_id: '005', title : 'Start working on fyp', trackedTime : '0:10:00', due_date : 'Mar 29, 2013', isCompleted : true, showTask : true },
		{ id : '007', project_id: '005', title : 'Design some mockups!', trackedTime : '0:01:00', due_date : 'Mar 30, 2013', isComplete : false, showTask: true },
		{ id : '008', project_id: '001', title : 'Complete Angular and start working on the original project!', trackedTime : '0:11:00', due_date : 'Every mon @ 01:00 pm', isComplete : false, showTask: true },
		{ id : '124', project_id: '001', title : 'Complete Angular and start working on the original project!', trackedTime : '0:11:00', due_date : 'Every day @ 01:00 pm', isComplete : false, showTask: true },
		{ id : '125', project_id: '001', title : 'Complete Angular and start working on the original project!', trackedTime : '0:11:00', due_date : 'Every jun 12', isComplete : false, showTask: true },
		{ id : '155', project_id: '001', title : 'Here is a recursive date with time!', trackedTime : '0:11:00', due_date : 'Every jun 12 @ 01:00 pm', isComplete : false, showTask: true },
		{ id : '127', project_id: '001', title : 'Complete Angular and start working on the original project!', trackedTime : '0:11:00', due_date : 'every day', isComplete : false, showTask: true },
		{ id : '128', project_id: '001', title : 'Complete Angular and start working on the original project!', trackedTime : '0:11:00', due_date : 'every day @ 02:30 pm', isComplete : false, showTask: true },
		{ id : '009', project_id: '002', title : 'Structure your code in MVC.', trackedTime : '0:02:00', due_date : 'Mar 12, 2013', isComplete : false, showTask: true },
		{ id : '010', project_id: '006', title : 'Create a timeline of how you will be performing your tasks.', trackedTime : '2:01:00', due_date : 'Mar 23, 2015', isComplete : false, showTask: true },
		{ id : '011', project_id: '006', title : 'Remember the progressive enhancement rule.', trackedTime : '0:01:01', due_date : 'Mar 12, 2014', isComplete : false, showTask: true },
		{ id : '012', project_id: '006', title : 'Try to make interface more interactive.', trackedTime : '4:01:00', due_date : 'Jan 3, 2014', isComplete : false, showTask: true },
		{ id : '013', project_id: '003', title : 'Prepare presentation for the proposal defense', trackedTime : '0:00:00', due_date : 'Mar 12, 2013', isCompleted : true, showTask : true },
		{ id : '014', project_id: '003', title : 'Start working on the emails', trackedTime : '0:00:00', due_date : 'Mar 12, 2013', isCompleted : true, showTask : true },
		{ id : '015', project_id: '003', title : 'Prepare mockups', trackedTime : '0:00:00', due_date : 'Mar 12, 2013', isCompleted : true, showTask : true },
		{ id : '016', project_id: '003', title : 'Download TutsPlus tutorials on web security.', trackedTime : '0:00:00', due_date : 'Mar 12, 2013', isCompleted : true, showTask : true },
		{ id : '017', project_id: '004', title : 'Do some research on Timely.', trackedTime : '0:00:00', due_date : 'Mar 12, 2013', isCompleted : true, showTask : true },
		{ id : '018', project_id: '004', title : 'Work on its form validations.', trackedTime : '0:00:00', due_date : 'Mar 12, 2013', isCompleted : true, showTask : true },
		{ id : '019', project_id: '004', title : 'Make PHP code in it look pretier and upload to github.', trackedTime : '0:00:00', due_date : 'Mar 12, 2013', isCompleted : true, showTask : true }
	];

	return {

		getProjects : function (){
			var q = $q.defer();

			// TODO: Needs modification in url
			$http({
				url: 'http://localhost/toodloo/api/kernel.php',
				method: 'POST',
				data: { action: "getProjects" }
			}).success(function( data, status, headers, config ){
				q.resolve( data );
			}).error(function( data, status, headers, config ) {
				q.reject( status );
			});

			return q.promise;
		},

		saveProject : function( project ) {

			var q = $q.defer();

			// TODO: Needs modification in url
			$http({
				url: 'http://localhost/toodloo/api/kernel.php',
				method: 'POST',
				data: { action: "saveProject", project: project }
			}).success(function( data, status, headers, config ){
				q.resolve( data );
			}).error(function( data, status, headers, config ) {
				q.reject( status );
			});

			return q.promise;
		},

		updateTask : function ( task ) {
			var q = $q.defer();

			$http({
				url : 'http://localhost/toodloo/api/kernel.php',
				method : 'POST',
				data : { action : "updateTask", task : task }
			}).success(function( data, status, headers, config ) {
				q.resolve( data );
			}).error( function ( data, status, headers, config) {
				q.reject( status );
			});

			return q.promise;
		},

		addTask : function ( task ) {

			var q = $q.defer();

			// TODO: Needs modification in url
			$http({
				url: 'http://localhost/toodloo/api/kernel.php',
				method: 'POST',
				data: { action: "saveTask", task: task }
			}).success(function( data, status, headers, config ){
				q.resolve( data );
			}).error(function( data, status, headers, config ) {
				q.reject( status );
			});

			return q.promise;
		},

		fetchAllTasks : function () {

			var q = $q.defer();

			$http({
				url: 'http://localhost/toodloo/api/kernel.php',
				method: 'POST',
				data : { action : "getAllTasks" }
			}).success(function( data, status, headers, config ){
				tasks = data;
				q.resolve( 'FETCH_TASKS_SUCCESS' );
			}).error(function ( data, status, headers, config ) {
				q.reject( 'FETCH_TASKS_ERROR' );
			});

			return q.promise;

		},

		getAllTasks : function () {
			var tempTasks = tasks;
			tempTasks = this.sortTasks(tempTasks, 'DESC');

			return tempTasks;
		},

		getTasksByProjectSlug : function( slug ){

			var q = $q.defer();

			// TODO: Needs modification in url
			$http({
				url: 'http://localhost/toodloo/api/kernel.php',
				method: 'POST',
				data: { action: "getTasksByProjectSlug", slug: slug }
			}).success(function( data, status, headers, config ){
				q.resolve( data );
			}).error(function( data, status, headers, config ) {
				q.reject( status );
			});

			return q.promise;
		},

		getProjectBySlug : function ( slug ) {

			// var slugProject = false;

			// angular.forEach(projects, function( project, index ){
			// 	if ( slug == project.slug ) {
			// 		slugProject = project;
			// 	};
			// });

			// return slugProject;

			var defer = $q.defer();

			$http({
				url: 'http://localhost/toodloo/api/kernel.php',
				method: 'POST',
				data: { action: "getProjectBySlug", slug: slug }
			}).success(function( data, status, headers, config ){
				defer.resolve( data );
			}).error(function( data, status, headers, config ) {
				defer.reject( status );
			});

			return defer.promise;
		},

		getProjectsByCategory : function ( category ){
			var reqProjects = [];

			angular.forEach(projects, function( project, index ) {
				if ( category === project.category ) {
					reqProjects.push( project );
				};
			});

			return reqProjects;
		},

		isProjectUnique : function ( projectTitle ) {

			var isUnique = true;

			angular.forEach(projects, function( project, index ) {
				if ( projectTitle.toLowerCase() === project.project_title.toLowerCase() ) {
					isUnique = false;
				};
			});

			return isUnique;
		},

		triggerEvent : function( triggerWhat, data ) {
			$rootScope.$broadcast(triggerWhat, data);
		},

		/**
		 * Toggles the status of the task i.e. if completed, then incomplete and vice versa
		 * @param  {int} taskId Number representing the ID of the task
		 */
		toggleTaskStatus : function( taskId ) {
			var defer = $q.defer();

			$http({
				url: 'http://localhost/toodloo/api/kernel.php',
				method: 'POST',
				data: { action: "toggleTaskStatus", task_id: taskId }
			}).success(function( data, status, headers, config ){
				defer.resolve( data );
			}).error(function( data, status, headers, config ) {
				defer.reject( status );
			});

			return defer.promise;
		},

		removeTask : function( taskId ){
			var defer = $q.defer();

			$http({
				url: 'http://localhost/toodloo/api/kernel.php',
				method: 'POST',
				data: { action: "removeTask", task_id: taskId }
			}).success(function( data, status, headers, config ){
				defer.resolve( data );
			}).error(function( data, status, headers, config ) {
				defer.reject( status );
			});

			return defer.promise;
		},

		getProjectTasks : function ( projectId ) {

			var defer = $q.defer();

			$http({
				url: 'http://localhost/toodloo/api/kernel.php',
				method: 'POST',
				data: { action: "getTasksByProjectId", projectId: projectId }
			}).success(function( data, status, headers, config ){
				defer.resolve( data );
			}).error(function( data, status, headers, config ) {
				defer.reject( status );
			});

			return defer.promise;
		},

		sortTasks : function( rangeTasks, order ) {

			var orderedTasks = null;

			if ( order === 'ASC' ) {
				orderedTasks = rangeTasks.sort(function( task1, task2 ){
					return Date.parse( sysDates.getDate(task1.due_date) ) - Date.parse( sysDates.getDate(task2.due_date) )
				});
			} else if ( order === 'DESC' ) {
				orderedTasks = rangeTasks.sort(function( task1, task2 ){
					return Date.parse( sysDates.getDate(task2.due_date) ) - Date.parse( sysDates.getDate(task1.due_date) );
				});
			};

			return orderedTasks;
		},

		getTasksInDateRange : function ( startDate, endDate ) {

			var rangeTasks = [];

			startDate = Date.parse( startDate );
			endDate = Date.parse( endDate );

			angular.forEach(tasks, function( task, index ) {

				var tempDate = sysDates.getDate( task.due_date, '{yyyy}/{MM}/{dd}' );
				tempDate = Date.parse( tempDate );

				if ( ( tempDate >= startDate ) && ( tempDate <= endDate ) ) {
					rangeTasks.push( task );
				};

			});


			rangeTasks = this.sortTasks( rangeTasks, 'DESC' );
			return rangeTasks;
		}

	};
}]);