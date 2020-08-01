/**
 * DataGrid
 * @creator     ����<fool2fish@gmail.com>
 * @depends     kissy-core, yui2-yahoo-dom-event, yui2-connection
 */

/**
 * 1�������п�
 * 2�����ʱ�̶���ͷ
 * 3���Զ���ѡ�и���
 * 4���޸�loading
 * 5����ʱ�༭
 * 6����ɾ��
 */

KISSY.add("datagrid", function(S) {

    var DOM = S.DOM, Event = S.Event, YDOM = YAHOO.util.Dom,
        doc = document,
        //classǰ׺
        CLS_PREFIX = 'ks-datagrid-';

    /**
     * DataGrid
     * @constructor
     * @param container ���ñ�������
     * @param datasource ����Դ��uri
     */
    function DataGrid(container, datasource) {

        /**************************************************************************************************************
         * �������
         *************************************************************************************************************/

        var self = this ;

        /**
         * ��������
         */
        self.container = S.get(container);
        DOM.addClass(self.container, 'ks-datagrid');

        /**
         *��¼����Դuri(ֻ����json��ʽ�ķ�������)
         */
        self._datasourceUri = datasource;

        /**************************************************************************************************************
         * ����
         *************************************************************************************************************/

        /***************************************************
         * ����Դ
         **************************************************/

        /**
         * ����datasource��ָ��datasource����ֶε���;
         * Ĭ��ֵ�� DataGrid.datasourceDef
         */
        //self.datasourceDef=null;

        /**
         * �������ݵķ�ʽ
         */
        self.connectMethod = 'post';

        /**
         * ��¼���һ�β�ѯ�������͵�����
         */
        //self._latestQueryData='';

        /**
         * ����Դ
         */
        //self._liveData=null;

        /**
         * ����Դ�е��б�����
         */
        //self._listData=null;

        /***************************************************
         * �����
         **************************************************/

        /**
         * �����Ķ���
         * Ĭ��ֵ�� Datagrid.datagridDef
         */
        //self.datagridDef=null;

        /**
         * �����У�������Ⱦ���粻���壬���Զ����ݷ�������������
         * ����
         * columnDef=[
         *      {label:'',xType:COL_EXPAND},
         *      {label:'',xType:COL_CHECKBOX},
         *      {label:'���ֿ�������',children:[
         *          {label:'��������',sortable:true,field:'index'},
         *          {label:'������',sortable:true,field:'age'}
         *      ]},
         *      {label:'�ֶ���Ⱦ',children:[
         *          {label:'��һ�ֶ�',field:'name'},
         *          {label:'�����ֶ�',field:['nickname','homepage'],parser:funtion('nickname','homepage'){...}}
         *      ]},
         *      {label:'',xType:COL_EXTRA,field:[...],parser:function(){...}}
         * ]
         */
        //self.columnDef=null;

        /**
         * ������
         */
        //self._columnAmount=null;

        /**
         * ����columnDef��õ��ı�ͷ�ж���
         */
        //self._theadColDef=null;

        /**
         * ����columnDef��õ��ı�����ͨ�ж���
         */
        //self._colDef=null;

        /**
         * ����columnDef��õ��ı�����չ�ж���
         */
        //self._colExtraDef=null;

        /**
         * ����columnDef��õ���ѡ���ж���
         */
        //self._colSelectDef=null;

        /**
         * �û��Ƿ��Զ����п�
         */
        //self._defColWidth = false;

        /***************************************************
         * ���Ԫ��
         **************************************************/

        /**
         * ���Ԫ��
         */
        self._tableEl = DataGrid.create('<table class="'+ CLS_PREFIX + 'table"></table>',self.container);
        
        /**
         * colgroupԪ��
         */
        //self._colgroupEl=null;

        /**
         * ��ͷ
         */
        //self._theadEl=null;

        /**
         * ���������thԪ�ؼ���
         */
        self._sortTrigger = [];

        /**
         * ��ǰ�����th
         */
        //self._curSortTrigger=null;

        /**
         * ����ȫѡ��Ԫ��
         */
        //self._selectAllTrigger=null;

        /**
         * tbody
         */
        //self._tbodyEl=null;

        /**
         * tbody����Ԫ�ؼ���
         */
        self._rowElArr = [];

        /**
         * ��ʾloading״̬��Ԫ��
         */
        self._loadingEl = DataGrid.create('<div class="ks-datagrid-loading" style="display:none;"><div class="ks-datagrid-loading-mask"></div><div class="ks-datagrid-loading-icon"></div></div>');
        S.ready(function(){doc.body.appendChild(self._loadingEl);});

        /***************************************************
         * ��ҳ
         **************************************************/

        /**
         * ��ҳ����
         * Ĭ��ֵ�� DataGrid.paginationDef
         */
        //self.paginationDef=null;

        /**
         * ��ҳԪ��
         */
        //self._paginationEl=null;
    }

    S.augment(DataGrid, S.EventTarget);

    S.mix(DataGrid, {

        /**
         * ���������ַ���ת����DOMԪ�أ���append��ָ����context��
         * @param str
         * @param context
         * @return ת���õ���DOMԪ��
         */
        create:function(str, context) {
            str = S.trim(str);
            var tagName = getLeadingTagName(str);
            if (!tagName) {
                alert('Illegal input in function "DataGrid.create" .');
                return null;
            }
            tagName = ' ' + tagName + ' ';
            var CLS_WRAPPER = 'ks-datagrid-wrapper',
                tag1 = ' colgroup thead tbody tfoot ',
                tag2 = ' th td ',
                prefix = '<div class="' + CLS_WRAPPER + '">',
                suffix = '</div>';
            if (tag1.indexOf(tagName) > -1) {
                prefix = '<table class="' + CLS_WRAPPER + '">';
                suffix = '</table>';
            } else if (tag2.indexOf(tagName) > -1) {
                prefix = '<table><tbody><tr class="' + CLS_WRAPPER + '">';
                suffix = '</tr></tbody></table>';
            //trԪ��һ��Ҫ�ŵ�tbody�������������Զ���tr����Ӹ�tbody
            } else if(tagName == ' tr '){
                prefix = '<table><tbody class="' + CLS_WRAPPER + '">';
                suffix = '</tbody></table>';
            }else if(tagName == ' col '){
                prefix = '<table><colgroup class="' + CLS_WRAPPER + '">';
                suffix = '</colgroup></table>';
            }
            var box = doc.createElement('div');
            box.innerHTML = prefix + str + suffix;
            var wrapper = S.get('.' + CLS_WRAPPER, box);
            /**
             * ��ʹ���ĵ���Ƭʱ�����صĶ����ָ����ĵ���Ƭ������������������Ԫ�أ�����ֻ����һ����߲�Ԫ�ص����
             */
            var el = wrapper.firstChild;
            if (context) context.appendChild(el);
            return el;
        },
        /**
         * ��ȡ��ѯ�ַ�����ָ��key��ֵ�����û���򷵻�null
         * @param queryString
         * @param key
         */
        getQueryParamValue:function(queryString, key) {
            var result = queryString.match(new RegExp('(?:^|&)' + key + '=(.*?)(?=$|&)'));
            return result && result[1];
        },

        /**
         * ����ѯ�ַ���ָ��key��ֵ������ֵ
         * @param queryString
         * @param key
         * @param newValue
         */
        setQueryParamValue:function(queryString, key, newValue) {
              var newParam = key + '=' + newValue;
              if (!queryString) return newParam;

              var replaced = false;
              var params = queryString.split('&');
              for (var i = 0; i < params.length; i++) {
                if (params[i].split('=')[0] == key) {
                  params[i] = newParam;
                  replaced = true;
                }
              }
              if (replaced) return params.join('&');
              return queryString + '&' + newParam;
         },

        //������Ĭ�϶���
        datagridDef:{
            fixThead:false,
            customizeCol:false
        },

        //����ԴĬ�϶���
        datasourceDef:{
            success:'success',
            listData:'dataList',
            info:'info',
            dataStart:'start',
            dataLimit:'limit',
            dataAmount:'total',
            sortType:'sorttype',
            sortBy:'sortby'
        },

        //��ҳĬ�϶���
        paginationDef:{
            dataLimit:20,
            pageNumLength:5,
            position:'bottom'
        }
        
    });

    /**
     * ��ȡһ��HTML�ַ���ǰ����ǩ�ı�ǩ��
     * @param str
     */
    function getLeadingTagName(str) {
        var m = str.match(/^\s*<(\w+)/);
        if (m) {
            return m[1].toLowerCase();
        } else {
            return null;
        }
    }

    S.DataGrid = DataGrid;
});
/**
 * DataGrid Render
 * @creator     ����<fool2fish@gmail.com>
 * @depends     kissy-core, yui2-yahoo-dom-event, yui2-connection
 */

