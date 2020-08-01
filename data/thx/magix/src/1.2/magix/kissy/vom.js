/**
 * @fileOverview VOM
 * @author 行列
 * @version 1.2
 */
KISSY.add("magix/vom", function(S, Vframe, Magix, Event) {
    eval(Magix.include('../tmpl/vom'));
    return VOM;
}, {
    requires: ["magix/vframe", "magix/magix", "magix/event"]
});