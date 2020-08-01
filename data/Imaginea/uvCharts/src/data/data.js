uv.data = function (dataset) {
	this.Dataset = dataset;
	this.Columns = {};
	this.Dimensions = {};
	this.Measures = {};
	this.KeySet = {};

	this.dimensions = [];
	this.measures = [];
	this.category = undefined;
	this.dataset = {data : undefined };
};

uv.util.isNumber = function (n) {
	return !isNaN(n);
};

uv.data.prototype.fetch = function () {
	var property;
	this.dataset.data = uv.util.extend([], this.Dataset);

	if (this.dataset.data.length > 0) {
		for (property in this.dataset.data[0]) {
			this.Columns[property] = true;

			if (uv.util.isNumber(this.dataset.data[0][property])) {
				this.Measures[property] = true;
			} else {
				this.Dimensions[property] = true;
				this.KeySet[property] = {};
			}
		}

		for (var i=0, length=this.dataset.data.length; i<length; i++) {
			for(var dimension in this.Dimensions) {
				var value = this.dataset.data[i][dimension];
				this.KeySet[dimension][value] = true;
			}
		}
	}
};

uv.data.prototype.log = function () {
/*	console.log(this.Columns);
	console.log(this.Dimensions);
	console.log(this.Measures);
	
	console.log('KeySet     : ');
	for(key in this.KeySet) {
		var valuestr = '';
		for(value in this.KeySet[key]) {
			valuestr += (value + ',');
		}
		
		console.log('	' + key + ' : ' + valuestr);
	}
*/	
	console.log(this.dataset);
};