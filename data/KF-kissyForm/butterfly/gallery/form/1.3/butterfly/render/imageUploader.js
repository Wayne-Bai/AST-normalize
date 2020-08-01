/**
 * @fileoverview ��ʼ��ui�Ļ���
 * @author  ��ƽ�����ӣ�<minghe36@gmail.com>
 */
KISSY.add(function (S, Node,RenderUi,ImageUploader) {
    /**
     *  ��ʼ��ui�Ļ���
     * @constructor
     */
    function RenderImageUploader(config) {
        var self = this;
        RenderImageUploader.superclass.constructor.call(self, config);
    }

    S.extend(RenderImageUploader, RenderUi, /** @lends RenderImageUploader.prototype*/{
        /**
         * ��ʼ��
         * @private
         */
         _init:function(){
            var self = this;
            var $target = self.get('target');
            if (!$target || !$target.length) return false;

            var imageUploader = new ImageUploader($target);
            self.fireBeforeRenderEvent(imageUploader);
            imageUploader.on('render',function(ev){
                //���׼�����
                self.set('isReady',true);
                self.set('ui',ev.uploader);
                self.fireRenderEvent();
            });
            imageUploader.render();
            return self;
         }
    },{
        ATTRS:/** @lends RenderImageUploader.prototype*/{

        }
    });

    return RenderImageUploader;
}, {
    requires:[
        'node',
        './base',
        'gallery/form/1.3/uploader/imageUploader'
    ]
});