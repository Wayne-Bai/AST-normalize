Ink.createModule('App.Plasmas.Devices', '1', ['App.Plasmas', 'Ink.Data.Binding_1', 'App.Plasmas.DataProvider', 'Ink.Data.Grid_1', 'Ink.UI.Aux_1'], function(app, ko, provider, Grid, inkAux) {
    var Module = function() {
        this.allDevices = ko.observable(false);

        this.devices = ko.observableArray();

        this.devicesViewModel = new Grid({
            data: this.devices,
            pageSize: 20,
            pageSizeOptionList: [10, 20, 50, 100],
            showPageCaption: true,
            columns: [
                      {headerText: '', rowTemplate: 'deviceSelectedTemplate'},
                      {headerText: 'Name', rowText: 'name'},
                      {headerText: 'Playlist', rowText: 'playlist'},
                      {headerText: 'Mac. address', rowText: 'mac_address'},
                      {headerText: 'IP address', rowText: 'ip_address'},
                      {headerText: 'Active', rowText: 'active_label'},
                      {headerText: '', rowTemplate: 'deviceActionsTemplate'},
                     ]
        });
        this.devicesViewModel.editDeviceHandler = this.editDeviceHandler.bind(this);
        this.devicesViewModel.showDevicePlaylistHandler = this.showDevicePlaylistHandler.bind(this);

        app.signals.deviceSaved.add(this.loadDevices.bind(this));
    };

    Module.prototype.initialize = function(data) {
        this.loadDevices();
    };
    
    Module.prototype.loadDevices = function() {
        var self=this;
        
        provider.listDevices(function(data) {
            var devicesJSON = data.responseJSON.devices;
            var i;
            var devices = [];
            var deviceRow;
            
            for (i=0; i<devicesJSON.length; i++) {
                deviceRow = inkAux.clone(devicesJSON[i]);
                
                deviceRow.device = devicesJSON[i];
                deviceRow.active_label = (deviceRow.active?'Yes':'No');
                deviceRow.selected = ko.observable(false);
                
                devices.push(deviceRow);
            }
            
            self.devices(devices);
        });
        
    };
    
    Module.prototype.newDeviceHandler = function() {
        app.showSmallModalWindow('New device', 'App.Plasmas.Devices.Edit', {});
    };

    Module.prototype.editDeviceHandler = function(device) {
        app.showSmallModalWindow('Edit device', 'App.Plasmas.Devices.Edit', {device:device.device, taskButtons: [{caption: 'Remove', handler: this.removeDeviceHandler.bind(this, device.device), icon: 'icon-trash', cssClass: ''}]});
    };
    
    Module.prototype.showDevicePlaylistHandler = function(device) {
        app.showLargeModalWindow('Device '+device.name, 'App.Plasmas.Devices.Playlist', {device: device.device}, {cancelVisible: false});
    };
    
    Module.prototype.removeDeviceHandler = function(device, modal) {
        var self = this;
        
        app.showStandby();
        
        provider.deleteDevice(device.mac_address, function(data) {
            self.loadDevices();
            app.hideStandby();
            modal.hide();
        }, function(error) {
            app.hideStandby();
            modal.hide();
            app.showErrorToast(error.responseText);
            console.log(error);
        });
    };
    
    Module.prototype.toggleAllDevices = function() {
        var i;
        var checked;
           
        this.allDevices(!this.allDevices());
        
        checked = this.allDevices(); 
        for (var i=0; i<this.devices().length; i++) {
            this.devices()[i].selected(checked);
        }
    };
    
    Module.prototype.checkedDevices = function() {
        var devices = [];
        var i;
        
        for (i = 0; i<this.devices().length; i++) {
            if (this.devices()[i].selected()) {
                devices.push(this.devices()[i]);
            }
        }
        
        return devices;
    };
    
    Module.prototype.sendAlert = function() {
        var devices = this.checkedDevices();
        
        if (devices.length==0) {
            app.showErrorToast('Select at least one device, please.')
            return;
        }
        app.showSmallModalWindow('Alert selected devices', 'App.Plasmas.Devices.Alert', {devices: devices});
    };

    return new Module();
});
