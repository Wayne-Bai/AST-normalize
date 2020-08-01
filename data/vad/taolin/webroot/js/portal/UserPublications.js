/**
 * This file is part of taolin project (http://taolin.fbk.eu)
 * Copyright (C) 2008, 2009 FBK Foundation, (http://www.fbk.eu)
 * Authors: SoNet Group (see AUTHORS.txt)
 *
 * Taolin is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation version 3 of the License.
 *
 * Taolin is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Taolin. If not, see <http://www.gnu.org/licenses/>.
 *
 */

/**
  * Ext.ux.fbk.sonet.UserPublications
  *
  * @author  Marco Frassoni and Davide Setti
  * @class Ext.ux.fbk.sonet.UserPublications
  * #@extends Ext.Panel
  * Shows a user's publications
  *
  */

Ext.namespace( 'Ext.ux.fbk.sonet' );

Ext.ux.fbk.sonet.UserPublications = Ext.extend(Ext.Panel, {
    title: 'Papers'
    ,autoHeight: true
    ,preventBodyReset: true
    ,initComponent: function(){
        Ext.apply(this, this.initialConfig);

        this.store = new Ext.data.JsonStore({
            proxy : new Ext.data.HttpProxy({
                method: 'GET',
                url: 'fbk/publiks/listpubsbylogin'
            }),
            root: 'pubs',
            fields: ['ID_PRODOTTO', 'TITOLO', 'TITOLO_UFFICIALE', 'TITOLO_LIBRO', 'AUTORE_LIBRO', 'STRINGA_AUTORI', 'ANNO', 'MESE', 'NUM_AUTORI', 'COGNOME_AUTORE', 'NOME_AUTORE', 'NUM_PAGINE', 'PAG_INIZIO', 'PAG_FINE', 'TITOLO_CONVEGNO', 'PERIODO_CONVEGNO', 'VOLUME']
            ,listeners: {
                beforeload: function(){
                    if (!this.parent.rendered) return;
                    var su = westPanel.showedUser
                        ,user_id = su.id
                        ,user_name = su.name
                        ,user_surname = su.surname
                        ,user_email = get(su, 'email', su.login+'@fbk');
                    
                    var emptytext = '<div style="padding:10px 5px;font-size:100%"><div class="warning-msg border_radius_5px">No publications for this user</div><br />You might <span class="a" onclick="new SendToWindow(\'I would like to suggest you to add your publications to FBK publik repository at http://researchassessment.fbk.eu/publications\', \[\[\''+user_email+'\',\''+user_name+' '+user_surname+'\'\]\],  {source: \'user profile publik tab\',user_id:'+user_id+'})">suggest '+user_name+' to add publications</span> using FBK publik repository.<br /><br /><br />But did you remember to add your publications at the website <a href="http://researchassessment.fbk.eu/publications" target="_blank" />http://researchassessment.fbk.eu/publications</a> ?</div>';

                    this.parent.items.first().emptyText = emptytext;
                }
                ,load: function(){
                    this.parent.setTitle(
                        this.parent.prevTitle+' ('+this.totalLength+')'
                    );
                }
            }
            ,parent: this
        });

        Ext.ux.fbk.sonet.UserPublications.superclass.initComponent.apply(this, arguments);
                 
        //save title to use it later (on load)
        this.prevTitle = this.title;
    }
    ,onRender: function(){
        var tpl = new Ext.XTemplate( 
            '<div style="font-size:100%">',
                '<ol start="1">',
                '<tpl for=".">',
                    // Lists found publications. Eac publik has a link to FBK paper repository
                    '<li>',
                        '<div class="publik-wrapper">',
                            '<div class="stringa_autori">{STRINGA_AUTORI}, </div>',
                            '<div class="pub_titolo">{TITOLO}</div>',
                            '<tpl if="TITOLO_UFFICIALE"><div class="pub_data">, in «{TITOLO_UFFICIALE}»</div></tpl>',
                            '<tpl if="TITOLO_LIBRO && AUTORE_LIBRO"><div class="pub_data">, in {AUTORE_LIBRO}, {TITOLO_LIBRO}</div></tpl>',
                            '<tpl if="VOLUME"><div class="pub_data">, vol. {VOLUME}</div></tpl>',
                            '<tpl if="ANNO"><div class="pub_data">, {ANNO}</div></tpl>',
                            '<tpl if="PAG_INIZIO && PAG_FINE"><div class="pub_pagine">, pp {PAG_INIZIO}-{PAG_FINE}</div></tpl>',
                            '<tpl if="TITOLO_CONVEGNO"><div class="pub_data"> ({TITOLO_CONVEGNO}',
                                '<tpl if="PERIODO_CONVEGNO"><div class="pub_data"> {PERIODO_CONVEGNO}</div></tpl>',
                            ')</div></tpl>',
                        '</div>',
                    '</li>',
                '</tpl>',
                '</ol>',
            '</div>'
            ,{
                months: new Array("January","February","March","April","May","June","July","August","September","October","November","December")
                ,pdate: function(m, y){
                    var month = get(this.months, m, '');
                    return month + ' ' + y;
                }
            }
        );
        tpl.compile();

        var dv = new Ext.DataView({
            tpl: tpl,
            store: this.store,
            itemSelector: 'div.publik-wrapper',
            deferEmptyText:false
        });

        this.add(dv);
        
        this.store.load({
            params: {
                u_id: westPanel.showedUser.id
                //,login: westPanel.showedUser.login
            }
        });

        Ext.ux.fbk.sonet.UserPublications.superclass.onRender.apply(
            this, arguments
        );
    }
});

Ext.reg('userpublications', Ext.ux.fbk.sonet.UserPublications);
