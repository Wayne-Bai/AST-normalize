chorus.views.TypeAheadSearch = chorus.views.Base.extend({
    constructorName: "TypeAheadSearchView",
    templateName: "type_ahead_search",
    additionalClass: "menu", // dismiss it like the other popups
    resultLimit: 5,

    makeModel: function() {
        this._super("makeModel", arguments);
        this.resource = this.model = new chorus.models.TypeAheadSearchResult();
        this.requiredResources.push(this.resource);
    },

    context: function() {
        var ctx = {
            query: this.model.get("query"),
            limitSearch: chorus.models.Config.instance().license().limitSearch()
        };
        ctx.results = _.map(_.first(this.model.results(), this.resultLimit), function(result) {

            var isBinaryHdfs = result.get('entityType') === 'hdfs_file' && ( result.get('isBinary') !== false );

            return {
                name: result.highlightedName(),
                type: t("type_ahead.entity." + this.entityTypeForResult(result)),
                url: result.showUrl(),
                linkable : !isBinaryHdfs
            };
        }, this);

        return ctx;
    },

    entityTypeForResult: function(result) {
        if(result.get('entityType') === 'dataset' && result.get('entitySubtype') === 'CHORUS_VIEW') {
            return 'chorusView';
        }
        return result.get('entityType');
    },

    handleKeyEvent: function(event) {
        switch (event.keyCode) {
        case 40:
            this.downArrow();
            break;
        case 38:
            this.upArrow();
            break;
        case 13:
            this.enterKey();
            if (this.$("li.selected").length > 0) { event.preventDefault(); }
            break;
        }
    },

    downArrow: function() {
        var selectedLi = this.$("li.selected");
        if (selectedLi.length) {
            var nextLi = selectedLi.next("li");
            if (nextLi.length) {
                nextLi.addClass("selected");
                selectedLi.removeClass("selected");
            }
        } else {
            this.$("li").eq(0).addClass("selected");
        }
    },

    upArrow: function() {
        var selectedLi = this.$("li.selected");
        if (selectedLi.length) {
            var prevLi = selectedLi.prev("li");
            if (prevLi.length) {
                prevLi.addClass("selected");
            }

            selectedLi.removeClass("selected");
        }
    },

    disableSearch: function() {
        this.searchDisabled = true;
    },

    enterKey: function() {
        if (!this.searchDisabled) {
            var selectedLi = this.$("li.selected");
            if(selectedLi.length) {
                chorus.router.navigate(selectedLi.find("a").attr("href"));
            }
        }
    },

    searchFor: function(query) {
        var trimmedQuery = query.trim();
        if (trimmedQuery && trimmedQuery !== "" ){
            this.model.set({query: trimmedQuery}, {silent: true});
            this.model.fetch();
            return true;
        } else {
            return false;
        }
    }
});
