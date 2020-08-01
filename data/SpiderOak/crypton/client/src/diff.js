/* Crypton Client, Copyright 2013 SpiderOak, Inc.
 *
 * This file is part of Crypton Client.
 *
 * Crypton Client is free software: you can redistribute it and/or modify it
 * under the terms of the Affero GNU General Public License as published by the
 * Free Software Foundation, either version 3 of the License, or (at your
 * option) any later version.
 *
 * Crypton Client is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE.  See the Affero GNU General Public
 * License for more details.
 *
 * You should have received a copy of the Affero GNU General Public License
 * along with Crypton Client.  If not, see <http://www.gnu.org/licenses/>.
*/

(function () {

'use strict';

var Diff = crypton.diff = {};

/**!
 * ### create(old, current)
 * Generate an object representing the difference between two inputs
 *
 * @param {Object} old
 * @param {Object} current
 * @return {Object} delta
 */
Diff.create = function (old, current) {
  var delta = jsondiffpatch.diff(old, current);
  return delta;
};

/**!
 * ### apply(delta, old)
 * Apply `delta` to `old` object to build `current` object
 *
 * @param {Object} delta
 * @param {Object} old
 * @return {Object} current
 */
// TODO should we switch the order of these arguments?
Diff.apply = function (delta, old) {
  var current = JSON.parse(JSON.stringify(old));
  jsondiffpatch.patch(current, delta);
  return current;
};

})();

