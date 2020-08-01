// start of file
/**
	Object > Path
	A Path is a collection of Path Points, plus 
	a few properties like selected point, winding, 
	and maxes.
	Higher level objects should only have access to 
	a Shape object, not direct access to a Shape's 
	Path object. This is to enable Shape objects and 
	Component Instance objects to be used
	interchangeably, even though Component Instance
	objects don't have a Path.
**/

	function Path(oa){
		// debug('\n PATH - START');
		this.objtype = 'path';

		// declare attributes
		this.pathpoints = false;
		if(oa.pathpoints && oa.pathpoints.length){
			this.pathpoints = [];
			//debug('NEW PATH : Hydrating Path Points, length ' + oa.pathpoints.length);
			for (var i = 0; i < oa.pathpoints.length; i++) {
				this.pathpoints[i] = new PathPoint(oa.pathpoints[i]);
			}
		}
		this.winding = isval(oa.winding)? oa.winding : this.findWinding();
		// internal
		this.maxes = oa.maxes || clone(_UI.mins);

		// Setup the object
		this.selectPathPoint(false);
		if(this.pathpoints) this.calcMaxes();

		// debug(' PATH - END\n');
	}



//  -----------------------------------
//  SIZE AND POSSITION
//  -----------------------------------

	Path.prototype.setPathSize = function(nw, nh, ratiolock){
		if(nw !== false) nw = parseFloat(nw);
		if(nh !== false) nh = parseFloat(nh);
		var dw = nw? (nw - this.getWidth()) : 0;
		var dh = nh? (nh - this.getHeight()) : 0;
		this.updatePathSize(dw, dh, ratiolock);
	};

	Path.prototype.updatePathSize = function(dw, dh, ratiolock){
		//debug('UPDATEPATHSIZE - dw,dh,rl\t'+dw+' , '+dh+' , '+ratiolock);

		var s = ss('updatePathSize') || {'wlock':false, 'hlock':false};
		dw = s.wlock? 0 : parseFloat(dw) || 0;
		dh = s.hlock? 0 : parseFloat(dh) || 0;

		if(s.wlock && s.hlock) return;

		// Lock Aspect Ratio
		if(!s.wlock && !s.hlock && ratiolock){
			if(dw !== dh){
				var ratio = this.getWidth() / this.getHeight();
				if(Math.abs(dw) > Math.abs(dh)){
					dh = dw / ratio;
				} else {
					dw = dh * ratio;
				}
			}
		}

		var oldw = this.getWidth();
		var oldh = this.getHeight();
		var neww = Math.max((oldw + dw), 1);
		var newh = Math.max((oldh + dh), 1);
		var ratiodh = (newh/oldh);
		var ratiodw = (neww/oldw);


		for(var e=0; e<this.pathpoints.length; e++){
			var pp = this.pathpoints[e];
			pp.P.x =   (((pp.P.x  - this.maxes.xmin) * ratiodw) + this.maxes.xmin);
			pp.H1.x =  (((pp.H1.x - this.maxes.xmin) * ratiodw) + this.maxes.xmin);
			pp.H2.x =  (((pp.H2.x - this.maxes.xmin) * ratiodw) + this.maxes.xmin);
			pp.P.y =   (((pp.P.y  - this.maxes.ymin) * ratiodh) + this.maxes.ymin);
			pp.H1.y =  (((pp.H1.y - this.maxes.ymin) * ratiodh) + this.maxes.ymin);
			pp.H2.y =  (((pp.H2.y - this.maxes.ymin) * ratiodh) + this.maxes.ymin);
		}

		this.calcMaxes();
	};

	Path.prototype.setPathPosition = function(nx, ny, force){
		//debug('SETPATHPOSITION - nx/ny/force:\t ' + nx + '\t ' + ny + '\t ' + force);
		//debug('SETPATHPOSITION - this.maxes.ymax: ' + this.maxes.ymax);
		if(nx !== false) nx = parseFloat(nx);
		if(ny !== false) ny = parseFloat(ny);
		var dx = nx? ((nx*1) - this.maxes.xmin) : 0;
		var dy = ny? ((ny*1) - this.maxes.ymax) : 0;
		//debug('SETPATHPOSITION - dx/dy: ' + dx + ' ' + dy);
		this.updatePathPosition(dx,dy,force);
	};

	Path.prototype.updatePathPosition = function(dx, dy, force){
		force = isval(force)? force : false;
		if(dx !== false) dx = parseFloat(dx);
		if(dy !== false) dy = parseFloat(dy);
		//debug('UPDATEPATHPOSITION - dx,dy,f\t'+dx+' , '+dy+' , '+force);

		for(var d=0; d<this.pathpoints.length; d++){
			var pp = this.pathpoints[d];
			//debug('-------------------- pathPoint #' + d);
			pp.updatePathPointPosition('P',dx,dy,force);
		}

		this.calcMaxes();
	};

	Path.prototype.getHeight = function() {
		var h = this.maxes.ymax - this.maxes.ymin;
		return Math.max(h, 0);
	};

	Path.prototype.getWidth = function() {
		var w = this.maxes.xmax - this.maxes.xmin;
		return Math.max(w, 0);
	};

	Path.prototype.getMaxes = function() {
		return clone(this.maxes);
	};


