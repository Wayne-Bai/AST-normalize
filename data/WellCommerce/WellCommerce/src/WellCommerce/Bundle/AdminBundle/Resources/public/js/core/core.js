/*
 * ALERT
 */

var GAlert = function(sTitle, sMessage, oParams) {
    if (sMessage == undefined) {
        sMessage = '';
    }
    var iAlertId = GAlert.Register();
    if (GAlert.sp_dHandler != undefined) {
        GAlert.sp_dHandler.Alert(sTitle, sMessage, oParams, iAlertId);
    }
    else {
        alert(sTitle + '\n' + sMessage);
    }
    return iAlertId;
};

var GWarning = function(sTitle, sMessage, oParams) {
    if (oParams == undefined) {
        oParams = {};
    }
    oParams.iType = GAlert.TYPE_WARNING;
    return GAlert(sTitle, sMessage, oParams);
};

var GError = function(sTitle, sMessage, oParams) {
    if (oParams == undefined) {
        oParams = {};
    }
    oParams.iType = GAlert.TYPE_ERROR;
    return GAlert(sTitle, sMessage, oParams);
};

var GMessage = function(sTitle, sMessage, oParams) {
    if (oParams == undefined) {
        oParams = {};
    }
    oParams.iType = GAlert.TYPE_MESSAGE;
    return GAlert(sTitle, sMessage, oParams);
};

var GPrompt = function(sTitle, fOnConfirm, oParams) {
    if (oParams == undefined) {
        oParams = {};
    }
    var sMessage = '<span class="field-text"><input type="text" class="prompt-value" value="' + ((oParams.sDefault == undefined) ? '' : oParams.sDefault) + '"/></span>';
    oParams = $.extend(true, {
        bAutoExpand: true,
        bNotRetractable: true,
        aoPossibilities: [
            {
                mLink: GEventHandler(function(eEvent) {
                    var sValue = $(this).closest('.message').find('input.prompt-value').val();
                    fOnConfirm.apply(this, [sValue]);
                }),
                sCaption: GMessageBar.Language.add
            },
            {
                mLink: GAlert.DestroyThis,
                sCaption: GMessageBar.Language.cancel
            }
        ]
    }, oParams);
    oParams.iType = GAlert.TYPE_PROMPT;
    return GAlert(sTitle, sMessage, oParams);
};

GAlert.Destroy = function(iAlertId) {
    if (GAlert.sp_dHandler != undefined) {
        GAlert.sp_dHandler.Destroy(iAlertId);
    }
};

GAlert.DestroyThis = function(eEvent) {
    GAlert.Destroy($(this));
};

GAlert.DestroyAll = function() {
    if (GAlert.sp_dHandler != undefined) {
        GAlert.sp_dHandler.DestroyAll();
    }
};

GAlert.Register = function() {
    return GAlert.s_iCounter++;
};

GAlert.sp_dHandler;
GAlert.s_iCounter = 0;

GAlert.TYPE_WARNING = 0;
GAlert.TYPE_ERROR = 1;
GAlert.TYPE_MESSAGE = 2;
GAlert.TYPE_PROMPT = 3;

/*
* CORE
*/

var oDefaults = {
	iCookieLifetime: 30,
	sDesignPath: '',
	iActiveView: null,
	aoViews:'',
	iActiveLanguage:1,
	aoLanguages:'',
	aoVatValues:'',
	sCurrentController: '',
	sCurrentAction: ''
};

GCore = function(oParams) {
	GCore.p_oParams = oParams;
	GCore.DESIGN_PATH = GCore.p_oParams.sDesignPath;
	GCore.iActiveView = GCore.p_oParams.iActiveView;
	GCore.aoViews = GCore.p_oParams.aoViews;
	GCore.iActiveLanguage = GCore.p_oParams.iActiveLanguage;
	GCore.aoLanguages = GCore.p_oParams.aoLanguages;
	GCore.aoVatValues = GCore.p_oParams.aoVatValues;
	GCore.sCurrentController = GCore.p_oParams.sCurrentController;
	GCore.sAdminUrl = GCore.p_oParams.sUrl;
	GCore.sCurrentAction = GCore.p_oParams.sCurrentAction;
	GCore.StartWaiting();
};


GCore.NULL = 'null';

GCore.s_afOnLoad = [];

