
QUnit.specify("jQuery.fasten", function() {
    var specification = function() {
        
        // setup some helpers        

        // capture local references to current jquery objects
        // since the globals may get out of sync in the async
        // test runner
        var $ = window.$,
            jQuery = window.jQuery;
        
        describe("jQuery.fn.fasten", function(){
            var shim, fastenedItem, viewportHeight,
                fastenRaised = false,
                unfastenRaised = false;
            
            before(function(){
                viewportHeight = $(window).height();
                shim = $('<div class="shim"><p>shim</p></div>').css({height:viewportHeight});
                fastenedItem = $('<div class="fasten_me"><p>fastenable</p></div>');
                $('#testbed').append(shim.clone());
                $('#testbed').append(fastenedItem);
                $('#testbed').append(shim.clone());
                $('#testbed').append(shim.clone());
                $('#testbed').append(shim.clone());
                fastenedItem
                    .bind('fasten', function(){ fastenRaised = true; })
                    .bind('unfasten', function(e){ unfastenRaised = true; });
            });
            after(function(){
                $(window).unbind('scroll');
                $(window).scrollTop(0).scroll();
                $('#testbed').empty();
                fastenedItem = null;
                shim = null;
                fastenRaised = false;
                unfastenRaised = false;
            });
            describe("defaults", function(){
                it("should have padding of 10", function(){
                    assert($.fn.fasten.defaults.padding).equals(10);
                });
            });
            describe("on parent's scroll event", function(){
                describe("if should be fixed ", function(){
                    before(function(){
                        fastenedItem.fasten();
                        // scroll past the fold
                        $(window).scrollTop(viewportHeight * 3).scroll();
                    });
                    describe("if not currently fixed", function(){
                        it("should fix it ", function(){
                            assert(fastenedItem.css('position')).equals('fixed');                            
                        });
                        it("should raise fasten event", function(){
                            assert(fastenRaised).isTrue();
                            assert(unfastenRaised).isFalse();
                        });
                    });
                    describe("if already fixed", function(){
                        before(function(){
                            // reset state event capturers after the parent before
                            // has already run and scrolled/fixed the item
                            fastenRaised = unfastenRaised = false;                            
                        });
                        it("should not change css", function(){
                            // mock $.fn.css to capture any calls to it
                            // alert(fastenedItem.css('position'));
                            var originalCss = $.fn.css,
                                cssCalled = false;
                            try{
                                                                
                                $.fn.css = function(){
                                    cssCalled = true;
                                    return this;
                                };
                                $(window).scrollTop(viewportHeight * 3).scroll();                                
                                assert(cssCalled).isFalse("yes, this currently fails in ie.  TODO: make this pass in IE");
                            } finally {
                                $.fn.css = originalCss;                                
                            }
                        });
                        it("should not re-raise fasten event", function(){
                            assert(fastenRaised).isFalse();
                            assert(unfastenRaised).isFalse();                            
                        });
                    });
                });
                describe("if should not be fixed", function(){
                   describe("if fixed", function(){
                        before(function(){
                            fastenedItem.fasten();                            
                            // scroll past the fold to trigger it being fixed
                            $(window).scrollTop(viewportHeight * 2).scroll();
                            // scroll back up to to where it shouldn't be fixed
                            $(window).scrollTop(0).scroll();                        
                        });
                        it("should revert css changes", function(){
                            assert(fastenedItem.css('position')).equals('static');
                        });
                        it("should raise unfasten event", function(){
                            assert(unfastenRaised).isTrue();
                        });
                    });
                    describe("if not fixed", function(){
                        before(function(){
                            fastenedItem.fasten();                            
                        });
                        it("should not change css", function(){
                            // mock $.fn.css to capture any calls to it
                            var originalCss = $.fn.css,
                                cssCalled = false;
                            try{
                                $.fn.css = function(){
                                    cssCalled = true;                                    
                                };
                                // scroll to a point where would not be fixed
                                $(window).scrollTop(viewportHeight * 0.1).scroll();                                
                                assert(cssCalled).isFalse();
                            } finally {
                                $.fn.css = originalCss;                                
                            }
                        });
                        it("should not raise unfasten event", function(){
                            // scroll to a point where would not be fixed
                            $(window).scrollTop(viewportHeight * 0.1).scroll();                                
                            assert(unfastenRaised).isFalse();                            
                        });
                    });
                });
            });
        });
    };
    
    /**
     * naive replication of $.each since 
     * jquery is not defined at this point
     */
    var each = function(items, fn) {
        for(var i=0;i<items.length;i++) {
            var item = items[i];
            fn(item);
        }
    };
    
    /**
     * run entire test suite against multiple loaded versions
     * of jquery.
     * 
     * Assumes they have each been loaded and set to notConflict(true)
     * aliased as jq14, jq13, etc.
     */
    each(["1.3.2","1.4.1","1.4.2"], function(version) {
        describe("in jQ " + version, function(){
            $ = jQuery = window['jq_' + version.replace(/\./g,'_')];
            specification();                    
        });        
    });    
});