//  -----------------------------------
//  GET ATTRIBUTES
//  -----------------------------------

	// Selected Point - returns the selected point object
	Path.prototype.sp = function(wantindex, calledby){
		//debug('SP - Called By : ' + calledby);

		if(!this.pathpoints) {
			//debug('SP - returning false, this.pathpoints = ' + JSON.stringify(this.pathpoints));
			return false;
		}

		for(var p=0; p<this.pathpoints.length; p++){
			var thisp = this.pathpoints[p];
			if(thisp.selected){
				if(wantindex){
					return p;
				} else {
					return thisp;
				}
			}
		}

		return false;
	};



//  -----------------------------------
//  DRAWING
//  -----------------------------------

	Path.prototype.drawPath = function(lctx, view) {
		//if(lctx == _UI.glypheditctx)	debug('DRAWPATH');

		var currview = getView('Path.drawPath');
		view = view || clone(currview);
		setView(view);

		if(this.pathpoints === false || this.pathpoints.length < 2) return;
		var pp, np, pph2x, pph2y, nxh1x, nxh1y, nxppx, nxppy;

		lctx.moveTo(sx_cx(this.pathpoints[0].P.x), sy_cy(this.pathpoints[0].P.y));

		for(var cp = 0; cp < this.pathpoints.length; cp++){
			pp = this.pathpoints[cp];
			np = this.pathpoints[(cp+1) % this.pathpoints.length];

			if(pp.type === 'symmetric') { pp.makeSymmetric('H1'); }
			else if (pp.type === 'flat') { pp.makeFlat('H1'); }

			// this.validate('DRAW PATH');

			pph2x = sx_cx(pp.getH2x());
			pph2y = sy_cy(pp.getH2y());
			nxh1x = sx_cx(np.getH1x());
			nxh1y = sy_cy(np.getH1y());
			nxppx = sx_cx(np.P.x);
			nxppy = sy_cy(np.P.y);

			//if(lctx == _UI.glypheditctx)	debug('  curve ' + pph2x +' '+ pph2y +' '+ nxh1x +' '+ nxh1y +' '+ nxppx +' '+ nxppy);
			lctx.bezierCurveTo(pph2x, pph2y, nxh1x, nxh1y, nxppx, nxppy);
		}

		setView(currview);
	};


