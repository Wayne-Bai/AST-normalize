/**
 * @fileOverview body事件代理
 * @author 行列<xinglie.lkf@taobao.com>
 * @version 1.1
 **/
KISSY.add('magix/body', function(S, Magix) {
    var RootEvents = {};
var Has = Magix.has;
var MxIgnore = 'mx-ei';
var RootNode = document.body;
var ParentNode = 'parentNode';
var TypesRegCache = {};
var IdCounter = 1 << 16;
var MxEvt = /\smx-(?!view|vframe)[a-z]+\s*=\s*"/g;
var ON = 'on';

var IdIt = function(dom) {
    return dom.id || (dom.id = 'mx-e-' + (IdCounter--));
};
var GetSetAttribute = function(dom, attrKey, attrVal) {
    if (attrVal) {
        dom.setAttribute(attrKey, attrVal);
    } else {
        attrVal = dom.getAttribute(attrKey);
    }
    return attrVal;
};
var Halt = function() {
    this.prevent();
    this.stop();
};

var VOM;
var Group = '\u0005';
var Body = {
    lib: Magix.unimpl,
    /**
     * 包装mx-event，自动添加vframe id,用于事件发生时，调用该view处理
     * @param {String} html html字符串
     * @returns {String} 返回处理后的字符串
     */
    wrap: function(id, html, onlyPrefix, prefix) {
        html += EMPTY;
        prefix = id + '\u001a';
        if (onlyPrefix) {
            html = [EMPTY].concat(html).join(Group + prefix);
        } else {
            html = html.replace(MxEvt, '$&' + prefix);
        }
        return html;
    },
    process: function(e) {
        if (e && !e[ON]) {
            var target = e.target;
            e[ON] = 1;
            var current = target;
            var eventType = e.type;
            var eventReg = TypesRegCache[eventType] || (TypesRegCache[eventType] = new RegExp(COMMA + eventType + '(?:,|$)'));
            var type = 'mx-' + eventType;
            var info;
            var ignore;
            var arr = [];
            var node;

            while (current && current.nodeType == 1) { //找事件附近有mx-[a-z]+事件的DOM节点
                info = GetSetAttribute(current, type);
                ignore = GetSetAttribute(current, MxIgnore); //current.getAttribute(MxIgnore);
                if (info || eventReg.test(ignore)) {
                    break;
                } else {
                    arr.push(current);
                    current = current[ParentNode];
                }
            }
            if (info) { //有事件
                //找处理事件的vframe
                var infos = info.split(Group),
                    firstProcessed,
                    oinfo, ts, vframe, view, vId, begin, vfs, tempId;
                while (infos.length) {
                    oinfo = infos.shift();
                    if (oinfo) {
                        ts = oinfo.split('\u001a');
                        oinfo = ts.pop();
                        vId = ts[0];
                        if (!vId && !firstProcessed) { //如果没有则找最近的vframe
                            begin = current;
                            vfs = VOM.all();
                            while (begin) {
                                if (Has(vfs, tempId = begin.id)) {
                                    GetSetAttribute(current, type, (vId = tempId) + '\u001a' + info);
                                    break;
                                }
                                begin = begin[ParentNode];
                            }
                        }
                        firstProcessed = 1;
                        if (vId) { //有处理的vframe,派发事件，让对应的vframe进行处理
                            vframe = VOM.get(vId);
                            view = vframe && vframe.view;
                            if (view) {
                                e.currentId = IdIt(current);
                                e.targetId = IdIt(target);
                                e.prevent = e.preventDefault;
                                e.stop = e.stopPropagation;
                                if (!e.halt) e.halt = Halt;
                                view.pEvt(oinfo, eventType, e);
                            }
                        } else {
                            throw Error('bad:' + oinfo);
                        }
                    }
                }
            } else {
                while (arr.length) {
                    node = arr.pop();
                    ignore = GetSetAttribute(node, MxIgnore) || ON;
                    if (!eventReg.test(ignore)) {
                        ignore = ignore + COMMA + eventType;
                        GetSetAttribute(node, MxIgnore, ignore);
                    }
                }
                node = null;
            }
            current = target = null;
        }
        //}
    },
    act: function(type, remove, vom) {
        var counter = RootEvents[type] || 0;
        var step = counter > 0 ? 1 : 0;
        var fn = Body.process;
        counter += remove ? -step : step;
        if (!counter) {
            if (vom) {
                VOM = vom;
            }
            Body.lib(RootNode, type, fn, remove);
            if (!remove) {
                counter = 1;
            }
        }
        RootEvents[type] = counter;
    }
};
    var Delegates = {
        mouseenter: 2,
        mouseleave: 2
    };
    Body.lib = function(node, type, cb, remove, scope, direct) {
        S.use('event', function(S, SE) {
            var flag = Delegates[type];
            if (!direct && flag == 2) {
                flag = (remove ? 'un' : EMPTY) + 'delegate';
                SE[flag](node, type, '[mx-' + type + ']', cb);
            } else {
                flag = remove ? 'detach' : ON;
                SE[flag](node, type, cb, scope);
            }
        });
    };
    return Body;
}, {
    requires: ['magix/magix']
});