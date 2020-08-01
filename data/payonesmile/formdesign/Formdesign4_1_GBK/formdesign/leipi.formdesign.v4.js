/*
* �����˽�е�����˵�� 
* һ
* UE.leipiFormDesignUrl  ���·��
* 
* ��
*UE.getEditor('myFormDesign',{
*          toolleipi:true,//�Ƿ���ʾ����������嵥 tool
*/
UE.leipiFormDesignUrl = 'formdesign';
/**
 * �ı���
 * @command textfield
 * @method execCommand
 * @param { String } cmd �����ַ���
 * @example
 * ```javascript
 * editor.execCommand( 'textfield');
 * ```
 */
UE.plugins['text'] = function () {
	var me = this,thePlugins = 'text';
	me.commands[thePlugins] = {
		execCommand:function () {
			var dialog = new UE.ui.Dialog({
				iframeUrl:this.options.UEDITOR_HOME_URL + UE.leipiFormDesignUrl+'/text.html',
				name:thePlugins,
				editor:this,
				title: '�ı���',
				cssRules:"width:600px;height:310px;",
				buttons:[
				{
					className:'edui-okbutton',
					label:'ȷ��',
					onclick:function () {
						dialog.close(true);
					}
				},
				{
					className:'edui-cancelbutton',
					label:'ȡ��',
					onclick:function () {
						dialog.close(false);
					}
				}]
			});
			dialog.render();
			dialog.open();
		}
	};
	var popup = new baidu.editor.ui.Popup( {
		editor:this,
		content: '',
		className: 'edui-bubble',
		_edittext: function () {
			  baidu.editor.plugins[thePlugins].editdom = popup.anchorEl;
			  me.execCommand(thePlugins);
			  this.hide();
		},
		_delete:function(){
			if( window.confirm('ȷ��ɾ���ÿؼ���') ) {
				baidu.editor.dom.domUtils.remove(this.anchorEl,false);
			}
			this.hide();
		}
	} );
	popup.render();
	me.addListener( 'mouseover', function( t, evt ) {
		evt = evt || window.event;
		var el = evt.target || evt.srcElement;
        var leipiPlugins = el.getAttribute('leipiplugins');
		if ( /input/ig.test( el.tagName ) && leipiPlugins==thePlugins) {
			var html = popup.formatHtml(
				'<nobr>�ı���: <span onclick=$$._edittext() class="edui-clickable">�༭</span>&nbsp;&nbsp;<span onclick=$$._delete() class="edui-clickable">ɾ��</span></nobr>' );
			if ( html ) {
				popup.getDom( 'content' ).innerHTML = html;
				popup.anchorEl = el;
				popup.showAnchor( popup.anchorEl );
			} else {
				popup.hide();
			}
		}
	});
};
/**
 * ��ؼ�
 * @command macros
 * @method execCommand
 * @param { String } cmd �����ַ���
 * @example
 * ```javascript
 * editor.execCommand( 'macros');
 * ```
 */
