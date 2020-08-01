/**************************************************
* Learn Words // localdtorage.js
* coded by Anatolii Marezhanyi aka e1r0nd//[CRG] - March 2014
* http://linkedin.com/in/merezhany/ e1r0nd.crg@gmail.com
* Placed in public domain.
**************************************************/
if(typeof(localStorageAPI) == 'undefined' || localStorageAPI == null || !localStorageAPI){
	
	localStorageAPI = {
	
		isLocalStorageAvailable: function() {
				try {
					return 'localStorage' in window && window['localStorage'] !== null;
				} catch (e) {
					return false;
				}
			},
		
		readItem: function(key){
			if (localStorageAPI.isOK) {
				return JSON.parse(localStorage.getItem( key ));
			}
		},
		
		removeItem: function(key){
			if (localStorageAPI.isOK) {
				localStorage.removeItem( key );
			}
		},
		
		storeItem: function(key, value){
			if (localStorageAPI.isOK) {
				try {
					localStorage.setItem(key, JSON.stringify(value));
				} catch (e) {
					if (e == QUOTA_EXCEEDED_ERR) {
						alert('Local Storage is full');
					}
					return false;
				}
			}
		},
		
		init: function(){
			localStorageAPI.isOK = false;
			if (!localStorageAPI.isLocalStorageAvailable()) {
				alert('Local Storage is not available.');
				return false;
			}
			localStorageAPI.isOK = true;
		}
	};
	
	localStorageAPI.init();
}

