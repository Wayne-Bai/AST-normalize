var Tea = function(){
	CaffeineBeverage.apply(this);
};
Tea.prototype = new CaffeineBeverage();
Tea.prototype.brew = function(){
	console.log("Steeping the tea!");
};
Tea.prototype.addCondiments = function(){
	console.log("Adding lemon!");
};
