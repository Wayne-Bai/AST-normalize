! ✖ / env;
node - canvas;
"use strict";
var fs = require("fs");
var util = require("util");
var vg = require("openvg");
var eu = require("./util");
var Canvas = require("../lib/canvas");
var canvas = new Canvas(320, 320);
var ctx = canvas.getContext("2d");
function getX(angle)  {
   return - Math.sin(angle + Math.PI);
}
;
function getY(angle)  {
   return Math.cos(angle + Math.PI);
}
;
function clock(ctx)  {
   var now = new Date();
   var x, y, i;
   ctx.clearRect(0, 0, canvas.width, canvas.height);
   ctx.save();
   ctx.scale(3, 3);
   ctx.translate(canvas.width / 6, canvas.height / 6);
   ctx.beginPath();
   ctx.lineWidth = 14;
   ctx.strokeStyle = "#325FA2";
   ctx.fillStyle = "#eeeeee";
   ctx.arc(0, 0, 142, 0, Math.PI * 2, false);
   ctx.stroke();
   ctx.fill();
   ctx.strokeStyle = "#000000";
   ctx.beginPath();
   ctx.lineWidth = 8;
   for (i = 0; i < 12; i++)  {
         x = getX(Math.PI / 6 * i);
         y = getY(Math.PI / 6 * i);
         ctx.moveTo(x * 100, y * 100);
         ctx.lineTo(x * 125, y * 125);
      }
   ctx.stroke();
   ctx.lineWidth = 5;
   ctx.beginPath();
   for (i = 0; i < 60; i++)  {
         if (i % 5 !== 0)  {
            x = getX(Math.PI / 30 * i);
            y = getY(Math.PI / 30 * i);
            ctx.moveTo(x * 117, y * 117);
            ctx.lineTo(x * 125, y * 125);
         }
      }
   ctx.stroke();
   var sec = now.getSeconds();
   var min = now.getMinutes();
   var hr = now.getHours();
   hr = hr >= 12 ? hr - 12 : hr;
   ctx.fillStyle = "black";
   x = getX(hr * Math.PI / 6 + Math.PI / 360 * min + Math.PI / 21600 * sec);
   y = getY(hr * Math.PI / 6 + Math.PI / 360 * min + Math.PI / 21600 * sec);
   ctx.lineWidth = 14;
   ctx.beginPath();
   ctx.moveTo(x * - 20, y * - 20);
   ctx.lineTo(x * 80, y * 80);
   ctx.stroke();
   x = getX(Math.PI / 30 * min + Math.PI / 1800 * sec);
   y = getY(Math.PI / 30 * min + Math.PI / 1800 * sec);
   ctx.lineWidth = 10;
   ctx.beginPath();
   ctx.moveTo(x * - 28, y * - 28);
   ctx.lineTo(x * 112, y * 112);
   ctx.stroke();
   x = getX(sec * Math.PI / 30);
   y = getY(sec * Math.PI / 30);
   ctx.strokeStyle = "#D40000";
   ctx.fillStyle = "#D40000";
   ctx.lineWidth = 6;
   ctx.beginPath();
   ctx.moveTo(x * - 30, y * - 30);
   ctx.lineTo(x * 83, y * 83);
   ctx.stroke();
   ctx.beginPath();
   ctx.arc(0, 0, 10, 0, Math.PI * 2, false);
   ctx.fill();
   ctx.beginPath();
   ctx.arc(x * 95, y * 95, 10, 0, Math.PI * 2, false);
   ctx.stroke();
   ctx.fillStyle = "#555";
   ctx.arc(0, 0, 3, 0, Math.PI * 2, false);
   ctx.fill();
   ctx.restore();
}
;
eu.animate(function(time)  {
      clock(ctx);
   }
);
eu.handleTermination();
eu.waitForInput();
