var ns = namespace('dr.acme.view')

/**
 * Server Error View
 * 
 * It will render a server error message
 * 
 */
ns.ServerErrorView = ns.BaseView.extend({
	
 	/**
     * Name of the root element for this view
     */
    elementSelector: "#contentArea",
    layoutTemplate: "#serverErrorTemplate",
	
    /**
     * Events this view dispatches
     */
    events: {
	   //This view doesn't have notifications
    },
    
    /**
     * Handlers for the DOM events must be registered in this method
     */
    initDOMEventHandlers: function() {
       //This view doesn't have notifications
    },
    
	
	/*********************************************************/
		
	/**
	 * Thanks Renderer
	 */
	render: function(error){
		this.applyTemplate(this.elementSelector, this.layoutTemplate, error);	
	},
	
});
