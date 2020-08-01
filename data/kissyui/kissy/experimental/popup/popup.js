/**
 * Popup
 * @creator     ����<fool2fish@gmail.com>
 * @depends     kissy-core, yui-core
 */

KISSY.add("popup", function(S) {
    var DOM = S.DOM, Event = S.Event , YDOM = YAHOO.util.Dom ,
        doc = document,
        POPUP_STATE = 'data-popup-state',
        POPUP_STATE_ENABLED = 'enabled' ,
        POPUP_STATE_DISABLED = 'disabled';		

    /**
     * Popup
     * @constructor
     */
    function Popup(trigger, popup, config){
        var self=this;

        trigger = S.query( trigger );
        popup = S.get( popup );
        if( trigger.length == 0 || !popup ) return;

        popup.style.position = 'absolute' ;
        popup.style.display = 'none' ;
        self.popup = popup ;
        S.ready(function(S) {
            doc.body.appendChild( popup );
        });         

        config = S.merge(defaultConfig, config);
        self.config = config ;
        if( config.width != 'auto' ) popup.style.width = config.width+'px';
        if( config.height != 'auto' ) popup.style.height = config.height+'px';

        // ��ʼ������(����popup����һ�����ּ���)
        if( config.hasMask && config.triggerType == 'click' ) Mask.init();

        //Ϊie6�µ�popup���shim������סselect
        if(S.UA.ie===6) self._shim = new Shim();

        // �رհ�ť
        self._bindCloseBtn();

        //�������飬��ʹֻ��һ������Ҳ���������ʽ����
        self.trigger = [] ;

        //�󶨴��㣬����ӵ���������
        for( var i = 0 , len = trigger.length ; i < len ; i++ ){
            self.bindTrigger( trigger[i] );
        }

        // �󶨵����㣬��triggerTypeΪmouseʱ��Ч
        self._bindPopup();

        //self._popupHideTimeId = undefined;
		//self._popupShowTimeId = undefined;
        /**
         * ǰһ�δ���
         */
        //self.prevTrigger = undefined;
        /**
         * ��ǰ����
         */
		//self.curTrigger = undefined;

    }

    S.augment(Popup,{
        //��ʾ������
        show:function(){
            var self = this , config = self.config , popup = self.popup ;
            if(self.curTrigger.getAttribute(POPUP_STATE) == POPUP_STATE_DISABLED) return;
            if( !(YDOM.getStyle(popup,'zIndex') > 1)) popup.style.zIndex = 2;
            if( config.hasMask && config.triggerType == 'click' ) Mask.show(popup);
            popup.style.display = 'block';
            self.fire( 'show');
            setPosition( popup , self.curTrigger , config.position , config.align , config.offset , config.autoFit );            
            if(self._shim) self._shim.show(popup);
            if( config.effect == 'fade') opacityAnim( popup , 0 , 1 );
        },
        //���ص�����
        hide:function(){
            var self = this , config = self.config , popup = self.popup ;
            if(config.hasMask && config.triggerType == 'click') Mask.hide();            
            popup.style.display = 'none';
            if(self._shim) self._shim.hide();
            self.fire( 'hide');
        },
        //����ָ��Ԫ��Ϊ����
        bindTrigger:function( el ){
            var self = this , config = self.config ;
            self.enableTrigger( el );
            if( S.indexOf(el, self.trigger) >= 0 ) return;
            self.trigger.push( el );
            //ע���¼�
            if( config.triggerType == 'click' ){
                Event.on( el , 'click' , function(e){
                    e.preventDefault();
                    var el = this;
                    if( el.getAttribute( POPUP_STATE) == 'POPUP_STATE_DISABLE' ) return;
                    self._onClickTrigger( el );
                } );
            }else if( config.triggerType == 'mouse' ){
                if( config.disableClick ) Event.on( el , 'click' , function(e){ e.preventDefault(); } );
                Event.on( el , 'mouseenter', function(){
                    var el = this;
                    if( el.getAttribute( POPUP_STATE) == 'POPUP_STATE_DISABLE' ) return;
                    self._onMouseEnter( el );
                } );
                Event.on( el , 'mouseleave', function(){
                    self._onMouseLeave();
                } );
            }
        },

        enableTrigger:function( el ){
            this._setTrigger( el , POPUP_STATE_ENABLED );
        },

        disableTrigger:function( el ){
            this._setTrigger( el , POPUP_STATE_DISABLED );
        },

        //��popup��mouseenter��mouseleave�¼�
        _bindPopup:function(){
            var self = this;
            if( self.config.triggerType == 'mouse' ){
                Event.on( self.popup , 'mouseenter', function(){
                    clearTimeout( self._popupHideTimeId );
                } );
                Event.on( self.popup , 'mouseleave', function(){
                    self._onMouseLeave();
                } );
            }
        },

        /**
         * ��굥��������¼�������
         * @param el ����
         */
        _onClickTrigger:function(el){
            var self = this ;
            self.prevTrigger = self.curTrigger ;
            self.curTrigger = el ;
            if( self.prevTrigger == self.curTrigger ){
                self.popup.style.display == 'none' ? self.show() : self.hide() ;
            }else{
                self.show();
            }
        },
        /**
         * �����봥����ߵ�����ʱ���¼�������
         * @param el ����򵯳���
         */
        _onMouseEnter:function(el){
            var self = this ;
            clearTimeout( self._popupHideTimeId );
            // ���mouseenter�Ķ����Ǵ���
            if( el != self.popup ){
                self.prevTrigger = self.curTrigger ;
                self.curTrigger = el ;
            }
            self._popupShowTimeId = setTimeout( function(){ self.show(); }, self.config.delay * 1000 );
        },
        /**
         * ����뿪������ߵ�����ʱ���¼�������
         */
        _onMouseLeave:function(){
            var self = this;
            clearTimeout( self._popupShowTimeId );
		    self._popupHideTimeId = setTimeout( function(){ self.hide(); }, self.config.delay * 1000 );
        },
        _setTrigger:function( el , value ){
            var self = this ;
            var triggerArr = S.makeArray(el || self.trigger) ;
            for( var i = 0 , len = triggerArr.length ; i < len ; i++ ){
                triggerArr[i].setAttribute( POPUP_STATE , value );
            }
        },
        _bindCloseBtn:function(){
            var self = this;
            Event.on( self.popup , 'click' , function(e){
                var t = e.target;
                if( DOM.hasClass( t , self.config.closeBtnCls ) ){
					e.preventDefault();
                    self.hide();
                }else{
                    t = YDOM.getAncestorBy(t,function(el){
                        return YDOM.hasClass(el,self.config.closeBtnCls) && YDOM.isAncestor(self.popup,el);
                    });
                    if(t){
						e.preventDefault();
						self.hide();
					}
                }
			});
        }

    });

    S.augment( Popup , S.EventTarget );

    S.Popup = Popup;

    //Ĭ������
    var defaultConfig = {
        // ��������
        triggerType: 'click', // or 'mouse'
        // �Ƿ���ֹ�����Ĭ�ϵ���¼���ֻ�е�triggerType=='mouse'��ʱ����趨��Ч��
        disableClick: false,
        // �����ӳ�
        delay: 0.1, // 100ms
        // ��ʾ�������ص�����ʱ�Ķ���Ч��
        effect: null,// 'fade'
        // ��������
        width: 'auto' ,
        // ������߶�
        height: 'auto',
        // ����������ڴ����λ��
        position: 'right',// or 'bottom','left','top','screenCenter'
        // ����������ڴ���Ķ��뷽ʽ
        align: 'top',// or 'right','bottom','left'
        // ������ļ���λ�ó���bodyʱ�Ƿ��Զ�����λ��
        autoFit: true,
        // �Ƿ�������
        hasMask: false,
        // �������ڴ���������رյİ�ť��class
        closeBtnCls: 'KS_PopupCloseBtn'
    };

    //����
    var Mask={
        domEl:null,
        init:function(){
            if(this.domEl) return;
            var mask=DOM.create('<div id="KSPopupMask" class="ks-popup-mask" style="display:none;position:absolute;left:0;top:0;width:100%;font-size:0px;line-height:0px;background:#000;filter:alpha(opacity=20);opacity:0.2;"></div>');
            this.domEl=mask;
            S.ready(function(S) {
                doc.body.appendChild(mask);
            });
        },
        show:function(refEl){
            var mask = this.domEl;
            if(!mask) return;
            mask.style.display = 'block';
            mask.style.height = YDOM.getDocumentHeight() + 'px';
            mask.style.zIndex = YDOM.getStyle(refEl,'zIndex')-2;
        },
        hide:function(){
            var mask = this.domEl;
            if(!mask) return;
            mask.style.display='none';
        }
    };

    //shim
    function Shim(){
        var self = this;
        var shim=DOM.create('<iframe class="ks-popup-shim" style="display:none;position:absolute;border:none;filter:alpha(opacity=0);"></iframe>');
        S.ready(function(S) {
            doc.body.appendChild(shim);
        });
        self.show = function(refEl){
            shim.style.display = 'block';
            shim.style.width = refEl.offsetWidth + 'px';
            shim.style.height = refEl.offsetHeight + 'px';
            shim.style.left = refEl.style.left;
            shim.style.top = refEl.style.top;
            shim.style.zIndex = YDOM.getStyle(refEl,'zIndex')-1;
        };
        self.hide = function(){
            shim.style.display = 'none';
        };
    }

    function setPosition( el , refEl , position , align , offset , autoFit){
        var pos = YDOM.getXY( refEl );
        if ( S.isArray ( offset ) ) {
            pos[0] += parseInt( offset[0] , 10 );
            pos[1] += parseInt( offset[1] , 10 );
        }
        var  tw = refEl.offsetWidth, th = refEl.offsetHeight,
            pw = el.offsetWidth , ph = el.offsetHeight,
            dw = YDOM.getViewportWidth(), dh = YDOM.getViewportHeight(),
            sl = YDOM.getDocumentScrollLeft(), st = YDOM.getDocumentScrollTop(),
            l = pos[0], t = pos[1];
        if (position == 'left') {
            l = pos[0]-pw;
            t = (align == 'center')?(t-ph/2+th/2):(align == 'bottom')?(t+th-ph):t;
        } else if (position == 'right') {
            l = pos[0]+tw;
            t = (align == 'center')?(t-ph/2+th/2):(align == 'bottom')?(t+th-ph):t;
        } else if (position == 'bottom') {
            t = t+th;
            l = (align == 'center')?(l+tw/2-pw/2):(align == 'right')?(l+tw-pw):l;
        } else if (position == 'top') {
            t = t-ph;
            l = (align == 'center')?(l+tw/2-pw/2):(align == 'right')?(l+tw-pw):l;
        } else if(position=='screenCenter'){
            t = st + (dh-ph)/2;
            l = sl + (dw-pw)/2;
        }
        //��ֹ����
        if(autoFit) {
            if ( t-st+ph > dh ) t = dh-ph+st-2;
            if ( l-sl+pw > dw) l = dw-pw+sl-2;
            t = Math.max( t , 0 );
            l = Math.max( l , 0 );
        }
        el.style.top = t + 'px';
        el.style.left = l + 'px';
    };

    function setOpacity( el , opacity ){
            el.style.filter = 'alpha(opacity=' + opacity * 100 + ')';
            el.style.opacity = opacity ;
    }

    function opacityAnim( el , from , to ){
        var curOpacity = from , step = parseInt( ( to - from ) / 10 * 100 )/ 100;
        setOpacity( el , curOpacity );
        var intervalId = setInterval( function(){
            curOpacity = curOpacity + step ;
            if(( from > to && curOpacity < to ) || ( from < to && curOpacity > to)){
                curOpacity = to;
                clearInterval( intervalId );
            }
            setOpacity( el , curOpacity );
        } , 25 );
    }
});

/**
 * Notes:
 *
 * 2010.04.22
 *      -���ڿ��Բ���popup�Զ��߶ȣ�����popup�е���������Ӧ�����ҿ����Զ����¼�'afterShow'
 *       ��ô����û���popup.show��ʱ�������̬�޸���popup�����ݣ��������ݼ��ػ��������������ͼƬ��
 *       ��popup����Ϊ��/������������Ӧλ�õ�ʱ��
 *       ���п��ܵ���popup��λ�ü��㣨��Ϊ�ò���popup׼ȷ�ĳߴ�����������
 *      -��ie6�£���Ϊpopup������iframe��shim����û��Ϊ͸����������iframe��shim
 *       ie6��iframe��͸����ʽ��2��
 *       ��������allowtransparent�����ڲ�סselect
 *       ����style.filter.opacity����ʹ��������iframe�µ�select������ʧ������select��ʧ�����Ĳ���Զ���ڲ��ڵ�select
 * 
 */

