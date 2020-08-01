/*
 Copyright 2013 Joshua Marsh. All rights reserved.  Use of this
 source code is governed by a BSD-style license that can be found in
 the LICENSE file.
 */

// This is used to auto-focus the items then they are switched
// from a span to a text box. 
function HasFocus() {
		return function(scope, element, attrs) {
				scope.$watch(attrs.ngHasfocus, function (nVal, oVal) {
						if (nVal) {
								$(element[0]).show();
								$(element[0]).focus();
								$(element[0]).select();
						}
				});
				
				element.bind('blur', function() {
						scope.$apply("edit(-1);");
				});
				
				element.bind('keydown', function (e) {
						if (e.which == 13) {
								scope.$apply("edit(-1);");
						}
				});
		};
}
