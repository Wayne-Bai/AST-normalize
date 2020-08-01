/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
({
    // Excluded on IE7/8 because uses unsupported HTML5 features
    browsers: ["-IE7", "-IE8"],
	testCarouselNavTop: {
		test : function(component){
			var nav = component.find('navContainer');
			$A.test.assertTrue($A.util.hasClass(nav.getElement(),'carousel-nav-position-top'));
		}
	},
	
	testCarouselNavBottom: {
		attributes : {pageIndicatorPosition : 'bottom'},
		test : function(component){
			var nav = component.find('navContainer');
			$A.test.assertTrue($A.util.hasClass(nav.getElement(),'carousel-nav-position-bottom'));
		}
	},
	
	testContinousFlowNavigationIndicatorsDoNotDisplay: {
		attributes : {continuousFlow : 'true'},
		test : function(component){
			var nav = component.find('navContainer');
			$A.test.assertTrue($A.util.isUndefinedOrNull(nav,'Navigation indicators should not be displayed'));
		}
	}
})