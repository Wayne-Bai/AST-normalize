/**
 * Zumba(r) Angular Waypoints v1.0.1 - 2014-10-13
 * An AngularJS module for working with jQuery Waypoints
 *
 * Copyright (c) 2014 Zumba (r)
 * Licensed MIT
 */
/**
 * Service for injecting a callback handler for the zumWaypoint Directive
 *
 * @param Function $timeout service
 */
var WaypointService = function WaypointService($timeout) {
	this.$timeout = $timeout;
};

/**
 * Get a waypoint handler that executes `callback` on next tick
 *
 * Callback will be passed the waypoint slug.
 *
 * @param Object scope
 * @param Function callback
 * @return mixed
 */
WaypointService.prototype.getHandlerSync = function getHandlerSync(scope, callback) {
	var timeout = this.$timeout;

	return function(direction) {
		var waypoint = scope[direction];
		if (waypoint) {
			timeout($.proxy(callback, null, waypoint));
		}
	};
};

/**
 * Waypoint slugs parsed into objects and stored by key:
 * {
 *     'example.point' : { namespace : 'example', waypoint : 'point' },
 *     'noNamespace' : { namespace : 'globals', waypoint : 'noNamespace' }
 * }
 *
 * @type Object
 */
var parsedWaypoints = {};

/**
 * Waypoint Controller
 *
 * @param Object $scope
 */
var WaypointController = function WaypointController($scope) {
	$scope.waypoints = {};
	this.$scope = $scope;
};

/**
 * Get a namespace for the waypoint
 *
 * @param String qualifiedWaypoint
 * @return String
 */
var parseWaypoint = function parseWaypoint(qualifiedWaypoint) {
	var parts;
	if (!parsedWaypoints[qualifiedWaypoint]) {
		parts = qualifiedWaypoint.split('.');
		if (parts.length === 1) {
			parts.unshift('globals');
		}
		parsedWaypoints[qualifiedWaypoint] = {
			namespace : parts.shift(),
			waypoint : parts.join('.')
		};
	}
	return parsedWaypoints[qualifiedWaypoint];
};

/**
 * Sets all waypoints in the colleciton to false, and sets the indicated waypoint to true.
 *
 * @param Object collection
 * @param String waypoint
 */
var setWaypoint = function setWaypoint(collection, waypoint) {
	$.each(collection, function clearWaypoints(waypoint) {
		collection[waypoint] = false;
	});
	collection[waypoint] = true;
};

/**
 * Clear all waypoints in the same namespace as qualifiedWaypoint,
 * and set qualifiedWaypoint.
 *
 * @param String qualifiedWaypoint
 * @return void
 */
WaypointController.prototype.processWaypoint = function processWaypoint(qualifiedWaypoint) {
	var waypoints = this.$scope.waypoints;
	var data = parseWaypoint(qualifiedWaypoint);
	var namespace = data.namespace;

	if (!waypoints[namespace]) {
		waypoints[namespace] = {};
	}

	setWaypoint(waypoints[namespace], data.waypoint);
};
var zumWaypoint = function zumWaypoint(WaypointService) {
	return {
		controller : 'WaypointController',
		scope : {
			up : '@',
			down : '@',
			offset : '@',
			waypoints : '=?zumWaypoint'
		},
		link : function zumWaypointLink(scope, element, attrs, ctrl) {
			var callback = $.proxy(ctrl.processWaypoint, ctrl);
			element.waypoint({
				handler : WaypointService.getHandlerSync(scope, callback),
				offset : scope.offset || 0
			});
		}
	};
};