dojo.provide("lucid.ui.applets.Menu");
dojo.require("dijit.Menu");
dojo.requireLocalization("lucid.ui", "menus");
dojo.requireLocalization("lucid", "places");
dojo.requireLocalization("lucid", "apps");
dojo.declare("lucid.ui.applets.Menu", lucid.ui.Applet, {
	//	summary:
	//		A simple menu applet
	dispName: "Main Menu",
	_prefsMenu: [],
	_adminMenu: [],
	postCreate: function(){
		this._prefsMenu = [];
		this._adminMenu = [];
		this._getApps();
		//this._interval = setInterval(dojo.hitch(this, this._getApps), 1000*60);
		dojo.addClass(this.containerNode, "menuApplet");
		dojo.subscribe("updateMenu", dojo.hitch(this, "_getApps"));
		this.inherited("postCreate", arguments);
	},
	uninitialize: function(){
		//clearInterval(this._interval);
		if(this._menubutton) this._menubutton.destroy();
		if(this._menu) this._menu.destroy();
		this.inherited("uninitialize", arguments);
	},
	_makePlacesMenu: function(){
		//	summary:
		//		Makes the places menu
		var l = dojo.i18n.getLocalization("lucid", "places");
		var m = new dijit.Menu();
		dojo.forEach(lucid.config.filesystem.places, function(place){
			var item = new dijit.MenuItem({
				label: l[place.name] || place.name,
				iconClass: place.icon || "icon-16-places-folder",
				onClick: function(){ lucid.app.launchHandler(place.path, {}, "text/directory"); }
			});
			m.addChild(item);
		}, this);
		return m;
	},
	_makeSystemMenu: function(items){
		//	summary:
		//		Creates a preferences menu and returns it
		var l = dojo.i18n.getLocalization("lucid.ui", "menus");
		var sMenu = new dijit.Menu({});

		var pMenu = new dijit.Menu();
		dojo.forEach(this._prefsMenu, function(item){
			pMenu.addChild(item);
		}, this);
		sMenu.addChild(new dijit.PopupMenuItem({
			popup: pMenu,
			label: l.preferences,
			iconClass: "icon-16-categories-preferences-desktop"
		}));
		
		var aMenu = new dijit.Menu();
		dojo.forEach(this._adminMenu, function(item){
			aMenu.addChild(item);
		}, this);
		sMenu.addChild(new dijit.PopupMenuItem({
			popup: aMenu,
			label: l.administration,
			iconClass: "icon-16-categories-applications-system"
		}));
		sMenu.addChild(new dijit.MenuSeparator())
		sMenu.addChild(new dijit.MenuItem({
            label: l.about,
            iconClass: "icon-16-apps-help-browser",
            onClick: function(){
                var win = new lucid.widget.Window({
                    title: l.about,
                    width: "300px",
                    height: "300px"
                });
                win.addChild(new lucid.ui.Credits({
                    region: "center"
                }));
                win.show();
            }
        }))
        sMenu.startup();
		return sMenu;
	},
	_drawButton: function(){
		//	summary:
		//		Creates a drop down button for the applet.
		var l = dojo.i18n.getLocalization("lucid.ui", "menus");
		dojo.require("dijit.form.Button");
		if (this._menubutton){
			this._menubutton.destroy();
		}
		this._menu.addChild(new dijit.MenuSeparator());
		this._menu.addChild(new dijit.PopupMenuItem({
			label: l.places,
			iconClass: "icon-16-places-folder",
			popup: this._makePlacesMenu()
		}))
		this._menu.addChild(new dijit.PopupMenuItem({
			label: l.system,
			iconClass: "icon-16-categories-preferences-system",
			popup: this._makeSystemMenu()
		}))
		this._menu.addChild(new dijit.MenuSeparator());
		this._menu.addChild(new dijit.MenuItem({
			label: l.logOut, 
			iconClass: "icon-16-actions-system-log-out",
			onClick: lucid.user.logout
		}));
		var div = document.createElement("div");
		this.containerNode.appendChild(div);
		var b = new dijit.form.DropDownButton({
			iconClass: "icon-16-places-start-here",
			label: l.applications,
			showLabel: false,
			dropDown: this._menu
		}, div);
		dojo.addClass(b.domNode, "menuApplet");
		dojo.style(b.focusNode, "border", "0px");
		b.domNode.style.height="100%";
		b.startup();
		this._menubutton = b;
	},
	_getApps: function(){
		//	summary:
		//		Gets the app list from the server and makes a menu for them
		var l = dojo.i18n.getLocalization("lucid.ui", "menus");
		var ap = dojo.i18n.getLocalization("lucid", "apps");

		var data = lucid.app.appList;
		if (this._menu){
			this._menu.destroy();
		}
		var menu = this._menu = new dijit.Menu({});
		var cats = {};
		for(var item in data)
		{
			cats[data[item].category] = true;
		}
		var list = [];
		for(var cat in cats)
		{
			list.push(cat);
		}
		list.sort();
		for(var cat in list)
		{
			var cat = list[cat];
			//cat.meow();
			if(!(cat == "Preferences" || cat == "Administration")){
				var category = new dijit.PopupMenuItem({
					iconClass: "icon-16-categories-applications-"+cat.toLowerCase(),
					label: l[cat.toLowerCase()] || cat
				});
				var catMenu = new dijit.Menu({parentMenu: category});
			}
			for(var app in data)
			{
				if(data[app].category == cat)
				{
					var item = new dijit.MenuItem({
						label: ap[data[app].name] || data[app].name,
						iconClass: data[app].icon ? (data[app].icon.indexOf(".") === -1 ? data[app].icon : "icon-app-"+data[app].sysname) : null
					});
					dojo.connect(item, "onClick", dojo.hitch(lucid.app, "launch", data[app].sysname));
					if(cat == "Preferences"){
						this._prefsMenu.push(item);
					}
					else if(cat=="Administration"){
						this._adminMenu.push(item);
					}
					else catMenu.addChild(item);
				}
			}
			catMenu.startup();
			category.popup = catMenu;
			if(!(cat == "Preferences" || cat == "Administration"))
				menu.addChild(category);
		}
		menu.startup();
		this._drawButton();
	}
});
