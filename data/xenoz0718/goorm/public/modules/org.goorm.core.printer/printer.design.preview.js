/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

/*jshint newcap:false, debug:true, unused: true, evil: true, devel: true, plusplus: false, browser: true, jquery: true, undef:false */
/*clientside jslint comment for global */
/*global org: false */
/*jshint unused: false */



org.goorm.core.printer.design.preview = function () {
	this.canvas = null;
	this.panel = null;
	this.target = null;
	this.real_target = null;
	this.real_width = null;
	this.real_height = null;
	this.width = null;
	this.height = null;
	this.left = null;
	this.top = null;
	this.scale = null;
	this.parent = null;
	this.indicator_width = null;
	this.is_preview_clicked = null;
};

org.goorm.core.printer.design.preview.prototype = {
	init: function (target, width, height, scale, parent) {
		var self = this;

		//Set Properties
		self.target = target;
		self.real_width = width;
		self.width = width * scale;
		self.real_height = height;
		self.height = height * scale;
		self.scale = scale;
		self.parent = parent;
		self.is_preview_clicked = false;

		var __target = $(target);

		//adding html container
		__target.append("<div class='canvas'></div>"); //This is a canvas layer

		var canvas = __target.find('div.canvas');
		canvas.append("<div class='shapes' style='position:absolute; width:" + this.width + "px; height:" + this.height + "px;'></div>"); //This is a grid layer which has grid background image and opacity
		canvas.append("<canvas width='" + self.width + "' height='" + self.height + "' style='position:absolute; background-color:transparent;'></canvas>"); //This is a canvas element which is supported in HTML5

		//Get the Stencils
		__target.prepend("<head><style></style></head>");

		var url = "file/get_contents";

		$.ajax({
			url: url,
			type: "GET",
			data: "path=../../stencil/org.goorm.stencil.uml/stencil.uml.css",
			success: function (data) {
				$(target).find("style").html(data);
			}
		});
	},

	draw: function () {
		var self = this;
		var ratio = 5;

		//Canvas Element (Supported in HTML5)
		if ($(this.target).find(".canvas").find("canvas")[0].getContext) {
			//Get Context
			var context = $(this.target).find(".canvas").find("canvas")[0].getContext('2d');

			//Clear the canvas
			context.clearRect(0, 0, $(this.target).find(".canvas").find("canvas").width(), $(this.target).find(".canvas").find("canvas").height());

			//All objects
			$(this.parent.objects).each(function (i) {

				if (this.properties.timestamp === null) {
					var a = self.parent.objects.slice(0, i);
					var b = self.parent.objects.slice(i, self.parent.objects.length);

					b.shift();
					self.parent.objects = a.concat(b);
				}

				//if the object is line type
				if ($(this)[0].type == 'line') {

					var sx = 0,
						sy = 0,
						ex = 0,
						ey = 0;

					if ($(this)[0].properties.sx) {
						sx = parseInt($(this)[0].properties.sx * self.scale, 10);
					}

					if ($(this)[0].properties.sy) {
						sy = parseInt($(this)[0].properties.sy * self.scale, 10);
					}

					if ($(this)[0].properties.ex) {
						ex = parseInt($(this)[0].properties.ex * self.scale, 10);
					}

					if ($(this)[0].properties.ey) {
						ey = parseInt($(this)[0].properties.ey * self.scale, 10);
					}

					if (!self.parent.multi_node_line) {

						//is hovered?
						if (self.parent.hovered_index == i) {
							context.beginPath();
							context.strokeStyle = "#FFFF00";

							context.moveTo(sx, sy);
							context.lineTo(ex, ey);
							if (parseFloat($(this)[0].properties.thickness) < 0.5) {
								context.lineWidth = 0.5;
							} else {
								context.lineWidth = (parseFloat($(this)[0].properties.thickness) + 5) * self.scale;
							}
							context.stroke();
						}

						//drawing the object
						context.beginPath();
						context.strokeStyle = $(this)[0].properties.color;

						if (this.properties.dashed) {
							var dash_array = [5 * parseFloat($(this)[0].properties.thickness), 4 * parseFloat($(this)[0].properties.thickness)];
							var dash_count = dash_array.length;

							var dx, dy;

							var dash_index = 0,
								draw = true;

							var x, y;

							if (ex < sx) {
								x = ex;
								y = ey;
							} else {
								x = sx;
								y = sy;
							}

							dx = (ex - sx);
							dy = (ey - sy);
							context.moveTo(x, y);

							if (parseFloat($(this)[0].properties.thickness) < 0.5) {
								context.lineWidth = 0.5;
							} else {
								context.lineWidth = (parseFloat($(this)[0].properties.thickness)) * self.scale;
							}

							var slope = dy / dx;
							var remaining_distance = Math.sqrt(dx * dx + dy * dy);

							while (remaining_distance >= 0.1) {
								var dash_length = dash_array[dash_index++ % dash_count];

								if (dash_length > remaining_distance)
									dash_length = remaining_distance;

								var step_x = Math.sqrt(dash_length * dash_length / (1 + slope * slope));

								x += step_x;
								y += slope * step_x;

								context[draw ? 'lineTo' : 'moveTo'](x, y);

								remaining_distance -= dash_length;
								draw = !draw;
							}

							context.stroke();
						} else {
							context.moveTo(sx, sy);
							context.lineTo(ex, ey);

							if (parseFloat($(this)[0].properties.thickness) < 0.5) {
								context.lineWidth = 0.5;
							} else {
								context.lineWidth = (parseFloat($(this)[0].properties.thickness)) * self.scale;
							}
							context.stroke();
						}

						//is selected? or hovered?
						if ($.inArray(i, self.parent.selected_index) >= 0 || self.parent.selected) {
							context.beginPath();
							context.strokeStyle = "#666666";

							context.rect(sx - 3, sy - 3, 6, 6);
							context.closePath();
							context.lineWidth = 1;
							context.stroke();

							context.fillStyle = "#FFFFFF";
							context.fill();

							context.beginPath();
							context.strokeStyle = "#666666";

							context.rect(ex - 3, ey - 3, 6, 6);
							context.closePath();
							context.lineWidth = 1;
							context.stroke();

							context.fillStyle = "#FFFFFF";
							context.fill();
						}

						if (this.shape) {

						}

					} else {

						//drawing the object
						context.beginPath();
						context.strokeStyle = $(this)[0].properties.color;

						if (this.properties.dashed) {
							var dash_array = [5 * parseFloat($(this)[0].properties.thickness), 4 * parseFloat($(this)[0].properties.thickness)];
							var dash_count = dash_array.length;

							var dx, dy;

							var dash_index = 0,
								draw = true;

							var x, y;

							if (ex < sx) {
								x = ex;
								y = ey;
							} else {
								x = sx;
								y = sy;
							}

							dx = (ex - sx);
							dy = (ey - sy);
							context.moveTo(x, y);
							context.lineWidth = parseFloat($(this)[0].properties.thickness);

							var slope = dy / dx;
							var remaining_distance = Math.sqrt(dx * dx + dy * dy);

							while (remaining_distance >= 0.1) {
								var dash_length = dash_array[dash_index++ % dash_count];

								if (dash_length > remaining_distance)
									dash_length = remaining_distance;

								var step_x = Math.sqrt(dash_length * dash_length / (1 + slope * slope));

								x += step_x;
								y += slope * step_x;

								context[draw ? 'lineTo' : 'moveTo'](x, y);

								remaining_distance -= dash_length;
								draw = !draw;
							}

							context.stroke();
						} else {
							context.moveTo(sx, sy);
							context.lineTo((sx + ex) / 2, sy);
							context.lineTo((sx + ex) / 2, ey);
							context.lineTo(ex, ey);
							context.lineWidth = parseFloat($(this)[0].properties.thickness);
							context.stroke();
						}

						//is selected? or hovered?
						if ($.inArray(i, self.parent.selected_index) >= 0 || self.parent.selected) {
							context.beginPath();
							context.strokeStyle = "#666666";

							context.rect(sx - 3, sy - 3, 6, 6);
							context.closePath();
							context.lineWidth = 1;
							context.stroke();

							context.fillStyle = "#FFFFFF";
							context.fill();

							context.beginPath();
							context.strokeStyle = "#666666";

							context.rect(ex - 3, ey - 3, 6, 6);
							context.closePath();
							context.lineWidth = 1;
							context.stroke();

							context.fillStyle = "#FFFFFF";
							context.fill();
						}

						if (this.shape) {

						}
					}

				} else if ($(this)[0].type == 'square') { //if the object is line type

					var sx = 0,
						sy = 0,
						ex = 0,
						ey = 0;

					if ($(this)[0].properties.sx) {
						sx = parseInt($(this)[0].properties.sx / ratio, 10);
					}

					if ($(this)[0].properties.sy) {
						sy = parseInt($(this)[0].properties.sy / ratio, 10);
					}

					if ($(this)[0].properties.ex) {
						ex = parseInt($(this)[0].properties.ex / ratio, 10);
					}

					if ($(this)[0].properties.ey) {
						ey = parseInt($(this)[0].properties.ey / ratio, 10);
					}

					//is hovered?
					if (self.parent.hovered_index == i) {
						context.beginPath();
						context.strokeStyle = "#FFFF00";

						context.rect(sx, sy, ex - sx, ey - sy);
						context.lineWidth = 5;
						context.closePath();

						context.stroke();

						context.beginPath();
						context.strokeStyle = "#000000";
						context.fillStyle = "#FFFFFF";

						context.rect(sx, sy, ex - sx, ey - sy);
						context.lineWidth = 0.5;
						context.closePath();

						context.stroke();
					}

					//drawing the object

					context.beginPath();
					context.strokeStyle = "#000000";
					context.fillStyle = "#FFFFFF";

					context.rect(sx, sy, ex - sx, ey - sy);
					context.lineWidth = 0.5;
					context.closePath();

					context.stroke();
					context.fill();

					//is selected?
					if ($.inArray(i, self.parent.selected_index) >= 0 || self.parent.selected) {
						context.beginPath();
						context.strokeStyle = "#666666";
						context.fillStyle = "#FFFFFF";

						context.rect(sx - 3, sy - 3, 6, 6);
						context.closePath();
						context.lineWidth = 1;
						context.stroke();
						context.fill();

						context.rect(ex - 3, sy - 3, 6, 6);
						context.closePath();
						context.lineWidth = 1;
						context.stroke();
						context.fill();

						context.rect(ex - 3, ey - 3, 6, 6);
						context.closePath();
						context.lineWidth = 1;
						context.stroke();
						context.fill();

						context.rect(sx - 3, ey - 3, 6, 6);
						context.closePath();
						context.lineWidth = 1;
						context.stroke();
						context.fill();

						context.rect((sx + ex) / 2 - 3, ey - 3, 6, 6);
						context.closePath();
						context.lineWidth = 1;
						context.stroke();
						context.fill();

						context.rect((sx + ex) / 2 - 3, sy - 3, 6, 6);
						context.closePath();
						context.lineWidth = 1;
						context.stroke();
						context.fill();

						context.rect(ex - 3, (sy + ey) / 2 - 3, 6, 6);
						context.closePath();
						context.lineWidth = 1;
						context.stroke();
						context.fill();

						context.rect(sx - 3, (sy + ey) / 2 - 3, 6, 6);
						context.closePath();
						context.lineWidth = 1;
						context.stroke();
						context.fill();
					}
				}
			});
		}
	},

	set_shape: function (object) {
		var self = this;

		if (object.properties !== null) {
			$.each(object.properties, function (key, state) {
				if (key == "font_size") {
					$(self.target).find(".canvas").find(".shapes").find("#" + "stencil_" + object.timestamp).find("." + key).css("font-size", state);
				} else if (key == "font_color") {
					$(self.target).find(".canvas").find(".shapes").find("#" + "stencil_" + object.timestamp).find("." + key).css("color", state);
				} else if (key == "font_style") {
					$(self.target).find(".canvas").find(".shapes").find("#" + "stencil_" + object.timestamp).find("." + key).css("font-style", state);
				} else if (key == "font_weight") {
					$(self.target).find(".canvas").find(".shapes").find("#" + "stencil_" + object.timestamp).find("." + key).css("font-weight", state);
				} else if (key == "bg_color") {
					$(self.target).find(".canvas").find(".shapes").find("#" + "stencil_" + object.timestamp).find("." + key).css("background-color", state);
				} else {
					$(self.target).find(".canvas").find(".shapes").find("#" + "stencil_" + object.timestamp).find("." + key).html(state);
				}
			});
		}
	}
};