UE.plugins['macros'] = function () {
    var me = this,thePlugins = 'macros';
    me.commands[thePlugins] = {
        execCommand:function () {
            var dialog = new UE.ui.Dialog({
                iframeUrl:this.options.UEDITOR_HOME_URL + UE.leipiFormDesignUrl+'/macros.html',
                name:thePlugins,
                editor:this,
                title: '��ؼ�',
                cssRules:"width:600px;height:270px;",
                buttons:[
                {
                    className:'edui-okbutton',
                    label:'ȷ��',
                    onclick:function () {
                        dialog.close(true);
                    }
                },
                {
                    className:'edui-cancelbutton',
                    label:'ȡ��',
                    onclick:function () {
                        dialog.close(false);
                    }
                }]
            });
            dialog.render();
            dialog.open();
        }
    };
    var popup = new baidu.editor.ui.Popup( {
        editor:this,
        content: '',
        className: 'edui-bubble',
        _edittext: function () {
              baidu.editor.plugins[thePlugins].editdom = popup.anchorEl;
              me.execCommand(thePlugins);
              this.hide();
        },
        _delete:function(){
            if( window.confirm('ȷ��ɾ���ÿؼ���') ) {
                baidu.editor.dom.domUtils.remove(this.anchorEl,false);
            }
            this.hide();
        }
    } );
    popup.render();
    me.addListener( 'mouseover', function( t, evt ) {
        evt = evt || window.event;
        var el = evt.target || evt.srcElement;
        var leipiPlugins = el.getAttribute('leipiplugins');
        if ( /input/ig.test( el.tagName ) && leipiPlugins==thePlugins) {
            var html = popup.formatHtml(
                '<nobr>��ؼ�: <span onclick=$$._edittext() class="edui-clickable">�༭</span>&nbsp;&nbsp;<span onclick=$$._delete() class="edui-clickable">ɾ��</span></nobr>' );
            if ( html ) {
                popup.getDom( 'content' ).innerHTML = html;
                popup.anchorEl = el;
                popup.showAnchor( popup.anchorEl );
            } else {
                popup.hide();
            }
        }
    });
};
/**
 * ��ѡ��
 * @command radio
 * @method execCommand
 * @param { String } cmd �����ַ���
 * @example
 * ```javascript
 * editor.execCommand( 'radio');
 * ```

UE.plugins['radio'] = function () {
    var me = this,thePlugins = 'radio';
    me.commands[thePlugins] = {
        execCommand:function () {
            var dialog = new UE.ui.Dialog({
                iframeUrl:this.options.UEDITOR_HOME_URL + UE.leipiFormDesignUrl+'/radio.html',
                name:thePlugins,
                editor:this,
                title: '��ѡ��',
                cssRules:"width:590px;height:370px;",
                buttons:[
                {
                    className:'edui-okbutton',
                    label:'ȷ��',
                    onclick:function () {
                        dialog.close(true);
                    }
                },
                {
                    className:'edui-cancelbutton',
                    label:'ȡ��',
                    onclick:function () {
                        dialog.close(false);
                    }
                }]
            });
            dialog.render();
            dialog.open();
        }
    };
    var popup = new baidu.editor.ui.Popup( {
        editor:this,
        content: '',
        className: 'edui-bubble',
        _edittext: function () {
              baidu.editor.plugins[thePlugins].editdom = popup.anchorEl;
              me.execCommand(thePlugins);
              this.hide();
        },
        _delete:function(){
            if( window.confirm('ȷ��ɾ���ÿؼ���') ) {
                baidu.editor.dom.domUtils.remove(this.anchorEl,false);
            }
            this.hide();
        }
    } );
    popup.render();
    me.addListener( 'mouseover', function( t, evt ) {
        evt = evt || window.event;
        var el = evt.target || evt.srcElement;
        var leipiPlugins = el.getAttribute('leipiplugins');
        if ( /input/ig.test( el.tagName ) && leipiPlugins==thePlugins) {
            var html = popup.formatHtml(
                '<nobr>��ѡ��: <span onclick=$$._edittext() class="edui-clickable">�༭</span>&nbsp;&nbsp;<span onclick=$$._delete() class="edui-clickable">ɾ��</span></nobr>' );
            if ( html ) {
                popup.getDom( 'content' ).innerHTML = html;
                popup.anchorEl = el;
                popup.showAnchor( popup.anchorEl );
            } else {
                popup.hide();
            }
        }
    });
};
 */

