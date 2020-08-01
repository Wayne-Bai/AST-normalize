(function (factory) {
    'use strict';

    var isNode = typeof module === 'object' && typeof exports === 'object';

    ////////////////////

    var root = isNode ? require('../environment.js') : window;

    ////////////////////

    factory(root, isNode);

}(function (root) {
    'use strict';

    var _ = root._, Backbone = root.Backbone,

        chai = root.chai,
        sinon = root.sinon;

    ////////////////////

    var expect = chai.expect;

    ////////////////////

    describe('Backbone.CollectionBinder', function () {

        ////////////////////

        var view, collection, collectionBinder;

        ////////////////////

        // before(function () {
        //
        // });

        // beforeEach(function () {
        //
        // });

        // afterEach(function () {
        //
        // });

        // after(function () {
        //
        // });

        ////////////////////

        describe('#constructor(view, collection, options)', function () {
            it('should initialize the collection binder', function () {

                ////////////////////

                var View = Backbone.View.extend({
                    initialize: function () {
                        collectionBinder = Backbone.CollectionBinder(this, collection, {
                            view: Backbone.View.extend({
                                tagName: 'li',

                                render: function () {
                                    var model = this.model,

                                        text = JSON.stringify({
                                            cid: model.cid,
                                            attributes: model.attributes
                                        });

                                    this.$el.text(text).data('model', model);

                                    return this;
                                }
                            }),

                            dummy: Backbone.View.extend({
                                render: function () {
                                    this.$el.text('List is empty').data('view', this);

                                    return this;
                                }
                            }),

                            selector: function (model) {
                                return model ? (model.id % 2 === 0 ? '.odd' : '.even') : null;
                            }
                        });
                    }
                });

                ////////////////////

                collection = new Backbone.Collection([
                    { id: 0 },
                    { id: 1 },
                    { id: 2 },
                    { id: 3 },
                    { id: 4 },
                    { id: 5 },
                    { id: 6 },
                    { id: 7 },
                    { id: 8 },
                    { id: 9 }
                ], {
                    comparator: 'id'
                });

                view = new View({
                    el: '#list-fixture'
                });

                expect(collectionBinder).to.be.an.instanceOf(Backbone.CollectionBinder);
            });
        });

        describe('#listen(options)', function () {
            it('should start listening events of the collection', function () {
                collectionBinder.listen();
            });
        });

        describe('#view.render()', function () {

        });

        describe('#view.remove()', function () {

        });

        describe('#collection.add(models, options)', function () {
            it('add model', function () {
                var $oddIdList = view.$('.odd'), $evenIdList = view.$('.even');

                collection.add({ id: 10 });
                expect($oddIdList.children().last().data('model')).to.equal(collection.get(10));

                collection.add({ id: 11 });
                expect($evenIdList.children().last().data('model')).to.equal(collection.get(11));
            });
        });

        describe('#collection.remove(models, options)', function () {
            it('remove model', function () {
                var $oddIdList = view.$('.odd'), $evenIdList = view.$('.even');

                collection.remove({ id: 10 });
                expect($oddIdList.children().last().data('model')).to.equal(collection.get(8));

                collection.remove({ id: 11 });
                expect($evenIdList.children().last().data('model')).to.equal(collection.get(9));
            });
        });

        describe('#collection.reset(models, options)', function () {
            it('reset models', function () {
                var $oddIdList = view.$('.odd'), $evenIdList = view.$('.even');

                collection.reset([
                    { id: 10 },
                    { id: 11 }
                ]);

                expect($oddIdList.children().length).to.equal(1);
                expect($evenIdList.children().length).to.equal(1);

                expect($oddIdList.children().first().data('model')).to.equal(collection.get(10));
                expect($evenIdList.children().first().data('model')).to.equal(collection.get(11));
            });
        });

        describe('#collection.sort(options)', function () {
            it('sort models', function () {
                var $oddIdList = view.$('.odd'), $evenIdList = view.$('.even');

                collection.add({ id: -1 });
                expect($evenIdList.children().first().data('model')).to.equal(collection.get(-1));

                collection.add({ id: -2 });
                expect($oddIdList.children().first().data('model')).to.equal(collection.get(-2));
            });
        });
    });

    ///////////
    // TESTS //
    ///////////

    //    test('initialize with models', function () {
    //        var collection = this.collection, view = this.view,
    //            $oddIdList = view.$('.odd'), $evenIdList = view.$('.even');
    //
    //        deepEqual($oddIdList.children().map(function () {
    //            return $(this).data('model');
    //        }).get(), collection.filter(function (model) {
    //            return model.id % 2 === 0;
    //        }));
    //
    //        deepEqual($evenIdList.children().map(function () {
    //            return $(this).data('model');
    //        }).get(), collection.filter(function (model) {
    //            return model.id % 2 === 1;
    //        }));
    //    });
    //
    //    test('dummy', function () {
    //        var collection = this.collection, view = this.view, collectionBinder = view.collectionBinder;
    //
    //        collection.reset();
    //        ok(view.$el.children().last().data('view'));
    //        ok(_.has(collectionBinder, 'dummy'));
    //
    //        collection.add({ id: 0 });
    //        ok(!view.$el.children().last().data('view'));
    //        ok(_.has(collectionBinder, 'dummy'));
    //
    //        collection.remove({ id: 0 });
    //        ok(view.$el.children().last().data('view'));
    //        ok(_.has(collectionBinder, 'dummy'));
    //
    //        collection.reset({ id: 0 });
    //        ok(!view.$el.children().last().data('view'));
    //        ok(!_.has(collectionBinder, 'dummy'));
    //    });
}));
