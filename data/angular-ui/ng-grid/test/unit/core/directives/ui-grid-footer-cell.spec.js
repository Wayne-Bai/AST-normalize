describe('uiGridFooterCell', function () {
  var grid, data, columnDefs, $scope, $compile, $document, recompile, uiGridConstants;

  data = [
    { "name": "Bob", "age": 35 },
    { "name": "Bill", "age": 25 },
    { "name": "Sam", "age": 17 },
    { "name": "Jane", "age": 19 }
  ];

  columnDefs = [
    { name: 'name', footerCellClass: 'testClass' },
    {
      name: 'age',
      footerCellClass: function(grid, row, col, rowRenderIndex, colRenderIndex) {
        if ( col.colDef.noClass ){
          return '';
        } else {
          return 'funcCellClass';
        }
      }
    }
  ];

  beforeEach(module('ui.grid'));

  beforeEach(inject(function (_$compile_, $rootScope, _$document_, _uiGridConstants_) {
    $scope = $rootScope;
    $compile = _$compile_;
    $document = _$document_;
    uiGridConstants = _uiGridConstants_;

    $scope.gridOpts = {
      showColumnFooter: true,
      columnDefs: columnDefs,
      data: data,
      onRegisterApi: function( gridApi ){ $scope.gridApi = gridApi; }
    };

    $scope.extScope = 'test';

    recompile = function () {
      grid = angular.element('<div style="width: 500px; height: 300px" ui-grid="gridOpts"></div>');
      
      $compile(grid)($scope);
      $document[0].body.appendChild(grid[0]);

      $scope.$digest();
    };

    recompile();
  }));

  afterEach(function() {
    grid.remove();
  });

  describe('footerCellClass', function () {
    var footerCell1,
        footerCell2;

    beforeEach(function () {
      footerCell1 = $(grid).find('.ui-grid-footer-cell:nth(0)');
      footerCell2 = $(grid).find('.ui-grid-footer-cell:nth(1)');
    });

    it('should have the footerCellClass class, from string', inject(function () {
      expect(footerCell1.hasClass('testClass')).toBe(true);
    }));

    it('should get cellClass from function, and remove it when data changes', inject(function () {
      expect(footerCell2.hasClass('funcCellClass')).toBe(true);
      columnDefs[1].noClass = true;
      $scope.gridApi.core.notifyDataChange( uiGridConstants.dataChange.COLUMN );
      expect(footerCell2.hasClass('funcCellClass')).toBe(false);
    }));
  });

  describe('externalScope', function() {
    it('should be present', function () {
      var elm = recompile();

      var header = $(grid).find('.ui-grid-header-cell:nth(0)');
      expect(header).toBeDefined();
      expect(header.scope().grid.appScope).toBeDefined();
      expect(header.scope().grid.appScope.extScope).toBe('test');
    });
  });
});