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

dojo.provide("wm.base.widget.Layers.AccordionDecorator");
dojo.require("wm.base.widget.Layers.Decorator");

dojo.declare("wm.AccordionDecorator", wm.LayersDecorator, {
	decorationClass: "wmaccordion",
        captionBorder: 0,
        captionBorderColor: "",
	decorateLayer: function(inLayer, inIndex) {
		this.inherited(arguments);
		this.createHeader(inLayer, inIndex);
	},
    createHeader: function(inLayer, inIndex) {
        var captionHeight = inLayer.parent.captionHeight;
        var p = this.decoree.client;
        var h = inLayer.header = new wm.Label({
            noSizeNode: true,
            caption: inLayer.caption,
            width: "100%",
            margin: "0,0,2,0",
            height: captionHeight + "px",
            padding: "0,4,0,4",
            _classes: {
                domNode: ["wmaccordion-header"]
            },
            showing: inLayer.showing,
            parent: p,
            owner: p,
            border: this.decoree.captionBorder !== undefined ? this.decoree.captionBorder : this.captionBorder,
            borderColor: this.decoree.captionBorderColor !== undefined ? this.decoree.captionBorderColor : this.captionBorderColor,
            onclick: dojo.hitch(this, "headerClicked", inLayer)
        });

        p.moveControl(h, inIndex * 2);
        dojo.addClass(inLayer.domNode, "wmaccordion-content");
        //this.decoree.connect(h.domNode, 'onclick', dojo.hitch(this, "headerClicked", inLayer));
    },

	headerClicked: function(inLayer, e) {
		var d = this.decoree;
		// prevent designer click
		if (d.isDesignLoaded())
			dojo.stopEvent(e);
	    d.setProp(inLayer.active && (d.multiActive || d._allowClickClose) ? "layerInactive" : "layer", inLayer);
	    inLayer.focusFirstEditor();
	},
	getNewLayerIndex: function(inLayer) {
		for (var i=0, layers=this.decoree.layers, l; (l=layers[i]); i++)
			if (l != inLayer && l.active)
				return i;
	},
	deactivateLayer: function(inLayer) {
	    if (inLayer.header) {
            var m = inLayer.header.marginExtents;
            var closedMargin = m.t + "," + m.r + ",2," + m.l;
            inLayer.header.setMargin(closedMargin);
        }
		var newIndex = this.getNewLayerIndex(inLayer);
		if (newIndex != undefined || inLayer.parent.multiActive || inLayer.parent._allowClickClose) {
			this.setLayerActive(inLayer, false);
			var d = this.decoree;
			d.layerIndex = newIndex;
			d.reflow();
		}
	},
	activateLayer: function(inLayer) {
	    if (inLayer.header) {
            var m = inLayer.header.marginExtents;
            var opennedMargin = m.t + "," + m.r + ",0," + m.l;
            inLayer.header.setMargin(opennedMargin);
        }
		var d = this.decoree;
		if (d.multiActive && !d._loading) {
			this.setLayerActive(inLayer, true);
			d.reflow();
		} else
			this.inherited(arguments);
	},

	undecorateLayer: function(inLayer, inIndex) {
		inLayer.header.destroy();
		dojo.removeClass(inLayer.domNode, 'wmaccordion-content');
	},
	setLayerShowing: function(inLayer, inShowing) {
		inLayer.header.setShowing(inShowing);
		this.inherited(arguments);
		inLayer.domNode.style.display = inLayer.active && inLayer.showing ? '' : 'none';
	},
	setLayerActive: function(inLayer, inShowing) {
		dojo[inShowing ? 'removeClass' : 'addClass'](inLayer.header.domNode, 'wmaccordion-collapsed');
		this.inherited(arguments);
	},
	applyLayerCaption: function(inLayer) {
        if (this.decoree.arrowsOnLeft) {
           inLayer.header.setCaption("<span class='accordionArrowNode accordionOnLeftArrowNode'></span>" + inLayer.caption );
        } else {
	       inLayer.header.setCaption(inLayer.caption + "<span class='accordionArrowNode'></span>");
       }
	},
	moveLayerIndex: function(inFromIndex, inToIndex) {
		var d = this.decoree, client = d.client, l = d.getLayer(inFromIndex);
		client.removeControl(l);
		client.removeControl(l.header);
		client.insertControl(l.header, inFromIndex*2);
		client.insertControl(l, inFromIndex*2 + 1);
	}
});
