/**
 * Created with JetBrains WebStorm.
 * User: 灵勇
 * Date: 13-8-6
 * Time: 下午10:31
 * To change this template use File | Settings | File Templates.
 */
var duoshuoQuery = {short_name:"lingyong"};
(function() {
    var ds = document.createElement('script');
    ds.type = 'text/javascript';ds.async = true;
    ds.src = 'http://static.duoshuo.com/embed.js';
    ds.charset = 'UTF-8';
    (document.getElementsByTagName('head')[0]
        || document.getElementsByTagName('body')[0]).appendChild(ds);
})();

/*$(function(){

    $("body").append("<div id='main_bg'></div>");
    $("#main_bg").append("<img src='/images/113.jpg' id='bigpic'>");
    cover();
    $(window).resize(function(){ //浏览器窗口变化
        cover();
    });
});
function cover(){
    var win_width = $(window).width();
    var win_height = $(window).height();
    $("#bigpic").attr({width:win_width,height:win_height});
}*/
