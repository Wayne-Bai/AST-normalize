/**
 * Author: Bhavani Shankar, Divya
 * Date: 01/16/12
 * Time: 04:19 PM
 * About this : Utility to apply specified properties to the palette 
 */
define(["matisse", "matisse.util", "matisse.ui", "matisse.toolbuttons.handlers", "matisse.action-bar"], function (matisse, util, ui, toolHandlers, actionBar) {
	return {
		_applyProperties: function (properties) {
			/*Allow only string of characters, no numbers */
			keyPressed_letterNumber = function (e) {
				return util.letternumber(e);
			};
			/*Allow only string of numbers */
			keyPressed_numbersOnly = function (e) {
				return util.numbersonly(this, e);
			};
			var props = {};
			/* create a div for properties window */
			$('#propdiv').append('<div id="prop"><table id="proptable"><tr><td bgcolor="#FFFFFF" border="1px" class= "cp" id="colorpicker"></td></tr></table></div>');
			/* loop through all properties of the drawing element */
			jQuery.each(properties, function (i, val) {
				var activeObject = canvas.getActiveObject();
				/* if property is of type angle get the angle value of that drawing element */
				if (i === 'angle') {
					val = activeObject.getAngle(); // because angle property does not return any value
				} else if(i === 'source'){
					val = activeObject[i] == null || activeObject[i] == undefined ? "http://" : activeObject[i];
				} else {
					val = activeObject[i];
				}
				/* if property is of type fill or stroke attach keypressed_letterNumber method to keypress event*/
				if (i === "fill" || i === "stroke") {
					var inputTag = "<input style='width:100px' onKeyPress = keyPressed_letterNumber()  class= 'color' id='" + i + "' value='" + val + "'></input></div>";
				} else if(i === 'text') {
                                    var inputTag = "<textarea cols=10 style='height:75px' id='" + i + "'>" + val + "</textarea>";
                                } else { /* if property is of type  other than fill or stroke attach keyPressed_numbersOnly method to keypress event*/
					var inputTag = "<input type='text' style='width:100px' onKeyPress = keyPressed_numbersOnly() id='" + i + "' value='" + val + "'></input>";
				}
				var $propTableDiv = $("#proptable");
				$propTableDiv.append("<tr class='" + i + "tr'><td ><label style = 'text-align: right' for='" + i + "'>" + i + ": </label></td><td >" + inputTag + "</td></tr>");
				var inBox = $("#" + i);
				/* disable width and height input boxes, so that user is not allowed to set width and height */
				if(i === "width" || i === "height") {
                                    inBox.closest('tr').hide();
				}
				/* when focus is on any input boxes handle drawing element updates*/
				$(":input").focus(function () {
					matisse.focusInput = ''; /* use this value for color picker to apply color to object with this id */
					var id = this.id;
					/* when id is either fill or stroke then show color picker */
					if (id === 'fill' || id === 'stroke') {
						matisse.focusInput = id;
						var prop = $(this).position();
						$('#colorpicker').show();
						var ht = $propTableDiv.height();
						var cssObj = {'position': 'absolute', 'left': 5, 'top': prop.top + 20};
						$('#colorpicker').css(cssObj);
						$("#propdiv").dialog({ height: 530});
					}
				});
				/* Hide color picker when focus is lost from either fill or stroke input boxes */
				$(":input").blur(function () {
					matisse.focusInput = '';
					var id = this.id;
					if (id === 'fill' || id === 'stroke') {
						$('#colorpicker').hide();
						$("#propdiv").dialog({ height: 'auto'});
					}
				});
				inBox.keyup(function () {
					if (!canvas.getActiveObject()) { /* if there is no object selected on canvas simply return */
						return;
					}
					var actObj = canvas.getActiveObject();
					var val = $("#" + i).val();
					/* set the property of drawing object with this user input value */

                                        if(!parseFloat(val) && (i === 'scaleX' || i === 'scaleY')) {
                                            // scale being 0 is troublesome... so making it very small
                                            val = '0.01';
                                        }

					actObj.set(i, val);
					if (i === 'angle') {
						actObj.setAngle(val);
					} else if(i === 'source' && val.search(/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/)!=-1) {
						fabric.Image.fromURL(val, function(img) {
						  img.set({'left':actObj.left, 'top': actObj.top, 'scaleX':actObj.scaleX, 'scaleY':actObj.scaleY, 'source':val});
						  img.setAngle(actObj.getAngle());
						  img.setCoords();
						  img.name = "image";
						  img.uid = actObj.uid;
						  img.palette = "components";
						  canvas.remove(actObj);
						  canvas.add(img);
						  console.log(img);
						  canvas.renderAll();
						  matisse.comm.sendDrawMsg({
								action: "modified",
								args: [{
									uid: img.uid,
									object: img
								}]
							});
						  matisse.isUpdatingProperties = true;
						  canvas.setActiveObject(img);
						  matisse.isUpdatingProperties = false;
							util.quickMenuHandler(img);
						});
						return;
					}
					canvas.renderAll();
					canvas.getActiveObject().setCoords();
					/* Notify server about this object property change */
					matisse.comm.sendDrawMsg({
						action: "modified",
						args: [{
							uid: actObj.uid,
							object: actObj
						}]
					});
					util.quickMenuHandler(actObj);
				});
			});
			var colorPicker = $.farbtastic("#colorpicker");
			colorPicker.linkTo(function (color) {
				if (matisse.focusInput === "") {
					return;
				}
				/* get current selected object from canvas */
				var obj = canvas.getActiveObject();
				/*set the object color with this selected color*/
				obj.set(matisse.focusInput, color);
				/* update color value of color input box in the property panel */
				$('#' + matisse.focusInput).val(color);
				/* update background color of the color input box in the property panel*/
				$('#' + matisse.focusInput).css('background', color);
				/* Notify server about this change */
				matisse.comm.sendDrawMsg({
					action: "modified",
					args: [{
						uid: obj.uid,
						object: obj
					}]
				});
				canvas.renderAll();
			});
			$('#colorpicker').hide();
			toolHandlers.initPropWindow();
		},
		/**
		 *  Updates proeperties panel with current selected object properites
		 *  @method  updatePropertyPanel
		 *  @param obj - currently selected Object
		 *
		 */
		updatePropertyPanel: function (obj) {
			/* If there is no object with this paletteName no further action*/
			if (matisse.palette[matisse.paletteName] === null) {
				return;
			}
			/* If group of objects are selected no further action*/
			if (canvas.getActiveGroup()) {
				return;
			}
			/* make sure object , name and palette values are available*/
			if (obj && obj.name && obj.palette) {
				/* get default properties and assign it to properties variable */
				var properties = util.getDefaultDataFromArray(matisse.palette[matisse.paletteName].shapes[obj.name].properties);
				/* set default property to corresponding input box in the property panel*/
				jQuery.each(properties, function (i, value) {
					$('#' + i).val(obj[i]);
				});
				if (obj.getAngle()) {
					$('#angle').val(obj.getAngle());
				}
			}
		},
		/**
		 * Creates a property panel with various properties based on object selected
		 * @method createPropertiesPanel
		 * @param obj -  currently selected Object
		 */
		createPropertiesPanel: function (obj) { /*$('#propdiv').dialog();*/
			if (obj.palette && obj && obj.name) {
				$('#prop').remove();
				var objName = obj.name;
				matisse.paletteName = obj.palette;
				if (matisse.palette[matisse.paletteName] === null) {
					return;
				}
				if (objName === undefined ) {
					return;
				}
				var _properties = util.getDefaultDataFromArray(matisse.palette[matisse.paletteName].shapes[objName].properties);
				if (_properties) {
					matisse.palette[matisse.paletteName].shapes[objName].applyProperties ? matisse.palette[matisse.paletteName].shapes[objName].applyProperties(_properties) : null;
				}
				// commenting out since quicklaunch menu handles this
				//toolHandlers.openPropertiesPanel();
			}
		}
	};
});