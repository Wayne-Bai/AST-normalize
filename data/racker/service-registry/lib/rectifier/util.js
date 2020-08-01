/**
 *  Copyright 2013 Rackspace
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

var crypto = require('crypto');

var settings = require('../util/settings');
var ALL = 'ALL';

// converts a range description (X-Y) into an array of elements (X, X+1, X+2, ... Y).
function range(r) {
  var pos = parseInt(r.split('-')[0], 10),
      stop = r.indexOf('-') < 0 ? pos + 1 : parseInt(r.split('-')[1], 10) + 1,
      arr = [];
  while (pos < stop) {
    arr[arr.length] = pos;
    pos += 1;
  }
  return arr;
}

function numberSort(a, b) { return a - b; }

/**
 * converts a string to an array of integers.
 * valid inputs include special strings, ranges and/or individual shards.  E.g.:
 * 'ALL'
 * 1,3,4,56 => [1,3,4,56]
 * 1-5,12-15 => [1,2,3,4,5,12,13,14,15]
 * 7,3,10-13,2-5,9 => [2,3,4,5,7,9,10,11,12,13]
 * @param {String} input string representation of shards to process.
 * @return {Array} list of every shard included in the description in ASC order.
 */
exports.parseShards = function(input) {
  // valid inputs include special strings, ranges and/or individual shards.  E.g.
  // 'ALL'
  // 1,3,4,56
  // 1-5,12-90
  // 3,7,4,12-90,125,250-275
  
  if (input === ALL) {
    input = '0-' + settings.MAX_SHARDS;
  }
  
  return input.split(',').reduce(function(baton, rangeDescriptor) {
    range(rangeDescriptor).map(function(element, index, originalInput) {
      baton[baton.length] = element;
    });
    return baton;
  }, []).sort(numberSort);
};

/**
 * non-destructive shuffle.
 * @param {Array} array values to shuffle.
 * @return {Array} shuffled array.
 */
exports.shuffle = function(array) {
  var i, temp, rand, newArr = [];
  for (i = 0; i < array.length; i++) {
    newArr[i] = array[i];
  }
  for (i = 0; i < newArr.length; i++) {
    rand = Math.floor(Math.random() * (i + 1));
    temp = newArr[i];
    newArr[i] = newArr[rand];
    newArr[rand] = temp;
  }
  return newArr;
};

exports.computeShard = function(accountId) {
  // question: the last 8 digits are accountId are basically a random base-62 number. why not use the MAX_SHARDS modulus of that?
  // answer: because radix conversion is frigging hard. this method is fast enough anyway. I can do 10k computations on
  //         my machine in 0.08s.
  var hash = crypto.createHash('md5').update(accountId).digest("hex");
  // now convert that into a number and modulo it to get a shard.
  return Math.abs(parseInt(hash.slice(0, 4), 16) % settings.MAX_SHARDS);
};
