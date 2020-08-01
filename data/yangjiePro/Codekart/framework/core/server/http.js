
//服务器模块

var fs = require('fs');
var http = require('http');
var url = require('url');
var path = require('path');
var querystring = require('querystring');
var server_static = load.core('!server/static');
var server_controller = load.core('!server/controller');
var server_view = load.core('!server/view');
var websocket = load.core('!server/websocket');
var route = load.core('!server/route');
var define = load.config('define')
    , static_url_path = define.static_url_path || [];
var config = load.config();
var array = load.tool('!array');
var buffer = load.tool('!buffer');


/**
 * 创建http服务器
 */
exports.run = function(){


    var port = config.port.http;

    if(port<=0){ //端口小于等于零  则不开启http
        return false;
    }

    //log();
    http.createServer(function(request, response){
        // log(request.url);
        // log('I am worker #' + cluster.worker.id);
        // request.setEncoding("utf8");
        // 是否为 WebSocket 兼容处理请求
        // if(request.url.indexOf('/'+define.ws_polling_baseurl+'/')>-1){
        //     return websocket.polling(request, response);
        // }
        
        // log(request.headers['content-type']);
        //解析url
        request.url = url.parse(request.url,true);
        //请求类型
        var method = request.method.toLowerCase()
            , sort = getRequestSort(request, true);
        if(sort!='static'){  //静态文件请求，不做request扩展处理
            expandRequest(request);
        }

        //判断是否为get或二进制/文件post请求，直接响应
        if(method=='get' || isMultipart(request)){
            //multipart/form-data
            return routeRequest(request,response,sort);

        }else if(isFormUrlencoded(request)){
            //application/x-www-form-urlencoded
            var datastr = '';
            request.on('data',function(chunk){
                //bfhelper.concat(chunk);
                datastr += chunk;
                //log(chunk+'');
            });
            request.on('end', function(){
                //处理post数据
                // request.post = querystring.parse(bfhelper.toBuffer().toString());
                // 解析 post 参数
                request.post = querystring.parse(datastr);
                routeRequest(request,response,sort);
            });
        }else{
            //默认处理方式
            return routeRequest(request,response,sort);
        }


    }).listen(port);

    log('port ['+port+'] running server http');
};


/**
 * 判断是否为文件表单上传请求
 */
function isMultipart(req){
    var h = req.headers;
    if(h['content-type']){
        var type = h['content-type'];
        if(type.indexOf('multipart/form-data')>-1) {
            return true;
        }
    }
}


/**
 * 判断是否为文件表单上传请求
 */
function isFormUrlencoded(req){
    var h = req.headers;
    if(h['content-type']){
        var type = h['content-type'];
        if(type.indexOf('application/x-www-form-urlencoded')>-1) {
            return true;
        }
    }
}




/**
 * 扩展 request 对象
 */
function expandRequest(request){
    request.time_ms = new Date().getTime(); //请求进入时间 ms 毫秒
    request.time = parseInt(request.time_ms/1000); //请求进入时间戳
    request.get = request.url.query;
    //处理cookie参数
    request.cookie = {};
    request.headers.cookie && request.headers.cookie.split(';').forEach(function( Cookie ) {
        var parts = Cookie.split('=');
        //log(parts);
        request.cookie[ parts[0].trim() ] = ( parts[1] || '' ).trim();
    });
}




/**
 *  路由处理服务器
 *  请求服务路由，静态文件服务，数据接口服务，web接口
 */
function routeRequest(request,response,sort){
    //log(met);
    if(sort=='static')
        server_static(request,response);
    else if(sort=='controller')
        server_controller(request,response);
    else if(sort=='view')
        server_view(request,response);
}



/**
 * 获取或者验证请求类型，静态、数据服务、二进制数据提交
 * exp 表示是否扩展request
 */
function getRequestSort(request,exp){

    var pathname = request.url.pathname;

    //判断是否指定为静态处理
    for(var p in static_url_path){
        var one = static_url_path[p];
        if(pathname.indexOf('/'+p+'/')==0){
            //log('指定为静态处理');
            request.route = one;
            request.route.path = p;
            return 'static';
        }
    }

    //是否为注册的controller请求
    var isCtrl = route.match(pathname,'controller');
    if(isCtrl){
        if(exp){//扩展request
            request.url.param = isCtrl.param;
            request.route = isCtrl.route;
        }
        return 'controller';
    }

    //是否为页面请求
    var isView = route.match(pathname,'view');
    if(isView){
        if(exp){//扩展request
            request.url.param = isView.param;
            request.route = isView.route;
        }
        return 'view';
    }

    //是否为静态文件请求
    var type = path.extname(pathname).replace('.','');  //获取文件扩展名
    if(type) return 'static'; //静态文件服务


    return 'controller'; //默认交由controller处理
}