//  -----------------------------------
//  TRANSLATE TO OTHER LANGUAGES
//  -----------------------------------

	Path.prototype.genPathPostScript = function(lastx, lasty){
		if(!this.pathpoints) return {'re':'', 'lastx':lastx, 'lasty':lasty};

		var p1, p2, p1h2x, p1h2y, p2h1x, p2h1y, p2ppx, p2ppy;
		var trr = '';

		var re = '\t\t\t\t' + (this.pathpoints[0].P.x - lastx) + ' ' + (this.pathpoints[0].P.y - lasty) + ' rmoveto \n';

		//debug('GENPATHPOSTSCRIPT:\n\t ' + re);

		for(var cp = 0; cp < this.pathpoints.length; cp++){
			p1 = this.pathpoints[cp];
			p2 = this.pathpoints[(cp+1) % this.pathpoints.length];

			p1h2x = p1.getH2x() - p1.P.x;
			p1h2y = p1.getH2y() - p1.P.y;
			p2h1x = p2.getH1x() - p1.getH2x();
			p2h1y = p2.getH1y() - p1.getH2y();
			p2ppx = p2.P.x - p2.getH1x();
			p2ppy = p2.P.y - p2.getH1y();

			trr = '\t\t\t\t' + p1h2x + ' ' + p1h2y + ' ' + p2h1x + ' ' + p2h1y + ' ' + p2ppx + ' ' + p2ppy + ' rrcurveto \n';

			//debug('\t ' + trr);

			re += trr;
		}

		return {
			're' : re,
			'lastx' : p2.P.x,
			'lasty' : p2.P.y
		};
	};

	Path.prototype.makeSVGpathData = function(glyphname) {
		glyphname = glyphname || 'not specified';
		// debug('\n Path.makeSVGpathData - START');
		// debug('\t Glyph ' + glyphname);
		// debug('\t this.pathpoints: ' + json(this.pathpoints, true));

		if(!this.pathpoints) return '';

		re = '';
		var p1, p2;
		var trr = '';

		re += 'M' + (this.pathpoints[0].P.x) + ',' + (this.pathpoints[0].P.y);
		// debug('GENPATHPOSTSCRIPT:\n\t ' + re);

		for(var cp = 0; cp < this.pathpoints.length; cp++){
			p1 = this.pathpoints[cp];
			p2 = this.pathpoints[(cp+1) % this.pathpoints.length];
			trr = ' C' + round(p1.getH2x(), 9) + ',' + round(p1.getH2y(), 9) + ',' + round(p2.getH1x(), 9) + ',' + round(p2.getH1y(), 9) + ',' + round(p2.P.x, 9) + ',' + round(p2.P.y, 9);
			// debug('\t ' + trr);

			if(trr.indexOf('NaN') > -1){
				console.warn(glyphname + ' PathPoint ' + cp + ' has NaN: ' + trr);
			}
			re += trr;
		}

		re += 'Z';
		// debug('\t returning: ' + re);
		// debug('Path.makeSVGpathData - END\n');
		return re;
	};

	Path.prototype.makeOpenTypeJSpath = function(re) {
		// debug('\n Path.makeOpenTypeJSpath - START');
		// debug('\t re: ' + json(re));

		re = re || new opentype.Path();
		var p1, p2;

		if(!this.pathpoints) {
			re.close();
			return re;
		}

		re.moveTo(round(this.pathpoints[0].P.x), round(this.pathpoints[0].P.y));

		for(var cp = 0; cp < this.pathpoints.length; cp++){
			p1 = this.pathpoints[cp];
			p2 = this.pathpoints[(cp+1) % this.pathpoints.length];
			re.curveTo(
				round(p1.getH2x()),
				round(p1.getH2y()),
				round(p2.getH1x()),
				round(p2.getH1y()),
				round(p2.P.x),
				round(p2.P.y)
			);
		}

		re.close();

		// debug('\t returning path ' + json(re));
		// debug(' Path.makeOpenTypeJSpath - END\n');
		return re;
	};



