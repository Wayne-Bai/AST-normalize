(function(window, $, undefined) {
	"use strict";

	var KeySet = function(format, font) {
		if (format !== 'svg') {
			throw 'Unsupported rendering output format';
		}
		this.font = font;
	};
	KeySet.prototype = {
		render: function(text, height) {
			var glyphIds = this.font.getTextAsGlyphIds(text),
			xOffset = 0,
			output = '',
			maxY = 0;
			for (var i in glyphIds) {
				var hmtx = this.font.getHmtxForChar(glyphIds[i]);
				var kern = this.font.getKernForPair(glyphIds[i-1],glyphIds[i]);
				var glyph = this.font.glyf.glyphs[glyphIds[i]];
				var wrapped = '';
				try {
					if (glyph) {
						var path = getGlyphAsSVGPath(glyph);
						wrapped = '<g transform="translate('+(xOffset + Math.max(hmtx.leftSideBearing, 0) + kern)+', 0)">\n'+path+'\n</g>';
					}
				} catch (e) {
					console.log('error rendering "'+text[i]+'": '+e);
				}
				output += wrapped;
				xOffset += (hmtx.advanceWidth + kern);
			}
			output += '\n<line x1="0" y1="0" x2="'+xOffset+'" y2="0" style="stroke-width: 10; stroke: red;"/>';
			var actualHeight = this.font.hhea.ascender - this.font.hhea.descender;
			var wholeWord = '<g transform="translate(0,'+this.font.hhea.ascender+') scale(1,-1)">\n'+output+'\n</g>';
			var svg = '<svg height="'+height+'px" viewBox="0 '+this.font.hhea.descender+' '+xOffset+' '+
			(actualHeight-this.font.hhea.descender)+'" xmlns="http://www.w3.org/2000/svg" version="1.1">\n'+wholeWord +
			'\n</svg>';
			return svg;
		}
	};

	var cache = {};
	function getGlyphAsSVGPath(glyph) {
		var bb = glyph.boundingBox;
		var svg = '<path d="';

		var segments = glyph.getSegmentedPoints();
		var xcoords = segments.xcoords, 
		ycoords = segments.ycoords, 
		flags = segments.flags;
		for (var i = 0; i < glyph.getContourCount(); i++) {
			for (var k = 0; k < flags[i].length; k++) {
				if (k === 0) {
					svg += " M"+xcoords[i][k]+','+ycoords[i][k];
				} else if (flags[i][k] & 0x01) {
					svg += " L"+xcoords[i][k]+','+ycoords[i][k];
				} else {
					if (flags[i][k+1] & 0x01 || k === flags[i].length-2) {
						svg += " Q"+xcoords[i][k]+','+ycoords[i][k];
						svg += " "+xcoords[i][k+1]+','+ycoords[i][k+1];
						k++;
					} else if (k < flags[i].length-2){
						console.log('TODO: handle higher than n=3 b-splines');
						svg += " C"+xcoords[i][k]+','+ycoords[i][k];
						svg += " "+xcoords[i][k+1]+','+ycoords[i][k+1];
						svg += " "+xcoords[i][k+2]+','+ycoords[i][k+2];
						k += 2;
					}
				}
			}
		}
		svg += '"/>';
		return svg;
	}


	function _StreamReader(arrayBuffer, offset) {
		var i = offset || 0;
		var view = new window.DataView(arrayBuffer, i);
		// TODO: bounds checking
		this.getInt8 = function() { return view.getInt8(i++); };
		this.getUint8 = function() { return view.getUint8(i++); };
		this.getInt16 = function() { return i+= 2,view.getInt16(i-2); };
		this.getUint16 = function() { return i+= 2,view.getUint16(i-2); };
		this.getInt32 = function() { return i += 4, view.getInt32(i-4); };
		this.getUint32 = function() { return i += 4, view.getUint32(i-4); };
		this.getFloat32 = function() { return i += 4, view.getFloat32(i-4); };
		this.getInt64 = function() { this.getInt32() << 32 | this.getInt32(); }; //TODO: this is bollocks
		this.backup = function(bytes) { i -= bytes; };
		this.offset = function() { return i; };
		this.goto = function(l) { i = Math.max(l,0); };

		this.readString = function(count) {
			var str = this.getStringAt(i, count);
			i += count;
			return str;
		};
		this.getStringAt = function(start, len) {
			var str = '';
			for (var k = 0; k < len; k++) {
				str += String.fromCharCode(view.getInt8(start+k));
			}
			return str;
		};
		this.get32Fixed = function() {
			var ret = 0.0;
			ret = this.getInt16();
			ret += (this.getInt16()/65536);
			return ret;
		};
		this.getUint8Array = function(len) { 
			var ret = [];
			for (var i = 0; i < len; i++) {
				ret[i] = this.getUint8();
			} 
			return ret;
		};
		this.getUint16Array = function(len) { 
			var ret = [];
			for (var i = 0; i < len; i++) {
				ret[i] = this.getUint16();
			} 
			return ret;
		};
	}

	var nameLabels =
	['Copyright notice','Font family','Font subfamily','Subfamily identifier','Full name', 'Version',
	'Postscript name','Trademark notice','Manufacturer name','Designer','Description','Vendor Url',
	'Designer Url','License'];
	var platformIds = 
	['Unicode','Macintosh',undefined,'Microsoft'];

	var macEncodingIds =
	['Roman','Japansese','Traditional Chinese','Korean','Arabic','Hebrew','Greek','Russian','RSymbol',
	'Devanagari','Gurmukhi','Gujarati','Oriya','Bengali','Tamil','Telugu','Kannada','Malayalam',
	'Sinhalese','Burmese','Khmer','Thai','Laotian','Georgian','Armenian','Simplified Chinese','Tibetan',
	'Mongolian','Geez','Slavic','Vietnamese','Sindhi'];

	var uniEncodingIds = 
	['Default semantics', 'Version 1.1 semantics', 'ISO 10646 1993 semantics (deprecated)',
	'Unicode 2.0 or later semantics'];

	var macRomanEncoding = 
	['.notdef','.null','nonmarkingreturn','space','exclam','quotedbl','numbersign','dollar','percent','ampersand', 
	'quotesingle','parenleft','parenright','asterisk','plus','comma','hyphen','period','slash','zero','one','two',
	'three','four','five','six','seven','eight','nine','colon','semicolon','less','equal','greater','question','at',
	'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','bracketleft',
	'backslash','bracketright','asciicircum','underscore','grave','a','b','c','d','e','f','g','h','i','j','k','l','m','n',
	'o','p','q','r','s','t','u','v','w','x','y','z','braceleft','bar','braceright','asciitilde','Adieresis','Aring',
	'Ccedilla','Eacute','Ntilde','Odieresis','Udieresis','aacute','agrave','acircumflex','adieresis','atilde','aring',
	'ccedilla','eacute','egrave','ecircumflex','edieresis','iacute','igrave','icircumflex','idieresis','ntilde','oacute',
	'ograve','ocircumflex','odieresis','otilde','uacute','ugrave','ucircumflex','udieresis','dagger','degree','cent',
	'sterling','section','bullet','paragraph','germandbls','registered','copyright','trademark','acute','dieresis',
	'notequal','AE','Oslash','infinity','plusminus','lessequal','greaterequal','yen','mu','partialdiff','summation',
	'product','pi','integral','ordfeminine','ordmasculine','Omega','ae','oslash','questiondown','exclamdown','logicalnot',
	'radical','florin','approxequal','Delta','guillemotleft','guillemotright','ellipsis','nonbreakingspace','Agrave','Atilde',
	'Otilde','OE','oe','endash','emdash','quotedblleft','quotedblright','quoteleft','quoteright','divide','lozenge','ydieresis',
	'Ydieresis','fraction','currency','guilsinglleft','guilsinglright','fi','fl','daggerdbl','periodcentered','quotesinglbase',
	'quotedblbase','perthousand','Acircumflex','Ecircumflex','Aacute','Edieresis','Egrave','Iacute','Icircumflex','Idieresis',
	'Igrave','Oacute','Ocircumflex','apple','Ograve','Uacute','Ucircumflex','Ugrave','dotlessi','circumflex','tilde','macron',
	'breve','dotaccent','ring','cedilla','hungarumlaut','ogonek','caron','Lslash','lslash','Scaron','scaron','Zcaron','zcaron',
	'brokenbar','Eth','eth','Yacute','yacute','Thorn','thorn','minus','multiply','onesuperior','twosuperior','threesuperior',
	'onehalf','onequarter','threequarters','franc','Gbreve','gbreve','Idotaccent','Scedilla','scedilla','Cacute','cacute',
	'Ccaron','ccaron','dcroat']; // minify *this*

	function getTableByTag(font, tag) {
		var tb = font.tables.filter(function(tb) {
			return tb.tag === tag;
		});
		return tb? tb[0]: undefined;
	}

	function readTableDirectory(slr) {
		var ret = {};
		ret.tag = slr.readString(4);
		ret.crc = slr.getUint32();
		ret.offset = slr.getUint32();
		ret.len = slr.getUint32();
		return ret;
	}

	var initializers = {
		'head': function(font) {
			var tb = getTableByTag(font, 'head');
			var slr = font.stream;
			slr.goto(tb.offset);
			var header = {};
			header.version = slr.get32Fixed();
			header.revision = slr.get32Fixed();
			header.checkSumAdjustment = slr.getUint32();
			header.magic = slr.getUint32();
			if (header.magic !== 0x5F0F3CF5) {
				throw "Font header has incorrect magic number";
			}
			header.flags = slr.getUint16();
			header.unitsPerEm = slr.getUint16();

			header.created = slr.getInt64();
			header.modified = slr.getInt64();

			header.xMin = slr.getInt16();
			header.yMin = slr.getInt16();
			header.xMax = slr.getInt16();
			header.yMax = slr.getInt16();

			header.macStyle = slr.getUint16();
			header.lowestRecPPEM = slr.getUint16();
			header.fontDirectionHint = slr.getInt16();
			header.indexToLocFormat = slr.getInt16();
			header.glyphDataFormat = slr.getInt16();

			font.head = Object.freeze(header);
		},
		'name': function(font) {
			var tb = getTableByTag(font, 'name');
			var slr = font.stream;
			slr.goto(tb.offset);
			var namesTable = { records: [] };
			namesTable.version = slr.getUint16();
			var count = slr.getUint16();
			var stringOffset = slr.getUint16();
			for (var i = 0; i < count; i++) {
				var record = {};
				record.platformID = slr.getUint16();
				record.platformSpecificID = slr.getUint16();
				record.language = slr.getUint16();
				record.nameID = slr.getUint16();
				var length = slr.getUint16();
				var offset = slr.getUint16();
				record.text = slr.getStringAt(tb.offset + stringOffset + offset, length);
				namesTable.records.push(record);
			}
			font.name = namesTable;
		},
		'hhea': function(font) {
			var tb = getTableByTag(font, 'hhea');
			var slr = font.stream;
			slr.goto(tb.offset);
			var hheader = {};
			hheader.version = slr.get32Fixed();
			hheader.ascender = slr.getInt16();
			hheader.descender = slr.getInt16();

			hheader.lineGap = slr.getInt16();
			hheader.advanceWidthMax = slr.getUint16();
			hheader.minLeftSideBearing = slr.getInt16();
			hheader.minRightSideBearing = slr.getInt16();
			hheader.xMaxExtent = slr.getInt16();
			hheader.caretSlopeRise = slr.getInt16();
			hheader.caretSlopeRun = slr.getInt16();
			hheader.reserved1 = slr.getInt16();
			hheader.reserved2 = slr.getInt16();
			hheader.reserved3 = slr.getInt16();
			hheader.reserved4 = slr.getInt16();
			hheader.reserved5 = slr.getInt16();
			hheader.metricDataFormat = slr.getInt16();
			hheader.numberOfHMetrics = slr.getUint16();

			font.hhea = Object.freeze(hheader);
		},
		'maxp': function(font) {
			var tb = getTableByTag(font, 'maxp');
			var slr = font.stream;
			slr.goto(tb.offset);
			var maxp = {};
			maxp.version = slr.get32Fixed();

			maxp.numGlyphs = slr.getInt16();
			maxp.maxPoints = slr.getInt16();
			maxp.maxContours = slr.getInt16();
			maxp.maxComponentPoints = slr.getInt16();
			maxp.maxComponentContours = slr.getInt16();
			maxp.maxZones = slr.getInt16();
			maxp.maxTwilightPoints = slr.getInt16();
			maxp.maxStorage = slr.getInt16();
			maxp.maxFunctionDefs = slr.getInt16();
			maxp.maxInstructionDefs = slr.getInt16();
			maxp.maxStackElements = slr.getInt16();
			maxp.maxSizeOfInstructions = slr.getInt16();
			maxp.maxComponentElements = slr.getInt16();
			maxp.maxComponentDepth = slr.getInt16();

			font.maxp = Object.freeze(maxp);
		},
		'post': function(font) {
			var tb = getTableByTag(font, 'post');
			var slr = font.stream;
			slr.goto(tb.offset);
			var post = {};
			post.format = slr.get32Fixed();
			post.italicAngle = slr.get32Fixed();
			post.underlinePosition = slr.getInt16();
			post.underlineThickness = slr.getInt16();
			post.isFixedPitch = slr.getUint32();
			post.minMemType42 = slr.getUint32();
			post.maxMemType42 = slr.getUint32();
			post.minMemType1 = slr.getUint32();
			post.maxMemType1 = slr.getUint32();

			var glyphNames = [], i;
			if (post.format === 1.0) {
				for (i = 0; i < 258; i++) {
					glyphNames[i] = macRomanEncoding[i];
				}
			} else if (post.format === 2.0) {
				var numGlyphs = slr.getUint16();
				var glyphNameIndex = new Array(numGlyphs);
				var maxIndex = Number.MIN_VALUE;
				for (i = 0; i < numGlyphs; i++) {
					var index = slr.getUint16();
					glyphNameIndex[i] = index;
					maxIndex = Math.max(maxIndex, index);
				}
				var nameArray = [];
				if (maxIndex >= 258) {
					for (i = 0; i < maxIndex-258+1; i++) {
						var len = slr.getUint8();
						nameArray[i] = slr.readString(len);
					}
				}
				for (i = 0; i < numGlyphs; i++) {
					var index = glyphNameIndex[i];
					if (index < 258) {
						glyphNames[i] = macRomanEncoding[i];
					} else if (index >= 258 && index <= 32767) {
						glyphNames[i] = nameArray[index-258];
					} else {
						throw "Unknow glyph name: "+index;
					}
				}
			}
			post.glyphNames = glyphNames;
			font.post = Object.freeze(post);
		},
		'loca': function(font) {
			var tb = getTableByTag(font, 'loca');
			var slr = font.stream;
			slr.goto(tb.offset);
			var loca = {};

			var indexToLocFormat = font.head.indexToLocFormat;
			var numGlyphs = font.maxp.numGlyphs;

			loca.offsets = new Array(numGlyphs +1);
			for (var i = 0; i < numGlyphs+1; i++) {
				if (indexToLocFormat === 0) {
					loca.offsets[i] = slr.getUint16() * 2;
				} else if (indexToLocFormat === 1) {
					loca.offsets[i] = slr.getUint32();
				} else {
					throw "Font contains invalid glyph IndexToLocFormat";
				}
			}
			font.loca = Object.freeze(loca);
		},
		'cmap': function(font) {
			var tb = getTableByTag(font, 'cmap');
			var slr = font.stream;
			slr.goto(tb.offset);
			var cmapTable = {};
			var version = slr.getUint16();
			var numberOfTables = slr.getUint16();
			var cmaps = new Array(numberOfTables);
			var cmap, i;
			for (i = 0; i < numberOfTables; i++) {
				cmap = {};
				cmap.platformID = slr.getUint16();
				cmap.platformSpecificID = slr.getUint16();
				cmap.offset = slr.getUint32();
				cmaps[i] = cmap;
			}
			for (i = 0; i < numberOfTables; i++) {
				cmap = cmaps[i];
				slr.goto(tb.offset + cmap.offset);
				cmap.format = slr.getUint16();
				cmap.length = slr.getUint16();
				cmap.language = slr.getUint16();
				cmap.glyphIndexArray = new Array(256);
				switch(cmap.format) {
					case 0:
					for(var j = 0; j < 256; j++) {
						cmap.glyphIndexArray[j] = slr.getUint8();
					}
					break;
					case 4:
					var numGlyphs = font.maxp.numGlyphs;

					var segCountX2 = slr.getUint16();
					var segCount = segCountX2/2;
					var searchRange = slr.getUint16();
					var entrySelector = slr.getUint16();
					var rangeShift = slr.getUint16();
					var endCode = slr.getUint16Array(segCount);
					slr.getUint16();  //reserved Pad
					var startCode = slr.getUint16Array(segCount);
					var idDelta = slr.getUint16Array(segCount);
					var idRangeOffset = slr.getUint16Array(segCount);
					var glyphToCharacterMap = new Array(numGlyphs);
					var curPos = slr.offset();
					for (var j = 0; j < segCount; j++) {
						var start = startCode[j];
						var end = endCode[j];
						var delta = idDelta[j];
						var rangeOffset = idRangeOffset[j];
						if (start !== 0xFFFF && end !== 0xFFFF) {
							for (var k = start; k < end; k++) {
								if (rangeOffset === 0) {
									glyphToCharacterMap[((k+delta)%65536)] = k;
									cmap.glyphIndexArray[k] = ((k+delta)%65536);
								} else {
									var glyphOffset = curPos+((rangeOffset/2)+(k-start)+(i-segCount))*2;
									slr.goto(glyphOffset);
									var glyphIndex = slr.getUint16();
									if (glyphIndex != 0) {
										glyphIndex += delta;
										glyphIndex %= 65536;
										if (glyphToCharacterMap[glyphIndex] === 0) {
											glyphToCharacterMap[glyphIndex] = k;
											cmap.glyphIndexArray[k] = glyphIndex;
										}
									}
								}
							}
						}
					}
					cmap.glyphToCharacterMap = glyphToCharacterMap;
					break;
				}
			}
			cmapTable.cmaps = cmaps;
			font.cmap = Object.freeze(cmapTable);
		},
		'glyf': function(font) {
			var tb = getTableByTag(font, 'glyf');
			var slr = font.stream;
			slr.goto(tb.offset);
			var glyf = {};

			var maxp = font.maxp;
			var loca = font.loca;
			var post = font.post;

			var offsets = loca.offsets;
			var numGlyphs = maxp.numGlyphs;
			var glyphNames = post.glyphNames;

			var glyphs = new Array(numGlyphs);
			for (var i = 0; i < numGlyphs-1; i++) {
				if (offsets[i] === offsets[i+1]) {
					continue;
				}
				var glyph = new Glyph(tb.offset + offsets[i], slr);
				glyphs[i] = glyph;
			}
			for (var i = 0; i < numGlyphs-1; i++) {
				if (glyphs[i] && glyphs[i].numberOfContours === -1) {
					glyphs[i].resolve(glyphs);
				}
			}
			glyf.glyphs = glyphs;
			font.glyf = Object.freeze(glyf);
		},
		'hmtx': function(font) {
			var tb = getTableByTag(font, 'hmtx');
			var slr = font.stream;
			slr.goto(tb.offset);
			var hmetrics = {};

			var numOfLongHorMetrics = font.hhea.numberOfHMetrics;
			hmetrics.longHorMetric = new Array(numOfLongHorMetrics);
			var i;
			for (i = 0; i < numOfLongHorMetrics; i++) {
				var metric = {};
				metric.advanceWidth = slr.getUint16();
				metric.leftSideBearing = slr.getInt16();
				hmetrics.longHorMetric[i] = metric;
			}
			var advanceWidth = hmetrics.longHorMetric[i-1].advanceWidth;
			for (;i < font.maxp.numGlyphs; i++) {
				var metric = {};
				metric.advanceWidth = advanceWidth;
				metric.leftSideBearing = slr.getInt16();
				hmetrics.longHorMetric[i] = metric;
			}
			font.hmtx = Object.freeze(hmetrics);
		},
		'kern': function(font) {
			var tb = getTableByTag(font, 'kern');
			if (!tb) { return; }
			var slr = font.stream;
			slr.goto(tb.offset);
			var kerning = {};

			var fword1 = slr.getUint16();
			var fword2 = slr.getUint16();
			if (fword1 === 1 && fword2 === 0) {
				kerning.version = 1.0;
				kerning.nTables = slr.getUint32();
			} else {
				kerning.version = fword1;
				kerning.nTables = fword2;
			}
			kerning.tables = new Array(kerning.nTables);
			for (var i = 0; i < kerning.nTables; i++) {
				var kern = {};
				kern.start = slr.offset();
				kern.length = slr.getUint32();
				kern.coverage = slr.getUint16();
				kern.tupleIndex = slr.getUint16();
				switch (kern.coverage & 0x00ff) {
					case 0:
					// step 1: ignore these
					var nPairs = slr.getUint16();
					var searchRange = slr.getUint16();
					var entrySelector = slr.getUint16();
					var rangeShift = slr.getUint16();
					kern.pairs = {};
					for (var j = 0; j < kern.nPairs; j++) {
						// step 2: remember that native code can search faster
						var key = slr.getUint32();
						var value = slr.getInt16();
						kern.pairs[key] = value;
					}
					break;
					case 2:
					var rowWidth = slr.getUint16();
					var leftOffsetTable = slr.getUint16();
					var rightOffsetTable = slr.getUint16();
					var array = slr.getUint16();

					slr.goto(kern.start+leftOffsetTable);
					kern.leftOffsetTable = loadKernF2OffsetTable(slr);
					slr.goto(kern.start+rightOffsetTable);
					kern.rightOffsetTable = loadKernF2OffsetTable(slr);
					break;
				}
				kerning.tables[i] = kern;
			}
			font.kern = Object.freeze(kerning);
		}
	};

	function loadKernF2OffsetTable(slr) {
		var table = {};
		table.firstGlyph = slr.getUint16();
		var nGlyphs = slr.getUint16();
		table.offsets = slr.getUint16Array(nGlyphs);
		return table;
	}

	function Glyph(offset, slr) {
		slr.goto(offset);

		this.numberOfContours = slr.getInt16();
		this.boundingBox = {};
		this.boundingBox.llX = slr.getInt16();
		this.boundingBox.llY = slr.getInt16();
		this.boundingBox.upX = slr.getInt16();
		this.boundingBox.upY = slr.getInt16();
		if (this.numberOfContours >= 0) {
			var endPtsOfContours = slr.getUint16Array(this.numberOfContours);
			var instructionLength = slr.getUint16();
			this.instructions = slr.getUint8Array(instructionLength);
			var totalNumberOfPoints = endPtsOfContours[endPtsOfContours.length-1] + 1;
			this.flags = [];
			for (var i = 0; i < totalNumberOfPoints; i++) {
				var flag = slr.getUint8();
				this.flags.push(flag);
				if (flag & 0x08) {
					var repeat = slr.getUint8();
					for (var j = 0; j < repeat; j++) {
						this.flags.push(flag);
					}
					i += repeat;
				}
			}
			var xCoords = [],
			yCoords = [],
			x = 0, y = 0;
			for (var i = 0; i < totalNumberOfPoints; i++) {
				var flag = this.flags[i];
				if (flag & 0x10) {
					if (flag & 0x02) { 
						x += slr.getUint8(); 
					}
				} else {
					if (flag & 0x02) {
						x += -(slr.getUint8())
					} else {
						x += slr.getInt16();
					}
				}
				xCoords[i] = x;
			}
			for (var i = 0; i < totalNumberOfPoints; i++) {
				var flag = this.flags[i];
				if (flag & 0x20) {
					if (flag & 0x04) { 
						y += slr.getUint8(); 
					}
				} else {
					if (flag & 0x04) {
						y += -(slr.getUint8())
					} else {
						y += slr.getInt16();
					}
				}
				yCoords[i] = y;
			}
			this.xCoords = xCoords;
			this.yCoords = yCoords;
			this.endPtsOfContours = endPtsOfContours;
		} else if (this.numberOfContours === -1) {
			this.components = [];
			var component;
			do {
				component = { 
					xscale: 1.0, yscale: 1.0,
					scale01: 0.0, scale10: 0.0 
				};
				component.flags = slr.getUint16();
				component.glyphIndex = slr.getUint16();
				if (component.flags & 0x01) {
					component.argument1 = slr.getUint16();
					component.argument2 = slr.getUint16();
				} else {
					component.argument1 = slr.getUint8();
					component.argument2 = slr.getUint8();
				}
				if (component.flags & 0x02) {
					component.xtranslate = component.argument1;
					component.ytranslate = component.argument2;
				} else {
					component.point1 = component.argument1;
					component.point2 = component.argument2;
				}
				if (component.flags & 0x08) {
					var i = slr.getInt16();
					component.xscale = i/ 0x4000;
					component.yscale = i/ 0x4000;
				} else if (component.flags & 0x40) {
					component.xscale = slr.getInt16()/ 0x4000;
					component.yscale = slr.getInt16()/ 0x4000;
				} else if (component.flags & 0x80) {
					component.xscale = slr.getInt16()/ 0x4000;
					component.scale01 = slr.getInt16()/ 0x4000;
					component.scale10 = slr.getInt16()/ 0x4000;
					component.yscale = slr.getInt16()/ 0x4000;
				}
				this.components.push(component);
			} while (component.flags & 0x20);
		}
	}
	
	function linearTransformX(comp, x, y) {
		var x1 = Math.round(x * comp.xscale + y * comp.scale10);
		return x1 + comp.xtranslate;
	}
	function linearTransformY(comp, x, y) {
		var y1 = Math.round(x * comp.scale01 + y * comp.yscale);
		return y1 + comp.ytranslate;
	}
	
	Glyph.prototype = {
		resolve: function(glyphs) {
			if (this.numberOfContours === -1) {
				var firstIndex = 0,
				firstContour = 0;
				this.glyphs = glyphs;
				for (var i in this.components) {
					var comp = this.components[i];
					comp.firstIndex = firstIndex;
					comp.firstContour = firstContour;
					var glyph = glyphs[comp.glyphIndex];
					if (glyph) {
						glyph.resolve(glyphs);
						firstIndex += glyph.getPointCount();
						firstContour += glyph.getContourCount();
					}
				}
			}
		},
		getPointCount: function() {
			if (this.numberOfContours >= 0) {
				return this.flags.length;
			} else {
				var that = this;
				return this.components.reduce(function(p, c) {
					var glyph = that.glyphs[c.glyphIndex];
					return p + c.glyph.getPointCount();
				},0);
			}
		},
		getContourCount: function() {
			if (this.numberOfContours >= 0) {
				return this.numberOfContours;
			} else {
				var that = this;
				return this.components.reduce(function(p, c) {
					var glyph = that.glyphs[c.glyphIndex];
					return p + glyph.getContourCount();
				},0);
			}
		},
		getSegmentedPoints: function() {
			var xcoords = [], ycoords = [], flags = [];
			if (this.numberOfContours === 1) {
				xcoords.push(this.xCoords);
				ycoords.push(this.yCoords);
				flags.push(this.flags);
			} else if (this.numberOfContours > 1) {
				var start = 0;
				for (var i in this.endPtsOfContours) {
					xcoords.push(this.xCoords.slice(start, this.endPtsOfContours[i]+1));
					ycoords.push(this.yCoords.slice(start, this.endPtsOfContours[i]+1));
					flags.push(this.flags.slice(start, this.endPtsOfContours[i]+1));
					start = this.endPtsOfContours[i]+1;
				}
			} else if (this.numberOfContours === -1) {
				var that = this;
				this.components.forEach(function(comp) {
					var glyph = that.glyphs[comp.glyphIndex];
					var segmentedPoints = glyph.getSegmentedPoints();
					for (var i = 0; i < segmentedPoints.flags.length; i++) {
						var newXCoords = segmentedPoints.xcoords[i].map(function(xc,ind) {
							return linearTransformX(comp, xc, segmentedPoints.ycoords[i][ind]);
						});
						var newYCoords = segmentedPoints.ycoords[i].map(function(yc,ind) {
							return linearTransformY(comp, segmentedPoints.xcoords[i][ind], yc);
						});
						xcoords.push(newXCoords);
						ycoords.push(newYCoords);
						flags.push(segmentedPoints.flags[i]);
					}
				});
			}
			return { xcoords: xcoords, ycoords: ycoords, flags: flags }
		}
	};

	function Font(slr) {
		this.stream = slr;
	}
	
	Font.prototype = {
		tables: [],
		getNamesForFont: function(lang) {
			if (lang === undefined) {
				return this.name;
			}
			return this.name.records.filter(function(name) {
				return lang === undefined || name.language === lang;
			});
		},
		fullName: function(lang) {
			var fullNames = this.name.records.filter(function(name) {
				return name.nameID === 4;
			});
			if (fullNames.length === 1) {
				return fullNames[0].text;
			} else {
				var langNames = fullNames.filter(function(name) {
					return lang === undefined || name.language === lang;
				});
				return langNames? langNames[0].text: undefined;
			}
		},
		getGlyphIndexForCharacterCode: function(charc) {
			var code = charc.charCodeAt(0);
			for (var i in this.cmap.cmaps) {
				var glyphIndex = this.cmap.cmaps[i].glyphIndexArray[code];
				if (glyphIndex)	{
					return glyphIndex;
				}
			}
			return 0;
		},
		getHmtxForChar: function(index) {
			if (this.post.isFixedPitch) {
				return this.hmtx.longHorMetric[0];
			} else {
				return this.hmtx.longHorMetric[index];
			}
		},
		getKernForPair: function(left, right) {
			if (this.kern && (left !== undefined) && (right !== undefined)) {
				var tables = this.kern.nTables;
				for (var i = 0; i < tables; i++) {
					var kern = this.kern.tables[i];
					switch(kern.coverage & 0x00ff) {
						case 0:
						var key = ((left & 0xffff) << 16) | (right & 0xffff);
						return kern.pairs[key] || 0;
						break;
						case 2:
						var leftOffset = 0;
						if (left >= kern.leftOffsetTable.firstGlyph) {
							leftOffset = kern.leftOffsetTable.offsets[left-kern.leftOffsetTable.firstGlyph];
						}
						var rightOffset = 0;
						if (right >= kern.rightOffsetTable.firstGlyph) {
							rightOffset = kern.rightOffsetTable.offsets[right-kern.rightOffsetTable.firstGlyph];
						}
						var combinedOffset = leftOffset + rightOffset;
						this.stream.goto(kern.start+combinedOffset);
						return this.stream.getInt16();
						break;
						case 4: 
						break;
					}
				}
			}
			return 0;
		},
		stringToSVG: function(text, height) {
			var renderer = new KeySet('svg', this);
			return renderer.render(text, height);
		},
		getTextAsGlyphIds: function(text) {
			var glyphIds = new Array(text.length);
			for (var i = 0; i < text.length; i++) {
				glyphIds[i] = this.getGlyphIndexForCharacterCode(text[i]);
			}
			return glyphIds;
		},
		initTables: function() {
			initializers['head'](this);
			initializers['hhea'](this);
			initializers['maxp'](this);
			initializers['hmtx'](this);
			initializers['post'](this);
			initializers['loca'](this);
			initializers['glyf'](this);
			initializers['cmap'](this);
			initializers['kern'](this);
		}
	};

	function getFontFromResults(result) {
		var slr = new _StreamReader(result);
		var font = new Font(slr);
		font.version = slr.getUint32();
		if (font.version !== 0x74727565 && font.version !== 0x00010000) {
			throw "This is not a valid TrueType font, according to the spec."
		}
		var numberOfTables = slr.getUint16();
		var searchRange = slr.getUint16();
		var entrySelector = slr.getUint16();
		var rangeShift = slr.getUint16();
		for (var i = 0; i < numberOfTables; i++) {
			var table = readTableDirectory(slr);
			font.tables.push(table);
		}
		initializers['name'](font);
		return font;
	}

	window.fontificate = fontificate;
	function fontificate(file, doInit) {
		var deferred = new $.Deferred();
		try {
			var reader = new FileReader();
			reader.onloadend = function(thefile) {
				console.log('\nloaded');
				try {
					var font = getFontFromResults(this.result);
					if (doInit) {
						font.initTables();
					}
					deferred.resolve(font);
				} catch (e) {
					deferred.reject(e);
				}
			};
			reader.onerror = function(e) {
				deferred.reject(e);
			};
			reader.readAsArrayBuffer(file);
		} catch(e) {
			deferred.reject(e);
		}	
		return deferred.promise();
	}

})(window, jQuery);