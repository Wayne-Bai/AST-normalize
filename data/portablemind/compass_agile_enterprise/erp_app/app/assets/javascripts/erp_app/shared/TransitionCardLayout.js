Ext.define("Compass.ErpApp.Shared.TransitionCardLayout", {
    extend: 'Ext.layout.CardLayout',

    alias: 'layout.transitioncard',
    type: 'transitioncard',

    /*
     *
     * @prarams
     * newCard (Component) new component to show
     * options (Hash) options for transitions
     *   - transitionType {slide | crossFade} default slide
     *       type of transition to use
     *
     */

    setActiveItem: function (newCard, options) {
        var me = this,
            options = options || {transitionType: 'slide'},
            owner = me.owner,
            oldCard = me.activeItem,
            rendered = owner.rendered,
            oldIndex,
            newIndex;

        newCard = me.parseActiveItem(newCard);
        newIndex = owner.items.indexOf(newCard);
        oldIndex = owner.items.indexOf(oldCard);

        // If the card is not a child of the owner, then add it.
        // Without doing a layout!
        if (newIndex == -1) {
            newIndex = owner.items.items.length;
            Ext.suspendLayouts();
            newCard = owner.add(newCard);
            Ext.resumeLayouts();
        }

        if (newCard && oldCard != newCard) {
            // Fire the beforeactivate and beforedeactivate events on the cards
            if (newCard.fireEvent('beforeactivate', newCard, oldCard) === false) {
                return false;
            }
            if (oldCard && oldCard.fireEvent('beforedeactivate', oldCard, newCard) === false) {
                return false;
            }

            if (rendered) {
                Ext.suspendLayouts();

                // If the card has not been rendered yet, now is the time to do so.
                if (!newCard.rendered) {
                    me.renderItem(newCard, me.getRenderTarget(), owner.items.length);
                }

                if (options.transitionType == 'slide') {
                    if (newIndex > oldIndex) {
                        oldCardSlideDirection = 'l';
                        newCardSlideDirection = 'r';
                    }
                    else {
                        oldCardSlideDirection = 'r';
                        newCardSlideDirection = 'l';
                    }

                    if (oldCard) {
                        oldCard.el.slideOut(oldCardSlideDirection, {
                            duration: 500,
                            callback: function () {
                                if (me.hideInactive) {
                                    oldCard.hide();
                                    oldCard.hiddenByLayout = true;
                                }
                                oldCard.fireEvent('deactivate', oldCard, newCard);

                                // Make sure the new card is shown
                                if (newCard.hidden) {
                                    newCard.show();
                                }

                                // Layout needs activeItem to be correct, so set it if the show has not been vetoed
                                if (!newCard.hidden) {
                                    me.activeItem = newCard;
                                }

                                Ext.resumeLayouts(true);

                                newCard.el.slideIn(newCardSlideDirection,{
                                    duration: 500
                                });

                            },
                            scope: this
                        });
                    }
                }
                else if(options.transitionType == 'crossFade') {
                    if (oldCard) {
                        if (me.hideInactive) {
                            oldCard.getEl().stopAnimation();
                            oldCard.getEl().animate({
                                duration: 500,
                                from: { opacity: 1 },
                                to: { opacity: 0 },
                                listeners: {
                                    afteranimate: function () {
                                        oldCard.hide();
                                        oldCard.getEl().setDisplayed('none');
                                    }
                                }
                            });

                            oldCard.hiddenByLayout = true;
                        }
                        oldCard.fireEvent('deactivate', oldCard, newCard);
                    }

                    newCard.getEl().stopAnimation();
                    if (newCard.hidden) {
                        newCard.show();
                        newCard.getEl().setStyle({
                            position: 'absolute',
                            opacity: 0,
                            top: 0
                        });

                        newCard.getEl().animate({
                            duration: 500,
                            from: { opacity: 0 },
                            to: { opacity: 1 },
                            listeners: {
                                afteranimate: function () {
                                    newCard.getEl().setStyle({ position: '' });
                                }
                            }
                        });
                    }

                    me.activeItem = newCard;

                    Ext.resumeLayouts(true);
                }


            } else {
                me.activeItem = newCard;
            }

            newCard.fireEvent('activate', newCard, oldCard);

            return me.activeItem;
        }

        return false;
    }
});