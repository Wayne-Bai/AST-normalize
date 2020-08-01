SlidersProgressSliderAssistant = Class.create( ExampleAssistantBase, {
	fwl : {'launchToScene':'progressslider'},
	stylesheet: "sliders-progress-slider",
	setup : function($super){
		$super();
		this.controller.setupWidget('sliderdiv');
	}
});