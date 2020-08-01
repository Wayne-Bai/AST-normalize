dojo.provide("lucid.apps.Messenger.ui");
dojo.require("lucid.apps.Messenger.widget.AddBuddyForm");
dojo.require("lucid.apps.Messenger.widget.MessageBox");
dojo.require("dijit.Tree");
dojo.require("dijit.form.FilteringSelect");
dojo.require("dijit.form.Button");
dojo.require("dijit.Toolbar");
dojo.require("dojox.fx.scroll");
dojo.require("dojox.fx.easing");
dojo.require("dojox.validate.web");

dojo.extend(lucid.apps.Messenger, {
    buddyListWin: null,
    selectedBuddy: null,
    removeBuddyButton: null,
    unameUi: {},
    makeBuddyListWin: function(){
		var strings = dojo.i18n.getLocalization("lucid.apps.Messenger", "messenger");
        if(this.buddyListWin && !this.buddyListWin.closed) return this.BuddyListWin;
        var win = this.buddyListWin = new lucid.widget.Window({
            title: strings.contactList,
            iconClass: this.iconClass,
            width: "220px",
            height: "400px",
            onClose: dojo.hitch(this, "kill")
        });
        this.windows.push(win);
        this.unameUi = {};

        var store = this.makeBuddyStore();
        
        var toolbar = new dijit.Toolbar({
            region: "top"
        });
        
        var addButton = new dijit.form.Button({
            label: strings.addUser,
            iconClass: "icon-16-actions-list-add",
            onClick: dojo.hitch(this, "drawAddBuddyDialog"),
            getIconClass: function(item, opened){
                return "icon-16-apps-system-users";
            }
        });
        toolbar.addChild(addButton);
        
        var removeButton = this.removeBuddyButton = new dijit.form.Button({
            label: strings.removeUser,
            iconClass: "icon-16-actions-list-remove",
            disabled: true,
            onClick: dojo.hitch(this, function(){
                if(!this.selectedBuddy) return;
                store.deleteItem(this.selectedBuddy);
                store.save();
                this.selectedBuddy = null;
            })
        });

        toolbar.addChild(removeButton);

        win.addChild(toolbar);

        var model = new dijit.tree.ForestStoreModel({
            store: store,
            rootLabel: strings.contacts
        });

        var tree = new dijit.Tree({
            model: model,
            region: "center",
            getIconClass: function(item, opened){
                var iconClass = "";
                if(store.isItem(item) && store.hasAttribute(item, "logged")){
                    iconClass = store.getValue(item, "logged") ? "icon-16-apps-system-users" : "icon-16-actions-system-log-out";
                    return iconClass;
                }
                return (!item || this.model.mayHaveChildren(item)) ? (opened ? "dijitFolderOpened" : "dijitFolderClosed") : iconClass;
            },

            onClick: dojo.hitch(this, function(item){
                if(this.selectedBuddy == item){
                    var imWin = this.makeImWindow(item);
                    if(imWin.shown) imWin.bringToFront();
                    else imWin.show();
                    return;
                }
                this.selectedBuddy = item;
                this.removeBuddyButton.attr("disabled", false);
            })
        });

        win.addChild(tree);
        tree.startup();
        return win;
    },
    makeImWindow: function(item){
        var store = this.buddyStore;
        var uiSlot = this.unameUi[store.getValue(item, "id")];
        if(uiSlot && !uiSlot.win.closed)
            return uiSlot.win.bringToFront();
        var win = new lucid.widget.Window({
            title: store.getValue(item, "username"),
            width: "250px",
            height: "250px"
        });
        
        var messagePane = new dijit.layout.ContentPane({
            region: "center"
        });

        win.addChild(messagePane);

        var inputBox = new lucid.apps.Messenger.widget.MessageBox({
            region: "bottom",
            onSend: dojo.hitch(this, function(msg){
                this.sendMessage(store.getValue(item, "id"), msg);
            })
        }); 
        
        win.addChild(inputBox);
        
        this.unameUi[store.getValue(item, "id")] = {
            msgPane: messagePane,
            win: win,
            username: store.getValue(item, "username")
        };
        this.windows.push(win);
        return win;
    },
    pushMsg: function(uid, msg, local){
        var uiSlot = this.unameUi[uid];
        if(uiSlot && uiSlot.win && !uiSlot.win.closed){
            var node = uiSlot.msgPane.domNode;
            var line = this.msgToNode(uiSlot.username, msg, local);
            node.appendChild(line);
            dojox.fx.smoothScroll({
				node: line,
				win: node,
				duration: 500,
				easing:dojo.fx.easing.easeOut,
                onEnd: function(){
                    node.scrollTop = node.scrollHeight+node.offsetHeight;
                    node.scrollLeft = 0;
                }
			}).play();
        }
        else {
            var store = this.buddyStore;
            store.fetch({
                query: {id: uid},
                onComplete: dojo.hitch(this, function(items){
                    if(items.length == 0){
                        //add the user who sent this to the buddy list
                        lucid.user.get({
                            id: uid,
                            onComplete: dojo.hitch(this, function(info){
                                var item = this.addBuddy(info);
                                var win = this.makeImWindow(item);
                                this.pushMsg(uid, msg);
                                win.show();
                            })
                        });
                    }else{
                        var win = this.makeImWindow(items[0]);
                        this.pushMsg(uid, msg);
                        win.show();
                    }
                })
            });
        }
    },
    msgToNode: function(username, message, local){
        var div = document.createElement("div");
        
        var timeSpan = document.createElement("span");
        var timestamp = dojo.date.locale.format(new Date());
        timeSpan.innerHTML = "("+timestamp+") ";
        dojo.style(timeSpan, {
            color: local ? "blue" : "red"
        });
        div.appendChild(timeSpan);

        
        var nameSpan = document.createElement("span");
        div.appendChild(nameSpan);

        dojo.style(nameSpan, {
            fontWeight: "bold",
            color: local ? "blue" : "red"
        });

        var msgSpan = document.createElement("span");
        lucid.textContent(msgSpan, message);
        var message = msgSpan.innerHTML.split(" ");
        var fixedMessage = [];
        dojo.forEach(message, function(word){
            if(dojox.validate.isUrl(word) && word.indexOf("://") != -1)
                fixedMessage.push("<a href=\""+word.replace("\"", "\\\"")+"\">"+word+"</a>");
            else
                fixedMessage.push(word);
        });
        msgSpan.innerHTML = fixedMessage.join(" ");

        dojo.query("a", msgSpan).forEach(function(node){
			dojo.connect(node, "onclick", node, function(e){
				if(!e.shiftKey
				&& !e.ctrlKey){
					lucid.app.launchHandler(null, {url: this.href}, "text/x-uri");
					e.preventDefault();
				}
            })
		});

        div.appendChild(msgSpan);
        
        if(local){
            this.getCurrentUsername(function(name){
                lucid.textContent(nameSpan, name+": ");
            });
        }else{
            lucid.textContent(nameSpan, username+": ");
        }
        return div;
    },
    drawAddBuddyDialog: function(){
		var strings = dojo.i18n.getLocalization("lucid.apps.Messenger", "messenger");
        var win = new lucid.widget.Window({
            title: strings.addUser,
            width: "350px",
            height: "200px"
        });
        
        form = new lucid.apps.Messenger.widget.AddBuddyForm({
            onSubmit: dojo.hitch(this, function(){
                var values = form.getValues();
                lucid.user.get({
                    username: values.username,
                    onComplete: dojo.hitch(this, "addBuddy")
                });
                win.close();
                return false;
            }),
            onCancel: dojo.hitch(win, "close"),
            region: "center"
        });
        win.addChild(form);
        this.windows.push(win);
        win.show();
    },
    wrapWid: function(widget){
        var div = document.createElement("div");
        div.appendChild(widget.domNode);
        return div;
    }
});
