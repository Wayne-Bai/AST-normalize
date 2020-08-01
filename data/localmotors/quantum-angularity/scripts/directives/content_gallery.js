var App = angular.module('Hexangular');

/**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
* Content Gallery Directive -
* Requires Modernizr detect: cssanimations
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
App.directive('contentGallery', ['$rootScope', '$timeout', '$q', function($rootScope, $timeout, $q) {

    return {
        restrict: 'A',
        template: '@@include("../../partials/content_gallery.html")',
        replace: false,
        scope: {
            smallImageList: '=',
            mediumImageList: '=',
            largeImageList: '=',
            thumbnailImageList: '=',

            thumbnailWidth: '@',
            thumbnailHeight: '@',

            smallWidth: '@',
            mediumWidth: '@',
            largeWidth: '@'
        },

        link: function($scope, $element, $attrs) {

            // contants
            var DEBOUNCE_TIME = 350,                // time to delay keydown fire event
                SCROLL_MARGIN = 15,                 // margin below height overflow images
                SWIPE_VELOCITY = 0.4,               // swipe left/right activation velocity
                DRAG_DISTANCE_THRESHOLD = 20;       // distance before dragging overrides tap

            // properties
            var ctrlModifier = false,
                slideInTransition = false,
                cssanimations = false,
                lastDelta = 0,
                disableSlideNavigation = false,
                currentGallerySize = null,

                windowHeight = 0,
                activeHeight = 0,
                currentSlide = null;

            // promises
            var smallImagesDeferred = $q.defer(),
                mediumImagesDeferred = $q.defer(),
                largeImagesDeferred = $q.defer(),
                thumbnailImagesDeferred = $q.defer();

            // functions
            var throttledKeydownHandler = keydownHandler.throttle(DEBOUNCE_TIME);

            // jquery elements
            var $htmlRoot = $('html'),
                $contentGallery = $element,
                $galleryContainer = $element.find('.gallery-container'),
                $slideContainer = $element.find('.slide-container'),
                $activeSlide = null;

            // scope data
            $scope.imageList = [];
            $scope.embeddedList = [];
            $scope.fullscreenList = [];

            $scope.state = {
                'fullscreen': false,
                'transitions': true,
                'slideActive': false,
                'slideCount': 0,
                'currentSlideIndex': -1,
                'slideContainerWidth': 0,
                'slideWidth': 0
            };

            $scope.slideContainerStyle = {};
            $scope.galleryContainerStyle = {};
            $scope.galleryInterfaceStyle = {};
            $scope.slideStyle = {};

            initialize();

            /* initialize -
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
            function initialize() {

                // watch: smallImageList
                $scope.$watch('smallImageList', function(smallImageList, oldValue) {

                    // if smallImageList is string
                    if (typeof smallImageList === 'string') {
                        $scope.smallImageList = parseImageListString(smallImageList);
                    }
                    smallImagesDeferred.resolve();
                });

                // watch: mediumImageList
                $scope.$watch('mediumImageList', function(mediumImageList, oldValue) {

                    // if mediumImageList is string
                    if (typeof mediumImageList === 'string') {
                        $scope.mediumImageList = parseImageListString(mediumImageList);
                    }
                    mediumImagesDeferred.resolve();
                });

                // watch: largeImageList
                $scope.$watch('largeImageList', function(largeImageList, oldValue) {

                    // if largeImageList is string
                    if (typeof largeImageList === 'string') {
                        $scope.largeImageList = parseImageListString(largeImageList);
                    }
                    largeImagesDeferred.resolve();
                });

                // watch: thumbnailImageList
                $scope.$watch('thumbnailImageList', function(thumbnailImageList, oldValue) {

                    // if thumnailList is string
                    if (typeof thumbnailImageList === 'string') {
                        $scope.thumbnailImageList = parseImageListString(thumbnailImageList);
                    }
                    thumbnailImagesDeferred.resolve();
                });

                // wait for all promises to resolve
                $q.all([smallImagesDeferred.promise, mediumImagesDeferred.promise, largeImagesDeferred.promise, thumbnailImagesDeferred.promise]).then(function(arrayOfResults) {

                    renderContentGallery();
                });
            }

             /* createEventHandlers -
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
            function createEventHandlers() {

                // window: resized
                $(window).on('resize', function(e) {

                    // update window height
                    windowHeight = $(window).height();

                    var gallerySize = getGallerySize($scope.state.fullscreen);

                    // load new gallery
                    if (gallerySize !== currentGallerySize) {

                        currentGallerySize = gallerySize;

                        loadGallery($scope.state.currentSlideIndex);
                    }

                    $timeout(function() {
                        setGalleryHeight();
                    }, 500);
                });

                // window: keyup
                $(window).on('keydown', function(e) {
                    throttledKeydownHandler(e.which);
                });

                // window: keyup
                $(window).on('keyup', function(e) {

                    disableSlideNavigation = false;

                    // reset throttle
                    throttledKeydownHandler = keydownHandler.throttle(DEBOUNCE_TIME);

                    // ctrl
                    if (e.which === 17) {
                        ctrlModifier = false;

                    // escape
                    } else if (e.which === 27) {

                        $rootScope.safeApply(function() {
                            disableFullscreen();
                        });
                    }
                });

                // content gallery: mousedown
                $contentGallery.on('mousedown', function(e) {
                    disableSlideNavigation = false;
                });

                // content gallery: drag
                $contentGallery.hammer().on('drag', function(e) {

                    if ($scope.state.fullscreen) {

                        var delta = e.gesture.deltaY;

                        rafId = requestAnimationFrame(function() {
                            scrollCurrentSlideBy(delta);
                        });

                        e.gesture.preventDefault();
                    }
                });

                // content gallery: drag end
                $contentGallery.hammer().on('dragend', function(e) {

                    if ($scope.state.fullscreen) {

                        // disable slide navigation if drag distance greater than threshold
                        if (e.gesture.distance > DRAG_DISTANCE_THRESHOLD) {
                            disableSlideNavigation = true;
                        }
                        lastDelta = 0;

                        e.gesture.preventDefault();
                    }
                });

                // content gallery: tap
                $contentGallery.hammer().on('tap', function(e) {
                    disableSlideNavigation = false;
                });

                // content gallery: tap
                $contentGallery.hammer().on('release', function(e) {
                    disableSlideNavigation = false;
                });

                // content gallery: swipeleft
                $contentGallery.hammer({'swipe_velocity': SWIPE_VELOCITY}).on('swipeleft', function(e) {
                    $rootScope.safeApply(function() {
                        nextSlide();
                    });
                });

                // content gallery: swiperight
                $contentGallery.hammer({'swipe_velocity': SWIPE_VELOCITY}).on('swiperight', function(e) {
                    $rootScope.safeApply(function() {
                        previousSlide();
                    });
                });

                // slideContainer: transitionend
                $slideContainer.bind('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd msTransitionEnd', function() {
                    slideInTransition = false;
                });

                // thumbnail-gallery:set-active
                $scope.$on('thumbnail-gallery:set-active', function(e, index) {
                    setActiveSlide(index, false);
                });

                // imageViewer: mousewheel
                $contentGallery.bind('mousewheel', handleMouseWheelEvent);
            }

            /* parseImageListString -
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
            function parseImageListString(imageListString) {

                var imageURLs = imageListString.split(',');
                var imageObjectList = [];

                imageURLs.each(function(url) {

                    if (url) {
                        imageObjectList.push({'url': url});
                    }
                });

                return imageObjectList;
            }

            /* renderContentGallery -
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
            function renderContentGallery() {

                createEventHandlers();

                // set window height
                windowHeight = $(window).height();

                // convert to integer
                $scope.thumbnailHeight = parseInt($scope.thumbnailHeight, 10);
                $scope.thumbnailWidth = parseInt($scope.thumbnailWidth, 10);

                // modernizr detect cssanimations
                if ($htmlRoot.hasClass('cssanimations')) {
                    cssanimations = true;
                }

                // calculate container and slide width
                $scope.state.slideCount = $scope.largeImageList.length;
                $scope.state.slideContainerWidth = $scope.state.slideCount * 100;
                $scope.state.slideWidth = 100 / $scope.state.slideCount;

                // apply basic gallery styles
                $scope.slideContainerStyle = {
                    'width': $scope.state.slideContainerWidth + '%'
                };
                $scope.galleryInterfaceStyle = {
                    'bottom': $scope.thumbnailHeight + 'px'
                };
                $scope.slideStyle = {
                    'width': $scope.state.slideWidth + '%'
                };

                // load gallery
                loadGallery(0);
            }

            /* loadGallery -
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
            function loadGallery(activeIndex) {

                currentGallerySize = getGallerySize($scope.state.fullscreen),

                $scope.imageList = getImageList(currentGallerySize, $scope.state.fullscreen);

                // load images
                $scope.imageList.each(function(image, index) {
                    loadImage(image, index, activeIndex);
                });
            }

            /* loadImage
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
            function loadImage(image, index, activeIndex) {

                var loadedImage = new Image();
                loadedImage.src = image.url;

                // on image load
                loadedImage.onload = function() {

                    // set image properties
                    image.width = loadedImage.width;
                    image.height = loadedImage.height;
                    image.loaded = true;
                    image.yPos = 0;
                    image.atTop = true;
                    image.atBottom = false;

                    // set active image once first image has loaded
                    if (index === activeIndex) {

                        // wait for image to render on page
                        $timeout(function() {

                            // set slide to active state
                            $scope.state.slideActive = true;
                            setActiveSlide(activeIndex, true);

                        }, 500);
                    }
                };
            }

            /* getImageList -
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
            function getImageList(gallerySize, fullscreen) {

                var imageList = null;

                switch(gallerySize) {

                    case 'small':
                        imageList = $scope.smallImageList;
                        break;

                    case 'medium':
                        imageList = $scope.mediumImageList;
                        break;

                    case 'large':
                        imageList = $scope.largeImageList;
                        break;
                }

                return imageList;
            }

            /* getGallerySize -
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
            function getGallerySize(fullscreen) {

                // get usable width
                var usableWidth = $contentGallery.width();
                if (fullscreen) {
                    usableWidth = $(window).width();
                }

                var smallWidth = parseInt($scope.smallWidth, 10),
                    mediumWidth = parseInt($scope.mediumWidth, 10),
                    largeWidth = parseInt($scope.largeWidth, 10);

                var imageSize = null;

                // small
                if (usableWidth <= smallWidth) {
                    imageSize = 'small';

                // medium
                } else if (usableWidth <= mediumWidth) {
                    imageSize = 'medium';

                // large
                } else {
                    imageSize = 'large';
                }

                return imageSize;
            }

            /* keydownHandler
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
            function keydownHandler(key) {

                if (key === 17) {
                    // reset throttle
                    throttledKeydownHandler = keydownHandler.throttle(DEBOUNCE_TIME);
                    ctrlModifier = true;
                }

                // previous slide
                if (key === 37) {
                    $rootScope.safeApply(function() {
                        if (ctrlModifier) {
                            setActiveSlide(0);
                        } else {
                            previousSlide();
                        }
                    });

                // next slide
                } else if (key === 39) {
                    $rootScope.safeApply(function() {
                        if (ctrlModifier) {
                            setActiveSlide($scope.state.slideCount - 1);
                        } else {
                            nextSlide();
                        }
                    });
                }
            }

            /* setActiveSlide -
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
            function setActiveSlide(index, emitEvent) {

                if (disableSlideNavigation) return;

                lastDelta = 0;

                // emit event by default
                emitEvent = (typeof emitEvent === 'undefined' || emitEvent) ? true : false;

                // set active if index greater than -1, less than imageList length, and image at index is loaded
                if (index > -1 && index < $scope.imageList.length && $scope.imageList[index].loaded) {

                    if (cssanimations) {
                        slideInTransition = true;
                    }

                    // save current index
                    $scope.state.currentSlideIndex = index;

                    // set active slide
                    $activeSlide = $slideContainer.find('.slide-' + index);

                    // set current slide
                    currentSlide = $scope.imageList[index];

                    // set slide container horizontal position
                    scrollToActiveSlide(index);

                    // broadcast active selection
                    if (emitEvent) {
                        $scope.$broadcast('content-gallery:set-active', index);
                    }
                }
            }

            /* scrollToActiveSlide -
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
            function scrollToActiveSlide() {

                // calculate translation amount
                var xPosition = $scope.state.currentSlideIndex * $scope.state.slideWidth,
                    translateType = '%';

                // use different xPosition method for mobile
                if (typeof window.orientation !== 'undefined') {
                    xPosition = $activeSlide.position().left;
                    translateType = 'px';
                }

                // apply transform/width styles
                $scope.slideContainerStyle = {
                    'width': ($scope.state.slideCount * 100) + '%',
                    '-webkit-transform': 'translate3d(' + -xPosition + translateType + ', 0px, 0px)',
                    '-moz-transform': 'translate3d(' + -xPosition + translateType + ', 0px, 0px)',
                    '-ms-transform': 'translate(' + -xPosition + translateType + ', 0px)',
                    '-o-transform': 'translate3d(' + -xPosition + translateType + ', 0px, 0px)',
                    'transform': 'translate3d(' + -xPosition + translateType + ', 0px, 0px)'
                };

                setGalleryHeight();

                resetScroll();
            }

            /* setGalleryHeight - set gallery height based on active slide height
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
            function setGalleryHeight() {

                // get active slide element
                windowHeight = $(window).height();
                activeHeight = $activeSlide.height();

                if (activeHeight > 0) {

                    var galleryStyles = {};

                    // fullscreen
                    if ($scope.state.fullscreen) {

                        var fullScreenWindowHeight = windowHeight - $scope.thumbnailHeight;

                        var topPadding = 0;
                        if (!isImageTallerThanWindow()) {
                            topPadding = (fullScreenWindowHeight - activeHeight) / 2;
                        }

                        // gallery styles
                        galleryStyles = {
                            'height': fullScreenWindowHeight + 'px',
                            '-webkit-transform': 'translate3d(0px, ' + topPadding + 'px, 0px)',
                            '-moz-transform': 'translate3d(0px, ' + topPadding + 'px, 0px)',
                            '-ms-transform': 'translate(0px, ' + topPadding + 'px)',
                            '-o-transform': 'translate3d(0px, ' + topPadding + 'px, 0px)',
                            'transform': 'translate3d(0px, ' + topPadding + 'px, 0px)'
                        };

                    // embedded
                    } else {

                        // gallery styles
                        galleryStyles['height'] = activeHeight + 'px';
                    }

                    // set styles
                    $scope.galleryContainerStyle = galleryStyles;
                }
            }

            /* extractDelta - get mouse wheel delta
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
            function extractDelta(e) {

                if (e.wheelDelta) {
                    return e.wheelDelta;
                }

                if (e.originalEvent.detail) {
                    return e.originalEvent.detail * -40;
                }

                if (e.originalEvent && e.originalEvent.wheelDelta) {
                    return e.originalEvent.wheelDelta;
                }
            }

            /* handleMouseWheelEvent - handle mouse scroll event
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
            function handleMouseWheelEvent(e) {

                // only for fullscreen mode
                if ($scope.state.fullscreen) {
                    var delta = extractDelta(e);
                    lastDelta = 0;

                    // reduce delta
                    delta = delta / 3;

                    // set new scroll position
                    scrollCurrentSlideBy(delta);
                }
            }

            /* scrollCurrentSlideBy - add delta to current vertical position
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
            function scrollCurrentSlideBy(delta) {

                var yPosition = currentSlide.yPos;

                yPosition += delta - lastDelta;

                lastDelta = delta;

                // scroll slide to new yPosition
                scrollCurrentSlideTo(yPosition);
            }

            /* scrollCurrentSlideByTo - set new vertical position
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
            function scrollCurrentSlideTo(yPosition) {

                var negativeScrollLimit = windowHeight - activeHeight - SCROLL_MARGIN - $scope.thumbnailHeight;

                $rootScope.safeApply(function() {

                    currentSlide.atBottom = false;
                    currentSlide.atTop = false;

                    // restrict scroll down amount
                    if (yPosition <= negativeScrollLimit) {
                        yPosition = negativeScrollLimit;
                        currentSlide.atBottom = true;
                        currentSlide.atTop = false;
                    }

                    // restrict scroll up amount
                    if (yPosition >= 0) {
                        yPosition = 0;
                        currentSlide.atBottom = false;
                        currentSlide.atTop = true;
                    }
                });

                currentSlide.yPos = yPosition;

                // apply styles
                $activeSlide.css({
                    '-webkit-transform': 'translate3d(0px, ' + yPosition + 'px, 0px)',
                    '-moz-transform': 'translate3d(0px, ' + yPosition + 'px, 0px)',
                    '-ms-transform': 'translate(0px, ' + yPosition + 'px)',
                    '-o-transform': 'translate3d(0px, ' + yPosition + 'px, 0px)',
                    'transform': 'translate3d(0px, ' + yPosition + 'px, 0px)'
                });
            }

            /* isImageTallerThanWindow - return true if image height larger than current window height
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
            function isImageTallerThanWindow() {

                if ($activeSlide) {

                    var $image = $activeSlide.find('img');

                    var imageHeight = $image.height();

                    return (imageHeight > windowHeight - $scope.thumbnailHeight);
                }
            }

            /* resetScroll - reset scroll position to 0
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
            function resetScroll() {

                lastDelta = 0;
                scrollCurrentSlideTo(0);
            }

            /* nextSlide -
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
            function nextSlide() {
                setActiveSlide($scope.state.currentSlideIndex + 1);
            }

            /* previousSlide -
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
            function previousSlide() {
                setActiveSlide($scope.state.currentSlideIndex - 1);
            }

            /* scrollUp - scroll up in fixed increment
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
            function scrollUp() {
                scrollCurrentSlideBy(100);
                lastDelta = 0;
            }

            /* scrollDown - scroll down in fixed increment
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
            function scrollDown() {
                scrollCurrentSlideBy(-100);
                lastDelta = 0;
            }

            /* enableFullscreen -
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
            function enableFullscreen() {

                if ($scope.state.fullscreen) return;

                $htmlRoot.addClass('overflow-hidden');
                $scope.state.fullscreen = true;

                // load gallery
                loadGallery($scope.state.currentSlideIndex);
            }

            /* disableFullscreen -
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
            function disableFullscreen() {

                if (!$scope.state.fullscreen) return;

                $htmlRoot.removeClass('overflow-hidden');
                $scope.state.fullscreen = false;

                // load gallery
                loadGallery($scope.state.currentSlideIndex);
            }

            /* disableTransitions -
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
            function disableTransitions(time) {

                // disable transitions
                $scope.state.transitions = false;

                // renabled after delay
                $timeout(function() {
                    $scope.state.transitions = true;
                }, time);
            }

            /* Scope Methods
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
            $scope.setActiveSlide = setActiveSlide;
            $scope.nextSlide = nextSlide;
            $scope.previousSlide = previousSlide;
            $scope.scrollUp = scrollUp;
            $scope.scrollDown = scrollDown;
            $scope.isImageTallerThanWindow = isImageTallerThanWindow;
            $scope.enableFullscreen = enableFullscreen;
            $scope.disableFullscreen = disableFullscreen;
        }
    };
}]);
