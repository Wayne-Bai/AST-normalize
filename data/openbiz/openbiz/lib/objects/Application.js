/**
 * @class Application
 * @classdesc
 * The Application object is containner of an openbiz based server side application.
 *
 * Each application module should based on this class to extend it's own feature.
 * The application itself can provides basic methods to get its controllers and models
 *
 * For easy to access, this class also alias as {@link openbiz.Application}.
 *
 * Normally the first thing after you instance an application class is call its {@link openbiz.objects.Application.loadToRoute | loadToRoute} methods to load itself to express router.
 * Otherwise even you have inited an openbiz application, you still cannot access it.
 *
 * @constructs openbiz.objects.Application
 * @param {object.<string,object>} options - an object of {modules:{},routes:{},policies:{}}
 * @returns {openbiz.objects.Application}
 * @author Jixian Wang <jixian@openbiz.me>
 * @version 4.0.0
 * @copyright {@link http://www.openbiz.me|Openbiz LLC}
 * @license {@link http://opensource.org/licenses/BSD-3-Clause|BSD License}
 *
 * @todo 增加每个应用的配置功能
 *          app.config.get('setting-name')
 *          app.config.set('setting-name',value)
 *
 * @example
 * // below sample show you how to create a new application model which extends this module.
 * module.exports = function(openbiz)
 * {
 *     if(typeof openbiz != 'object') return null;
 *     var application = new openbiz.Application({
 *         _context : openbiz.context,
 *         _name : require('path').basename(__dirname),
 *         _path : __dirname,
 *         openbiz: openbiz
 *     });
 *     return application;
 * }
 */