/**
 * ��ѡ��
 * @command checkbox
 * @method execCommand
 * @param { String } cmd �����ַ���
 * @example
 * ```javascript
 * editor.execCommand( 'checkbox');
 * ```
 */
 /*
UE.plugins['checkbox'] = function () {
    var me = this,thePlugins = 'checkbox';
    me.commands[thePlugins] = {
        execCommand:function () {
            var dialog = new UE.ui.Dialog({
                iframeUrl:this.options.UEDITOR_HOME_URL + UE.leipiFormDesignUrl+'/checkbox.html',
                name:thePlugins,
                editor:this,
                title: '��ѡ��',
                cssRules:"width:600px;height:200px;",
                buttons:[
                {
                    className:'edui-okbutton',
                    label:'ȷ��',
                    onclick:function () {
                        dialog.close(true);
                    }
                },
                {
                    className:'edui-cancelbutton',
                    label:'ȡ��',
                    onclick:function () {
                        dialog.close(false);
                    }
                }]
            });
            dialog.render();
            dialog.open();
        }
    };
    var popup = new baidu.editor.ui.Popup( {
        editor:this,
        content: '',
        className: 'edui-bubble',
        _edittext: function () {
              baidu.editor.plugins[thePlugins].editdom = popup.anchorEl;
              me.execCommand(thePlugins);
              this.hide();
        },
        _delete:function(){
            if( window.confirm('ȷ��ɾ���ÿؼ���') ) {
                baidu.editor.dom.domUtils.remove(this.anchorEl,false);
            }
            this.hide();
        }
    } );
    popup.render();
    me.addListener( 'mouseover', function( t, evt ) {
        evt = evt || window.event;
        var el = evt.target || evt.srcElement;
        var leipiPlugins = el.getAttribute('leipiplugins');
        if ( /input/ig.test( el.tagName ) && leipiPlugins==thePlugins) {
            var html = popup.formatHtml(
                '<nobr>��ѡ��: <span onclick=$$._edittext() class="edui-clickable">�༭</span>&nbsp;&nbsp;<span onclick=$$._delete() class="edui-clickable">ɾ��</span></nobr>' );
            if ( html ) {
                popup.getDom( 'content' ).innerHTML = html;
                popup.anchorEl = el;
                popup.showAnchor( popup.anchorEl );
            } else {
                popup.hide();
            }
        }
    });
};
*/
/**
 * ��ѡ����
 * @command radios
 * @method execCommand
 * @param { String } cmd �����ַ���
 * @example
 * ```javascript
 * editor.execCommand( 'radio');
 * ```
 */
UE.plugins['radios'] = function () {
    var me = this,thePlugins = 'radios';
    me.commands[thePlugins] = {
        execCommand:function () {
            var dialog = new UE.ui.Dialog({
                iframeUrl:this.options.UEDITOR_HOME_URL + UE.leipiFormDesignUrl+'/radios.html',
                name:thePlugins,
                editor:this,
                title: '��ѡ����',
                cssRules:"width:590px;height:370px;",
                buttons:[
                {
                    className:'edui-okbutton',
                    label:'ȷ��',
                    onclick:function () {
                        dialog.close(true);
                    }
                },
                {
                    className:'edui-cancelbutton',
                    label:'ȡ��',
                    onclick:function () {
                        dialog.close(false);
                    }
                }]
            });
            dialog.render();
            dialog.open();
        }
    };
    var popup = new baidu.editor.ui.Popup( {
        editor:this,
        content: '',
        className: 'edui-bubble',
        _edittext: function () {
              baidu.editor.plugins[thePlugins].editdom = popup.anchorEl;
              me.execCommand(thePlugins);
              this.hide();
        },
        _delete:function(){
            if( window.confirm('ȷ��ɾ���ÿؼ���') ) {
                baidu.editor.dom.domUtils.remove(this.anchorEl,false);
            }
            this.hide();
        }
    } );
    popup.render();
    me.addListener( 'mouseover', function( t, evt ) {
        evt = evt || window.event;
        var el = evt.target || evt.srcElement;
        var leipiPlugins = el.getAttribute('leipiplugins');
        if ( /span/ig.test( el.tagName ) && leipiPlugins==thePlugins) {
            var html = popup.formatHtml(
                '<nobr>��ѡ����: <span onclick=$$._edittext() class="edui-clickable">�༭</span>&nbsp;&nbsp;<span onclick=$$._delete() class="edui-clickable">ɾ��</span></nobr>' );
            if ( html ) {
                var elInput = el.getElementsByTagName("input");
                var rEl = elInput.length>0 ? elInput[0] : el;
                popup.getDom( 'content' ).innerHTML = html;
                popup.anchorEl = el;
                popup.showAnchor( rEl);
            } else {
                popup.hide();
            }
        }
    });
};
/**
 * ��ѡ����
 * @command checkboxs
 * @method execCommand
 * @param { String } cmd �����ַ���
 * @example
 * ```javascript
 * editor.execCommand( 'checkboxs');
 * ```
 */
