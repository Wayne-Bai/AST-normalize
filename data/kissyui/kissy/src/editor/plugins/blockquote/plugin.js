KISSY.Editor.add("plugins~blockquote", function(E) {

    var Y = YAHOO.util, Dom = Y.Dom,
        TYPE = E.PLUGIN_TYPE,

        BLOCKQUOTE = "blockquote",
        BLOCKQUOTE_ELEMENTS = E.Dom.BLOCK_ELEMENTS;

    E.addPlugin("blockquote", {
        /**
         * ���ࣺ��ͨ��ť
         */
        type: TYPE.TOOLBAR_BUTTON,

        /**
         * ��Ӧ����
         */
        exec: function() {
            var editor = this.editor,
                range = editor.getSelectionRange(),
                parentEl = E.Range.getCommonAncestor(range),
                quotableAncestor;

            if(!parentEl) return;

            // ��ȡ�����õĸ�Ԫ��
            if (this.isQuotableElement(parentEl)) {
                quotableAncestor = parentEl;
            } else {
                quotableAncestor = this.getQuotableAncestor(parentEl);
            }

            // exec
            if (quotableAncestor) {
                var isQuoted = quotableAncestor.parentNode.nodeName.toLowerCase() === BLOCKQUOTE;
                editor.execCommand(isQuoted ? "outdent" : "indent", null, false);
            }
        },

        /**
         * ��ȡ�����õĸ�Ԫ��
         */
        getQuotableAncestor: function(el) {
            var self = this;
            return Dom.getAncestorBy(el, function(elem) {
                return self.isQuotableElement(elem);
            });
        },

        /**
         * �ж��Ƿ�ɶ���Ԫ��
         */
        isQuotableElement: function(el) {
            return BLOCKQUOTE_ELEMENTS[el.nodeName.toLowerCase()];
        }
    });
});

// NOTES:
//  Ŀǰ��ʽ�� Google Docs
