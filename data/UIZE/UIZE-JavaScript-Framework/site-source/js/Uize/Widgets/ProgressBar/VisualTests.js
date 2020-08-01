/*______________
|       ______  |   U I Z E    J A V A S C R I P T    F R A M E W O R K
|     /      /  |   ---------------------------------------------------
|    /    O /   |    MODULE : Uize.Widgets.ProgressBar.VisualTests Class
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
		The =Uize.Widgets.ProgressBar.VisualTests= class implements a set of visual tests for the =Uize.Widgets.ProgressBar.Widget= class.

		*DEVELOPERS:* `Chris van Rensburg`
*/

Uize.module ({
	name:'Uize.Widgets.ProgressBar.VisualTests',
	superclass:'Uize.Widgets.VisualTests.Widget',
	required:[
		'Uize.Widgets.ProgressBar.Widget',
		'Uize.Widgets.StateValues'
	],
	builder:function (_superclass) {
		'use strict';

		return _superclass.subclass ({
			omegastructor:function () {
				this.addStateCombinationTestCases ({
					statusText:[
						'',
						'<%. percentComplete %>%',
						'<%. stepsCompleted %> of <%. totalSteps %> tests completed',
						'<%. stepsCompleted %> of <%. totalSteps %> tests completed (<%. percentComplete %>%)'
					],
					value:[0,15,30],
					size:Uize.Widgets.StateValues.size,
					maxValue:30
				});
			},

			staticProperties:{
				widgetClass:Uize.Widgets.ProgressBar.Widget
			}
		});
	}
});