UE.plugins['checkboxs'] = function () {
    var me = this,thePlugins = 'checkboxs';
    me.commands[thePlugins] = {
        execCommand:function () {
            var dialog = new UE.ui.Dialog({
                iframeUrl:this.options.UEDITOR_HOME_URL + UE.leipiFormDesignUrl+'/checkboxs.html',
                name:thePlugins,
                editor:this,
                title: '��ѡ����',
                cssRules:"width:600px;height:400px;",
                buttons:[
                {
                    className:'edui-okbutton',
                    label:'ȷ��',
                    onclick:function () {
                        dialog.close(true);
                    }
                },
                {
                    className:'edui-cancelbutton',
                    label:'ȡ��',
                    onclick:function () {
                        dialog.close(false);
                    }
                }]
            });
            dialog.render();
            dialog.open();
        }
    };
    var popup = new baidu.editor.ui.Popup( {
        editor:this,
        content: '',
        className: 'edui-bubble',
        _edittext: function () {
              baidu.editor.plugins[thePlugins].editdom = popup.anchorEl;
              me.execCommand(thePlugins);
              this.hide();
        },
        _delete:function(){
            if( window.confirm('ȷ��ɾ���ÿؼ���') ) {
                baidu.editor.dom.domUtils.remove(this.anchorEl,false);
            }
            this.hide();
        }
    } );
    popup.render();
    me.addListener( 'mouseover', function( t, evt ) {
        evt = evt || window.event;
        var el = evt.target || evt.srcElement;
        var leipiPlugins = el.getAttribute('leipiplugins');
        if ( /span/ig.test( el.tagName ) && leipiPlugins==thePlugins) {
            var html = popup.formatHtml(
                '<nobr>��ѡ����: <span onclick=$$._edittext() class="edui-clickable">�༭</span>&nbsp;&nbsp;<span onclick=$$._delete() class="edui-clickable">ɾ��</span></nobr>' );
            if ( html ) {
                var elInput = el.getElementsByTagName("input");
                var rEl = elInput.length>0 ? elInput[0] : el;
                popup.getDom( 'content' ).innerHTML = html;
                popup.anchorEl = el;
                popup.showAnchor( rEl);
            } else {
                popup.hide();
            }
        }
    });
};
/**
 * �����ı���
 * @command textarea
 * @method execCommand
 * @param { String } cmd �����ַ���
 * @example
 * ```javascript
 * editor.execCommand( 'textarea');
 * ```
 */
UE.plugins['textarea'] = function () {
    var me = this,thePlugins = 'textarea';
    me.commands[thePlugins] = {
        execCommand:function () {
            var dialog = new UE.ui.Dialog({
                iframeUrl:this.options.UEDITOR_HOME_URL + UE.leipiFormDesignUrl+'/textarea.html',
                name:thePlugins,
                editor:this,
                title: '�����ı���',
                cssRules:"width:600px;height:330px;",
                buttons:[
                {
                    className:'edui-okbutton',
                    label:'ȷ��',
                    onclick:function () {
                        dialog.close(true);
                    }
                },
                {
                    className:'edui-cancelbutton',
                    label:'ȡ��',
                    onclick:function () {
                        dialog.close(false);
                    }
                }]
            });
            dialog.render();
            dialog.open();
        }
    };
    var popup = new baidu.editor.ui.Popup( {
        editor:this,
        content: '',
        className: 'edui-bubble',
        _edittext: function () {
              baidu.editor.plugins[thePlugins].editdom = popup.anchorEl;
              me.execCommand(thePlugins);
              this.hide();
        },
        _delete:function(){
            if( window.confirm('ȷ��ɾ���ÿؼ���') ) {
                baidu.editor.dom.domUtils.remove(this.anchorEl,false);
            }
            this.hide();
        }
    } );
    popup.render();
    me.addListener( 'mouseover', function( t, evt ) {
        evt = evt || window.event;
        var el = evt.target || evt.srcElement;
        if ( /textarea/ig.test( el.tagName ) ) {
            var html = popup.formatHtml(
                '<nobr>�����ı���: <span onclick=$$._edittext() class="edui-clickable">�༭</span>&nbsp;&nbsp;<span onclick=$$._delete() class="edui-clickable">ɾ��</span></nobr>' );
            if ( html ) {
                popup.getDom( 'content' ).innerHTML = html;
                popup.anchorEl = el;
                popup.showAnchor( popup.anchorEl );
            } else {
                popup.hide();
            }
        }
    });
};
/**
 * �����˵�
 * @command select
 * @method execCommand
 * @param { String } cmd �����ַ���
 * @example
 * ```javascript
 * editor.execCommand( 'select');
 * ```
 */
