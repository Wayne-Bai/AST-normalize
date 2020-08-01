/**
 * 购物基础接口
 */
(function ($) {
    var Module = {
        get: function (callback) {
            //通过ajax向后台取数据,这边模块延迟回调
            $.delay(function () {
                var result = {
                    code: 1,
                    data: {
                        shopId: 1,
                        name: "包",
                        remark: "民包",
                        price: 11.11,
                        stock: 999,
                        userName: "leo"
                    }
                };
                callback && callback(result, result.data);
            }, 500)
        }
    };

    $.define("api/shop", function (require, exports, module) {
        module.exports = Module;//导出模块
    });

})(Qmik);