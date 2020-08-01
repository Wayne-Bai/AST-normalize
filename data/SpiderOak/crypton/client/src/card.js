
/* Crypton Client, Copyright 2014 SpiderOak, Inc.
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

(function() {

'use strict';

/**!
 * # Card
 *
 * ````
 * var  = new crypton.Card();
 * ````
 */
var Card = crypton.Card = function Card () {};

/**!
 * ### createIdCard(fingerprint, username, appname, domId)
 *
 * returns canvas element
 *
 * @param {String} fingerprint
 * @param {String} username
 * @param {String} appname
 * @param {String} url [optional]
 *                 The application homepage
 * @param {String} domId [optional]
 */
Card.prototype.createIdCard =
  function (fingerprint, username, appname, url, domId) {
  if (!domId) {
    domId = 'id-card';
  }
  if (!url) {
    url = '';
  }

  var fingerArr = this.createFingerprintArr(fingerprint);
  var colorArr = this.createColorArr(fingerArr);

  var canvas = document.createElement('canvas');
  canvas.width = 420;
  canvas.height = 420;
  canvas.setAttribute('id', domId);

  var ctx = canvas.getContext("2d");
  var x = 5;
  var y = 5;
  var w = 50;
  var h = 50;

  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, 420, 420);
  ctx.fillStyle = "black";
  y = y + 20;
  ctx.font = "bold 24px sans-serif";
  ctx.fillText(username, x, y);

  y = y + 30;
  ctx.font = "bold 18px sans-serif";
  ctx.fillText(appname, x, y);

  y = y + 30;
  ctx.font = "bold 24px sans-serif";
  ctx.fillText('FINGERPRINT', x, y);
  ctx.font = "24px sans-serif";

  var i = 0;
  var line = '';

  for (var j = 0; j < fingerArr.length; j++) {
    if (i == 3) {
      line = line + fingerArr[j];
      y = (y + 25);
      ctx.fillText(line, x, y);
      i = 0;
      line = '';
    } else {
      line = line + fingerArr[j] + ' ';
      i++;
    }
  }

  y = y + 20;

  var identigridCanvas = this.createIdentigrid(colorArr);
  ctx.drawImage(identigridCanvas, x, y);

  var qrCodeCanvas = this.createQRCode(fingerArr, username, appname, url);
  ctx.drawImage(qrCodeCanvas, 210, 205);

  return canvas;
};

/**!
 * ### createQRCode(fingerprint, username, appname, url)
 *
 * returns canvas element
 *
 * @param {Array} fingerArr
 * @param {String} username
 * @param {String} appname
 * @param {String} url
 */
Card.prototype.createQRCode = function (fingerArr, username, appname, url) {

  // generate QRCode
  var qrData = this.generateQRCodeInput(fingerArr.join(" "), username, appname, url);
  var qrCanvas = document.createElement('canvas');
  qrCanvas.width = 200;
  qrCanvas.height = 200;

  new QRCode(qrCanvas,
             { text: qrData,
               width: 200,
               height: 200,
               colorDark : "#000000",
               colorLight : "#ffffff",
               correctLevel : QRCode.CorrectLevel.H
             });
  // XXXddahl: QRCode wraps the canvas in another one
  return qrCanvas.childNodes[0];
};

/**!
 * ### createIdentigrid(fingerprint, username, appname)
 *
 * returns canvas element
 *
 * @param {Array} colorArr
 */
Card.prototype.createIdentigrid = function (colorArr) {
  var canvas = document.createElement('canvas');
  canvas.width = 200;
  canvas.height = 200;
  var ctx = canvas.getContext('2d');
  var x = 0;
  var y = 0;
  var w = 50;
  var h = 50;

  for (var idx in colorArr) {
    ctx.fillStyle = colorArr[idx];
    ctx.fillRect(x, y , w, h);
    x = (x + 50);
    if (x == 200) {
      x = 0;
      y = (y + 50);
    }
  }

  return canvas;
};

/**!
 * ### createColorArr(fingerprint)
 *
 * returns Array
 *
 * @param {String} fingerArr
 */
Card.prototype.createColorArr = function (fingerArr) {
  // pad the value out to 6 digits:
  var count = 0;
  var paddingData = fingerArr.join('');
  var colorArr = [];
  var REQUIRED_LENGTH = 6;
  for (var idx in fingerArr) {
    var pad  = (REQUIRED_LENGTH - fingerArr[idx].length);
    if ( pad == 0) {
      colorArr.push('#' + fingerArr[idx]);
    } else {
      var color = '#' + fingerArr[idx];
      for (var i = 0; i < pad; i++) {
        color = color + paddingData[count];
        count++;
      }
      colorArr.push(color);
    }
  }
  return colorArr;
};

/**!
 * ### createFingerprintArr(fingerprint)
 *
 * returns Array
 *
 * @param {String} fingerprint
 */
Card.prototype.createFingerprintArr = function (fingerprint) {
  if (fingerprint.length != 64) {
    var err = 'Fingerprint has incorrect length';
    console.error(err);
    throw new Error(err);
  }
  fingerprint = fingerprint.toUpperCase();
  var fingerArr = [];
  var i = 0;
  var segment = '';
  for (var chr in fingerprint) {
    segment = segment + fingerprint[chr];
    i++;
    if (i == 4) {
      fingerArr.push(segment);
      i = 0;
      segment = '';
      continue;
    }
  }
  return fingerArr;
};

/**!
 * ### generateQRCodeInput(fingerprint, username, application, url)
 *
 * returns Array
 *
 * @param {String} fingerprint
 */
Card.prototype.generateQRCodeInput = function (fingerprint, username, application, url) {
  if (!url) {
    url = '';
  }
  var json = JSON.stringify({ fingerprint: fingerprint, username: username,
                              application: application, url: url });
  return json;
};


}());
