/*!
* Copyright 2010 - 2013 Pentaho Corporation.  All rights reserved.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*/

define(["dojo/_base/declare", 'dijit/_WidgetBase','dijit/_TemplatedMixin', "dojo/text!pentaho/common/ToggleButton.html"], function(declare, _WidgetBase, _TemplatedMixin, templateStr){
    return declare("pentaho.common.ToggleButton", [_WidgetBase, _TemplatedMixin], {
        
        title: '',
        
        label: 'button',
        
        width: '80px',
        
        templateString: templateStr,

        checked: false,
        
        hover: false,
        
        disabled: false,

        // override this to get the onchange event
        onChange: null,
        
        set: function(property, value) {
            if(property == 'label') {
                this.innerNode.innerHTML = value;
            }
            else if(property == 'checked') {
                this._setChecked(value);
            }
            else if(property == 'disabled') {
                this._setDisabled(value);
            }
        },
        
        _setChecked: function(checked) {
            this.checked = checked;
            if(this.hover) {
                this._onHover();
            }
        },
        
        _setDisabled: function(disabled) {
            this.disabled = disabled;
            if(this.disabled) {
                if(this.checked) {
                    this.outerNode.className='pentaho-toggle-button pentaho-toggle-button-down pentaho-toggle-button-down-disabled'
                } else {
                    this.outerNode.className='pentaho-toggle-button pentaho-toggle-button-up pentaho-toggle-button-up-disabled'
                }
            } else {
                if(this.hover) {
                    this._onHover();
                } else {
                    this._onUnhover();
                }
            }
        },
        
        _onHover: function() {
            this.hover = true;
            if(this.disabled) {
                return;
            }
            if(this.checked) {
                this.outerNode.className='pentaho-toggle-button pentaho-toggle-button-down pentaho-toggle-button-down-hovering'
            } else {
                this.outerNode.className='pentaho-toggle-button pentaho-toggle-button-up pentaho-toggle-button-up-hovering'
            }
        },
        
        _onUnhover: function() {
            this.hover = false;
            if(this.disabled) {
                return;
            }
            if(this.checked) {
                this.outerNode.className='pentaho-toggle-button pentaho-toggle-button-down';
            } else {
                this.outerNode.className='pentaho-toggle-button pentaho-toggle-button-up';
            }
        },
        
        _onClick: function() {
            if(this.disabled) {
              return;
            }
            this._setChecked(!this.checked);
            if(this.onChange) {
                this.onChange(this.checked);
            }
        }
        
    })
});

