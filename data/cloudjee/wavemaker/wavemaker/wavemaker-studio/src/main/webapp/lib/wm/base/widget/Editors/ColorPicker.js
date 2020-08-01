/*
 *  Copyright (C) 2012-2013 CloudJee, Inc. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
dojo.provide("wm.base.widget.Editors.ColorPicker");
dojo.require("wm.base.widget.Editors.Text");
dojo.require("dijit.form.ValidationTextBox");
dojo.require("dijit._HasDropDown");
dojo.require("dojox.color");

dojo.declare("wm.ColorPicker", wm.Text, {
	classNames: "wmeditor wmcolorpicker",
    changeOnKey: true,
    className: "wmeditor wmcolorpickereditor",
    _editorBackgroundColor: true,
    defaultColor: "",
    cancelValue: null,
    _empty: true,
    regExp: "\\s*(\#[0-9a-fA-F]{6}|\{.*\}|\#[0-9a-fA-F]{3}|transparent|aqua|black|blue|fuchsia|gray|green|lime|maroon|navy|olive|purple|red|silver|teal|white|yellow|rgb\\(\\s*\\d+\\s*,\\s*\\d+\\s*,\\s*\\d+\\s*\\)|rgba\\(\\s*\\d+\\s*,\\s*\\d+\\s*,\\s*\\d+\\s*,\\s*\\d*\\.?\\d*\\s*\\))\\s*",
    regExpOptions: "i",
    // could use a more precise regex for gradients
    showMessages: false,
    // seems to mess up our color picker dialog when both are showing
    gradient: false,
    _createEditor: function(inNode, inProps) {
        return new wm.dijit.form.ColorPicker(this.getEditorProps(inNode, inProps));
    },
    setInitialValue: function() {
        this.inherited(arguments);
        this.updateEditorColors(this.dataValue);
    },
    getDataValue: function() {
        if (!this.gradient) {
            //if (this.getInvalid()) return this.defaultColor;
            return this.inherited(arguments) || this.defaultColor;
        } else {
            return this.inherited(arguments);
        }
    },
    getEditorValue: function() {
        var result = this.inherited(arguments);
        if (this.gradient && result) {
            result = (dojo.fromJson(result));
        }
        return result;
    },
    setEditorValue: function(inValue) {
        if (this.gradient && inValue && typeof inValue === "object") {
        	inValue = dojo.toJson(inValue);
        } else if (!this.gradient) {
	        inValue = String(inValue||"").toLowerCase();
        }
        this.inherited(arguments);
    },
    calcIsDirty: function(val1, val2) {
        if (typeof val1 == "object" && typeof val2 == "object") return dojo.toJson(val1) != dojo.toJson(val2);
        return this.inherited(arguments);
    },     
    /*    doChangeOnKey: function(inEvent) {
    this.changed();
    if (this.editor)
        this.editor.onChange(this.dataValue);
    },*/
    onClose: function() {},
    doChangeOnKey: function(inEvent) {
        this.inherited(arguments);
        this.editor.dropDown.reset();
    },

    changed: function() {
    	if (!this.gradient) {
	    	var newValue = this.editor.get('value') || "";
            if (newValue.match(/[A-Z]/)) {
            	this.editor.set('value', newValue.toLowerCase(), false);
			}
    	}    	
    	this.inherited(arguments);        
    },
    editorChanged: function() {        
    	if (this.inherited(arguments)) {
    	   this.updateEditorColors(this.dataValue);
    	   return true;
    	}
    	return false;
    },
    updateEditorColors: function(inValue) {
        if (!this.gradient || this.gradient && inValue && inValue.endColor) {
            if (this.gradient) inValue = inValue.endColor;
            if (inValue) {
            	var v1,v2,v3;
                this.editorNode.style.backgroundColor = inValue;
                inValue = this.editorNode.style.backgroundColor; // find the value ACTUALLY found by the browser
                if (inValue.match(/^\#/)) {
                	;
                } else if (inValue) {
                	var matches = inValue.match(/rgb\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)\)/);
                	if (matches) {
                		inValue = "#" + Number(matches[1]).toString(16) + Number(matches[2]).toString(16) + Number(matches[3]).toString(16);
                	} else {
                		var colorObj = dojox.color.fromString(inValue);
                		if (colorObj) {
                			inValue = colorObj.toHex();
                		}
                	}
                }
                if (inValue === "") {
                    v1 = v2 = v3 = 255;
                } else if (inValue.length > 5) {
                    v1 = parseInt(inValue.substr(1, 2), 16);
                    v2 = parseInt(inValue.substr(3, 2), 16);
                    v3 = parseInt(inValue.substr(5, 2), 16);
                } else {
                    v1 = parseInt(inValue.substr(1, 1) || 0, 16);
                    v2 = parseInt(inValue.substr(2, 1) || 0, 16);
                    v3 = parseInt(inValue.substr(3, 1) || 0, 16);
                }

                this.editor.focusNode.style.color = (v1 < 130 && v2 < 130 && v3 < 130 || v1 + v2 < 180 || v1 + v3 < 180 || v2 + v3 < 180) || (v1 + v2 + v3 < 250) ? "white" : "black";
            } else {
                this.editorNode.style.backgroundColor = "";
                this.editor.focusNode.style.color = "";
            }
        } else {
            if (typeof inValue == "string" && inValue.length) {
                inValue = dojo.fromJson(inValue);
            }

            var style = inValue ? wm.getBackgroundStyle(inValue.startColor, inValue.endColor, inValue.colorStop, inValue.direction, "") : "";
            if (dojo.isIE < 10) {
                this.editorNode.style.filter = style;
            } else {
                this.editorNode.style.background = style;
            }
        }
      
    }

});

