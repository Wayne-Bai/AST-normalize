var ns = namespace('dr.acme.view')

/**
 * Checkout Edit View
 * 
 * Will render the model in different ways depending on the function
 * called. They replace the html template in the layout specified
 * with the provided model
 * 
 */
ns.CheckoutEditView = ns.BaseView.extend({
	
 	/**
     * Name of the root element for this view
     */
    elementSelector: "#contentArea",
    layoutTemplate: "#cartEditSkeleton",
	
    /**
     * Events this view dispatches
     */
    events: {
    	SAVE_OPTIONS: "SaveOptions"
    },
    
    /**
     * Handlers for the DOM events must be registered in this method
     */
    initDOMEventHandlers: function() {
        this.addDomHandler("#save", "click", this.onSaveButtonClick);
        this.addDomHandler("#shippingAddress #addressDropDown", "change", this.onShippingAddressChange);
        this.addDomHandler("#billingAddress #addressDropDown", "change", this.onBillingAddressChange);
        this.addDomHandler("#paymentMethod #paymentDropDown", "change", this.onPaymentMethodChange);
    },
    
    /**
     * "Save" button click handler
     */
    onSaveButtonClick: function(e) {
        this.dispatchEvent(this.events.SAVE_OPTIONS, {"shippingAddressId" : this.selectedShippingAddressId, 
        	"billingAddressId": this.selectedBillingAddressId, "paymentOptionId": this.selectedPaymentMethodId });
        this.reset();
    },
    
    /**
     * Shipping Address Drop Down Change Handler
     */
    onShippingAddressChange: function(e){
    	this.selectedShippingAddressId = e.currentTarget.value;
    	this.renderShippingAddressDescription(this.getAddressById(e.currentTarget.value));
    },
    
    /**
     * Billing Address Drop Down Change Handler
     */
    onBillingAddressChange: function(e){
    	this.selectedBillingAddressId = e.currentTarget.value;
    	this.renderBillingAddressDescription(this.getAddressById(e.currentTarget.value));
    },
    
    /**
     * Billing Address Drop Down Change Handler
     */
    onPaymentMethodChange: function(e){
    	this.selectedPaymentMethodId = e.currentTarget.value;
    	this.renderPaymentMethodDescription(this.getPaymentMethodById(e.currentTarget.value));
    },
	
	/*********************************************************/
	
	/**
	 * Render loader or the actual cart
	 */
	render: function() {
		this.applyTemplate(".content", "#cartEditContent", this.getCart());
		this.renderBillingAddresses();
		this.renderShippingAddresses();
		this.renderPaymentOptions();
		 
	},
	
	/**
	 * Render Billing Address Widgets
	 */
	renderBillingAddresses: function(){
		if(!this.getAddresses()) {
			this.showLoaderOnComponent("#billingAddress", "Loading Billing Addresses...");
	    } else {
	    	// this.selectedBillingAddressId = this.getAddresses().address[0].id;
	    	this.selectedBillingAddressId = this.getSelectedAddressFromList(this.getCart().billingAddress).id;
	    	this.applyTemplate("#billingAddress", "#cartEditAddressDropDownList", {"address": this.getAddresses(), "defaultAddressId":this.selectedBillingAddressId});
	    	this.renderBillingAddressDescription(this.getAddressById(this.selectedBillingAddressId));
	    } 
	},
	
	/**
	 * Render Billing Address Description
	 */
	renderBillingAddressDescription: function(address){
		var billingAddressWidget = new dr.acme.view.AddressWidget("#billingAddressDesc", address);
		billingAddressWidget.showTitle(false);
		billingAddressWidget.render(false);
	},
	
	
	/**
	 * Render Shipping Address Widgets
	 */
	renderShippingAddresses: function(){
		if(!this.getAddresses()) {
			this.showLoaderOnComponent("#shippingAddress", "Loading Shipping Addresses...");
	    } else {
	    	this.selectedShippingAddressId = this.getSelectedAddressFromList(this.getCart().shippingAddress).id;
	    	this.applyTemplate("#shippingAddress", "#cartEditAddressDropDownList", {"address": this.getAddresses(), "defaultAddressId":this.selectedShippingAddressId});
	    	this.renderShippingAddressDescription(this.getAddressById(this.selectedShippingAddressId));
	    	
	    } 
	},
	
	/**
	 * Render Shipping Address Description
	 */
	renderShippingAddressDescription: function(address){
		var shippingAddressWidget = new dr.acme.view.AddressWidget("#shippingAddressDesc", address);
		shippingAddressWidget.showTitle(false);
		shippingAddressWidget.render(false);
	},
	
	/**
	 * Render Payment method
	 */
	renderPaymentOptions: function(){
		if(!this.getPaymentOptions()) {
			this.showLoaderOnComponent("#paymentMethod", "Loading Payment Options...");
	    } else {
	    	this.selectedPaymentMethodId = this.getSelectedPaymentFromList(this.getCart().payment).id;
	    	this.applyTemplate("#paymentMethod", "#cartEditPaymentDropDownList", {"paymentOption": this.getPaymentOptions(), "defaultPaymentId": this.selectedPaymentMethodId});
	    	this.renderPaymentMethodDescription(this.getPaymentMethodById(this.selectedPaymentMethodId));
	    } 
	},
	
	/**
	 * Render Shipping Address Description
	 */
	renderPaymentMethodDescription: function(paymentMethod){
		var paymentMethodWidget = new dr.acme.view.PaymentMethodWidget("#paymentMethodDesc", paymentMethod);
		paymentMethodWidget.render(false);
	},
	
	
	/**
     * Gets the Cart
     */
    getCart: function() {
        if(this.modelIsDefined()) {
            return this.model;
        } else {
            return null;
        }
    },
    
    /**
	 * Cart detail setter
	 */
	setCart: function(model) {
	    this.model = model;
	},
	
	/**
     * Gets the Addresses
     */
    getAddresses: function() {
        return this.addresses;
    },
    
    /**
	 * Sets the Addresses
	 */
	setAddresses: function(addresses) {
	    this.addresses = addresses;
	},
	
	/**
     * Gets Payment Options
     */
    getPaymentOptions: function() {
        return this.paymentOptions;
    },
    
    /**
	 * Sets the Payment Options
	 */
	setPaymentOptions: function(paymentOptions) {
	    this.paymentOptions = paymentOptions;
	},
	
	/**
	 * Returns the address with the required id searching it in the local address cache
	 */
	getAddressById: function(id){
		if(this.getAddresses()){
			for(var i = 0; i < this.getAddresses().address.length; i++){
				if(this.getAddresses().address[i].id == id){
					return this.getAddresses().address[i];
				}
			}
			return null;
		}
	},
	
	/**
	 * Returns the address with the required id searching it in the local address cache
	 */
	getPaymentMethodById: function(id){
		if(this.getPaymentOptions()){
			for(var i = 0; i < this.getPaymentOptions().paymentOption.length; i++){
				if(this.getPaymentOptions().paymentOption[i].id == id){
					return this.getPaymentOptions().paymentOption[i];
				}
			}
			return null;
		}
	},
	
	/**
	 * Clear all data related to the view
	 */
	reset: function(){
		this._super();
    	this.addresses = null;
    	this.paymentOptions = null;
    	this.selectedShippingAddressId = null;
    	this.selectedBillingAddressId = null;
    	this.selectedPaymentMethodId = null;
	},
	
	/**
	 * Determines if a adress is equal to another address. 
	 */
	addressEquals: function(address1, address2){
		return ((address1.firstName == address2.firstName || !address1.firstName && !address2.firstName)&&
				(address1.lastName == address2.lastName || !address1.lastName && !address2.lastName)  &&
				(address1.companyName == address2.companyName || !address1.companyName && !address2.companyName) &&
      			(address1.line1 == address2.line1 || !address1.line1 && !address2.line1) &&
      			(address1.line2 == address2.line2 || !address1.line2 && !address2.line2) &&
      			(address1.line3 == address2.line3 || !address1.line3 && !address2.line3) &&
      			(address1.city == address2.city || !address1.city && !address2.city) &&
      			(address1.countrySubdivision == address2.countrySubdivision || address1.countrySubdivision && !address2.countrySubdivision) &&
      			(address1.postalCode == address2.postalCode || !address1.postalCode && !address2.postalCode) &&
      			(address1.country == address2.country || !address1.country && !address2.country) &&
      			(address1.countryName == address2.countryName || !address1.countryName && !address2.countryName) &&
      			(address1.phoneNumber == address2.phoneNumber || !address1.phoneNumber && !address2.phoneNumber) &&
      			(address1.countyName == address2.countyName || !address1.countyName && !address2.countyName));
      
	},
	
	/**
	 * Gets the selected address from the list comparing it with the setted in the cart
	 */
	getSelectedAddressFromList: function(cartAddress){
		for(var i = 0; i < this.getAddresses().address.length; i++){
			if(this.addressEquals(cartAddress, this.getAddresses().address[i])){
				return this.getAddresses().address[i];	
			}
		}
	},
	
	/**
	 * Determines if a payment method is equal to another one
	 */
	paymentEquals: function(payment1, payment2){
		return ((payment1.name == payment2.type || !payment1.name && !payment2.type) &&
				(payment1.expirationMonth == payment2.expirationMonth || !payment1.expirationMonth && !payment2.expirationMonth)&&
				(payment1.expirationYear == payment2.expirationYear || !payment1.expirationYear && !payment2.expirationYear));
	},
	
	/**
	 * Gets the selected payment method from the list comparing it with the setted in the cart 
	 */
	getSelectedPaymentFromList: function(payment){
		for(var i = 0; i < this.getPaymentOptions().paymentOption.length; i++){
			if(this.paymentEquals(payment, this.getPaymentOptions().paymentOption[i].creditCard)){
				return this.getPaymentOptions().paymentOption[i];	
			}
		}
	}
	

});
