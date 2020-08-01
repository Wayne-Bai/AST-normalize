DialogErrorsAssistant = Class.create( ExampleAssistantBase, {
	fwl : {'launchToScene':'dialogs'},
	setup : function($super){
		$super();
	
		this.signInButtonModel = {buttonClass:'primary', buttonLabel:$L('Download'), disabled:false};
		this.controller.setupWidget('download-button', {type: Mojo.Widget.activityButton}, this.signInButtonModel);
		
		this.signInButton = this.controller.get('download-button');
		this.controller.listen('download-button', Mojo.Event.tap, this.showErrorDialog.bind(this));
	},
	activate: function(result) {
	
	},
	showErrorDialog: function() {
		var callback = this.activate.bind(this);
		this.controller.showAlertDialog({
			onChoose: function() {callback();},
			title: $L('Unable to download file'),
			message: $L('resume.doc could not be downloaded. Please try again later.'),
			choices: [{label:$L('Dismiss'), value:'dismiss', type:'secondary'}]
		});
		
		this.signInButtonModel.buttonLabel = $L('Download');
		this.controller.modelChanged(this.signInButtonModel);
		this.signInButton.mojo.deactivate();
	}
});