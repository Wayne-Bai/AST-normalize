// @require eventproxy.js

// cell model

(function(){

        DlGridCellModel.inherits(DlEventProxy);
        function DlGridCellModel(args) {
                if (arguments.length > 0) {
                        DlEventProxy.call(this);
                        if (typeof args != "object")
                                args = { value: args };
                        DlGridCellModel.setDefaults(this, args);
                        this.registerEvents(DEFAULT_EVENTS);
                }
        };

        eval(Dynarch.EXPORT("DlGridCellModel"));

        var DEFAULT_EVENTS = [ "onChange" ];

        D.DEFAULT_ARGS = {
                _value     : [ "value"     , null ],
                _style     : [ "style"     , {} ]
        };

        P.setValue = function(val) {
                var oldVal = this._value;
                this._value = val;
                this.applyHooks("onChange", [ this, "value", val, oldVal ]);
        };

        // override
        P.getContent = function() {
                return this._value;
        };

        P.getStyle = function(key, def) {
                if (key in this._style)
                        return this._style[key];
                return def;
        };

        P.getIndex = function() {
                return this.index;
        };

        P.getId = function() {
                return this.model.getColByIndex(this.index).id;
        };

        P.setStyle = function(key, val) {
                var oldval = this._style[key];
                this._style[key] = val;
                this.applyHooks("onChange", [ this, "style", val, oldval, key ]);
        };

        // override
        P.compareTo = function(cell) {
                return this._value < cell._value
                        ? -1
                        : (this._value > cell._value ? 1 : 0);
        };

})();

// columns model

(function(){

        DlGridColModel.inherits(DlEventProxy);
        function DlGridColModel(args) {
                if (arguments.length > 0) {
                        DlEventProxy.call(this);
                        DlGridColModel.setDefaults(this, args);
                        this.registerEvents(DEFAULT_EVENTS);
                        if (typeof this._cellType == "string")
                                this._cellType = eval(this._cellType);
                        // this._cells = [];
                }
        };

        eval(Dynarch.EXPORT("DlGridColModel"));

        var DEFAULT_EVENTS = [ "onChange" ];

        D.DEFAULT_ARGS = {
                width         : [ "width"      , null ],
                fill          : [ "fill"       , false ],
                _label        : [ "label"      , null ],
                id            : [ "id"         , null ],
                _cellType     : [ "cellType"   , DlGridCellModel ],
                isResizable   : [ "resizable"  , false ],
                isScrollable  : [ "scrollable" , true ],
                isSortable    : [ "sortable"   , true ],
                tooltip       : [ "tooltip"    , null ],
                _style        : [ "style"      , {} ],
                _iconClass    : [ "iconClass"  , null ]
        };

        P.getId = function() {
                return this.id;
        };

        P.getIndex = function() {
                return this.index;
        };

        P.getIconClass = function() {
                return this._iconClass;
        };

        P.setIconClass = function(iconClass) {
                var oldval = this._iconClass;
                this._iconClass = iconClass;
                this.applyHooks("onChange", [ this, "iconClass", val, oldval ]);
        };

        P.getLabel = function() {
                return this._label;
        };

        P.setLabel = function(label) {
                var oldval = this._label;
                this._label = label;
                this.applyHooks("onChange", [ this, "label", val, oldval ]);
        };

        P.getCellType = function() {
                return this._cellType;
        };

        P.createCell = function(args) {
                var cell = new this._cellType(args);
                // this._cells.push(cell);
                return cell;
        };

//         P.getCells = function() {
//                 return this._cells;
//         };

        P.getStyle = function(key, def) {
                if (key in this._style)
                        return this._style[key];
                return def;
        };

        P.setStyle = function(key, val) {
                var oldval = this._style[key];
                this._style[key] = val;
                this.applyHooks("onChange", [ this, "style", val, oldval, key ]);
        };

        P.sort = function() {
                this.model.sort(this);
        };

        P.compareRows = function(a, b) {
                // return a.compareTo(b);
                var index = this.getIndex();
                a = a.getCellByIndex(index);
                b = b.getCellByIndex(index);
                return a.compareTo(b);
        };

})();

