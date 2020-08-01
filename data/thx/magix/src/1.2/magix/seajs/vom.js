/**
 * @fileOverview VOM
 * @author 行列
 * @version 1.2
 */
define("magix/vom", function(require) {
    var Vframe = require("./vframe");
    var Magix = require("./magix");
    var Event = require("./event");
    eval(Magix.include('../tmpl/vom'));
    return VOM;
});