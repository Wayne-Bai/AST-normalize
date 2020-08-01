dojo.provide("lucid.apps.Messenger.widget.AddBuddyForm");
dojo.require("dijit.form.Form");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.Button");

dojo.declare("lucid.apps.Messenger.widget.AddBuddyForm", dijit.form.Form, {
    widgetsInTemplate: true,
    templateString: null,
	strings: "",
    templatePath: dojo.moduleUrl("lucid.apps.Messenger.widget.templates", "AddBuddyForm.html"),
    onSubmit: function(){
    },
    onCancel: function(){
    },
	constructor: function(){
		this.strings = dojo.i18n.getLocalization("lucid.apps.Messenger", "messenger");
	}
});
