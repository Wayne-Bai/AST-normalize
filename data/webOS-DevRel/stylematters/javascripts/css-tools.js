CSSTools = Class.create( {
	keyPressListener : null,
	keys : [],
	pattern : "64,99,115,115",
	spinner: 'activity-spinner',
	spinning: false,
	spinnerAttrs: {
		spinnerSize: Mojo.Widget.spinnerLarge
	},
	initialize : function(){
		this.keys = [];
	},
	
	setup : function(){
		if($('complete_example')){
			this.controller.setupWidget(this.spinner, this.spinnerAttrs, {});
			this.keyPressListener =  this.evaluateKeyPress.bindAsEventListener(this,this.title);
			$(document).observe("keypress", this.keyPressListener);
		}
	},
	
	activate : function(){
		
	},
	
	deactivate : function(){
		if($(this.spinner)){
			$(document).stopObserving("keypress", this.keyPressListener);
			$(this.spinner).mojo.stop();
		}
	},
	
	evaluateKeyPress : function(e,title){
		this.keys.push( e.keyCode );
		Mojo.Log.info( e.keyCode );
		if ( this.keys.toString().indexOf( this.pattern ) >= 0 ){
			this.keys = [];
			Mojo.Log.info("code was entered to push to css tools report scene");
			$(this.spinner).mojo.start();
			var reportdata = this.createCSSOutPut($('complete_example'));
			$(this.spinner).mojo.stop();
			this.controller.stageController.pushScene({name: 'csstools-report'},{'description':title, 'reportdata' : reportdata});
		}
	},
	
	createCSSOutPut : function(element){
		var str = '';
		var styles = this.getStylesFromElement(element);
		//remove the about style item
		//styles['about-style-item']?delete(styles['about-style-item']):Mojo.Log.info('How did we get into this state?');
		for(var i in styles){
			styles[i].properties = this.searchStyleSheets(i);
			//if(styles[i].properties && this.doesStyleApplyToElement(i,styles[i].properties)){
			if(styles[i].properties){
				for(var j in styles[i].properties){

            str += "<div class=\"css-class\"><span class=\"css-class-name\">" + j + " </span>{";
            for(var e in styles[i].properties[j]){
            	str += "<div class=\"css-class-property\"><span class=\"css-class-property-name\">" + e + "</span>: <span class=\"css-class-property-value\">" + styles[i].properties[j][e] + "</span>;</div>";
            }
            str += "}</div>";

				}
			}
		}
		return str;
	},

	getStylesFromElement : function(element){
		var elementProperties = {'properties': {},'parents': {}};
		var styles = {};
		var elements = $(element).descendants();
		var referToSelf = this;

		if($w(element.className)){
			$w(element.className).each(function (name, index){
				styles[name] = elementProperties;
				//styles[name].parents = referToSelf.createParents(elements[index]);
				//Mojo.Log.info(styles[name].parents.yes);
			});
		}

		if(elements){
			elements.each(function (name, index){
				$w(elements[index].className).each(function (name, index){
            styles[name] = elementProperties;
            //styles[name].parents = referToSelf.createParents(elements[index]);
            //Mojo.Log.info(styles[name].parents.yes);
				});
			});
		}

		return styles;
	},

	createParents: function(element){
		var parents = {};
		var level = 0;
		while(!$(element).up().inspect().match("style-item")){
			parents[level++] = $w($(element).up().className);

			//Mojo.Log.info($(element).up().inspect());
			element = $(element).up();
		}
		//attach the of the element as the last member of the array
		parents[level] = $w($(element).id);
		return parents;
	},

	searchStyleSheets: function(theClass){
		var link = $(document.styleSheets);
		var docStyles = {};
		for(var i=0; i<link.length; i++){
			var sheet = link[i];
			if(sheet.cssRules.length > 0){
				this.searchStyleSheet(theClass,sheet,docStyles);
			}
		}
		return docStyles;
	},

	doesStyleApplyToElement: function(theElement, theClass){
		//return false;

		return 1;
	},

	searchStyleSheet: function(theClass, sheet, docStyles){
		//get recursive on the stylesheet
		//get the rules
		var rules = sheet.cssRules;

		if(sheet.href.match("style-matters")){
			for(var i=0; i<rules.length; i++){
				if(rules[i].hasOwnProperty('selectorText')){
            //if the name of the property is a match for the selection text
            if(rules[i].selectorText.match("."+theClass+" ") ){
            	var properties = rules[i].style.cssText.split(";");
            	var selectorText = rules[i].selectorText;
            	if(!docStyles[selectorText]){
            		docStyles[selectorText] = {};
            	}
            	for(var j=0;j<properties.length-1;j++){
            		var name = properties[j].split(":",2)[0];
            		var value = properties[j].split(":",2)[1];
            		docStyles[selectorText][name] = value;
            	}
            }
				}else if(rules[i].hasOwnProperty('styleSheet')){
            var subStyle = rules[i].styleSheet;
            this.searchStyleSheet(theClass, subStyle, docStyles);
				}
			}
		}

	}
});