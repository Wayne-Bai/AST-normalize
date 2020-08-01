TextfieldsSingleLineTruncatingAssistant = Class.create( ExampleAssistantBase, {
	fwl : {'launchToScene':'textfield'},
	setup: function($super) {
		$super();
		this.attributes = {
			hintText: $L('Enter text...'),
			modelProperty: 'original',
			multiline: false,
			label: $L('To:'),
			focus: true
		};
		this.attributes2 = {
			hintText: $L('Enter address...'),
			modelProperty: 'original',
			textReplacement: false,
			acceptBack: true
		};
		this.model = {
			'original' : $L(''),
			disabled: false
		};
		this.otherModel = {
			'original' : $L('This is an example of text which is too long to fit in one line.'),
			disabled: false
		};
		
		this.controller.setupWidget('textField', this.attributes, this.model);
		this.controller.setupWidget('reply-to', this.attributes2, this.otherModel);
	},
	
	
});