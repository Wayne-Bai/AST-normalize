/*
 *  Wiki Monkey - MediaWiki bot and editor assistant that runs in the browser
 *  Copyright (C) 2011-2014 Dario Giovannetti <dev@dariogiovannetti.net>
 *
 *  This file is part of Wiki Monkey.
 *
 *  Wiki Monkey is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  Wiki Monkey is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with Wiki Monkey.  If not, see <http://www.gnu.org/licenses/>.
 */

WM.Plugins.ArchWikiSaveTalk = new function () {
    "use strict";

    this.makeUI = function (args) {
        Alib.CSS.addStyleElement("#WikiMonkey-ArchWikiSaveTalk " +
                                                    "{margin-left:0.33em;}");

        var article = args[0];

        var link = document.createElement('a');
        link.id = "WikiMonkey-ArchWikiSaveTalk";
        link.href = "/index.php/" + article;
        link.innerHTML = article;

        return link;
    };

    this.main = function (args, callNext) {
        var article = args[0];
        var summary = args[1];

        WM.Log.logInfo('Appending diff to ' +
                            WM.Log.linkToWikiPage(article, article) + " ...");

        WM.Diff.getEndTimestamp(
                            WM.Plugins.ArchWikiSaveTalk.mainGetEndTimestamp,
                            [article, summary, callNext]);
    };

    this.mainGetEndTimestamp = function (enddate, args) {
        var article = args[0];
        var summary = args[1];
        var callNext = args[2];

        WM.MW.callQueryEdit(article,
                            WM.Plugins.ArchWikiSaveTalk.mainWrite,
                            [summary, enddate, callNext]);
    };

    this.mainWrite = function (article, source, timestamp, edittoken, args) {
        var summary = args[0];
        var enddate = args[1];
        var callNext = args[2];

        var title = Alib.HTTP.getURIParameter(null, 'title');
        var pEnddate = enddate.substr(0, 10) + "&nbsp;" +
                                                        enddate.substr(11, 8);

        var newtext = WM.Tables.appendRow(source, "<!-- REPLY TABLE -->",
                        ["[" + location.href + " " + title + "]", pEnddate]);

        WM.MW.callAPIPost(
            {
                action: "edit",
                bot: "1",
                title: article,
                summary: summary,
                text: newtext,
                basetimestamp: timestamp,
                token: edittoken
            },
            null,
            WM.Plugins.ArchWikiSaveTalk.mainEnd,
            [article, callNext]
        );
    };

    this.mainEnd = function (res, args) {
        var article = args[0];
        var callNext = args[1];

        if (res.edit && res.edit.result == 'Success') {
            WM.Log.logInfo('Diff correctly appended to ' +
                                    WM.Log.linkToWikiPage(article, article));
            if (callNext) {
                callNext();
            }
        }
        else {
            WM.Log.logError('The diff has not been appended!\n' +
                    res['error']['info'] + " (" + res['error']['code'] + ")");
        }
    };
};
