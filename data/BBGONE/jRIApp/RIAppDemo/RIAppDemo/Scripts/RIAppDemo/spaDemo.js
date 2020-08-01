'use strict';
RIAPP.Application.registerModule('spaDemo', function (app) {
    var global = app.global, utils = global.utils, consts = global.consts;
    var TEXT = RIAPP.localizable.TEXT, CustomerVM, OrderVM, OrderDetailVM, ProductVM, AddressVM, CustomerAddressVM, AddAddressVM;

    /*
        holds current view name for the main page view - customers list or customer's detail
        the separate view model (like here) achieves better incapsulation of business logic
    */
    var MainViewVM = app.getType('BaseViewModel').extend({
        _create: function () {
            this._super();
            this._custTemplName = 'SPAcustTemplate';
            this._custDetTemplName = 'SPAcustDetailTemplate';
            this._viewName = this._custTemplName;
        },
        goToAllCust: function(){
            this.viewName = this.custTemplName;
        },
        goToCustDet: function(){
            this.viewName = this.custDetTemplName;
        },
        reset: function(){
            this.viewName = this._custTemplName;
        }
    },{
        viewName:{
            set:function (v) {
                if (v !== this._viewName){
                    this._viewName = v;
                    this.raisePropertyChanged('viewName');
                }
            },
            get:function () {
                return this._viewName;
            }
        },
        custTemplName:{
            get:function () {
                return this._custTemplName;
            }
        },
        custDetTemplName:{
            get:function () {
                return this._custDetTemplName;
            }
        }
    },null);

    var CustDetViewVM = app.getType('BaseViewModel').extend({
        _create: function () {
            this._super();
            this._infoTemplName = 'customerInfo';
            this._adrTemplName = 'customerAddr';
            this._viewName = this._infoTemplName;
        },
        goToCustInfo: function(){
            this.viewName = this.infoTemplName;
        },
        goToAdrInfo: function(){
            this.viewName = this.adrTemplName;
        },
        reset: function(){
            this.viewName = this._infoTemplName;
        }
    },{
        viewName:{
            set:function (v) {
                if (v !== this._viewName){
                    this._viewName = v;
                    this.raisePropertyChanged('viewName');
                }
            },
            get:function () {
                return this._viewName;
            }
        },
        infoTemplName:{
            get:function () {
                return this._infoTemplName;
            }
        },
        adrTemplName:{
            get:function () {
                return this._adrTemplName;
            }
        }
    },null);

    var AddrViewVM = app.getType('BaseViewModel').extend({
        _create: function () {
            this._super();
            this._linkAdrTemplate = 'linkAdrTemplate';
            this._newAdrTemplate = 'newAdrTemplate';
            this._viewName = this._linkAdrTemplate;
        },
        goToLinkAdr: function(){
            this.viewName = this.linkAdrTemplate;
        },
        goToNewAdr: function(){
            this.viewName = this.newAdrTemplate;
        }
    },{
        viewName:{
            set:function (v) {
                if (v !== this._viewName){
                    this._viewName = v;
                    this.raisePropertyChanged('viewName');
                }
            },
            get:function () {
                return this._viewName;
            }
        },
        linkAdrTemplate:{
            get:function () {
                return this._linkAdrTemplate;
            }
        },
        newAdrTemplate:{
            get:function () {
                return this._newAdrTemplate;
            }
        }
    },null);

    CustomerVM = app.getType('BaseViewModel').extend({
            _create: function () {
                this._super();
                var self = this;
                this._dataGrid = null;
                this._dbSet = this.dbSets.Customer;
                this._dbSet.isSubmitOnDelete = true;

                this._uiMainView = MainViewVM.create();
                this._uiDetailView = CustDetViewVM.create();
                this._uiMainView.addOnPropertyChange('viewName',function(sender,a){
                    self._uiDetailView.reset();
                    if (sender.viewName == sender.custTemplName){
                        setTimeout(function(){
                           if (!!self._dataGrid){
                               self._dataGrid.scrollToCurrent(true);
                           }
                        },0);
                    }
                });

                this._propWatcher = app.getType('PropWatcher').create();

                this._dbSet.addHandler('item_deleting', function (sender, args) {
                    if (!confirm('Are you sure that you want to delete customer ?'))
                        args.isCancel = true;
                }, self.uniqueID);

                this._dbSet.addHandler('fill', function (sender, args) {
                    //when fill is ended
                    if (!args.isBegin){
                        self.raiseEvent('data_filled',args);
                    }
                    else {
                        if (args.isPageChanged)
                            self.raiseEvent('page_changed',{});
                    }
                }, self.uniqueID);

                //adds new customer - uses dialog to enter the data
                this._addNewCommand = app.getType('Command').create(function (sender, param) {
                        self._dbSet.addNew();  //showing of the dialog is handled by the datagrid
                    }, self,
                    function (sender, param) {
                        return true; //command is always enabled
                    });


                this._editCommand = app.getType('Command').create(function (sender, param) {
                        self.currentItem.beginEdit();
                    }, self,
                    function (sender, param) {
                        return !!self.currentItem;
                    });

                this._endEditCommand = app.getType('Command').create(function (sender, param) {
                        if (self.currentItem.endEdit())
                            self.dbContext.submitChanges();
                    }, self,
                    function (sender, param) {
                        return !!self.currentItem;
                    });

                this._cancelEditCommand = app.getType('Command').create(function (sender, param) {
                        self.currentItem.cancelEdit();
                        self.dbContext.rejectChanges();
                    }, self,
                    function (sender, param) {
                        return !!self.currentItem;
                    });

                //saves changes (submitts them to the service)
                this._saveCommand = app.getType('Command').create(function (sender, param) {
                        self.dbContext.submitChanges();
                    }, self,
                    function (s, p) {
                        return self.dbContext.hasChanges; //command enabled when there are pending changes
                    });


                this._undoCommand = app.getType('Command').create(function (sender, param) {
                        self.dbContext.rejectChanges();
                    }, self,
                    function (s, p) {
                        return self.dbContext.hasChanges; //command enabled when there are pending changes
                    });

                //load data from the server
                this._loadCommand = app.getType('Command').create(function (sender, args) {
                    self.load();
                }, self, null);

                //example of getting instance of bounded dataGrid by using elView's propChangedCommand
                this._propChangeCommand =  app.getType('Command').create(function (sender, args) {
                    if (args.property=='*' || args.property=='grid'){
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
                    }
                }, self, null);

                this._tabsEventCommand = app.getType('Command').create(function (sender, param) {
                    //alert(param.eventName);
                }, self, null);

                this._switchViewCommand = app.getType('Command').create(function (sender, param) {
                    this.uiMainView.viewName = param;
                }, self, null);

                this._switchDetViewCommand = app.getType('Command').create(function (sender, param) {
                    this.uiDetailView.viewName = param;
                }, self, null);

                //the property watcher helps us handling properties changes
                //more convenient than using addOnPropertyChange
                this._propWatcher.addPropWatch(self.dbContext,'hasChanges',function(s,a){
                    self._saveCommand.raiseCanExecuteChanged();
                    self._undoCommand.raiseCanExecuteChanged();
                });
                this._propWatcher.addPropWatch(this._dbSet,'currentItem',function(s,a){
                    self._editCommand.raiseCanExecuteChanged();
                    self._endEditCommand.raiseCanExecuteChanged();
                    self._cancelEditCommand.raiseCanExecuteChanged();
                    self._onCurrentChanged();
                });

                this._dbSet.addHandler('cleared',function(s,a){
                    self.dbSets.CustomerAddress.clear();
                    self.dbSets.Address.clear();
                }, self.uniqueID);

                var custAssoc = self.dbContext.getAssociation('CustAddrToCustomer');

                //the view to filter CustomerAddresses related to the current customer only
                this._custAdressView = app.getType('ChildDataView').create(
                    {
                        association:custAssoc,
                        fn_sort: function(a,b){return a.AddressID - b.AddressID;}
                    });
                this._ordersVM  = OrderVM.create(this);
                this._customerAddressVM = CustomerAddressVM.create(this);
            },
            _getEventNames:function () {
                var base_events = this._super();
                return ['data_filled', 'row_expanded','page_changed'].concat(base_events);
            },
            _onGridPageChanged: function(){
            },
            _onGridRowSelected: function(row){
            },
            _onGridRowExpanded: function(oldRow, row, isExpanded){
                var r = row;
                if (!isExpanded){
                    r = oldRow;
                }
                this.raiseEvent('row_expanded',{customer: r.item, isExpanded: isExpanded});
            },
            _onCurrentChanged: function () {
                this._custAdressView.parentItem =  this._dbSet.currentItem;
                this.raisePropertyChanged('currentItem');
            },
            //returns promise
            load: function () {
                var query = this.dbSet.createQuery('ReadCustomer');
                query.pageSize = 50;
                query.params = { includeNav: true };
                //load without filtering
                query.orderBy('LastName', 'ASC').thenBy('MiddleName','ASC').thenBy('FirstName','ASC');
                return this.dbContext.load(query);
            },
            destroy:function () {
                if (this._isDestroyed)
                    return;
                if (!!this._customerAddressVM){
                    this._customerAddressVM.destroy();
                    this._customerAddressVM = null;
                }
                this._ordersVM.destroy()
                this._ordersVM = null;

                this._propWatcher.destroy();
                this._propWatcher =null;

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
            switchViewCommand: {
                get: function () {
                    return this._switchViewCommand;
                }
            },
            switchDetViewCommand: {
                get: function () {
                    return this._switchDetViewCommand;
                }
            },
            uiMainView:{
                get:function () {
                    return this._uiMainView;
                }
            },
            uiDetailView:{
                get:function () {
                    return this._uiDetailView;
                }
            },
            addNewCommand:{
                get:function () {
                    return this._addNewCommand;
                }},
            editCommand:{
                get:function () {
                    return this._editCommand;
            }},
            endEditCommand:{
                get:function () {
                    return this._endEditCommand;
                }},
            cancelEditCommand:{
                get:function () {
                    return this._cancelEditCommand;
                }},
            saveCommand:{
                get:function () {
                    return this._saveCommand;
                }},
            undoCommand:{
                get:function () {
                    return this._undoCommand;
                }},
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
            //Customers DbSet
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
            //Current Customer
            currentItem: {
                get: function () {
                    return this._dbSet.currentItem;
                }
            },
            loadCommand:{
                get:function () {
                    return this._loadCommand;
                }},
            ordersVM:{
                get:function () {
                    return this._ordersVM;
                }},
            custAdressView:{
                get:function () {
                    return this._custAdressView;
                }
            },
            customerAddressVM:{
                get:function () {
                    return this._customerAddressVM;
                }
            }
        },
        function (obj) {
            app.registerType('custom.CustomerVM', obj);
        });

    OrderVM = app.getType('BaseViewModel').extend({
            _create: function (customerVM) {
                this._super();
                var self = this;
                this._customerVM = customerVM;
                this._dbSet = this.dbSets.SalesOrderHeader;
                this._currentCustomer = null;
                this._dataGrid = null;
                this._selectedTabIndex = null;
                this._orderStatuses = app.getType('Dictionary').create('orderStatus',{key:0,val:''},'key');
                this._orderStatuses.fillItems([{key:0,val:'New Order'},{key:1,val:'Status 1'},{key:2,val:'Status 2'},{key:3,val:'Status 3'},
                    {key:4,val:'Status 4'},{key:5,val:'Completed Order'}], true);

                //loads the data only when customer's row is expanded
                this._customerVM.addHandler('row_expanded', function (sender, args) {
                    if (args.isExpanded){
                        self.currentCustomer = args.customer;
                    }
                    else
                    {
                        self.currentCustomer = null;
                    }
                }, self.uniqueID);

                this._dbSet.addOnPropertyChange('currentItem', function (sender, args) {
                    self._onCurrentChanged();
                }, self.uniqueID);

                this._dbSet.addHandler('item_deleting', function (sender, args) {
                    if (!confirm('Are you sure that you want to delete order ?'))
                        args.isCancel = true;
                }, self.uniqueID);


                this._dbSet.addHandler('item_added', function (sender, args) {
                    args.item.Customer =  self.currentCustomer;
                    args.item.OrderDate = Date.today(); //datejs extension
                    args.item.DueDate = Date.today().add(6).days(); //datejs extension
                    args.item.OnlineOrderFlag = false;
                }, self.uniqueID);

                this._dbSet.addHandler('fill', function (sender, args) {
                    //when fill is ended
                    if (!args.isBegin){
                        self.raiseEvent('data_filled',args);
                    }
                }, self.uniqueID);

                //adds new order - uses dialog to fill the data
                this._addNewCommand = app.getType('Command').create(function (sender, param) {
                        self._dbSet.addNew();  //showing of the dialog is handled by the datagrid
                    }, self,
                    function (sender, param) {
                        return true;  //always enabled
                    });

                //example of getting instance of bounded dataGrid by using elView's propChangedCommand
                this._propChangeCommand =  app.getType('Command').create(function (sender, args) {
                    if (args.property=='*' || args.property=='grid'){
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
                    }
                }, self, null);

                this._tabsEventCommand = app.getType('Command').create(function (sender, param) {
                    //here we can handle tabs events
                    switch(param.eventName)
                    {
                        case "select":
                            this._onTabSelected(param.args.index);
                            break;
                        default:
                            break;
                    }
                }, self, null);

                this._addressVM = AddressVM.create(this);
                this._orderDetailVM = OrderDetailVM.create(this);
            },
            _getEventNames:function () {
                var base_events = this._super();
                return ['data_filled','row_expanded'].concat(base_events);
            },
            _onTabSelected: function(index){
                this._selectedTabIndex = index;
                this.raisePropertyChanged('selectedTabIndex');

                if (index === 2){  //load details only when tab which contain details grid is selected
                    this._orderDetailVM.currentOrder = this.dbSet.currentItem;
                }
            },
            _onGridPageChanged: function(){
            },
            _onGridRowSelected: function(row){
            },
            _onGridRowExpanded: function(oldRow, row, isExpanded){
                var r = row;
                if (!isExpanded){
                    r = oldRow;
                }
                this.raiseEvent('row_expanded',{order: r.item, isExpanded: isExpanded});
                if (isExpanded){
                    this._onTabSelected(this.selectedTabIndex);
                }
            },
            _onCurrentChanged: function () {
                this.raisePropertyChanged('currentItem');
            },
            clear: function(){
                this.dbSet.clear();
            },
            //returns promise
            load: function () {
                //explicitly clear on before every load
                this.clear();
                if (!this.currentCustomer || this.currentCustomer.getIsNew()){
                    var deferred = new global.$.Deferred();
                    deferred.reject();
                    return deferred.promise();
                }
                var query = this.dbSet.createQuery('ReadSalesOrderHeader');
                query.where('CustomerID', '=', [this.currentCustomer.CustomerID]);
                query.orderBy('OrderDate', 'ASC').thenBy('SalesOrderID','ASC');
                return this.dbContext.load(query);
            },
            destroy:function () {
                if (this._isDestroyed)
                    return;
                if (!!this._dbSet){
                    this._dbSet.removeNSHandlers(this.uniqueID);
                }
                if (!!this._dataGrid){
                    this._dataGrid.removeNSHandlers(this.uniqueID);
                }
                this.currentCustomer = null;
                this._addressVM.destroy();
                this._addressVM = null;
                this._orderDetailVM.destroy();
                this._orderDetailVM = null;
                this._customerVM = null;
                this._super();
            }
        },
        {
            addNewCommand:{
                get:function () {
                    return this._addNewCommand;
                }},
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
            //Orders DbSet
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
            orderStatuses:{
                get:function () {
                    return this._orderStatuses;
                }},
            //Current Order
            currentItem: {
                get: function () {
                    return this._dbSet.currentItem;
                }
            },
            currentCustomer:{
                set:function (v) {
                    if (v !== this._currentCustomer){
                        this._currentCustomer = v;
                        this.raisePropertyChanged('currentCustomer');
                        this.load();
                    }
                },
                get:function () {
                    return this._currentCustomer;
                }},
            customerVM:{
                get:function () {
                    return this._customerVM;
                }},
            orderDetailsVM:{
                get:function () {
                    return this._orderDetailVM;
                }},
            selectedTabIndex:{
                get:function () {
                    return this._selectedTabIndex;
                }}
        },
        function (obj) {
            app.registerType('custom.OrderVM', obj);
        });

    OrderDetailVM = app.getType('BaseViewModel').extend({
            _create: function (orderVM) {
                this._super();
                var self = this;
                this._orderVM = orderVM;
                this._dbSet = this.dbSets.SalesOrderDetail;
                this._currentOrder = null;

                this._orderVM.dbSet.addHandler('cleared',function(s,a){
                    self.clear();
                }, self.uniqueID);

                this._dbSet.addHandler('fill', function (sender, args) {
                    //when fill is ended
                    if (!args.isBegin){
                        self.raiseEvent('data_filled',args);
                    }
                }, self.uniqueID);

                this._dbSet.addOnPropertyChange('currentItem', function (sender, args) {
                    self._onCurrentChanged();
                }, self.uniqueID);

                this._productVM = ProductVM.create(this);
            },
            _getEventNames:function () {
                var base_events = this._super();
                return ['data_filled'].concat(base_events);
            },
            _onCurrentChanged: function () {
                this.raisePropertyChanged('currentItem');
            },
            //returns promise
            load: function () {
                this.clear();

                if (!this.currentOrder || this.currentOrder.getIsNew()){
                    var deferred = new global.$.Deferred();
                    deferred.reject();
                    return deferred.promise();
                }
                var query = this.dbSet.createQuery('ReadSalesOrderDetail');
                query.where('SalesOrderID', '=', [this.currentOrder.SalesOrderID]);
                query.orderBy('SalesOrderDetailID', 'ASC');
                return this.dbContext.load(query);
            },
            clear: function(){
                this.dbSet.clear();
            },
            destroy:function () {
                if (this._isDestroyed)
                    return;

                if (!!this._dbSet){
                    this._dbSet.removeNSHandlers(this.uniqueID);
                }
                if (!!this._dataGrid){
                    this._dataGrid.removeNSHandlers(this.uniqueID);
                }
                this.currentOrder = null;
                this._productVM.destroy();
                this._orderVM.dbSet.removeNSHandlers(this.uniqueID);
                this._orderVM.removeNSHandlers(this.uniqueID);
                this._orderVM = null;
                this._super();
            }
        },
        {
            dbContext: {
                get: function () {
                    return this.app.dbContext;
                }
            },
            //OrderDetail DbSet
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
            //Current OrderDetail
            currentItem: {
                get: function () {
                    return this._dbSet.currentItem;
                }
            },
            currentOrder:{
                set:function (v) {
                    if (v !== this._currentOrder){
                        this._currentOrder = v;
                        this.raisePropertyChanged('currentOrder');
                        this.load();
                    }
                },
                get:function () {
                    return this._currentOrder;
                }},
            orderVM:{
                get:function () {
                    return this._orderVM;
                }}
        },
        function (obj) {
            app.registerType('custom.OrderDetailVM', obj);
        });

    AddressVM = app.getType('BaseViewModel').extend({
            _create: function (orderVM) {
                this._super();
                var self = this;
                this._orderVM = orderVM;
                this._dbSet = this.dbSets.Address;
                this._customerDbSet = this._orderVM.customerVM.dbSet;

                this._orderVM.addHandler('data_filled', function (sender, args) {
                    self.loadAddressesForOrders(args.fetchedItems);
                }, self.uniqueID);

                this._dbSet.addOnPropertyChange('currentItem', function (sender, args) {
                    self._onCurrentChanged();
                }, self.uniqueID);
            },
            _onCurrentChanged: function () {
                this.raisePropertyChanged('currentItem');
            },
            //returns promise
            loadAddressesForOrders: function (orders) {
                var ids1 = orders.map(function(item){
                    return item.ShipToAddressID;
                });
                var ids2 = orders.map(function(item){
                    return item.BillToAddressID;
                });
                var ids = ids1.concat(ids2).filter(function(id){
                    return id !== null;
                }).distinct();
                return this.load(ids, false);
            },
            //returns promise
            load: function (ids, isClearTable) {
                var query = this.dbSet.createQuery('ReadAddressByIds');
                query.params = { addressIDs: ids };
                query.isClearPrevData = isClearTable; //if true, previous data will be cleared when new is loaded
                return this.dbContext.load(query);
            },
            clear: function(){
                this.dbSet.clear();
            },
            destroy:function () {
                if (this._isDestroyed)
                    return;

                if (!!this._dbSet){
                    this._dbSet.removeNSHandlers(this.uniqueID);
                }
                this._customerDbSet.removeNSHandlers(this.uniqueID);
                this._orderVM.removeNSHandlers(this.uniqueID);
                this._orderVM = null;
                this._customerDbSet = null;
                this._super();
            }
        },
        {
            dbContext: {
                get: function () {
                    return this.app.dbContext;
                }
            },
            //Address DbSet
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
            //Current Address
            currentItem: {
                get: function () {
                    return this._dbSet.currentItem;
                }
            }
        },
        function (obj) {
            app.registerType('custom.AddressVM', obj);
        });

    //product lookup used in orderDetEditTemplate
    var ProductAutoComplete = app.getType('AutoCompleteElView').extend({
            _init:function (options){
                this._super(options);
                var self = this;
                this._lastLoadedID = null;
                this._lookupSource= this.app.dbContext.dbSets.Product;
                this._lookupSource.addHandler('coll_changed', function (sender, args) {
                    self._updateValue();
                }, self._objId);
            },
            //overriden base method
            _updateSelection: function(){
                if (!!this.dataContext) {
                    var id = this.currentSelection;
                    this.dataContext['ProductID'] = id;
                }
            },
            _onHide: function(){
                this._super();
                this._updateValue();
            },
            //new method
            _updateValue: function(){
                if (!this.dataContext){
                    this.value = '';
                    return;
                }
                var productID = this.dataContext['ProductID'];
                var product = this._lookupSource.findByPK(productID);
                if (!!product){
                    this.value = product.Name;
                }
                else {
                    this.value = '';
                    if (this._lastLoadedID !== productID){
                        this._lastLoadedID = productID; //prevents unending loading in some cases
                        var query = this._lookupSource.createQuery('ReadProductByIds');
                        query.params = { productIDs: [productID] };
                        query.isClearPrevData = false;
                        this.app.dbContext.load(query);
                    }
                }
            }
        },
        {
            //overriden base property
            dataContext:{
                set:function (v) {
                    var self = this;
                    if (this._dataContext !== v){
                        if (!!this._dataContext){
                            this._dataContext.removeNSHandlers(this.uniqueID);
                        }
                        this._dataContext = v;
                        if (!!this._dataContext){
                            this._dataContext.addOnPropertyChange('ProductID',function(sender,a){
                                self._updateValue();
                            },this.uniqueID);
                        }
                        self._updateValue();
                        this.raisePropertyChanged('dataContext');
                    }
                },
                get:function () {
                    return this._dataContext;
                }
            },
            //overriden base property
            currentSelection:{
                get:function () {
                    if (!!this._dbSet.currentItem)
                        return this._dbSet.currentItem['ProductID'];
                    else
                        return null;
                }
            }
        },
        function (obj) {
            app.registerElView('productACV', obj);
        }
    );

    ProductVM = app.getType('BaseViewModel').extend({
            _create: function (orderDetailVM) {
                this._super();
                var self = this;
                this._orderDetailVM = orderDetailVM;
                this._dbSet = this.dbSets.Product;
                this._customerDbSet = this._orderDetailVM.orderVM.customerVM.dbSet;

                this._customerDbSet.addHandler('cleared',function(s,a){
                    self.clear();
                }, self.uniqueID);

                //here we load products which are referenced in order details
                this._orderDetailVM.addHandler('data_filled', function (sender, args) {
                    self.loadProductsForOrderDetails(args.fetchedItems);
                }, self.uniqueID);

                this._dbSet.addOnPropertyChange('currentItem', function (sender, args) {
                    self._onCurrentChanged();
                }, self.uniqueID);
            },
            _onCurrentChanged: function () {
                this.raisePropertyChanged('currentItem');
            },
            clear: function(){
                this.dbSet.clear();
            },
            //returns promise
            loadProductsForOrderDetails: function (orderDetails) {
                var ids = orderDetails.map(function(item){
                    return item.ProductID;
                }).filter(function(id){
                        return id !== null;
                    }).distinct();

                return this.load(ids, false);
            },
            //returns promise
            load: function (ids, isClearTable) {
                var query = this.dbSet.createQuery('ReadProductByIds');
                query.params = { productIDs: ids };
                query.isClearPrevData = isClearTable;
                return this.dbContext.load(query);
            },
            destroy:function () {
                if (this._isDestroyed)
                    return;

                if (!!this._dbSet){
                    this._dbSet.removeNSHandlers(this.uniqueID);
                }
                this._customerDbSet.removeNSHandlers(this.uniqueID);
                this._orderDetailVM.removeNSHandlers(this.uniqueID);
                this._orderDetailVM = null;
                this._customerDbSet = null;
                this._super();
            }
        },
        {
            dbContext: {
                get: function () {
                    return this.app.dbContext;
                }
            },
            //Product DbSet
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
            }
        },
        function (obj) {
            app.registerType('custom.ProductVM', obj);
        });

    //private helper function (used inside this module only)
    var addTextQuery = function(query, fldName, val){
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

    CustomerAddressVM = app.getType('BaseViewModel').extend({
            _create: function (customerVM) {
                this._super();
                var self = this;
                this._customerVM = customerVM;
                this._addAddressVM = null;
                this._currentCustomer = self._customerVM.currentItem;
                this._addressesDb = this.dbSets.Address;
                this._custAdressDb = this.dbSets.CustomerAddress;
                this._custAdressDb.addHandler('item_deleting', function (sender, args) {
                    if (!confirm('Are you sure that you want to unlink Address from this customer?'))
                        args.isCancel = true;
                }, self.uniqueID);

                this._custAdressDb.addHandler('begin_edit', function (sender, args) {
                    //start editing Address entity, when CustomerAddress begins editing
                    //p.s.- Address is navigation property
                    var address = args.item.Address;
                    if (!!address)
                        address.beginEdit();
                }, self.uniqueID);

                this._custAdressDb.addHandler('end_edit', function (sender, args) {
                    var address = args.item.Address;
                    if (!args.isCanceled){
                        if (!!address)
                            address.endEdit();
                    }
                    else {
                        if (address)
                            address.cancelEdit();
                    }
                }, self.uniqueID);

                this._addressesDb.addHandler('item_deleting', function (sender, args) {
                    if (!confirm('Are you sure that you want to delete Customer\'s Address ?'))
                        args.isCancel = true;
                }, self.uniqueID);

                var custAssoc = self.dbContext.getAssociation('CustAddrToCustomer');

                //the view to filter CustomerAddresses related to the current customer only
                this._custAdressView = this._customerVM.custAdressView;

                //the view to filter addresses related to current customer
                this._addressesView =  app.getType('DataView').create(
                    {
                        dataSource: this._addressesDb,
                        fn_sort: function(a,b){return a.AddressID - b.AddressID;},
                        fn_filter: function(item){
                            if (!self._currentCustomer)
                                return false;
                            return item.CustomerAddresses.some(function(ca){
                                return self._currentCustomer === ca.Customer;
                            });
                        },
                        fn_itemsProvider: function(ds){
                            if (!self._currentCustomer)
                                return [];
                            var custAdrs = self._currentCustomer.CustomerAddresses;
                            return custAdrs.map(function(m){
                                return m.Address;
                            }).filter(function(m){
                                    return !!m;
                                });
                        }
                    });

                this._custAdressView.addHandler('view_refreshed',function(s,a){
                    self._addressesView.refresh();
                },self.uniqueID);

                this._customerVM.addOnPropertyChange('currentItem', function (sender, args) {
                    self._currentCustomer = self._customerVM.currentItem;
                    self.raisePropertyChanged('currentCustomer');
                }, self.uniqueID);
            },
            //async load, returns promise
            _loadAddresses: function (addressIDs,isClearTable) {
                var  query = this._addressesDb.createQuery('ReadAddressByIds');
                //supply ids to service method which expects this custom parameter
                query.params = { addressIDs: addressIDs };
                //if true we clear all previous data in the DbSet
                query.isClearPrevData = isClearTable;
                //returns promise
                return this.dbContext.load(query);
            },
            _addNewAddress: function(){
                //use the DataView, not DbSet
                var adr = this.addressesView.addNew();
                return adr;
            },
            _addNewCustAddress: function(address){
                var cust = this.currentCustomer;
                //use the DataView, not DbSet
                var ca = this.custAdressView.addNew();
                ca.CustomerID = cust.CustomerID;
                ca.AddressType = "Main Office"; //this is default, can edit later
                //create relationship with address
                //if address is new , then the keys will be aquired when the data submitted to the server
                ca.Address = address;
                ca.endEdit();
                return ca;
            },
            load: function (customers) {
                var self = this, query = this._custAdressDb.createQuery('ReadAddressForCustomers'),
                    custArr = customers || [];
                //customerIDs for all loaded customers entities (for current page only, not which in cache if query.loadPageCount>1)
                var custIDs = custArr.map(function(item){
                    return item.CustomerID;
                });

                //send them to our service method which expects them (we defined our custom parameter, see the service method)
                query.params = { custIDs: custIDs };

                var promise = this.dbContext.load(query);
                //if we did not included details when we had loaded customers
                if (!this._customerVM.includeDetailsOnLoad)
                {
                    //then load related addresses based on what customerAddress items just loaded
                    promise.done(function(res){
                        var addressIDs = res.fetchedItems.map(function(item){
                            return item.AddressID;
                        });
                        //load new addresses and clear all previous addresses
                        self._loadAddresses(addressIDs, true);
                    });
                }
            },
            destroy:function () {
                if (this._isDestroyed)
                    return;
                if (!!this._addressesDb){
                    this._addressesDb.removeNSHandlers(this.uniqueID);
                }
                if (!!this._custAdressDb){
                    this._custAdressDb.removeNSHandlers(this.uniqueID);
                }
                if (!!this._customerVM){
                    this._customerVM.removeNSHandlers(this.uniqueID);
                }
                if (this._addAddressVM){
                    this._addAddressVM.destroy();
                    this._addAddressVM = null;
                }
                this._super();
            }
        },
        {
            dbContext: {
                get: function () {
                    return this.app.dbContext;
                }
            },
            addressesDb: {
                get: function () {
                    return this._addressesDb;
                }
            },
            custAdressDb: {
                get: function () {
                    return this._custAdressDb;
                }
            },
            addressesView: {
                get: function () {
                    return this._addressesView;
                }
            },
            custAdressView: {
                get: function () {
                    return this._custAdressView;
                }
            },
            dbSets: {
                get: function () {
                    return this.app.dbContext.dbSets;
                }
            },
            addAddressVM: {
                get: function () {
                    if (this._addAddressVM === null){
                        this._addAddressVM = AddAddressVM.create(this);
                    }
                    return this._addAddressVM;
                }
            },
            currentCustomer: {
                get: function () {
                    return this._currentCustomer;
                }
            }
        },
        function (obj) {
            app.registerType('custom.CustomerAddressVM', obj);
        });

    AddAddressVM = app.getType('BaseViewModel').extend(
        {
            _create: function (customerAddressVM) {
                this._super();
                var self = this;
                this._customerAddressVM = customerAddressVM;
                this._addressInfosDb = this.dbContext.dbSets.AddressInfo;
                this._currentCustomer = self._customerAddressVM.currentCustomer;
                this._searchToolTip = 'enter any address part then press search button';
                this._newAddress = null;
                this._adressInfosGrid = null;
                this._searchString = null;
                //for switching user interface current view
                this._uiViewVM = AddrViewVM.create();

                this._dialogVM = app.getType('custom.DialogVM').create();
                var dialogOptions = {
                    templateID:'addAddressTemplate',
                    width: 950,
                    height: 600,
                    title:'add new customer address',
                    submitOnOK: true,
                    fn_OnClose: function(dialog){
                        if (dialog.result != 'ok'){
                            //if new address is not explicitly accepted then reject added address
                            if (!!self._newAddress){
                                self._cancelAddNewAddress();
                            }
                            self.dbContext.rejectChanges();
                        }
                        self._addressInfosDb.clear();
                        self.searchString = null;
                    },
                    fn_OnOK: function(dialog){
                        var DIALOG_ACTION = dialog.DIALOG_ACTION;
                        if (self.uiViewVM.viewName != self.uiViewVM.newAdrTemplate){
                            return DIALOG_ACTION.Default; //allow close dialog
                        }
                        if (!self._newAddress.endEdit())
                            return DIALOG_ACTION.StayOpen;
                        var custAdress = self._customerAddressVM._addNewCustAddress(self._newAddress);
                        custAdress.endEdit();
                        self._newAddress = null;
                        self.uiViewVM.goToLinkAdr();
                        self.raisePropertyChanged('newAddress');
                        return DIALOG_ACTION.StayOpen;
                    },
                    fn_OnCancel: function(dialog){
                        var DIALOG_ACTION = dialog.DIALOG_ACTION;
                        if (self.uiViewVM.viewName != self.uiViewVM.newAdrTemplate){
                            return DIALOG_ACTION.Default;
                        }
                        if (!!self._newAddress){
                            self._cancelAddNewAddress();
                        }
                        return DIALOG_ACTION.StayOpen;
                    }
                };
                this._dialogVM.createDialog('addressDialog', dialogOptions);

                //this data displayed in the right panel - contains available (existing in db) addresses
                this._addressInfosView = app.getType('DataView').create(
                    {
                        dataSource: this._addressInfosDb,
                        fn_sort: function(a,b){return a.AddressID - b.AddressID;},
                        fn_filter: function(item){
                            return !item.CustomerAddresses.some(function(CustAdr){
                                return self._currentCustomer === CustAdr.Customer;
                            });
                        }
                    });
                //enable paging in the view
                this._addressInfosView.isPagingEnabled = true;
                this._addressInfosView.pageSize = 50;

                this._addressInfosView.addOnPropertyChange('currentItem', function (sender, args) {
                    self.raisePropertyChanged('currentAddressInfo');
                    self._linkCommand.raiseCanExecuteChanged();
                }, self.uniqueID);

                this._customerAddressVM.addOnPropertyChange('currentCustomer', function (sender, args) {
                    self._currentCustomer = self._customerAddressVM.currentCustomer;
                    self.raisePropertyChanged('customer');
                    self._addNewCommand.raiseCanExecuteChanged();
                }, self.uniqueID);

                //this data is displayed on the left panel - addresses currently linked to the customer
                this.custAdressView.addOnPropertyChange('currentItem', function (sender, args) {
                    self._unLinkCommand.raiseCanExecuteChanged();
                }, self.uniqueID);

                //add new or existing address
                this._addNewCommand = app.getType('Command').create(function (sender, param) {
                        try {
                            self._dialogVM.showDialog('addressDialog',self);
                        } catch (ex) {
                            self._onError(ex, this);
                        }
                    }, self,
                    function (sender, param) {
                        //enable this command when customer is not null
                        return !!self.customer;
                    });

                //load searched address data from the server
                this._execSearchCommand = app.getType('Command').create(function (sender, args) {
                    self.loadAddressInfos();
                }, self, null);

                //adds new address to the customer
                this._addNewAddressCommand = app.getType('Command').create(function (sender, args) {
                    self._addNewAddress();
                }, self, null);

                //adds existed address to the customer
                this._linkCommand = app.getType('Command').create(function (sender, args) {
                    self._linkAddress();
                }, self, function (s, a) {
                    return !!self._addressInfosView.currentItem;
                });

                this._unLinkCommand = app.getType('Command').create(function (sender, args) {
                    self._unLinkAddress();
                }, self, function (s, a) {
                    return !!self.custAdressView.currentItem;
                });

                //this is bound to the grid element view on the page
                //by this command we can get hold of the datagrid control
                //this command executed when element view property changes
                //we grab grid property from the sender (which is element view, and has property - grid)
                this._propChangeCommand =  app.getType('Command').create(function (sender, args) {
                    if (args.property=='*' || args.property=='grid'){
                        self._adressInfosGrid = sender.grid;
                    }
                }, self, null);
            },
            _cancelAddNewAddress: function(){
                var self = this;
                self._newAddress.cancelEdit();
                self._newAddress.rejectChanges();
                self._newAddress = null;
                self.uiViewVM.goToLinkAdr();
                self.raisePropertyChanged('newAddress');
            },
            //returns promise
            loadAddressInfos: function () {
                var query = this._addressInfosDb.createQuery('ReadAddressInfo');
                query.isClearPrevData = true;
                addTextQuery(query,'AddressLine1','%'+this.searchString+'%');
                query.orderBy('AddressLine1', 'ASC');
                return this.dbContext.load(query);
            },
            _addNewAddress: function(){
                this._newAddress = this._customerAddressVM._addNewAddress();
                this.uiViewVM.goToNewAdr();
                this.raisePropertyChanged('newAddress');
            },
            _linkAddress: function(){
                var self = this, adrInfoEntity = this.currentAddressInfo, adrView = self.custAdressView, adrID;
                if (!adrInfoEntity){
                    alert('_linkAddress error: adrInfoEntity is null');
                    return;
                }
                adrID = adrInfoEntity.AddressID;
                var existedAddr = adrView.items.some(function(item){
                    return item.AddressID === adrID;
                });

                if (existedAddr){
                    alert('Customer already has this address!');
                    return;
                }

                //dont clear, append to the existing
                var promise = this._customerAddressVM._loadAddresses([adrID],false);
                promise.done(function(){
                    var address;
                    address = self._customerAddressVM.addressesDb.findByPK(adrID);
                    if (!!address){
                        self._customerAddressVM._addNewCustAddress(address);
                        //remove address from right panel
                        self._removeAddressRP(adrID);
                    }
                });
            },
            _unLinkAddress: function(){
                var item = this.custAdressView.currentItem;
                if (!item){
                    return;
                }
                var id = item.AddressID;
                if (item.deleteItem())//delete from left panel
                //and then add address to the right panel (really adds addressInfo, not address entity)
                    this._addAddressRP(id);
            },
            //adds addressInfo to the right panel
            _addAddressRP: function (addressID) {
                //if address already on client, just make it be displayed in the view
                if (this._checkAddressInRP(addressID)){
                    var deferred = new global.$.Deferred();
                    deferred.reject();
                    return deferred.promise();
                }
                //if we are here, we need to load address from the server
                var self = this, query = this._addressInfosDb.createQuery('ReadAddressInfo');
                //dont clear, append to the existing
                query.isClearPrevData = false;
                query.where('AddressID', '=', [addressID]);
                var promise = this.dbContext.load(query);
                promise.done(function(){
                    self._checkAddressInRP(addressID);
                });
                return promise;
            },
            //make sure if addressInfo already on the client, adds it to the view
            _checkAddressInRP: function(addressID){
                //try to find it in the DbSet
                var item = this._addressInfosDb.findByPK(addressID);
                if (!!item)
                {
                    //if found, try append to the view
                    var appended = this._addressInfosView.appendItems([item]);
                    this._addressInfosView.currentItem = item;
                    if (!!this._adressInfosGrid)
                        this._adressInfosGrid.scrollToCurrent(true);
                }
                return !!item;
            },
            //remove address from the right panel (it is done, removing item from the view)
            _removeAddressRP: function(addressID){
                var item = this._addressInfosView.findByPK(addressID);
                if (!!item){
                    this._addressInfosView.removeItem(item);
                }
            },
            destroy:function () {
                if (this._isDestroyed)
                    return;
                if (!!this._addressInfosDb){
                    this._addressInfosDb.removeNSHandlers(this.uniqueID);
                    this._addressInfosDb.clear();
                    this._addressInfosDb = null;
                }
                if (!!this._addressInfosView){
                    this._addressInfosView.destroy();
                    this._addressInfosView = null;
                }
                this.custAdressView.removeNSHandlers(this.uniqueID);
                if (!!this._customerAddressVM){
                    this._customerAddressVM.removeNSHandlers(this.uniqueID);
                    this._customerAddressVM = null;
                }
                this._super();
            }
        },
        {
            uiViewVM:{
                get:function () {
                    return this._uiViewVM;
                }
            },
            dbContext: {
                get: function () {
                    return this.app.dbContext;
                }
            },
            addressInfosDb: {
                get: function () {
                    return this._addressInfosDb;
                }
            },
            addressInfosView: {
                get: function () {
                    return this._addressInfosView;
                }
            },
            addressesView: {
                get: function () {
                    return this._customerAddressVM._addressesView;
                }
            },
            custAdressView: {
                get: function () {
                    return this._customerAddressVM.custAdressView;
                }
            },
            currentAddressInfo: {
                get: function () {
                    return this._addressInfosView.currentItem;
                }
            },
            searchString: {
                set: function (v) {
                    if (this._searchString !== v){
                        this._searchString = v;
                        this.raisePropertyChanged('searchString');
                    }
                },
                get: function () {
                    return this._searchString;
                }
            },
            addNewCommand:{
                get:function () {
                    return this._addNewCommand;
                }
            },
            execSearchCommand:{
                get:function () {
                    return this._execSearchCommand;
                }
            },
            addNewAddressCommand:{
                get:function () {
                    return this._addNewAddressCommand;
                }
            },
            //links address to the customer
            linkCommand:{
                get:function () {
                    return this._linkCommand;
                }
            },
            //unlinks address from the customer
            unLinkCommand:{
                get:function () {
                    return this._unLinkCommand;
                }
            },
            newAddress:{
                get:function () {
                    return this._newAddress;
                }
            },
            customer:{
                get:function () {
                    return this._currentCustomer;
                }
            },
            propChangeCommand: {
                get: function () {
                    return this._propChangeCommand;
                }
            },
            searchToolTip: {
                get: function () {
                    return this._searchToolTip;
                }
            }
        },
        function (obj) {
            app.registerType('custom.AddAddressVM', obj);
        }
    );
});
