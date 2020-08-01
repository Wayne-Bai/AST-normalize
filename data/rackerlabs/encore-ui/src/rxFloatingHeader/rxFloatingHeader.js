/**
 * @ngdoc directive
 * @name encore.ui.rxFloatingHeader:rxFloatingHeader
 * @description
 * Turns a tableheader into a floating persistent header
 */
angular.module('encore.ui.rxFloatingHeader', ['encore.ui.rxMisc'])
.directive('rxFloatingHeader', function (rxDOMHelper) {
    return {
        restrict: 'A',
        controller: function ($scope) {
            this.update = function () {
                // It's possible for a child directive to try to call this
                // before the rxFloatingHeader link function has been run,
                // meaning $scope.update won't have been configured yet
                if (_.isFunction($scope.update)) {
                    $scope.update();
                }
            };
        },
        link: function (scope, table) {
            var state, seenFirstScroll, trs, ths, clones, inputs, maxHeight, header, singleThs, maxThWidth;

            var setup = function () {

                if (clones && clones.length) {
                    _.each(clones, function (clone) {
                        // Possible memory leak here? I tried clone.scope().$destroy(),
                        // but it causes exceptions in Angular
                        clone.remove();
                    });
                }
                state = 'fixed',
                seenFirstScroll = false,

                // The original <tr> elements
                trs = [],

                // The original <th> elements
                ths = [],

                // All <th> elements that are the *only* <th> in their row
                singleThs = [],

                // The maximum width we could find for a <th>
                maxThWidth = 0,

                // Clones of the <tr> elements
                clones = [],

                // any <input> elements in the <thead>
                inputs = [],
                maxHeight,
                header = angular.element(table.find('thead'));
                
                // Are we currently floating?
                var floating = false;
                // Grab all the original `tr` elements from the `thead`,
                _.each(header.find('tr'), function (tr) {
                    tr = angular.element(tr);

                    // If `scope.setup()` has been called, it means we'd previously
                    // worked with these rows before. We want them in as clean a state as possible
                    if (!floating && tr.hasClass('rx-floating-header')) {
                        floating = true;
                    }

                    // We are going to clone all the <tr> elements in the <thead>, and insert them
                    // into the DOM whenever the original <tr> elements need to float. This keeps the
                    // height of the table correct, and prevents it from jumping up when we put
                    // the <tr> elements into a floating state.
                    // It also makes sure the column widths stay correct, as the widths of the columns
                    // are determined by the current fixed header, not the floating header.
                    var clone = tr.clone();
                    clones.push(clone);
                    if (floating) {
                        clone.removeClass('rx-floating-header');
                    }

                    if (floating) {
                        // We're currently floating, so add the class back, and
                        // push the clone back on
                        header.append(clone);
                    }
                    trs.push(tr);

                    var thsInTr = _.map(tr.find('th'), angular.element);
                    ths = ths.concat(thsInTr);

                    // This <tr> only had one <th> in it. Grab that <th> and its clone
                    // Also grab the width of the <th>, and compare it to our max width.
                    // We need to do this because if a <th> was hidden, and then made to
                    // appear while floating, its width will be too short, and will need
                    // to be updated
                    if (thsInTr.length === 1) {
                        var th = thsInTr[0];
                        var width = rxDOMHelper.width(th);
                        if (width !== 'auto') {
                            var numeric = _.parseInt(width);
                            if (numeric > maxThWidth) {
                                maxThWidth = numeric;
                            }
                        }

                        singleThs.push([th, angular.element(clone.find('th'))]);
                    }
                });

                // Explicitly set the width on every <th> that is the *only*
                // <th> in its <tr>
                maxThWidth = maxThWidth.toString() + 'px';
                _.each(singleThs, function (thPair) {
                    thPair[0].css({ width: maxThWidth });
                    thPair[1].css({ width: maxThWidth });
                });

                // Apply .filter-header to any <input> elements
                _.each(ths, function (th) {
                    var input = th.find('input');
                    if (input.length) {
                        var type = input.attr('type');
                        if (!type || type === 'text') {
                            th.addClass('filter-header');
                            input.addClass('filter-box');
                            inputs.push(input);
                        }
                    }
                });
            };

            setup();

            scope.updateHeaders = function () {
                if (_.isUndefined(maxHeight)) {
                    maxHeight = table[0].offsetHeight;
                }

                maxHeight = _.max([maxHeight, table[0].offsetHeight]);

                if (rxDOMHelper.shouldFloat(table, maxHeight)) {
                    if (state === 'fixed') {
                        state = 'float';
                        var thWidths = [],
                            trHeights = [];

                        // Get the current height of each `tr` that we want to float
                        _.each(trs, function (tr) {
                            trHeights.push(parseInt(rxDOMHelper.height(tr)));
                        });

                        // Grab the current widths of each `th` that we want to float
                        thWidths = _.map(ths, rxDOMHelper.width);

                        // Put the cloned `tr` elements back into the DOM
                        _.each(clones, function (clone) {
                            header.append(clone);
                        });

                        // Apply the rx-floating-header class to each `tr` and
                        // set a correct `top` for each, to make sure they stack
                        // properly
                        // We previously did tr.css({ 'width': rxDOMHelper.width(tr) })
                        // but it *seems* that setting the widths of the `th` is enough
                        var topOffset = 0;
                        _.each(trs, function (tr, index) {
                            tr.addClass('rx-floating-header');
                            tr.css({ 'top': topOffset.toString() + 'px' });
                            topOffset += trHeights[index];
                        });

                        // Explicitly set the widths of each `th` element that we floated
                        _.each(_.zip(ths, thWidths), function (pair) {
                            var th = pair[0];
                            var width = pair[1];
                            th.css({ 'width': width });
                        });
                    }

                } else {
                    if (state === 'float' || !seenFirstScroll) {
                        state = 'fixed';
                        seenFirstScroll = true;

                        // Make sure that an input filter doesn't have focus when
                        // we re-dock the header, otherwise the browser will scroll
                        // the screen back up ot the input
                        _.each(inputs, function (input) {
                            if (rxDOMHelper.scrollTop() > rxDOMHelper.offset(input).top) {
                                input[0].blur();
                            }
                        });

                        _.each(trs, function (tr) {
                            tr.removeClass('rx-floating-header');
                        });

                        // Detach each cloaned `tr` from the DOM,
                        // but don't destroy it
                        _.each(clones, function (clone) {
                            clone.remove();
                        });
                    }
                }

            };

            rxDOMHelper.onscroll(function () {
                scope.updateHeaders();
            });

            scope.update = function () {
                setup();
            };
        },
    };
});