KISSY.add("datagrid-render", function(S) {

    var DOM = S.DOM, Event = S.Event, YDOM = YAHOO.util.Dom, YConnect=YAHOO.util.Connect,
        doc = document,

        DataGrid = S.DataGrid,
        create = DataGrid.create,

        //�����е�����
        COL_CHECKBOX = 'COL_CHECKBOX', COL_RADIO = 'COL_RADIO', COL_EXTRA = 'COL_EXTRA',
        //����columnDefʱҪ�õ��������ڲ�����
        KS_DEPTH = 'KSDepth', KS_FATHER_IDX = 'KSFatherIdx', KS_CHILDREN_AMOUNT = 'KSChildrenAmount',

        //classǰ׺
        CLS_PREFIX = 'ks-datagrid-',
        //��class
        CLS_ROW = CLS_PREFIX + 'row', CLS_ROW_EXTRA = CLS_PREFIX + 'row-extra', CLS_ROW_SELECTED = CLS_PREFIX + 'row-selected', CLS_ROW_EXPANDED = CLS_PREFIX + 'row-expanded',

        //���ⵥԪ��class
        CLS_CELL_EXTRA = CLS_PREFIX + 'cell-extra',
        //����Ԫ��class
        CLS_SORTABLE = CLS_PREFIX + 'cell-sortable', CLS_SORT_DESC = CLS_PREFIX + 'cell-desc', CLS_SORT_ASC = CLS_PREFIX + 'cell-asc',
        //����icon��class
        CLS_ICON_EXPAND = CLS_PREFIX + 'icon-expand', CLS_ICON_CHECKBOX = CLS_PREFIX + 'icon-checkbox', CLS_ICON_RADIO = CLS_PREFIX + 'icon-radio',CLS_ICON_HOLDER= CLS_PREFIX + 'icon-holder',

        //��������������th�������ֶ�
        ATTR_ROW_IDX = 'data-list-idx',ATTR_SORT_FIELD = 'data-sort-field',

        //�Զ����¼�
        EVENT_RENDER_ROW = 'renderRow' , EVENT_RENDER_ROW_EXTRA = 'renderRowExtra', EVENT_GET_DATA = 'getData',EVENT_RENDER_THEAD='renderThead';

    S.augment(S.DataGrid, {

        /**
         * ��Ⱦ��������postData�����Ⱦ��ͷ�ȸ���Ԫ��
         * @param postData
         */
        render:function(postData) {
            var self = this ;
            self.datagridDef = S.merge(DataGrid.datagridDef, self.datagridDef || {});
            self.datasourceDef = S.merge(DataGrid.datasourceDef, self.datasourceDef || {});
            //���ҳ����
            if (self.paginationDef) {
                self.paginationDef = S.merge(DataGrid.paginationDef, self.paginationDef);
                self._renderPagination();
            }
            self.update(postData);
        },

        /**
         * ���±�����ݣ�postData����������Ҫ�κβ���Ҳ��Ҫ���ݿ��ַ�����������²���ִ��
         * @param postData
         */
        update:function(postData) {
            var self = this ;

            function parseColumnDefCallback(theadColDef, colDef, colExtraDef, colSelectDef) {
                self._parseColumnDefPreProcessor(theadColDef, colDef, colExtraDef, colSelectDef);
                self._renderColgroup();
                self._renderThead();
                if (self._listData) self._renderTbody();
                self._endLoading();
                //��������
                if (self._sortTrigger.length > 0) self._activateRowSort();
                //������չ����
                if (colExtraDef) self._activateRowExpand();
                //ѡ���й���
                if (colSelectDef) self._activateRowSelect();
                //�̶���ͷ
                if(self.datagridDef.fixThead) self._activateFixThead();                
            }

            if (postData == undefined) {
                if (self.columnDef && !self._colDef) {
                    //������ж��嵫δ�������򵥴������ж���
                    parseColumnDefToFlat(self.columnDef, null, parseColumnDefCallback, self);
                }
                return;
            }
            self._startLoading();
            var paginationDef = this.paginationDef ;
            //��������˷�ҳ���壬��postData��δָ��dataLimit�������postData
            if (paginationDef && !DataGrid.getQueryParamValue(postData, paginationDef.dataLimit)) {
                postData = DataGrid.setQueryParamValue(postData, this.datasourceDef.dataLimit, paginationDef.dataLimit);
            }
            var callback = {
                success:function(o) {
                    var self = this ;
                    self._dataPreProcessor(o);
                    self.fire(EVENT_GET_DATA, {liveData:self._liveData});
                    //�������ɹ����ҷ���������ȷ
                    if (self._requestResult) {
                        var listData = self._listData;
                        //������ж����ҷ������б����ݣ�����ݷ��������Զ������ж���,���ֹ�����
                        if ((!self.columnDef) && listData && listData.length > 0) {
                            self.columnDef = [];
                            for (var i in listData[0]) {
                                self.columnDef.push({label:i,field:i});
                            }
                        }
                        //����ж���û��������
                        if (!self._colDef) {
                            //����columnDef���ɹ���ʼ��ʼ������
                            parseColumnDefToFlat(self.columnDef, null, parseColumnDefCallback, self);
                            //����ж��屻������
                        } else {
                            if (listData) self._renderTbody();
                            self._endLoading();
                        }
                        //�������һ�εĲ�ѯ����
                        self._latestQueryData = postData;
                        //����ҳ��
                        if (self.paginationDef) self._updatePagination();
                        //ȡ��ȫѡ
                        DOM.removeClass( self._theadEl.getElementsByTagName('tr')[0] , CLS_ROW_SELECTED )
                    } else {
                        self._endLoading();
                    }
                },
                failure:function() {
                    alert('error:��ȡ����ʧ�ܣ���ˢ��ҳ�����Ի���ϵ����Ա��');
                    this._endLoading();
                },
                scope:self
            };
            YConnect.asyncRequest(this.connectMethod, this._datasourceUri, callback, postData);
        },

        //ÿ���첽���󷵻�ֵ�Ļ�������
        _dataPreProcessor:function(o) {
            var self = this ;
            try {
                self._liveData = eval('(' + o.responseText + ')');
            } catch(e) {
                alert('error���뷵��JSON��ʽ�����ݡ�');
                self._endLoading();
                return;
            }
            var datasourceDef = self.datasourceDef ;
            self._requestResult = self._liveData[datasourceDef.success];
            if (self._requestResult) {
                self._listData = self._liveData[datasourceDef.listData];
            }
        },

        //ÿ�ν�����columnDef֮��Ļ�������
        _parseColumnDefPreProcessor:function(theadColDef, colDef, colExtraDef, colSelectDef) {
            var self = this ;
            self._theadColDef = theadColDef;
            self._colDef = colDef;
            self._colExtraDef = colExtraDef;
            self._colSelectDef = colSelectDef;
            self._columnAmount = colDef.length;
            if (colExtraDef) self._columnAmount++;
            if (colSelectDef) self._columnAmount++;
        },

        //��ʾloading״̬
        _startLoading:function() {
            var self = this , container = self.container, loadingEl = self._loadingEl;            
            loadingEl.style.left = YDOM.getX(container) +'px';
            loadingEl.style.top = YDOM.getY(container) +'px';
            loadingEl.style.width = container.offsetWidth +'px';
            loadingEl.style.height = container.offsetHeight+'px'; //����֣�ʹ��YDOM.getStyle�޷����ie����ȷ��ֵ
            loadingEl.style.display = '';
        },

        //����loading״̬
        _endLoading:function() {
           this._loadingEl.style.display = 'none';
        },

        //��Ⱦcolgroup�������ӵ����Ԫ����
        _renderColgroup:function() {
            var self = this ,
                colgroupEl = doc.createElement('colgroup');
            if (self._colExtraDef) {
                create('<col width="25" />', colgroupEl);
            }
            if (self._colSelectDef) {
                create('<col width="25" />', colgroupEl);
            }
            var colDef = self._colDef;
            for (var i = 0 , len = colDef.length; i < len; i++) {
                var col = create('<col />', colgroupEl);
                if (colDef[i].width){
                    col.width = colDef[i].width;
                    self._defColWidth = true;
                }
            }
            if (self._colgroupEl) self._tableEl.removeChild(self._colgroupEl);
            self._colgroupEl = colgroupEl;
            self._tableEl.appendChild(self._colgroupEl);
        },

        //��Ⱦ��ͷ��ͨ��Ԫ��
        _renderTheadCell:function(cellDef) {
            var cell = create('<th></th>');
            //�������th
            if (cellDef[KS_CHILDREN_AMOUNT] == 0) {
                if (cellDef.sortable) {
                    cell.className = CLS_SORTABLE;
                    cell.setAttribute(ATTR_SORT_FIELD, cellDef.field);
                    cell.innerHTML = '<i class="'+CLS_PREFIX+'icon"></i>';
                    this._sortTrigger.push(cell);
                }
                if(cellDef.width) cell.width = cellDef.width;
                //�������th
            } else {
                cell.colSpan = cellDef[KS_CHILDREN_AMOUNT];
            }
            //���ֱ�ǩ
            if (cellDef.label) cell.innerHTML = cellDef.label + cell.innerHTML;
            return cell;
        },

        //��Ⱦ��ͷ��չ�е�Ԫ��
        _renderTheadCellExpand:function() {
            return create('<th class="'+CLS_CELL_EXTRA+'"><i class="'+CLS_ICON_HOLDER+'"></i></th>');
        },

        //��Ⱦ���ѡ���е�Ԫ��
        _renderTheadCellSelect:function(selectDef) {
            var cell = create('<th class="'+CLS_CELL_EXTRA+'"></th>');
            if (selectDef.xType == COL_CHECKBOX){
                this._selectAllTrigger = create('<i class="'+CLS_ICON_CHECKBOX+'"></i>', cell);
            }else{
                create('<i class="'+CLS_ICON_HOLDER+'"></i>', cell);
            }
            return cell;
        },

        //��Ⱦ��ͷ
        _renderThead:function() {
            var self = this,
                theadColDef = this._theadColDef,
                theadEl = doc.createElement('thead'),
                depth = theadColDef.length;
            for (var i = 0 , ilen = theadColDef.length; i < ilen; i++) {
                var row = create('<tr class="'+ CLS_ROW +'"></tr>');        
                //��չ��ť��
                if (i == 0) {
                    if (self._colExtraDef) {
                        var theadCellExpand = self._renderTheadCellExpand();
                        theadCellExpand.rowSpan = ilen;
                        row.appendChild(theadCellExpand);
                    }
                    if (self._colSelectDef) {
                        var theadCellSelect = self._renderTheadCellSelect(self._colSelectDef);
                        theadCellSelect.rowSpan = ilen;
                        row.appendChild(theadCellSelect);
                    }
                }
                //��ͨ��
                for (var j = 0 , jlen = theadColDef[i].length; j < jlen; j++) {
                    var cellDef = theadColDef[i][j];
                    if (cellDef[KS_DEPTH] != i) continue;
                    var cell = self._renderTheadCell(cellDef);
                    if (cellDef[KS_CHILDREN_AMOUNT] == 0 && depth - 1 > i) cell.rowSpan = depth - i;
                    row.appendChild(cell);
                }
                theadEl.appendChild(row);
            }
            if (self._theadEl) self._tableEl.removeChild(self._theadEl);
            self._theadEl = theadEl;
            self._tableEl.appendChild(self._theadEl);
            self.fire(EVENT_RENDER_THEAD);
        },

        //��Ⱦ��Ԫ��
        _renderCell:function(cellDef, recordData) {
            var cell = doc.createElement('td'),
                fieldArr = [], valueArr = [];
            if(cellDef.field) fieldArr = fieldArr.concat(cellDef.field);
            for(var i = 0,len=fieldArr.length;i<len;i++){
                valueArr.push(recordData[fieldArr[i]]);
            }
            appendChild(cell,cellDef.parser ? cellDef.parser.apply(window, valueArr) : valueArr.join(' '));
            return cell;
        },

        //��Ⱦչ����ť��Ԫ��
        _renderCellExpand:function() {
            return create('<td class="'+ CLS_CELL_EXTRA + '"><i class="' + CLS_ICON_EXPAND + '"></i></td>');
        },

        //��Ⱦѡ��Ԫ��
        _renderCellSelect:function(selectDef) {
            if (selectDef.xType == COL_CHECKBOX) {
                var inner = '<i class="' + CLS_ICON_CHECKBOX + '"></i>';
            } else if (selectDef.xType == COL_RADIO) {
                var inner = '<i class="' + CLS_ICON_RADIO + '"></i>';
            }
            return create('<td class="' + CLS_CELL_EXTRA + '">'+ inner +'</td>');
        },

        //��Ⱦ��׼��
        _renderRow:function(recordData) {
            var self = this, colDef = self._colDef;
            var row = create('<tr class="'+ CLS_ROW +'"></tr>');
            //��չ��ť
            if (self._colExtraDef) row.appendChild(self._renderCellExpand());
            //��ѡ���ߵ�ѡ��ť
            if (self._colSelectDef) row.appendChild(self._renderCellSelect(self._colSelectDef));
            for (var i = 0 , len = colDef.length; i < len; i++) {
                row.appendChild(self._renderCell(colDef[i], recordData));
            }
            self.fire(EVENT_RENDER_ROW, { row : row , recordData : recordData });
            return row;
        },

        //��Ⱦ��չ�У���չ�е����ݷŵ�һ������չʾ��
        _renderRowExtra:function(recordData) {
            var self = this ;
            var row = create('<tr class="'+ CLS_ROW_EXTRA + '"></tr>'),
                colSpan = self._columnAmount;
            if (self._colExtraDef) {
                create('<td class="'+ CLS_CELL_EXTRA +'"></td>',row);
                colSpan--;
            }
            if (self._colSelectDef) {
                create('<td class="'+ CLS_CELL_EXTRA +'"></td>', row);
                colSpan--;
            }
            var cell = self._renderCell(self._colExtraDef, recordData);
            cell.colSpan = colSpan;
            row.appendChild(cell);
            self.fire(EVENT_RENDER_ROW_EXTRA, { row : row , recordData : recordData });
            return row;
        },

        //��Ⱦ�����
        _renderTbody:function() {
            var self = this;
            self._rowElArr = [];
            var listData = self._listData;
            var tbodyEl = doc.createElement('tbody');
            for (var i = 0 , len = listData.length; i < len; i++) {
                var row = self._renderRow(listData[i]);
                row.setAttribute(ATTR_ROW_IDX, i);
                self._rowElArr.push(row);
                tbodyEl.appendChild(row);
                if (self._colExtraDef && self._colExtraDef.expand) {
                    var rowExtra = self._renderRowExtra(listData[i]);
                    rowExtra.setAttribute(ATTR_ROW_IDX, i);
                    tbodyEl.appendChild(rowExtra);
                    DOM.addClass(row, CLS_ROW_EXPANDED);
                    DOM.addClass(rowExtra, CLS_ROW_EXPANDED);
                }
            }
            if (self._tbodyEl) self._tableEl.removeChild(self._tbodyEl);
            self._tbodyEl = tbodyEl;
            self._tableEl.appendChild(self._tbodyEl);
        }
    });

    /**
     * ��columnDef�����νṹչ���ɶ�ά����ṹ
     * @param columnDef �������趨
     * @param childrenKey ָ�����е�key
     * @param callback ������Ļص�����
     * @param callbackObj �ص������е�thisָ��Ķ���
     */
    function parseColumnDefToFlat(columnDef, childrenKey, callback, callbackObj) {
        childrenKey = childrenKey || 'children';
        //������ı�ͷ����
        var theadColDef = [],
            //��������ж���
                colDef = [],
            //�����ж���
                colExtraDef = null,
            //����ѡ���еķ�ʽ
                colSelectDef = null,
            //���������
                depth = 1;


        //�����ж����е��������趨��Ҫ���������趨ȫ��Ҫ����߲㼶����
        function filterColDef(columnDef) {
            var colDef = [];
            for (var i = 0 , len = columnDef.length; i < len; i++) {
                //�������չ��ť��
                if (columnDef[i].xType == COL_EXTRA) {
                    colExtraDef = columnDef[i];
                //�����ѡ���У�������ѡ����ѡ��
                } else if (columnDef[i].xType == COL_CHECKBOX || columnDef[i].xType == COL_RADIO) {
                    colSelectDef = columnDef[i];
                } else {
                    colDef.push(columnDef[i]);
                }
            }
            return colDef;
        }

        //�õ����˵��������趨�����趨
        var pureColDef = filterColDef(columnDef);

        //�ж�tree�Ƿ�������
        function ifTreeHasChildren(tree) {
            for (var i = 0, len = tree.length; i < len; i++) {
                if (tree[i][childrenKey] && tree[i][childrenKey].length > 0) {
                    return true;
                }
            }
            return false;
        }

        //���µ�ǰ�ڵ����и��ڵ��childrenAmountֵ���ӽڵ�����
        function updateFathersChildrenAmount(subTree) {
            var step = subTree[childrenKey].length - 1;
            var curTree = subTree;
            var curDepth = subTree[KS_DEPTH];
            while (curDepth > 0) {
                var fatherTree = theadColDef[curDepth - 1][curTree[KS_FATHER_IDX]];
                fatherTree[KS_CHILDREN_AMOUNT] = fatherTree[KS_CHILDREN_AMOUNT] + step;
                curTree = fatherTree;
                curDepth = fatherTree[KS_DEPTH];
            }
        }

        //ת����
        function parse(tree) {
            //�ж��������
            var treeHasChildren = ifTreeHasChildren(tree);
            //��������
            var subTree = [];
            theadColDef[depth - 1] = [];
            for (var i = 0,ilen = tree.length; i < ilen; i++) {
                /* ���tree[i][KS_DEPTH]�����ڣ����¼tree[i]���������
                 * ����Ҫ���ж�����Ϊ����ڵ�ǰ�㼶��tree���ӽڵ�������
                 * tree[i]�պ�û���ӽڵ��ˣ���ô�����tree[i]����tree[i]��һ�㼶���ӽڵ�
                 * �����Ļ���ȷ���õ���theadDef�����һ��Ԫ�أ����飩ΪcolDef
                 */
                if (tree[i][KS_DEPTH] == undefined) tree[i][KS_DEPTH] = depth - 1;
                //jitree[i]��ӵ�theadColDef[depth-1]������ȥ
                theadColDef[depth - 1].push(tree[i]);
                //���tree��������tree[i]������
                if (treeHasChildren) {
                    if (tree[i][childrenKey]) {
                        //��¼tree[i]����Ԫ����
                        tree[i][KS_CHILDREN_AMOUNT] = tree[i][childrenKey].length;
                        for (var j = 0,jlen = tree[i][childrenKey].length; j < jlen; j++) {
                            //��tree[i]�ӽڵ��м�¼tree[i]���ڶ�ά�����������
                            tree[i][childrenKey][j][KS_FATHER_IDX] = i;
                            //������ͬһ�㼶��tree[i]�ӽڵ�ŵ�һ������
                            subTree.push(tree[i][childrenKey][j]);
                        }
                        updateFathersChildrenAmount(tree[i]);
                    } else {
                        tree[i][KS_CHILDREN_AMOUNT] = 0;
                        subTree.push(tree[i]);
                    }
                    //���������
                } else {
                    tree[i][KS_CHILDREN_AMOUNT] = 0;
                }
            }
            depth++;
            if (subTree.length > 0) {
                arguments.callee(subTree);
            } else {
                colDef = theadColDef[theadColDef.length - 1];
                if (callback) callback.call(callbackObj || window, theadColDef, colDef, colExtraDef, colSelectDef);
            }
        }

        parse(pureColDef);
    }

    /**
     * ��ָ����Ԫ����ӵ���Ԫ����ȥ
     */
    function appendChild(father, child) {
        if (father == undefined || child == undefined) return;
        if (typeof child == 'string') {
            father.innerHTML = father.innerHTML + child;
        } else {
            father.appendChild(child);
        }
    }

    ;
});/**
 * DataGrid Pagination
 * @creator     ����<fool2fish@gmail.com>
 * @depends     kissy-core, yui2-yahoo-dom-event, yui2-connection
 */

