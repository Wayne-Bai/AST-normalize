'use strict';
RIAPP.Application.registerModule('common', function (app) {
    var thisModule = this, global = app.global, utils = global.utils, consts = global.consts, TEXT = RIAPP.localizable.TEXT;

    var NotConverter = app.getConverter('BaseConverter').extend({
        convertToSource:function (val, param, dataContext) {
            return !val;
        },
        convertToTarget:function (val, param, dataContext) {
            return !val;
        }
    }, null, function (obj) {
        app.registerConverter('notConverter', obj);
    });

    var DialogVM = thisModule.DialogVM =  app.getType('BaseViewModel').extend(
        {
            //constructor function
            _create:function () {
                this._super();
                this._dialogs = {};
            },
            createDialog:function (name, options) {
                var self = this, editorOptions = utils.extend(false,{
                    dataContext: null,
                    dbContext: null,
                    templateID:null,
                    width: 500,
                    height: 350,
                    title:'data edit dialog',
                    submitOnOK: false,
                    fn_OnClose: null,
                    fn_OnOK: null,
                    fn_OnCancel: null,
                    fn_OnTemplateCreated: null,
                    fn_OnShow: null
                },options);
                var dialog = app.getType('DataEditDialog').create(editorOptions);
                this._dialogs[name] = dialog;
                return dialog;
            },
            showDialog:function (name, dataContext) {
                var dialog = this.getDialog(name);
                if(!dialog)
                    return null;
                dialog.dataContext = dataContext;
                dialog.show();
                return dialog;
            },
            getDialog:function (name) {
                return this._dialogs[name];
            },
            destroy:function () {
                var keys = Object.keys(this._dialogs);
                keys.forEach(function(key){
                    this._dialogs[key].destroy();
                },this);
                this._dialogs={};
                this._super();
            }
        },
        {},
        function (obj) {
            app.registerType('custom.DialogVM', obj);
        }
    );

    var DownloadLinkElView = app.getType('BaseElView').extend({
            _init:function (options) {
                this._super(options);
                this._baseUri = '';
                if (!!options.baseUri)
                    this._baseUri = options.baseUri;
                this._id ='';
            }
        },
        {
            text:{
                set:function (v) {
                    if (!this._el)
                        return;
                    var $el = this.$el;
                    var x = $el.text();
                    if (v === null)
                        v = '';
                    else
                        v = '' + v;
                    if (x !== v) {
                        $el.text(v);
                        this.raisePropertyChanged('text');
                    }
                },
                get:function () {
                    if (!this._el)
                        return;
                    return this.$el.text();
                }
            },
            href:{
                set:function (v) {
                    if (!this._el)
                        return;
                    var el = this._el;
                    var x = el.href;
                    if (v === null)
                        v = '';
                    else
                        v = '' + v;
                    if (x !== v) {
                        el.href = v;
                        this.raisePropertyChanged('href');
                    }
                },
                get:function () {
                    if (!this._el)
                        return;
                    return this._el.href;
                }
            },
            id:{
                set:function (v) {
                    var x = this._id;
                    if (v === null)
                        v = '';
                    else
                        v = '' + v;
                    if (x !== v) {
                        this._id = v;
                        this.href = this._baseUri +'/'+ this._id;
                        this.raisePropertyChanged('id');
                    }
                },
                get:function () {
                    return this._id;
                }
            }
        }, function (obj) {
            app.registerType('DownloadLinkElView', obj);
            app.registerElView('fileLink', obj);
        });


    var FileImgElView = app.getType('BaseElView').extend({
            _init:function (options) {
                this._super(options);
                this._baseUri = '';
                if (!!options.baseUri)
                    this._baseUri = options.baseUri;
                this._id ='';
                this._fileName = null;
            },
            reloadImg: function () {
                if (!this._el)
                    return;
                var src = this.src;
                var pos = src.indexOf('?');
                if (pos >= 0) {
                    src = src.substr(0, pos);
                }
                var date = new Date();
                this.src = src + '?v=' + date.getTime();
                return false;
            }
        },
        {
            fileName:{
                set:function (v) {
                    var x = this._fileName;
                    if (x !== v) {
                        this._fileName = v;
                        this.raisePropertyChanged('fileName');
                        this.reloadImg();
                    }
                },
                get:function () {
                    return this._fileName;
                }
            },
            src:{
                set:function (v) {
                    if (!this._el)
                        return;
                    var el = this._el;
                    var x = el.getAttribute('src');
                    if (v === null)
                        v = '';
                    else
                        v = '' + v;
                    if (x !== v) {
                        el.src = v;
                        this.raisePropertyChanged('src');
                    }
                },
                get:function () {
                    if (!this._el)
                        return;
                    return this._el.getAttribute('src')
                }
            },
            id:{
                set:function (v) {
                    var x = this._id;
                    if (v === null)
                        v = '';
                    else
                        v = '' + v;
                    if (x !== v) {
                        this._id = v;
                        if (!this._id)
                            this.src = null;
                        else
                            this.src = this._baseUri +'/'+ this._id;
                        this.raisePropertyChanged('id');
                    }
                },
                get:function () {
                    return this._id;
                }
            }
        }, function (obj) {
            app.registerType('custom.ImgElView', obj);
            app.registerElView('fileImage', obj);
        });

    var ErrorViewModel = thisModule.ErrorViewModel =  app.getType('BaseViewModel').extend({
            _create: function () {
                this._super();
                var self = this;
                this._error = null;
                this._message = null;
                this._title = '';
                this._dialogVM = DialogVM.create();
                var dialogOptions = {
                    templateID:'errorTemplate',
                    width: 500,
                    height: 300,
                    title:'',
                    canCancel: false,
                    fn_OnShow: function(dialog){
                        while (!!self.error && !!self.error.origError){
                            //get real error
                            self._error = self.error.origError;
                            self.raisePropertyChanged('error');
                        }

                        if (app.getType('AccessDeniedError').isPrototypeOf(self.error))
                            self.title = "ACCESS DENIED";
                        else if (app.getType('ConcurrencyError').isPrototypeOf(self.error))
                            self.title = "CONCURRENCY ERROR";
                        else if (app.getType('ValidationError').isPrototypeOf(self.error))
                            self.title = "VALIDATION ERROR";
                        else if (app.getType('SvcValidationError').isPrototypeOf(self.error))
                            self.title = "VALIDATION ERROR";
                        else if (app.getType('DataOperationError').isPrototypeOf(self.error))
                            self.title = "DATA OPERATION ERROR";
                        else
                            self.title = "UNEXPECTED ERROR";

                        self.message = (!self.error.message)?(''+self.error):self.error.message;
                        dialog.title = self.title;
                    },
                    fn_OnClose: function(dialog){
                       self._error = null;
                       self.raisePropertyChanged('error');
                    }
                };
                //dialogs are distinguished by their given names
                this._dialogVM.createDialog('errorDialog', dialogOptions);
            },
            showDialog: function(){
                this._dialogVM.showDialog('errorDialog',this);
            },
            destroy:function () {
                if (this._isDestroyed)
                    return;
                this._dialogVM.destroy();
                this._dialogVM = null;
                this._error = null;
                this._super();
            }
        },
        {
            error:{
                set:function (v) {
                    var old = this._error;
                    if (!!old) {
                        global._onError(v,null);
                        global._throwDummy(v);
                    }
                    this._error = v;
                    this.raisePropertyChanged('error');
                },
                get:function () {
                    return this._error;
                }
            },
            title:{
                set:function (v) {
                    var old =  this._title;
                    if (old !== v) {
                        this._title = v;
                        this.raisePropertyChanged('title');
                    }
                },
                get:function () {
                    return this._title;
                }
            },
            message:{
                set:function (v) {
                    var old =  this._message;
                    if (old !== v) {
                        this._message = v;
                        this.raisePropertyChanged('message');
                    }
                },
                get:function () {
                    return this._message;
                }
            }
        },
        function (obj) {
            app.registerType('custom.ErrorViewModel', obj);
        });
});