dojo.declare(
    "wm.dijit.form.ColorPicker",
    [dijit.form.ValidationTextBox, dijit._HasDropDown],
    {
	baseClass: "dijitTextBox dijitComboBox",
	popupClass: "wm.ListSet",
	forceWidth: false, // Force the popup to use its own width and not match the editor width
	autoWidth: false,// Force the popup to use its own width and not match the editor width
	value: "",
	noFilter: false,
	templateString: dojo.cache("dijit.form", "templates/DropDownBox.html"),

	// hasDownArrow: [const] Boolean
	//		Set this textbox to display a down arrow button, to open the drop down list.
	hasDownArrow: true,

	// openOnClick: [const] Boolean
	//		Set to true to open drop down upon clicking anywhere on the textbox.
	openOnClick: true,
	buildRendering: function(){
	    this.inherited(arguments);
	    this._buttonNode = this.domNode;
	},
	createDropDown: function() {
	    if ( this.owner.gradient) {
		this.dropDown =
		    new wm.GradientPickerPanel({owner: this.owner,
						dataValue:this.dataValue || {direction: "vertical",
							      startColor: "#0101b7",
							      endColor: "#011d65",
									     colorStop: "50"},
					     destroyRecursive: function() {if (!this.isDestroyed) this.destroy();} // this === this.dropDown
					    })
	    } else {
		this.dropDown =
		    new wm.ColorPickerPanel({owner: this.owner,
					     destroyRecursive: function() {if (!this.isDestroyed) this.destroy();} // this === this.dropDown
					    });
	    }
	    if (wm.isMobile) {
		this.dropDown.dialogScrim.connect(this.dropDown.dialogScrim.domNode, wm.isFakeMobile ? "onclick" : "ontouchstart", this.dropDown, "hide");
	    }
            this.dropDown.connect(this.dropDown, "onChange", this, function(inValue) {
		if (this.dropDown.showing) {
		    if (!this.owner.gradient) {
			this.set("value", inValue);
		    } else {
			this.set("value", dojo.toJson(inValue));
		    }
		}
		this.onChange(inValue);
            });
	},
	openDropDown: function(/*Function*/ callback){
	    if (!this.dropDown) {
		this.createDropDown();
	    }
	    if (this.owner.dataValue) {
		this.dropDown.reset();
	    }
	    this.dropDown.setShowing(true);
	    return dijit._HasDropDown.prototype.openDropDown.call(this, callback);
	},
	closeDropDown: function() {
	    var wasOpen = this._opened;
	    this.inherited(arguments);
	    if (wasOpen) {
		/* Make sure it doesn't immediately reopen */
		wm.onidle(this, function() {
		    if (!this._opened) {
			this.owner.onClose();
		    }
		});
	    }
	},
	destroy: function() {
	   if (this.dropDown) {
	       this.dropDown.destroy();
	       delete this.dropDown;
	   }
	   this.inherited(arguments);
	}
});


