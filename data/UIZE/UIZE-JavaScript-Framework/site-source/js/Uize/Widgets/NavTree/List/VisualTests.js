/*______________
|       ______  |   U I Z E    J A V A S C R I P T    F R A M E W O R K
|     /      /  |   ---------------------------------------------------
|    /    O /   |    MODULE : Uize.Widgets.NavTree.List.VisualTests Class
|   /    / /    |
|  /    / /  /| |    ONLINE : http://www.uize.com
| /____/ /__/_| | COPYRIGHT : (c)2013-2015 UIZE
|          /___ |   LICENSE : Available under MIT License or GNU General Public License
|_______________|             http://www.uize.com/license.html
*/

/* Module Meta Data
	type: Class
	importance: 1
	codeCompleteness: 5
	docCompleteness: 100
*/

/*?
	Introduction
		The =Uize.Widgets.NavTree.List.VisualTests= class implements a set of visual tests for the =Uize.Widgets.NavTree.List.Widget= class.

		*DEVELOPERS:* `Chris van Rensburg`
*/

Uize.module ({
	name:'Uize.Widgets.NavTree.List.VisualTests',
	superclass:'Uize.Widgets.VisualTests.Widget',
	required:[
		'Uize.Widgets.NavTree.List.Widget',
		'Uize.Test.TestData.Animals',
		'Uize.Test.TestData.Plants'
	],
	builder:function (_superclass) {
		'use strict';

		return _superclass.subclass ({
			omegastructor:function () {
				this.addStateTestCase ({items:Uize.Test.TestData.Animals ()});
				this.addStateTestCase ({items:Uize.Test.TestData.Plants ()});
			},

			staticProperties:{
				widgetClass:Uize.Widgets.NavTree.List.Widget
			}
		});
	}
});

