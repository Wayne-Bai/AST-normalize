/*
    author:xinglie.lkf@taobao.com
 */
KISSY.add('apiapp/sub-tmpl', function(S, View) {
    var SubTmplReg = /\{{2}#magix-tmpl-(\w+)\}{2}([\s\S]*?)\{{2}\/magix-tmpl-\1\}{2}/g;
    var IncludeReg = /\{{2}magix-include-(\w+)\}{2}/g;
    console.log(View.mixin);
    return View.mixin({
        setViewHTML: View.prototype.setHTML,
        getSubTmpl: function(name) {
            var me = this;
            var subs = me.$subTmpls;
            if (subs) {
                return subs[name] || '';
            }
            return '';
        }
    }, function() {
        var me = this;
        me.$subTmpls = {};
        me.on('inited', function() {
            me.tmpl = me.tmpl.replace(SubTmplReg, function(match) {
                match.replace(SubTmplReg, function(m, name, content) {
                    me.$subTmpls[name] = content;
                });
                return '';
            }).replace(IncludeReg, function(match, name) {
                return me.$subTmpls[name] || '';
            });
            console.log(me.tmpl);
        });
    });
}, {
    requires: ['magix/view']
});