/**
 * Carousel Widget
 * @creator     ��<lifesinger@gmail.com>
 */
KISSY.add('carousel', function(S) {

        /**
         * Ĭ�����ã��� Switchable ��ͬ�Ĳ��ִ˴�δ�г�
         */
        var defaultConfig = {
            circular: true
        };

    /**
     * Carousel Class
     * @constructor
     */
    function Carousel(container, config) {
        var self = this;

        // factory or constructor
        if (!(self instanceof Carousel)) {
            return new Carousel(container, config);
        }

        config = S.merge(defaultConfig, config || { });
        Carousel.superclass.constructor.call(self, container, config);
    }

    S.extend(Carousel, S.Switchable);
    S.Carousel = Carousel;
});
