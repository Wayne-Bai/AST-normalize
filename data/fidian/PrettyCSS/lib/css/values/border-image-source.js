/* <border-image-source>
 *
 * CSS3:  inherit | <image>
 */

"use strict";

var base = require('./base');
var util = require('../../util');
var validate = require('./validate');

var Val = base.baseConstructor();

util.extend(Val.prototype, base.base, {
	name: "border-image-source",

	allowed: [
		{
			validation: [
				validate.minimumCss(3)
			],
			values: [ 
				"inherit"
			],
			valueObjects: [
				'image'
			]
		}
	]
});

exports.parse = base.simpleParser(Val);