KISSY.add("datagrid-pagination", function(S) {

    var DOM = S.DOM, Event = S.Event, YDOM = YAHOO.util.Dom,
        DataGrid = S.DataGrid,
        create = DataGrid.create,
        CLS_PAGE_PREFIX = 'ks-pagination-';

    S.augment(S.DataGrid, {
        
        //��Ⱦ��ҳ
        _renderPagination:function() {
            var self = this;
            var paginationEl = create('<div class="ks-bar"></div>');
            var paginationBox = create('<div class="ks-pagination"></div>',paginationEl);
            var wrapperEl = create('<div class="' + CLS_PAGE_PREFIX + 'wrapper"></div>', paginationBox);
            self._pageInfoEl = create('<span class="' + CLS_PAGE_PREFIX + 'info"></span>',wrapperEl);
            self._pageStartEl = create('<a class="' + CLS_PAGE_PREFIX + 'start">��ҳ</a>',wrapperEl);
            self._pageStartDisabledEl = create('<span class="' + CLS_PAGE_PREFIX + 'start">��ҳ</span>', wrapperEl);
            self._pagePrevEl = create('<a class="' + CLS_PAGE_PREFIX + 'prev">��һҳ</a>', wrapperEl);
            self._pagePrevDisabledEl = create('<span class="' + CLS_PAGE_PREFIX + 'prev">��һҳ</span>', wrapperEl);
            self._curPageNumEl = create('<span class="' + CLS_PAGE_PREFIX + 'page">1</span>', wrapperEl);
            self._pageNumElArr = [];
            for (var i = 0 , len = self.paginationDef.pageNumLength; i < len; i++) {
                var pageNumEl = create('<a class="' + CLS_PAGE_PREFIX + 'page" ks-data-page-idx="'+i+'"></a>', wrapperEl);
                this._pageNumElArr.push(pageNumEl);
            }
            self._pageNextEl = create('<a class="' + CLS_PAGE_PREFIX + 'next">��һҳ</a>', wrapperEl);
            self._pageNextDisabledEl = create('<span class="' + CLS_PAGE_PREFIX + 'next">��һҳ</span>', wrapperEl);
            self._pageEndEl = create('<a class="' + CLS_PAGE_PREFIX + 'end">ĩҳ</a>', wrapperEl);
            self._pageEndDisabledEl = create('<span class="' + CLS_PAGE_PREFIX + 'end">ĩҳ</span>', wrapperEl);
            self._pageSkipEl = create('<span class="' + CLS_PAGE_PREFIX + 'skip">����<input type="text" class="' + CLS_PAGE_PREFIX + 'skip-to"/>ҳ<button type="button" class="' + CLS_PAGE_PREFIX + 'skip-button">ȷ��</button><span>', wrapperEl);
            self._pageSkipInputEl = self._pageSkipEl.getElementsByTagName('input')[0];
            self._pageSkipBtnEl = self._pageSkipEl.getElementsByTagName('button')[0];

            var curLimit = self.paginationDef.dataLimit, defaultOptionStr = '';
            if( curLimit%20 || curLimit>80) defaultOptionStr='<option value="'+curLimit+'">'+curLimit+'</option>';
            
            self._dataLimitEl = create('<span class="' + CLS_PAGE_PREFIX + 'data-limit">ÿҳ<select value="'+curLimit+'">'+ defaultOptionStr + '<option value="20">20</option><option value="40">40</option><option value="60">60</option><option value="80">80</option></select>��<span>', wrapperEl);
            self._dataLimitSetEl = self._dataLimitEl.getElementsByTagName('select')[0];

            if (self.paginationDef.position == 'bottom') {
                YDOM.insertAfter(paginationEl, self._tableEl);
            } else {
                YDOM.insertBefore(paginationEl, self._tableEl);
            }
            self._paginationEl = paginationEl;

            function pageTurning() {
                var t = this ;
                var queryData = self._latestQueryData,
                    datasourceDef = self.datasourceDef,
                    dataStart = parseInt(DataGrid.getQueryParamValue(queryData, self.datasourceDef.dataStart) || 0, 10),
                    dataLimit = parseInt(DataGrid.getQueryParamValue(queryData, self.datasourceDef.dataLimit), 10),
                    dataAmount = parseInt(self._liveData[datasourceDef.dataAmount], 10),
                    totalPageNumLength = Math.ceil(dataAmount / dataLimit);
                if (t == self._pageStartEl) {
                    dataStart = '0';
                } else if (t == self._pagePrevEl) {
                    dataStart -= dataLimit;
                } else if (t == self._pageNextEl) {
                    dataStart += dataLimit;
                } else if (t == self._pageEndEl) {
                    dataStart = ( totalPageNumLength - 1 ) * dataLimit;
                } else if (t == self._pageSkipBtnEl) {
                    var skipTo = Math.min(parseInt(self._pageSkipInputEl.value, 10) || 1, totalPageNumLength);
                    self._pageSkipInputEl.value = skipTo;
                    dataStart = ( skipTo - 1 ) * dataLimit;
                } else {
                    dataStart = ( t.innerHTML - 1 ) * dataLimit;
                }
                var postData = DataGrid.setQueryParamValue(queryData, datasourceDef.dataStart, dataStart);
                self.update(postData);
            }

            var pageTurningTrigger = self._pageNumElArr.concat(self._pageStartEl, self._pagePrevEl, self._pageNextEl, self._pageEndEl) ;
            hide.apply(window, pageTurningTrigger);
            hide(self._pageSkipEl, self._dataLimitEl);
            Event.on(pageTurningTrigger, 'click', pageTurning);
            Event.on(self._pageSkipBtnEl, 'click', pageTurning);
            Event.on(self._dataLimitSetEl, 'change', function() {
                if (!self._listData) return;
                var t = this;
                self.paginationDef.dataLimit = t.value;
                self.update(self._latestQueryData);
            });
        },
        //���·�ҳ
        _updatePagination:function() {
            var self = this,
                queryData = self._latestQueryData,
                dataStart = parseInt(DataGrid.getQueryParamValue(queryData, self.datasourceDef.dataStart) || 0, 10),
                dataLimit = parseInt(DataGrid.getQueryParamValue(queryData, self.datasourceDef.dataLimit), 10),
                dataAmount = parseInt(self._liveData[self.datasourceDef.dataAmount], 10),
                pageNumLength = self.paginationDef.pageNumLength,
                totalPageNumLength = Math.ceil(dataAmount / dataLimit);

            show(self._pageSkipEl);
            show(self._dataLimitEl);
            //��ʾ��¼������
            self._pageInfoEl.innerHTML = '��'+ totalPageNumLength + 'ҳ/'+ dataAmount +'�� ';
            //�ж���һҳ״̬
            if (dataStart) {
                show(self._pageStartEl, self._pagePrevEl);
                hide(self._pageStartDisabledEl, self._pagePrevDisabledEl);
            } else {
                hide(self._pageStartEl, self._pagePrevEl);
                show(self._pageStartDisabledEl, self._pagePrevDisabledEl);
            }
            //�ж���һҳ״̬
            if (dataStart + dataLimit >= dataAmount) {
                hide(self._pageNextEl, self._pageEndEl);
                show(self._pageNextDisabledEl, self._pageEndDisabledEl);
            } else {
                show(self._pageNextEl, self._pageEndEl);
                hide(self._pageNextDisabledEl, self._pageEndDisabledEl);
            }
            //��ʾ��ǰҳ
            var curPageNum = Math.ceil(dataStart / dataLimit) + 1;
            self._curPageNumEl.innerHTML = curPageNum;
            //��ǰҳ����ҳ���е�λ��
            var curPageIdx = Math.floor(Math.min(totalPageNumLength, pageNumLength) / 2);
            //����ҳ�루����ҳ��+ҳ�����=������ҳ�룩
            var basicPageNum = 0;
            if (curPageNum - curPageIdx <= 0) {
                curPageIdx = curPageNum - 1;
            } else if (curPageNum > totalPageNumLength - Math.min(totalPageNumLength, pageNumLength) + curPageIdx + 1) {
                curPageIdx = curPageNum - ( totalPageNumLength - Math.min(totalPageNumLength, pageNumLength));
                basicPageNum = totalPageNumLength - Math.min(totalPageNumLength, pageNumLength);
            } else {
                basicPageNum = curPageNum - curPageIdx - 1;
            }
            //��Ⱦҳ��
            for (var i = 0 , len = pageNumLength; i < len; i++) {
                //����ҳ���г�����ҳ���Ĳ���
                if (totalPageNumLength < i + 1) {
                    hide(self._pageNumElArr[i]);
                } else {
                    self._pageNumElArr[i].innerHTML = i + 1 + basicPageNum;
                    if (i + 1 + basicPageNum == curPageNum) {
                        YDOM.insertBefore(self._curPageNumEl, self._pageNumElArr[i]);
                        hide(self._pageNumElArr[i]);
                    } else {
                        show(self._pageNumElArr[i]);
                    }
                }
            }
        }
    });

    //��ʾָ��Ԫ��
    function show(){
        for( var i = 0 ,len = arguments.length ; i < len ; i++ ){
            arguments[i].style.display='';
        }
    }
    //����ָ��Ԫ��
    function hide(){
        for( var i = 0 ,len = arguments.length ; i < len ; i++ ){
            arguments[i].style.display='none';
        }
    }
});/**
 * DataGrid Operate
 * @creator     ����<fool2fish@gmail.com>
 * @depends     kissy-core, yui2-yahoo-dom-event, yui2-connection
 */

