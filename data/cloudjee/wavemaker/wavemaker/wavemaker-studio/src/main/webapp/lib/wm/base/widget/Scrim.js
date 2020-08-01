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

dojo.provide("wm.base.widget.Scrim");

dojo.declare("wm.Scrim", wm.Widget, {
        _noAnimation: false,
	showing: false,
	waitCursor: true,
	init: function() {
	    if (this.owner && this.owner.isDesignedComponent())
		studio.designer.domNode.appendChild(this.domNode);
	    else
		document.body.appendChild(this.domNode);
	    this.inherited(arguments);
		dojo.addClass(this.domNode, "wmscrim");
		// remember, zIndex must be set in style to avoid layout.
		this.domNode.style.zIndex = 20;
		this.domNode.style.position = "absolute";
		if (this.waitCursor)
			this.domNode.style.cursor = "wait";
	    this.subscribe("window-resize", this, "resize");
	},
    resize: function() {
	wm.onidle(this, function() {
	    if (this.showing)
		this.reflowParent();
	});
    },
	reflowParent: function() {
		//if (this.domNode.parentNode)
        if (this.domNode.parentNode)
    		dojo.marginBox(this.domNode, dojo.contentBox(this.domNode.parentNode));
	},
	scrimify: function(/*inFunc*/) {
		var f = dojo.hitch.apply(dojo, arguments);
		this.setShowing(true);
		try{
			f();
			//inFunc();
		}finally{
			this.setShowing(false);
		}
	},
	scrimOnIdle: function(/*inFunc*/) {
		this.setShowing(true);
		var self = this, args = arguments;
		setTimeout(function() {
			self.scrimify.apply(self, args)
		}, 100);
	},

	setShowing: function(inShowing) {
            if (this._cupdating || this._noAnimation)
                return this.inherited(arguments);
	    var animationTime = (this._cupdating || this.showing == inShowing) ? 0 : app.dialogAnimationTime;
	    if (inShowing) {
		if (animationTime) {
		    if (this._hideAnimation) {
			this._hideAnimation.stop();
		    }
		    this._showAnimation = this._showAnimation ||
			dojo.animateProperty({node: this.domNode,
					      properties: {opacity: 0.35},
					      duration: animationTime});
		    if (this._showAnimation.status() != "playing") {
			this.domNode.style.opacity = 0.01;
			this.inherited(arguments);
			this._showAnimation.play();
		    }
		} else {
		    this.inherited(arguments);
		}

	    } else {
		if (animationTime) {
		    if (this._showAnimation)
			this._showAnimation.stop();
		    this._hideAnimation =
			this._hideAnimation ||
			dojo.animateProperty({node: this.domNode,
					      properties: {opacity: 0.01},
					      duration: animationTime,
					      onEnd: dojo.hitch(this, function() {
                                                  if (!this.domNode)
                                                      return;
						  wm.Control.prototype.setShowing.call(this,false);
					      })});
		    if (this._hideAnimation.status() != "playing") {
			this._hideAnimation.play();
		    }
		} else {
		    this.inherited(arguments);
		}
	    }
	},

//	setShowing: function(inShowing) {
//		this.inherited(arguments);
		// FIXME: Try to get scrim behavior in IE.... (not currently working)
		/*if (dojo.isIE) {
			setTimeout(dojo.hitch(this, function() {
				if (this.waitCursor)
					document.body.style.cursor = inShowing ? "wait" : "";
				document.body[inShowing ? "setCapture" : "releaseCapture"](true);
			}), 0);
		}*/
//	},
	scrimifyDeferred: function(inDeferred) {
		this.setShowing(true);
		inDeferred.addCallback(dojo.hitch(this, this.setShowing, false));
	}
});
