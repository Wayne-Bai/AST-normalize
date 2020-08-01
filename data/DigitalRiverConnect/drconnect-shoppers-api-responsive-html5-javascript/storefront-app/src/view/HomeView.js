var ns = namespace('dr.acme.view')

/**
 * Home View
 * 
 * Will render the model in different ways depending on the function
 * called. They replace the html template in the layout specified
 * with the provided model
 * 
 */
ns.HomeView = ns.BaseView.extend({
	/**
     * Name of the root element for this view
     */
    elementSelector: "#contentArea",
    layoutTemplate: "#homeTpl",
    
    /**
     * Events this view dispatches
     */
    events: {
        ADD_TO_CART: "AddToCart",
        CATEGORY_SELECTED: "CategorySelected"
        
    },
    
    /**
     * Handlers for the DOM events must be registered in this method
     */
    initDOMEventHandlers: function() {
        this.addDomHandler(".btn-add-to-cart", "click", this.onAddToCartButtonClick);
        this.addDomHandler(".homeCategories .drop_down_menu", "change", this.onCategorySelected);
    },
    
    /**
     * "Add to Cart" button click handler
     */
    onAddToCartButtonClick: function(e, productId) {
        this.dispatchEvent(this.events.ADD_TO_CART, {productId: $(e.target).attr("data-product-id")});
    },
    
    onCategorySelected: function(e){
    	this.dispatchEvent(this.events.CATEGORY_SELECTED, {value: e.currentTarget.value});
    },
        
	/**
	 * Render loader or the actual product
	 */
	render: function() {
	    this.applyTemplate(this.elementSelector, this.layoutTemplate);   
	       $('.item').first().addClass('active');
	},
	bindEvent:function(){
		this._super(".nav-collapse ul.nav li a", function(){
			$(".collapse").collapse('hide');
		});
	},
	
	/*********************************************************/
	
	/**
	 * Promotional offers Loader rendering while waiting for the Apigee response
	 */
	renderOffersLoader: function() {
		this.applyTemplate("#feature-product", "#loader",{message: "Loading Offers..."});
	},
	
	/**
	 * Promotional offers rendering as a slider
	 */
	renderOffers: function(model) {
		// If the offer has products shows them
		if(model.featuresProducts){
			this.applyTemplate("#feature-product", "#promotionalTemplate",model);
		}else{
			// Otherwise show an empty message
			this.applyTemplate("#feature-product", "#promotionalTemplateEmptyOrError");
		}	    
        this.renderSlider();
	},
	
	/**
	 * Renders an error on the featured products if the service call fails
	 */
	renderOfferError: function(error) {
		this.applyTemplate("#feature-product", "#promotionalTemplateEmptyOrError",error);	    
        this.renderSlider();
	},
	
	/**
	 * Categories left side menu Loader rendering while waiting for the Apigee response
	 */
	renderCategoriesLoader: function() {
		this.applyTemplate("#categories-product", "#loader",{message: "Loading Categories..."});      
	},
	
	/**
	 * Categories left side menu rendering
	 */
	renderCategories: function(model) {
		this.applyTemplate("#categories-product", "#categoryLeftMenu", model);	    
	},
	
	/**
	 * Renders the offers slider
	 */
	renderSlider:function(){
		 $('.carouselDiv').flexslider({
             animation: "slide",
             slideshowSpeed: 2000, 
             controlNav: true, 
             animationLoop: true, 
             directionNav: true, 
             pauseOnHover: true,
             prevText: "‹",
             nextText: "›",
             controlsContainer: ".flexslider-controls"});	 
	}
});
