//  Copyright (C) 2011 Matsukei Co.,Ltd.
//
//  This program is free software: you can redistribute it and/or modify
//  it under the terms of the GNU General Public License as published by
//  the Free Software Foundation, either version 3 of the License, or
//  (at your option) any later version.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
//
//  You should have received a copy of the GNU General Public License
//  along with this program.  If not, see <http://www.gnu.org/licenses/>.

goog.provide('thin.core.ImageOutline');

goog.require('thin.core.Rect');
goog.require('thin.core.ModuleOutline');


/**
 * @param {Element} element
 * @param {thin.core.Layout} layout
 * @param {goog.graphics.Stroke?} stroke
 * @param {goog.graphics.Fill?} fill
 * @constructor
 * @extends {thin.core.Rect}
 */
thin.core.ImageOutline = function(element, layout, stroke, fill) {
  thin.core.Rect.call(this, element, layout, stroke, fill);
  this.setRounded(Number(layout.getElementAttribute(element, 'rx')) || 0);
};
goog.inherits(thin.core.ImageOutline, thin.core.Rect);
goog.mixin(thin.core.ImageOutline.prototype, thin.core.ModuleOutline.prototype);


/**
 * @param {number} startPosX
 * @param {number} startPosY
 * @param {number} clientPosX
 * @param {number} clientPosY
 */
thin.core.ImageOutline.prototype.setBoundsByCoordinate = function(startPosX, startPosY, clientPosX, clientPosY) {
  this.setLeft(clientPosX);
  this.setTop(thin.numberWithPrecision(clientPosY - this.getHeight()));
};


/**
 * @param {goog.math.Coordinate} scale
 * @param {goog.math.Coordinate} transLate
 * @param {boolean} isVertex
 */
thin.core.ImageOutline.prototype.setBoundsByScale = function(scale, transLate, isVertex) {

  var scaleX = scale.x;
  var scaleY = scale.y;
  var deltaX = this.getLeft() - transLate.x;
  var deltaY = this.getTop() - transLate.y;
  var lateX = (deltaX * scaleX) - deltaX;
  var lateY = (deltaY * scaleY) - deltaY;
  
  var left = thin.numberWithPrecision(this.getLeft() + lateX);
  var top = thin.numberWithPrecision(this.getTop() + lateY);
  var width = thin.numberWithPrecision(this.getWidth() * scaleX);
  var height = thin.numberWithPrecision(this.getHeight() * scaleY);
  
  this.setLeft(left);
  this.setTop(top);
  
  if (isVertex) {
    var shape = this.getTargetShape();
    var allowSize = shape.getAllowSize(width, height, left, top,
                                       shape.getWidth(), shape.getHeight());
    this.setWidth(allowSize.width);
    this.setHeight(allowSize.height);
  } else {
    this.setWidth(width);
    this.setHeight(height);
  }
};


/**
 * @return {thin.core.ImageShape}
 */
thin.core.ImageOutline.prototype.toShape = function() {
  return this.getLayout().createImageShape();
};


/**
 * @return {Object}
 */
thin.core.ImageOutline.prototype.getInitShapeProperties = function() {
  return {
    POSITION: new goog.math.Coordinate(
        this.getLeft(),
        this.getTop())
  };
};


/** @inheritDoc */
thin.core.ImageOutline.prototype.disposeInternal = function() {
  thin.core.ImageOutline.superClass_.disposeInternal.call(this);
  this.disposeInternalForOutline();
};