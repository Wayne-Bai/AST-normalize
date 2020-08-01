/**
 * Tests amount of time spent on requiring class module
 *
 *  Copyright (C) 2010, 2011, 2013 Free Software Foundation, Inc.
 *
 *  This file is part of GNU ease.js.
 *
 *  ease.js is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

var common = require( __dirname + '/common.js' );

// we run this test once because require() will cache the object in memory
common.test( function()
{
    common.require( 'class' );
}, 1, 'Require class module' );

