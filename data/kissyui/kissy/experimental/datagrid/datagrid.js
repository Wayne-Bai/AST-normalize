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
