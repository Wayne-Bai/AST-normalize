/*
 * jsTree radio plugin
 * Inserts radios in front of every node
 * Depends on the ui plugin
 * DOES NOT WORK NICELY WITH MULTITREE DRAG'N'DROP
 */
(function ($) {
  $.jstree.plugin("radio", {
    __init : function () {
      this.data.radio.noui = this._get_settings().radio.override_ui;
      if (this.data.ui && this.data.radio.noui) {
        this.select_node = this.deselect_node = this.deselect_all = $.noop;
        this.get_selected = this.get_checked;
      }

      this.get_container()
              .bind("open_node.jstree create_node.jstree clean_node.jstree refresh.jstree", $.proxy(function (e, data) {
        this._prepare_radios(data.rslt.obj);
      }, this))
              .bind("loaded.jstree", $.proxy(function (e) {
        this._prepare_radios();
      }, this))
              .delegate((this.data.ui && this.data.radio.noui ? "a" : "ins.jstree-radio"), "click.jstree", $.proxy(function (e) {
        e.preventDefault();
        if (this._get_node(e.target).hasClass("jstree-checked")) {
          this.uncheck_node(e.target);
        }
        else {
          this.check_node(e.target);
        }
        if (this.data.ui && this.data.radio.noui) {
          this.save_selected();
          if (this.data.cookies) {
            this.save_cookie("select_node");
          }
        }
        else {
          e.stopImmediatePropagation();
          return false;
        }
      }, this));
    },
    defaults : {
      override_ui : false,
      two_state : false,
      real_radios : false,
      checked_parent_open : true,
      real_radios_names : function (n) {
        return [ ("check_" + (n[0].id || Math.ceil(Math.random() * 10000))) , 1];
      }
    },
    __destroy : function () {
      this.get_container()
              .find("input.jstree-real-radio").removeClass("jstree-real-radio").end()
              .find("ins.jstree-radio").remove();
    },
    _fn : {
      _radio_notify : function (n, data) {
        if (data.checked) {
          this.check_node(n, false);
        }
      },
      _prepare_radios : function (obj) {
        obj = !obj || obj == -1 ? this.get_container().find("> ul > li") : this._get_node(obj);
        if (obj === false) {
          return;
        } // added for removing root nodes
        var c, _this = this, t, ts = this._get_settings().radio.two_state, rc = this._get_settings().radio.real_radios, rcn = this._get_settings().radio.real_radios_names;
        obj.each(function () {
          t = $(this);
          c = t.is("li") && (t.hasClass("jstree-checked") || (rc && t.children(":checked").length)) ? "jstree-checked" : "jstree-unchecked";
          t.find("li").andSelf().each(function () {
            var $t = $(this), nm;
            $t.children("a" + (_this.data.languages ? "" : ":eq(0)")).not(":has(.jstree-radio)").prepend("<ins class='jstree-radio'>&#160;</ins>").parent().not(".jstree-checked, .jstree-unchecked").addClass(ts ? "jstree-unchecked" : c);
            if (rc) {
              if (!$t.children(":radio").length) {
                nm = rcn.call(_this, $t);
                $t.prepend("<input type='radio' class='jstree-real-radio' id='" + nm[0] + "' name='" + nm[0] + "' value='" + nm[1] + "' />");
              }
              else {
                $t.children(":radio").addClass("jstree-real-radio");
              }
            }
            if (!ts) {
              if (c === "jstree-checked" || $t.hasClass("jstree-checked") || $t.children(':checked').length) {
                $t.find("li").andSelf().addClass("jstree-checked").children(":radio").prop("checked", true);
              }
            }
            else {
              if ($t.hasClass("jstree-checked") || $t.children(':checked').length) {
                $t.addClass("jstree-checked").children(":radio").prop("checked", true);
              }
            }
          });
        });
        if (!ts) {
          obj.find(".jstree-checked").parent().parent().each(function () {
            _this._repair_state(this);
          });
        }
      },
      change_state : function (obj, state) {
        obj = this._get_node(obj);
        var coll = false, rc = this._get_settings().radio.real_radios;
        if (!obj || obj === -1) {
          return false;
        }
        state = (state === false || state === true) ? state : obj.hasClass("jstree-checked");
        if (this._get_settings().radio.two_state) {
          if (state) {
            obj.removeClass("jstree-checked").addClass("jstree-unchecked");
            if (rc) {
              obj.children(":radio").prop("checked", false);
            }
          }
          else {
            obj.removeClass("jstree-unchecked").addClass("jstree-checked");
            if (rc) {
              obj.children(":radio").prop("checked", true);
            }
          }
        }
        else {
          if (state) {
            coll = obj.find("li").andSelf();
            if (!coll.filter(".jstree-checked, .jstree-undetermined").length) {
              return false;
            }
            coll.removeClass("jstree-checked jstree-undetermined").addClass("jstree-unchecked");
            if (rc) {
              coll.children(":radio").prop("checked", false);
            }
          }
          else {
            coll = obj.find("li").andSelf();
            if (!coll.filter(".jstree-unchecked, .jstree-undetermined").length) {
              return false;
            }
            coll.removeClass("jstree-unchecked jstree-undetermined").addClass("jstree-checked");
            if (rc) {
              coll.children(":radio").prop("checked", true);
            }
            if (this.data.ui) {
              this.data.ui.last_selected = obj;
            }
            this.data.radio.last_selected = obj;
          }
          obj.parentsUntil(".jstree", "li").each(function () {
            var $this = $(this);
            if (state) {
              if ($this.children("ul").children("li.jstree-checked, li.jstree-undetermined").length) {
                $this.parentsUntil(".jstree", "li").andSelf().removeClass("jstree-checked jstree-unchecked").addClass("jstree-undetermined");
                if (rc) {
                  $this.parentsUntil(".jstree", "li").andSelf().children(":radio").prop("checked", false);
                }
                return false;
              }
              else {
                $this.removeClass("jstree-checked jstree-undetermined").addClass("jstree-unchecked");
                if (rc) {
                  $this.children(":radio").prop("checked", false);
                }
              }
            }
            else {
              if ($this.children("ul").children("li.jstree-unchecked, li.jstree-undetermined").length) {
                $this.parentsUntil(".jstree", "li").andSelf().removeClass("jstree-checked jstree-unchecked").addClass("jstree-undetermined");
                if (rc) {
                  $this.parentsUntil(".jstree", "li").andSelf().children(":radio").prop("checked", false);
                }
                return false;
              }
              else {
                $this.removeClass("jstree-unchecked jstree-undetermined").addClass("jstree-checked");
                if (rc) {
                  $this.children(":radio").prop("checked", true);
                }
              }
            }
          });
        }
        if (this.data.ui && this.data.radio.noui) {
          this.data.ui.selected = this.get_checked();
        }
        this.__callback(obj);
        return true;
      },
      check_node : function (obj) {
        if (this.change_state(obj, false)) {
          obj = this._get_node(obj);
          if (this._get_settings().radio.checked_parent_open) {
            var t = this;
            obj.parents(".jstree-closed").each(function () {
              t.open_node(this, false, true);
            });
          }
          this.__callback({ "obj" : obj });
        }
      },
      uncheck_node : function (obj) {
        if (this.change_state(obj, true)) {
          this.__callback({ "obj" : this._get_node(obj) });
        }
      },
      check_all : function () {
        var _this = this,
                coll = this._get_settings().radio.two_state ? this.get_container_ul().find("li") : this.get_container_ul().children("li");
        coll.each(function () {
          _this.change_state(this, false);
        });
        this.__callback();
      },
      uncheck_all : function () {
        var _this = this,
                coll = this._get_settings().radio.two_state ? this.get_container_ul().find("li") : this.get_container_ul().children("li");
        coll.each(function () {
          _this.change_state(this, true);
        });
        this.__callback();
      },

      is_checked : function(obj) {
        obj = this._get_node(obj);
        return obj.length ? obj.is(".jstree-checked") : false;
      },
      get_checked : function (obj, get_all) {
        obj = !obj || obj === -1 ? this.get_container() : this._get_node(obj);
        return get_all || this._get_settings().radio.two_state ? obj.find(".jstree-checked") : obj.find("> ul > .jstree-checked, .jstree-undetermined > ul > .jstree-checked");
      },
      get_unchecked : function (obj, get_all) {
        obj = !obj || obj === -1 ? this.get_container() : this._get_node(obj);
        return get_all || this._get_settings().radio.two_state ? obj.find(".jstree-unchecked") : obj.find("> ul > .jstree-unchecked, .jstree-undetermined > ul > .jstree-unchecked");
      },

      show_radios : function () {
        this.get_container().children("ul").removeClass("jstree-no-radios");
      },
      hide_radios : function () {
        this.get_container().children("ul").addClass("jstree-no-radios");
      },

      _repair_state : function (obj) {
        obj = this._get_node(obj);
        if (!obj.length) {
          return;
        }
        if (this._get_settings().radio.two_state) {
          obj.find('li').andSelf().not('.jstree-checked').removeClass('jstree-undetermined').addClass('jstree-unchecked').children(':radio').prop('checked', true);
          return;
        }
        var rc = this._get_settings().radio.real_radios,
                a = obj.find("> ul > .jstree-checked").length,
                b = obj.find("> ul > .jstree-undetermined").length,
                c = obj.find("> ul > li").length;
        if (c === 0) {
          if (obj.hasClass("jstree-undetermined")) {
            this.change_state(obj, false);
          }
        }
        else if (a === 0 && b === 0) {
          this.change_state(obj, true);
        }
        else if (a === c) {
          this.change_state(obj, false);
        }
        else {
          obj.parentsUntil(".jstree", "li").andSelf().removeClass("jstree-checked jstree-unchecked").addClass("jstree-undetermined");
          if (rc) {
            obj.parentsUntil(".jstree", "li").andSelf().children(":radio").prop("checked", false);
          }
        }
      },
      reselect : function () {
        if (this.data.ui && this.data.radio.noui) {
          var _this = this,
                  s = this.data.ui.to_select;
          s = $.map($.makeArray(s), function (n) {
            return "#" + n.toString().replace(/^#/, "").replace(/\\\//g, "/").replace(/\//g, "\\\/").replace(/\\\./g, ".").replace(/\./g, "\\.").replace(/\:/g, "\\:");
          });
          this.deselect_all();
          $.each(s, function (i, val) {
            _this.check_node(val);
          });
          this.__callback();
        }
        else {
          this.__call_old();
        }
      },
      save_loaded : function () {
        var _this = this;
        this.data.core.to_load = [];
        this.get_container_ul().find("li.jstree-closed.jstree-undetermined").each(function () {
          if (this.id) {
            _this.data.core.to_load.push("#" + this.id);
          }
        });
      }
    }
  });
  $(function() {
    var css_string = '.jstree .jstree-real-radio { display:none; } ';
    $.vakata.css.add_sheet({ str : css_string, title : "jstree" });
  });
})(jQuery);
