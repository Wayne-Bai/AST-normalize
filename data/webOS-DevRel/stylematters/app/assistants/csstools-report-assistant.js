CsstoolsReportAssistant = Class.create( CSSTools, {
	reportData : null,
	initialize : function(reportData){
		this.reportData = reportData;
	},
	setup : function(){
		//set the title and description
		$('e_title').innerHTML = "CSS Report for " + this.reportData.description;
		$('e_description').innerHTML = "A list of all, styles used by the " + this.reportData.description + " scene.";
		$('css_tools_report').innerHTML = this.reportData.reportdata;
		this.controller.setupWidget('code_scroller', {mode: 'horizontal'});
	},
	activate : function(){
		
	},
	deactivate : function(){
		
	},
	presentReport : function(){
		
	}
});