'use strict';
module.exports = require("./Object").extend(
{
    _context: null,

    _name:null,

    _path:null,

    _ui:null,

    info:null,

    openbiz: null,

    caches:[],

    /**
     * Application's modules
     * key/value pair of moduleName/moduleClass
     * @memberof openbiz.objects.Application
     * @type {object.<string,openbiz.objects.Module>}
     * @instance
     */
	modules  : {},


    /**
     * Application's security policies
     * key/value pair of policyName/policyFunction
     * @memberof openbiz.objects.Application
     * @type {object.<string,function>}
     * @instance
     */
	policies : {},


    /**
     * Application's routes
     * key/value pair of routeRule/Array of middle-wares
     * @memberof openbiz.objects.Application
     * @type {object.<string,function>}
     * @instance
     */
	routes 	 : {},

	ctor: function(options)
    {                        
        this.modules    = {};        
        this.roles      = {};      
        this.exceptions = {};    
        this.nls        = {};
        this.services   = {};
        this.routes     = {};
        this.policies   = {};
        this.storage    = {};
		for(var i in options)
		{
			this[i] = options[i];
		}
        console.log("Application "+this._name);            
        this.defaultRoles = [];
        this.caches     = [];
        this.modules    = this.openbiz.loaders.ModuleLoader(this);
        this.policies   = this.openbiz.loaders.PolicyLoader(this);
        this.roles 	    = this.openbiz.loaders.RoleLoader(this);
        this.exceptions = this.openbiz.loaders.ExceptionLoader(this);
        this.nls        = this.openbiz.loaders.NlsLoader(this);
        this.services   = this.openbiz.loaders.ServiceLoader(this);
        this.routes 	= this.openbiz.loaders.RouteLoader(this);
        this.info       = JSON.parse(require('fs')
                              .readFileSync(require('path').join(
                                        require('path').dirname(this._path),'package.json')
                                        ,'utf-8'));
        
        

        //if storage path doesnt exists , then create an empty folder   
        if(typeof options.storage != 'undefined'){     
            if(typeof this.openbiz.storage.path!='undefined' ){
                var path = this.openbiz.storage.path+"/"+this._name;
                if(this.openbiz.storage.type.toLowerCase()=='fs'){
                    if(!require('fs').existsSync(path)){
                        require('fs').mkdir(path);
                    }
                }
                this.storage.path = this.openbiz.storage.path+"/"+this._name;
                this.storage.url  = this.openbiz.storage.url+"/"+this._name;            
            }
        }

        this.openbiz.apps[this._name] = this;
        console.log("===================================================\n");   
		return this;
	},
    uiUrl  : null,
    appUrl : null,
    defaultRoles:[],
    /**
     * Mounts current application to specified URL router
     * @memberof openbiz.objects.Application
     * @instance
     * @param {string} routePrefix - The prefix of URL to mount this application instance
     * @returns {openbiz.objects.Application}
     * @example
     * // init cubi app to routes => /app/*
     * openbiz.apps['cubi'].initRoutes('/api');
     */
	loadAppToRoute: function(routePrefix)
	{
		if(routePrefix==='/')routePrefix='';
        this.appUrl = routePrefix;
		var pattern = /^(.*?)\s(.*?)$/
		for(var routePath in this.routes)
		{
			var routePathArray = routePath.match(pattern);
			this.openbiz.context[routePathArray[1]](routePrefix+routePathArray[2],this.routes[routePath]);
		}
        return this;
	},

    loadUIToRoute: function(routePrefix)
    {
        if(this._ui == null ) return this;
        var self = this;
        this.uiUrl = routePrefix;
        this.openbiz.loadedAppUIs.push(this._name);
        var initUILib = function(){
            return function(req,res){
                var uiFile = "main.js"
                if(self.caches.hasOwnProperty(uiFile) && process.env.NODE_ENV=='production'){
                    res.set('Content-Type','application/javascript');
                    res.send(200,self.caches[uiFile]);
                }else{
                    switch(process.env.NODE_ENV){
                      case "development":
                      default:
                        break;                    
                      case "production":  
                        if(require('fs').existsSync(require('path').join(self._ui,"main.min.js"))){
                            uiFile = "main.min.js"
                        }                    
                        break;
                    }   
                    var uiData = require('fs').readFileSync(require('path').join(self._ui,uiFile));
                    var setupAppURL = "appUrl:'"+self.appUrl+"'," ;
                    uiData = uiData.toString().replace(/appUrl\s*?\:\s*?REPLACE_APPURL,/,setupAppURL);
                    var setupBaseURL = "baseUrl:'"+routePrefix+"'," ;
                    uiData = uiData.toString().replace(/baseUrl\s*?\:\s*?REPLACE_BASEURL,/,setupBaseURL);
                    var setupName  = "name:'"+self._name+"'," ;
                    uiData = uiData.toString().replace(/name\s*?\:\s*?REPLACE_APPNAME,/,setupName);
                    self.caches['main.js'] = uiData;
                    res.set('Content-Type','application/javascript');
                    res.send(200,uiData);
                }
            }
        };
        this.openbiz.context.get(routePrefix+'/main.js',initUILib());
        this.openbiz.context.use(routePrefix,require('express').static(this._ui));
    },

    storage:{},
    /**
     * This is an alias of {@link openbiz.services.ObjectService.getModel}
     * @memberof openbiz.objects.Application
     * @method
     * @instance
     * @see {@link openbiz.services.ObjectService.getModel}
     */
    getModel:function(objectName)
    {                
        return require("../services/ObjectService").getModel.call(this,objectName);
    },

    /**
     * This is an alias of {@link openbiz.services.ObjectService.getController}
     * @memberof openbiz.objects.Application
     * @method
     * @instance
     * @see {@link openbiz.services.ObjectService.getController}
     */
    getController:function(objectName)
    {
        return require("../services/ObjectService").getController.call(this,objectName);
    },


    /**
     * This is an alias of {@link openbiz.services.ObjectService.getPolicy}
     * @memberof openbiz.objects.Application
     * @method
     * @instance
     * @see {@link openbiz.services.ObjectService.getPolicy}
     */
    getPolicy:function(policyName)
    {
        return require("../services/ObjectService").getPolicy.call(this,policyName);
    },


    /**
     * This is an alias of {@link openbiz.services.ObjectService.getRole}
     * @memberof openbiz.objects.Application
     * @method
     * @instance
     * @see {@link openbiz.services.ObjectService.getRole}
     */
    getRole:function(roleName)
    {
        return require("../services/ObjectService").getRole.call(this,roleName);
    },

    /**
     * This is an alias of {@link openbiz.services.ObjectService.getExecption}
     * @memberof openbiz.objects.Application
     * @method
     * @instance
     * @see {@link openbiz.services.ObjectService.getExecption}
     */
    getExecption:function(exceptionName)
    {
        return require("../services/ObjectService").getExecption.call(this,exceptionName);
    },

    /**
     * This is an alias of {@link openbiz.services.ObjectService.getNls}
     * @memberof openbiz.objects.Application
     * @method
     * @instance
     * @see {@link openbiz.services.ObjectService.getNls}
     */
    getNls:function(language)
    {
        return require("../services/ObjectService").getNls.call(this,language);
    },

    /**
     * This is an alias of {@link openbiz.services.ObjectService.getService}
     * @memberof openbiz.objects.Application
     * @method
     * @instance
     * @see {@link openbiz.services.ObjectService.getService}
     */
    getService:function(serviceName)
    {
        return require("../services/ObjectService").getService.call(this,serviceName);
    }
});