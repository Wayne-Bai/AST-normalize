ScrimsExampleAssistant = Class.create( ExampleAssistantBase, {
	exampleSpinner : 'example-activity-spinner',
	exampleSpinnerAttrs: {
		spinnerSize: Mojo.Widget.spinnerLarge
	},
	button1Attributes : {
		disabledProperty: 'disabled',
		type: 'default'
	},
	button1Model : {
		buttonLabel : $L("show scrim"),
		buttonClass: '',
		disabled: this.disabled
	},
	setup : function($super){
		$super();
		this.controller.setupWidget(this.exampleSpinner, this.exampleSpinnerAttrs, {});
		this.scrim = Mojo.View.createScrim(this.controller.document, {onMouseDown:this.close.bind(this), scrimClass:'palm-scrim'});
		this.controller.get("example-scrim").appendChild(this.scrim).appendChild($(this.exampleSpinner));
		this.controller.setupWidget('button1', this.button1Attributes, this.button1Model);
		this.controller.get('button1').observe(Mojo.Event.tap, this.open.bindAsEventListener(this));
	},
	ready : function($super){
		$super();
		this.controller.get(this.exampleSpinner).mojo.start();
	},
	open : function(e){
		this.scrim.show();
	},
	close : function(e){
		this.scrim.hide();
	}
});