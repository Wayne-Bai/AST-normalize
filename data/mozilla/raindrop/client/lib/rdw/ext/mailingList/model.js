/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Raindrop.
 *
 * The Initial Developer of the Original Code is
 * Mozilla Messaging, Inc..
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 * */

/*jslint nomen: false, plusplus: false */
/*global require: false, setTimeout: false */
"use strict";

require.def("rdw/ext/mailingList/model",
["rd", "dojo", "rd/api"],
function (rd, dojo, api) {

    return {
        _reg: {},
        _ids: {},

        /**
         * registers an object, usually a widget, as listening for a summary schema.
         * The object should have a .id property that is unique and implement
         * a onMailingListSummaryUpdate method.
         */
        register: function (listId, obj) {
            var reg = this._reg[listId] || (this._reg[listId] = {}),
                id = obj.id, doc = this._ids[listId];
            if (!reg[id]) {
                reg[id] = obj;
            }
            if (!doc) {
                this._ids[listId] = "needsUpdate";
                this._get(listId).ok(this, function (doc) {
                    this._checkStatus(listId, doc); 
                });
            } else {
                if (doc !== "needsUpdate") {
                    obj.onMailingListSummaryUpdate(doc);
                }
            }
        },
    
        unregister: function (listId, obj) {
            var prop, reg = this._reg[listId];
            delete reg[obj.id];
        
            //Check if any other registrations. If so, clean up.
            for (prop in reg) {
                if (reg.hasOwnProperty(prop)) {
                    //Still listeners, just return.
                    return;
                }
            }
        
            //If got here, then no more registrations for that list, clean up.
            delete this._reg[listId];
            delete this._ids[listId];
        },
    
        put: function (doc) {
            var dfd = new dojo.Deferred();
            api().put({
                doc: doc
            })
            .ok(this, function (upDoc) {
                var listId = doc.id, url, params, schemaItems;
    
                //Update the rev.
                doc._rev = doc._rev;
    
                //Update the cache
                this._ids[listId] = doc;
    
                //Trigger an unsubscribe email.
                url = new dojo._Url(doc.unsubscribe.mailto);
                //alert("scheme: " + url.scheme + "; authority: " + url.authority +
                //      "; path: " + url.path +   "; query: " + url.query +
                //      "; fragment " + url.fragment);
            
                // url.path == the email address
                // url.query == can contain subject and/or body parameters
                params = url.query ? dojo.queryToObject(url.query) : {};

                //Needed by back-end to correctly process the schema.
                schemaItems = {};

                schemaItems[rd.uiExtId] = {
                    rd_source: [
                        doc._id,
                        doc._rev
                    ],
                    schema: null
                };
    
                api().put({
                    doc: {
                        //TODO: make a better rd_key.
                        rd_key: ["manually_created_doc", (new Date()).getTime()],
                        rd_schema_id: "rd.msg.outgoing.simple",
                        rd_schema_provider: rd.uiExtId,
                        rd_schema_items: schemaItems,
                        from: doc.identity,
                        // TODO: use the user's name in the from_display.
                        from_display: doc.identity[1],
                        to: [["email", url.path]],
                        to_display: [url.path],
                        // Hopefully the mailto: URL has provided us with the necessary subject
                        // and body.  If not, we guess "subscribe" for both subject and body.
                        // TODO: make better guesses based on knowledge of the mailing list
                        // software being used by the mailing list.
                        subject: params.subject ? params.subject : "unsubscribe",
                        body: params.body ? params.body : "unsubscribe",
                        outgoing_state: "outgoing"
                    }
                })
                .ok(dfd)
                .error(dfd);
    
                //If the status is a pending one, then watch for changes.
                this._checkStatus(listId, doc);
            });
    
            return dfd;
        },
    
        _get: function (listId, force) {
            var doc = this._ids[listId],
                dfd = new dojo.Deferred();
            if (doc === "needsUpdate" || force) {
                api().view('mailing_list_id', {
                    key: listId,
                    reduce: false,
                    include_docs: true
                })
                .ok(this, function (json) {
                    // ??? Should we pass the doc to the callback rather than assigning it
                    // to a property of this object here?
                    if (json.rows.length > 0) {
                        var doc = this._ids[listId] = json.rows[0].doc;
                        dfd.callback(doc);
                        this._callUpdate(listId, doc);
                    } else {
                        dfd.error(json);
                    }
                })
                .error(dfd);
            } else {
                dfd.callback(doc);
            }
            return dfd;
        },

        _callUpdate: function (listId, doc) {
            var objs = this._reg[listId], prop;
            for (prop in objs) {
                if (objs.hasOwnProperty(prop)) {
                    objs[prop].onMailingListSummaryUpdate(doc);
                }
            }
        },

        _isTempStatus: function (status) {
            return status === "unsubscribe-pending" || status === "unsubscribe-confirmed";
        },

        _checkStatus: function (listId, doc) {
            //First, update listeners with the doc.
            this._callUpdate(listId, doc);
        
            //Now keep checking if the status is one that is in transition.
            if (this._isTempStatus(doc.status)) {
                setTimeout(dojo.hitch(this, function () {
                    this._get(listId, true).ok(this, function (doc) {
                        this._checkStatus(listId, doc);
                    });       
                }), 10000);
            }
        }
    };
});
