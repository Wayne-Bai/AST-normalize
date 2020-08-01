/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

const tabs = require("sdk/tabs");
const { getGroup } = require("group");
const { groupManager } = require("group-manager");

var INVITE_PATTERN = /^https:\/\/togetherjs.com\/hotdish\/invite.*#group=(.*)$/i;
exports.INVITE_BASE = "https://togetherjs.com/hotdish/invite/#group=";

tabs.on("pageshow", function (tab) {
  checkTab(tab);
});

for each (var tab in tabs) {
  checkTab(tab);
}

function checkTab(tab) {
  var match = INVITE_PATTERN.exec(tab.url);
  if (match) {
    var groupId = match[1];
    // FIXME: should check history and go back, or close the tab
    var group = getGroup(groupId);
    group.activateOrCreate();
  }
}
