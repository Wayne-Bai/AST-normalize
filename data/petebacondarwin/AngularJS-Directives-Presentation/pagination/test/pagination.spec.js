describe('pagination directive', function () {
  var $rootScope, element;
  beforeEach(module('pagination'));
  beforeEach(inject(function(_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    $rootScope.numPages = 5;
    $rootScope.currentPage = 3;
    element = $compile('<pagination num-pages="numPages" current-page="currentPage"></pagination>')($rootScope);
    $rootScope.$digest();
  }));

  it('has a "pagination" css class', function() {
    expect(element.hasClass('pagination')).toBe(true);
  });

  it('contains one ul and num-pages + 2 li elements', function() {
    expect(element.find('ul').length).toBe(1);
    expect(element.find('li').length).toBe(7);
    expect(element.find('li').eq(0).text()).toBe('Previous');
    expect(element.find('li').eq(-1).text()).toBe('Next');
  });

  it('has the number of the page as text in each page item', function() {
    var lis = element.find('li');
    for(var i=1; i<=$rootScope.numPages;i++) {
      expect(lis.eq(i).text()).toEqual(''+i);
    }
  });

  it('sets the current-page to be active', function() {
    var currentPageItem = element.find('li').eq($rootScope.currentPage);
    expect(currentPageItem.hasClass('active')).toBe(true);
  });

  it('disables the "previous" link if current-page is 1', function() {
    $rootScope.currentPage = 1;
    $rootScope.$digest();
    var previousPageItem = element.find('li').eq(0);
    expect(previousPageItem.hasClass('disabled')).toBe(true);
  });

  it('disables the "next" link if current-page is num-pages', function() {
    $rootScope.currentPage = 5;
    $rootScope.$digest();
    var nextPageItem = element.find('li').eq(-1);
    expect(nextPageItem.hasClass('disabled')).toBe(true);
  });

  it('changes currentPage if a page link is clicked', function() {
    var page2 = element.find('li').eq(2).find('a');
    page2.click();
    $rootScope.$digest();
    expect($rootScope.currentPage).toBe(2);
  });

  it('changes currentPage if the "previous" link is clicked', function() {
    var previous = element.find('li').eq(0).find('a').eq(0);
    previous.click();
    $rootScope.$digest();
    expect($rootScope.currentPage).toBe(2);
  });

  it('changes currentPage if the "next" link is clicked', function() {
    var next = element.find('li').eq(-1).find('a').eq(0);
    next.click();
    $rootScope.$digest();
    expect($rootScope.currentPage).toBe(4);
  });

  it('does not change the current page on "previous" click if already at first page', function() {
    var previous = element.find('li').eq(0).find('a').eq(0);
    $rootScope.currentPage = 1;
    $rootScope.$digest();
    previous.click();
    $rootScope.$digest();
    expect($rootScope.currentPage).toBe(1);
  });

  it('does not change the current page on "next" click if already at last page', function() {
    var next = element.find('li').eq(-1).find('a').eq(0);
    $rootScope.currentPage = 5;
    $rootScope.$digest();
    next.click();
    $rootScope.$digest();
    expect($rootScope.currentPage).toBe(5);
  });

  it('executes the onSelectPage expression when the current page changes', function() {
    $rootScope.selectPageHandler = jasmine.createSpy('selectPageHandler');
    element = $compile('<pagination num-pages="numPages" current-page="currentPage" on-select-page="selectPageHandler(page)"></pagination>')($rootScope);
    $rootScope.$digest();
    var page2 = element.find('li').eq(2).find('a').eq(0);
    page2.click();
    $rootScope.$digest();
    expect($rootScope.selectPageHandler).toHaveBeenCalledWith(2);
  });

  it('changes the number of items when numPages changes', function() {
    $rootScope.numPages = 8;
    $rootScope.$digest();
    expect(element.find('li').length).toBe(10);
    expect(element.find('li').eq(0).text()).toBe('Previous');
    expect(element.find('li').eq(-1).text()).toBe('Next');
  });

  it('sets the current page to the last page if the numPages is changed to less than the current page', function() {
    $rootScope.selectPageHandler = jasmine.createSpy('selectPageHandler');
    element = $compile('<pagination num-pages="numPages" current-page="currentPage" on-select-page="selectPageHandler(page)"></pagination>')($rootScope);
    $rootScope.$digest();
    $rootScope.numPages = 2;
    $rootScope.$digest();
    expect(element.find('li').length).toBe(4);
    expect($rootScope.currentPage).toBe(2);
    expect($rootScope.selectPageHandler).toHaveBeenCalledWith(2);
  });
});