UE.plugins['select'] = function () {
    var me = this,thePlugins = 'select';
    me.commands[thePlugins] = {
        execCommand:function () {
            var dialog = new UE.ui.Dialog({
                iframeUrl:this.options.UEDITOR_HOME_URL + UE.leipiFormDesignUrl+'/select.html',
                name:thePlugins,
                editor:this,
                title: '�����˵�',
                cssRules:"width:590px;height:370px;",
                buttons:[
                {
                    className:'edui-okbutton',
                    label:'ȷ��',
                    onclick:function () {
                        dialog.close(true);
                    }
                },
                {
                    className:'edui-cancelbutton',
                    label:'ȡ��',
                    onclick:function () {
                        dialog.close(false);
                    }
                }]
            });
            dialog.render();
            dialog.open();
        }
    };
    var popup = new baidu.editor.ui.Popup( {
        editor:this,
        content: '',
        className: 'edui-bubble',
        _edittext: function () {
              baidu.editor.plugins[thePlugins].editdom = popup.anchorEl;
              me.execCommand(thePlugins);
              this.hide();
        },
        _delete:function(){
            if( window.confirm('ȷ��ɾ���ÿؼ���') ) {
                baidu.editor.dom.domUtils.remove(this.anchorEl,false);
            }
            this.hide();
        }
    } );
    popup.render();
    me.addListener( 'mouseover', function( t, evt ) {
        evt = evt || window.event;
        var el = evt.target || evt.srcElement;
        var leipiPlugins = el.getAttribute('leipiplugins');
        if ( /select|span/ig.test( el.tagName ) && leipiPlugins==thePlugins) {
            var html = popup.formatHtml(
                '<nobr>�����˵�: <span onclick=$$._edittext() class="edui-clickable">�༭</span>&nbsp;&nbsp;<span onclick=$$._delete() class="edui-clickable">ɾ��</span></nobr>' );
            if ( html ) {
                if(el.tagName=='SPAN')
                {
                    var elInput = el.getElementsByTagName("select");
                    el = elInput.length>0 ? elInput[0] : el;
                }
                popup.getDom( 'content' ).innerHTML = html;
                popup.anchorEl = el;
                popup.showAnchor( popup.anchorEl );
            } else {
                popup.hide();
            }
        }
    });

};
/**
 * ������
 * @command progressbar
 * @method execCommand
 * @param { String } cmd �����ַ���
 * @example
 * ```javascript
 * editor.execCommand( 'progressbar');
 * ```
 */
UE.plugins['progressbar'] = function () {
    var me = this,thePlugins = 'progressbar';
    me.commands[thePlugins] = {
        execCommand:function () {
            var dialog = new UE.ui.Dialog({
                iframeUrl:this.options.UEDITOR_HOME_URL + UE.leipiFormDesignUrl+'/progressbar.html',
                name:thePlugins,
                editor:this,
                title: '������',
                cssRules:"width:600px;height:450px;",
                buttons:[
                {
                    className:'edui-okbutton',
                    label:'ȷ��',
                    onclick:function () {
                        dialog.close(true);
                    }
                },
                {
                    className:'edui-cancelbutton',
                    label:'ȡ��',
                    onclick:function () {
                        dialog.close(false);
                    }
                }]
            });
            dialog.render();
            dialog.open();
        }
    };
    var popup = new baidu.editor.ui.Popup( {
        editor:this,
        content: '',
        className: 'edui-bubble',
        _edittext: function () {
              baidu.editor.plugins[thePlugins].editdom = popup.anchorEl;
              me.execCommand(thePlugins);
              this.hide();
        },
        _delete:function(){
            if( window.confirm('ȷ��ɾ���ÿؼ���') ) {
                baidu.editor.dom.domUtils.remove(this.anchorEl,false);
            }
            this.hide();
        }
    } );
    popup.render();
    me.addListener( 'mouseover', function( t, evt ) {
        evt = evt || window.event;
        var el = evt.target || evt.srcElement;
        var leipiPlugins = el.getAttribute('leipiplugins');
        if ( /img/ig.test( el.tagName ) && leipiPlugins==thePlugins) {
            var html = popup.formatHtml(
                '<nobr>������: <span onclick=$$._edittext() class="edui-clickable">�༭</span>&nbsp;&nbsp;<span onclick=$$._delete() class="edui-clickable">ɾ��</span></nobr>' );
            if ( html ) {
                popup.getDom( 'content' ).innerHTML = html;
                popup.anchorEl = el;
                popup.showAnchor( popup.anchorEl );
            } else {
                popup.hide();
            }
        }
    });
};
/**
 * ��ά��
 * @command qrcode
 * @method execCommand
 * @param { String } cmd �����ַ���
 * @example
 * ```javascript
 * editor.execCommand( 'qrcode');
 * ```
 */
