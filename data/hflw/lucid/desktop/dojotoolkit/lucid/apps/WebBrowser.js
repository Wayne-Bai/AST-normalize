dojo.provide("lucid.apps.WebBrowser");
dojo.require("dijit.Toolbar");
dojo.require("dijit.form.Form");
dojo.require("dijit.form.Button");
dojo.require("dijit.layout.ContentPane");
dojo.requireLocalization("lucid", "apps");
dojo.requireLocalization("lucid", "common");

dojo.declare("lucid.apps.WebBrowser", lucid.apps._App, {
	kill: function(){
		if(!this.win.closed){ this.win.close(); }
	},
	init: function(args)
	{
		var app = dojo.i18n.getLocalization("lucid", "apps");
		var cm = dojo.i18n.getLocalization("lucid", "common");
		this.win = new lucid.widget.Window({
			title: app["Web Browser"],
			iconClass: this.iconClass,
			onClose: dojo.hitch(this, "kill")
		});
		this.Iframe = document.createElement("iframe");
		dojo.style(this.Iframe, "width", "100%");
		dojo.style(this.Iframe, "height", "100%");
		dojo.style(this.Iframe, "border", "0px");
		this.urlbox = new dijit.form.TextBox({style: "width: 80%;"});
		var form = new dijit.Toolbar({region: "top"});
		form.addChild(this.urlbox);
		form.addChild(new dijit.form.Button({iconClass: "icon-22-actions-go-jump", label: cm.go, onClick: dojo.hitch(this, this.go), style: "width: 10%;"}));
		form.startup();
		this.win.addChild(form);
		var client = new dijit.layout.ContentPane({region: "center"}, document.createElement("div"));
		client.setContent(this.Iframe);
		this.win.addChild(client);
		this.win.show();
		if(args.url) this.go(args.url);
		else this.go("http://www.google.com/");
		/*this.interval = setInterval(dojo.hitch(this, function(){
			var loc = this.Iframe.contentWindow.location;
			this.Iframe.top = {
				location: loc
			};
			if(loc != "about:blank") this.urlbox.setValue(loc);
		}), 500);*/
		this.win.startup();
	},
	
	go: function(url)
	{
		var URL = (typeof url == "string" ? url : this.urlbox.getValue());
		if(!(URL.charAt(4) == ":" && URL.charAt(5) == "/" && URL.charAt(6) == "/"))
		{
			//but wait, what if it's an FTP site?
			if(!(URL.charAt(3) == ":" && URL.charAt(4) == "/" && URL.charAt(5) == "/"))
			{
				//if it starts with an "ftp.", it's most likely an FTP site.
				if((URL.charAt(0) == "F" || URL.charAt(0) == "f") && (URL.charAt(1) == "T" || URL.charAt(1) == "t") && (URL.charAt(2) == "P" || URL.charAt(2) == "p") && URL.charAt(3) == ".")
				{
					URL = "ftp://"+URL;
				}
				else
				{
					//ok, it's probably a plain old HTTP site...
					URL = "http://"+URL;
				}
			}
		}
		this.Iframe.src = URL;
		this.urlbox.setValue(URL);
		return;
	}
})
