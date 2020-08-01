var ns = namespace('dr.acme.view');

/**
 * Payment Method Widget
 * 
 * Renders a payment method description
 * 
 */
ns.PaymentMethodWidget =  ns.Widget.extend({
    layoutTemplate: "#paymentMethod_widget",
	
	/**
	 * Sets the PaymentMethod to render
	 */
    setPaymentMethod: function(model) {
        this.model = model;
    },
    
    /**
     * Gets the PaymentMethod
     */
    getPaymentMethod: function() {
        return this.model;
    }
});