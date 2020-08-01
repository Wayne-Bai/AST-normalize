// @require container.js

(function(){

        var BASE = DlGrid.inherits(DlContainer);
        function DlGrid(args) {
                if (args) {
                        D.setDefaults(this, args);
                        if (typeof this._rowType == "string")
                                this._rowType = eval(this._rowType);
                        if (!this._rowType)
                                this._rowType = DlGridRow;
                        if (typeof this._headType == "string")
                                this._headType = eval(this._headType);
                        if (!this._headType)
                                this._headType = DlGridHeadLabel;
                        DlContainer.call(this, args);
                }
        };

        eval(Dynarch.EXPORT("DlGrid", true));

        var MIN_COL_WID = 20;

        D.DEFAULT_ARGS = {
                _model            : [ "model"     , null ],
                _selType          : [ "selType"   , "row" ],
                _rowType          : [ "rowType"   , null ],
                _headType         : [ "headType"  , null ]
        };

        var SO = DOM.setOuterSize, SI = DOM.setInnerSize;

        var HTML = String.buffer(
                "<div class='DlGrid-Headers'>",
                "<table class='DlGrid-Table' cellspacing='0' cellpadding='0'>",
                "<tbody><tr></tr></tbody></table></div>",
                "<div class='DlGrid-Body'>",
                "<table class='DlGrid-Table' cellspacing='0' cellpadding='0'>",
                "<tbody></tbody></table></div>"
        ).get();

        function onBodyScroll() {
                this.getHeaderDiv().scrollLeft = this.getBodyDiv().scrollLeft;
        };

        P._createElement = function() {
                BASE._createElement.call(this);
                // this.addClass("DlGrid-selection-" + this._selType);
                this._rowsGroup = DlRadioGroup.get();
                this.setContent(HTML);
                this.getBodyDiv().onscroll = onBodyScroll.$(this); // @leak
                this._initHeaders();
                this._initBody();
        };

        P.getGroup = function() {
                return this._rowsGroup;
        };

        P.getHeaderDiv = function() {
                return this.getElement().firstChild;
        };

        P.getHandlesDiv = function() {
                var div = this.getHeaderDiv().childNodes[1];
                if (!div) {
                        div = CE("div", null, { className: "DlGrid-Handles" }, this.getHeaderDiv());
                        this._resizeCaptures = {
                                onMouseMove  : doResize.$(this),
                                onMouseUp    : stopResize.$(this),
                                onMouseOver  : DlException.stopEventBubbling,
                                onMouseOut   : DlException.stopEventBubbling,
                                onMouseEnter : DlException.stopEventBubbling,
                                onMouseLeave : DlException.stopEventBubbling
                        };
                }
                return div;
        };

        P.getHeaderRow = function() {
                return this.getHeaderDiv().firstChild.rows[0];
        };

        P.getBodyDiv = function() {
                return this.getElement().childNodes[1];
        };

        P.getBodyTable = function() {
                return this.getBodyDiv().firstChild;
        };

        P._onHeadClick = function() {};

        P._appendWidgetElement = function(w, pos) {
                if (w instanceof this._rowType) {
                        var table = this.getBodyTable();
                        // WTF?!  Looks awful!
                        if (pos != null) {
                                var row = table.rows[pos];
                                if (row)
                                        row.parentNode.insertBefore(w.getElement(), row);
                                else
                                        table.firstChild.appendChild(w.getElement());
                        } else {
                                table.firstChild.appendChild(w.getElement());
                        }
                } else
                        BASE._appendWidgetElement.apply(this, arguments);
        };

        P._initHeaders = function() {
                var onHeadClick = this._onHeadClick.$(this);
                this._model.foreachCol(function(col) {
                        var td = document.createElement("td");
                        this.getHeaderRow().appendChild(td);
                        var btn = this._makeHeadLabel(
                                { parent         : this,
                                  appendArgs     : td,
                                  iconClass      : col.getIconClass(),
                                  label          : col.getLabel(),
                                  column         : col,
                                  className      : "DlGrid-align-" + col.getStyle("textAlign", "left"),
                                  tooltip        : col.tooltip
                                }
                        );
                        col._button = btn;
                        btn.addEventListener("onClick", onHeadClick);
                }, this);
        };

        P._makeRow = function(args) {
                return new this._rowType(args);
        };

        P._makeHeadLabel = function(args) {
                return new this._headType(args);
        };

        P._initBody = function() {
                this._model.foreachRow(function(row) {
                        row = this._makeRow({ parent : this,
                                              group  : this._rowsGroup,
                                              value  : row.id,
                                              model  : row
                                            });
                }, this);
                this._model.addEventListener({ onInsertRow : this._insertRow.$(this),
                                               onDeleteRow : this._deleteRow.$(this),
                                               onSort      : this._sort.$(this)
                                             });
        };

        P._insertRow = function(row) {
                var index = row.getIndex();
                row = this._makeRow({ parent     : this,
                                      group      : this._rowsGroup,
                                      value      : row.id,
                                      model      : row,
                                      appendArgs : index
                                    });
                var cells = row.getElement().cells;
                var head_cells = this.getHeaderRow().cells;
                for (var i = cells.length; --i >= 0;) {
                        var td = cells[i];
                        var w = head_cells[i].offsetWidth;
                        SO(td.firstChild, w, null);
                        SI(td, w, null);
                }
        };

        P._deleteRow = function(row) {
                var index = row.getIndex();
                row = this.getRowByIndex(index);
                row.destroy();
        };

        P._sort = function(col, prev, desc, a) {
                if (prev) {
                        prev._button.delClass("DlGridHeadLabel-sort-up");
                        prev._button.delClass("DlGridHeadLabel-sort-down");
                }
                if (col) {
                        col._button.condClass(desc, "DlGridHeadLabel-sort-down", "DlGridHeadLabel-sort-up");
                        var table = this.getBodyTable(), tbody = table.firstChild, rows = table.rows;
                        a = a.map(function(index) {
                                return rows[index];
                        });
                        a.foreach(function(tr) {
                                tbody.appendChild(tr);
                        });
                }
        };

        P.__doLayout = function() {
                var size = this.getInnerSize();
                var body = this.getBodyDiv();
                var header = this.getHeaderDiv();
                SO(body, size.x, size.y - header.offsetHeight);
                SO(header, size.x, null);
                header.style.marginRight = -DOM.getScrollbarSize(body).x + "px";
                if (!this.__hasLayout) {
                        this._initColSizes();
                        this.__hasLayout = true;
                        this.getBodyTable().style.width = "";
                } else {
                        this._updateFillCols();
                }
                onBodyScroll.call(this);
        };

        P.getRowByIndex = function(index) {
                try {
                        return DlWidget.getFromElement(this.getBodyTable().rows[index]);
                } catch(ex) {};
        };

        P.getRowById = function(id) {
                return this.getRowByIndex(this._model.getRowById(id).getIndex());
        };

//         P.getActualColWidth = function(index) {
//                 var w, r = this.getBodyTable().rows;
//                 if (r.length > 0)
//                         w = r.cells[index].offsetWidth;
//                 else
//                         w = this.getHeaderRow().cells[index].offsetWidth;
//                 return w;
//         };

        P.getActualColWidth = function(i) {
                return this.getHeaderRow().cells[i].offsetWidth;
        };

        P._initColSizes = function() {
                var h = this.getHeaderDiv().offsetHeight + "px";
                var x = 0;
                var listWidth = this.getInnerSize().x - DOM.getScrollbarSize(this.getBodyDiv()).x;
                this._fillCols = [];
                this._model.foreachCol(function(col){
                        if (!col.fill)
                                x += col.width || this.getActualColWidth(col.getIndex());
                        else
                                this._fillCols.push(col);
                }, this);
                var fillWidth = listWidth - x;
                x = 0;
                function doIt(col) {
                        var w = col.fill
                                ? Math.floor(fillWidth * col.fill)
                                : (col.width || this.getActualColWidth(col.getIndex()));
                        w = this.setColSize(col, w, true);
                        x += w;
                        if (col.isResizable && !col._resizeHandle) {
                                var div = CE("div",
                                             { "left": x + "px", height: h },
                                             { className: "DlGrid-resizeHandle" },
                                             this.getHandlesDiv());
                                if (is_ie)
                                        DOM.setUnselectable(div, true);
                                div.dl_resizeCol = col;
                                col._resizeHandle = div;
                                div.onmousedown = startResize.$(this, div, col); // @leak
                        }
                };
                // SI(this.getBodyTable(), x, null);
                this._model.foreachCol(doIt, this);
                // alert(this.getHandlesDiv().innerHTML);
        };

        P.setColSize = function(col, w, noUpdate) {
                var btn = col._button;
                if (w != null) {
                        btn.setOuterSize({ x: w });
                        var td = btn.getElement().parentNode;
                        SO(td, w, null);
                }
                var row = this.getBodyTable().rows[0];
                w = btn.getOuterSize().x;
                col = col.getIndex();
                Array.$(this.getBodyTable().rows).foreach(function(row){
                        if (row) {
                                td = row.cells[col];
                                SO(td.firstChild, w, null);
                                SI(td, w, null);
                        }
                });
                onBodyScroll.call(this);
                if (!noUpdate)
                        this._updateResizeHandles();
                return w;
        };

        P._updateFillCols = function(diff) {
                if (diff == null) {
                        var body = this.getBodyDiv();
                        diff = this.getHeaderRow().offsetWidth - body.offsetWidth + DOM.getScrollbarSize(body).x;
                }
                this._fillCols.foreach(function(col){
                        var w = this.getActualColWidth(col.getIndex());
                        w -= Math.round(col.fill * diff);
                        this.setColSize(col, w);
                }, this);
        };

        P._updateResizeHandles = function() {
                this._model.foreachCol(function(col) {
                        if (col._resizeHandle) {
                                var td = col._button.getElement().parentNode;
                                col._resizeHandle.style.left = td.offsetLeft + td.offsetWidth + "px";
                        }
                });
        };

        P._handle_focusKeys = function(ev) {
                var g = this.getGroup(), row = ev.focusedWidget;
                switch (ev.keyCode) {

                    case DlKeyboard.ARROW_UP:
                    case DlKeyboard.ARROW_DOWN:
                    case DlKeyboard.PAGE_UP:
                    case DlKeyboard.PAGE_DOWN:
                        var wid = ( ev.keyCode == DlKeyboard.ARROW_UP ||
                                    ev.keyCode == DlKeyboard.PAGE_UP )
                                ? this.getPrevRow(row)
                                : this.getNextRow(row);
                        if (wid) {
                                wid.focus();
                                if (ev.shiftKey && this._selType == "multiple") {
                                        g.maxChecked(null);
                                        row.checked(true);
                                        wid.checked(true);
                                } else if (this._selType != "multiple") {
                                        g.maxChecked(1);
                                        wid.checked(true);
                                }
                        } else if (ev.shiftKey || ev.ctrlKey) {
                                row.checked(true);
                        }
                        ev.domStop = true;
                        DlException.stopEventBubbling();
                        break;

                    case DlKeyboard.HOME:
                    case DlKeyboard.END:
                        var wid = ev.keyCode == DlKeyboard.HOME
                                ? this.getRowByIndex(0)
                                : this.getRowByIndex(this.getBodyTable().rows.length - 1);
                        if (wid) {
                                wid.focus();
                                ev.domStop = true;
                                if (this._selType != "multiple") {
                                        ev.keyCode = DlKeyboard.ENTER;
                                        wid._handle_focusKeys(ev);
                                }
                                DlException.stopEventBubbling();
                        }
                        break;
                }

                return BASE._handle_focusKeys.call(this, ev);
        };

        function startResize(div, col, ev) {
                if (!ev)
                        ev = window.event;
                var pos = div.offsetLeft;
                var bar = DlResizeBar.getDragBar(), s = bar.style;
                s.left = pos - this.getBodyDiv().scrollLeft + 1 + "px";
                s.height = "100%";
                s.width = div.offsetWidth - 2 + "px";
                s.top = "0px";
                this.getElement().appendChild(bar);
                var es = DlDialog.activateEventStopper(true);
                DOM.addClass(es, "CURSOR-RESIZE-E");
                DlEvent.captureGlobals(this._resizeCaptures);

                var dev = new DlEvent(ev);
                this._resize = {
                        div    : div,
                        col    : col,
                        pos    : pos,
                        orig   : this.getActualColWidth(col.getIndex()),
                        mouse  : dev.pos.x
                };

                DOM.stopEvent(ev);
        };

        function doResize(ev) {
                var bar = DlResizeBar.getDragBar();
                var left = this._resize.pos + ev.pos.x - this._resize.mouse;
                var diff = left - this._resize.pos;
                var w = this._resize.orig + diff;
                if (w < MIN_COL_WID) {
                        left += MIN_COL_WID - w;
                        w = MIN_COL_WID;
                }
                left -= this.getBodyDiv().scrollLeft;
                bar.style.left = left + 1 + "px";
        };

        function stopResize(ev) {
                var left = this._resize.pos + ev.pos.x - this._resize.mouse;
                var diff = left - this._resize.pos;
                var w = this._resize.orig + diff;
                if (w < MIN_COL_WID) {
                        left += MIN_COL_WID - w;
                        w = MIN_COL_WID;
                }
                diff = w - this._resize.orig;
                this.setColSize(this._resize.col, w);
                this._updateFillCols(diff);
                this.getElement().removeChild(DlResizeBar.getDragBar());
                DlEvent.releaseGlobals(this._resizeCaptures);
                var es = DlDialog.activateEventStopper(false);
                DOM.delClass(es, "CURSOR-RESIZE-E");
        };

        P.getNextRow = function(row) {
                return this.getRowByIndex(row.getModel().getIndex() + 1);
        };

        P.getPrevRow = function(row) {
                return this.getRowByIndex(row.getModel().getIndex() - 1);
        };



})();

