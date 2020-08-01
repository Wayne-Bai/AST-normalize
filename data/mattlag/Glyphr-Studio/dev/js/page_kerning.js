 // start of file
/**
	Page > Kerning
	HTML and associated functions for this page.
**/


	function loadPage_kerning(){

		// debug("LOADING PAGE >> loadPage_kerning");
		getEditDocument().getElementById("mainwrapper").innerHTML = editPage_Content();

		setupKerningEditCanvas();

		initEventHandlers();

		_UI.selectedtool = "kern";

		redraw("loadPage_kerning");
	}

	function setupKerningEditCanvas(){
		_UI.glypheditcanvas = getEditDocument().getElementById("glypheditcanvas");
		_UI.glypheditcanvas.height = _UI.glypheditcanvassize;
		_UI.glypheditcanvas.width = _UI.glypheditcanvassize;
		_UI.glypheditctx = _UI.glypheditcanvas.getContext("2d");
		_UI.glypheditcanvas.onselectstart = function () { return false; };		//for Chrome, disable text select while dragging
		_UI.glypheditcanvas.onmouseout = mouseoutcec;
		_UI.glypheditcanvas.onmouseover = mouseovercec;
	}


//-------------------
// REDRAW
//-------------------
	function redraw_Kerning() {
		// debug('\n redraw_Kerning - START');
		// debug('\t kerning: ');
		// debug(_GP.kerning);
		_UI.redrawing = true;

		drawGrid();

		var selkern = getSelectedKern();
		// debug('\t selkern: ' + json(selkern));
		if(selkern){
			drawGuides();
			var ch;
			var ctx = _UI.glypheditctx;
			var v = getView();
			// debug('\t Kern Pair ' + selkern.leftgroup[0] + ' | ' + selkern.rightgroup[0]);

			// DRAW ALL RIGHT HAND GROUP
			for(var i=0; i<selkern.rightgroup.length; i++){
				ch = getGlyph(selkern.rightgroup[i], true);
				// debug('\t got rightgroup char ' + ch.name);
				ch.drawGlyph(ctx, v, true);
			}

			// DRAW ALL LEFT HAND GROUP
			for(var j=0; j<selkern.leftgroup.length; j++){
				v = getView();
				ch = getGlyph(selkern.leftgroup[j], true);
				// debug('\t got leftgroup char ' + ch.name);
				v.dx -= (ch.getTotalWidth()*v.dz);
				v.dx += (selkern.value*v.dz);
				ch.drawGlyph(ctx, v, true);
			}
		}

		_UI.redrawing = false;
		// debug(' redraw_Kerning - END\n');
	}

// end of file