'use strict';
RIAPP.Application.registerModule('gridDemo', function (app) {
    var thisModule = this, global = app.global, utils = global.utils, consts = global.consts;

    //private helper function (used inside this module only)
    var addTextQuery = thisModule.addTextQuery = function(query, fldName, val){
        var tmp;
        if (!!val){
            if (utils.str.startsWith(val,'%') && utils.str.endsWith(val,'%')){
                tmp = utils.str.trim(val,'% ');
                query.where(fldName, 'contains', [tmp])
            }
            else if (utils.str.startsWith(val,'%')){
                tmp = utils.str.trim(val,'% ');
                query.where(fldName, 'endswith', [tmp])
            }
            else if (utils.str.endsWith(val,'%')){
                tmp = utils.str.trim(val,'% ');
                query.where(fldName, 'startswith', [tmp])
            }
            else {
                tmp = utils.str.trim(val);
                query.where(fldName, '=', [tmp])
            }
        }
        return query;
    };

    //no need to register type in the application because we create an instance of it in this module only
    var ProductsFilter = RIAPP.BaseObject.extend({
            _create: function () {
                this._super();
                var self = this;
                this._prodNumber = null;
                this._name = null;
                this._parentCategoryID = null;
                this._childCategoryID = null;
                this._selectedCategory = null;
                this._selectedModel = null;
                this._modelID = null;
                //filters top level product categories
                this._parentCategories = app.getType('DataView').create(
                    {
                        dataSource: this.dbSets.ProductCategory,
                        fn_sort: function(a,b){return a.ProductCategoryID - b.ProductCategoryID;},
                        fn_filter: function(item){return item.ParentProductCategoryID == null;}
                    });

                //filters product categories which have parent category
                this._childCategories = app.getType('DataView').create(
                    {
                        dataSource: this.dbSets.ProductCategory,
                        fn_sort: function(a,b){return a.ProductCategoryID - b.ProductCategoryID;},
                        fn_filter: function(item){return item.ParentProductCategoryID !== null && item.ParentProductCategoryID == self.parentCategoryID;}
                    });

                this._resetCommand = app.getType('Command').create(function (sender, data) {
                    self.reset();
                }, self, null);
            },
            //returns promise
            _loadCategories: function () {
                var query = this.dbSets.ProductCategory.createQuery('ReadProductCategory');
                query.orderBy('Name', 'ASC');
                //returns promise
                return app.dbContext.load(query);
            },
            //returns promise
            _loadProductModels: function () {
                var query = this.dbSets.ProductModel.createQuery('ReadProductModel');
                query.orderBy('Name', 'ASC');
                //returns promise
                return app.dbContext.load(query);
            },
            //returns promise
            load: function(){
                //load two dbsets simultanously
                var promise1 = this._loadCategories(), promise2 = this._loadProductModels();
                return global.$.when(promise1, promise2);
            },
            reset: function(){
                 this.parentCategoryID= null;
                 this.childCategoryID = null;
                 this.prodNumber = null;
                 this.name = null;
                 this.modelID = null;
                 this.selectedModel = null;
                 this.selectedCategory = null;
            }
      },
        {
            prodNumber: {
                get: function () {
                    return this._prodNumber;
                },
                set: function (v) {
                    if (this._prodNumber != v){
                        this._prodNumber = v;
                        this.raisePropertyChanged('prodNumber');
                    }
                }
            },
            name: {
                get: function () {
                    return this._name;
                },
                set: function (v) {
                    if (this._name != v){
                        this._name = v;
                        this.raisePropertyChanged('name');
                    }
                }
            },
            parentCategoryID: {
                get: function () {
                    return this._parentCategoryID;
                },
                set: function (v) {
                    if (this._parentCategoryID != v){
                        this._parentCategoryID = v;
                        this.raisePropertyChanged('parentCategoryID');
                        this._childCategories.refresh();
                    }
                }
            },
            childCategoryID: {
                get: function () {
                    return this._childCategoryID;
                },
                set: function (v) {
                    if (this._childCategoryID != v){
                        this._childCategoryID = v;
                        this.raisePropertyChanged('childCategoryID');
                    }
                }
            },
            modelID: {
                get: function () {
                    return this._modelID;
                },
                set: function (v) {
                    if (this._modelID != v){
                        this._modelID = v;
                        this.raisePropertyChanged('modelID');
                    }
                }
            },
            dbSets: {
                get: function () {
                    return app.dbContext.dbSets;
                }
            },
            ParentCategories: {
                get: function () {
                    return this._parentCategories;
                }
            },
            ChildCategories: {
                get: function () {
                    return this._childCategories;
                }
            },
            ProductModels: {
                get: function () {
                    return this.dbSets.ProductModel;
                }
            },
            resetCommand:{
                get:function () {
                    return this._resetCommand;
                }
            },
            searchTextToolTip: {
                get:function () {
                    return "Use placeholder <span style='font-size: larger'><b>%</b></span><br/> for searching by part of the value";
                }
            },
            selectedCategory: {
                get: function () {
                    return this._selectedCategory;
                },
                set: function (v) {
                    if (this._selectedCategory != v){
                        this._selectedCategory = v;
                        this.raisePropertyChanged('selectedCategory');
                    }
                }
            },
            selectedModel: {
                get: function () {
                    return this._selectedModel;
                },
                set: function (v) {
                    if (this._selectedModel != v){
                        this._selectedModel = v;
                        this.raisePropertyChanged('selectedModel');
                    }
                }
            },
            //used to set lookup prodec models data embedded as json on the page (see demo page)
            modelData: {
                set: function (v) {
                    this.dbSets.ProductModel.fillItems(v,true);
                }
            },
            //used to set lookup product categories data embedded as json on the page (see demo page)
            categoryData: {
                set: function (v) {
                    this.dbSets.ProductCategory.fillItems(v,true);
                }
            }
        }, null );

    var ProductViewModel = thisModule.ProductViewModel = app.getType('BaseViewModel').extend({
            _create: function () {
                this._super();
                var self = this;
                this._filter = ProductsFilter.create();
                this._dbSet = this.dbSets.Product;
                this._dataGrid = null;
                this._propWatcher = app.getType('PropWatcher').create();
                this._selected ={};
                this._selectedCount =0;
                this._invokeResult = null;
                this._templateID = 'productEditTemplate';

                //when currentItem property changes, invoke our viewmodel's method
                this._dbSet.addOnPropertyChange('currentItem', function (sender, data) {
                    self._onCurrentChanged();
                }, self.uniqueID);

                //if we need to confirm the deletion, this is how it is done
                this._dbSet.addHandler('item_deleting', function (sender, args) {
                    if (!confirm('Are you sure that you want to delete ' + args.item.Name + ' ?'))
                        args.isCancel = true;
                }, self.uniqueID);

                //the end edit event- the entity potentially changed its data. we can recheck conditions based on
                //entities data here
                this._dbSet.addHandler('end_edit', function (sender, args) {
                    if (!args.isCanceled){
                        //at the end of the editing, let the command will check: can it be executed?
                        self._testInvokeCommand.raiseCanExecuteChanged();
                    }
                }, self.uniqueID);

                this._dbSet.isSubmitOnDelete = true; //auto submit changes when entity is deleted

                /*
                 //this is the same as setting on DbSet isSubmitOnDelete property to true only more verbose
                 //entity changed status (for example it got deleted)
                 this._dbSet.addHandler('status_changed', function (sender, args) {
                 if (args.item._isDeleted){
                        self.dbContext.submitChanges();
                     }
                 }, self.uniqueID);
               */

                this._dbSet.addHandler('fill', function (s, a) {
                    //when fill is ended
                    if (!a.isBegin){
                        if (!a.isPageChanged) //clear products selection when the dbSet is refilled (but not when page is changed)
                            self._clearSelection();
                    }
                }, self.uniqueID);

                //example of using custom validation on client (in addition to builtin validation)
                this._dbSet.addHandler('validate', function (sender, args) {
                    if (!args.fieldName){ //full item validation
                       if (!!args.item.SellEndDate){ //check it must be after Start Date
                           if (args.item.SellEndDate < args.item.SellStartDate){
                               args.errors.push('End Date must be after Start Date');
                           }
                       }
                    }
                    else //validation of field value
                    {
                         if (args.fieldName == "Weight"){
                              if (args.item[args.fieldName] > 20000){
                                  args.errors.push('Weight must be less than 20000');
                              }
                         }
                    }
                }, self.uniqueID);

                // example of getting notifications in viewmodel on tabs events
                this._tabsEventCommand = app.getType('Command').create(function (sender, param) {
                    var index = param.args.index, tab = param.args.tab, panel = param.args.panel;
                    //alert('event: '+ param.eventName + ' was triggered on tab: '+index);
                }, self, null);

                //adds new product - uses dialog to enter the data
                this._addNewCommand = app.getType('Command').create(function (sender, param) {
                    //grid will show edit dialog, because we set grid options isHandleAddNew:true
                    //see options for the grid on the demo page
                     var item =  self._dbSet.addNew();
                    //P.S. - grids editor options also has submitOnOK:true, which means
                    //on clicking OK button all changes are submitted to the service
                }, self,
                 function (sender, param) {
                    return true;
                });

                //loads data from the server for the products
                this._loadCommand = app.getType('Command').create(function (sender, data) {
                    self.load();
                }, self, null);


                //example of getting instance of databounded dataGrid by using elView's propChangedCommand
                //we can name this command just how we like it (here i named it propChangeCommand)
                //look at the datagrid's databinding on the demo page
                this._propChangeCommand =  app.getType('Command').create(function (sender, data) {
                    if (data.property=='*' || data.property=='grid'){
                        if (self._dataGrid === sender.grid)
                            return;
                        self._dataGrid = sender.grid;
                    }
                    //example of binding to dataGrid events
                    if (!!self._dataGrid){
                        self._dataGrid.addHandler('page_changed', function(s,a){
                            self._onGridPageChanged();
                        }, self.uniqueID);
                        self._dataGrid.addHandler('row_selected', function(s,a){
                            self._onGridRowSelected(a.row);
                        }, self.uniqueID);
                        self._dataGrid.addHandler('row_expanded', function(s,a){
                            self._onGridRowExpanded(a.old_expandedRow, a.expandedRow, a.isExpanded);
                        }, self.uniqueID);
                        self._dataGrid.addHandler('row_state_changed', function(s,a){
                            if (!a.val){
                                a.css = 'rowInactive';
                            }
                        }, self.uniqueID);
                    }
                }, self, null);

                //example of using method invocation on the service
                //invokes test service method with parameters and displays result with alert
                this._testInvokeCommand = app.getType('Command').create(function (sender, param) {
                    self.invokeResult = null;
                    var promise = self.app.dbContext.serviceMethods.TestInvoke({ param1: [10, 11, 12, 13, 14], param2: param.Name });
                    promise.done(function(res) {
                       self.invokeResult = res;
                       self._dialogVM.showDialog('testDialog',self);
                    });

                    promise.fail(function() {
                        //do somthing on fail if you need
                        //but error display message is automatically shown
                    });
                }, self, function (sender, param) {
                    //just for test: this command can be executed only when this condition is true!
                    return self.currentItem !== null;
                });

                //the property watcher helps us handling properties changes
                //more convenient than using addOnPropertyChange
                this._propWatcher.addWatch(self,['currentItem'],function(s,a){
                    self._testInvokeCommand.raiseCanExecuteChanged();
                });

                this._dialogVM = app.getType('custom.DialogVM').create();
                var dialogOptions = {
                    templateID:'invokeResultTemplate',
                    width: 600,
                    height: 250,
                    canCancel: false, //no cancel button
                    title:'Result of a service method invocation',
                    fn_OnClose: function(dialog){
                        self.invokeResult = null;
                    }
                };
                this._dialogVM.createDialog('testDialog', dialogOptions);
            },
            _onGridPageChanged: function(){
                //when moving to any page, select rows which was previously selected on that page (restore selection)
                var self = this, keys = self.selectedIDs, grid = self._dataGrid;
                keys.forEach(function(key){
                    var item = self.dbSet.getItemByKey(key), row;
                    if (!!item){
                        row = grid.findRowByItem(item);
                        if (!!row)
                            row.isSelected = true;
                    }
                });
            },
            _onGridRowSelected: function(row){
                this._productSelected(row.item,row.isSelected);
            },
            _onGridRowExpanded: function(oldRow, row, isExpanded){
                //just for example
                //we could retrieve additional data from the server when grid's row is expanded
            },
            _onCurrentChanged: function () {
                this.raisePropertyChanged('currentItem');
            },
            _clearSelection: function(){
                //clear all selection
                this._selected ={};
                this.selectedCount =0;
            },
            //when product is selected (unselected) by user in the grid (clicking checkboxes)
            //we store the entities keys in the map (it survives going to another page and return back)
            _productSelected: function(item, isSelected){
                if (!item)
                    return;
                if (isSelected){
                    if (!this._selected[item._key]){
                        this._selected[item._key] = item;
                        this.selectedCount +=1;
                    }
                }
                else{
                    if (!!this._selected[item._key]){
                        delete this._selected[item._key];
                        this.selectedCount -=1;
                    }
                }
            },
            //returns promise
            load: function () {
                //you can create several methods on the service which return the same entity type
                //but they must have different names (no overloads)
                //the query'service method can accept additional parameters which you can supply with query
                var query = this.dbSet.createQuery('ReadProduct');
                query.pageSize = 50;
                query.loadPageCount = 20; //load 20 pages at once (only one will be visible, others will be in local cache)
                query.isClearCacheOnEveryLoad = true; //clear local cache when a new batch of data is loaded from the server
                addTextQuery(query,'ProductNumber',this._filter.prodNumber);
                addTextQuery(query,'Name',this._filter.name);
                if (!utils.check_is.nt(this._filter.childCategoryID)){
                   query.where('ProductCategoryID', '=', [this._filter.childCategoryID]);
                }
                if (!utils.check_is.nt(this._filter.modelID)){
                    query.where('ProductModelID', '=', [this._filter.modelID]);
                }

                query.orderBy('Name', 'ASC').thenBy('SellStartDate','DESC');

                //just to make it more interesting supply parameters to  ReadProduct service method
                //they are optional (you can not supply them at all and on the service method execution they will have null values)
                query.params = { param1: [10, 11, 12, 13, 14], param2: 'Test' };
                //return promise
                return this.dbContext.load(query);
            },
            destroy:function () {
                if (this._isDestroyed)
                    return;
                this._propWatcher.destroy();
                this._propWatcher = null;

                if (!!this._dbSet){
                    this._dbSet.removeNSHandlers(this.uniqueID);
                }
                if (!!this._dataGrid){
                    this._dataGrid.removeNSHandlers(this.uniqueID);
                }
                this._super();
            }
        },
        {
            templateID:{
                get:function () {
                    return this._templateID;
                }
            },
            testInvokeCommand:{
                get:function () {
                    return this._testInvokeCommand;
                }
            },
            addNewCommand:{
                get:function () {
                    return this._addNewCommand;
                }
            },
            tabsEventCommand: {
                get: function () {
                    return this._tabsEventCommand;
                }
            },
            propChangeCommand: {
                get: function () {
                    return this._propChangeCommand;
                }
            },
            dbContext: {
                get: function () {
                    return this.app.dbContext;
                }
            },
            //Products DbSet
            dbSet: {
                get: function () {
                    return this._dbSet;
                }
            },
            dbSets: {
                get: function () {
                    return this.app.dbContext.dbSets;
                }
            },
            //Current Product
            currentItem: {
                get: function () {
                    return this._dbSet.currentItem;
                }
            },
            filter: {
                get: function () {
                    return this._filter;
                }
            },
            loadCommand:{
                get:function () {
                    return this._loadCommand;
                }
            },
            //number of currently selected products
            selectedCount:{
                set:function (v) {
                    var old = this._selectedCount;
                    if (old !== v) {
                        this._selectedCount = v;
                        this.raisePropertyChanged('selectedCount');
                    }
                },
                get:function () {
                    return this._selectedCount;
                }
            },
            selectedIDs:{
                get:function () {
                    return Object.keys(this._selected);
                }
            },
            //testInvoke result
            invokeResult:{
                set:function (v) {
                    var old = this._invokeResult;
                    if (old !== v) {
                        this._invokeResult = v;
                        this.raisePropertyChanged('invokeResult');
                    }
                },
                get:function () {
                    return this._invokeResult;
                }
            }
        },
        function (obj) {
            app.registerType('custom.ProductViewModel', obj);
        });

    //base upload files viewmodel
    var BaseUploadVM = app.getType('BaseViewModel').extend({
            _create:function (uploadUrl) {
                this._super();
                var self = this;
                this._uploadUrl = uploadUrl;
                this._formEl = null;
                this._fileEl = null;
                this._progressBar = null;
                this._percentageCalc = null;
                this._progressDiv = null;
                this._fileInfo = null;
                this._id = null;
                this._fileUploaded = false;

                this._initOk = this._initXhr();
                this._uploadCommand = app.getType('Command').create(function (sender, param) {
                    try {
                        self.uploadFiles(self._fileEl.files);
                    } catch (ex) {
                        self._onError(ex, this);
                    }
                }, self, function (sender, param) {
                    return self._canUpload();
                });
            },
            _initXhr: function(){
                this.xhr = new XMLHttpRequest();
                if (!this.xhr.upload){
                    this.xhr = null;
                    this._onError('Browser dose not support HTML5 files upload interface');
                    return false;
                }
                var self= this, xhr = this.xhr, upload = xhr.upload;
                upload.onloadstart = function (e) {
                    self._progressBar.prop("max", 100);
                    self._progressBar.prop("value", 0);
                    self._percentageCalc.html("0%");
                    self._progressDiv.show();
                };

                upload.onprogress = function (e) {
                    var progressBar = $("#progressBar");
                    var percentageDiv = $("#percentageCalc");
                    if (!!e.lengthComputable) {
                        self._progressBar.prop("max", e.total);
                        self._progressBar.prop("value", e.loaded);
                        self._percentageCalc.html(Math.round(e.loaded / e.total * 100) + "%");
                    }
                };

                // File uploaded
                upload.onload = function (e) {
                    self.fileInfo = 'the File is uploaded';
                    self._progressDiv.hide();
                    self._onFileUploaded();
                };

                upload.onerror = function (e) {
                    self.fileInfo = null;
                    self._onError(new Error('File upload error'),self);
                };

                xhr.onreadystatechange = function (e) {
                    if (xhr.readyState === 4) {
                        if (xhr.status >= 400) {
                            self._onError(new Error(String.format("File upload error: {0}", xhr.statusText),self));
                        }
                    }
                };

                return true;
            },
            _onFileUploaded: function(){
                this._fileUploaded = true;
            },
            uploadFiles:function (fileList) {
                if (!!fileList) {
                    for (var i = 0, l = fileList.length; i < l; i++) {
                        this.uploadFile(fileList[i]);
                    }
                }
            },
            uploadFile:function (file) {
                if (!this._initOk)
                    return;
                var xhr = this.xhr;
                xhr.open("post", this._uploadUrl, true);
                // Set appropriate headers
                // We're going to use these in the UploadFile method
                // To determine what is being uploaded.
                xhr.setRequestHeader("Content-Type", "multipart/form-data");
                xhr.setRequestHeader("X-File-Name", file.name);
                xhr.setRequestHeader("X-File-Size", file.size);
                xhr.setRequestHeader("X-File-Type", file.type);
                xhr.setRequestHeader("X-Data-ID", this._getDataID());

                // Send the file
                xhr.send(file);
            },
            _onIDChanged: function(){
                this._uploadCommand.raiseCanExecuteChanged();
            },
            _canUpload: function(){
                return this._initOk && !!this._fileInfo && !utils.check_is.nt(this.id);
            },
            _getDataID: function(){
                return this.id;
            }
        },
        {
            /*We can set here any information on the file which is currently uploading*/
            fileInfo:{
                set:function (v) {
                    if (this._fileInfo !== v){
                        this._fileInfo = v;
                        this.raisePropertyChanged('fileInfo');
                        this._uploadCommand.raiseCanExecuteChanged();
                    }
                },
                get:function () {
                    return this._fileInfo;
                }
            },
            uploadCommand:{
                get:function () {
                    return this._uploadCommand;
                }
            },
            //we suply this id to the service when we upload file
            //checking it on the server we know to which entity this file will belong
            id:{
                set:function (v) {
                    var old = this._id;
                    if (old !== v) {
                        this._id = v;
                        this.raisePropertyChanged('id');
                        this._onIDChanged();
                    }
                },
                get:function () {
                    return this._id;
                }
            }
        },
        function (obj) {
            app.registerType('custom.BaseUploadVM', obj);
        });

   //helper function to get html DOM element  inside template instance
   //by custom data-name attribute value
    var fn_getTemplateElement = function(template, name){
        var t = template;
        var els = t.findElByDataName(name);
        if (els.length < 1)
            return null;
        return els[0];
    };

    var UploadThumbnailVM = thisModule.UploadThumbnailVM = BaseUploadVM.extend({
            _create:function (uploadUrl) {
                this._super(uploadUrl);
                var self = this;
                this._product = null;
                //we defined this custom type in common.js
                this._dialogVM = app.getType('custom.DialogVM').create();
                var dialogOptions = {
                    templateID:'uploadTemplate',
                    width: 450,
                    height: 250,
                    title:'Upload product thumbnail',
                    fn_OnTemplateCreated: function(template){
                        var dialog = this, $ = global.$; //executed in the context of the dialog
                        self._fileEl = fn_getTemplateElement(template, 'files-to-upload');
                        self._formEl = fn_getTemplateElement(template, 'uploadForm');
                        self._progressBar = $(fn_getTemplateElement(template, 'progressBar'));
                        self._percentageCalc = $(fn_getTemplateElement(template, 'percentageCalc'));
                        self._progressDiv = $(fn_getTemplateElement(template, 'progressDiv'));
                        self._progressDiv.hide();
                        global.$(self._fileEl).on('change', function (e) {
                            e.stopPropagation();
                            var fileList  = this.files, txt='';
                            self.fileInfo = null;
                            for (var i = 0, l = fileList.length; i < l; i++) {
                                txt+=String.format('<p>{0} ({1} KB)</p>', fileList[i].name, utils.str.formatNumber(fileList[i].size / 1024, 2, '.', ','));
                            }
                            self.fileInfo = txt;
                        });
                        var templEl = template.el, $ = global.$, $fileEl = $(self._fileEl);
                        $fileEl.change(function (e) {
                            $('input[data-name="files-input"]',templEl).val($(this).val());
                        });
                        $('*[data-name="btn-input"]',templEl).click(function(e){
                            e.preventDefault();
                            e.stopPropagation();
                            $fileEl.click();
                        });
                    },
                    fn_OnShow: function(dialog){
                        self._formEl.reset();
                        self.fileInfo = null;
                        self._fileUploaded = false;
                    },
                    fn_OnClose: function(dialog){
                        if (dialog.result == 'ok' && self._onDialogClose()){
                            //raise our custom event
                            self.raiseEvent('files_uploaded', {id:self.id, product:self._product});
                        }
                    }
                };
                //dialogs are distinguished by their given names
                this._dialogVM.createDialog('uploadDialog', dialogOptions);

                this._dialogCommand = app.getType('Command').create(function (sender, param) {
                    try {
                        //using command parameter to provide product item
                        self._product = param;
                        self.id = self._product.ProductID;
                        self._dialogVM.showDialog('uploadDialog',self);
                    } catch (ex) {
                        self._onError(ex, this);
                    }
                }, self,  function (sender, param) {
                    return true;
                });
                this._templateCommand = app.getType('Command').create(function (sender, param) {
                    try {
                       var t = param.template, templEl = t.el, $ = global.$, fileEl = $('input[data-name="files-to-upload"]',templEl);
                        if (fileEl.length == 0)
                            return;

                        if (param.isLoaded){
                           fileEl.change(function (e) {
                                $('input[data-name="files-input"]',templEl).val($(this).val());
                            });
                            $('*[data-name="btn-input"]',templEl).click(function(e){
                                e.preventDefault();
                                e.stopPropagation();
                                fileEl.click();
                            });
                       }
                       else{
                            fileEl.off('change');
                            $('*[data-name="btn-input"]',templEl).off('click');
                       }
                    } catch (ex) {
                        self._onError(ex, this);
                    }
                }, self,  function (sender, param) {
                    return true;
                });
            },
            _getEventNames:function () {
                var base_events = this._super();
                return ['files_uploaded'].concat(base_events);
            },
            _onDialogClose: function(){
                return this._fileUploaded;
            }
        },
        {
            dialogCommand:{
                get:function () {
                    return this._dialogCommand;
                }
            },
            templateCommand:{
                get:function () {
                    return this._templateCommand;
                }
            }
        },
        function (obj) {
            app.registerType('custom.UploadThumbnailVM', obj);
        });
});