// rows model

(function(){

        DlGridRowModel.inherits(DlEventProxy);
        function DlGridRowModel(args) {
                if (arguments.length > 0) {
                        if (args instanceof Array) {
                                var tmp = {
                                        id    : args.id,
                                        model : args.model,
                                        cells : {}
                                };
                                args.model.foreachCol(function(col, i){
                                        tmp.cells[col.getId()] = args[i];
                                });
                                args = tmp;
                        }
                        DlEventProxy.call(this);
                        D.setDefaults(this, args);
                        this.registerEvents(DEFAULT_EVENTS);
                        this._init();
                }
        };

        eval(Dynarch.EXPORT("DlGridRowModel"));

        var DEFAULT_EVENTS = [ "onChange" ];

        D.DEFAULT_ARGS = {
                id       : [ "id"      , null ],
                userData : [ "data"    , null ],
                _cells   : [ "cells"   , null ],
                _model   : [ "model"   , null ],
                tooltip  : [ "tooltip" , null ]
        };

        P.reset = function(r) {
                this.id = r.id;
                this.userData = r.data;
                this.tooltip = r.tooltip;
                this.foreachCell(function(cell, col) {
                        cell.setValue(r.cells[col.getId()]);
                });
        };

        P.getId = function() {
                return this.id;
        };

        P.getIndex = function() {
                return this.index;
        };

        P.getCells = function() {
                return this._cells;
        };

        P.getCellByIndex = function(index) {
                return this._cells[this.model.getColByIndex(index).getId()];
        };

        P.foreachCell = function(f, obj) {
                this.model.foreachCol(function(col, index) {
                        var cell = this._cells[col.getId()];
                        f.apply(obj, [ cell, col, index ]);
                }, this);
        };

        P._onCellChange = function(cell, what, newval, oldval) {
                this.applyHooks("onChange", [ this, cell, what, newval, oldval ]);
        };

        P._init = function() {
                var grid = this._model, c = this._cells;
                this.model = grid; delete this._model;
                var onChange = this._onCellChange.$(this);
                for (var i in c) {
                        var cell = c[i];
                        var col = grid.getColById(i);
                        cell = c[i] = col.createCell(cell);
                        cell.model = grid;
                        cell.colId = i;
                        cell.index = col.getIndex();
                        cell.parent = this;
                        cell.addEventListener("onChange", onChange);
                }
        };

})();

// tabular data model

