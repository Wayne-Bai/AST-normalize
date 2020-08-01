/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at http://mozilla.org/MPL/2.0/. */

const TEST_DATA = baseurl + "complex.html";

function setupModule(aModule) {
  aModule.controller = mozmill.getBrowserController();
}

function test() {
  controller.open(TEST_DATA);
  controller.waitForPageLoad();

  let content = findElement.ID(controller.tabs.activeTab, "content");
  let project = findElement.ID(controller.tabs.activeTab, "project");

  let screenshot = controller.screenshot(controller.window, "screen1", true,
                                         [content, project]);
  check_screenshot(screenshot, "screen1", true);
}

// screenshots of top chrome
function testChrome() {
  var toolbox = findElement.ID(controller.window.document, "navigator-toolbox");
  var tabs = findElement.ID(controller.window.document, "tabbrowser-tabs");

  let screenshot = controller.screenshot(controller.window, "screen2", false,
                                         [tabs]);
  check_screenshot(screenshot, "screen2", false);
}


function check_screenshot(aScreenshot, aName, aIsFile) {
  expect.equal(aScreenshot.name, aName, "Name has been set correctly.");
  expect.match(aScreenshot.dataURL, "/^data:image\/.*/", "dataURL is available.");

  if (aIsFile) {
    expect.ok(aScreenshot.filename, "Filename is available.");

    let file = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsILocalFile);
    file.initWithPath(aScreenshot.filename);
    expect.ok(file.exists(), "Screenshot '" + file.path + "' has been saved.");
    file.remove(true);
  } else {
    expect.ok(!aScreenshot.filename, "Filename should not be set.");
  }
}
