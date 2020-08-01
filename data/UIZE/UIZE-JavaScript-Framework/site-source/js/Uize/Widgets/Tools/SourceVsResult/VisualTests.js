/*______________
|       ______  |   U I Z E    J A V A S C R I P T    F R A M E W O R K
|     /      /  |   ---------------------------------------------------
|    /    O /   |    MODULE : Uize.Widgets.Tools.SourceVsResult.VisualTests Class
|   /    / /    |
|  /    / /  /| |    ONLINE : http://www.uize.com
| /____/ /__/_| | COPYRIGHT : (c)2014-2015 UIZE
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
		The =Uize.Widgets.Tools.SourceVsResult.VisualTests= class implements a set of visual tests for the =Uize.Widgets.Tools.SourceVsResult.Widget= class.

		*DEVELOPERS:* `Chris van Rensburg`
*/

Uize.module ({
	name:'Uize.Widgets.Tools.SourceVsResult.VisualTests',
	superclass:'Uize.Widgets.VisualTests.Widget',
	required:'Uize.Widgets.Tools.SourceVsResult.Widget',
	builder:function (_superclass) {
		'use strict';

		return _superclass.subclass ({
			omegastructor:function () {
				this.addStateTestCase ({
					source:'THIS IS THE SOURCE',
					result:'THIS IS THE RESULT',
					sourceViewButtonLabel:'Source',
					resultViewButtonLabel:'Result'
				});
			},

			staticProperties:{
				widgetClass:Uize.Widgets.Tools.SourceVsResult.Widget
			}
		});
	}
});