GCore.GetArgumentsArray = function(oArguments) {
	var amArguments = [];
	for (var i = 0; i < oArguments.length; i++) {
		amArguments[i] = oArguments[i];
	}
	return amArguments;
};

GCore.Duplicate = function(oA, bDeep) {
	return $.extend((bDeep == true), {}, oA);
};

GCore.OnLoad = function(fTarget) {
	GCore.s_afOnLoad.push(fTarget);
};

GCore.Init = function() {
	for (var i = 0; i < GCore.s_afOnLoad.length; i++) {
		GCore.s_afOnLoad[i]();
	}
	$('#content').css('visibility', 'visible').children('.preloader').remove();
	GCore.StopWaiting();
};

GCore.ExtendClass = function(fBase, fChild, oDefaults) {
	var fExtended = function() {
		var aBaseArguments = [];
		for (var i = 0; i < arguments.length; i++) {
			aBaseArguments.push(arguments[i]);
		}
		var result = fBase.apply(this, aBaseArguments);
		if (result === false) {
			return result;
		}
		fChild.apply(this, arguments);
		this.m_oOptions = $.extend(true, GCore.Duplicate(oDefaults, true), arguments[0]);
		return this;
	};
	for(var i in fBase.prototype) {
		fExtended.prototype[i] = fBase.prototype[i];
	}
	return fExtended;
};

GCore.ObjectLength = function(oObject) {
	var iLength = 0;
	for (var i in oObject) {
		iLength++;
	}
	return iLength;
};

GCore.FilterObject = function(oSource, fTest) {
	var oResult = {};
	for (var i in oSource) {
		if (fTest(oSource[i])) {
			oResult[i] = GCore.Duplicate(oSource[i], true);
		}
	}
	return oResult;
};

GCore.GetIterationArray = function(oSource, fCompare) {
	var oSource = $.extend(true, {}, oSource);
	var aSource = [];
	for (var i in oSource) {
		aSource.push($.extend(true, {$$key: i}, oSource[i]));
	}
	aSource.sort(fCompare);
	var asIterationArray = [];
	for (var i = 0; i < aSource.length; i++) {
		asIterationArray.push(aSource[i]['$$key']);
	}
	return asIterationArray;
};

GCore.StartWaiting = function() {
	$('body').css({
		cursor: 'wait'
	});
};

GCore.StopWaiting = function() {
	$('body').css({
		cursor: 'auto'
	});
};


var GEventHandler = function(fHandler) {
	var fSafeHandler = function(eEvent) {
		try {
			if (eEvent.data) {
				for (var i in eEvent.data) {
					this[i] = eEvent.data[i];
				}
			}
			return fHandler.apply(this, arguments);
		}
		catch (xException) {
			GException.Handle(xException);
			return false;
		}
	};
	return fSafeHandler;
};

/*
 * GCookie
 */

GCookie = function(name, value, options) {
    if (typeof value != 'undefined') {
        options = options || {};
        if (value === null) {
            value = '';
            options.expires = -1;
        }
        var expires = '';
        if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
            var date;
            if (typeof options.expires == 'number') {
                date = new Date();
                date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
            } else {
                date = options.expires;
            }
            expires = '; expires=' + date.toUTCString();
        }
        var path = options.path ? '; path=' + (options.path) : '';
        var domain = options.domain ? '; domain=' + (options.domain) : '';
        var secure = options.secure ? '; secure' : '';
        document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
    } else {
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
};

/*
 * CACHE
 * For caching xajax requests.
 */

var GCache = function() {

    var gThis = this;

    this.m_oResponses;

    this._Constructor = function() {
        this.m_oResponses = {};
    };

    this.Execute = function(fHandler, oRequest, sCallback) {
        var sRequest = JSON.stringify(oRequest);
        if (this.m_oResponses[sRequest] != undefined) {
            gThis.ReturnResponse(sCallback, this.m_oResponses[sRequest]);
            return;
        }
        fHandler(oRequest, GCallback(this.SaveResponse, {
            sCallback: sCallback,
            sRequest: sRequest
        }));
    };

    this._CompareRequests = function(oA, oB) {
        for (var i in oA) {
            if (oA[i] != oB[i]) {
                return false;
            }
        }
        for (var j in oB) {
            if (oA[j] != oB[j]) {
                return false;
            }
        }
        return true;
    };

    this.ReturnResponse = function(sFunction, oResponse) {
        eval(sFunction + '(oResponse);');
    };

    this.SaveResponse = new GEventHandler(function(eEvent) {
        var sCallback = eEvent.sCallback;
        var sRequest = eEvent.sRequest;
        delete eEvent.sCallback;
        delete eEvent.sRequest;
        gThis.m_oResponses[sRequest] = eEvent;
        gThis.ReturnResponse(sCallback, eEvent);
    });

    this._Constructor();

};

