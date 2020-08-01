dojo.provide("lucid.apps.AccountInfo");

dojo.declare("lucid.apps.AccountInfo", lucid.apps._App, {
	init: function(args){
		var l = dojo.i18n.getLocalization("lucid.ui", "accountInfo");
		var cm = dojo.i18n.getLocalization("lucid", "common");
		var win = this.win = new lucid.widget.Window({
			title: l.accountInfo,
			iconClass: this.iconClass,
			onClose: dojo.hitch(this, "kill")
		});
		var top = new dijit.layout.ContentPane({region: "top", style: "padding-bottom: 5px;"});
		var picture = new dijit.form.Button({iconClass: "icon-32-apps-system-users", label: "Picutre", showLabel: false})
		var chpasswd = document.createElement("div");
		dojo.style(chpasswd, "position", "absolute");
		dojo.style(chpasswd, "top", "0px");
		dojo.style(chpasswd, "right", "0px");
		var topRow = document.createElement("div");
		topRow.innerHTML = l.username+": ";
		var usernameSpan = document.createElement("span");
		topRow.appendChild(usernameSpan);
		var button = new dijit.form.Button({
			label: l.changePasswordAction,
			onClick: dojo.hitch(this, "password")
		});
		chpasswd.appendChild(topRow);
		chpasswd.appendChild(button.domNode);
		
		topContent = document.createElement("div");
		dojo.forEach([picture, chpasswd], function(item){
			topContent.appendChild(item.domNode || item);
		}, this);
		top.setContent(topContent);
		
		var client = new dijit.layout.TabContainer({
			region: "center"
		});
		
		var general = new dijit.layout.ContentPane({title: l.general});
		
		var langs = [];
		var intLangs = dojo.i18n.getLocalization("lucid", "languages");
		for(var key in intLangs){
			langs.push({value: key, label: intLangs[key]});
		}
		
		var rows = {
			name: {
				widget: "TextBox",
				params: {}
			},
			email: {
				widget: "ValidationTextBox",
				params: {
					isValid: function(blah){
						return dojox.validate.isEmailAddress(this.textbox.value);
					}
				}
			},
			language: {
				widget: "FilteringSelect",
				params: {
					value: lucid.config.locale,
					searchAttr: "label",
					autoComplete: true,
					store: new dojo.data.ItemFileReadStore({
						data: {
							identifier: "value",
							label: "label",
							items: langs
						}
					})
				}
			}
		}
		var div = document.createElement("div");
		var elems = {};
		for(var key in rows){
			var row = document.createElement("div");
			dojo.style(row, "marginBottom", "5px");
			row.innerHTML = l[key]+":&nbsp;";
			row.appendChild((elems[key] = new dijit.form[rows[key].widget](rows[key].params)).domNode);
			div.appendChild(row);
		};
		general.setContent(new dijit.form.Form({}, div).domNode);
		
		client.addChild(general);
		
		var bottom = new dijit.layout.ContentPane({region: "bottom"});
		var close = new dijit.form.Button({
			label: cm.close,
			onClick: dojo.hitch(win, "close")
		});
		var p=document.createElement("div");
		dojo.addClass(p, "floatRight");
		p.appendChild(close.domNode)
		bottom.setContent(p)
		
		dojo.forEach([top, client, bottom], function(wid){
			win.addChild(wid);
			wid.startup();
		}, this);
		lucid.user.get({
            onComplete: function(info){
    			elems["name"].setValue(info.name);
	    		elems["email"].setValue(info.email);
		    	lucid.textContent(usernameSpan, info.username);
		    }
        });
		dojo.connect(win, "onClose", this, function(){
			var args = {};
			for(var key in elems){
				var elem = elems[key];
				if(typeof elem.isValid != "undefined"){
					if(!elem.isValid()) continue;
				}
				switch(key){
					case "name":
						args.name = elem.getValue();
						break;
					case "email":
						args.email = elem.getValue();
						break;
					case "language":
						var oldLocale = lucid.config.locale;
						lucid.config.locale = elem.getValue();
						if(oldLocale != lucid.config.locale){
							dojo.cookie("desktopLocale", lucid.config.locale);
							lucid.dialog.notify(l.restartDesktopForLangChange);
						}
						break;
				}
			}
			lucid.user.set(args);
		});
		
		win.show();
	},
	password: function(){
		//	summary:
		//		Shows the password change dialog
		if(this.passwordWin) return this.passwordWin.bringToFront();
		var l = dojo.i18n.getLocalization("lucid.ui", "accountInfo");
		var cm = dojo.i18n.getLocalization("lucid", "common");
		var win = this.passwordWin = new lucid.widget.Window({
			title: l.changePassword,
			width: "450px",
			height: "350px",
			onClose: dojo.hitch(this, function(){
				this.passwordWin = false;
				clearTimeout(this._authTimeout);
			})
		});
		var top = new dijit.layout.ContentPane({region: "top", style: "padding: 20px;"});
		top.setContent(l.passwordDirections);
		
		var client = new dijit.layout.ContentPane({region: "center"});
		var row4 = document.createElement("div");
		dojo.style(row4, "textAlign", "center");
		var onChange = dojo.hitch(this, function(){
			if(this.newpasswd.getValue() == this.confpasswd.getValue()){
				lucid.textContent(row4, l.passwordsMatch);
				this.chPasswdButton.setDisabled(false)
			}
			else {
				lucid.textContent(row4, l.passwordsDontMatch);
				this.chPasswdButton.setDisabled(true);
			}
		});
		var row2 = document.createElement("div");
		row2.innerHTML = l.newPassword+":&nbsp;";
		var newpasswd = this.newpasswd = new dijit.form.TextBox({type: "password", onChange: onChange, disabled: true});
		row2.appendChild(newpasswd.domNode)
		var row3 = document.createElement("div");
		row3.innerHTML = l.confirmNewPassword+":&nbsp;";
		var confpasswd = this.confpasswd = new dijit.form.TextBox({type: "password", onChange: onChange, disabled: true});
		row3.appendChild(confpasswd.domNode);
		var row1 = document.createElement("div");
		row1.innerHTML = l.currentPassword+":&nbsp;";
		var current = new dijit.form.TextBox({type: "password", style: "width: 125px;"});
		row1.appendChild(current.domNode);
		var resetForm = dojo.hitch(this, function(){
				current.setValue("");
				newpasswd.setValue("");
				confpasswd.setValue("");
				current.setDisabled(false);
				this.authButton.setDisabled(false);
				newpasswd.setDisabled(true);
				confpasswd.setDisabled(true);
				this.chPasswdButton.setDisabled(true);
		});
		var authButton = this.authButton = new dijit.form.Button({
			label: l.authenticate,
			onClick: dojo.hitch(this, function(){
				current.setDisabled(true);
				this.authButton.setDisabled(true);
				var res = function(data){
    				current.setDisabled(data);
	    			authButton.setDisabled(data);
		    		newpasswd.setDisabled(!data);
			    	confpasswd.setDisabled(!data);
				    lucid.textContent(row4, (data ? l.authSuccess : l.authFail));
    				this._authTimeout = setTimeout(resetForm, 5*60*1000);
	    		}
				lucid.user.authenticate(current.getValue(), 
                    dojo.hitch(this, function(){
                        res(true);
                    }),
                    dojo.hitch(this, function(){
                        res(false);
	    		    })
                )
		    	current.setValue("");
			})
		})
		row1.appendChild(authButton.domNode);
		
		
		var main = document.createElement("div");
		dojo.style(main, "padding", "10px");
		dojo.forEach([row1, row2, row3, row4], function(e){ main.appendChild(e); });
		client.setContent(main);
		
		var bottom = new dijit.layout.ContentPane({region: "bottom"});
		var div = document.createElement("div");
		dojo.addClass(div, "floatRight");
		div.appendChild((new dijit.form.Button({
			label: cm.close,
			onClick: dojo.hitch(win, win.close)
		})).domNode);
		div.appendChild((this.chPasswdButton = new dijit.form.Button({
			label: l.changePassword,
			disabled: true,
			onClick: dojo.hitch(this, function(){
				lucid.textContent(row4, l.changingPassword)
				current.setDisabled(true);
				this.authButton.setDisabled(true);
				newpasswd.setDisabled(true);
				confpasswd.setDisabled(true);
				this.chPasswdButton.setDisabled(true);
				
				lucid.user.set({
					password: newpasswd.getValue(),
					onComplete: function(){
						resetForm();
						lucid.textContent(row4, l.passwordChangeSuccessful);
						clearTimeout(this._authTimeout);
					}
				})
			})
		})).domNode);
		bottom.setContent(div);
		
		dojo.forEach([top, bottom, client], function(e){
			win.addChild(e);
		});
		win.show();
		win.startup();
	},
	kill: function(){
		if(!this.win.closed) this.win.close();
		if(this.passwordWin && !this.passwordWin.closed) this.passwordWin.close();
	}
})
