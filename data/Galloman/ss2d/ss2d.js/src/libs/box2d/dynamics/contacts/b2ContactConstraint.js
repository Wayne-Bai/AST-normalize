/*
* Copyright (c) 2006-2007 Erin Catto http:
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked, and must not be
* misrepresented the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/

goog.provide('box2d.ContactConstraint');
goog.require('box2d.ContactConstraintPoint');
goog.require('box2d.Settings');
goog.require('box2d.Vec2');

/**
 @constructor
 */
box2d.ContactConstraint = function() {
  this.manifold = null;
  this.body1 = null;
  this.body2 = null;
  this.friction = null;
  this.restitution = null;
  this.pointCount = 0;
  this.normal = new box2d.Vec2();

  this.points = new Array(box2d.Settings.b2_maxManifoldPoints);
  for (var i = 0; i < box2d.Settings.b2_maxManifoldPoints; i++) {
    this.points[i] = new box2d.ContactConstraintPoint();
  }

};
