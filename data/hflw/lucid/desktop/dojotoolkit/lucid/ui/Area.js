dojo.provide("lucid.ui.Area");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit._Container");
dojo.require("dijit.Menu");
dojo.requireLocalization("lucid.ui", "appearance");

dojo.declare("lucid.ui.Area", [dijit._Widget, dijit._Templated, dijit._Container], {
	//	summary:
	//		the main UI area of the lucid. This is where panels, wallpaper, and most other things are drawn.
	templatePath: dojo.moduleUrl("lucid.ui.templates", "ui_Area.htm"),
	drawn: false,
	postCreate: function(){
		var l = dojo.i18n.getLocalization("lucid.ui", "appearance");
		var filearea = this.filearea = new lucid.widget.FileArea({
			path: "file://Desktop/",
			subdirs: false,
			vertical: true,
			textShadow: true,
			overflow: "hidden"
		});
		dojo.addClass(filearea.domNode, "uiArea");
		dojo.addClass(filearea.domNode, "mainFileArea");
		filearea.menu.addChild(new dijit.MenuSeparator({}));
		filearea.menu.addChild(new dijit.MenuItem({
			label: l.wallpaper,
			iconClass: "icon-16-apps-preferences-desktop-wallpaper",
			onClick: dojo.hitch(lucid.app, "launch", "AppearanceConfig")
		}));
		filearea.refresh();
		this.containerNode.appendChild(filearea.domNode);
		
		if(dojo.isIE){
			dojo.connect(this.domNode,'onresize', this,"resize");
		}
		dojo.connect(window,'onresize',this,"resize");
	},
	getBox: function(){
		//	summary:
		//		gets the ammount of space the panels are taking up on each side of the screen.
		//		Used to calculate the size of the windows when maximized.
		var thicknesses = {BR: 0, BL: 0, BC: 0, TR: 0, TL: 0, TC: 0, LT: 0, LC: 0, LB: 0, RT: 0, RC: 0, RB: 0};
		dojo.query(".desktopPanel").forEach(function(panel, i){
			var w = dijit.byNode(panel);
			if(w.span == 1){
				var slot = w.placement.charAt(0);
				if(w.orientation == "horizontal"){
					thicknesses[slot+"L"] += w.thickness;
					thicknesses[slot+"R"] += w.thickness;
					thicknesses[slot+"C"] += w.thickness;
				}
				else {
					thicknesses[slot+"T"] += w.thickness;
					thicknesses[slot+"B"] += w.thickness;
					thicknesses[slot+"C"] += w.thickness;
				}
			}
			else thicknesses[w.placement] += w.thickness;
		}, this);
		var max = {B: 0, T: 0, L: 0, R: 0};
		for(var k in thicknesses){
			if(max[k.charAt(0)] < thicknesses[k]){
				max[k.charAt(0)] = thicknesses[k];
			}
		}
		return max;
	},
	resize: function(e){
		//	summary:
		//		Does some cleanup when the window is resized. For example it moves the filearea.
		//		Also called when a panel is moved.
		var max = this.getBox();
		var viewport = dijit.getViewport();
		dojo.style(this.filearea.domNode, "top", max.T+"px");
		dojo.style(this.filearea.domNode, "left", max.L+"px");
		dojo.style(this.filearea.domNode, "width", (viewport.w - max.R - max.L)+"px");
		dojo.style(this.filearea.domNode, "height", (viewport.h - max.B - max.T)+"px");
		dojo.query("div.win", lucid.ui.containerNode).forEach(function(win){
			var c = dojo.coords(win);
			if(c.t < max.T && max.T > 0) dojo.style(win, "top", max.T+c.t+"px");
			if(c.l < max.L && max.L > 0) dojo.style(win, "left", max.L+c.l+"px");
			if(c.l > viewport.w - max.R && ((max.R > 0 || e.type=="resize") || (max.R > 0 && e.type=="resize"))) dojo.style(win, "left", (viewport.w - 20  - max.R)+"px");
			if(c.t > viewport.h - max.B && ((max.B > 0 || e.type=="resize") || (max.B > 0 && e.type=="resize"))) dojo.style(win, "top", (viewport.h - 20 - max.B)+"px");
			var wid = dijit.byNode(win);
			if(wid.maximized) wid.resize();
			
		}, this);
	},
	updateWallpaper: function(){
		//	summary:
		//		Updates the wallpaper based on what's in lucid.config. Called when the configuration is applied.
		var image = lucid.config.wallpaper.image;
		var color = lucid.config.wallpaper.color;
		var style = lucid.config.wallpaper.style;
		dojo.style(this.wallpaperNode, "backgroundColor", color);
		if(image == ""){
			if(this.wallpaperImageNode){
				 this.wallpaperImageNode.parentNode.removeChild(this.wallpaperImageNode);
				 this.wallpaperImageNode = false;
			}
			dojo.style(this.wallpaperNode, "backgroundImage", "none");
			return;
		}
		else if(style == "centered" || style == "tiled")
			dojo.style(this.wallpaperNode, "backgroundImage", "url('"+image+"')");
			if(this.wallpaperImageNode){
				 this.wallpaperImageNode.parentNode.removeChild(this.wallpaperImageNode);
				 this.wallpaperImageNode = false;
			}
		if(style == "centered")
			dojo.style(this.wallpaperNode, "backgroundRepeat", "no-repeat");
		else if(style == "tiled")
			dojo.style(this.wallpaperNode, "backgroundRepeat", "repeat");
		else if(style == "fillscreen"){
			dojo.style(this.wallpaperNode, "backgroundImage", "none");
			if(!this.wallpaperImageNode){
				this.wallpaperImageNode = document.createElement("img");
				dojo.style(this.wallpaperImageNode, "width", "100%");
				dojo.style(this.wallpaperImageNode, "height", "100%");
				this.wallpaperNode.appendChild(this.wallpaperImageNode);
			}
			this.wallpaperImageNode.src = image;
		}
		var rule;
		try {
			try {
				rule = document.styleSheets[0].cssRules[0].style;
			}
			catch(e){
				rule = document.styleSheets[0].rules[0].style;
			}
			rule.backgroundColor = lucid.config.wallpaper.color;
		}
		catch(e){
			//oh well...
		}
	}
});
