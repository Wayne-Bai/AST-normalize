//= require ./data_source
chorus.models.DataSource = chorus.models.AbstractDataSource.extend({
    constructorName: 'DataSource',

    urlTemplate: 'data_sources/{{id}}',
    entityType: 'data_source',

    canHaveIndividualAccounts: function() {
        return true;
    },

    isShared: function() {
        return !!this.get('shared');
    },

    isGreenplum: function() {
        return this.get('entityType') === 'gpdb_data_source';
    },

    isPostgres: function() {
        return this.get('entityType') === 'pg_data_source';
    },

    isOracle: function() {
        return this.get('entityType') === 'oracle_data_source';
    },

    isJdbc: function() {
        return this.get('entityType') === 'jdbc_data_source';
    },

    isJdbcHive: function() {
        return this.get('entityType') === 'jdbc_hive_data_source';
    },

    accounts: function() {
        this._accounts || (this._accounts = new chorus.collections.DataSourceAccountSet([], {dataSourceId: this.get("id")}));
        return this._accounts;
    },

    accountForUser: function(user) {
        return new chorus.models.DataSourceAccount({ dataSourceId: this.get("id"), userId: user.get("id") });
    },

    accountForCurrentUser: function() {
        if(!this._accountForCurrentUser) {
            this._accountForCurrentUser = this.accountForUser(chorus.session.user());
            this._accountForCurrentUser.bind("destroy", function() {
                delete this._accountForCurrentUser;
                this.trigger("change");
            }, this);
        }
        return this._accountForCurrentUser;
    },

    accountForOwner: function() {
        var ownerId = this.get("owner").id;
        return _.find(this.accounts().models, function(account) {
            return account.get("owner").id === ownerId;
        });
    },

    usage: function() {
        if(this.isOracle() || this.isJdbc() || this.isJdbcHive() ) {
            return null;
        }
        if(!this.dataSourceUsage) {
            this.dataSourceUsage = new chorus.models.DataSourceUsage({ dataSourceId: this.get('id')});
        }
        return this.dataSourceUsage;
    },

    hasWorkspaceUsageInfo: function() {
        return this.usage().has("workspaces");
    },

    sharing: function() {
        if(!this._sharing) {
            this._sharing = new chorus.dialogs.DataSourceSharing({dataSourceId: this.get("id")});
        }
        return this._sharing;
    },

    sharedAccountDetails: function() {
        return this.accountForOwner() && this.accountForOwner().get("dbUsername");
    },

    declareValidations: function(newAttrs) {
        this.require("name", newAttrs);
        this.requirePattern("name", chorus.ValidationRegexes.MaxLength64(), newAttrs);

        this.require("host", newAttrs);
        this.require("port", newAttrs);
        this.require("dbName", newAttrs);
        this.requirePattern("port", chorus.ValidationRegexes.OnlyDigits(), newAttrs);
        if (this.isNew()) {
            this.require("dbUsername", newAttrs);
            this.require("dbPassword", newAttrs);
        }
    }
});
