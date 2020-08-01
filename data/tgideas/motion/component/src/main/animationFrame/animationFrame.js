define(function(require, exports, module){
	var lastTime = 0;
	var vendors = ['ms', 'moz', 'webkit', 'o'];
	var request, cancel;
	for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
		request = window[vendors[x]+'RequestAnimationFrame'];
		cancel = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
	}

	if (!request) {
		request = function(callback, element) {
			var currTime = new Date().getTime();
			var timeToCall = Math.max(0, 16 - (currTime - lastTime));
			var id = window.setTimeout(function() { 
				callback(currTime + timeToCall); 
			},timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};
	}

	if (!cancel) {
		cancel = function(id) {
			clearTimeout(id);
		};
	}

	Motion.add('mo.animationFrame', {
		"request" : request,
		"cancel" : cancel
	});
})