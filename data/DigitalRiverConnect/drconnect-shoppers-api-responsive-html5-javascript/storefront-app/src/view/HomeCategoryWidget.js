var ns = namespace('dr.acme.view');

/**
 * Home category widget
 * 
 * Renders a category and its first 3 products
 * 
 */
ns.HomeCategoryWidget =  ns.Widget.extend({
    layoutTemplate: "#featured-category-template",
    
    init: function(parent) {
        this._super(parent);
        this.productsView = new dr.acme.view.HomeCategoryProductsWidget();
    },
    
    /**
     * Gets a Category
     */
    getCategory: function() {
        return this.model;
    },
    
    /**
     * Sets a Category
     */
    setCategory: function(cat) {
        this.model = cat;
    },
    
    /**
     * Sets the products for Category
     */
    setProducts: function(products) {
        this.productsView.setProducts(products);
    },
    
    /**
     * Gets the products for Category
     */
    getProducts: function() {
        return this.productsView.getProducts();
    },
    
    /**
     * Renders the widget
     */
    render: function(append) {
        this._super(append);
        if(this.modelIsDefined()) {
            this.productsView.setParent(this.find(".category_panel"));
            this.productsView.render(true);
        }        
    },
    
    /**
     * Renders the products inside the widget
     */
    renderProducts: function(append) {
        if(this.modelIsDefined() && this.getProducts()) {
            this.productsView.setParent(this.find(".category_panel"));
            this.productsView.render(true);
        }else{
        	this.renderErrorOrEmpty();
        }
    },
    
    /**
	 * Renders an error or an empty message inside the widget
	 */
    renderErrorOrEmpty: function(error) {
		this.productsView.setParent(this.find(".category_panel"));
		this.productsView.renderErrorOrEmpty(error);
    }
});