/*
 * CALLBACK
 */

var GCallback = function(fHandler, oParams) {
    if (oParams == undefined) {
        oParams = {};
    }
    var i = GCallback.s_iReferenceCounter++;
    GCallback.s_aoReferences[i] = {
        fHandler: fHandler,
        oParams: oParams
    };
    GCallback['Trigger_' + i] = function() {
        GCallback.Invoke(i, GCore.GetArgumentsArray(arguments));
    };
    return 'GCallback.Trigger_' + i + '';
};

GCallback.s_iReferenceCounter = 0;
GCallback.s_aoReferences = {};

GCallback.Invoke = function(iReference, amArguments) {
    if (amArguments[0] == undefined) {
        amArguments[0] = {};
    }
    var oReference = GCallback.s_aoReferences[iReference];
    if (oReference != undefined) {
        oReference.fHandler.call(this, $.extend(oReference.oParams, amArguments[0]));
    }
    delete GCallback.s_aoReferences[iReference];
};

/*
 * EXCEPTION
 */

var GException = function(sMessage) {
    this.m_sMessage = sMessage;
    this.toString = function() {
        return this.m_sMessage;
    };
};

GException.Handle = function(xException) {
    new GAlert(GException.Language['exception_has_occured'], xException);
    throw xException; // for debugging
};


/*
 * PLUGIN
 */

var GPlugin = function(sPluginName, oDefaults, fPlugin) {

    (function($) {

        var oExtension = {};
        oExtension[sPluginName] = function(oOptions) {
            if ($(this).hasClass(sPluginName)) {
                return;
            }
            oOptions = $.extend(GCore.Duplicate(oDefaults), oOptions);
            return this.each(function() {
                this.m_oOptions = oOptions;
                this.m_iId = GPlugin.s_iCounter++;
                GPlugin.s_oInstances[this.m_iId] = this;
                this.m_oParams = {};
                this._GetClass = function(sClassName) {
                    var sClass = this.m_oOptions.oClasses['s' + sClassName + 'Class'];
                    if (sClass == undefined) {
                        return '';
                    }
                    else {
                        return sClass;
                    }
                };
                this._GetImage = function(sImageName) {
                    var sImage = this.m_oOptions.oImages['s' + sImageName];
                    if (sImage == undefined) {
                        return '';
                    }
                    else {
                        return GCore.DESIGN_PATH + sImage;
                    }
                };
                try {
                    if($(this).attr('class') != undefined){
                        var asParams = $(this).attr('class').match(/G\:\w+\=\S+/g);
                        if (asParams != undefined) {
                            for (var i = 0; i < asParams.length; i++) {
                                var asParamData = asParams[i].match(/G:(\w+)\=(\S+)/);
                                this.m_oParams[asParamData[1]] = asParamData[2];
                            }
                        }
                    }
                    $(this).addClass(sPluginName);
                    fPlugin.apply(this, [this.m_oOptions]);
                }
                catch(xException) {
                    throw xException;
                    GException.Handle(xException);
                }
            });
        };
        $.fn.extend(oExtension);
        fPlugin.GetInstance = GPlugin.GetInstance;

    })(jQuery);

};

GPlugin.s_iCounter = 0;
GPlugin.s_oInstances = {};

GPlugin.GetInstance = function(iId) {
    if (GPlugin.s_oInstances[iId] != undefined) {
        return GPlugin.s_oInstances[iId];
    }
    throw new GException('Requested instance (' + iId + ') not found.');
    return false;
};

/*
 * LINK
 */

var GLink = function(jA, mLink) {
    if (mLink instanceof Function) {
        jA.attr('href', '#');
        jA.click(function(eEvent) {
            mLink.apply(jA, [eEvent]);
            return false;
        });
    }
    else {
        jA.attr('href', mLink);
    }
};