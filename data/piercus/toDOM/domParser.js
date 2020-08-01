sand.define("toDOM/domParser", function(r){
    
  if (typeof(window) === "undefined"){
    //nodejs specific
    var DOMParser = require("xmldom").DOMParser;
    var parser=new DOMParser(); 
    return function(text){
  	   return parser.parseFromString(text,"text/xml");
  	};
  } else if (window.DOMParser) {
	  var parser=new DOMParser();
	  return function(text){
	     return parser.parseFromString(text,"text/xml");
	  };
	} else if (typeof(ActiveXObject) !== "undefined"){// Internet Explorer
	  var parser=new ActiveXObject("Microsoft.XMLDOM");
	  parser.async = false;
	  
    return function(text){
      return parser.loadXML(text);
    }; 
	}
});   