KISSY.add("datagrid-operate", function(S) {

    var DOM = S.DOM, Event = S.Event, YDOM = YAHOO.util.Dom,
        doc = document,

        DataGrid = S.DataGrid,
        create = DataGrid.create,

        //�����е�����
        COL_CHECKBOX = 'COL_CHECKBOX', COL_RADIO = 'COL_RADIO', COL_EXTRA = 'COL_EXTRA',

        //classǰ׺
        CLS_PREFIX = 'ks-datagrid-',
        //��class
        CLS_ROW = CLS_PREFIX + 'row', CLS_ROW_EXTRA = CLS_PREFIX + 'row-extra', CLS_ROW_SELECTED = CLS_PREFIX + 'row-selected', CLS_ROW_EXPANDED = CLS_PREFIX + 'row-expanded',

        //���ⵥԪ��class
        CLS_CELL_EXTRA = CLS_PREFIX + 'cell-extra',
        //����Ԫ��class
        CLS_SORTABLE = CLS_PREFIX + 'cell-sortable', CLS_SORT_DESC = CLS_PREFIX + 'cell-desc', CLS_SORT_ASC = CLS_PREFIX + 'cell-asc',
        //����icon��class
        CLS_ICON_EXPAND = CLS_PREFIX + 'icon-expand', CLS_ICON_CHECKBOX = CLS_PREFIX + 'icon-checkbox', CLS_ICON_RADIO = CLS_PREFIX + 'icon-radio',

        //��������������th�������ֶ�
        ATTR_ROW_IDX = 'data-list-idx',ATTR_CELL_IDX = 'data-cell-idx', ATTR_SORT_FIELD = 'data-sort-field',

        //����ʽ
        DESC = 'desc', ASC = 'asc';

    S.augment(S.DataGrid,{
        
        /**************************************************************************************************************
         * ����ʱ���̶���ͷ����
         *************************************************************************************************************/
        _activateFixThead:function(){
            var scrollState = 0,
                self = this,
                container = self.container,
                table = self._tableEl,
                thead = self._theadEl,
                proxy = create('<table class="ks-datagrid-proxy ks-datagrid"></table>');
            
            S.ready(function() {
                doc.body.appendChild(proxy);
            });

            if(!self._defColWidth) self._setColWidth();

            Event.on(window,'scroll',function(){
                var theadHeight = thead.offsetHeight,
                    tWidth = container.offsetWidth,
                    tHeight = container.offsetHeight,
                    tLeft =  YDOM.getX(container),
                    tTop =  YDOM.getY(container),
                    scrollTop = YDOM.getDocumentScrollTop();
                if(scrollTop<tTop){
                    if(scrollState){
                        table.style.paddingTop = 0;
                        table.appendChild(thead);
                    }
                    scrollState = 0;                    
                }else if( scrollTop > tTop+tHeight-theadHeight){
                    if(scrollState != 3){
                        proxy.style.top = '-400px';
                    }
                    scrollState = 3;
                }else{
                    if(!scrollState){
                        table.style.paddingTop = theadHeight + 'px';
                        proxy.appendChild(thead);
                    }
                    if(scrollState!=2){
                        proxy.style.top='0px';
                        proxy.style.left = tLeft+'px';
                        proxy.style.width = tWidth+'px';
                    }
                    if(S.UA.ie===6){
                        proxy.style.top = scrollTop+'px';
                    }
                    scrollState = 2;
                }                                                                                    
            });

            Event.on(window,'resize',function(){
                proxy.style.width = container.offsetWidth+'px';                
            });
        },

        /**
         * ��Ⱦ��������û�����ݣ���Ϊ��Ⱦ����ͷ��,��ȡÿ�е�ʵ�ʿ�Ȳ���ֵ
         */
        _setColWidth:function(){
            var self = this ,
                colArr = self._colgroupEl.getElementsByTagName('col'),
                thArr = self._theadEl.getElementsByTagName('th');
            for(var i=0,len=colArr.length;i<len;i++){
                if(!colArr[i].width) colArr[i].width = colArr[i].offsetWidth;
            }
            for(var j=0,len2=thArr.length;j<len2;j++){
                if((!thArr[j].width) && (thArr[j].className.indexOf(CLS_CELL_EXTRA)<0)) thArr[j].width = thArr[j].offsetWidth;
            }

        },

        /**************************************************************************************************************
         * ��������ѡ���к���չ�й���
         *************************************************************************************************************/
        
        //����������
        _activateRowSort:function(){
            var self = this , sortTrigger = self._sortTrigger;
            Event.on(sortTrigger, 'click', function(e){
                if( !self._listData || self._listData.length == 0 ) return;
                var t = this;
                var sortBy = t.getAttribute( ATTR_SORT_FIELD );;
                var sortType;
                //����������� �� ���õ�ǰ���򴥵����ʽ
                if( DOM.hasClass( t , CLS_SORT_ASC ) ){
                    sortType = DESC;
                    DOM.removeClass( t, CLS_SORT_ASC);
                    DOM.addClass( t, CLS_SORT_DESC);
                //���Ŀǰ�ǽ������л���Ŀǰ��������
                }else{
                    sortType = ASC;
                    DOM.addClass( t, CLS_SORT_ASC);
                    DOM.removeClass( t, CLS_SORT_DESC);
                }
                //�޸�ǰһ�����򴥵����ʽ
                if( self._curSortTrigger && self._curSortTrigger != t ){
                    DOM.removeClass( self._curSortTrigger, CLS_SORT_DESC);
                    DOM.removeClass( self._curSortTrigger, CLS_SORT_ASC);
                }
                self._curSortTrigger = t;
                var queryData = DataGrid.setQueryParamValue( self._latestQueryData,self.datasourceDef.sortBy, sortBy);
                queryData = DataGrid.setQueryParamValue( queryData,self.datasourceDef.sortType, sortType);
                self.update(queryData);
            });
        },

        //������ѡ����
        _activateRowSelect:function(){
            var self = this ,selectDef=self._colSelectDef, selectType = selectDef.xType, curSelectedIdx;
            function getRow(t){
                var tc = t.className,p=t.parentNode,pc=p.className;
                //���tΪ��ѡ/��ѡ��ťicon
                if( p.nodeName.toLowerCase()=='td'&&(tc.indexOf(CLS_ICON_CHECKBOX)+1 || tc.indexOf(CLS_ICON_RADIO)+1)){
                    return p.parentNode;
                //����Ϊtd
                }else if(pc.indexOf(CLS_ROW)+1 || pc.indexOf(CLS_ROW_EXTRA)+1){
                    return p;
                }else{
                    return null;
                }
            }

            Event.on(self._tableEl,'click',function(e){
                var t=e.target, row = getRow(t);
                if(!row) return;
                if(selectType == COL_CHECKBOX){
                    self.toggleSelectRow( row.getAttribute( ATTR_ROW_IDX ));
                }else if(selectType == COL_RADIO){
                    if( curSelectedIdx != undefined ) self.deselectRow(curSelectedIdx);
                    curSelectedIdx = row.getAttribute( ATTR_ROW_IDX );
                    self.selectRow( curSelectedIdx );
                }
            });

            /**
             * ȫѡ/ȡ��ȫѡ
             * ���ڹ���ʱ����̶�ҳͷ����thead����ʱ��table��ȡ����������Ҫֱ�ӽ��¼�ע����ȫѡ������
             */
            if(self._selectAllTrigger){
                Event.on(self._selectAllTrigger,'click',function(){
                    if(!self._tbodyEl) return;
                    var theadRow = self._theadEl.getElementsByTagName('tr')[0];
                    if(DOM.hasClass(theadRow,CLS_ROW_SELECTED)){
                        self.deselectAll();
                    }else{
                        self.selectAll();
                    }
                });
            }

        },

        //������չ�й���
        _activateRowExpand:function(){
            var self = this;
            Event.on(self._tableEl,'click',function(e){
                var t = e.target;
                if( DOM.hasClass( t , CLS_ICON_EXPAND ) ){
                    var row = YDOM.getAncestorByClassName( t , CLS_ROW );
                    var nextSibling = YDOM.getNextSibling( row );
                    //���row������Ԫ�أ���������Ԫ�ز�����չ��
                    if( !nextSibling || !DOM.hasClass( nextSibling , CLS_ROW_EXTRA ) ){
                        var idx = row.getAttribute( ATTR_ROW_IDX );
                        var rowExtra = self._renderRowExtra( self._listData[idx] );
                            rowExtra.setAttribute( ATTR_ROW_IDX , idx );
                        if(DOM.hasClass( row , CLS_ROW_SELECTED )) YDOM.addClass( rowExtra, CLS_ROW_SELECTED );
                        YDOM.insertAfter( rowExtra , row );
                    }else{
                        var rowExtra = nextSibling;
                    }
                    DOM.toggleClass( row , CLS_ROW_EXPANDED );
                    DOM.toggleClass( rowExtra , CLS_ROW_EXPANDED );
                }
            });
        },

        /**************************************************************************************************************
         * @ѡ�����
         *************************************************************************************************************/

        /**
         * �л�ָ����ѡ��״̬
         * @param idx ������
         */
        toggleSelectRow:function(){
            for(var i = 0 , len = arguments.length ; i < len ; i++){
                this._toggleSelectRow(arguments[i]);
            }
            this._checkIfSelectAll();
        },
        /**
         * ѡ��ָ����
         * @param idx ������
         */
        selectRow:function(){
            for(var i = 0 , len = arguments.length ; i < len ; i++){
                this._toggleSelectRow(arguments[i],1);
            }
            this._checkIfSelectAll();
        },
        /**
         * ȡ��ѡ��ָ����
         * @param idx ������
         */
        deselectRow:function(){
            for(var i = 0 , len = arguments.length ; i < len ; i++){
                this._toggleSelectRow(arguments[i],0);
            }
            this._checkIfSelectAll();
        },
        /**
         * ȫѡ
         */
        selectAll:function(){
            for(var i = 0 , len = this._rowElArr.length ; i < len ; i++){
                this._toggleSelectRow(i,1);
            }
            this._checkIfSelectAll();
        },
        /**
         * ȫ��ѡ
         */
        deselectAll:function(){
            for(var i = 0 , len = this._rowElArr.length ; i < len ; i++){
                this._toggleSelectRow(i,0);
            }
            this._checkIfSelectAll();
        },
        /**
         * ��ѡ
         */
        selectInverse:function(){
            for(var i = 0 , len = this._rowElArr.length ; i < len ; i++){
                this._toggleSelectRow(this._rowElArr[i]);
            }
            this._checkIfSelectAll();
        },

        /**
         * ��ȡ��ѡ��record������
         */
        getSelectedIndex:function(){
            return this._getSelected('index');
        },
        /**
         * ��ȡ��ѡ�е�record
         */
        getSelectedRecord:function(){
            return this._getSelected();
        },

        /**
         * ��ָ������������ʾΪָ����ѡ��״̬
         * @param idx Ҫ�л�ѡ��״̬������listData�е�������
         * @param selectType 1Ϊѡ�У�0Ϊȡ��ѡ�У�������Ϊ�Զ��л�
         */
        _toggleSelectRow:function(idx,selectType){
            var row = this._rowElArr[idx];
            var nextSibling = YDOM.getNextSibling( row );
            if( nextSibling && DOM.hasClass( nextSibling , CLS_ROW_EXTRA )) var rowExtra = nextSibling;
            if(selectType == undefined){
                DOM.toggleClass( row , CLS_ROW_SELECTED );
                if(rowExtra) DOM.toggleClass( rowExtra , CLS_ROW_SELECTED );
            }else if(selectType){
                DOM.addClass( row , CLS_ROW_SELECTED );
                if(rowExtra) DOM.addClass( rowExtra , CLS_ROW_SELECTED );
            }else{
                DOM.removeClass( row , CLS_ROW_SELECTED );
                if(rowExtra) DOM.removeClass( rowExtra , CLS_ROW_SELECTED );
            }
        },

        //����Ƿ�ȫѡ
        _checkIfSelectAll:function(){
            var ifSelectAll = true , rowElArr = this._rowElArr;
            for(var i = 0 , len = rowElArr.length ; i < len ; i++){
                if( !DOM.hasClass( rowElArr[i] , CLS_ROW_SELECTED)){
                    ifSelectAll = false;
                    break;
                }
            }
            var theadRow = this._theadEl.getElementsByTagName('tr')[0];
            if(ifSelectAll){
                DOM.addClass( theadRow , CLS_ROW_SELECTED );
            }else{
                DOM.removeClass( theadRow , CLS_ROW_SELECTED );
            }
        },

        /**
         * ��ȡѡ�е��л���record
         * @param returnBy Ĭ��'record'����ѡ'index'
         */
        _getSelected:function(returnBy){
            var selected = [];
            for( var  i = 0 , len = this._rowElArr.length ; i < len ; i++ ){
                if( YDOM.hasClass( this._rowElArr[i] , CLS_ROW_SELECTED ) ){
                    if(returnBy == 'index'){
                        selected.push( i );
                    }else{
                        selected.push( this._listData[i] );
                    }
                }
            }
            if( selected.length ==  0 ){
                return null;
            }else{
                return selected;
            }
        }


        /**************************************************************************************************************
         * @��ɾ�Ĳ���
         *************************************************************************************************************/

        /*addRecord:function(){

        },
        modifyRecord:function(){

        },
        deleteRecord:function(){

        }*/
    });

});