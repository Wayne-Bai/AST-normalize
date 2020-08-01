/**
 * Created with JetBrains WebStorm.
 * User: 灵勇
 * Date: 13-8-13
 * Time: 下午9:02
 * To change this template use File | Settings | File Templates.
 */
$(function(){
    cover();
});
function cover(){
    var win_width = $(window).width();
    var win_height = $(window).height();
    $(".formwrapper").attr({width:win_width,height:win_height});
}
