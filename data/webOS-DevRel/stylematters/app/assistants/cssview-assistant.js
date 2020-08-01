CssviewAssistant = Class.create({
  viewCSS : null,

  initialize : function(element) {
	Element.extend(element);
	this.viewCSS = element;
  },

  setup : function() {
	this.outputDisplay = this.controller.get('css_outputDisplay');
	this.outputDisplay.innerHTML = this.createCSSOutPut(this.viewCSS);
  },

  createCSSOutPut : function(element){
	var str = '';
	//this.getStylesFromElement(element);
	var styles = this.getStylesFromElement(element);
	//var docStyles = this.getStylesFromDoc();
	//remove the about style item
	styles['about-style-item']?delete(styles['about-style-item']):Mojo.Log.info('How did we get into this state?');
	
	for(var i in styles){
		str += "<div class=\"css-class\"><span class=\"css-class-name\">." + i + " </span>{";
		//Mojo.Log.info(styles[i]);
		if(styles[i].properties){
			for(var j in styles[i].properties){
				str += "<div class=\"css-class-property\"><span class=\"css-class-property-name\">" + j + "</span>: <span class=\"css-class-property-value\">" + styles[i].properties[j] + "</span>;</div>";
			}
		}
		str += "}</div>";
	}
	return str;
  },

  getStylesFromElement : function(element){
	//var elementProperties = {'properties': {'turbo':'on', 'wastage':'super'}};
	var elementProperties = {'properties': {}};
	//var elementProperties = [];
	var styles = {};
	var elements = $(element).descendants();
	
	if($w(element.className)){
		$w(element.className).each(function (name, index){
			styles[name] = elementProperties;
		});
	}

	if(elements){
		elements.each(function (name, index){
			$w(elements[index].className).each(function (name, index){
				styles[name] = elementProperties;
			});
		});
	}
	
	return styles;
  },

  getStylesFromDoc: function(){
    var link = $$("link");
	//var link = $(document.styleSheets);
	var docStyles = {};
	var str= "";
	var referToSelf = this;
	link.each(function (name, index){
		for(var i=0;i<name.sheet.cssRules.length;i++){
			var item = name.sheet.cssRules[i];
			var selector = item.selectorText;
			var cssText = item.cssText;
			//str += referToSelf.printRule(selector, cssText.split(";"));
			docStyles[selector] = {};
			referToSelf.createSelectorArray(docStyles[selector], cssText.split(";"));
		}
	});

	//docStyles = str;
	return docStyles;
  },
  
  	printRule: function(_selector,_css){
		var str;// = "<div class='Selector'>"+_selector+" {</div>";
		for(var i=0; i<_css.length; i++){
			var item = _css[i];
			str += item;
			//str += "<div class='CSSText'>"+item.replace(/(.+\:)(.+)/,"<span class='CSSProperty'>$1</span><span class='CSSValue'>$2;</span>")+"</div>";
		}
		str+="<div class='Selector'>}</div>";
		return str;
	},
	
	createSelectorArray: function(_selector,_css){
		for(var i=0; i<_css.length; i++){
			
			
			var item = _css[i].split(":",2); 
			var property = item[0];
			var value = item[1];
			_selector[property] = value;
		}
	}
	
});



