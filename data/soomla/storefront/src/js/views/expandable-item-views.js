define("expandableItemViews", ["marionette", "itemViews", "cssUtils", "jquery.fastbutton"], function(Marionette, ItemViews, CssUtils) {


    var ExpandableModule = {
        expanded : false,
        events : {
            fastclick : "onClick"
        },
        onClick : function() {

            // Decide whether to expand or collapse
            this.expanded ? this.collapse() : this.expand();
        },
        expand : function() {
            this.expanded = true;
            this.$el.addClass("expanded");
            this.triggerMethod("expand");
        },
        collapse : function(options) {
            this.expanded = false;
            this.$el.removeClass("expanded");
            this.triggerMethod("collapse", options);
        }
    };

    // Use the vendor specific transitionend event
    var transitionendEvent = CssUtils.getTransitionendEvent();


    var ExpandableUpgradableItemView = ItemViews.UpgradableItemView.extend({
        onUpgradeChange : function() {
            ItemViews.UpgradableItemView.prototype.onUpgradeChange.call(this);
            if (this.collapseOnUpgrade === true) this.collapse({noSound: true});
        }
    });


    var ExpandableEquippableItemView = ItemViews.EquippableItemView.extend({
        onBalanceChange : function() {
            if (this.model.isOwned()) {
                this.$el.addClass("owned");
                if (this.expanded) this.collapse({noSound: true});
            } else {
                this.$el.removeClass("owned");
            }
        }
    });


    var ExpandableSingleUseItemView = ItemViews.SingleUseItemView.extend();
    var ExpandableSingleUsePackView = ItemViews.SingleUsePackView.extend();


    var ExpandableLifetimeItemView = ItemViews.LifetimeItemView.extend({
        onItemOwned : function() {
            if (this.expanded) this.collapse({noSound: true});
        }
    });


    //
    // Extend functionality with expandable module and vendor prefixed transitionend event
    //
    _.each(
        [
            ExpandableUpgradableItemView,
            ExpandableEquippableItemView,
            ExpandableSingleUseItemView,
            ExpandableSingleUsePackView,
            ExpandableLifetimeItemView
        ], function(View) {
        View.mixin = Backbone.View.mixin; // TODO: Solve this hack
        View.mixin(ExpandableModule);
        View.prototype.triggers[transitionendEvent] = "expandCollapseTransitionend";
    });


    return {
        ExpandableUpgradableItemView: ExpandableUpgradableItemView,
        ExpandableEquippableItemView: ExpandableEquippableItemView,
        ExpandableSingleUseItemView : ExpandableSingleUseItemView,
        ExpandableSingleUsePackView : ExpandableSingleUsePackView,
        ExpandableLifetimeItemView  : ExpandableLifetimeItemView
    };
});