//  -----------------------------------
//  CANVAS HELPER FUNCTIONS
//  -----------------------------------

	Path.prototype.isOverControlPoint = function(x, y, dontselect){
		var a = this.pathpoints;
		a = a || [];
		var hp = _GP.projectsettings.pointsize/getView('Path.isOverControlPoint').dz;

		for(var k=a.length-1; k>=0; k--){
			if( ((a[k].P.x+hp) > x) && ((a[k].P.x-hp) < x) && ((a[k].P.y+hp) > y) && ((a[k].P.y-hp) < y) ){
				if(!dontselect) this.selectPathPoint(k);
				//debug('ISOVERCONTROLPOINT() - Returning P1, selectedpoint: ' + k);
				return 'P';
			}

			if(a[k].useh1){
				if( ((a[k].H1.x+hp) > x) && ((a[k].H1.x-hp) < x) && ((a[k].H1.y+hp) > y) && ((a[k].H1.y-hp) < y) ){
					if(!dontselect) this.selectPathPoint(k);
					//debug('ISOVERCONTROLPOINT() - Returning H1, selectedpoint: ' + k);
					return 'H1';
				}
			}

			if(a[k].useh2){
				if( ((a[k].H2.x+hp) > x) && ((a[k].H2.x-hp) < x) && ((a[k].H2.y+hp) > y) && ((a[k].H2.y-hp) < y) ){
					if(!dontselect) this.selectPathPoint(k);
					//debug('ISOVERCONTROLPOINT() - Returning H2, selectedpoint: ' + k);
					return 'H2';
				}
			}
		}

		if(!dontselect) this.selectPathPoint(0);
		//debug('ISOVERCONTROLPOINT() - Returning FALSE');
		return false;
	};

	Path.prototype.findWinding = function(){
		// debug('\n Path.findWinding - START');
		var j,k,z;
		var count = 0;
		var parr = this.pathpoints;

		if (parr.length < 3) return 0;

		for (var i=0; i<parr.length; i++) {
			j = (i + 1) % parr.length;
			k = (i + 2) % parr.length;
			z  = (parr[j].P.x - parr[i].P.x) * (parr[k].P.y - parr[j].P.y);
			z -= (parr[j].P.y - parr[i].P.y) * (parr[k].P.x - parr[j].P.x);

			if (z < 0) count--;
			else if (z > 0) count++;
		}

		// negative = clockwise
		// positive = counterclockwise

		// debug(' Path.findWinding - END returning: ' + count + '\n');
		return count;
	};

	Path.prototype.reverseWinding = function(){
		// debug('\n Path.reverseWinding - START');
		var HT,pp;
		if(this.pathpoints){
			for (var i = 0; i < this.pathpoints.length; i++) {
				pp = this.pathpoints[i];
				HT = pp.H1;
				pp.H1 = pp.H2;
				pp.H2 = HT;
				if(pp.useh1 !== pp.useh2){
					pp.useh1 = !pp.useh1;
					pp.useh2 = !pp.useh2;
				}
			}
			this.pathpoints.reverse();
			this.winding = this.findWinding();
		}
		// debug(' Path.reverseWinding - END\n');
	};

	Path.prototype.flipNS = function(){
		var ly = this.maxes.ymax;

		var mid = (this.getHeight()/2)+this.maxes.ymin;
		//debug('FLIPNS - calculating mid: (b-t)/2 + t = mid: ' + this.maxes.ymin +','+ this.maxes.ymax + ','+ mid);

		for(var e=0; e<this.pathpoints.length; e++){
			var pp = this.pathpoints[e];
			pp.P.y += ((mid-pp.P.y)*2);
			pp.H1.y += ((mid-pp.H1.y)*2);
			pp.H2.y += ((mid-pp.H2.y)*2);
		}

		this.setPathPosition(false, ly);
		this.reverseWinding();
	};

	Path.prototype.flipEW = function(){
		var lx = this.maxes.xmin;

		var mid = (this.getWidth()/2)+this.maxes.xmin;
		//debug('flipEW - calculating mid: (b-t)/2 + t = mid: ' + this.maxes.xmax +','+ this.maxes.xmin +','+ mid);

		for(var e=0; e<this.pathpoints.length; e++){
			var pp = this.pathpoints[e];
			pp.P.x += ((mid-pp.P.x)*2);
			pp.H1.x += ((mid-pp.H1.x)*2);
			pp.H2.x += ((mid-pp.H2.x)*2);
		}

		this.setPathPosition(lx, false);
		this.reverseWinding();
	};

	Path.prototype.addPathPoint = function(newpp, addtostart){
		//debug('ADDPATHPOINT - new point? ' + newpp);

		if(!newpp) {
			// No pathpoint passed to function - make a new one
			newpp = new PathPoint({});

			if(addtostart){
				//Adds new pathpoint to start of path
				if(this.pathpoints.length > 0){
					var firstpp = this.pathpoints[0];

					newpp.P.x = firstpp.P.x-200;
					newpp.P.y = firstpp.P.y-200;
					newpp.H1.x = newpp.P.x;
					newpp.H1.y = newpp.P.y-100;
					newpp.H2.x = newpp.P.x+100;
					newpp.H2.y = newpp.P.y;
				}

				this.pathpoints.unshift(newpp);
				this.selectPathPoint(0);
			} else {
				// Adds new pathpoint to end of path
				if(this.pathpoints.length > 0){
					var lastpp = this.pathpoints[this.pathpoints.length-1];

					newpp.P.x = lastpp.P.x+200;
					newpp.P.y = lastpp.P.y+200;
					newpp.H1.x = newpp.P.x;
					newpp.H1.y = newpp.P.y-100;
					newpp.H2.x = newpp.P.x+100;
					newpp.H2.y = newpp.P.y;
				}

				this.pathpoints.push(newpp);
				this.selectPathPoint(this.pathpoints.length-1);
			}
		} else {
			// Function was passed a new path point
			this.pathpoints.push(newpp);
			this.selectPathPoint(this.pathpoints.length-1);
		}

		this.calcMaxes();
	};

	Path.prototype.insertPathPoint = function(split, pointnum) {
		/*
			Input Bézier curve defined by P0, P1, P2, P3

			P0_1 = (1-t)*P0 + t*P1
			P1_2 = (1-t)*P1 + t*P2
			P2_3 = (1-t)*P2 + t*P3

			P01_12 = (1-t)*P0_1 + t*P1_2
			P12_23 = (1-t)*P1_2 + t*P2_3

			P0112_1223 = (1-t)*P01_12 + t*P12_23

			First Bézier will be defined by: P_0, P0_1, P01_12, P0112_1223; 
			Second Bézier is defined by: P0112_1223, P12_23, P2_3, P3.

			Diagrams here:
			http://antigrain.com/research/adaptive_bezier/index.html
		*/

		var pp1i = pointnum || this.sp(true, 'insert path point');
		var pp1 = (pp1i === false ? this.pathpoints[0] : this.pathpoints[pp1i]);
		var pp2i = (pp1i+1)%this.pathpoints.length;
		var pp2 = this.pathpoints[pp2i];
		var nP, nH1, nH2, ppn;
		var fs = split || 0.5;
		var rs = (1-fs);

		if(this.pathpoints.length > 1){
			// Do some math
			var x12 = (pp1.P.x * rs) + (pp1.getH2x() * fs);
			var y12 = (pp1.P.y * rs) + (pp1.getH2y() * fs);

			var x23 = (pp1.getH2x() * rs) + (pp2.getH1x() * fs);
			var y23 = (pp1.getH2y() * rs) + (pp2.getH1y() * fs);

			var x34 = (pp2.getH1x() * rs) + (pp2.P.x * fs);
			var y34 = (pp2.getH1y() * rs) + (pp2.P.y * fs);

			var x123 = (x12 * rs) + (x23 * fs);
			var y123 = (y12 * rs) + (y23 * fs);

			var x234 = (x23 * rs) + (x34 * fs);
			var y234 = (y23 * rs) + (y34 * fs);

			var x1234 = (x123 * rs) + (x234 * fs);
			var y1234 = (y123 * rs) + (y234 * fs);

			// New Point
			nP = new Coord({'x':x1234, 'y':y1234});
			nH1 = new Coord({'x':x123, 'y':y123});
			nH2 = new Coord({'x':x234, 'y':y234});
			ppn = new PathPoint({'P':nP, 'H1':nH1, 'H2':nH2, 'type':'flat', 'useh1':true, 'useh2':true});

			// Update P1
			if(pp1.type === 'symmetric') pp1.type = 'flat';
			pp1.H2.x = x12;
			pp1.H2.y = y12;

			// Update P2
			if(pp2.type === 'symmetric') pp2.type = 'flat';
			pp2.H1.x = x34;
			pp2.H1.y = y34;
		} else {
			//just make a random point
			var d = 100;
			nP = new Coord({'x':pp1.P.x+d, 'y':pp1.P.y+d});
			nH1 = new Coord({'x':pp1.getH2x()+d, 'y':pp1.getH2y()+d});
			nH2 = new Coord({'x':pp1.getH1x()+d, 'y':pp1.getH1y()+d});
			ppn = new PathPoint({'P':nP, 'H1':nH1, 'H2':nH2, 'type':pp1.type});
		}

		// Insert
		this.pathpoints.splice(pp2i, 0, ppn);
		this.selectPathPoint(pp2i);

		this.calcMaxes();
	};

	Path.prototype.getClosestPointOnCurve = function(coord) {
		var grains = 1000;
		var result = false;
		var mindistance = 999999999;
		var check, d;

		for(var pp=0; pp<this.pathpoints.length; pp++){
			for(var t=0; t<1; t+=(1/grains)){
				check = this.getCoordFromSplit(t, pp);
				d = Math.sqrt( ((check.x-coord.x)*(check.x-coord.x)) + ((check.y-coord.y)*(check.y-coord.y)) );
				if(d < mindistance){
					mindistance = d;
					result = {
						'point' : pp,
						'split' : t,
						'distance' : d,
						'x' : check.x,
						'y' : check.y
					};
				}
			}
		}

		return result;
	};

	Path.prototype.getCoordFromSplit = function(split, pointnum) {
		if(this.pathpoints.length > 1){
			var pp1 = this.pathpoints[pointnum];
			var pp2 = this.pathpoints[(pointnum+1)%this.pathpoints.length];
			var fs = split || 0.5;
			var rs = (1-fs);

			// Do some math
			var x12 = (pp1.P.x * rs) + (pp1.getH2x() * fs);
			var y12 = (pp1.P.y * rs) + (pp1.getH2y() * fs);

			var x23 = (pp1.getH2x() * rs) + (pp2.getH1x() * fs);
			var y23 = (pp1.getH2y() * rs) + (pp2.getH1y() * fs);

			var x34 = (pp2.getH1x() * rs) + (pp2.P.x * fs);
			var y34 = (pp2.getH1y() * rs) + (pp2.P.y * fs);

			var x123 = (x12 * rs) + (x23 * fs);
			var y123 = (y12 * rs) + (y23 * fs);

			var x234 = (x23 * rs) + (x34 * fs);
			var y234 = (y23 * rs) + (y34 * fs);

			var x1234 = (x123 * rs) + (x234 * fs);
			var y1234 = (y123 * rs) + (y234 * fs);

			return {'x':x1234, 'y':y1234};
		} else {
			return this.pathpoints[0].P;
		}
	};

	Path.prototype.deletePathPoint = function(){
		var pp = this.pathpoints;

		if(pp.length > 1){
			for(var j=0; j<pp.length; j++){
				if(pp[j].selected){
					pp.splice(j, 1);
					if(j>0) {
						pp[j-1].selected = true;
					} else {
						pp[0].selected = true;
					}
				}
			}
			this.calcMaxes();
		} else {
			_UI.selectedtool = 'pathedit';
			deleteShape();
		}
	};

	Path.prototype.selectPathPoint = function(index){
		// FOR NOW, ONLY ONE POINT SELECTED
		//debug('SELECTPATHPOINT - passed ' + index + ' length ' + this.pathpoints.length + ' mod ' +(index%this.pathpoints.length));
		for(var j=0; j<this.pathpoints.length; j++){
			this.pathpoints[j].selected = false;
		}

		if(index === false){
			return;
		} else {
			index = (index === -1)? (this.pathpoints.length-1) : Math.abs(index);
			this.pathpoints[index%this.pathpoints.length].selected = true;
			//debug('SELECTPATHPOINT - selecting point ' + index%this.pathpoints.length));
		}
	};