UE.plugins['qrcode'] = function () {
    var me = this,thePlugins = 'qrcode';
    me.commands[thePlugins] = {
        execCommand:function () {
            var dialog = new UE.ui.Dialog({
                iframeUrl:this.options.UEDITOR_HOME_URL + UE.leipiFormDesignUrl+'/qrcode.html',
                name:thePlugins,
                editor:this,
                title: '��ά��',
                cssRules:"width:600px;height:370px;",
                buttons:[
                {
                    className:'edui-okbutton',
                    label:'ȷ��',
                    onclick:function () {
                        dialog.close(true);
                    }
                },
                {
                    className:'edui-cancelbutton',
                    label:'ȡ��',
                    onclick:function () {
                        dialog.close(false);
                    }
                }]
            });
            dialog.render();
            dialog.open();
        }
    };
    var popup = new baidu.editor.ui.Popup( {
        editor:this,
        content: '',
        className: 'edui-bubble',
        _edittext: function () {
              baidu.editor.plugins[thePlugins].editdom = popup.anchorEl;
              me.execCommand(thePlugins);
              this.hide();
        },
        _delete:function(){
            if( window.confirm('ȷ��ɾ���ÿؼ���') ) {
                baidu.editor.dom.domUtils.remove(this.anchorEl,false);
            }
            this.hide();
        }
    } );
    popup.render();
    me.addListener( 'mouseover', function( t, evt ) {
        evt = evt || window.event;
        var el = evt.target || evt.srcElement;
        var leipiPlugins = el.getAttribute('leipiplugins');
        if ( /img/ig.test( el.tagName ) && leipiPlugins==thePlugins) {
            var html = popup.formatHtml(
                '<nobr>��ά��: <span onclick=$$._edittext() class="edui-clickable">�༭</span>&nbsp;&nbsp;<span onclick=$$._delete() class="edui-clickable">ɾ��</span></nobr>' );
            if ( html ) {
                popup.getDom( 'content' ).innerHTML = html;
                popup.anchorEl = el;
                popup.showAnchor( popup.anchorEl );
            } else {
                popup.hide();
            }
        }
    });
};
/**
 * �б�ؼ�
 * @command listctrl
 * @method execCommand
 * @param { String } cmd �����ַ���
 * @example
 * ```javascript
 * editor.execCommand( 'qrcode');
 * ```
 */
