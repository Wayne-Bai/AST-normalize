/*
    author:xinglie.lkf@taobao.com
 */
KISSY.add('apiapp/mviews/partials/class', function(S, View, MM, Magix, Crox) {
    var FindParent = function(name, map, inner) {
        var a = [];
        if (!inner) {
            a.push({
                name: name
            });
        }
        var info = map[name.toLowerCase()];
        if (info) {
            info = info.get();
        }
        if (info) {
            var temp = info.inherits && info.inherits[0];
            if (temp) {
                temp = temp.alias.split('.')[0];
                a.push({
                    type: 'mix',
                    name: temp
                });
                temp = FindParent(temp, map, true);
                if (temp.length) {
                    a = a.concat(temp);
                }
            } else {
                temp = info.inheritsFrom && info.inheritsFrom[0];
                if (temp) {
                    a.push({
                        name: temp
                    });
                    temp = FindParent(temp, map, true);
                    if (temp.length) {
                        a = a.concat(temp);
                    }
                }
            }
        }
        return a;
    };
    var ExtendClass = {
        view: null,
        data: null,
        infos: null,
        method_params: function(params) {
            var a = [];
            if (params) {
                for (var i = 0, name, info; i < params.length; i++) {
                    info = params[i];
                    name = info.name;
                    if (name.indexOf('.') == -1) {
                        a.push(name);
                    }
                }
            }
            return a;
        },
        moreInfos: function(key, val) {
            key = '$' + key;
            if (!ExtendClass[key]) {
                ExtendClass[key] = {};
            }
            ExtendClass[key][val._name] = val;
            return '';
        },
        inherits_relation: function(name) {
            var result = '';
            var tmpl = ExtendClass.view.getSubTmpl('inherits');
            var ir = FindParent(name, ExtendClass.infos.map);
            result = Crox.render(tmpl, {
                list: ir.reverse()
            });
            return result;
        }
    };
    var ClassExample = {
        info: null,
        example_desc: function(val) {
            return val.desc.replace(/ /g, '&nbsp;').replace(/(?:\bfunction|var|if|else|this\b)/g, '<span style="color:blue">$&</span>').replace(/(^|[^:])(\/{2}[\s\S]*?)(?:[\r\n]|$)/mg, '$1<span style="color:green">$2</span><br />').replace(/\r\n|\r|\n/g, '<br />');
        }
    };
    return View.extend({
        init: function() {
            this.observeLocation('focus');
        },
        render: function() {
            var me = this;
            var infos = Magix.local('APIPathInfo');
            var r = MM.fetchClassInfos(me);
            r.next(function(e, i) {
                if (e) {
                    me.setViewHTML(me.id, e.msg);
                } else {
                    var m = i.map[infos.action];
                    if (m) {
                        var data = m.get();
                        ExtendClass.data = data;
                        ExtendClass.infos = i;
                        ExtendClass.view = me;
                        var html = Crox.render(me.tmpl, ExtendClass);
                        me.setViewHTML(me.id, html);
                        var focus = me.location.get('focus');
                        if (focus) {
                            var node = S.one('#J_' + focus);
                            if (node) {
                                me.manage(setTimeout(function() {
                                    S.DOM.scrollTop(node.offset().top - 50);
                                    var cnt = node.parent('.list');
                                    cnt.css({
                                        backgroundColor: '#fff'
                                    }).animate({
                                        backgroundColor: '#FF8400'
                                    }, 0.3).animate({
                                        backgroundColor: '#fff'
                                    }, 0.3).animate({
                                        backgroundColor: '#FF8400'
                                    }, 0.3).animate({
                                        backgroundColor: '#fff'
                                    }, 0.3);
                                }, 600));
                            }
                        }
                    } else {
                        me.setViewHTML(me.id, 'not found:' + infos.action);
                    }
                }
            });
        },
        'toggleMoreInfos<click>': function(e) {
            var me = this;
            var cntId = me.id + '_method_details';
            var cnt = S.one('#' + cntId);
            if (!cnt) {
                cnt = document.createElement('div');
                cnt.id = cntId;
                document.body.appendChild(cnt);
                cnt = S.one(cnt);
            }
            var current = S.one('#' + e.currentId);
            var icon = current.one('i');
            if (icon != me.$lastIcon && me.$lastIcon) {
                me.$lastIcon.removeClass('minus').addClass('plus');
            }
            var currentDD = current.parent('div');
            if (currentDD.contains(cnt)) {
                var none = cnt.css('display') == 'none';
                cnt.css({
                    display: none ? '' : 'none'
                });
                if (none) {
                    icon.removeClass('plus').addClass('minus');
                } else {
                    icon.removeClass('minus').addClass('plus');
                }
            } else {
                cnt.css({
                    display: '',
                    paddingLeft: 24
                });
                currentDD.append(cnt);
                icon.removeClass('plus').addClass('minus');
            }
            me.$lastIcon = icon;
            var tmpl = me.getSubTmpl('method');
            var data = ExtendClass;
            var methods = data['$' + e.params.type] || {};
            var info = methods[e.params.name] || {};
            ClassExample.info = info;
            var top = icon.offset().top;
            if (top < S.DOM.scrollTop()) {
                S.DOM.scrollTop(top - 50);
            }
            cnt.html(Crox.render(tmpl, ClassExample));
        }
    });
}, {
    requires: ['magix/view', 'apiapp/models/manager', 'magix/magix', 'apiapp/helpers/crox', 'anim']
});