/* global Polymer, Platform, padlock, PadlockView, cordova */

(function(Polymer, Platform, util, imp) {
    "use strict";

    Polymer("padlock-import-view", {
        headerOptions: {
            show: true,
            leftIconShape: "left",
            rightIconShape: ""
        },
        titleText: "Import Records",
        inputPlaceholder:
            "Paste your data here! It should be in CSV format, like this:\n" +
            "\n" +
            "Name,Category,Url,Username,Password\n" +
            "Gmail,Work,google.com,Martin,j83jaDK\n" +
            "Twitter,,twitter.com,mclovin,dj83$j\n" +
            "\n" +
            "SecuStore backups are also supported.",
        leftHeaderButton: function() {
            this.fire("back");
        },
        show: function() {
            this.$.rawInput.value = this.inputPlaceholder;
            if (typeof cordova !== "undefined") {
                setTimeout(function() {
                    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
                }, 10);
            }
            PadlockView.prototype.show.apply(this, arguments);
        },
        hide: function() {
            if (typeof cordova !== "undefined") {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            PadlockView.prototype.hide.apply(this, arguments);
        },
        //* Shows password dialog
        requirePassword: function() {
            this.$.errorDialog.open = false;
            this.$.pwdInput.value = "";
            this.$.pwdDialog.open = true;
        },
        startImport: function() {
            // this.$.nameColDialog.open = true;
            var rawStr = this.$.rawInput.value;
            if (!rawStr) {
                return;
            }

            if (imp.isSecuStoreBackup(rawStr)) {
                this.requirePassword();
            } else {
                this.csvData = imp.parseCsv(rawStr);
                this.getNameCol();
            }
        },
        //* Starts the import using the raw input and the provided password
        importSecuStoreBackup: function() {
            this.$.pwdDialog.open = false;
            this.$.progress.show();

            imp.importSecuStoreBackup(this.$.rawInput.value, this.$.pwdInput.value, function(records) {
                this.fire("import", {records: records});
            }.bind(this), function() {
                this.$.errorDialog.open = true;
            }.bind(this));
            this.$.progress.hide();
        },
        importCancel: function() {
            this.$.errorDialog.open = false;
            this.fire("back");
        },
        //* Opens a dialog for selecting a column for record names
        getNameCol: function() {
            this.colNames = this.csvData[0].slice();
            this.nameColOptions = this.colNames;
            // This is to make sure the option elements are generated right away
            // so we can select the first one.
            Platform.performMicrotaskCheckpoint();
            // Select the first column by default
            this.$.nameColSelect.selected = this.$.nameColSelect.options[0];
            this.$.nameColDialog.open = true;
        },
        confirmNameCol: function() {
            var colName = this.$.nameColSelect.selected.innerHTML;

            this.nameColIndex = this.colNames.indexOf(colName);
            this.$.nameColDialog.open = false;
            this.getCatCol();
        },
        //* Opens the dialog for selecting a column for the category
        getCatCol: function() {
            var select = this.$.catColSelect;

            // One column is already taken by the record name
            this.catColOptions = util.remove(this.colNames, this.nameColIndex);
            // The category is optional so we need an option for selecting none of the columns
            this.catColOptions.push("(none)");
            // This is to make sure the option elements are generated right away
            // so we can select the first one.
            Platform.performMicrotaskCheckpoint();
            // Select 'none' by default
            select.selected = select.options[select.options.length-1];
            this.$.catColDialog.open = true;
        },
        confirmCatCol: function() {
            var colName = this.$.catColSelect.selected.innerHTML;

            this.catColIndex = colName == "(none)" ? undefined : this.colNames.indexOf(colName);
            this.$.catColDialog.open = false;
            this.importCsv();
        },
        importCsv: function() {
            var records = imp.importTable(this.csvData, this.nameColIndex, this.catColIndex);

            this.fire("import", {records: records});
        }
    });

})(Polymer, Platform, padlock.util, padlock.import);