(function(){

        DlGridModel.inherits(DlEventProxy);
        function DlGridModel(args) {
                if (arguments.length > 0) {
                        DlEventProxy.call(this);
                        DlGridModel.setDefaults(this, args);
                        this.registerEvents(DEFAULT_EVENTS);
                        this._init();
                }
        };

        eval(Dynarch.EXPORT("DlGridModel"));

        var DEFAULT_EVENTS = [ "onInsertRow" , "onDeleteRow",
                               "onInsertCol" , "onInsertCol",
                               "onMoveRow"   , "onMoveCol",
                               "onRowChange" , "onColChange",
                               "onSort"
                             ];

        D.DEFAULT_ARGS = {
                _rows : [ "rows", [] ],
                _cols : [ "cols", null ]
        };

        P.getRowById = function(id) {
                return this._rowsById[id];
        };

        P.getRowByIndex = function(i) {
                return this._rows[i];
        };

        P.foreachRow = function() {
                return this._rows.foreach.apply(this._rows, arguments);
        };

        P.foreachCol = function() {
                return this._cols.foreach.apply(this._cols, arguments);
        };

        P.getColById = function(id) {
                return this._colsById[id];
        };

        P.getColByIndex = function(i) {
                return this._cols[i];
        };

        P._init = function() {
                this.__sortCol = null;
                this.__sortDesc = false;
                var cid = this._colsById = {};
                var rid = this._rowsById = {};
                this._onRowChange = this._onColChange.$(this);
                this._onRowChange = this._onRowChange.$(this);

                this._cols.r_assign_each(function(i, col){
                        col = new DlGridColModel(col);
                        col.model = this;
                        col.index = i;
                        col.addEventListener("onChange", this._onColChange);
                        if (col.id)
                                cid[col.id] = col;
                        return col;
                }, this);

                this._rows.r_assign_each(function(i, row){
                        row.model = this;
                        row = new DlGridRowModel(row);
                        row.index = i;
                        row.addEventListener("onChange", this._onRowChange);
                        if (row.id)
                                rid[row.id] = row;
                        return row;
                }, this);
        };

        P._onColChange = function(col, what, newval, oldval) {
                this.applyHooks("onColChange", [ this, col, what, newval, oldval ]);
        };

        P._onRowChange = function(row, cell, what, newval, oldval) {
                this.applyHooks("onRowChange", [ this, row, cell, what, newval, oldval ]);
        };

        P._getInsertPos = function(row) {
                var col = this.__sortCol;
                return this._rows.foreach(function(r, i){
                        var cmp = col.compareRows(r, row);
                        if (this.__sortDesc)
                                cmp = -cmp;
                        if (cmp >= 0)
                                $RETURN(i);
                }, this);
                return this._rows.length;
        };

        P.insertRow = function(row, pos) {
                row.model = this;
                row = new DlGridRowModel(row);
                var r = this._rows, l = r.length;
                if (pos == null || pos == -1) {
                        pos = this.__sortCol ? this._getInsertPos(row) : l;
                }
                r.splice(pos, 0, row);
                ++l;
                for (var i = pos; i < l; ++i)
                        r[i].index = i;
                row.addEventListener("onChange", this._onRowChange);
                if (row.id)
                        this._rowsById[row.id] = row;
                this.applyHooks("onInsertRow", [ row ]);
                return row;
        };

        P.deleteRowById = function(id) {
                this.deleteRowByIndex(this.getRowById(id).getIndex());
        };

        P.deleteRowByIndex = function(index) {
                var r = this._rows, row = r[index];
                if (row.id)
                        delete this._rowsById[row.id];
                r.splice(index, 1);
                for (var i = index; i < r.length; ++i)
                        r[i].index = i;
                row.removeEventListener("onChange", this._onRowChange);
                this.applyHooks("onDeleteRow", [ row ]);
                row.destroy();
                return row;
        };

        P.setValues = function(rows) {
                this.__sortDesc = false;
                this.applyHooks("onSort", [ null, this.__sortCol ]);
                rows.foreach(function(r, i) {
                        if (r instanceof Array)
                                r = { cells: r };
                        var row = this.getRowByIndex(i);
                        if (row) {
                                if (row.id)
                                        delete this._rowsById[row.id];
                                if (r.id)
                                        this._rowsById[r.id] = row;
                                row.reset(r);
                        } else {
                                this.insertRow(r, this._rows.length);
                        }
                }, this);
                while (rows.length < this._rows.length)
                        this.deleteRowByIndex(this._rows.length - 1);
        };

        P.sort = function(col) {
                var prevCol = this.__sortCol;
                if (prevCol === col)
                        this.__sortDesc = !this.__sortDesc;
                else
                        this.__sortDesc = false;
                this.__sortCol = col;
                var index = col.getIndex();
                this._rows = this._rows.mergeSort(function(r1, r2) {
                        return col.compareRows(r1, r2);
                }, this.__sortDesc);
                var a = this._rows.map(function(row, i) {
                        var tmp = row.index;
                        row.index = i;
                        return tmp;
                });
                this.applyHooks("onSort", [ col, prevCol, this.__sortDesc, a ]);
        };

})();