(function(){

        var BASE = DlGridRow.inherits(DlAbstractButton);
        function DlGridRow(args) {
                if (args) {
                        this._customMoveKeys = true;
                        D.setDefaults(this, args);
                        DlAbstractButton.call(this, args);
                }
        };

        eval(Dynarch.EXPORT("DlGridRow", true));

        D.DEFAULT_ARGS = {
                _tagName        : [ "tagName"     , "tr" ],
                _classes        : [ "classes"     , {
                                            active     : "DlGridRow-active",
                                            hover      : "DlGridRow-hover",
                                            checked    : "DlGridRow-1",
                                            unchecked  : "DlGridRow-0",
                                            empty      : "DlGridRow-empty",
                                            disabled   : "DlGridRow-disabled"
                                    } ],
                _btnType        : [ "type"        , DlButton.TYPE.TWOSTATE ],
                _model          : [ "model"       , null ],
                _focusable      : [ "focusable"   , true ],
                __tooltip       : [ "tooltip"     , getTooltip ]
        };

        function getTooltip() {
                var row = this.args.widget;
                return row.getModel().tooltip;
        };

        P.getModel = function() {
                return this._model;
        };

        function onDestroy() {
                this._model.removeEventListener("onChange", this._on_modelChange);
        };

        P._onClick = function(ev) {
                this.parent.getGroup().maxChecked(ev.ctrlKey && this.parent._selType == "multiple" ? null : 1);
                BASE._onClick.call(this, ev);
        };

        P._handle_focusKeys = function(ev) {
                var p = this.parent, g = p.getGroup();
                if (ev.keyCode == DlKeyboard.ENTER) {
                        g.maxChecked(ev.shiftKey || ev.ctrlKey && p._selType == "multiple" ? null : 1);
                        this.applyHooks("onClick", [ ev ]);
                        ev.domStop = true;
                } else {
                        return BASE._handle_focusKeys.call(this, ev);
                }
        };

        P._createElement = function() {
                // the one in DlAbstractButton is too complicated
                DlWidget.prototype._createElement.call(this);
                var tr = this.getElement();
                this._model.foreachCell(function(cell, col) {
                        // var td = tr.insertRow(-1); // doesn't work in IE.
                        var td = CE("td", null, null, tr);
                        displayCell(td, cell, col);
                }, this);
                this._on_modelChange = this._on_modelChange.$(this);
                this._model.addEventListener("onChange", this._on_modelChange);
                this.addEventListener("onDestroy", onDestroy);
        };

        P._on_modelChange = function(row, cell, what, val) {
                switch (what) {
                    case "value":
                        displayCell(this.getElement().cells[cell.getIndex()],
                                    cell,
                                    this._model.model.getColByIndex(cell.getIndex()));
                        break;
                }
        };

        function displayCell(td, cell, col) {
                if (!td.firstChild) {
                        td.innerHTML = '<div class="DlGrid-cellData">' + cell.getContent() + '</div>';
                } else {
                        td.firstChild.innerHTML = cell.getContent();
                }
                td.className = "DlGrid-align-" + cell.getStyle("textAlign", col.getStyle("textAlign", "left"));
        };

})();

(function(){
        var BASE = DlGridHeadLabel.inherits(DlButton);
        function DlGridHeadLabel(args) {
                if (args) {
                        this.column = args.column;
                        args.focusable = false; // no focus by default
                        // D.setDefaults(this, args);
                        this.__withIconClass = "DlButton-withIcon";
                        DlButton.call(this, args);
                        if (!this.column.isSortable)
                                this.__disabled = true;
                }
        };

        eval(Dynarch.EXPORT("DlGridHeadLabel"));

        P.setWidth = function(w) {
                this.setOuterSize({ x: w });
        };

        P.label = function(label) {
                this.setContent("<div class='DlButton-Label'>" + this._label + "</div>");
        };

        P._onClick = function() {
                this.column.sort();
        };

        D.DEFAULT_ARGS = {
                _classes : [ "classes", { active    : "DlGridHeadLabel-active",
                                          hover     : "DlGridHeadLabel-hover",
                                          checked   : "DlGridHeadLabel-1",
                                          unchecked : "DlGridHeadLabel-0",
                                          empty     : "DlGridHeadLabel-empty",
                                          disabled  : "DlGridHeadLabel-disabled"
                                        } ]
        };

})();
