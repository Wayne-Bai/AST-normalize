/* Crypton Server, Copyright 2013 SpiderOak, Inc.
 *
 * This file is part of Crypton Server.
 *
 * Crypton Server is free software: you can redistribute it and/or modify it
 * under the terms of the Affero GNU General Public License as published by the
 * Free Software Foundation, either version 3 of the License, or (at your
 * option) any later version.
 *
 * Crypton Server is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE.  See the Affero GNU General Public
 * License for more details.
 *
 * You should have received a copy of the Affero GNU General Public License
 * along with Crypton Server.  If not, see <http://www.gnu.org/licenses/>.
*/

'use strict';

var colors = require('colors');
var config = require('./config');

var possibleLevels = [
  'error',
  'warn',
  'info',
  'debug',
  'trace'
];

var maxLevel = config.logLevel || 'error';
var maxIndex = possibleLevels.indexOf(maxLevel);

/**!
 * ## log(level, message)
 * Log `message` to stdout if `level` is high enough for output
 *
 * `level` defaults to `'info'`
 * 
 * @param {String} level
 * @param {String} message
 */
module.exports = function log (level, message) {
  if (!message) {
    message = level;
    level = 'info';
  }

  var levelIndex = possibleLevels.indexOf(level);
  if (!~levelIndex || levelIndex <= maxIndex) {
    var initial = '[' + level + ']';
    console.log(initial.blue + ' ' + message);
  }
};
