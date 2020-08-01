'use strict';
describe('ui-utils  Services:  TreeView', function () {
    var TreeViewSelectorUtils = null;
    beforeEach(angular.mock.module('RedhatAccess.ui-utils'));
    beforeEach(inject(function (_TreeViewSelectorUtils_) {
        TreeViewSelectorUtils = _TreeViewSelectorUtils_;
    }));
    it('should have a have a method for parsing a string tree', function () {
        var stringTree = 'node0?checked=true\n/node1\nfolder/child1\n/folder/child2?checked=true';
        var jsonTree = '[{"checked":true,"name":"node0","fullPath":"node0","children":[]},{"checked":false,"name":"node1","fullPath":"/node1","children":[]},{"checked":false,"name":"folder","children":[{"checked":false,"name":"child1","fullPath":"folder/child1","children":[]},{"checked":true,"name":"child2","fullPath":"/folder/child2","children":[]}]}]';
        var tree = [];
        expect(TreeViewSelectorUtils.parseTreeList).toBeDefined();
        TreeViewSelectorUtils.parseTreeList(tree, stringTree);
        expect(angular.toJson(tree)).toEqual(jsonTree);
    });
    it('should have a have a method for getting list of selected nodes from a tree', function () {
        var jsonTree = '[{"checked":true,"name":"node0","fullPath":"node0","children":[]},{"checked":false,"name":"node1","fullPath":"/node1","children":[]},{"checked":false,"name":"folder","children":[{"checked":false,"name":"child1","fullPath":"folder/child1","children":[]},{"checked":true,"name":"child2","fullPath":"/folder/child2","children":[]}]}]';
        var tree = angular.fromJson(jsonTree);
        expect(TreeViewSelectorUtils.getSelectedLeaves).toBeDefined();
        var selectedNodes = TreeViewSelectorUtils.getSelectedLeaves(tree);
        expect(angular.toJson(selectedNodes)).toEqual('["node0","/folder/child2"]');
        jsonTree = '[{"checked":false,"name":"node0","fullPath":"node0","children":[]},{"checked":false,"name":"node1","fullPath":"/node1","children":[]},{"checked":false,"name":"folder","children":[{"checked":false,"name":"child1","fullPath":"folder/child1","children":[]},{"checked":false,"name":"child2","fullPath":"/folder/child2","children":[]}]}]';
        tree = angular.fromJson(jsonTree);
        selectedNodes = TreeViewSelectorUtils.getSelectedLeaves(tree);
        expect(angular.toJson(selectedNodes)).toEqual('[]');
    });
    it('should have a have a method for checking if a tree has selected nodes', function () {
        var jsonTree = '[{"checked":true,"name":"node0","fullPath":"node0","children":[]},{"checked":false,"name":"node1","fullPath":"/node1","children":[]},{"checked":false,"name":"folder","children":[{"checked":false,"name":"child1","fullPath":"folder/child1","children":[]},{"checked":true,"name":"child2","fullPath":"/folder/child2","children":[]}]}]';
        var tree = angular.fromJson(jsonTree);
        expect(TreeViewSelectorUtils.hasSelections).toBeDefined();
        var hasSelectedNodes = TreeViewSelectorUtils.hasSelections(tree);
        expect(hasSelectedNodes).toEqual(true);
        jsonTree = '[{"checked":false,"name":"node0","fullPath":"node0","children":[]},{"checked":false,"name":"node1","fullPath":"/node1","children":[]},{"checked":false,"name":"folder","children":[{"checked":false,"name":"child1","fullPath":"folder/child1","children":[]},{"checked":false,"name":"child2","fullPath":"/folder/child2","children":[]}]}]';
        tree = angular.fromJson(jsonTree);
        hasSelectedNodes = TreeViewSelectorUtils.hasSelections(tree);
        expect(hasSelectedNodes).toEqual(false);
    });
});