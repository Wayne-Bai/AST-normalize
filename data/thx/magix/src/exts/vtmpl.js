/*
    author:xinglie.lkf@taobao.com
    extend:

        parent:{{@magix-tmpl-xxx}}
        sub:{{#magix-tmpl-xxx}}content{{/magix-tmpl-xxx}}

        parent:{{@magix-tmpl-all}}
        sub:content

    subtmpl:

        {{@magix-inner-xxx}}

        {{#magix-inner-xxx}}
        content
        {{/magix-inner-xxx}}
 */
KISSY.add('exts/vtmpl', function(S, View) {
    var Base = View.prototype;
    var Load = Base.load;
    var Mods = S.Env.mods;

    var TmplReg = /\{\{#magix-tmpl-(\w+)\}\}([\s\S]*?)\{\{\/magix-tmpl-\1\}\}/g;
    var TmplIncludeReg = /\{\{@magix-tmpl-(\w+)\}\}([\s\S]*?)\{\{\/magix-tmpl-\1\}\}/g;

    var InnerTmplReg = /\{\{#magix-inner-(\w+)\}\}([\s\S]*?)\{\{\/magix-inner-\1\}\}/g;
    var InnerTmplIncludeReg = /\{\{@magix-inner-(\w+)\}\}/g;

    var FindExtendTmpls = function(entity) {
        var proto = entity.constructor.prototype;
        var result = [{
            path: entity.path,
            ctx: proto
        }];
        while (proto) {
            var tmpl = proto.extendTmpl;
            var parent = proto.constructor.superclass;
            if (tmpl && parent) {
                var ctor = parent.constructor;
                if (!ctor.path) {
                    for (var p in Mods) {
                        if (Mods[p].value == ctor || Mods[p].exports == ctor) {
                            ctor.path = p;
                            break;
                        }
                    }
                }
                result.push({
                    path: ctor.path,
                    ctx: parent
                });
            }
            proto = parent;
        }
        return result;
    };
    var FetchTmpls = function(tmpls, done, preTmpl) {
        var item = tmpls.pop();
        var alen = arguments.length;

        if (item) {
            item.ctx.fetchTmpl.call(item.ctx, item.path, function(tmpl) {
                var subTmpls = {};
                tmpl.replace(TmplReg, function(match, name, content) {
                    subTmpls[name] = content;
                });
                if (alen < 3) {
                    preTmpl = tmpl;
                } else {
                    preTmpl = preTmpl.replace(TmplIncludeReg, function(match, name) {
                        return subTmpls[name] || '';
                    });
                }
                FetchTmpls(tmpls, done, preTmpl);
            });
        } else {
            done(preTmpl.replace(TmplIncludeReg, '$2'));
        }
    };
    return View.mixin({
        load: function() {
            var me = this;
            var args = arguments;
            FetchTmpls(FindExtendTmpls(me), me.wrapAsync(function(tmpl) {
                me.template = me.hasTmpl ? tmpl : me.wrapMxEvent(tmpl);
                Load.apply(me, args);
            }));
        },
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
            me.template = me.template.replace(InnerTmplReg, function(match) {
                match.replace(InnerTmplReg, function(m, name, content) {
                    me.$subTmpls[name] = content;
                });
                return '';
            }).replace(InnerTmplIncludeReg, function(match, name) {
                return me.$subTmpls[name] || '';
            });
        });
    });
}, {
    requires: ['magix/view']
});