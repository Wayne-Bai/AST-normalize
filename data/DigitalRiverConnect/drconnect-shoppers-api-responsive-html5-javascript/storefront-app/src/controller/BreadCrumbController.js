var ns = namespace("dr.acme.controller")

/**
 * BreadCrumb Controller manager
 * 
 * This Controller will link the views with the managers required
 * It overrides functions inherits from the BaseController, to initialize (init)
 * and exectute (doIt) the main purpose of this manager.   
 */
ns.BreadCrumbController = ns.BaseController.extend({
   
    /**
     * init method override from the BaseController
     */
	init:function (){
		this._super(new dr.acme.view.BreadCrumbView());		
	},
	
	/**
     * doIt method override from the BaseController
     */	
    doIt:function(params){
    	 this.view.binderEvents();
    	 this.view.render({bread:this.getBread(params.path), uriNavigate:$.address.value()});
    },
    
    /**
     * Get bread crumb name for the path given
     * 
     * @param 	path	url path for the section
     * @return			bread crumb name
     */
	getBread:function(path){
		var bread = dr.acme.runtime.BREADCRUMB_MAP[path];
		return bread;
	}
});
