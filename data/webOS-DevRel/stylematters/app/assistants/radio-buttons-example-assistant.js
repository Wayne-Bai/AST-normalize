RadioButtonsExampleAssistant = Class.create( ExampleAssistantBase, {
	fwl : {'launchToScene':'radiobutton'},
	attrs : {
		modelProperty : 'toggleOpt',
		disabledProperty: 'disabled',
		choices : [
		{label : 'true', value : true},
		{label : 'false', value : false}
		]
	},
	attrs2 : {
		modelProperty : 'toggleOpt',
		disabledProperty: 'disabled',
		choices : [
		{label : 'First', value : 1},
		{label : 'Second', value : 2},
		{label : 'Third', value : 3},
		]
	},
	model : {
		toggleOpt : true,
		disabled:false
	},
	model2 : {
		toggleOpt : 2,
		disabled:false
	},
	setup: function($super){
		$super();
		this.controller.setupWidget('toggle1', this.attrs, this.model);
		this.controller.setupWidget('toggle2', this.attrs2, this.model2);
		this.controller.setupWidget('toggle3', this.attrs, this.model);
		this.controller.setupWidget('toggle4', this.attrs2, this.model2);
	}
});