//	----------------------------------
//	Calc Maxes 
//	----------------------------------

	Path.prototype.calcMaxes = function(){
		this.maxes.ymax = (_UI.glypheditcanvassize*-1);
		this.maxes.ymin = _UI.glypheditcanvassize;
		this.maxes.xmin = _UI.glypheditcanvassize;
		this.maxes.xmax = (_UI.glypheditcanvassize*-1);

		var pp1, pp2, tbounds;

		for(var s=0; s<this.pathpoints.length; s++){
			pp1 = this.pathpoints[s];
			pp2 = this.pathpoints[(s+1)%this.pathpoints.length];

			tbounds = getBounds(pp1.P.x, pp1.P.y, pp1.getH2x(), pp1.getH2y(), pp2.getH1x(), pp2.getH1y(), pp2.P.x, pp2.P.y);

			this.maxes.xmax = Math.max(this.maxes.xmax, tbounds.maxx);
			this.maxes.ymax = Math.max(this.maxes.ymax, tbounds.maxy);
			this.maxes.xmin = Math.min(this.maxes.xmin, tbounds.minx);
			this.maxes.ymin = Math.min(this.maxes.ymin, tbounds.miny);
		}
	};

	function getBounds(x1, y1, cx1, cy1, cx2, cy2, x2, y2){
		var bounds = {
			'minx' : Math.min(x1,x2),
			'miny' : Math.min(y1,y2),
			'maxx' : Math.max(x1,x2),
			'maxy' : Math.max(y1,y2)
		};

		var dcx0 = cx1 - x1;
		var dcy0 = cy1 - y1;
		var dcx1 = cx2 - cx1;
		var dcy1 = cy2 - cy1;
		var dcx2 = x2 - cx2;
		var dcy2 = y2 - cy2;

		var numerator, denominator, quadroot, root, t1, t2;

		if(cx1<bounds.minx || cx1>bounds.maxx || cx2<bounds.minx || cx2>bounds.maxx) {
			// X bounds
			if(dcx0+dcx2 !== 2*dcx1) { dcx1+=0.01; }
			numerator = 2*(dcx0 - dcx1);
			denominator = 2*(dcx0 - 2*dcx1 + dcx2);
			quadroot = (2*dcx1-2*dcx0)*(2*dcx1-2*dcx0) - 2*dcx0*denominator;
			root = Math.sqrt(quadroot);
			t1 =  (numerator + root) / denominator;
			t2 =  (numerator - root) / denominator;
			if(0<t1 && t1<1) { checkXbounds(bounds, getBezierValue(t1, x1, cx1, cx2, x2)); }
			if(0<t2 && t2<1) { checkXbounds(bounds, getBezierValue(t2, x1, cx1, cx2, x2)); }
		}

		// Y bounds
		if(cy1<bounds.miny || cy1>bounds.maxy || cy2<bounds.miny || cy2>bounds.maxy) {
			if(dcy0+dcy2 !== 2*dcy1) { dcy1+=0.01; }
			numerator = 2*(dcy0 - dcy1);
			denominator = 2*(dcy0 - 2*dcy1 + dcy2);
			quadroot = (2*dcy1-2*dcy0)*(2*dcy1-2*dcy0) - 2*dcy0*denominator;
			root = Math.sqrt(quadroot);
			t1 =  (numerator + root) / denominator;
			t2 =  (numerator - root) / denominator;
			if(0<t1 && t1<1) { checkYbounds(bounds, getBezierValue(t1, y1, cy1, cy2, y2)); }
			if(0<t2 && t2<1) { checkYbounds(bounds, getBezierValue(t2, y1, cy1, cy2, y2)); }
		}

		return bounds;
	}

	function checkXbounds(bounds, value) {
		if(bounds.minx > value) { bounds.minx = value; }
		else if(bounds.maxx < value) { bounds.maxx = value; }
	}

	function checkYbounds(bounds, value) {
		if(bounds.miny > value) { bounds.miny = value; }
		else if(bounds.maxy < value) { bounds.maxy = value; }
	}

	function getBezierValue(t, p0, p1, p2, p3) {
		var mt = (1-t);
		return (mt*mt*mt*p0) + (3*mt*mt*t*p1) + (3*mt*t*t*p2) + (t*t*t*p3);
	}

	


