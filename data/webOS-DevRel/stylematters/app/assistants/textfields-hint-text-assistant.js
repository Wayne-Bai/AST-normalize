TextfieldsHintTextAssistant = Class.create( ExampleAssistantBase, {
	fwl : {'launchToScene':'textfield'},
	setup: function($super) {
		$super();
		this.attributes = {
			hintText: $L('Enter text...'),
			modelProperty: 'original',
			multiline: false,
			label: $L('To:'),
			focus: true,
			textFieldMode: 'sentence-case',
			limitResize: false,
			enterSubmits: false,
			holdToEnable:true
		};
		this.model = {
			'original' : $L(''),
			disabled: false
		};
		this.controller.setupWidget('textField', this.attributes, this.model);
	}
});