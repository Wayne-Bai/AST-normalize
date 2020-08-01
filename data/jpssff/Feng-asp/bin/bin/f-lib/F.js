

/**
* 框架顶级命名空间
*/
var F = {
    version: 20110520
};

/**
* 获取唯一的id
*/
F.getGuid = function() {
    var _id = 1;
    F.getGuid = function() {
        _id++;
        return _id;
    };
    return _id;
};

/**
* 表示已经引入的命名空间
*/
F._included = {};

/**
* 为给定的参数创建命名空间
*/
F.namespace = function(name) {
    var ns = name.split('.'),
    nt = ns.shift(),
    is_f = nt == 'F' || nt == 'feng',
    cur = F,
    part;
    if (is_f) {
        F._included[name] = true;
    }
    while (ns.length && (part = ns.shift())) {
        if (!cur[part]) {
            cur[part] = {};
        }
        cur = cur[part];
    }
};

/**
* 声明需要依赖的“包”，框架根据这些信息将依赖的“包”
* 引入到当前环境中。
*/
F.require = function(name) {
    if (!F._included[name]) {
        //TODO
    }
};

/** 
* 模拟继承，子类可以使用_superClass找到父类
*/
F.inherits = function(fn, parentFn) {
    function tempFn() {};
    tempFn.prototype = parentFn.prototype;
    fn._superClass = parentFn.prototype;
    fn.prototype = new tempFn();
    fn.prototype.constructor = fn;
};

F.isArray = function(arg) {
    return arg instanceof Array || '[object Array]' === Object.prototype.toString.call(arg);
}

F.isObject = function(arg) {
    return 'object' === typeof arg || 'function' === typeof arg;
}

F.isFunction = function(arg) {
    return '[object Function]' === Object.prototype.toString.call(arg);
}

F.isNumber = function(arg) {
    return '[object Number]' === Object.prototype.toString.call(arg);
}

F.isString = function(arg) {
    return '[object String]' === Object.prototype.toString.call(arg);
}

F.isBoolen = function(arg) {
    return 'boolen' === typeof arg;
}

F.isUndefinded = function(arg, u){
    return arg === u;
};

F.extend = function(obj_desc, obj_source) {
    for (var fn in obj_source) {
        obj_desc[fn] = obj_source[fn];
    }
    return obj_desc;
};

F.addMethods = function(obj_methods) {
    F.extend(F, obj_methods);
};

//打印F的结构
F.desc = function(){
    function desc(json, pre){
        var html = ['<ul class="F_DESC">'];
        for(var i in json){
            var key = pre + '.' + (i.indexOf('.') !== -1 ? '&lt;' + i + '&gt;' : i);
            html.push('<li><b>' + key + '</b><span>' + 
                (typeof(json[i]) === 'function' ?
                json[i].toString().match(/function\s*\([^)]*?\)/) || 'function(...)' : typeof json[i]) + 
            '</span></li>');
            if(typeof json[i] === 'object' && json[i] !== this){
                html.push(desc(json[i], key));
            }else if(typeof json[i] === 'function'){
                html.push(desc(json[i].prototype, key + '.prototype'));
            }
        }
        html.push('</ul>');
        return html.join('');
    }

    var style = '<style>.F_DESC b{font:14px/18px Consolas,Monaco,"Courier New"}'+
    '.F_DESC span{color:#0BAD03;font-size:13px;margin-left:10px;}</style>';

    var html = [];    
    Array.prototype.forEach.call(arguments, function(v, i){
        html.push(desc(v[0], v[1]));
    });
    return style + html.join('');
};

///////// 常用函数 ////////
F.parseHeaders = function(data) {
    var obj = {};
    data.split(/[\r\n]+/).each(function(i,str){
        str.replace(/^([^:]+):\s*(.*)$/,function(_,key,val){
            if (Object.exists(obj, key)) {
                if (Object.vartype(obj[key]) != 'array') {
                    obj[key] = [obj[key]];
                }
                obj[key].push(val);
            } else {
                obj[key] = val;
            }
        });
    });
    return obj;
};

////////  asp ////////

//获取url参数
F.get = function(key){
    if(key === undefined){
        var r = {},s = new Enumerator(Request.QueryString);
        for(;!s.atEnd();s.moveNext()){
            var x = s.item();
            r[x] = Request.QueryString(x).Item;
        }
        return r;
    }else{
        return Request.QueryString(key).Item;
    }
};

//获取post参数
F.post = function(key){
    if(key === undefined){
        var r = {},s = new Enumerator(Request.Form);
        for(;!s.atEnd();s.moveNext()){
            var x = s.item();
            r[x] = Request.Form(x).Item;
        }
        return r;
    }else{
        return Request.Form(key).Item;
    }
};

//获取server参数
F.server = function(key){
    if(key === undefined){
        var r = {},s = new Enumerator(Request.ServerVariables);
        for(;!s.atEnd();s.moveNext()){
            var x = s.item();
            r[x] = Request.ServerVariables(x).Item;
        }
        return r;
    }else{
        return Request.ServerVariables(key).Item;
    }
};

//是否是get请求
F.isGet = function(){
    return F.server("REQUEST_METHOD").toLowerCase() === 'get';
};

//是否是post请求
F.isPost = function(){
    return F.server("REQUEST_METHOD").toLowerCase() === 'post';
};

//是否是ajax请求
F.isAjax = function(){
    return F.server('HTTP_X_REQUESTED_WITH') === 'XMLHttpRequest';
};

