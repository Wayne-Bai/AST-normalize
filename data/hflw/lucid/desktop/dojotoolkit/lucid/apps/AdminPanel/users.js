dojo.provide("lucid.apps.AdminPanel.users");

dojo.extend(lucid.apps.AdminPanel, {
	users: function(){
		var sys = dojo.i18n.getLocalization("lucid", "system");
		var cmn = dojo.i18n.getLocalization("lucid", "common");
		var usr = dojo.i18n.getLocalization("lucid.ui", "accountInfo");
		this.toolbar.destroyDescendants();
		var button = new dijit.form.DropDownButton({
			label: sys.createNewUser,
			dropDown: this.newUserDialog()
		});
		this.toolbar.addChild(button);
		lucid.admin.users.list(dojo.hitch(this, function(data){
			for(var i=0;i<data.length;i++){
				data[i].permissions = dojo.toJson(data[i].permissions);
				data[i].groups = dojo.toJson(data[i].groups);
                data[i].logged = !!parseInt(data[i].logged);
			};
			var layout = [{
				cells: [[]]
			}];
			//make headers
			for(var field in data[0]){
				if(field == "permissions" || field == "groups" || field == "quota") continue;
				var args = {
					name: sys[field] || usr[field],
					field: field
				};
				if(field == "name" || field == "username" || field == "email"){
                    args.type = dojox.grid.cells.Cell;
                    args.editable = true;
                }
                if(field == "logged"){
                    args.type = dojox.grid.cells.Bool;
                }
				layout[0].cells[0].push(args);
			}
			
			this._userStore = new dojo.data.ItemFileWriteStore({
				data: {
					identifier: "id",
					items: data
				}
			});
            console.log("asdf");
			var grid = this._userGrid = new dojox.grid.DataGrid({
				structure: layout,
                store: this._userStore,
                query: {id: "*"}
			});
			if(this._con) dojo.disconnect(this._con);
			this._con = dojo.connect(this.main, "resize", grid, "resize");
			dojo.connect(this._userStore, "onDelete", this, function(a){
				lucid.admin.users.remove(a.id[0]); //that feels really hackish
			})
			dojo.connect(this._userStore, "onSet", this, function(item, attribute, oldVal, newVal){
				if(attribute == "permissions") return;
				var id = this._userStore.getValue(item, "id");
				if(id == false) return;
				var args = {id: id};
				args[attribute] = newVal;
				lucid.user.set(args);
			})
			this.main.setContent(this._userGrid.domNode);
			this._userGrid.render();
			var menu = this._userMenu = new dijit.Menu({});
			dojo.forEach([
				{
					label: cmn["delete"],
					onClick: dojo.hitch(this, function(e){
						var row = this._userGrid.getItem(this.__rowIndex);
						lucid.dialog.yesno({
							title: sys.userDelConfirm,
							message: sys.delFromSys.replace("%s", row.username),
							onComplete: dojo.hitch(this, function(a){
								if(a == false) return;
								var id = this._userStore.getValue(row, "id");
								this._userStore.deleteItem(row);
								lucid.crosstalk.publish("accountremoval", {}, id, null, null, dojo.hitch(this, function(id){
									setTimeout(dojo.hitch(this, function(){
										lucid.crosstalk.exists(id, dojo.hitch(this, function(notsent){
											if(notsent)
												lucid.crosstalk.cancel(id);
										}));
									}), 2500);
								}));
							})
						})
					})
				},
				{
					label: usr.changePassword,
					onClick: dojo.hitch(this, function(e){
						var row = this._userGrid.getItem(this.__rowIndex);
						var win = new lucid.widget.Window({
							title: sys.chUsersPassword.replace("%s", row.username),
							width: "250px",
							height: "200px"
						});
						this.windows.push(win);
						
						var client = new dijit.layout.ContentPane({
							region: "center"
						});
						var div = document.createElement("div");
						var errBox = document.createElement("div");
						div.appendChild(errBox);
						var input1, input2;
						dojo.forEach([
							{
								label: usr.newPassword,
								widget: input1 = new dijit.form.TextBox({
									type: "password"
								})
							},
							{
								label: usr.confirmNewPassword,
								widget: input2 = new dijit.form.TextBox({
									type: "password"
								})
							}
						], function(item){
							var row = document.createElement("div");
							var label = document.createElement("span");
							label.textContent = item.label+": ";
							row.appendChild(label);
							row.appendChild(item.widget.domNode);
							div.appendChild(row);
						})
						
						client.setContent(div);
						win.addChild(client);
						
						var bottom = new dijit.layout.ContentPane({
							region: "bottom"
						});
						var div = document.createElement("div");
						dojo.addClass(div, "floatRight");
						var button = new dijit.form.Button({
							label: cmn.ok,
							onClick: dojo.hitch(this, function(){
								if(input1.getValue() != input2.getValue()) return errBox.textContent = usr.passwordsDontMatch;
								this._userStore.setValue(row, "password", input1.getValue());
								win.close();
							})
						})
						div.appendChild(button.domNode);
						var cancel = new dijit.form.Button({label: cmn.cancel, onClick: dojo.hitch(win, "close")});
						div.appendChild(cancel.domNode);
						bottom.setContent(div);
						win.addChild(bottom);
						win.show();
						win.startup();
					})
				},
				{
					label: sys.alterPermissions,
					onClick: dojo.hitch(this, "permDialog",
						grid,
						dojo.hitch(this, function(row){
							return this._userStore.getValue(row, "username");
						}),
						dojo.hitch(this, function(row){
							return dojo.fromJson(this._userStore.getValue(row, "permissions"));
						}),
						dojo.hitch(this, function(row, newPerms){
							this._userStore.setValue(row, "permissions", dojo.toJson(newPerms));
							lucid.user.set({
								id: this._userStore.getValue(row, "id"),
								permissions: newPerms
							})
						})
					)
				},
				{
					label: sys.modifyQuotaGeneric,
					onClick: dojo.hitch(this, function(){
						var row = this._userGrid.getItem(this.__rowIndex);
						var info = {
							name: this._userStore.getValue(row, "username"),
							size: this._userStore.getValue(row, "quota")
						};
						this.makeQuotaWin(info, dojo.hitch(this, function(value){
							this._userStore.setValue(row, "quota", value);
							var id = this._userStore.getValue(row, "id");
							lucid.crosstalk.publish("quotaupdate", {}, id, null, null, dojo.hitch(this, function(id){
								setTimeout(dojo.hitch(this, function(){
									lucid.crosstalk.exists(id, dojo.hitch(this, function(notsent){
										if(notsent)
											lucid.crosstalk.cancel(id);
									}));
								}), 2500);
							}));
						}));
					})
				}
			], function(item){
				var menuItem = new dijit.MenuItem(item);
				menu.addChild(menuItem);
			});
			this._userGrid.onRowContextMenu = dojo.hitch(this, function(e){
				this.__rowIndex = e.rowIndex;
				this._userMenu._contextMouse();
				this._userMenu._openMyself(e);
			});
			document.body.appendChild(menu.domNode);
			this.win.layout();
		}));
	},
	newUserDialog: function(){
		var usr = dojo.i18n.getLocalization("lucid.ui", "accountInfo");
		var cmn = dojo.i18n.getLocalization("lucid", "common");
		var dialog = new dijit.TooltipDialog({});
		var error = document.createElement("div");
		dialog.containerNode.appendChild(error);
		
		var line = document.createElement("div");
	    var p = document.createElement("span");
	    p.innerHTML = usr.name+": ";
	    line.appendChild(p);
		var name = new dijit.form.TextBox();
	    line.appendChild(name.domNode);
		dialog.containerNode.appendChild(line);
		
		var line = document.createElement("div");
	    var p = document.createElement("span");
	    p.innerHTML = usr.username+": ";
	    line.appendChild(p);
		var username = new dijit.form.TextBox();
	    line.appendChild(username.domNode);
		dialog.containerNode.appendChild(line);
		
		var line = document.createElement("div");
	    var p = document.createElement("span");
	    p.innerHTML = usr.email+": ";
	    line.appendChild(p);
		var email = new dijit.form.TextBox();
	    line.appendChild(email.domNode);
		dialog.containerNode.appendChild(line);
		
		var line = document.createElement("div");
	    var p = document.createElement("span");
	    p.innerHTML = usr.password+": ";
	    line.appendChild(p);
		var password = new dijit.form.TextBox({type: "password"});
	    line.appendChild(password.domNode);
		dialog.containerNode.appendChild(line);
		
		var line = document.createElement("div");
	    var p = document.createElement("span");
	    p.innerHTML = usr.confirmPassword+": ";
	    line.appendChild(p);
		var confpassword = new dijit.form.TextBox({type: "password"});
	    line.appendChild(confpassword.domNode);
		dialog.containerNode.appendChild(line);
		
		var line = document.createElement("div");
	    var button = new dijit.form.Button({
			label: cmn.create,
			onClick: dojo.hitch(this, function(){
				dojo.require("dojox.validate.web");
				if(username.getValue() == "") return error.textContent = usr.enterUsername;
				if(username.getValue().indexOf("..") != -1){
					error.textContent = usr.cannotContain.replace("%s", "..");
					return;
				}
				if(username.getValue().indexOf("/") != -1){
					error.textContent = usr.cannotContain.replace("%s", "/");
					return;
				}
				if(username.getValue().indexOf("\\") != -1){
					error.textContent = usr.cannotContain.replace("%s", "\\");
					return;
				}
				if(!dojox.validate.isEmailAddress(email.getValue())) return error.textContent = usr.enterValidEmail;
				if(password.getValue() == "") return error.textContent = usr.enterPassword;
				if(password.getValue() != confpassword.getValue()) return error.textContent = usr.passwordsDontMatch;
				error.textContent = "";
				lucid.admin.users.create({
					name: name.getValue(),
					username: username.getValue(),
					email: email.getValue(),
					password: password.getValue(),
					onComplete: dojo.hitch(this, function(id){
						if(id == false) return error.textContent = usr.usernameAllreadyTaken;
						error.textContent = usr.userCreated;
						this._userStore.newItem({
							name: name.getValue(),
							username: username.getValue(),
							groups: "[]",
							permissions: "[]",
							email: email.getValue(),
							id: id,
							quota: -1
						});
						name.setValue("");
						username.setValue("");
						email.setValue("");
						password.setValue("");
						confpassword.setValue("");
					})
				});
			})
		});
	    line.appendChild(button.domNode);
		dialog.containerNode.appendChild(line);
		dialog.startup();
		return dialog;
	},
	makeUserStore: function(callback){
		lucid.admin.users.list(dojo.hitch(this, function(data){
			for(var i=0;i<data.length;i++){
				data[i].permissions = dojo.toJson(data[i].permissions);
				data[i].groups = dojo.toJson(data[i].groups);
			};
			this._userStore = new dojo.data.ItemFileWriteStore({
				data: {
					identifier: "id",
					items: data
				}
			});
			callback();
		}));
	}
});
