/**
 * @package   	JCE
 * @copyright 	Copyright (c) 2009-2015 Ryan Demmer. All rights reserved.
 * @license   	GNU/GPL 2 or later - http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */
(function() {
    var DOM = tinymce.DOM, Event = tinymce.dom.Event, each = tinymce.each, Node = tinymce.html.Node;
    var VK = tinymce.VK, BACKSPACE = VK.BACKSPACE, DELETE = VK.DELETE;
    
    tinymce.create('tinymce.plugins.ArticlePlugin', {
        init: function(ed, url) {
            var t = this;
            
            t.editor = ed;
            t.url = url;
            
            function isReadMore(n) {
                return ed.dom.is(n, 'hr.mceItemReadMore');
            };
            
            function isPageBreak(n) {
                return ed.dom.is(n, 'hr.mceItemPageBreak');
            };

            // Register commands
            ed.addCommand('mceReadMore', function() {
                if (ed.dom.get('system-readmore')) {
                    alert(ed.getLang('article.readmore_alert', 'There is already a Read More break inserted in this article. Only one such break is permitted. Use a Pagebreak to split the page up further.'));
                    return false;
                }
                t._insertBreak('readmore', {
                    id: 'system-readmore'
                });
            });
            ed.addCommand('mcePageBreak', function(ui, v) {                
                var n = ed.selection.getNode();
                
                if (isPageBreak(n)) {
                    t._updatePageBreak(n, v);
                } else {
                    t._insertBreak('pagebreak', v);
                }
            });

            // Register buttons
            if (ed.getParam('article_show_readmore', true)) {
                ed.addButton('readmore', {
                    title: 'article.readmore',
                    cmd: 'mceReadMore'
                });
            }
            
            /*ed.onBeforeRenderUI.add(function() {
                var DOM = tinymce.DOM;
            
               if (ed.getParam('article_hide_xtd_btns', true)) {
                    tinymce.each(DOM.select('div.readmore, div.pagebreak', 'editor-xtd-buttons'), function(n) {
                        DOM.hide(n.parentNode);
                    });
                }
            });*/

            ed.onInit.add(function() {
                if (!ed.settings.compress.css)
                    ed.dom.loadCSS(url + "/css/content.css");
                
                
                
                // Display "a#name" instead of "img" in element path
                if (ed.theme && ed.theme.onResolveName) {
                    ed.theme.onResolveName.add( function(theme, o) {
                        var n = o.node, v;

                        if (o.name === 'hr' && /mceItemPageBreak/.test(n.className)) {
                            v = 'pagebreak';
                        }
                        
                        if (o.name === 'hr' && /mceItemReadMore/.test(n.className)) {
                            v = 'readmore';
                        }
                        
                        if (v) {
                            o.name = v;
                        }
                    });
                }
                
            });
            
            ed.onNodeChange.add(function(ed, cm, n) {
                cm.setActive('readmore', isReadMore(n));
                cm.setActive('pagebreak', isPageBreak(n));
                
                ed.dom.removeClass(ed.dom.select('hr.mceItemPageBreak.mceItemSelected, hr.mceItemReadMore.mceItemSelected'), 'mceItemSelected');
                
                if (isPageBreak(n) || isReadMore(n)) {                 
                    ed.dom.addClass(n, 'mceItemSelected');
                }
            });
            
            function _cancelResize() {
                each(ed.dom.select('hr.mceItemPageBreak, hr.mceItemReadMore'), function(n) {
                    n.onresizestart = function() {
                        return false;
                    };
                
                    n.onbeforeeditfocus = function() {
                        return false;
                    };
                });
            };
            
            ed.onBeforeSetContent.add( function(ed, o) {
                o.content = o.content.replace(/<hr([^>]*)alt="([^"]+)"([^>]+)>/gi, '<hr$1data-mce-alt="$2"$3>');
            });
            
            ed.onSetContent.add(function() {                              
                if (tinymce.isIE) {
                    _cancelResize();
                }
            });
            
            ed.onGetContent.add(function() {                              
                if (tinymce.isIE) {
                    _cancelResize();
                }
            });
            
            ed.onKeyDown.add(function(ed, e) {				
                if (e.keyCode == BACKSPACE || e.keyCode == DELETE) {                                        
                    var s = ed.selection, n = s.getNode();
                    
                    if (ed.dom.is(n, 'hr.mceItemPageBreak, hr.mceItemReadMore')) {
                        ed.dom.remove(n);

                        e.preventDefault();
                    }
                }
            });
            
            ed.onPreInit.add( function() {            	
                // Convert video elements to image placeholder
                ed.parser.addNodeFilter('hr', function(nodes) {
                    for (var i = 0; i < nodes.length; i++) {
                        var node = nodes[i], id = node.attr('id') || '', cls = node.attr('class') || '';
                    	
                        if (id == 'system-readmore' || /system-pagebreak/.test(cls)) {
                            var cls = /system-pagebreak/.test(cls) ? 'mceItemPageBreak' : 'mceItemReadMore';
                            
                            node.attr('class', cls);
                            if (node.attr('alt')) {
                                node.attr('data-mce-alt', node.attr('alt'));
                                node.attr('alt', null);
                            }
                        }
                    }
                });

                // Convert image placeholders to video elements
                ed.serializer.addNodeFilter('hr', function(nodes, name, args) {
                    for (var i = 0; i < nodes.length; i++) {
                        var node = nodes[i];
                        if (/mceItem(PageBreak|ReadMore)/.test(node.attr('class') || '')) {
                            if (/mceItemPageBreak/.test(node.attr('class'))) {
                                node.attr('class', 'system-pagebreak');
                            } else {
                                node.attr('class', '');
                                node.attr('id', 'system-readmore');
                            }

                            if (node.attr('data-mce-alt')) {
                                node.attr('alt', node.attr('data-mce-alt'));
                                
                                node.attr('data-mce-alt', null);
                            }
                        }
                    }
                });

            });
        },
        
        _getPageBreak : function() {
            var t = this, ed = this.editor, dom = ed.dom, n = ed.selection.getNode(), o;
            
            if (ed.dom.is(n, 'hr.mceItemPageBreak')) {
                o = {
                    title   : ed.dom.getAttrib(n, 'title', ''),
                    alt     : ed.dom.getAttrib(n, 'data-mce-alt', '')
                }
            }
            
            return o;
        },
        
        _updatePageBreak : function(n, v) {
            var t = this, ed = this.editor;
            
            tinymce.extend(v, {
               'data-mce-alt' : v.alt || '' 
            });
            
            v.alt = null;
            
            ed.dom.setAttribs(n, v);
        },
		
        _insertBreak: function(s, args) {
            var t = this, ed = this.editor, dom = ed.dom, n = ed.selection.getNode(), ns, h, c, re, isBlock = false, hr, p, desc = '', bElm = [];
            
            var blocks = 'H1,H2,H3,H4,H5,H6,P,DIV,ADDRESS,PRE,FORM,TABLE,OL,UL,CAPTION,BLOCKQUOTE,CENTER,DL,DIR,FIELDSET,NOSCRIPT,NOFRAMES,MENU,ISINDEX,SAMP,SECTION,ARTICLE,HGROUP,ASIDE,FIGURE';
            
            n = dom.getParent(n, blocks, 'BODY') || n;
            
            tinymce.extend(args, {
                'class'         : s == 'pagebreak' ? 'mceItemPageBreak' : 'mceItemReadMore',
                'data-mce-alt'  : args.alt || null
            });
            
            // remove alt
            args.alt = null;
            
            // set id for readmore
            if (s == 'readmore') {
                args.id = 'system-readmore';
            }
            
            ed.execCommand('mceInsertContent', false, '<span id="mce_hr_marker" data-mce-type="bookmark">\uFEFF</span>', {
                skip_undo : 1
            });
            
            var marker  = dom.get('mce_hr_marker');
            var hr      = dom.create('hr', args);
            
            if (dom.isBlock(n)) {
                // get the img parent
                p = dom.getParent(marker, blocks, 'BODY');
                // split paragraphs / divs
                if (p.nodeName == 'P' || p.nodeName == 'DIV') {
                    
                    // split
                    dom.split(p, marker);
                    
                    ns = marker.nextSibling;
					
                    if (ns && ns.nodeName == p.nodeName) {						
                        if (/^(\s|&nbsp;|\u00a00)*?$/.test(h) || h == '<br>') {
                            dom.remove(ns);
                        }
                    }
                } else {
                    // If in block
                    if (p) {
                        if (p.parentNode.nodeName == 'BODY') {
                            dom.insertAfter(marker, p);
                        } else {                            
                            p.parentNode.insertBefore(marker, p);
                        }
                    } else {
                        if (n.parentNode.nodeName == 'BODY') {
                            dom.insertAfter(marker, n);
                        } else {
                            n.parentNode.insertBefore(marker, n);
                        }
                    }
                    p = marker.parentNode;
                    
                    while (/^(H[1-6]|ADDRESS|PRE|FORM|TABLE|OL|UL|CAPTION|BLOCKQUOTE|CENTER|DL|DIR|FIELDSET|NOSCRIPT|NOFRAMES|MENU|ISINDEX|SAMP)$/.test(p.nodeName)) {
                        p.parentNode.insertBefore(marker, p);
                        p = marker.parentNode;
                    }
                }
                ns = marker.nextSibling;
					
                if (!ns) {
                    var el = ed.getParam('forced_root_block') || 'br'; 
                    ns = ed.dom.create(el);
                    
                    if (el != 'br') {
                        ns.innerHTML = '\u00a0';
                    }
                    ed.dom.insertAfter(ns, marker);
                    s = ed.selection.select(ns);
                    ed.selection.collapse(1);
                }
            }
            
            ed.dom.replace(hr, marker);      
            ed.undoManager.add();
        },

        createControl: function(n, cm) {
            var self = this, ed = this.editor;

            switch (n) {
                case 'pagebreak':
                    if (ed.getParam('article_show_pagebreak', true)) {

                        var content = DOM.create('div');
                        
                        var fieldset = DOM.add(content, 'fieldset', {}, '<legend>' + ed.getLang('article.pagebreak', 'Insert / Edit Pagebreak') + '</legend>');
                        
                        var n = DOM.add(fieldset, 'div');

                        DOM.add(n, 'label', {
                            'for' : ed.id + '_title'
                        }, ed.getLang('article.title', 'Title'));

                        var title   = DOM.add(n, 'input', {
                            type    : 'text',
                            id      : ed.id + '_title',
                            style : {
                                'width' : 180
                            }
                        });
                        
                        n = DOM.add(fieldset, 'div');
                    
                        DOM.add(n, 'label', {
                            'for' : ed.id + '_alt'
                        }, ed.getLang('article.alias', 'Alias'));
                    
                        var alt   = DOM.add(n, 'input', {
                            type    : 'text',
                            id      : ed.id + '_alt',
                            style : {
                                'width' : 180
                            }
                        });

                        var c = new tinymce.ui.ButtonDialog(cm.prefix + 'pagebreak', {
                            title           : ed.getLang('article.pagebreak', 'Insert / Edit Pagebreak'),
                            'class'         : 'mce_pagebreak',
                            'dialog_class'  : ed.getParam('skin') + 'Skin',
                            'content'       : content,
                            'width'         : 250,
                            buttons         : [{
                                title : ed.getLang('common.insert', 'Insert'),
                                id    : 'insert',
                                click : function(e) {                                    
                                    ed.execCommand('mcePageBreak', false, {
                                        title   : title.value, 
                                        alt     : alt.value
                                    });
                                    
                                    return true;
                                },
                                scope : self
                            }]
                        }, ed);

                        c.onShowDialog.add(function() {
                            title.value = alt.value = '';
                            var label = ed.getLang('common.insert', 'Insert');
                       
                            var o = self._getPageBreak(), active = false;
                        
                            if (o) {
                                title.value = o.title || '';
                                alt.value   = o.alt || '';
                                label = ed.getLang('common.update', 'Update');
                                
                                active = true;
                            }
                            
                            c.setActive(active);
                        
                            c.setButtonLabel('insert', label);
                            
                            title.focus();
                        });
                    
                        c.onHideDialog.add(function() {
                            title.value = alt.value = '';
                        });
					
                        // Remove the menu element when the editor is removed
                        ed.onRemove.add(function() {
                            c.destroy();
                        });

                        return cm.add(c);
                        break;
                    }
            }

            return null;
        },
        
        getInfo: function() {
            return {
                longname: 'Article',
                author: 'Ryan Demmer',
                authorurl: 'http://www.joomlacontenteditor.net',
                infourl: 'http://www.joomlacontenteditor.net',
                version: '@@version@@'
            };
        }
    });
    // Register plugin
    tinymce.PluginManager.add('article', tinymce.plugins.ArticlePlugin);
})();