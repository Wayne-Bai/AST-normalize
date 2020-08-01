var ns = namespace('dr.acme.view')

/**
 * Checkout View
 * 
 * Will render the model in different ways depending on the function
 * called. They replace the html template in the layout specified
 * with the provided model
 * 
 */
ns.ThanksView = ns.BaseView.extend({
	
 	/**
     * Name of the root element for this view
     */
    elementSelector: "#contentArea",
    layoutTemplate: "#checkoutConfirmTemplate",
	
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
	render: function(orderId){
		this.applyTemplate("#contentArea", "#thanksTemplate", { "orderId": this.getOrderId(), "url": dr.acme.runtime.URI.ORDER_HISTORY_DETAIL + "?orderId=" + this.getOrderId()});	
	},
	
	/**
     * Gets the OrderId
     */
    getOrderId: function() {
        if(this.modelIsDefined()) {
            return this.model;
        } else {
            return null;
        }
    },
    
    /**
	 * OrderId setter
	 */
	setOrderId: function(model) {
	    this.model = model;
	}
	
});
