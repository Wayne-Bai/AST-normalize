/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at http://mozilla.org/MPL/2.0/. */

function setupModule() {
  expect.pass('setupModule executed');
}

function setupTest() {
  throw Error("Expected exception in setupTest");
}

function testNotExecuted() {
  assert.fail("This test should never be executed.");
}

function teardownModule() {
  expect.pass('teardownModule executed');
}
