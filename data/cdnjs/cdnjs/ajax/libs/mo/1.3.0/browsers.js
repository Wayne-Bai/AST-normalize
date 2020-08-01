(function(){
/**
 * Standalone jQuery.browsers supports skin browsers popular in China 
 *
 * using AMD (Asynchronous Module Definition) API with OzJS
 * see http://ozjs.org for details
 *
 * Copyright (C) 2010-2012, Dexter.Yy, MIT License
 * vim: et:ts=4:sw=4:sts=4
 */


    var match, skin, os,
        rank = { 
            "360ee": 2,
            "maxthon/3": 2,
            "qqbrowser": 2,
            "metasr": 2,
            "360se": 1,
            "theworld": 1,
            "maxthon": 1,
            "tencenttraveler": -1
        };

    try {
        var ua = this.navigator.userAgent.toLowerCase(),
            rwindows = /(windows) nt ([\w.]+)/,
            rmac = /(mac) os \w+ ([\w.]+)/,
            riphone = /(iphone) os ([\w._]+)/,
            ripad = /(ipad) os ([\w.]+)/,
            randroid = /(android)[ ;]([\w.]*)/,
            rmobilesafari = /(\w+)[ \/]([\w.]+)[ \/]mobile.*safari/,
            rsafari = /(\w+)[ \/]([\w.]+) safari/,
            rwebkit = /(webkit)[ \/]([\w.]+)/,
            ropera = /(opera)(?:.*version)?[ \/]([\w.]+)/,
            rmsie = /(msie) ([\w.]+)/,
            rmozilla = /(mozilla)(?:.*? rv:([\w.]+))?/;

        var r360se = /(360se)/,
            r360ee = /(360ee)/,
            r360phone = /(360) \w+phone/,
            rtheworld = /(theworld)/,
            rmaxthon3 = /(maxthon\/3)/,
            rmaxthon = /(maxthon)/,
            rtt = /(tencenttraveler)/,
            rqq = /(qqbrowser)/,
            rbaidu = /(baidubrowser)/,
            ruc = /(ucbrowser)/,
            rmetasr = /(metasr)/;

        os = rwindows.exec(ua) 
            || rmac.exec(ua) 
            || riphone.exec(ua) 
            || ripad.exec(ua) 
            || randroid.exec(ua) 
            || [];

        match =  rwebkit.exec(ua) 
            || ropera.exec(ua) 
            || rmsie.exec(ua) 
            || ua.indexOf("compatible") < 0 && rmozilla.exec(ua) 
            || [];

        if (match[1] === 'webkit') {
            var vendor = rmobilesafari.exec(ua) || rsafari.exec(ua);
            if (vendor) {
                match[3] = match[1];
                match[4] = match[2];
                match[1] = vendor[1] === 'version' 
                    && ((os[1] === 'iphone' 
                            || os[1] === 'ipad')
                            && 'mobilesafari'
                        || os[1] === 'android' 
                            && 'aosp' 
                        || 'safari')
                    || vendor[1];
                match[2] = vendor[2];
            }
        }

        skin = r360se.exec(ua) 
            || r360ee.exec(ua) 
            || r360phone.exec(ua) 
            || ruc.exec(ua) 
            || rtheworld.exec(ua) 
            || rmaxthon3.exec(ua) 
            || rmaxthon.exec(ua) 
            || rtt.exec(ua) 
            || rqq.exec(ua) 
            || rbaidu.exec(ua) 
            || rmetasr.exec(ua) 
            || [];

    } catch (ex) {
        match = [];
        skin = [];
    }

    var result = { 
        browser: match[1] || "", 
        version: match[2] || "0",
        engine: match[3],
        engineversion: match[4] || "0",
        os: os[1],
        osversion: os[2] || "0",
        skin: skin[1] || ""
    };

    if (result.os === 'android' && !result.browser) {
        result.skin = 'ucbrowser';
        result.browser = 'aosp';
        result.engine = 'webkit';
        result.osversion = "0";
    }

    if (match[1]) {
        result[match[1]] = parseInt(result.version, 10) || true;
    }
    if (skin[1]) {
        result.rank = rank[result.skin] || 0;
    }
    result.shell = result.skin;

    module.exports = result;



})();