dojo.declare("wm.ColorPickerPanel", wm.Container, {

    colorPicker: null,
    colorPickerSet: false,
    border: "0",
    borderColor: "#888888",
    width: "325px",
    height: "185px",
    modal: false,
    colorPickerControl: null,
    init: function() {
	this.inherited(arguments);
        dojo.require("dojox.widget.ColorPicker");
    },
    destroy: function() {
        if (this.colorPicker) this.colorPicker.destroy();
        this.inherited(arguments);
    },
    postInit: function() {
	this.inherited(arguments);

        if (!wm.ColorPickerPanel.cssLoaded) {
            var link = document.createElement("link");
            link.rel = "stylesheet";
            link.type = "text/css";
            link.href = dojo.moduleUrl("dojox.widget.ColorPicker").uri + "ColorPicker.css";
            document.getElementsByTagName("head")[0].appendChild(link);
            wm.ColorPickerPanel.cssLoaded = true;
        }
        this.colorPickerControl = new wm.Control({name: "colorPickerControl", width: "325px", height: "170px", owner: this, parent: this});
        this.colorPicker = new dojox.widget.ColorPicker({animatePoint: true,
							 showHsv: false,
							 showRtb: true,
							 webSave: false,
							 onChange: dojo.hitch(this, "valueChange")},
							this.colorPickerControl.domNode);
	wm.onidle(this, function() {
	    this.colorPicker.startup();
	    this.connect(dojo.query(".OKButton", this.domNode)[0], "onclick", this, "onOKClick");
	    this.connect(dojo.query(".CancelButton", this.domNode)[0], "onclick", this, "onCancelClick");
	});

            /* Hack because the colorpicker is beta and has problems getting these values correctly.  As the picker always appears in exactly the same place
             * in our dialog, we can always have these values be the same
             */
	    this.colorPicker.PICKER_SAT_VAL_H = 152;
	    this.colorPicker.PICKER_SAT_VAL_W = 152;
	    this.colorPicker.PICKER_HUE_H = 150;

/*
        this.textPanel = new wm.Panel({name: "buttonPanel", width: "100%", height: "26px", layoutKind: "left-to-right", owner: this, parent: this, horizontalAlign: "center"});

        this.BrightenButton = new wm.Button({caption: "Bright",//studio.getDictionaryItem("wm.ColorPickerPanel.BRIGHTEN"),
					     width: "75px", height: "100%", parent: this.textPanel, owner: this});
        this.DarkenButton = new wm.Button({caption: "Dark",//studio.getDictionaryItem("wm.ColorPickerPanel.DARKEN"),
					   width: "75px", height: "100%", parent: this.textPanel, owner: this});

	this.text = new wm.Text({
	    owner: this,
	    parent: this.textPanel,
	    name: "text",
	    width: "100%",
	    resetButton: true,
	    placeHolder: "Enter Color",
	    changeOnKey: true,
	    onchange: dojo.hitch(this, "textChange"),
	    onEnterKeyPress: dojo.hitch(this, "onOK")
	});



        this.buttonPanel = new wm.Panel({_classes: {domNode: ["dialogfooter"]}, name: "buttonPanel", width: "100%", height: "100%", layoutKind: "left-to-right", owner: this, parent: this, horizontalAlign: "right"});

        this.CancelButton = new wm.Button({caption: "Cancel",//studio.getDictionaryItem("wm.ColorPickerDialog.CANCEL"),
					   width: "75px", height: "30px", parent: this.buttonPanel, owner: this});
        this.OKButton = new wm.Button({caption: "OK",//studio.getDictionaryItem("wm.ColorPickerDialog.OK"),
				       width: "75px", height: "30px", parent: this.buttonPanel, owner: this});

        this.connect(this.BrightenButton, "onclick", this, "brighten");
        this.connect(this.DarkenButton, "onclick", this, "darken");
        this.connect(this.OKButton, "onclick", this, "onOK");
        this.connect(this.CancelButton, "onclick", this, "onCancel");
        this.domNode.style.backgroundColor = "white";
	*/

    },

    onCancelClick: function() {
	this.owner.setDataValue(this._initialValue);
	this.owner.editor.closeDropDown();
    },
    onOKClick: function() {
	this.owner.editor.closeDropDown();
    },

    reset: function() {
    	if (this.getValue() != this.owner.getDataValue()) {
    	    this.setDijitValue(this.owner.isValid() ? this.owner.getDataValue() : "#FFFFFF");
    	}
    	this._initialValue = this.getValue();
    	this.owner.updateEditorColors();
    },
    getValue: function() {
        if (this.colorPicker) {
            return this.colorPicker.getValue();
        } else {
            return this._tmpValue;
        }
    },
    setDijitValue: function(inValue) {
        if (this.colorPicker) {
	    if (inValue) {
		this.colorPicker.setColor(inValue);
	    }
        } else {
            this._tmpValue = inValue;
        }
	if (this.text && inValue != this.text.getDataValue()) {
	    this.text.setDataValue(inValue);
	}

    },

    valueChange: function(inValue) {
        this._changed = true;
	//this.text.setDataValue(inValue);
        this.onChange(inValue);
    },
    onExecute: function() {}, // if this doesn't exist, _HasDropDown dismisses dialog onChange
/*
    textChange: function(inDisplayValue, inDataValue) {
	this._changed = true;
	this.setDijitValue(inDisplayValue);
        this.onChange(inDisplayValue);
    },
    */
    onChange: function(inValue) {

    },
	/*
    brighten: function() {
        var value = this.colorPicker.attr("value");
        var values = [parseInt(value.substr(1,2),16),
                      parseInt(value.substr(3,2),16),
                      parseInt(value.substr(5,2),16)];
        var result = "#";
        var zeroCount = 0;
        var maxCount = 0;
        for (var i = 0; i < 3; i++) {
            if (values[i] == 0) zeroCount++;
            else if (values[i] == 255) maxCount++;
        }

        var minValue = 0;
        if (maxCount + zeroCount == 3)
            minValue = 40;
        for (var i = 0; i < 3; i++) {
            values[i] = Math.max(minValue,Math.min(255,Math.floor(values[i] * 1.2)));
            var str = values[i].toString(16);
            if (str.length < 2) str = "0" + str;
            result += str;
        }



        this.setDijitValue(result);
        this.onChange(result);
    },
    darken: function() {
        var value = this.colorPicker.attr("value");
        var values = [parseInt(value.substr(1,2),16),
                      parseInt(value.substr(3,2),16),
                      parseInt(value.substr(5,2),16)];
        var result = "#";
        for (var i = 0; i < 3; i++) {
            values[i] = Math.floor(values[i] * 0.8);
            var str = values[i].toString(16);
            if (str.length < 2) str = "0" + str;
            result += str;
        }
        this.setDijitValue(result);
        this.onChange(result);
    },
    */
    destroy: function() {
        if (this.colorPicker) // doesn't exist if the dialog never shown
            this.colorPicker.destroyRecursive();
        this.inherited(arguments);
    }


});


