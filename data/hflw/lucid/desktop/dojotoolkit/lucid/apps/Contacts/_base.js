dojo.provide("lucid.apps.Contacts._base");
dojo.require("dijit.Toolbar");
dojo.require("dojox.grid.DataGrid");
dojo.require("dojox.grid.cells.dijit");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.Button");
lucid.addDojoCss("dojox/grid/resources/Grid.css");
dojo.requireLocalization("lucid", "apps");
dojo.requireLocalization("lucid.apps.Contacts", "Contacts");
dojo.requireLocalization("lucid", "messages");

dojo.declare("lucid.apps.Contacts", lucid.apps._App, {
	init: function(args){
        var nls = dojo.i18n.getLocalization("lucid.apps.Contacts", "Contacts");
        var app = dojo.i18n.getLocalization("lucid", "apps");
		this.windows = [];
		var win = new lucid.widget.Window({
			title: app["Contacts"],
            iconClass: this.iconClass,
			onClose: dojo.hitch(this, "kill")
		});
		this.windows.push(win);
		
		var contactStore = this.contactStore = new lucid.Registry({
		    name: "contacts",
		    appname: this.sysname,
		    data: {
		        identifier: "id",
		        items: []
		    }
		});
		dojo.connect(contactStore, "onDelete", function(){ contactStore.save(); });
		var toolbar = new dijit.Toolbar({region: "top"});
		
		var newButton = new dijit.form.Button({
		    label: nls.newContact,
		    iconClass: "icon-16-actions-contact-new",
		    onClick: dojo.hitch(this, "newContact")
		});
		toolbar.addChild(newButton);
		
		var removeButton = new dijit.form.Button({
		    label: nls.removeContact,
		    iconClass: "icon-16-actions-edit-delete",
		    onClick: dojo.hitch(this, "removeContact")
		});
		toolbar.addChild(removeButton);
        
        var exportButton = new dijit.form.Button({
            label: nls["export"],
            onClick: dojo.hitch(this, "doExport")
		});
		toolbar.addChild(exportButton);

        var importButton = new dijit.form.Button({
            label: nls["import"],
            onClick: dojo.hitch(this, "doImport")
		});
		toolbar.addChild(importButton);

		win.addChild(toolbar);
		
		win.show();
		
		var grid = this.grid = new dojox.grid.DataGrid({
            store: contactStore,
            region: "center",
            structure: [{
		        cells: [[
			        {field: "name", name: nls.name, width: "auto"},
	                {field: "email", name: nls.email, width: "150px"},
	                {field: "phone-home", name: nls.phone, width: "100px"}
		        ]]
	        }],
            columnToggling: true,
            columnReordering: true
        });
        dojo.connect(grid, "onRowDblClick", this, "openContact");
        win.addChild(grid);
        grid.startup();
	},
	newContact: function(e){
        var store = this.contactStore;
        var nls = dojo.i18n.getLocalization("lucid.apps.Contacts", "Contacts");
        store.newItem({
            id: (new Date()).getTime(), //to prevent id collisions
            name: nls.newContact,
            email: "",
            phone: "",
            address: ""
        });
        store.save();
    },
    openContact: function(e){
        var nls = dojo.i18n.getLocalization("lucid.apps.Contacts", "Contacts");
        var item = this.grid.getItem(e.rowIndex);
        var form = new lucid.apps.Contacts.ContactForm({
            item: item,
            store: this.contactStore,
            region: "center"
        });
        var win = new lucid.widget.Window({
            width: "450px",
            height: "350px",
            title: nls.editContact.replace("%s", this.contactStore.getValue(item, "name"))
        });
        dojo.connect(form, "onCancel", win, "close");
        dojo.connect(form, "onSubmit", win, "close");
        dojo.connect(win, "onResize", form.borderContainer, "resize");
        dojo.connect(win, "onResize", form.tabContainer, "resize");
        win.addChild(form);
        win.show();
        this.windows.push(win);
    },
    removeContact: function(e){
        this.grid.removeSelectedRows();
    },
	kill: function(args){
		dojo.forEach(this.windows, function(win){
            if(!win.closed)
                win.close();
        });
	}
});
