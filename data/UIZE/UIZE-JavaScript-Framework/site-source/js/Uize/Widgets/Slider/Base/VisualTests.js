/*______________
|       ______  |   U I Z E    J A V A S C R I P T    F R A M E W O R K
|     /      /  |   ---------------------------------------------------
|    /    O /   |    MODULE : Uize.Widgets.Slider.Base.VisualTests Class
|   /    / /    |
|  /    / /  /| |    ONLINE : http://www.uize.com
| /____/ /__/_| | COPYRIGHT : (c)2013-2015 UIZE
|          /___ |   LICENSE : Available under MIT License or GNU General Public License
|_______________|             http://www.uize.com/license.html
*/

/* Module Meta Data
	type: Class
	importance: 1
	codeCompleteness: 100
	docCompleteness: 100
*/

/*?
	Introduction
		The =Uize.Widgets.Slider.Base.VisualTests= class implements a set of visual tests for the =Uize.Widgets.Slider.Base.Widget= class.

		*DEVELOPERS:* `Chris van Rensburg`
*/

Uize.module ({
	name:'Uize.Widgets.Slider.Base.VisualTests',
	superclass:'Uize.Widgets.VisualTests.Widget',
	required:[
		'Uize.Widgets.Slider.Base.Widget',
		'Uize.Widgets.StateValues'
	],
	builder:function (_superclass) {
		'use strict';

		var _allSizes = Uize.Widgets.StateValues.size;

		return _superclass.subclass ({
			omegastructor:function () {
				this.addStateCombinationTestCases ({
					orientation:['horizontal','vertical'],
					size:_allSizes,
					trackLength:400,
					value:[0,500,1000],
					maxValue:1000
				});
			},

			staticProperties:{
				widgetClass:Uize.Widgets.Slider.Base.Widget
			}
		});
	}
});

