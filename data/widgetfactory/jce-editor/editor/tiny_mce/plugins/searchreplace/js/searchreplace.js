/**
 * @package   	JCE
 * @copyright 	Copyright (c) 2009-2015 Ryan Demmer. All rights reserved.
 * @license   	GNU/GPL 2 or later - http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */
//tinyMCEPopup.requireLangPack();

var SearchReplaceDialog = {
    settings: {},
    init: function(ed) {
        var self = this, m = tinyMCEPopup.getWindowArg("mode");

        $.Plugin.init();

        $('button#next').button({
            icons: {
                primary: 'ui-icon-arrowthick-1-e'
            }
        }).click(function(e) {
            self.searchNext('none');
            e.preventDefault();
        });

        $('button#replaceBtn').button({
            icons: {
                primary: 'ui-icon-transferthick-e-w'
            }
        }).click(function(e) {
            self.searchNext('current');
            e.preventDefault();
        });

        $('button#replaceAllBtn').button({
            icons: {
                primary: 'ui-icon-transferthick-e-w'
            }
        }).click(function(e) {
            self.searchNext('all');
            e.preventDefault();
        });

        var index = $('a[href="#' + m + '_tab"]').parent().index();

        $('#tabs').on('tabsactivate', function(e, ui) {
            var id = $(ui.newPanel).attr('id');
            self.switchMode(id.substring(0, id.indexOf('_')));
        }).tabs('option', 'active', index);

        this.switchMode(m);

        $('#' + m + '_panel_searchstring').val(tinyMCEPopup.getWindowArg("search_string"));

        // Focus input field
        $('#' + m + '_panel_searchstring').focus();
    },
    switchMode: function(m) {
        var lm = this.lastMode;

        if (lm != m) {
            if (lm) {
                $('#' + m + '_panel_searchstring').val($('#' + lm + '_panel_searchstring').val());
                $('#' + m + '_panel_backwardsu').prop('checked', $('#' + lm + '_panel_backwardsu').is(':checked'));

                $('#' + m + '_panel_backwardsd').prop('checked', $('#' + lm + '_panel_backwardsd').is(':checked'));
                $('#' + m + '_panel_casesensitivebox').prop('checked', $('#' + lm + '_panel_casesensitivebox').is(':checked'));
            }

            $("#replaceBtn, #replaceAllBtn").css('display', function() {
                if (m == 'replace') {
                    return 'inline';
                }
                return 'none';
            });

            this.lastMode = m;
        }
    },
    searchNext: function(a) {
        var ed = tinyMCEPopup.editor, se = ed.selection, r = se.getRng(), m = this.lastMode, s, b, fl = 0, w = ed.getWin(), wm = ed.windowManager, fo = 0, ca, rs;

        if (tinymce.isIE11 && !window.find) {
            return;
        }

        // Get input
        s = $('#' + m + '_panel_searchstring').val();
        b = $('#' + m + '_panel_backwardsu').is(':checked');
        ca = $('#' + m + '_panel_casesensitivebox').is(':checked');
        rs = $('#replace_panel_replacestring').val();

        if (tinymce.isIE) {
            r = ed.getDoc().selection.createRange();
        }

        if (s == '')
            return;

        function fix() {
            // Correct Firefox graphics glitches
            // TODO: Verify if this is actually needed any more, maybe it was for very old FF versions? 
            r = se.getRng().cloneRange();
            ed.getDoc().execCommand('SelectAll', false, null);
            se.setRng(r);
        }

        function replace() {
            ed.selection.setContent(rs); // Needs to be duplicated due to selection bug in IE
        }
        
       // IE flags
        if (ca)
            fl = fl | 4;

        switch (a) {
            case 'all':
                // Move caret to beginning of text
                ed.execCommand('SelectAll');
                ed.selection.collapse(true);

                if (tinymce.isIE) {
                    ed.focus();
                    r = ed.getDoc().selection.createRange();

                    while (r.findText(s, b ? -1 : 1, fl)) {
                        r.scrollIntoView();
                        r.select();
                        replace();
                        fo = 1;

                        if (b) {
                            r.moveEnd("character", -(rs.length)); // Otherwise will loop forever
                        }
                    }

                    tinyMCEPopup.storeSelection();
                } else {
                    while (w.find(s, ca, b, false, false, false, false)) {
                        replace();
                        fo = 1;
                    }
                }

                if (fo)
                    tinyMCEPopup.alert(ed.getLang('searchreplace_dlg.allreplaced', 'All occurrences of the search string were replaced.'));
                else
                    tinyMCEPopup.alert(ed.getLang('searchreplace_dlg.notfound', 'The search has been completed. The search string could not be found.'));

                return;

            case 'current':
                if (!ed.selection.isCollapsed())
                    replace();

                break;
        }

        se.collapse(b);
        r = se.getRng();

        // Whats the point
        if (!s)
            return;

        if (tinymce.isIE) {
            ed.focus();
            r = ed.getDoc().selection.createRange();

            if (r.findText(s, b ? -1 : 1, fl)) {
                r.scrollIntoView();
                r.select();
            } else
                tinyMCEPopup.alert(ed.getLang('searchreplace_dlg.notfound', 'The search has been completed. The search string could not be found.'));

            tinyMCEPopup.storeSelection();
        } else {
            if (!w.find(s, ca, b, false, false, false, false))
                tinyMCEPopup.alert(ed.getLang('searchreplace_dlg.notfound', 'The search has been completed. The search string could not be found.'));
            else
                fix();
        }
    }

};
tinyMCEPopup.onInit.add(SearchReplaceDialog.init, SearchReplaceDialog);