UE.plugins['listctrl'] = function () {
    var me = this,thePlugins = 'listctrl';
    me.commands[thePlugins] = {
        execCommand:function () {
            var dialog = new UE.ui.Dialog({
                iframeUrl:this.options.UEDITOR_HOME_URL + UE.leipiFormDesignUrl+'/listctrl.html',
                name:thePlugins,
                editor:this,
                title: '�б�ؼ�',
                cssRules:"width:800px;height:400px;",
                buttons:[
                {
                    className:'edui-okbutton',
                    label:'ȷ��',
                    onclick:function () {
                        dialog.close(true);
                    }
                },
                {
                    className:'edui-cancelbutton',
                    label:'ȡ��',
                    onclick:function () {
                        dialog.close(false);
                    }
                }]
            });
            dialog.render();
            dialog.open();
        }
    };
    var popup = new baidu.editor.ui.Popup( {
        editor:this,
        content: '',
        className: 'edui-bubble',
        _edittext: function () {
              baidu.editor.plugins[thePlugins].editdom = popup.anchorEl;
              me.execCommand(thePlugins);
              this.hide();
        },
        _delete:function(){
            if( window.confirm('ȷ��ɾ���ÿؼ���') ) {
                baidu.editor.dom.domUtils.remove(this.anchorEl,false);
            }
            this.hide();
        }
    } );
    popup.render();
    me.addListener( 'mouseover', function( t, evt ) {
        evt = evt || window.event;
        var el = evt.target || evt.srcElement;
        var leipiPlugins = el.getAttribute('leipiplugins');
        if ( /input/ig.test( el.tagName ) && leipiPlugins==thePlugins) {
            var html = popup.formatHtml(
                '<nobr>�б�ؼ�: <span onclick=$$._edittext() class="edui-clickable">�༭</span>&nbsp;&nbsp;<span onclick=$$._delete() class="edui-clickable">ɾ��</span></nobr>' );
            if ( html ) {
                popup.getDom( 'content' ).innerHTML = html;
                popup.anchorEl = el;
                popup.showAnchor( popup.anchorEl );
            } else {
                popup.hide();
            }
        }
    });
};

UE.plugins['more'] = function () {
    var me = this,thePlugins = 'more';
    me.commands[thePlugins] = {
        execCommand:function () {
            var dialog = new UE.ui.Dialog({
                iframeUrl:this.options.UEDITOR_HOME_URL + UE.leipiFormDesignUrl+'/more.html',
                name:thePlugins,
                editor:this,
                title: '��ת���������һ����룬��������',
                cssRules:"width:600px;height:200px;",
                buttons:[
                {
                    className:'edui-okbutton',
                    label:'ȷ��',
                    onclick:function () {
                        dialog.close(true);
                    }
                }]
            });
            dialog.render();
            dialog.open();
        }
    };
};
UE.plugins['error'] = function () {
    var me = this,thePlugins = 'error';
    me.commands[thePlugins] = {
        execCommand:function () {
            var dialog = new UE.ui.Dialog({
                iframeUrl:this.options.UEDITOR_HOME_URL + UE.leipiFormDesignUrl+'/error.html',
                name:thePlugins,
                editor:this,
                title: '�쳣��ʾ',
                cssRules:"width:400px;height:130px;",
                buttons:[
                {
                    className:'edui-okbutton',
                    label:'ȷ��',
                    onclick:function () {
                        dialog.close(true);
                    }
                }]
            });
            dialog.render();
            dialog.open();
        }
    };
};
UE.plugins['leipi'] = function () {
    var me = this,thePlugins = 'leipi';
    me.commands[thePlugins] = {
        execCommand:function () {
            var dialog = new UE.ui.Dialog({
                iframeUrl:this.options.UEDITOR_HOME_URL + UE.leipiFormDesignUrl+'/leipi.html',
                name:thePlugins,
                editor:this,
                title: '������� - �嵥',
                cssRules:"width:620px;height:220px;",
                buttons:[
                {
                    className:'edui-okbutton',
                    label:'ȷ��',
                    onclick:function () {
                        dialog.close(true);
                    }
                }]
            });
            dialog.render();
            dialog.open();
        }
    };
};
UE.plugins['leipi_template'] = function () {
    var me = this,thePlugins = 'leipi_template';
    me.commands[thePlugins] = {
        execCommand:function () {
            var dialog = new UE.ui.Dialog({
                iframeUrl:this.options.UEDITOR_HOME_URL + UE.leipiFormDesignUrl+'/template.html',
                name:thePlugins,
                editor:this,
                title: '��ģ��',
                cssRules:"width:640px;height:380px;",
                buttons:[
                {
                    className:'edui-okbutton',
                    label:'ȷ��',
                    onclick:function () {
                        dialog.close(true);
                    }
                }]
            });
            dialog.render();
            dialog.open();
        }
    };
};

