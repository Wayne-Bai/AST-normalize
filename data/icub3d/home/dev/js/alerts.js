/*
 Copyright 2013 Joshua Marsh. All rights reserved.  Use of this
 source code is governed by a BSD-style license that can be found in
 the LICENSE file.
 */

// AlertsCtrl is the controller for part of the site that lists all of
// alert messages. The Alerts service keeps track of the alerts and
// this controller adds them as toast messages that can be removed.
function AlertsCtrl($scope, Alerts) {
		$scope.alerts = Alerts.alerts;
		
		$scope.remove = function(index) {
				Alerts.remove(index);
		};
}
AlertsCtrl.$inject = ['$scope', 'Alerts'];
