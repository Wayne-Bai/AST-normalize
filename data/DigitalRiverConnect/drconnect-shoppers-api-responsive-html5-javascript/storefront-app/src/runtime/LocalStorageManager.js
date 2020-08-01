var ns = namespace('dr.acme.runtime');

/**
 * Local Storage Manager
 */
ns.LocalStorageManager = Class.extend({
    init: function(obj) {
        localStorage.setObj(obj.key, obj.value);
    },    
    getHistory:function(key){
    	localStorage.getObj(key);
    },
    getSize:function(key){
    	if(typeof localStorage.getObj(key) != 'undefined')
    		return localStorage.getObj(key).length;
    },
    removeObj:function(key){
    	localStorage.removeItem(key);
    },
    clearStorage:function(){
    	localStorage.clear();
    }
    
});