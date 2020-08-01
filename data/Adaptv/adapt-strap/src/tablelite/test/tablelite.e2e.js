describe('E2E Table Lite', function() {
  var page = {};
  beforeEach(function() {
    browser.get('/');
  });

  beforeEach(function() {
    browser.sleep(1000);
  });

  it('rows should be selectable', function() {
    var selectedItems = element(by.binding('models.selectedCars.length')),
        selectAllCheckbox = $('.ad-table-lite-container th input[type="checkbox"]');
    expect(selectedItems.getText()).toContain('1');
    selectAllCheckbox.click();
    expect(selectedItems.getText()).toContain('12');
  });
});
