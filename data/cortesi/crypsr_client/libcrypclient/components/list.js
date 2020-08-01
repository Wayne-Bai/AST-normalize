
var BEFORE = 1;
var AFTER = 2;
var UNDER = 3;

function kc(e) { return e.keyCode ? e.keyCode : e.charCode ? e.charCode : e.which; };

var List = {
    render: function(obj){
        var converter = new Showdown.converter();
        obj.html("<div class='listtxt'>" + converter.makeHtml(obj.data("txt")) + "</div>");
    },

    find_next: function(itm){
        if (!itm)
            return null;
        var next = false;
        var ret = null;
        $(".list li.listitm").each(function(idx, e){
            e = $(e);
            if (e.get(0) === itm.get(0)){
                next = true;
                return;
            }
            if (next && e.is(":visible")){
                next = false;
                ret = e;
                return;
            }
        });
        return ret;
    },

    key_down: function(){
        var x;
        if (x = this.find_next(this.focus))
            this.set_focus(x);
    },

    find_prev: function(itm){
        if (!itm)
            return null;
        var done = false;
        var ret = null;
        $(".list li.listitm").each(function(idx, e){
            e = $(e);
            if (e.is(":visible")){
                if (done) return;
                if (itm.get(0) === e.get(0)){
                    done = true;
                    return;
                }
                ret = e;
                return;
            }
        });
        return ret;
    },

    key_up: function(){
        var x;
        if (x = this.find_prev(this.focus))
            this.set_focus(x);
    },

    edit: function(){
        this.save_undo();
        var oldfocus = this.focus;
        var ta = $("<textarea id='listedit'>" + this.focus.data("txt") + "</textarea>");
        this.focus.children().first().replaceWith(ta);
        ta.focus();
        ta.TextAreaExpander();
        ta.putCursorAtEnd();
        function done(){
            oldfocus.data(
                "txt", 
                ta.attr('value')
            );
            var converter = new Showdown.converter();
            ta.replaceWith("<div class='listtxt'>" + converter.makeHtml(ta.attr("value")) + "</div>");
            List.onchange();
        }
        ta.focusout(done);
        ta.bind("keydown", function(e){
            if (kc(e) == 9 || kc(e) == 27){
                done();
                return false;
            }
        })
        return false;
    },

    _addEditor: function(ins){
        $("#emptymsg").hide();
        var ta = $("#listedit");
        var oldfocus = this.focus;
        this.set_focus(ta.parent());
        ta.focus();
        ta.TextAreaExpander();
        ta.putCursorAtEnd();
        function done(){
            if (ta.attr('value').length){
                ta.parent().data("txt", ta.attr('value'));
                List.render(ta.parent());
            } else {
                List.set_focus(oldfocus);
                ins.remove();
            }
            List.onchange();
            List.refresh_handlers();
        }
        ta.focusout(done);
        ta.bind("keydown", function(e){
            if (kc(e) == 9 || kc(e) == 27){
                done();
                return false;
            }
        })
    },

    _add: function(before){
        this.save_undo();
        var ins = $("<li class='listitm' tabindex='0'><textarea id='listedit'></textarea></li>");
        if (!this.focus)
            ins.prependTo($("#listmaster"));
        else if (before)
            ins.insertBefore(this.focus);
        else
            ins.insertAfter(this.focus);
        this._addEditor(ins);
    },

    _add_list: function(){
        this.save_undo();
        if (this.focus.has("ul.list").length){
            var ins = $("<li class='listitm' tabindex='0'><textarea id='listedit'></textarea></li>");
            $(this.focus.find("ul.list").get(0)).append(ins);
        } else {
            var ins = $("<ul class='list'><li class='listitm' tabindex='0'><textarea id='listedit'></textarea></li></ul>");
            this.focus.append(ins);
        }
        this._addEditor(ins);
    },

    add_list: function(){
        this._add_list();
    },

    add: function(){
        this._add(false);
    },

    add_before: function(){
        this._add(true);
    },

    yank: function(){
        this.buffer = this.serialize_one(this.focus);
    },

    cut: function(){
        if (this.focus){
            this.yank();
            this.save_undo();
            var newfocus = this.focus.next(".listitm")
            if (newfocus.length == 0)
                newfocus = this.find_prev(this.focus)
            var p = this.focus.parent();
            this.focus.remove();
            if (p.children().length == 0 && (!p.is("#listmaster")))
                p.remove();
            this.set_focus(newfocus);
            this.onchange();
        }
    },

    _paste: function(pos){
        if (this.buffer){
            this.save_undo();
            var n = this.unserialize([this.buffer], this.focus, pos);
            this.set_focus(n);
            this.onchange();
            this.refresh_handlers();
        }
    },

    paste_before: function(){
        this._paste(BEFORE);
    },

    paste: function(){
        this._paste(AFTER);
    },

    paste_sublist: function(){
        this._paste(UNDER);
    },

    keys_bind: function (){
        this.keys_unbind();
        for (var i = 0; i < this.keys.length; i++){
            $(document).bind(
                this.keys[i][0],
                this.keys[i][1],
                this.keys[i][2]
            )
        }
    },

    keys_unbind: function (){
        if (this.keys) {
            $(document).unbind("keypress");
            $(document).unbind("keydown");
        }
    },

    set_focus: function (e, norefocus) {
        if (e && e.length){
            this.focus = e;
            if (!norefocus)
                e.focus();
            $(".list li").removeClass("list_focused");
            e.addClass("list_focused");
        } else {
            this.focus = null;
            $(".list li").removeClass("list_focused");
        }
    },

    focus_first: function () {
        var e = $(".list li:first");
        this.set_focus(e);
    },

    unserialize: function(data, loc, pos){
        for (var i = 0; i < data.length; i++){
            obj = data[i];
            var newli = $("<li class='listitm' tabindex='0'></li>");
            newli.data(obj);

            if (!loc){
                var loc = $("#listmaster");
                var pos = null;
            }

            if (pos == AFTER)
                newli.insertAfter(loc);
            else if (pos == BEFORE)
                newli.insertBefore(loc);
            else if (pos == UNDER) {
                if (loc.has("ul.list").length){
                    var newul = $(loc.find("ul.list").get(0));
                } else {
                    var newul = $("<ul class='list'></ul>");
                    newul.appendTo(loc);
                }
                newli.appendTo(newul);
            } else 
                loc.append(newli);

            this.render(newli);
            if (obj["focus"]){
                this.set_focus(newli);
            }
            if (obj.children){
                var newul = $("<ul class='list'/>");
                newli.append(newul);
                this.unserialize(obj.children, newul)
            } 
        }
        return newli;
    },

    refresh_handlers: function(){
        $(".listitm").focus(function(e){
            if ($(e.target).is("li.listitm") && $(e.target)[0] != List.focus[0]){
                List.set_focus($(this), true);
                e.stopPropagation();
                return false;
            };
            e.stopPropagation();
        });
        $(".listitm").contextMenu(
            {menu: 'clickmenu'},
            function(action, el, pos){
                switch (action){
                    case "edit": List.edit(); break;
                    case "cut": List.cut(); break;
                    case "copy": List.yank(); break;
                    case "paste": List.paste(); break;
                    case "add": List.add(); break;
                    case "sublist": List.add_list(); break;
                }
            }
        );
    },

    restore: function(data){
        ul = $("#listmaster");
        ul.find("*").unbind();
        ul.empty();
        this.unserialize(data, ul);
        if (data.length && !this.focus)
            this.focus_first();
        else if (!data.length)
            this.set_focus(null);
        this.refresh_handlers();
    },

    _copy_data: function(e){
        var data = e.data()
        var x = {}
        x["txt"] = data["txt"]
        return x;
    },

    serialize: function(ul){
        var data = [];
        if (!ul) ul = $("#listmaster");
        var children = ul.children();
        for (var i = 0; i < children.length; i++){
            var obj = $(children[i]);
            if (obj.is("li.listitm")){
                var d = this._copy_data(obj);
                if (obj.hasClass("list_focused"))
                    d["focus"] = true;
                if (obj.has("ul.list").length){
                    d["children"] = this.serialize($(obj.find("ul.list").get(0)));
                }
                data.push(d);
            } 
        }
        return data;
    },

    serialize_one: function(obj) {
        var d = this._copy_data(obj);
        if (obj.hasClass("list_focused"))
            d["focus"] = true;
        if (obj.has("ul.list").length){
            d["children"] = this.serialize($(obj.find("ul.list").get(0)));
        }
        return d;
    },

    save_undo: function(){
        this.undobuffer.push(this.serialize());
        if (this.undobuffer.length > this.UNDO_LEN)
            this.undobuffer.shift();
    },

    undo: function(){
        if (this.undobuffer.length){
            var cp = this.undobuffer.pop();
            this.restore(cp);
            if (this.filter){
                this.set_filter(this.filter);
            }
        }
        this.onchange()
    },

    /* 
     * Helpers to open and close dialogs safely, with keys unbound and rebound.
     */
    open_dialog: function(sel){
        var dia = $(sel).modal(
            {
                focus: true,
                close: false
            }
        );
        $("#emptymsg").hide();
        List.keys_unbind();
        return dia;
    },

    close_dialog: function(dia){
        dia.close();
        List.keys_bind();
        if ($("#listmaster").children().length == 0){
            $("#emptymsg").show();
        }
    },

    onchange: function(){
        if ($("#listmaster").children().length == 0){
            $("#emptymsg").show();
        } else {
            $("#emptymsg").hide();
        }
        if (this.change_callback)
            this.change_callback();
    },

    help: function(){
        var dia = this.open_dialog("#d_help");
        $(document).bind(
            "keydown",
            "q",
            function () {
                List.close_dialog(dia);
            }
        );
        $(document).bind(
            "keydown",
            "esc",
            function () {
                List.close_dialog(dia);
            }
        );
    },

    set_filter: function(v){
        if (v == ""){
            this.remove_filter();
        } else {
            this.filter = v;
            $("#filter_status").html("/" + this.filter);
            $("#filter_status").show();

            $(".list li.listitm").each(function(idx, e){
                e = $(e);
                e.hide();
            });
            _list = this;
            $(".list li.listitm").each(function(idx, e){
                e = $(e);
                if (e.data("txt").toLowerCase().indexOf(_list.filter.toLowerCase()) != -1){
                    e.show();
                    e.parents(".list li.listitm").each(function(idx, x){
                        x = $(x);
                        x.show();
                    })
                    e.find(".list li.listitm").each(function(idx, x){
                        x = $(x);
                        x.show();
                    })
                }
            });
            if (!this.focus){
                this.focus_first();
            } else if (!this.focus.is(":visible")){
                var newfocus = this.find_next(this.focus);
                if (!newfocus) 
                    newfocus = this.find_prev(this.focus);
                this.set_focus(newfocus);
            }
        }
    },

    remove_filter: function(){
        this.filter = null;
        $("#filter_status").hide();
        $(".list li.listitm").each(function(idx, e){
            e = $(e);
            e.show();
        });
        if (!this.focus){
            this.focus_first();
        }
    },

    filter_dialog: function(){
        var dia = this.open_dialog("#d_filter");
        if (this.filter)
            $('#filter').attr("value", this.filter);
        else
            $('#filter').attr("value", "");
        $('#filter').keypress(function (e) {
            if (e.which == 13){
                List.set_filter($('#filter').attr("value"));
                List.close_dialog(dia);
            }
            return true;
        })
        $(document).bind(
            "keydown",
            "esc",
            function () {
                List.close_dialog(dia);
            }
        );
    },

    /*
     * data: encrypted data blob.
     * change_callback: a function called whenever data is changed.
     * save_callback: a function called when "s" shortcut is used.
     */
    init: function(data, change_callback, save_callback){
        this.UNDO_LEN = 20;
        this.change_callback = change_callback;
        this.keys =  [
            ["keypress", "j", function(){List.key_down(); return false;}],
            ["keypress", "k", function(){List.key_up(); return false;}],
            ["keypress", "e", function(){List.edit(); return false;}],
            ["keypress", "d", function(){List.cut(); return false;}],
            ["keypress", "p", function(){List.paste(); return false;}],
            ["keypress", "shift+p", function(){List.paste_before(); return false;}],
            ["keypress", "a", function(){List.add(); return false;}],
            ["keypress", "shift+a", function(){List.add_before(); return false;}],
            ["keypress", "l", function(){List.add_list(); return false;}],
            ["keypress", "shift+l", function(){List.paste_sublist(); return false;}],
            ["keypress", "y", function(){List.yank(); return false;}],
            ["keypress", "u", function(){List.undo(); return false;}],
            ["keypress", "s", function(){save_callback(); return false;}],
            ["keypress", "/", function(){List.filter_dialog(); return false;}],

            ["keydown", "shift+/", function(){List.help(); return false;}],
            ["keydown", "?", function(){List.help(); return false;}]
        ];
        this.filter = null;
        this.focus = null;
        this.buffer = null;
        this.undobuffer = [];
        this.keys_bind();
        if (data){
            this.restore(data);
        } else {
            $("#emptymsg").show();
        }
    }
}

function list_run () {
    List.init();
}

