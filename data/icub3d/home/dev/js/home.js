/*
 Copyright 2013 Joshua Marsh. All rights reserved.  Use of this
 source code is governed by a BSD-style license that can be found in
 the LICENSE file.
 */

var home = angular.module('home', ['rest']);

home.config(['$routeProvider', Router]);
home.directive('ngHasfocus', HasFocus);
home.directive('modal', Modal);
