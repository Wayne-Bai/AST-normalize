/*!
* Copyright 2010 - 2013 Pentaho Corporation.  All rights reserved.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*/

/**
 * Cross-platform base64 decoding.  btoa() is not supported on IE, and
 * doesn't handle UTF8
 *
 */

function base64Decode(encoded) {
  var indexTable = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  encoded = encoded.replace(/[^A-Za-z0-9\+\/\=]/g, "");
  var decoded = "", c1, c2, c3, e1, e2, e3, e4, i = 0;

  while(i < encoded.length){
    e1 = indexTable.indexOf(encoded.charAt(i++));
    e2 = indexTable.indexOf(encoded.charAt(i++));
    e3 = indexTable.indexOf(encoded.charAt(i++));
    e4 = indexTable.indexOf(encoded.charAt(i++));
    c1 = (e1 << 2) | (e2 >> 4);
    c2 = ((e2 & 15) << 4) | (e3 >> 2);
    c3 = ((e3 & 3) << 6) | e4;
    decoded = decoded + String.fromCharCode(c1);
    if (e3 !== 64) {
      decoded = decoded + String.fromCharCode(c2);
    }
    if (e4 !== 64) {
      decoded = decoded + String.fromCharCode(c3);
    }
  }
  return utf8Decode(decoded);
}

function utf8Decode(utftext) {
  var string = "";
  var i = 0;
  var c = c1 = c2 = 0;

  while ( i < utftext.length ) {
    c = utftext.charCodeAt(i);
    if (c < 128) {
      string += String.fromCharCode(c);
      i++;
    }
    else if((c > 191) && (c < 224)) {
      c2 = utftext.charCodeAt(i+1);
      string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
      i += 2;
    }
    else {
      c2 = utftext.charCodeAt(i+1);
      c3 = utftext.charCodeAt(i+2);
      string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
      i += 3;
    }
  }
  return string;
}
