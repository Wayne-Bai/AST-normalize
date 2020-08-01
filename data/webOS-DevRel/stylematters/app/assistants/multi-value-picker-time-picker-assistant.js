MultiValuePickerTimePickerAssistant = Class.create( ExampleAssistantBase, {
	fwl : {'launchToScene':'datetime'},
	setup : function($super){
		$super();
		// The date & time picker widgets can be used to edit a Date object in the widget model.
		this.pickerModel = {time:new Date(), myValue:42};
		this.controller.setupWidget('timepicker', {minuteInterval:15}, this.pickerModel);
	}
});