/**
 * CoupleSelect
 * @creator     ����<fool2fish@gmail.com>
 * @depends     kissy-core, yui-core
 */

KISSY.add("coupleselect", function(S) {
    var DOM = S.DOM, Event = S.Event , YDOM = YAHOO.util.Dom ,
        KS_CS_PREFIX = 'ks-coupleselect-', DISABLED_SUFFIX='-disabled',
        doc = document;
		

    /**
     * CoupleSelect
     * @constructor
     */
    function CoupleSelect(container,config){
        container = S.get(container);
        if(!container) return;

        var self=this;
        self.container = container;
        config = S.merge(defaultConfig, config);
        self.config = config;

        // Դ����
        self._sourceBox = S.get('.'+config.sourceBoxCls,container);
        // Ŀ������
        self._targetBox = S.get('.'+config.targetBoxCls,container);
        // ��item��������
        self._bindItems();
        // ����Ӵ���
        self._addTrigger = S.get('.'+config.addTriggerCls,container);
        if(self._addTrigger) self._bindAddTrigger();
        // ���Ƴ�����
        self._removeTrigger = S.get('.'+config.removeTriggerCls,container);
        if(self._removeTrigger) self._bindRemoveTrigger();
        // ���ƶ�����������
        self._moveTopTrigger = S.get('.'+config.moveTopTriggerCls,container);
        if(self._moveTopTrigger) self._bindMoveTopTrigger();
        // ������һ������
        self._moveUpTrigger = S.get('.'+config.moveUpTriggerCls,container);
        if(self._moveUpTrigger) self._bindMoveUpTrigger();
        // ������һ������
        self._moveDownTrigger = S.get('.'+config.moveDownTriggerCls,container);
        if(self._moveDownTrigger) self._bindMoveDownTrigger();
        // ���ƶ����ײ�����
        self._moveBottomTrigger = S.get('.'+config.moveBottomTriggerCls,container);
        if(self._moveBottomTrigger) self._bindMoveBottomTrigger();
		
		//��Ǳ�ѡ�е�item
		self._selectedItem = null;

    }

    S.augment(CoupleSelect,{
	
        //  ��item��������
        _bindItems:function(){
            var self = this,config = self.config;
            //��item�ĵ�������
            Event.on(self.container,'click',function(e){
				e.preventDefault();
                var t = e.target;
                var item = getItem(t,config.itemCls);
                if(item) self._onClickItem(item);
            });
            //��item��˫������
            if(config.enableMoveByDbclick){
                Event.on(self.container,'dblclick',function(e){
					e.preventDefault();
                    var t = e.target;
                    var item = getItem(t,config.itemCls);
                    if(item) self._onDbclickItem(item);
                });
            }
        },
		// item��������
        _onClickItem:function(item){
            var self = this,config = self.config;
            if(item == self._selectedItem){
                self._clearSelectedItem();
            }else{
				self._clearSelectedItem();
                DOM.addClass(item,config.itemSelectedCls); 
				self._selectedItem = item;
            }            
        },
		// item˫������
        _onDbclickItem:function(item){
			var self = this;
			if(YDOM.isAncestor(self._sourceBox,item)){
				self._addItem(item);
			}else if(YDOM.isAncestor(self._targetBox,item)){
				self._removeItem(item);
			}
        },
		
        // �����ѡ��item����
        _bindAddTrigger:function(){
			var self = this;
			Event.on(self._addTrigger,'click',function(e){
				e.preventDefault();
				self._addItem();
			});
		},
		// ���ѡ��item
        _addItem:function(item){			
			var self = this,config=self.config;
			item = item || S.get('.'+config.itemSelectedCls,self._sourceBox);
			if(!item) return;
			self._clearSelectedItem();
			if(config.enableReaddItem){
				var cloneItem = item.cloneNode(true);
				self._targetBox.appendChild(cloneItem);
			}else{
				self._targetBox.appendChild(item);
			}
            self.fire( 'addItem');
		},
		
        // ���Ƴ�ѡ��item����
        _bindRemoveTrigger:function(){
			var self = this;
			Event.on(self._removeTrigger,'click',function(e){
				e.preventDefault();
				self._removeItem();
			});
		},
		// �Ƴ�ѡ��item
        _removeItem:function(item){
			var self = this,config=self.config;
			item = item || S.get('.'+config.itemSelectedCls,self._targetBox);
			if(!item) return;
			self._clearSelectedItem();
			if(config.enableReaddItem){
				self._targetBox.removeChild(item);
			}else{
				self._sourceBox.appendChild(item);
			}
            self.fire( 'removeItem');
		},
		
        // ���ƶ�targetBox��ѡ��item���
        _bindMoveTopTrigger:function(){
			var self=this;
			Event.on(self._moveTopTrigger,'click',function(e){
				e.preventDefault();				
				self._moveItem('to',0);
			});
		},
        _bindMoveUpTrigger:function(){
			var self=this;
			Event.on(self._moveUpTrigger,'click',function(e){
				e.preventDefault();
				self._moveItem('by',1);
			});
		},
        _bindMoveDownTrigger:function(){
			var self=this;
			Event.on(self._moveDownTrigger,'click',function(e){
				e.preventDefault();
				self._moveItem('by',-1);
			});
		},	
        _bindMoveBottomTrigger:function(){
			var self=this;
			Event.on(self._moveBottomTrigger,'click',function(e){
				e.preventDefault();
				self._moveItem('to',-1);
			});
		},  
        _moveItem:function(method,position){
			var self = this,config=self.config;
			if(!self._selectedItem || !YDOM.isAncestor(self._targetBox,self._selectedItem)) return;
			var item = self._selectedItem , 
				targetItems = self._getTargetItems(),
				startPosition = S.indexOf(item,targetItems);
			if(method == 'to'){
				if(position<0) position = targetItems.length + position;			
			}else if(method == 'by'){
				position = startPosition - position;
			}
			if(startPosition<position){
				YDOM.insertAfter(item,targetItems[position]);
			}else{
				YDOM.insertBefore(item,targetItems[position]);
			}
            self.fire( 'moveItem');
		},
		
        // ��ȡitem���
        /**
         * ��ȡtargetBox�е�items
         * @param parser
         */
        getTargetItems:function(parser){
            var items = this._getTargetItems();
            if(parser){
                var resultArr=[];
                for(var i = 0,len=items.length;i<len;i++){
                    resultArr.push(parser(items[i]));
                };
                return resultArr;
            }else{
                return items;
            }
        },
        _getSourceItems:function(){
			return S.query('.'+this.config.itemCls,this._sourceBox);
		},
		_getTargetItems:function(){
			return S.query('.'+this.config.itemCls,this._targetBox);
		},
		_clearSelectedItem:function(){
			var self = this;
			if(self._selectedItem){
				DOM.removeClass(self._selectedItem,self.config.itemSelectedCls);
				self._selectedItem = null;
			}
		}
    });

    S.augment( CoupleSelect , S.EventTarget );

    S.CoupleSelect = CoupleSelect;

    //Ĭ������
    var defaultConfig = {

        enableReaddItem:true,
        enableMoveByDbclick:true,

        // �����������ò�Ҫ�޸ģ�ʹ��Ĭ�ϼ���

        sourceBoxCls:KS_CS_PREFIX+'source-box',
        targetBoxCls:KS_CS_PREFIX+'target-box',

        itemCls:KS_CS_PREFIX+'item',
        itemSelectedCls:KS_CS_PREFIX+'item-selected',

        addTriggerCls:KS_CS_PREFIX+'add',
        removeTriggerCls:KS_CS_PREFIX+'remove',

        moveTopTriggerCls:KS_CS_PREFIX+'move-top',
        moveUpTriggerCls:KS_CS_PREFIX+'move-up',
        moveDownTriggerCls:KS_CS_PREFIX+'move-down',
        moveBottomTriggerCls:KS_CS_PREFIX+'move-bottom'
        
    };

    function getItem(t,className){return DOM.hasClass(t, className) ? t : YDOM.getAncestorByClassName(t, className)};

});

/**
 * Notes:
 *
 * 2010.04.26
 *      -
 * 
 */