//  -----------------------------------
//  HELPER FUNCTIONS
//  -----------------------------------

	Path.prototype.validate = function(calledby){
		var tp;
		for(var pp=0; pp<this.pathpoints.length; pp++){
			tp = this.pathpoints[pp];
			if(!tp.P.x && tp.P.x !== 0){
				//debug('VALIDATE PATH: '+calledby+' - resetting point '+pp+' P.x from ' + tp.P.x);
				tp.P.x = 0;
			}
			if(!tp.P.y && tp.P.y !== 0){
				//debug('VALIDATE PATH: '+calledby+' - resetting point '+pp+' P.y from ' + tp.P.y);
				tp.P.y = 0;
			}
			if(!tp.H1.x && tp.H1.x !== 0){
				//debug('VALIDATE PATH: '+calledby+' - resetting point '+pp+' H1.x from ' + tp.H1.x);
				tp.H1.x = 0;
			}
			if(!tp.H1.y && tp.H1.y !== 0){
				//debug('VALIDATE PATH: '+calledby+' - resetting point '+pp+' H1.y from ' + tp.H1.y);
				tp.H1.y = 0;
			}
			if(!tp.H2.x && tp.H2.x !== 0){
				//debug('VALIDATE PATH: '+calledby+' - resetting point '+pp+' H2.x from ' + tp.H2.x);
				tp.H2.x = 0;
			}
			if(!tp.H2.y && tp.H2.y !== 0){
				//debug('VALIDATE PATH: '+calledby+' - resetting point '+pp+' H2.y from ' + tp.H2.y);
				tp.H2.y = 0;
			}

			tp.roundAll();
		}
	};

// end of file