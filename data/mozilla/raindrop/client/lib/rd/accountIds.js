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
/*jslint plusplus: false */
/*global require: false */
"use strict";


//Mobile Safari does not yet (as of 5/3/2010) a native JSON object, even
//though desktop Safari does. When it does support it you can remove this
//goofiness. Right now this is technically not robust, but works out
//since Dojo is always in the page before this model.
var rd_stringify = typeof JSON !== "undefined" ? JSON.stringify : dojo.toJson;

require.def("rd/accountIds",
[
    "rd",
    "rdCouch!megaview:" + rd_stringify({
        key: ["schema_id", "rd.account"],
        reduce: false,
        include_docs: true
    })
],

function (rd, json) {
    //The imap account actually should match to an "email" identity.
    //This is a bit weird.
    var ids = [], i, row, proto,
        accountToIdentityTransform = {
            "imap": "email"
        };

    if (!json.rows.length || (json.rows.length === 1 && json.rows[0].value.rd_key[1] === "account!rss")) {
        return [];
    } else {
        for (i = 0; (row = json.rows[i]); i++) {
            proto = row.doc.proto;
            proto = accountToIdentityTransform[proto] || proto;
            ids.push([proto, row.doc.username]);
        }
        return ids;
    }
});