UE.registerUI('button_leipi',function(editor,uiName){
    if(!this.options.toolleipi)
    {
        return false;
    }
    //ע�ᰴťִ��ʱ��command���ʹ������Ĭ�Ͼͻ���л��˲���
    editor.registerCommand(uiName,{
        execCommand:function(){
            editor.execCommand('leipi');
        }
    });
    //����һ��button
    var btn = new UE.ui.Button({
        //��ť������
        name:uiName,
        //��ʾ
        title:"�������",
        //��Ҫ��ӵĶ�����ʽ��ָ��iconͼ�꣬����Ĭ��ʹ��һ���ظ���icon
        cssRules :'background-position: -401px -40px;',
        //���ʱִ�е�����
        onclick:function () {
            //������Բ���ִ������,�����Լ��Ĳ���Ҳ��
           editor.execCommand(uiName);
        }
    });
/*
    //���㵽�༭������ʱ����ťҪ����״̬����
    editor.addListener('selectionchange', function () {
        var state = editor.queryCommandState(uiName);
        if (state == -1) {
            btn.setDisabled(true);
            btn.setChecked(false);
        } else {
            btn.setDisabled(false);
            btn.setChecked(state);
        }
    });
*/
    //��Ϊ�������button,������Ҫ�������button
    return btn;
});
UE.registerUI('button_template',function(editor,uiName){
    if(!this.options.toolleipi)
    {
        return false;
    }
    //ע�ᰴťִ��ʱ��command���ʹ������Ĭ�Ͼͻ���л��˲���
    editor.registerCommand(uiName,{
        execCommand:function(){
            try {
                leipiFormDesign.exec('leipi_template');
                //leipiFormDesign.fnCheckForm('save');
            } catch ( e ) {
                alert('��ģ���쳣');
            }
            
        }
    });
    //����һ��button
    var btn = new UE.ui.Button({
        //��ť������
        name:uiName,
        //��ʾ
        title:"��ģ��",
        //��Ҫ��ӵĶ�����ʽ��ָ��iconͼ�꣬����Ĭ��ʹ��һ���ظ���icon
        cssRules :'background-position: -339px -40px;',
        //���ʱִ�е�����
        onclick:function () {
            //������Բ���ִ������,�����Լ��Ĳ���Ҳ��
           editor.execCommand(uiName);
        }
    });

    //��Ϊ�������button,������Ҫ�������button
    return btn;
});
UE.registerUI('button_preview',function(editor,uiName){
    if(!this.options.toolleipi)
    {
        return false;
    }
    //ע�ᰴťִ��ʱ��command���ʹ������Ĭ�Ͼͻ���л��˲���
    editor.registerCommand(uiName,{
        execCommand:function(){
            try {
                leipiFormDesign.fnReview();
            } catch ( e ) {
                alert('leipiFormDesign.fnReview Ԥ���쳣');
            }
        }
    });
    //����һ��button
    var btn = new UE.ui.Button({
        //��ť������
        name:uiName,
        //��ʾ
        title:"Ԥ��",
        //��Ҫ��ӵĶ�����ʽ��ָ��iconͼ�꣬����Ĭ��ʹ��һ���ظ���icon
        cssRules :'background-position: -420px -19px;',
        //���ʱִ�е�����
        onclick:function () {
            //������Բ���ִ������,�����Լ��Ĳ���Ҳ��
           editor.execCommand(uiName);
        }
    });

    //��Ϊ�������button,������Ҫ�������button
    return btn;
});

UE.registerUI('button_save',function(editor,uiName){
    if(!this.options.toolleipi)
    {
        return false;
    }
    //ע�ᰴťִ��ʱ��command���ʹ������Ĭ�Ͼͻ���л��˲���
    editor.registerCommand(uiName,{
        execCommand:function(){
            try {
                leipiFormDesign.fnCheckForm('save');
            } catch ( e ) {
                alert('leipiFormDesign.fnCheckForm("save") �����쳣');
            }
            
        }
    });
    //����һ��button
    var btn = new UE.ui.Button({
        //��ť������
        name:uiName,
        //��ʾ
        title:"�����",
        //��Ҫ��ӵĶ�����ʽ��ָ��iconͼ�꣬����Ĭ��ʹ��һ���ظ���icon
        cssRules :'background-position: -481px -20px;',
        //���ʱִ�е�����
        onclick:function () {
            //������Բ���ִ������,�����Լ��Ĳ���Ҳ��
           editor.execCommand(uiName);
        }
    });

    //��Ϊ�������button,������Ҫ�������button
    return btn;
});
