var days = new Array(l('sunday.short'), l('monday.short'), l('tuesday.short'), l('wednesday.short'), l('thursday.short'), l('friday.short'), l('saturday.short'), l('sunday.short') );
var longdays = new Array(l('sunday'), l('monday'), l('tuesday'), l('wednesday'), l('thursday'), l('friday'), l('saturday'), l('sunday') );
var tmdbApiKey = '';

/**
 * %ti		title
 * %su		subtitle
 * %ds_su	dash with subtitle
 * %ds		dash
 * %ep		episode
 * %ds_ep	dash with episode
 * %st		start time
 * %sdt		start date and time
 * %et		end time
 * %edt		end date and time
 * %pb		progress bar
 * %du		duration
 * %ch		channel
 * %pr		priority
 * %br		break/newline
 */
var layouts =
{'polini':
	{
	'current': '%st%pb%et%br<b>%ti</b>%ds_ep%br%su',
	'epg': '<span class="small">%st</span> %ti<div class="small">%su</div>',
	'search': '%ti%ds_ep<div class="small">%st%ds%ch%ds_su</div>',
	'dvr': '%ti%ds_ep<div class="small">%st (%du)%ds_su%ds%pr%ch</div>',
	},
'gborri':
{
	'current': '%st%pb%et%br<b>%ti</b>%ds_su%br%ep',
	'epg': '%ti%ds_su<div class="small">%st%ds_ep</div>',
	'search': '%ti%ds_su<div class="small">%st%ds%ch%ds_ep</div>',
	'dvr': '%ti%ds_su<div class="small">%st (%du)%ds_ep%ds%pr%ch</div>',
	}
};

var layout = layouts['gborri']; 

function doPost(path, callback, params) {
	doPostWithParam(path, callback, params, null);
}

function doPostWithParam(path, callback, params, ownParam) {
	var http = new XMLHttpRequest();  	
	http.open("POST", "../../"+path, true);
	http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	http.setRequestHeader("Content-length", params.length);
	http.setRequestHeader("Connection", "close");
	http.ownParam = ownParam;

	http.onreadystatechange = function() {
		if(http.readyState == 4 && http.status == 200) {
			var response = eval("[" + http.responseText + "]");
			response[0].param = http.ownParam;
			callback(response[0]);
		}
	};

	http.send(params);
}

function nvl(val) {
	return val != undefined ? val : '';
}

function getDuration(seconds) {
	var minutes = seconds/60;
	var m = Math.round(minutes % 60);
	var h = Math.round((minutes-m) / 60);
	var mt = (m < 10 ? '0' : '') + m;
	return h + ':' + mt;
}

function l(key) {
	var fallback = 'en';
	var lang = navigator.language != undefined ? navigator.language.substring(0,2) : fallback;
	if (i18nstrings[lang] != undefined && i18nstrings[lang][key] != undefined)
		return i18nstrings[lang][key];
	else if (i18nstrings[fallback][key] != undefined)
		return i18nstrings[fallback][key];
	else
		return key;
}

function getDateTimeFromTimestamp(timestamp, showDay) {
	var date = new Date(timestamp*1000);
	return getDate(date, showDay)+' '+getTime(date);
}

function getDateFromTimestamp(timestamp, showDay) {
	var date = new Date(timestamp*1000);
	return getDate(date, showDay);
}

function getTimeFromTimestamp(timestamp) {
	var date = new Date(timestamp*1000);
	return getTime(date);
}

function z(s){s=''+s;return s.length>1?s:'0'+s;}

function getDate(d, showDay)
{
	var day = days[d.getDay()];
	var y=d.getFullYear(),m=d.getMonth()+1,dd=d.getDate();
	f=l('dateFormat');
	f=f.replace(/yyyy/,y);f=f.replace(/yy/,String(y).substr(2));
	f=f.replace(/MM/,z(m));f=f.replace(/M/,m);
	f=f.replace(/dd/,z(dd));f=f.replace(/d/,dd);
	return (showDay?day+' ':'')+f;
}

function getTime(d)
{
	return z(d.getHours())+":"+z(d.getMinutes());
}

function append(html) {
	document.getElementById('last').outerHTML = html + document.getElementById('last').outerHTML;
}

function loadStandardTable(table, callback) {
	doPost("tablemgr", callback, "op=get&table="+table);
}

function doGet(path, callback) {
	var http = new XMLHttpRequest();  	
	http.open("GET", "../../"+path, true);
	http.path = path;

	http.onreadystatechange = function() {
		if(http.readyState == 4 && http.status == 200) {
			var response = eval("[" + http.responseText + "]");
			response[0].path = http.path;
			callback(response[0]);
		}
	};

	http.send(null);
}

function image(url, align, size, black) {
	var s = size != undefined ? size : 35;
	var a = align != undefined ? align : 'top';
	var b = (black != undefined && black == true) ? ' style="background-color:black;"' : '';
	if (url)
		return '<img'+b+' src="'+url+'" align="'+a+'" width="'+s+'px" />';
	else
		return '';
}

function icon(path,align) {
	var alignt = align != undefined ? ' align="'+align+'"' : '';
	if (path)
		return '<img src="'+path+'"'+alignt+' height="16px" width="16px" />';
	else
		return '';
}