dojo.declare("wm.GradientPickerPanel", wm.Container, {
    border: "0",
    borderColor: "#888888",
    width: "500px",
    height: "200px",
    backgroundColor: "white",
    layoutKind: "top-to-bottom",
    verticalAlign: "top",
    horizontalAlign: "left",
    postInit: function() {
	this.inherited(arguments);
	var topPanel = new wm.Panel({owner: this, parent: this, verticalAlign: "top", horizontalAlign: "left", width: "100%", height: "30px", layoutKind: "left-to-right"});
	this.startColor = new wm.ColorPicker({name: "startColor", owner: this, parent: topPanel, width: "100%", dataValue: this.dataValue.startColor});
	this.endColor = new wm.ColorPicker({name: "endColor", owner: this, parent: topPanel, width: "100%", dataValue: this.dataValue.endColor});
	this.direction = new wm.SelectMenu({name: "direction", owner: this, parent: topPanel, width: "100%", options: "vertical, horizontal", dataValue: this.dataValue.direction});
	this.bottomPanel = new wm.Panel({owner: this, parent: this, verticalAlign: "top", horizontalAlign: "left", width: "100%", height: "100%", layoutKind: "left-to-right"});
	this.colorStop = new wm.Slider({name: "colorStop", owner: this, parent: this.bottomPanel, width: "30px", height: "100%", captionPosition: "left", caption: "", verticalSlider: true, dataValue: this.dataValue.direction == "horizontal" ? this.dataValue.colorStop : 100 - this.dataValue.colorStop});
	this.connect(this.startColor, "onchange", this, "_onChange");
	this.connect(this.endColor, "onchange", this, "_onChange");
	this.connect(this.direction, "onchange", this, "_onDirectionChange");
	this.connect(this.colorStop, "onchange", this, "_onChange");
	this.html = new wm.Html({name: "html", owner: this, parent: this.bottomPanel, width: "100%", height: "100%", border: "1", borderColor: "black"});
	this.buttonPanel = new wm.Panel({_classes: {domNode: ["dialogfooter"]}, owner: this, parent: this, verticalAlign: "top", horizontalAlign: "right", width: "100%", height: "30px", layoutKind: "left-to-right"});
	this.okButton = new wm.Button({_classes: {domNode: ["StudioButton", "OKButton"]},owner: this, parent: this.buttonPanel, caption: "OK", width: "80px", onclick: dojo.hitch(this, "onOKClick")});
	this.cancelButton = new wm.Button({_classes: {domNode: ["StudioButton", "CancelButton"]}, owner: this, parent: this.buttonPanel, caption: "Cancel", width: "80px", onclick: dojo.hitch(this, "onCancelClick")});
	wm.onidle(this, function( ){
	    this.reflow();
	    this._cupdating = true;
	    this._onChange();
	    this._cupdating = false;
	});
    },
    onOKClick: function() {
	this.owner.editor.closeDropDown();
    },
    onCancelClick: function() {
	this.owner.setEditorValue(this._initialValue);
	this.owner.editor.closeDropDown();
    },
    reset: function() {
    	this._cupdating = true;
    	this.startColor.setDataValue(this.owner.dataValue ? this.owner.dataValue.startColor : "");
    	this.endColor.setDataValue(this.owner.dataValue ? this.owner.dataValue.endColor : "");
    	this.direction.setDataValue(this.owner.dataValue ? this.owner.dataValue.direction : "");
    	this.colorStop.setDataValue(this.owner.dataValue ? (this.direction.getDataValue() == "vertical" ? 100 - this.owner.dataValue.colorStop : this.owner.dataValue.colorStop) : "");
    	this._initialValue = dojo.clone(this.owner.dataValue);
    	this._cupdating = false;
        this.updateColorDisplay();
    },
    onExecute: function() {}, // if this doesn't exist, _HasDropDown dismisses dialog onChange
/*
    textChange: function(inDisplayValue, inDataValue) {
	this._changed = true;
	this.setDijitValue(inDisplayValue);
        this.onChange(inDisplayValue);
    },
    */
    _onDirectionChange: function() {
	var direction = this.direction.getDataValue();
	if (direction == "vertical") {
	    if (this.bottomPanel.layoutKind == "top-to-bottom") {
		this.bottomPanel.setLayoutKind("left-to-right");
		this.colorStop.setVerticalSlider(true);
		this.colorStop.setHeight("100%");
		this.colorStop.setWidth("30px");
		this.colorStop.setDataValue(90);
	    }
	} else {
	    if (this.bottomPanel.layoutKind == "left-to-right") {
		this.bottomPanel.setLayoutKind("top-to-bottom");
		this.colorStop.setVerticalSlider(false);
		this.colorStop.setWidth("100%");
		this.colorStop.setHeight("30px");
		this.colorStop.setDataValue(10);
	    }
	}
	this._onChange();
    },
    updateColorDisplay: function() {    
        var v = this.getDataValue();
    	var result = wm.getBackgroundStyle(v.startColor,v.endColor,v.colorStop,v.direction, "");
    	if (dojo.isIE < 10) {
    	    this.html.domNode.style.filter = result;
    	} else {
    	    this.html.domNode.style.background = result;
    	}

    
    },
    getDataValue: function() {

    	var direction = this.direction.getDataValue();
    	var colorStop = direction == "vertical" ? 100 - this.colorStop.getDataValue() : this.colorStop.getDataValue();
    	var startColor = this.startColor.getDataValue();
    	var endColor = this.endColor.getDataValue();
    	var dataValue = {direction: direction,
            		       startColor: startColor,
            		       endColor: endColor,
            		       colorStop:colorStop};
        return dataValue;            		    
    },
    _onChange: function() {
        var v = this.getDataValue();
        this.updateColorDisplay();
    	if (!this._cupdating) {
        	this.owner.setEditorValue(v);
    	}
    },
	/*
    brighten: function() {
        var value = this.colorPicker.attr("value");
        var values = [parseInt(value.substr(1,2),16),
                      parseInt(value.substr(3,2),16),
                      parseInt(value.substr(5,2),16)];
        var result = "#";
        var zeroCount = 0;
        var maxCount = 0;
        for (var i = 0; i < 3; i++) {
            if (values[i] == 0) zeroCount++;
            else if (values[i] == 255) maxCount++;
        }

        var minValue = 0;
        if (maxCount + zeroCount == 3)
            minValue = 40;
        for (var i = 0; i < 3; i++) {
            values[i] = Math.max(minValue,Math.min(255,Math.floor(values[i] * 1.2)));
            var str = values[i].toString(16);
            if (str.length < 2) str = "0" + str;
            result += str;
        }



        this.setDijitValue(result);
        this.onChange(result);
    },
    darken: function() {
        var value = this.colorPicker.attr("value");
        var values = [parseInt(value.substr(1,2),16),
                      parseInt(value.substr(3,2),16),
                      parseInt(value.substr(5,2),16)];
        var result = "#";
        for (var i = 0; i < 3; i++) {
            values[i] = Math.floor(values[i] * 0.8);
            var str = values[i].toString(16);
            if (str.length < 2) str = "0" + str;
            result += str;
        }
        this.setDijitValue(result);
        this.onChange(result);
    },
    */
    destroy: function() {
        if (this.colorPicker) // doesn't exist if the dialog never shown
            this.colorPicker.destroyRecursive();
        this.inherited(arguments);
    }


});

