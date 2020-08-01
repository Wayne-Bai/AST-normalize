
KISSY.Editor.add("plugins~indent", function(E) {

    var //Y = YAHOO.util, Dom = Y.Dom, Lang = YAHOO.lang,
        TYPE = E.PLUGIN_TYPE,
        //UA = YAHOO.env.ua,

//        INDENT_ELEMENTS = Lang.merge(E.Dom.BLOCK_ELEMENTS, {
//            li: 0 // ȡ�� li Ԫ�صĵ����������� ol/ul ��������
//        }),
//        INDENT_STEP = "40",
//        INDENT_UNIT = "px",

        plugin = {
            /**
             * ���ࣺ��ͨ��ť
             */
            type: TYPE.TOOLBAR_BUTTON,

            /**
             * ��Ӧ����
             */
            exec: function() {
                // ִ������
                this.editor.execCommand(this.name);

                // ����״̬
                // ����ʱ�����ܻ�ɵ� list ��״̬
                this.editor.toolbar.updateState();
            }
        };

    // ע��ie �£�Ĭ��ʹ�� blockquote Ԫ����ʵ������
    // ��������������� range �ķ�ʽ��ʵ�֣��Ա��ֺ����������һ��
    // ie �£���ʱ������Ĭ�ϵ�
//    if (UA.ie) {
//
//        plugin.exec = function() {
//            var range = this.editor.getSelectionRange(),
//                parentEl, indentableAncestor;
//
//            if(range.parentElement) { // TextRange
//                parentEl = range.parentElement();
//            } else if(range.item) { // ControlRange
//                parentEl = range.item(0);
//            } else { // �����κδ���
//                return;
//            }
//
//            // TODO: �� CKEditor һ������ȫʵ�ֶ������ iterator
//            // ������ blockquote ��ʱ��������ѡ���Ķ����ĸ���Ԫ�ظպ���body���龰
//            // ע�⣺Ҫ�� blockquote ����ʽΪ������ʽ
//            if(parentEl === this.editor.contentDoc.body) {
//                this.editor.execCommand(this.name);
//                return;
//            }
//            // end of ��ʱ�������
//
//            // ��ȡ�������ĸ�Ԫ��
//            if (isIndentableElement(parentEl)) {
//                 indentableAncestor = parentEl;
//            } else {
//                 indentableAncestor = getIndentableAncestor(parentEl);
//            }
//
//            // ���� margin-left
//            if (indentableAncestor) {
//                var val = parseInt(indentableAncestor.style.marginLeft) >> 0;
//                val += (this.name === "indent" ? +1 : -1) * INDENT_STEP;
//
//                indentableAncestor.style.marginLeft = val + INDENT_UNIT;
//            }
//
//            /**
//             * ��ȡ�������ĸ�Ԫ��
//             */
//            function getIndentableAncestor(el) {
//                return Dom.getAncestorBy(el, function(elem) {
//                    return isIndentableElement(elem);
//                });
//            }
//
//            /**
//             * �ж��Ƿ������Ԫ��
//             */
//            function isIndentableElement(el) {
//                return INDENT_ELEMENTS[el.nodeName.toLowerCase()];
//            }
//        };
//    }

    // ע����
    E.addPlugin(["indent", "outdent"], plugin);
 });

/**
 * NOTES:
 * 
 *  - Ҫ����ȫ�ӹ� ie ��Ĭ��ʵ�֣���Ҫ���ǵ����غܶࡣ���磺
 *     1. range ֻ�� inline Ԫ�أ�����Ĵ�����ʵ��
 *     2. range ����������Ŀ�Ԫ�أ������Ҫʵ��һ�� blockIterator
 *     3. range ����Ԫ�غ���һ����Ԫ�صĲ��֣��������Ҫʵ��һ�� html parser ��Э��
 *
 */
