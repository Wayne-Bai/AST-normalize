/*
 * tipJS - OpenSource Javascript MVC Framework ver.1.26
 *
 * Copyright 2012.07 SeungHyun PAEK
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * HomePage: http://www.tipjs.com
 * Contact: http://www.tipjs.com/contact
 */

/* tipJS initialization */
var tipJS = tipJS || {};
tipJS.ver = tipJS.version = "1.26";
(function() {
	/**
	 * overwrite Object 에 존재하는 속성 이외의 항목을 base Object의 속성과 병합
	 *
	 * @param overwrite
	 * @param base
	 * @return 병합된 Object
	 */
	var __mergeObject__ = function(overwrite, base) {
		for (var k in base) {
			if (overwrite[k])
				continue;
			overwrite[k] = base[k];
		}
		return overwrite;
	}

	/**
	 * depart Object 를 departType 으로 등록
	 *
	 * @param departType
	 * @param depart
	 */
	var __registDepart__ = function(departType, depart) {
		if (!depart || typeof depart != "object" || (!depart.__name && !depart.name))
			throw "Please check your " + departType + " definition";

		var _appDepartName = (depart.__name) ? depart.__name : depart.name;
		if (typeof (_appDepartName) != "string")
			throw "Please check your " + departType + " definition";

		if (depart.__extend && depart.__extend === _appDepartName && departType != "controllers")
			throw "Can't extend itself";

		var _arrAppDepart = _appDepartName.split("."),
			_appName = _arrAppDepart[0],
			_departName = _arrAppDepart[1],
			_app = __getApp__(_appName);

		if (!_app)
			throw "Please check your " + departType + " definition";

		if (_app.loadOrder.presentOrder() === departType) {
			if (departType == "controllers")
				depart.__appName__ = _appName;
			else
				if (depart.__name) delete depart.__name;

			__TIPJS_TPL__.depart[_appName] = __TIPJS_TPL__.depart[_appName] || {};
			__TIPJS_TPL__.depart[_appName][departType] = __TIPJS_TPL__.depart[_appName][departType] || {};
			__TIPJS_TPL__.depart[_appName][departType][_departName] = depart;
		}
	}

	/**
	 * Application 에 속하는 파일들을 경로가 포함된 파일로 리스트화
	 *
	 * @param define
	 * @param depart
	 * @return File Path를 포함한 List
	 */
	var __makeAppReqFileList__ = function(define, depart) {
		if (depart === __TIPJS_TPL__.OBJ_TPL.loadOrder.order[0])
			return __uniqArray__(define[depart]);

		var _appName = define.name, _path = __config__.path[depart],
			_appRoot = __config__.applicationPath[_appName],
			_departs = __uniqArray__(define[depart]);
		return __getUnitPathList__(_appRoot, _path, _departs);
	}

	/**
	 * Application 에 속하는 unit(depart)의 File Path를 작성
	 *
	 * @param rootPath
	 * @param unitPath
	 * @param unit
	 * @return unit의 File Path
	 */
	var __getUnitPathList__ = function(rootPath, unitPath, unit) {
		var _ret = [];
		for (var i = unit.length; i--;) {
			_ret.push(rootPath + __wrapPath__(unitPath) + unit[i]);
		}
		return _ret;
	}

	/**
	 * JS File 의 NoCache 처리를 위한 Query String 을 작성
	 *
	 * @param file
	 * @param config
	 * @return Query String
	 */
	var __makeNocacheStr__ = function(file, config) {
		if (config && config.nocache === true) {
			file = (file.indexOf("?") < 0) ? file + "?" : file + "&";
			file = file + config.paramName + "=" + config.version;
		}
		return file;
	}

	/**
	 * JS File Load
	 *
	 * @param file
	 * @param noCacheOpt
	 * @param callbackFn
	 */
	var __loadJsFile__ = tipJS.loadJS = function(file, noCacheOpt, callbackFn) {
		var _tagScript = document.createElement('script');
		_tagScript.type = 'text/javascript';
		_tagScript.src = __makeNocacheStr__(file, noCacheOpt);
		_tagScript.charset = __config__.charSet;

		if (callbackFn) {
			if (_tagScript.readyState) {
				_tagScript.onreadystatechange = function() {
					if (this.readyState == 'loaded' || this.readyState == 'complete') {
						this.onreadystatechange = null;
						callbackFn(this);
					}
				}
			} else {
				_tagScript.onload = function() {
					callbackFn(this);
				}
			}
		}
		document.getElementsByTagName('head')[0].appendChild(_tagScript);
	}

	/**
	 * Application에 속해 있는 JS File 을 읽어들임
	 *
	 * @param appName
	 * @param depart
	 * @param file
	 */
	var __loadAppSubFile__ = function(appName, depart, file) {
		var _callback = function(scriptTag) {
			if (__checkAppFileAllLoaded__(appName, depart, scriptTag.src))
				__afterAppLoaded__(appName);
		}
		__loadJsFile__(file, __getAppNoCacheInfo__(appName), _callback);
	}

	/**
	 * Application에 속해 있는 각각의 Part 를 읽어들인 후 모두 완료되면 Application 초기화 메소드를 호출
	 *
	 * @param appName
	 * @param depart
	 */
	var __loadDepart__ = function(appName, depart) {
		__initAppTplNS__(appName, depart);
		var _define = __getAppDefine__(appName);
		var _requireList = __makeAppReqFileList__(_define, depart);
		__TIPJS_TPL__[appName][depart].requireList = _requireList;
		if (_requireList.length > 0) {
			for (var i = _requireList.length; i--;) {
				__loadAppSubFile__(appName, depart, _requireList[i]);
			}
		} else
			__afterAppLoaded__(appName);
	}

	/**
	 * Model object 의 extension
	 *
	 * @param child
	 * @return extended Object
	 */
	var __extendModel__ = function(child){
		if (!child.__extend)
			return child;

		if (typeof child.__extend === "string") {
			child = __getExtendedObj__(child, child.__extend);
		} else if (child.__extend instanceof Array) {
			var _parents = child.__extend;
			for (var i = _parents.length; i--;) {
				child = __getExtendedObj__(child, _parents[i]);
			}
		}
		delete child.__extend;
		return child;
	}

	/**
	 * Model object 의 extension
	 *
	 * @param child
	 * @param parent
	 * @return extended Object
	 */
	var __getExtendedObj__ = function(child, parent){
		var _arrExtend = parent.split(".");
		if (_arrExtend.length == 2)
			return __mergeObject__(child, __loadModel__(_arrExtend[1], false, _arrExtend[0]));
		else
			return __mergeObject__(child, __loadCommonModel__(parent));
	}

	/**
	 * tipJS 의 config file 에 정의된 commonModel 을 작성 후 반환
	 *
	 * @param modelName
	 * @param loadType
	 * @return commonModel Object
	 */
	var __loadCommonModel__ = tipJS.loadCommonModel = function(modelName, loadType) {
		var _models = __TIPJS_TPL__.common.models;
		if (!_models[modelName] || _models[modelName] == undefined)
			throw "Could not find commonModel: " + modelName;

		// synchronized model
		if (loadType === true) {
			var _syncModels = __TIPJS_TPL__.common.syncModels;
			if (!_syncModels)
				_syncModels = __TIPJS_TPL__.common.syncModels = {};

			if (_syncModels[modelName])
				return _syncModels[modelName];

			var _syncModel = _syncModels[modelName] = __extendModel__( __cloneObject__(_models[modelName]) );

			if (modelName.lastIndexOf("VO") == (modelName.length - 2)){
				if (typeof _syncModel.__init === "function") {
					_syncModel.__init();
					delete _syncModel.__init;
				}
				return _syncModel;
			}
			_syncModel.loadCommonModel = __loadCommonModel__;
			if (typeof _syncModel.__init === "function") {
				_syncModel.__init();
				delete _syncModel.__init;
			}
			return _syncModel;
		}
		var _ret = __extendModel__( __cloneObject__(_models[modelName]) );

		if (modelName.lastIndexOf("VO") == (modelName.length - 2)) {
			if (typeof _ret.__init === "function") {
				_ret.__init();
				delete _ret.__init;
			}
			return _ret;
		}
		_ret.loadCommonModel = __loadCommonModel__;
		if (typeof _ret.__init === "function") {
			_ret.__init();
			delete _ret.__init;
		}
		return _ret;
	}

	/**
	 * tipJS 의 define file 에 정의된 Application Model 을 작성 후 반환
	 *
	 * @param modelName
	 * @param loadType
	 * @param appName
	 * @return Application Model Object
	 */
	var __loadModel__ = function(modelName, loadType, appName) {
		var _appName = (!appName) ? __getCurrAppName__() : appName,
			_models = __TIPJS_TPL__.depart[_appName].models;

		if (!_models[modelName] || _models[modelName] == undefined)
			throw "Could not find model: " + modelName;

		// synchronized model
		if (loadType === true) {
			var _syncModels = __TIPJS_TPL__.depart[_appName].syncModels;
			if (!_syncModels)
				_syncModels = __TIPJS_TPL__.depart[_appName].syncModels = {};

			if (_syncModels[modelName])
				return _syncModels[modelName];

			var _syncModel = _syncModels[modelName] = __extendModel__( __cloneObject__(_models[modelName]) );

			if (modelName.lastIndexOf("VO") == (modelName.length - 2)) {
				if (typeof _syncModel.__init === "function") {
					_syncModel.__init();
					delete _syncModel.__init;
				}
				return _syncModel;
			}
			_syncModel.loadCommonModel = __loadCommonModel__;
			_syncModel.loadModel = __loadModel__;
			if (typeof _syncModel.__init === "function") {
				_syncModel.__init();
				delete _syncModel.__init;
			}
			return _syncModel;
		}
		var _ret = __extendModel__( __cloneObject__(_models[modelName]) );

		if (modelName.lastIndexOf("VO") == (modelName.length - 2)) {
			if (typeof _ret.__init === "function") {
				_ret.__init();
				delete _ret.__init;
			}
			return _ret;
		}
		_ret.loadCommonModel = __loadCommonModel__;
		_ret.loadModel = __loadModel__;
		if (typeof _ret.__init === "function") {
			_ret.__init();
			delete _ret.__init;
		}
		return _ret;
	}

	/**
	 * tipJS 의 define file 에 정의된 Application Model 을 작성 후 반환
	 *
	 * @param appModelName
	 * @param loadType
	 * @return Application Model Object
	 */
	var __loadAppModel__ = tipJS.loadModel = function(appModelName, loadType) {
		var _loadType = (typeof (loadType) === "boolean") ? loadType : false;
		try {
			var _arrName = appModelName.split("."), _appName = _arrName[0], _ModelName = _arrName[1];
			return __loadModel__(_ModelName, _loadType, _appName);
		} catch(e) {
			throw "tipJS.loadModel : invalid parameter";
		}
	}

	/**
	 * tipJS 의 Application Object 를 반환
	 *
	 * @param appName
	 * @return Application Object
	 */
	var __getApp__ = function(appName) {
		return __app__[appName];
	}

	/**
	 * tipJS 의 Application 정의 Object 를 반환
	 *
	 * @param appName
	 * @return Application 정의 Object
	 */
	var __getAppDefine__ = function(appName) {
		return __app__[appName].define;
	}

	/**
	 * Application 의 NoCache 설정정보 Object 를 반환
	 *
	 * @param appName
	 * @return NoCache 정보 Object
	 */
	var __getAppNoCacheInfo__ = function(appName) {
		var _ret = {};
		var _define = __getAppDefine__(appName);
		if (_define) {
			var _nocacheVersion = _define.noCacheVersion;
			if (_define.noCacheAuto === true)
				_nocacheVersion = "" + Math.random();

			_ret.nocache = _define.noCache;
			_ret.version = _nocacheVersion;
			_ret.paramName = _define.noCacheParam;
		}
		return _ret;
	}

	/**
	 * 현재 lifecycle의 controller를 반환
	 *
	 * @return Controller Object
	 */
	var __getCurrentCtrler__ = function() {
		return __app__.ctrlerStack[__app__.ctrlerStack.length-1];
	}

	/**
	 * 현재 lifecycle의 controller를 기준으로 application name를 반환
	 *
	 * @return application name
	 */
	var __getCurrAppName__ = tipJS.getLiveAppName = function() {
		return __getCurrentCtrler__().__appName__;
	}

	/**
	 * Application 이 모두 load 된후 실행되는 메소드
	 * Application 의 모든 Controller 의 재정의 후 define file 에서 정의된 onLoad 메소드 호출
	 *
	 * @param appName
	 */
	var __afterAppLoaded__ = function(appName) {
		var _app = __getApp__(appName);
		if (_app.loadOrder.isLastOrder() === false) {
			__loadDepart__(appName, _app.loadOrder.nextOrder());
			return;
		}
		var _loadCommonView = function(viewName) {
			var _views = __TIPJS_TPL__.common.views;
			if (!_views || !_views[viewName] || _views[viewName] == undefined)
				throw "Could not find commonView: " + viewName;

			var _ret = __cloneObject__(_views[viewName]);
			_ret.loadCommonView = _loadCommonView;
			_ret.renderTemplate = __getTemplate__;
			if (_ret.__extend && typeof _ret.__extend === "string") {
				_ret = __mergeObject__(_ret, _loadCommonView(_ret.__extend));
				delete _ret.__extend;
			}
			if (typeof _ret.__init === "function") {
				_ret.__init();
				delete _ret.__init;
			}
			return _ret;
		}
		var _loadView = function(viewName, appName) {
			var _appName = (!appName) ? __getCurrAppName__() : appName,
				_views = __TIPJS_TPL__.depart[_appName].views;
			if (!_views || !_views[viewName] || _views[viewName] == undefined)
				throw "Could not find view: " + viewName;

			var _ret = __cloneObject__(_views[viewName]);
			_ret.loadCommonView = _loadCommonView;
			_ret.loadView = _loadView;
			_ret.renderTemplate = __getTemplate__;
			if (_ret.__extend && typeof _ret.__extend === "string") {
				var _arrExtend = _ret.__extend.split(".");
				if (_arrExtend.length == 2)
					_ret = __mergeObject__(_ret, _loadView(_arrExtend[1], _arrExtend[0]));
				else
					_ret = __mergeObject__(_ret, _loadCommonView(_ret.__extend));

				delete _ret.__extend;
			}
			if (typeof _ret.__init === "function") {
				_ret.__init();
				delete _ret.__init;
			}
			return _ret;
		}
		var _ctrlers = _app.controller = __TIPJS_TPL__.depart[appName].controllers;
		if (_ctrlers) {
			for (var k in _ctrlers) {
				_ctrlers[k].loadCommonModel = __loadCommonModel__;
				_ctrlers[k].loadCommonView = _loadCommonView;
				_ctrlers[k].loadModel = __loadModel__;
				_ctrlers[k].loadView = _loadView;
				_ctrlers[k].renderTemplate = __getTemplate__;
			}
		}
		(function(appName) {
			var _app = __getApp__(appName);
			_app.define.onLoad(_app.onLoadParam);
			if (__reservedStack__ && __reservedStack__[appName]) {
				var _reservedAction = __reservedStack__[appName];
				for (var i = 0, actionLen = _reservedAction.length; i < actionLen; i++) {
					var _actionObj = _reservedAction[i];
					tipJS.action(_actionObj.name, _actionObj.param);
				}
				delete __reservedStack__[appName];
			}
		})(appName);
	}

	/**
	 * Application 의 각 part 의 모든 File 이 load 되었는지 확인
	 *
	 * @param appName
	 * @param depart
	 * @param src
	 * @return load 확인 Flag
	 */
	var __checkAppFileAllLoaded__ = function(appName, depart, src) {
		var _requireList = __TIPJS_TPL__[appName][depart].requireList;

		for (var i = _requireList.length; i--;) {
			if (_requireList[i] === true)
				continue;

			if (src.indexOf(_requireList[i]) >= 0) {
				_requireList[i] = true;
				break;
			}
		}
		for (var i = _requireList.length; i--;) {
			if (_requireList[i] !== true)
				return false;
		}
		return true;
	}

	/**
	 * File 경로에 대한 Wrapper
	 *
	 * @param path
	 * @return ex) /path/
	 */
	var __wrapPath__ = function(path) {
		return __const__.pathDiv + path + __const__.pathDiv;
	}

	/**
	 * 인수로 들어온 Object 의 복제를 반환
	 *
	 * @param target
	 * @return Object Clone
	 */
	var __cloneObject__ = tipJS.cloneObject = function(target) {
		if (typeof Object.create === "function") {
			__cloneObject__ = tipJS.cloneObject = function(o) {
				return Object.create(o);
			}
			return __cloneObject__(target);
		}
		__cloneObject__ = tipJS.cloneObject = function(o) {
			function F(){};
			F.prototype = o;
			return new F();
		}
		return __cloneObject__(target);
	}

	/**
	 * 인수로 들어온 target object 의 내용을 console에 출력
	 *
	 * @param target
	 * @param filter
	 * @param parentName
	 */
	var __echo__ = tipJS.echo = function(target, filter, parentName) {
		if (parentName && (typeof parentName != "string" || typeof parentName == "string" && parentName.split(".").length > 5))
			return;

		if (!filter) filter = "";
		if (target === null || target === undefined) {
			console.log(((parentName) ? parentName + "." : "") + target);
			return;
		}
		if (typeof target == "boolean" || typeof target == "number" || typeof target == "string") {
			if (typeof target == filter || filter == "")
				console.log(((parentName) ? parentName + "." : "") + target);
			return;
		}
		for (var k in target) {
			if (target[k] && target[k] instanceof Array) {
				console.log(((parentName) ? parentName + "." : "") + k + ":Array");
				__echo__(target[k], filter, ((parentName)?parentName+".":"")+k);
			} else if (target[k] && typeof target[k] == "object") {
				console.log(((parentName) ? parentName + "." : "") + k + ":Object");
				__echo__(target[k], filter, ((parentName) ? parentName + "." : "")+k);
			} else {
				if (typeof target[k] == filter || filter == "")
					console.log(((parentName) ? parentName + "." : "") + k + ":" + target[k]);
			}
		}
	}

	/**
	 * 인수로 들어온 array 의 요소들을 중복되지 않는 요소로 재작성 후 반환
	 *
	 * @param arr
	 * @return unique 한 요소를 갖는 array
	 */
	var __uniqArray__ = tipJS.uniqueArray = function(arr) {
		var ret = [], len = arr.length;
		for (var i = 0; i < len; i++) {
			for (var j = i + 1; j < len; j++) {
				if (arr[i] === arr[j])
					j = ++i;
			}
			ret.push(arr[i]);
		}
		return ret;
	}

	/**
	 * Application 별 __TIPJS_TPL__ Object 의 초기화
	 *
	 * @param appName
	 * @param depart
	 */
	var __initAppTplNS__ = function(appName, depart) {
		__TIPJS_TPL__[appName] = __TIPJS_TPL__[appName] || {};
		__TIPJS_TPL__[appName][depart] = __TIPJS_TPL__[appName][depart] || {};
	}

	/**
	 * tipJS 의 config file 에 정의되어 있는 공통 JS File 을 읽어들임
	 *
	 * @param config
	 * @param arrayJS
	 */
	var __loadCommonJSFiles__ = function(config, arrayJS) {
		for (var i = 0, len = arrayJS.length; i < len; i++) {
			var src = arrayJS[i];
			if (config.noCache && config.noCache === true) {
				src += (src.indexOf("?") < 0) ? "?" : "&";
				src += (config.noCacheParam ? config.noCacheParam : __config__.noCacheParam) + "=";
				if (config.noCacheAuto === true)
					src += Math.random();
				else
					src += (config.noCacheVersion ? config.noCacheVersion : __config__.noCacheVersion);
			}
			document.write('<script type="text/javascript" charset="' + (config.charSet ? config.charSet : __config__.charSet) + '" src="' + src + '"></script>');
		}
	}

	/**
	 * tipJS 의 config file 에 정의되어 있는 내용을 tipJS에 반영
	 *
	 * @param config
	 */
	tipJS.config = function(config) {
		if (config.commonLib) {
			__loadCommonJSFiles__(config, config.commonLib);
			delete config.commonLib;
		}
		if (config.commonModel) {
			__loadCommonJSFiles__(config, config.commonModel);
			delete config.commonModel;
		}
		if (config.commonView) {
			__loadCommonJSFiles__(config, config.commonView);
			delete config.commonView;
		}
		__config__ = __mergeObject__(config, __TIPJS_TPL__.OBJ_TPL.config);
		if (tipJS.isDevelopment === null) {
			var _hostname = window.location.hostname;
			if (_hostname.length == 0) {
				tipJS.isDevelopment = true;
				return;
			}
			for (var i = __config__.developmentHostList.length; i--;) {
				if (_hostname.match(__config__.developmentHostList[i]) !== null) {
					tipJS.isDevelopment = true;
					break;
				}
			}
		}
	}

	/**
	 * Benchmark용 초단위 반환
	 *
	 * @return seconds
	 */
	var __getSeconds__ = function(){
		var _now = new Date();
		return (_now.getHours()*60*60 + _now.getMinutes()*60 + _now.getSeconds()) + (_now.getMilliseconds() / 1000);
	}

	/**
	 * Benchmark Object
	 */
	tipJS.benchmark = {};
	var __benchmarkRecords__ = {};

	/**
	 * Benchmark 용 키를 등록
	 *
	 * @param markName
	 */
	tipJS.benchmark.mark = function(markName){
		__benchmarkRecords__[markName] = __getSeconds__();
	}

	/**
	 * Benchmark 용 키에 따라 경과시간을 출력
	 * 
	 * @param startName
	 * @param endName
	 * @param callbackFn
	 * @return elapsedTime
	 */
	tipJS.benchmark.elapsedTime = function(startName, endName, callbackFn){
		var _startTime = __benchmarkRecords__[startName],
		_endTime = __benchmarkRecords__[endName],
		_elapsedTime = _endTime - _startTime;
		// if exist callback function
		if (callbackFn)
			callbackFn(startName, endName, _startTime, _endTime, _elapsedTime);
		else
			tipJS.log("elapsed time[" + startName + " to " + endName + "] : " + _elapsedTime + " seconds", "[BENCHMARK]");
		return _elapsedTime;
	}

	/* Template */
	/**
	 * XML Request 객체의 생성 후 반환
	 *
	 * @return XML Request Object
	 */
	var __getXMLRequest__ = function() {
		var _xmlreq = false;
		if (window.XMLHttpRequest)
			_xmlreq = new XMLHttpRequest();
		else if (window.ActiveXObject) {
			try {
				_xmlreq = new ActiveXObject("Msxml2.XMLHTTP");
			} catch (e1) {
				try {
					_xmlreq = new ActiveXObject("Microsoft.XMLHTTP");
				} catch (e2) {}
			}
		}
		__getXMLRequest__ = function() {
			return _xmlreq;
		}
		return __getXMLRequest__();
	}

	/**
	 * HTML Template File 을 읽어들인 후 file 내용을 반환
	 *
	 * @param config
	 * @return Template string
	 */
	var __getTemplate__ = function(config) {
		var _appName = __getCurrAppName__();
		if (__getAppDefine__(_appName).templateCache && __templateCache__[config.url]) {
			var _retTxt = __renderTemplate__(__templateCache__[config.url], config.data);
			if (typeof config.renderTo == "string")
				document.getElementById(config.renderTo).innerHTML += _retTxt;

			return _retTxt;
		}
		var _appNoCacheInfo = __getAppNoCacheInfo__(_appName),
			_fileUrl = __makeNocacheStr__(config.url, _appNoCacheInfo),
			_xmlhttp = __getXMLRequest__();

		_xmlhttp.open("GET", _fileUrl, false);
		try {
			_xmlhttp.send(null);
		} catch(e) {
			return null;
		}

		if (_xmlhttp.readyState == 4 && _xmlhttp.status == 200) {
			var _retTxt = __templateCache__[config.url] = _xmlhttp.responseText;
			_retTxt = __renderTemplate__(_retTxt, config.data);
			if (typeof config.renderTo == "string")
				document.getElementById(config.renderTo).innerHTML += _retTxt;

			return _retTxt;
		} else
			throw "Could not find template file:" + _fileUrl;
	}

	/**
	 * HTML Template 의 내용과 표시될 Data의 병합처리
	 *
	 * @param html
	 * @param data
	 * @return rendered HTML
	 */
	var __renderTemplate__ = function(html, data) {
		html = html.replace(/\r\n/g, "\n");
		html = html.replace(/\r/g, "\n");
		html = html.replace(/\\/g, '\\\\');
		html = html.replace(/\n/g, '');

		var _tokens = html.split("@>"),
			_evalFunc = new Function("data", __compileTemplate__(_tokens));

		return _evalFunc(data);
	}

	/**
	 * HTML Template 의 내용을 Parsing
	 *
	 * @param tokens
	 * @return tokens result
	 */
	var __compileTemplate__ = function(tokens) {
		var _ret = [], _types = [], _newTokens = [],
			_TYPE_PLANE = "PLANE", _TYPE_VALUE = "VALUE", _TYPE_PARSE = "PARSE",
			_cmdPush = '__temp_HTML__.push(';

		_ret.push('var __temp_HTML__ = [];');
		for (var i = 0, len = tokens.length; i < len; i++) {
			var _token = tokens[i];

			if (_token.indexOf("<@=") > -1) {
				var _tokens = _token.split("<@=");
				if (_tokens.length > 1) {
					_newTokens.push(_tokens[0].replace(/"/g, '\\"'));
					_newTokens.push(_tokens[1]);
					_types.push(_TYPE_PLANE);
					_types.push(_TYPE_VALUE);
				} else {
					_newTokens.push(_tokens[0]);
					_types.push(_TYPE_VALUE);
				}
			} else if (_token.indexOf("<@") > -1) {
				var _tokens = _token.split("<@");
				if (_tokens.length > 1) {
					_newTokens.push(_tokens[0].replace(/"/g, '\\"'));
					_newTokens.push(_tokens[1]);
					_types.push(_TYPE_PLANE);
					_types.push(_TYPE_PARSE);
				} else {
					_newTokens.push(_tokens[0]);
					_types.push(_TYPE_PARSE);
				}
			} else {
				_newTokens.push(_token.replace(/"/g, '\\"'));
				_types.push(_TYPE_PLANE);
			}
		} // for i
		for (var i = 0, len = _newTokens.length; i < len; i++) {
			var _token = _newTokens[i];
			if (_types[i] == _TYPE_VALUE) {
				_token = '"\"+' + _token + '+\""';
				_ret.push(_cmdPush + _token + ");");
			} else if (_types[i] == _TYPE_PARSE) {
				_ret.push(_token);
			} else {
				_token = '"' + _token + '"';
				_ret.push(_cmdPush + _token + ");");
			}
		}
		_ret.push("return __temp_HTML__.join('');");
		return _ret.join("");
	}

	/**
	 * tipJS 의 commonModel 을 정의
	 *
	 * @param commonModel
	 */
	tipJS.commonModel = function(commonModel) {
		if (!commonModel || typeof commonModel != "object" || (!commonModel.__name && !commonModel.name))
			throw "Please check your CommonModel definition";

		var _commonModelName = (commonModel.__name) ? commonModel.__name : commonModel.name;
		if (typeof (_commonModelName) != "string")
			throw "Please check your CommonModel definition";

		if (commonModel.__extend && commonModel.__extend === _commonModelName)
			throw "Can't extend itself";

		if (commonModel.__name)
			delete commonModel.__name;

		__TIPJS_TPL__.common.models[_commonModelName] = commonModel;
	}

	/**
	 * tipJS 의 commonView 를 정의
	 *
	 * @param commonView
	 */
	tipJS.commonView = function(commonView) {
		if (!commonView || typeof commonView != "object" || (!commonView.__name && !commonView.name))
			throw "Please check your CommonView definition";

		var _commonViewName = (commonView.__name) ? commonView.__name : commonView.name;
		if (typeof (_commonViewName) != "string")
			throw "Please check your CommonView definition";

		if (commonView.__extend && commonView.__extend === _commonViewName)
			throw "Can't extend itself";

		if (commonView.__name)
			delete commonView.__name;

		__TIPJS_TPL__.common.views[_commonViewName] = commonView;
	}

	var __const__ = (function() {
		var _const = {
			pathDiv : "/",
			blank : "",
			extJS : "js",
			extDiv : "."
		}
		return _const;
	})();

	/**
	 * tipJS 의 console logger
	 *
	 * @param msg
	 * @param prefix
	 */
	tipJS.log = function(msg, prefix) {
		window.console = window.console || {
			log : function() {},
			error : function() {}
		}
		var _today = new Date(), _yyyy = _today.getFullYear(), _mm = _today.getMonth() + 1, _dd = _today.getDate(), _hh = _today.getHours(), _mi = _today.getMinutes(), _ss = _today.getSeconds(), _ms = _today.getMilliseconds();
		console.log(((prefix) ? prefix : "") + _yyyy + '/' + _mm + '/' + _dd + ' ' + _hh + ':' + _mi + ':' + _ss + '.' + _ms + ' ' + msg);
	}

	/**
	 * tipJS 의 console debugger
	 *
	 * @param msg
	 */
	tipJS.debug = function(msg) {
		if (tipJS.isDevelopment)
			tipJS.log(msg, "[DEBUG]");
	}

	/**
	 * tipJS 의 Controller 정의 메소드
	 *
	 * @param controller
	 */
	tipJS.controller = function(ctrler) {
		__registDepart__("controllers", ctrler);
	}

	/**
	 * tipJS 의 Application Model 정의 메소드
	 *
	 * @param model
	 */
	tipJS.model = function(model) {
		__registDepart__("models", model);
	}

	/**
	 * tipJS 의 Application View 정의 메소드
	 *
	 * @param view
	 */
	tipJS.view = function(view) {
		__registDepart__("views", view);
	}

	/**
	 * tipJS 의 Application Controller 호출 메소드
	 *
	 * @param ctrlerName
	 * @param params
	 */
	tipJS.action = function(ctrlerName, params) {
		var _arrName, _appName, _ctrlerName;
		try {
			_arrName = ctrlerName.split(".");
			_appName = _arrName[0];
			_ctrlerName = _arrName[1];
			if (_appName.length == 0 || _ctrlerName.length == 0)
				throw "";
		} catch(e) {
			throw "tipJS.action : invalid parameter";
		}

		var _app = __getApp__(_appName);
		if (!_app || !_app.loadOrder || !_app.loadOrder.isLastOrder()) {
			__reservedStack__ = __reservedStack__ || {};
			__reservedStack__[_appName] = __reservedStack__[_appName] || [];
			__reservedStack__[_appName].push({
				name : ctrlerName,
				param : params
			});
			return;
		}

		if (!_app.controller || !_app.controller[_ctrlerName])
			throw "Could not find controller: " + ctrlerName;

		var _ctrlerStartTime;
		if (tipJS.isDevelopment === true)
			_ctrlerStartTime = __getSeconds__();

		var _ctrler = __cloneObject__(_app.controller[_ctrlerName]);

		if (!_ctrler)
			throw "Could not find controller";

		var _ctrlerWrapper = {
			controllerName:(_ctrler.__name) ? _ctrler.__name : _ctrler.name,
			ctrler : _ctrler,
			beforeCtrler : _app.define.beforeController,
			afterCtrler : _app.define.afterController
		}

		if (_ctrlerWrapper.beforeCtrler) {
			var _retValue = _ctrlerWrapper.beforeCtrler(params);
			if (_retValue === false)
				return;

			_retValue = true;
		}

		var _doCtrler = function() {
			var _ctrler = _ctrlerWrapper.ctrler;
			try {
				var _invoke2 = function() {
					if (_ctrler.afterInvoke)
						_ctrler.afterInvoke(params);
				}
				var _invoke1 = function() {
					var _retValue = true;
					if (_ctrler.invoke)
						_retValue = _ctrler.invoke(params);

					if (_retValue !== false)
						_invoke2();
				}
				var _invoke = function() {
					var _retValue = true;
					if (_ctrler.beforeInvoke)
						_retValue = _ctrler.beforeInvoke(params);

					if (_retValue !== false)
						_invoke1();
				}
				__app__.ctrlerStack = __app__.ctrlerStack || [];
				__app__.ctrlerStack.push(_ctrler);
				_invoke();
				__app__.ctrlerStack.pop();
			} catch (e) {
				__app__.ctrlerStack.pop();
				if (_ctrler.exceptionInvoke)
					_ctrler.exceptionInvoke(e, params);
				else {
					__app__.ctrlerStack = [];
					throw e;
				}
			}
			if (_ctrlerWrapper.afterCtrler)
				_ctrlerWrapper.afterCtrler(params);

			if (tipJS.isDevelopment === true)
				tipJS.debug(ctrlerName + " completed in " + (__getSeconds__() - _ctrlerStartTime) + " seconds");
		} // _doCtrler

		if (_ctrlerWrapper.ctrler.async === true)
			setTimeout(_doCtrler, 15);
		else
			_doCtrler();
	}

	/**
	 * tipJS 의 Application Load 메소드
	 *
	 * @param appNames
	 * @param params
	 */
	tipJS.loadApp = function(appNames, params) {
		for (var i = 0, appLen = appNames.length; i < appLen; i++) {
			var _appName = appNames[i], _filepath = [];
			if (params) {
				__app__[_appName] = __app__[_appName] || {};
				__app__[_appName].onLoadParam = params;
			}
			_filepath.push(__config__.applicationPath[_appName]);
			_filepath.push(__const__.pathDiv);
			_filepath.push(__config__.defineFileName);
			_filepath.push(__const__.extDiv);
			_filepath.push(__const__.extJS);
			setTimeout(function() {
				if (!__app__[_appName] || !__app__[_appName].define)
					throw "Could not find application: " + _appName;
			}, 1000);
			__loadJsFile__(_filepath.join(__const__.blank), {
				nocache : true,
				version : Math.random(),
				paramName : __config__.noCacheParam
			});
		}
	}

	/**
	 * tipJS 의 Application 정의 메소드
	 *
	 * @param define
	 */
	tipJS.define = function(define) {
		define = __mergeObject__(define, __TIPJS_TPL__.OBJ_TPL.define);
		if (define.templateCache === undefined)
			define.templateCache = __config__.templateCache;

		if (define.noCache === undefined) {
			define.noCache = __config__.noCache;
			define.noCacheVersion = __config__.noCacheVersion;
			define.noCacheParam = __config__.noCacheParam;
			define.noCacheAuto = __config__.noCacheAuto;
		} else {
			if (define.noCache === true) {
				if (define.noCacheVersion === undefined)
					define.noCacheVersion = __config__.noCacheVersion;

				if (define.noCacheParam === undefined)
					define.noCacheParam = __config__.noCacheParam;

				if (define.noCacheAuto === undefined)
					define.noCacheAuto = __config__.noCacheAuto;
			}
		}
		var _appName = define.name;
		__app__[_appName] = __app__[_appName] || {};
		__app__[_appName].loadOrder = {};
		__app__[_appName].loadOrder = __mergeObject__(__app__[_appName].loadOrder, __TIPJS_TPL__.OBJ_TPL.loadOrder);

		var _depart = __app__[_appName].loadOrder.presentOrder();
		__initAppTplNS__(_appName, _depart);
		__app__[_appName].define = define;
		__loadDepart__(_appName, _depart);
	}

	/*
	 * Booting tipJS
	 */
	/**
	 * tipJS 의 TEMPLATE Object
	 */
	var __TIPJS_TPL__ = {};
	__TIPJS_TPL__.OBJ_TPL = {
		config : {
			noCache : false,
			noCacheVersion : 1.000,
			noCacheParam : "noCacheVersion",
			noCacheAuto : false,
			templateCache : true,
			charSet : "utf-8",
			defineFileName : "define",
			path : {
				controllers : "controllers",
				models : "models",
				views : "views"
			},
			developmentHostList : [],
			applicationPath : {}
		},
		define : {
			extLib : [],
			controllers : [],
			models : [],
			views : [],
			templates : [],
			onLoad : function() {
			},
			beforeController : function() {
			},
			afterController : function() {
			}
		},
		loadOrder : {
			index : 0,
			init : function() {
				this.index = 0;
			},
			presentOrder : function() {
				return this.order[this.index];
			},
			nextOrder : function() {
				return this.order[++this.index];
			},
			isLastOrder : function() {
				return (this.index + 1) == this.order.length;
			},
			order : ["extLib", "controllers", "models", "views"]
		}
	}
	__TIPJS_TPL__.depart = __TIPJS_TPL__.depart || {};
	__TIPJS_TPL__.common = __TIPJS_TPL__.common || {};
	__TIPJS_TPL__.common.models = __TIPJS_TPL__.common.models || {};
	__TIPJS_TPL__.common.views = __TIPJS_TPL__.common.views || {};
	var __app__ = {ctrlerStack : []},
		__templateCache__ = {},
		__reservedStack__ = {},
		__config__ = __cloneObject__(__TIPJS_TPL__.OBJ_TPL.config),
		_pathname = window.location.pathname, _queryString = window.location.search, _scripts = document.getElementsByTagName('script'), _filepath, _scriptSrc, _match, _isDevelopment = null;

	for (var i = _scripts.length; i--;) {
		_scriptSrc = _scripts[i].src;
		_match = _scriptSrc.match(/tipJS-MVC-1\.26-dev\.js$/);
		if (_match) {
			_filepath = _scriptSrc.substring(0, _scriptSrc.length - _match[0].length);
			break;
		}
	}

	document.write('<script type="text/javascript" charset="UTF-8" src="' + _filepath + 'tipJS.config.js?' + __config__.noCacheParam + '=' + Math.random() + '"></script>');

	if (_queryString.match('(\\?|&)debug') !== null || _pathname.match('debug') !== null)
		_isDevelopment = true;
	else if (_queryString.match('(\\?|&)nodebug') !== null || _pathname.match('nodebug') !== null)
		_isDevelopment = false;

	tipJS.isDevelopment = _isDevelopment;
})();

