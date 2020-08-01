/*if (!window['console'] && !Ext.isAir) {
	// Enable console
	if (window['loadFirebugConsole']) {
		window.loadFirebugConsole();
	} else {
		// No console, use Firebug Lite
		var firebugLite = function(F,i,r,e,b,u,g,L,I,T,E){if(F.getElementById(b))return;E=F[i+'NS']&&F.documentElement.namespaceURI;E=E?F[i+'NS'](E,'script'):F[i]('script');E[r]('id',b);E[r]('src',I+g+T);E[r](b,u);(F[e]('head')[0]||F[e]('body')[0]).appendChild(E);E=new Image;E[r]('src',I+L);};
		firebugLite(document,'createElement','setAttribute','getElementsByTagName','FirebugLite','4','firebug-lite.js','releases/lite/latest/skin/xp/sprite.png','https://getfirebug.com/','#startOpened');
	}
}
*/
var debug = {
    trace: function (str) {
	if (Ext.isAir) {
	    air.trace(str);
	} else {
	    if ( typeof(console) == "undefined" ) return;
	    console.log(str);
	}
    },
    log: function (title, str) {
	this.trace( title + " --> " + str );
    }
};

Ext.ns('jp.json');
jp.json = {
    parse: function (string) {
	var lint = JSLINT(string);

	if (lint) {
	    try {
		return Ext.decode( string );
	    } catch (err) {
		return false;
	    }
	} else {
	    var errorArray = [];
	    var i = null;
	    for (i in JSLINT.errors) {
		var extraCond = false;

		if (JSLINT.errors.length > 1) {
		    if (parseInt(i) > (JSLINT.errors.length-2)) extraCond = true;
		}

		if (i != "remove" && i != "in_array" && !extraCond) {
		    var errorMsg = "Error on line {0} character {1}: {2}";
		    var errorExplain = (JSLINT.errors[i]["reason"] ? JSLINT.errors[i]["reason"] : "");
		    errorMsg = String.format(errorMsg, JSLINT.errors[i]["line"], JSLINT.errors[i]["character"], errorExplain);

		    var errorEvidence = JSLINT.errors[i]["evidence"];
		    if (errorEvidence != null && errorEvidence.length > 50) errorEvidence = errorEvidence.substring(0, 45) + "...";

		    var err = {
			line: JSLINT.errors[i]["line"],
			character: JSLINT.errors[i]["character"],
			msg: errorMsg,
			evi: errorEvidence
		    }

		    errorArray.push(err);
		}
	    }

	    return {
		errorObject: errorArray
	    };
	}
    }
};

jp.xml = {
    parseXml: function (xml) {
	var dom = null;
	var parser = null;
	if (window.DOMParser) {
	    try {
		parser = new DOMParser();
		dom = parser.parseFromString(xml, "text/xml");
	    }
	    catch (e) {
		dom = null;
	    }
	} else if (window.ActiveXObject) {
	    try {
		dom = new ActiveXObject('Microsoft.XMLDOM');
		dom.async = false;
		if (!dom.loadXML(xml)) // parse error ..
		    alert("1"+dom.parseError.reason + dom.parseError.srcText);
	    }
	    catch (e) {
		dom = null;
	    }
	}
	return dom;
    }
}

/**
*
*  URL encode / decode
*  http://www.webtoolkit.info/
*
**/
jp.url = {
    // public method for url encoding
    encode : function (string) {
	return escape(this._utf8_encode(string));
    },

    // public method for url decoding
    decode : function (string) {
	return this._utf8_decode(unescape(string));
    },

    // private method for UTF-8 encoding
    _utf8_encode : function (string) {
	string = string.replace(/\r\n/g,"\n");
	var utftext = "";

	for (var n = 0; n < string.length; n++) {
	    var c = string.charCodeAt(n);

	    if (c < 128) {
		utftext += String.fromCharCode(c);
	    } else if((c > 127) && (c < 2048)) {
		utftext += String.fromCharCode((c >> 6) | 192);
		utftext += String.fromCharCode((c & 63) | 128);
	    } else {
		utftext += String.fromCharCode((c >> 12) | 224);
		utftext += String.fromCharCode(((c >> 6) & 63) | 128);
		utftext += String.fromCharCode((c & 63) | 128);
	    }

	}

	return utftext;
    },

    // private method for UTF-8 decoding
    _utf8_decode : function (utftext) {
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
}

jp.cookie = new Ext.state.CookieProvider({
    expires: new Date(new Date().getTime()+(1000*60*60*24*30))//, //30 days
//domain: "extjs.com"
});

jp.util = {
    type: function ( val ) {
	if ( val == null )
	    return "null";
	if ( val === false || val === true )
	    return "boolean";
	if ( Ext.type(val) == "number" || Ext.type(val) == "array" || Ext.type(val) == "object" )
	    return Ext.type(val);

	return "string";
    },

    isObject: function (x) {
	return (typeof x == 'object');
    },

    isArray: function (x) {
	if (x.constructor.toString().indexOf("Array") == -1)
	    return false;
	else
	    return true;
    },

    isString: function (a) {
	return typeof a == 'string';
    },

    isHttpUrl: function (s) {
	var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
	return regexp.test(s);
    }
};

String.prototype.toFirstUpperCase = function() {
    return this.substring(0,1).toUpperCase() + this.substring(1, this.length).toLowerCase();
}

String.prototype.repeat = function( num ) {
    return new Array( num + 1 ).join( this );
}