/*
 *  Copyright (C) 2012-2013 CloudJee, Inc. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

dojo.provide("wm.base.widget.dijit.ColorPalette_design");
dojo.provide("wm.base.widget.dijit.ColorPalette");

wm.dijit.ColorPalette.description = "Select a color with the mouse.";

/* Michael Kantor March 2011: I don't think this is used anymore */
dojo.extend(wm.dijit.ColorPalette, {
	// getters / setters
	set_palette: function(inPalette) {
		this.dijit.palette = inPalette;
	}
});