/**
 * Accordion Widget
 * @creator     ����<fool2fish@gmail.com>
 */
KISSY.add('accordion', function(S) {
    
    var DOM = S.DOM, Event = S.Event,
        doc = document,
        DISPLAY = 'display', BLOCK = 'block', NONE = 'none',
        FORWARD = 'forward', BACKWARD = 'backward',
        DOT = '.',
        EVENT_BEFORE_SWITCH = 'beforeSwitch', EVENT_SWITCH = 'switch',

        defaultConfig = {
        triggerType:'click',
        multiPanelExpandable:false
    };

    /**
     * Accordion Class
     * @constructor
     */
    function Accordion(container, config) {
        var self = this;

        // factory or constructor
        if (!(self instanceof Accordion)) {
            return new Accordion(container, config);
        }

        config = S.merge(defaultConfig, config || {});
        Accordion.superclass.constructor.call(self, container, config);
    }

    S.extend(Accordion, S.Switchable);

    S.augment(Accordion,{
        /**
         * click or tab ������ trigger ʱ�������¼�
         */
        _onFocusTrigger: function(index) {
            var self = this , cfg = self.config;
            if (self.activeIndex === index && (!cfg.multiPanelExpandable)) return; // �ظ����
            if (self.switchTimer) self.switchTimer.cancel(); // ���磺�������������̵������ʱ�����¼�����ȡ����
            self.switchTo(index);
        },
        /**
         * ��������� trigger ��ʱ�������¼�
         */
        _onMouseEnterTrigger: function(index) {
            var self = this, cfg = self.config;
            // ���ظ����������磺����ʾ����ʱ���������ٻ����ٻ����������ش���
            if (cfg.multiPanelExpandable || self.activeIndex !== index) {
                self.switchTimer = S.later(function() {
                    self.switchTo(index);
                }, self.config.delay * 1000);
            }
        },  
        switchTo: function(index, direction) {
            var self = this, cfg = self.config,
                triggers = self.triggers, panels = self.panels,
                activeIndex = self.activeIndex,
                steps = cfg.steps,
                fromIndex = activeIndex * steps, toIndex = index * steps;
            //S.log('Triggerable.switchTo: index = ' + index);

            // if mutilple panels allow to be expanded
            if(cfg.multiPanelExpandable){
                if (self.fire(EVENT_BEFORE_SWITCH, {toIndex: index}) === false) return self;

                // switch active panels
                if (direction === undefined) {
                    direction = index > activeIndex ? FORWARD : FORWARD;
                }

                var activeTriggerCls = cfg.activeTriggerCls;
                if(panels[index].style.display == NONE){
                    DOM.addClass(triggers[index], activeTriggerCls);
                    DOM.css(panels[index], DISPLAY, BLOCK);
                }else{
                    DOM.removeClass(triggers[index], activeTriggerCls);
                    DOM.css(panels[index], DISPLAY, NONE);
                }

                // fire onSwitch
                this.fire(EVENT_SWITCH);

                // update activeIndex
                self.activeIndex = index;
                
            // if only one panel allow to be expanded
            }else{
                Accordion.superclass.switchTo.call(self , index, direction);
            }
            return self; // chain
        }
    });
    
    S.Accordion = Accordion;
    
});
