chorus.views.ExistingTableImportDataGrid = chorus.views.ImportDataGrid.extend({
    templateName: 'existing_table_import_data_grid',
    constructorName: "ExistingTableImportDataGrid",
    headerRowHeight: 32,

    customizeHeaderRows: function(sourceColumns, columnNames) {
        this.sourceColumns = sourceColumns;

        this.appendMappings();
        this.destinationMenus = [];
        this.columnMapping = _.map(this.sourceColumns, function() { return null; });
        this.setupColumnMapping();
    },

    additionalContext: function() {
        return {
            destinationColumns: this.destinationColumns
        };
    },

    setDestinationColumns: function(columnSet) {
        this.destinationColumns = _.map(columnSet, function(column) {
            return { name: column.name(), type: chorus.models.DatabaseColumn.humanTypeMap[column.get("typeCategory")] };
        });
    },

    appendMappings: function() {
        // TODO: Template
        var $mappings = this.$(".slick-headerrow-column");
        $mappings.addClass("column_mapping");
        $mappings.append("<span>" + t('dataset.import.table.existing.map_to') + "</span>");

        $mappings.append('<a href="#" class="selection_conflict"></a>');
        $mappings.find("a").append(
            '<span class="destination_column_name">' +
                t('dataset.import.table.existing.select_one') +
                '</span><span class="arrow"/>');
    },

    setupColumnMapping: function() {
        _.each(this.$(".column_mapping a"), function (map, i) {
            var menuContent = this.$(".menu_content ul").clone();
            this.destinationMenus[i] = menuContent;
            this.menu($(map), {
                content: menuContent,
                classes: "table_import_csv",
                contentEvents: {
                    'a.name': this.destinationColumnSelected
                },
                position: {
                    my: "left center",
                    at: "right center"
                },
                mimic: "left center"
            });
        }, this);
    },

    destinationColumnSelected: function(e, api) {
        e.preventDefault();
        var destinationColumnLinks = this.$(".column_mapping a");
        var qtipLaunchLink = api.elements.target;
        var selectedColumnName = $(e.target).attr("title");
        var selectedColumnIndex = destinationColumnLinks.index(qtipLaunchLink);
        this.columnMapping[selectedColumnIndex] = selectedColumnName;
        this.updateDestinations();
    },

    updateDestinations: function() {
        var frequenciesByDestinationColumn = {};
        _.each(this.columnMapping, function(name) {
            if (!name) return;
            frequenciesByDestinationColumn[name] = _.filter(this.columnMapping, function(name2) {
                return name && name === name2;
            }).length;
        }, this);

        var frequenciesBySourceColumn = _.map(this.columnMapping, function(name) {
            return frequenciesByDestinationColumn[name];
        });

        this.updateDestinationLinks(frequenciesByDestinationColumn);
        this.updateDestinationMenus(frequenciesByDestinationColumn);
        this.updateDestinationCount(frequenciesBySourceColumn);
    },

    updateDestinationLinks: function(frequencies) {
        var launchLinks = this.$(".column_mapping a");
        _.each(launchLinks, function(launchLink, i) {
            launchLink = $(launchLink);
            var columnName = this.columnMapping[i];
            var frequency = frequencies[columnName];

            launchLink.find(".destination_column_name").text(columnName || t("dataset.import.table.existing.select_one"));
            launchLink.toggleClass("selected", (frequency === 1));
            launchLink.toggleClass("selection_conflict", (frequency !== 1));
        }, this);
    },

    updateDestinationMenus: function(frequencies) {
        _.each(this.destinationMenus, function(menu, i) {
            menu.find(".count").text("");
            menu.find(".name").removeClass("selected");
            _.each(this.columnMapping, function(name) {
                var frequency = frequencies[name];
                if (frequency > 0) {
                    menu.find("li[name='" + name + "'] .count").text(" (" + frequency + ")");
                }
                if (frequency > 1) {
                    menu.find("li[name='" + name + "'] .name").addClass("selection_conflict");
                }
            });

            var $selectedLi = menu.find("li[name='" + this.columnMapping[i] + "']");
            menu.find(".check").addClass("hidden");
            $selectedLi.find(".check").removeClass("hidden");
            $selectedLi.find(".name").addClass("selected");
        }, this);
    },

    updateDestinationCount: function(frequenciesByDestinationColumn) {
        var count = _.compact(this.columnMapping).length;
        var total = this.sourceColumns.length;
        if (count > total) {
            count = total;
        }

        this.trigger('updatedDestinationCount', {count: count, total: total, frequencies: frequenciesByDestinationColumn});
    },

    automap: function() {
        for(var i = 0; i< this.sourceColumns.length; i++) {
            this.columnMapping[i] = this.destinationColumns[i].name;
        }

        this.updateDestinations();
    }
});