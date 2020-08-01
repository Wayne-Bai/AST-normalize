String.prototype.endsWith = function(str){
    var lastIndex = this.lastIndexOf(str);
    return (lastIndex != -1) && (lastIndex + str.length == this.length);
};

String.prototype.startsWith = function(str){
    return (this.indexOf(str) === 0);
};

String.prototype.trim = function() {
	return this.replace(/^\s+|\s+$/g,"");
};


exports.arrayToString = function(arr){
	var output = "";
	for (property in arr)
		output += property + ': ' + arr[property]+'; ';
	return output;
};

exports.getSessionId = function(cookieHeader){
	if(cookieHeader == undefined)
		return undefined;	
	var start = cookieHeader.indexOf("njssession");
	if(start == -1)
		return undefined;
	else{
		current = cookieHeader.substring(start);
		current = current.split("=")[1];
		return current.split(";")[0];
	}
};


Date.prototype.format = function ( formatString) {
	var months = new Array("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec");
	var yyyy = this.getFullYear();
	var yy = yyyy.toString().substring(2);
	var m = this.getMonth();
	var mm = m < 10 ? "0" + m : m;
	var mmm = months[m];
	var d = this.getDate();
	var dd = d < 10 ? "0" + d : d;
	
	var h = this.getHours();
	var hh = h < 10 ? "0" + h : h;
	var n = this.getMinutes();
	var nn = n < 10 ? "0" + n : n;
	var s = this.getSeconds();
	var ss = s < 10 ? "0" + s : s;

	formatString = formatString.replace(/yyyy/i, yyyy);
	formatString = formatString.replace(/yy/i, yy);
	formatString = formatString.replace(/mmm/i, mmm);
	formatString = formatString.replace(/mm/i, mm);
	formatString = formatString.replace(/m/i, m);
	formatString = formatString.replace(/dd/i, dd);
	formatString = formatString.replace(/d/i, d);
	formatString = formatString.replace(/hh/i, hh);
	formatString = formatString.replace(/h/i, h);
	formatString = formatString.replace(/nn/i, nn);
	formatString = formatString.replace(/n/i, n);
	formatString = formatString.replace(/ss/i, ss);
	formatString = formatString.replace(/s/i, s);

	return formatString;
};