//获取ip地址
F.ip = function(){
    var proxy = F.server("HTTP_X_FORWARDED_FOR"),
    ip = proxy && proxy.indexOf("unknown") != -1 ? proxy.split(/,;/g)[0] : F.server("REMOTE_ADDR");
    ip = ip.trim().substring(0, 15);
    return "::1" === ip ? "127.0.0.1" : ip;
};

//生成guid
F.guid = function(){
    var scriptletTypelib = new ActiveXObject("Scriptlet.Typelib");
    var value = scriptletTypelib.Guid.substring(0,38);
    scriptletTypelib = null;
    return value;
};

//进行html转意
F.encodeHTML = function(text){
    return String(text).replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

//url转向
F.go = function(url){
    Response.Redirect(url);
};

//增加header
F.header = function(key, value){
    Response.AddHeader(key, value);
};

//页面本身url
F.url = function(){
    var port = F.server('SERVER_PORT');
    var server = F.server('SERVER_NAME');
    var url = F.server('URL'), query = F.server('QUERY_STRING');
    return (port == '443' ? 'https://' : 'http://') + server + 
        ((port=="80"||port=="443")?"":":"+port)+url+(query===''?'':'?'+query);
};

//执行脚本
F.execute = function(path){
    var file = new F.File(path);
    if (file.exist()) {
        try{
            return (new Function(js))();
        }catch(e){
            e.path = path;
            e.js = js;
            throw e;
        }
    };
};


//生成获取ActiveXObject的方法
(function(){
    var ax = {
        'fso' : 'Scripting.FileSystemObject',
        'xml' : 'Microsoft.XMLDOM',
        'stream' : 'ADODB.Stream',
        'http' : 'Microsoft.XMLHTTP'
    };
    var cache = {};
    Object.keys(ax).forEach(function(v){
        F[v] = function(isnew){
            return isnew ? new ActiveXObject(ax[v]) : (cache[v] || (cache[v] = new ActiveXObject(ax[v])));
        };
    });
})();

//处理include模板
F.includeAll = function(path){
    var reg = /<\!\-\-#include +(file)?(virtual)?="([^"]+)"\-\->/;
    var root = (Server.Mappath("/"));
    var file = new F.File(path);
    var text = file.getText();
    var re = [], paths = [file.path], i = j = 0, temp, f, p2, tp;
    while((i=text.search(reg))!== -1){
        temp = text.match(reg);
        f = temp[3];
        if(temp[2])
            p2 = root + f;
        else
            p2 = file.getFolder().path + '/' + f;
        temp = temp[0];
        re.push(text.slice(0, i));
        text = text.slice(i+temp.length);
        tp = F.includeAll(p2);
        re.push(tp.text);
        paths = paths.concat(tp.paths);
    }
    re.push(text);
    var r = {text: re.join(''), paths: paths, path: file.path};
    return r;
};

//处理asp代码并最小化处理
F.aspmin = function(path, outpath){
    var s = F.includeAll(path).text;
    var i = s.indexOf('%' + '>');
    i += 2;
    var start = s.slice(0, i);
    s = s.slice(i).replace(new RegExp('<'+'%', 'g'), '').replace(new RegExp('%'+'>', 'g'), '');
    s = F.jsmin(s);
    var f = new F.File(outpath).create().setText(start + '\n<' + '%' + s + '%' + '>');
};

//模板
F.fetch = function(path, data, opt){
    opt = opt || {};
    var file = new F.File(path);
    if(file.exist())
        path = file.path;
    else
        throw new Error("文件不存在:" + path);
    var key = 'F_TPL_' + path;
    var tkey = 'T' + key;
    var tmpl = F.cache.get(key);
    if(opt.checkFile && tmpl){
        var t = F.cache.get(tkey);
        var f = new F.File();
        if(t.length){
            t = F.json.parse(t);
            for(var p in t){
                if(f.setPath(p).getDateLastModified().getTime() !== t[p]){
                    tmpl = null;
                    break;
                }
            }
        }
    }
    if(!tmpl){
        var tp = F.includeAll(path);
        var str = tp.text;
        var c = {
            evaluate    : new RegExp('<' + '%([\\s\\S]+?)%' + '>', 'g'),
            interpolate : new RegExp('<' + '%=([\\s\\S]+?)%'+ '>', 'g')
        };
        tmpl = 'var __x=[],print=function(){__x.push.apply(__x,arguments);};' +
        'with(obj||{}){__x.push(\'' +
            str.replace(/\\/g, '\\\\')
            .replace(/'/g, "\\'")
            .replace(c.interpolate, function(match, code) {
                return "'," + code.replace(/\\'/g, "'") + ",'";
            })
        .replace(c.evaluate || null, function(match, code) {
            return "');" + code.replace(/\\'/g, "'")
            .replace(/[\r\n\t]/g, ' ') + "__x.push('";
                })
                .replace(/\r/g, '\\r')
            .replace(/\n/g, '\\n')
            .replace(/\t/g, '\\t')
            + "');}return __x.join('');";
            var t = {}, f = new F.File();
            tp.paths.forEach(function(p){
                t[p] = f.setPath(p).getDateLastModified().getTime();
            });
            F.cache.set(tkey, F.json.stringify(t));
            F.cache.set(key, tmpl);
    }
    return data ? (function(){
        var html = '';
        try{
            html = (new Function('obj', tmpl))(data);
        }catch(e){
            die(e.message);
        }finally{
            return html;
        }
    })() : tmpl;
};

// vim:ft=javascript

