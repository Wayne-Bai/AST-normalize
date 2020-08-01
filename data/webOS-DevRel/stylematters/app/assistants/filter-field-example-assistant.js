FilterFieldExampleAssistant = Class.create( ExampleAssistantBase, {
	fwl : {'launchToScene':'filterlist'},
	attr : {
		filterFieldName: "name",
		delay: 500,
		filterFieldHeight: 100
	},
	model : {
		disabled: false
	},
	setup : function($super){
		$super();
		this.controller.setupWidget('filterField', this.attr, this.model);
		this.controller.listen('filterField', Mojo.Event.filter, this.filter.bind(this));
		this.filteredItems = this.controller.get('filteredItems');
		this.filterField = this.controller.get('filterField');
		this.printExamples(this.examples, '');
	},
	activate: function() {
		this.filterField = this.controller.get('filterField');
		this.filterField.mojo.open();
	},
	printExamples : function(examples, match){
		function matchText(text, match){
			if(text.toLocaleLowerCase().startsWith(match)){
				var green = "<span class=\"list-highlight\">"+text.substring(0,match.length)+"</span>";
				var rest = text.substring(match.length);
				return green + rest;
			}else{
				return text;
			}
		}
		this.filteredItems.innerHTML = '';
		for(var i=0;i<examples.length;i++){
			this.filteredItems.insert('<div class=\"palm-row\" x-mojo-touch-feedback=\"delayed\"><div class=\"palm-row-wrapper\"><div class=\"title\">'+matchText(examples[i].name,match)+' - '+matchText(examples[i].type,match)+'</div></div></div>');
		}
	},
	filter: function(event) {
		var filterString = event.filterString;
		if(filterString){
			lowerFilter = filterString.toLocaleLowerCase();
			function matches (example) {
				if(example.name && example.name.toLocaleLowerCase().startsWith(lowerFilter)){
	        		return example.name.toLocaleLowerCase().startsWith(lowerFilter);
				}else if(example.type && example.type.toLocaleLowerCase().match(lowerFilter)){
	        		return example.type.toLocaleLowerCase().startsWith(lowerFilter);
				}else{
	        		return false;
				}
			}
			matching = this.examples.findAll(matches);
			this.printExamples(matching, lowerFilter);
			this.filterField.mojo.setCount(matching.length);
			Mojo.Log.info('number of matches == '+matching.length);
			//this.controller.modelChanged(this.model);
		}else{
			this.printExamples(this.examples, '');
		}		
	},
	examples: [
		{name: "Tomato",
		type: "fruit"},
		{name: "Orange",
		type: "fruit"},
		{name: "Shark",
		type: "swims"},
		{name: "Sturgeon",
		type: "swims"},
		{name: "Siamese Fighting Fish",
		type: "swims"},
		{name: "Salamander",
		type: "slithers"},
		{name: "Snake",
		type: "slithers"},
		{name: "Dog",
		type: "barks"},
		{name: "Dogfish",
		type: "swims"},
		{name: "Cat",
		type: "purrs"},
		{name: "Pnuematic shear",
		type: "burrs"},
		{name: "Ice cream",
		type: "stirs"},
		{name: "Robot",
		type: "takes over the world"}
	]
});