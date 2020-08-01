dojo.provide("lucid.apps.AdminPanel.apps");

dojo.extend(lucid.apps.AdminPanel, {
	apps: function(){
		var sys = dojo.i18n.getLocalization("lucid", "system");
		var cmn = dojo.i18n.getLocalization("lucid", "common");
		var apps = dojo.i18n.getLocalization("lucid", "apps");
		var mnus = dojo.i18n.getLocalization("lucid.ui", "menus");
		this.toolbar.destroyDescendants();
		var button = new dijit.form.Button({
			label: sys.installAppPackage,
			onClick: dojo.hitch(this, "installPackage")
		});
		this.toolbar.addChild(button);
		
		lucid.app.list(dojo.hitch(this, function(data){
			for(var i=0;i<data.length;i++){
				data[i].filetypes = data[i].filetypes.join(", ");
				data[i].compatible = data[i].compatible.join(", ");
				data[i].name = apps[data[i].name] || data[i].name;
				data[i].category = mnus[data[i].category.toLowerCase()];
				delete data[i].files;
			};
			var layout = [{
				cells: [[]]
			}];
			//make headers
			for(var field in data[0]){
				var args = {
					name: sys[field],
					field: field
				};
				layout[0].cells[0].push(args);
			}
			
			this._appStore = new dojo.data.ItemFileWriteStore({
				data: {
					identifier: "sysname",
					items: data
				}
			});
			var grid = this._appGrid = new dojox.grid.DataGrid({
				structure: layout,
                store: this._appStore,
                query: {sysname: "*"}
			});
			if(this._con) dojo.disconnect(this._con);
			this._con = dojo.connect(this.main, "resize", grid, "resize");
			dojo.connect(this._appStore, "onDelete", this, function(a){
				lucid.app.remove(a.sysname[0]); //that feels really hackish
			})
			this.main.setContent(this._appGrid.domNode);
			this._appGrid.render();
			var menu = this._appMenu = new dijit.Menu({});
			dojo.forEach([
				{
					label: cmn["delete"],
					onClick: dojo.hitch(this, function(e){
						var row = this._appGrid.getItem(this.__rowIndex);
						lucid.dialog.yesno({
							title: sys.appDelConfirm,
							message: sys.delFromSys.replace("%s", row.name),
							onComplete: dojo.hitch(this, function(a){
								if(a == false) return;
								this._appStore.deleteItem(row);
							})
						})
					})
				}
			], function(item){
				var menuItem = new dijit.MenuItem(item);
				menu.addChild(menuItem);
			});
			this._appGrid.onRowContextMenu = dojo.hitch(this, function(e){
				this.__rowIndex = e.rowIndex;
				this._appMenu._contextMouse();
				this._appMenu._openMyself(e);
			});
			document.body.appendChild(menu.domNode);
			this.win.layout();
		}));
	},
	installPackage: function(){
		var sys = dojo.i18n.getLocalization("lucid", "system");
		var cmn = dojo.i18n.getLocalization("lucid", "common");
		var win = new lucid.widget.Window({
			title: sys.installAppPackage,
			width: "300px",
			height: "200px"
		});
		this.windows.push(win);
		var main = new dijit.layout.ContentPane({region: "center"});
		var div = document.createElement("div");
		dojo.addClass(div, "tundra");
		div.innerHTML = sys.installAppInstructions;
		var uploader = new dojox.widget.FileInputAuto({
			name: "uploadedfile",
			url: lucid.xhr("core.app.install.package"),
			onComplete: dojo.hitch(this, function(data,ioArgs,widgetRef){
				if(data.status && data.status == "success"){
					widgetRef.overlay.innerHTML = sys.appInstallSuccess;
					//check for compatibility
					if(!data.compatible){
					    lucid.dialog.alert({
					        title: sys.notCompatible,
					        message: sys.notCompatibleText
					    });
					}
					this.apps.call(this, []);
				}else{
					widgetRef.overlay.innerHTML = cmn.error+": "+data.error;
					console.log('error',data,ioArgs);
				}
				dojo.publish("updateMenu", []);
			})
		});
		div.appendChild(uploader.domNode);
		main.setContent(div);
		win.addChild(main);
		var bottom = new dijit.layout.ContentPane({region: "bottom"});
			var cont = document.createElement("div");
			var close = new dijit.form.Button({
				label: cmn.close,
				onClick: dojo.hitch(win, "close")
			})
			cont.appendChild(close.domNode);
			dojo.addClass(cont, "floatRight");
			bottom.setContent(cont);
			win.addChild(bottom);
		win.show();
		dojo.style(uploader.inputNode, "width", "163px");
		uploader.startup();
	}
});
