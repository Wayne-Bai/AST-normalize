describe('youtubeResponsive', function() {
  var element, scope;

  // load the youtubeResponsive code
  beforeEach(module('youtubeResponsive'));

  // load the templates
  beforeEach(module('tpl/youtube-video.html'));

  beforeEach(inject(function($rootScope, $compile) {
    element = angular.element(
      '<div width="400">' +
      '<responsive-video video-slug="xCFEk6Y8TmM"></responsive-video>' +
      '</div>');
    scope = $rootScope;
    $compile(element)(scope);
    scope.$digest();
  }));

  it('should create clickable titles', inject(function($compile, $rootScope) {
    var vid = element.find('iframe');

    // starting values
    expect(vid.length).toBe(1);
    expect(vid.attr('width')).toBe('100%');

    // trigger resize evt
    $(window).trigger('resize');
    expect(vid.attr('height')).toBe(400*(9/16));
  }));

});