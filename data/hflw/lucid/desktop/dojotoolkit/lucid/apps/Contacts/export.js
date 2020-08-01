dojo.provide("lucid.apps.Contacts.export");

(function(){
    var keys = {
        name: "FN",
        address: "ADR",
        phone: "TEL",
        email: "EMAIL"
    }
    dojo.extend(lucid.apps.Contacts, {
        doExport: function(){
            var msg = dojo.i18n.getLocalization("lucid", "messages");
            lucid.dialog.file({
	            title: msg.chooseFileSave,
	            onComplete: dojo.hitch(this, function(path){
                   this.exportData(path, function(){}, function(){}); //TODO: add notifications? 
	            })
	        });

        },
        exportData: function(path, onComplete, onError){
            var data = [];
            var store = this.contactStore;
            store.fetch({
                query: {id: "*"},
                onItem: function(item){
                   var card = "BEGIN:VCARD\r\nVERSION:3.0\r\n";
                   for(var key in keys){
                       if(key == "address"){
                            var types = ["work", "home"];
                            for(var t in types){
                                var type = types[t];
                                //grab all the address fields, merge into one
                                var fields = ["pobox", "", "address", "city", "state", "zip", "country"];
                                var parts = [];
                                for(var i in fields){
                                    if(fields[i] == ""){
                                        parts.push("");
                                        continue;
                                    }
                                    var field = fields[i]+"-"+type;
                                    if(store.hasAttribute(item, field) && store.getValue(item, field) != ""){
                                        parts.push(store.getValue(item, field));
                                    }else{
                                        parts.push("");
                                    }
                                }
                                card += keys[key]+";TYPE="+type.toUpperCase()+":";
                                card += parts.join(";");
                                card += "\r\n";
                            }
                       }
                       else if(key == "phone"){
                            var types=["work", "home", "mobile", "fax"];
                            for(var t in types){
                                var type = types[t];
                                var field = "phone-"+type;
                                var vcardFields = {
                                    work: "WORK,VOICE",
                                    home: "HOME,VOICE",
                                    mobile: "MOBILE,VOICE",
                                    fax: "WORK,FAX"
                                }
                                if(store.hasAttribute(item, field) && store.getValue(item, field) != ""){
                                    card += "TEL;TYPE="+vcardFields[type]+":"+store.getValue(item, field)+"\r\n";
                                }
                            }
                       }
                       else if(store.hasAttribute(item, key) && store.getValue(item, key) != "")
                            card += keys[key]+":"+store.getValue(item, key)+"\r\n";
                   }
                   card += "END:VCARD";
                   data.push(card);
                },
                onComplete: function(){
                   lucid.filesystem.writeFileContents(path, data.join("\r\n\r\n"), onComplete, onError);
                }
            });
        }
    });
})();
