// ========== modules documentation configuration ========== //
angular.module('adaptv.adaptStrapDocs').constant('adaptStrapModules', [
  {
    moduleName: 'alerts',
    displayName: 'Global Alerts',
    controllerName: 'alertCtrl',
    description: 'shows notification messages to the user.',
    docFiles: [
      'alerts.view.html',
      'alerts.ctrl.js',
      'style.css'
    ],
    directives: [{
      name: 'ad-alerts',
      options: [{
        name: 'timeout',
        required: false,
        default: 'NA',
        type: 'String/Number',
        description: 'The number of milliseconds the alert is visible, before it auto closes'
      }, {
        name: 'custom-classes',
        required: false,
        default: 'NA',
        type: 'String',
        description: 'Allows the definition of custom styling for the alert'
      }]
    }]
  },
  {
    moduleName: 'tablelite',
    displayName: 'Table Lite',
    controllerName: 'tableliteCtrl',
    description: 'simple table UI that renders your local data models and does local pagination/sorting',
    playGroundUrl: 'http://jsfiddle.net/kashjs/gt8Ljspf/',
    docFiles: [
      'tablelite.view.html',
      'tablelite.ctrl.js',
      'buyCell.html',
      'carMoreInfo.html'
    ],
    directives: [{
      name: 'ad-table-lite',
      options: [
        {
          name: 'table-name',
          required: true,
          default: 'NA',
          type: 'String',
          description: 'Name of the table. Name has to be so that it' +
            ' can be a valid javascript variable name. Make sure that your scope does not have' +
            'a property with the same name as the tree-name'
        },
        {
          name: 'column-definition',
          required: true,
          default: 'NA',
          type: 'String',
          description: 'Path to the object (array) that has all the column definitions. ' +
            'Look at more info for details on how to build columnDefinition object'
        },
        {
          name: 'local-data-source',
          required: true,
          default: 'NA',
          type: 'String',
          description: 'Array of items to be rendered in table'
        },
        {
          name: 'page-sizes',
          required: false,
          default: '[10, 25, 50]',
          type: 'String',
          description: 'Available page sizes'
        },
        {
          name: 'page-size',
          required: false,
          default: '10',
          type: 'Number',
          description: 'Starting page size, defaults to first in page-sizes'
        },
        {
          name: 'disable-paging',
          required: false,
          default: 'false',
          type: 'Boolean',
          description: 'shows all the items in local-data-source'
        },
        {
          name: 'enable-column-search',
          required: false,
          default: 'false',
          type: 'Boolean',
          description: 'shows column search inputs. Works in combination with ' +
              '<code>columnSearchProperty</code> on columnDefinition'
        },
        {
          name: 'table-classes',
          required: false,
          default: '"table"',
          type: 'String',
          description: 'these classes will be applied to the table tag. ' +
            'Ex (<code>table-classes: "table table-bordered"</code>)'
        },
        {
          name: 'pagination-btn-group-classes',
          required: false,
          default: '"pagination pagination-sm"',
          type: 'String',
          description: 'these classes will be applied to the pagination pagination ul tag. ' +
            'Ex (<code>pagination-btn-group-classes="pagination pagination-xs"</code>)'
        },
        {
          name: 'draggable',
          required: false,
          default: 'NA',
          type: 'Boolean',
          description: 'enables drag & drop on the table rows within and across pages'
        },
        {
          name: 'on-drag-change',
          required: false,
          default: 'NA',
          type: 'Function',
          description: 'callback function which fires when a change occurs due to a ' +
            'drag and drop, the parameters for the callback are position before drag,' +
            'position after drag & the data being moved'
        },
        {
          name: 'selected-items',
          required: false,
          default: 'NA',
          type: 'String',
          description: 'Path to the array that will hold selected items. ' +
            '<code>ex: selected-items="models.selectedCars"</code>. If speecified, the rows will be' +
            ' selectable by checkbox. selected rows will have <code>ad-selected</code> class on it. ' +
            'You can target this class in your css to apply custom styling to the selected rows.'

        },
        {
          name: 'row-class-provider',
          required: false,
          default: 'NA',
          type: 'Function',
          description: 'Path to the function that returns row class' +
            '<code>row-class-provider="checkRowSelected"</code>. The function ' +
            'will get called with row item and the index. You can do any logic on row' +
            'and return a class string. That class will be applied to the row. Good usecase' +
            'is if you want to apply primary class to the selected rows. We recommend you return' +
            'Default bootstrap classes (<code>"active", "success", "warning", "danger", "info"</code>)'

        },
        {
          name: 'search-text',
          required: false,
          default: 'NA',
          type: 'String',
          description: 'The text to search by' +
            '<code>ex: search-text="models.searchText"</code>. If speecified, the rows' +
            ' will be searched and filtered by the content and the search enabled columns '
        },
        {
          name: 'btn-classes',
          required: false,
          default: 'btn btn-default',
          type: 'String',
          description: 'classes to be applied to dropdown button. ' +
            '<code>Ex: btn-classes="btn btn-primary btn-sm"</code>'

        },
        {
          name: 'table-max-height',
          required: false,
          default: 'auto',
          type: 'String',
          description: 'This property makes the table scrollable. The header becomes fixed at top. ' +
            'Pass in any css max-height property. EX: <code>table-max-height="157px"</code>'
        },
        {
          name: 'table-fixed-height',
          required: false,
          default: 'auto',
          type: 'String',
          description: 'This property makes the table fixed height. The header becomes fixed at top. ' +
            'Pass in any css max-height property. EX: <code>table-fixed-height="157px"</code>'
        },
        {
          name: 'items-not-found-message',
          required: false,
          default: 'NA',
          type: 'String',
          description: 'Message that will be shown in case of empty table'
        },
        {
          name: 'on-click-sort-direction',
          required: false,
          default: 'ASC',
          type: 'String',
          description: 'Which direction to sort first when column is clicked. ' +
            'EX: <code>on-click-sort-direction="DEC"</code>'
        },
        {
          name: 'initial-sort-key',
          required: false,
          default: 'DEC',
          type: 'String',
          description: 'Sort key to use on initialization. ' +
            'EX: <code>initial-sort-key="name"</code>'
        },
        {
          name: 'initial-sort-direction',
          required: false,
          default: 'DEC',
          type: 'String',
          description: 'Which direction to sort the initial-sort-key. ' +
            'EX: <code>initial-sort-direction="DEC"</code>'
        },
        {
          name: 'snug-sort-icons',
          required: false,
          default: 'false',
          type: 'Boolean',
          description: 'If true, the sort icons will be right next to header text. ' +
            'Good for limited real estate scenarios.'
        },
        {
          name: 'row-expand-template',
          required: false,
          default: 'NA',
          type: 'String',
          description: 'Template for row expand. Generally used for more info or in-place edit.'
        },
        {
          name: 'row-expand-callback',
          required: false,
          default: 'NA',
          type: 'Function',
          description: 'callback for row expand. Useful for lazy loading extra information on expand.'
        },
        {
          name: 'on-row-click',
          required: false,
          default: 'NA',
          type: 'Function',
          description: 'This function gets called with item and event properties when row is clicked.' +
            'ex: <code>on-row-click="rowClicked"</code>'
        }
      ]
    }]
  },
  {
    moduleName: 'tableajax',
    displayName: 'Table AJAX',
    controllerName: 'tableajaxCtrl',
    description: 'advanced table UI that renders remote data models and does remote pagination/sorting',
    playGroundUrl: 'http://jsfiddle.net/kashjs/1f806L2k/',
    docFiles: [
      'tableajax.view.html',
      'tableajax.ctrl.js',
      'artistPicture.html',
      'artistMoreInfo.html'
    ],
    directives: [{
      name: 'ad-table-ajax',
      options: [
        {
          name: 'table-name',
          required: true,
          default: 'NA',
          type: 'String',
          description: 'Name of the table. Name has to be so that it' +
            ' can be a valid javascript variable name. Make sure that your scope does not have' +
            'a property with the same name as the tree-name'
        },
        {
          name: 'column-definition',
          required: true,
          default: 'NA',
          type: 'String',
          description: 'Path to the object (array) that has all the column definitions. ' +
            'Look at more info for details on how to build columnDefinition object'
        },
        {
          name: 'table-classes',
          required: false,
          default: '"table"',
          type: 'String',
          description: 'these classes will be applied to the table tag. ' +
            'Ex (<code>table-classes: "table table-bordered"</code>)'
        },
        {
          name: 'ajax-config',
          required: true,
          default: 'NA',
          type: 'String',
          description:  'Path to the object that has ajax configuration. ' +
            'Look at more info for details on how to build ajaxConfig object'
        },
        {
          name: 'page-sizes',
          required: false,
          default: '[10, 25, 50]',
          type: 'String',
          description: 'Available page sizes'
        },
        {
          name: 'page-size',
          required: false,
          default: '10',
          type: 'Number',
          description: 'Starting page size, defaults to first in page-sizes'
        },
        {
          name: 'pagination-btn-group-classes',
          required: false,
          default: '"pagination pagination-sm"',
          type: 'String',
          description: 'these classes will be applied to the pagination pagination ul tag. ' +
            'Ex (<code>pagination-btn-group-classes="pagination pagination-xs"</code>)'
        },
        {
          name: 'page-loader',
          required: false,
          default: 'adaptStrap default page loader',
          type: 'path',
          description: 'You can specify your own page loader. Adapt Strap has its own page loader that makes ajax ' +
            'calls to load items. Look at adLoadPage in utils.js in the source to see how it is implemented. ' +
            'But for some reason if you need to provide your own page loader, you can specify the path ' +
            'to that function on your scope. Look at more info below to find out how request object looks like and ' +
            'what is expected from this function'
        },
        {
          name: 'table-max-height',
          required: false,
          default: 'auto',
          type: 'String',
          description: 'This property makes the table scrollable. The header becomes fixed at top. ' +
            'Pass in any css max-height property. EX: <code>table-max-height="157px"</code>'
        },
        {
          name: 'table-fixed-height',
          required: false,
          default: 'auto',
          type: 'String',
          description: 'This property makes the table fixed height. The header becomes fixed at top. ' +
              'Pass in any css max-height property. EX: <code>table-fixed-height="157px"</code>'
        },
        {
          name: 'items-not-found-message',
          required: false,
          default: 'NA',
          type: 'String',
          description: 'Message that will be shown in case of empty table'
        },
        {
          name: 'row-class-provider',
          required: false,
          default: 'NA',
          type: 'Function',
          description: 'Path to the function that returns row class' +
            '<code>row-class-provider="checkRowSelected"</code>. The function ' +
            'will get called with row item and the index. You can do any logic on row' +
            'and return a class string. That class will be applied to the row. Good usecase' +
            'is if you want to apply primary class to the selected rows. We recommend you return' +
            'Default bootstrap classes (<code>"active", "success", "warning", "danger", "info"</code>)'

        },
        {
          name: 'on-data-loaded',
          required: false,
          default: 'NA',
          type: 'Function',
          description: 'Callback for the data load event. It fires when the request finishes' +
          'It should take 2 parameters <code>$success, $response</code>.'
        },
        {
          name: 'on-click-sort-direction',
          required: false,
          default: 'ASC',
          type: 'String',
          description: 'Which direction to sort first when column is clicked. ' +
            'EX: <code>on-click-sort-direction="DEC"</code>'
        },
        {
          name: 'snug-sort-icons',
          required: false,
          default: 'false',
          type: 'Boolean',
          description: 'If true, the sort icons will be right next to header text. ' +
            'Good for limited real estate scenarios.'
        },
        {
          name: 'row-expand-template',
          required: false,
          default: 'NA',
          type: 'String',
          description: 'Template for row expand. Generally used for more info or in-place edit.'
        },
        {
          name: 'row-expand-callback',
          required: false,
          default: 'NA',
          type: 'Function',
          description: 'callback for row expand. Useful for lazy loading extra information on expand.'
        },
        {
          name: 'on-row-click',
          required: false,
          default: 'NA',
          type: 'Function',
          description: 'This function gets called with item and event properties when row is clicked.' +
            'ex: <code>on-row-click="rowClicked"</code>'
        }
      ]
    }]
  },
  {
    moduleName: 'treebrowser',
    displayName: 'Tree Browser',
    controllerName: 'treebrowserCtrl',
    playGroundUrl: 'http://jsfiddle.net/kashjs/056z7xtr/',
    description: 'simple tree UI that allows you to brows through local data models in tree structure',
    docFiles: [
      'treebrowser.view.html',
      'treebrowser.ctrl.js',
      'treeNode.html',
      'treeHeader.html',
      'style.css'
    ],
    directives: [{
      name: 'ad-tree-browser',
      options: [
        {
          name: 'tree-name',
          required: true,
          type: 'String',
          default: 'NA',
          description: 'Name of the tree. Name has to be so that it' +
            ' can be a valid javascript variable name. Make sure that your scope does not have' +
            'a property with the same name as the tree-name'
        },
        {
          name: 'tree-root',
          required: true,
          type: 'String',
          default: 'NA',
          description: 'root path to the tree data structure ' +
            'example: <code>tree-root="data.root"</code>'
        },
        {
          name: 'child-node',
          required: true,
          type: 'String',
          default: 'NA',
          description: 'name of the object that contains children ' +
            'nodes example: <code>child-node="children"</code>'
        },
        {
          name: 'node-template-url',
          required: false,
          default: '<span>{{ item.name || "" }}</span>',
          type: 'String',
          description: 'template to render the node properties. Look at treeNode.html ' +
            'file in the code section.'
        },
        {
          name: 'node-header-url',
          required: false,
          default: 'NA',
          type: 'Template similar to node template, but it has the ' +
            'header tags. (EX: id, name, status). Look at treeHeader.html in code section.',
          description: ''
        },
        {
          name: 'children-padding',
          required: false,
          default: '15px',
          type: 'String',
          description: 'Padding/distance from parent level'
        },
        {
          name: 'has-children',
          required: false,
          default: 'NA',
          type: 'String',
          description: 'Name of the function that checks the availability of the children for an item.' +
            'This is only needed if you are doing lazy loading. If function returns false (row is a leaf),' +
            'The toggle arrow will not be shown.'
        },
        {
          name: 'row-ng-class',
          required: false,
          default: 'NA',
          type: 'String',
          description: 'ng-class expression that will be applied to each row. ' +
            'ex: <code>row-ng-class={active: item._selected}</code>'
        },
        {
          name: 'toggle-callback',
          required: false,
          default: 'NA',
          type: 'Function',
          description: 'This function is to lazy load the tree levels.' +
            'Provide the path to toggle function ' +
            '(ex: <code>toggle-callback="methods.loadChildren"</code>). If you do provide this, ' +
            'the tree item will be passed to this function every time some one toggles a tree level. ' +
            'In this case, you need to set the _ad_expanded' +
            'property to true or false. You can also set loading property to true or false on the item.' +
            'If you set _ad_loading to true, the ui will show the _ad_loading icon on that tree level.'
        },
        {
          name: 'on-row-click',
          required: false,
          default: 'NA',
          type: 'Function',
          description: 'This function gets called with item, level and event properties when row is clicked.' +
            'ex: <code>on-row-click="rowClicked"</code>'
        },
        {
          name: 'bordered',
          required: false,
          default: 'false',
          type: 'boolean',
          description: 'If true, adds border to the tree levels'
        }
      ]
    }]
  },
  {
    moduleName: 'draggable',
    displayName: 'Drag and drop',
    controllerName: 'draggableCtrl',
    description: 'simple directives to enable drag and drop functionalities',
    playGroundUrl: 'http://jsfiddle.net/kashjs/n2gxobf7/',
    docFiles: [
      'draggable.view.html',
      'draggable.ctrl.js'
    ],
    directives: [
      {
        name: 'ad-drag',
        options: [
          {
            name: 'ad-drag',
            required: 'true',
            default: 'NA',
            type: 'String',
            description: 'If <code>true</code>, enables drag capabilities for the node'
          },
          {
            name: 'ad-drag-handle',
            required: 'false',
            default: 'NA',
            type: 'String',
            description: 'If <code>true</code>, a direct childnode with a class of <code>.ad-drag-handle' +
              '</code> should be created. '
          },
          {
            name: 'ad-drag-data',
            required: 'false',
            default: 'NA',
            type: 'String',
            description: 'The data to be used during drag'
          },
          {
            name: 'ad-drag-begin',
            required: 'false',
            default: 'NA',
            type: 'Function',
            description: 'Callback for drag begin event. It fires when a drag starts. it should take 3 ' +
              'parameters <code>$data, $dragElement, $event</code>. <strong>Note:</strong> Use <code>' +
              '$dragElement.el</code>to get the element.'
          },
          {
            name: 'ad-drag-end',
            required: 'false',
            default: 'NA',
            type: 'Function',
            description: 'Callback for drag end event. It fires when a drag has ended, always after the' +
              'drop end. It should take 3 parameters <code>$data, $dragElement, $event</code>. ' +
              '<strong>Note:</strong> Use <code>$dragElement.el</code> to get the actual element.'
          }
        ]
      },
      {
        name: 'ad-drop',
        options: [
          {
            name: 'ad-drop',
            required: 'true',
            default: 'NA',
            type: 'String',
            description: 'If <code>true</code>, enables drop capabilities for the element'
          },
          {
            name: 'ad-drop-over',
            required: 'false',
            default: 'NA',
            type: 'Function',
            description: 'Callback for the drop over event. It fires on drag over a valid drop element. ' +
              'It takes 4 parameters <code>$data, $dragElement, $dropElement, $event</code>. ' +
              '<strong>Note:</strong> Use <code>$dragElement/$dropElement.el</code> to get the element.'
          },
          {
            name: 'ad-drop-end',
            required: 'false',
            default: 'NA',
            type: 'Function',
            description: 'Callback for the drop end event. It fires on a valid drop. It takes 4 parameters' +
              '<code>$data, $dragElement, $dropElement, $event</code>.'
          },
          {
            name: 'ad-drop-leave',
            required: 'false',
            default: 'NA',
            type: 'Function',
            description: 'Callback for the drop leave event. It fires drag element leaves drop element. ' +
              'It takes 4 parameters <code>$data, $dragElement, $dropElement, $event</code>.' +
              'For simple styling for drop hover, instead of using this callback, ' +
              'simply target <code>ad-drop-over</code> class.'
          }
        ]
      }
    ]
  },
  {
    moduleName: 'infinitedropdown',
    displayName: 'Infinite Dropdowns',
    controllerName: 'infiniteDropdownCtrl',
    description: 'simple directives to implement infinite scroll dropdowns/multi selectors',
    playGroundUrl: 'http://jsfiddle.net/kashjs/2n7znx2u/',
    docFiles: [
      'infinitedropdown.view.html',
      'infinitedropdown.ctrl.js',
      'artist.html'
    ],
    directives: [
      {
        name: 'ad-infinite-dropdown',
        options: [
          {
            name: 'dropdown-name',
            required: true,
            type: 'String',
            default: 'NA',
            description: 'Name of the dropdown. Name has to be so that it' +
              ' can be a valid javascript variable name. Make sure that your scope does not have' +
              'a property with the same name as the tree-name'
          },
          {
            name: 'display-property',
            required: false,
            type: 'String || Function',
            default: 'NA',
            description: 'property on the object to be displayed (ex: name). In case of function ' +
                  '"item" object gets passed into function. returned value is printed in the column'
          },
          {
            name: 'template',
            required: false,
            type: 'String',
            default: 'NA',
            description: 'Name of the variable on the scope that contains template. ' +
              'This template will be used to render the items'
          },
          {
            name: 'template-url',
            required: false,
            type: 'String',
            default: 'NA',
            description: 'Url to load the template. This template will be used to render the items'
          },
          {
            name: 'initial-label',
            required: false,
            type: 'String',
            default: 'Select',
            description: 'Default to text to show on the dropdown button.' +
              '<code>Ex: initial-label="Select an artist"</code>'
          },
          {
            name: 'selected-items',
            required: false,
            type: 'String',
            default: 'NA',
            description: 'Selected Item/Items will be places into this object'
          },
          {
            name: 'ajax-config',
            required: true,
            default: 'NA',
            type: 'String',
            description:  'Not required if local-data-source is defined. ' +
              'Path to the object that has ajax configuration. ' +
              'Look at more info for details on how to build ajaxConfig object'
          },
          {
            name: 'local-data-source',
            required: true,
            default: 'NA',
            type: 'String',
            description:  'Not required if ajax-config is defined. ' +
              'Name of the object/array that contains local data items.'
          },
          {
            name: 'max-height',
            required: false,
            default: '200px',
            type: 'String',
            description:  'Css property for max-height of the dropdown. ' +
              'The max height has to be smaller than page-size otherwise the infinite scroll' +
              'will not work'
          },
          {
            name: 'max-width',
            required: false,
            default: 'auto',
            type: 'String',
            description:  'Css property for max-width of the dropdown'
          },
          {
            name: 'single-selection-mode',
            required: false,
            default: 'false',
            type: 'Boolean',
            description:  'If true, only one item will be selected at a time. ' +
              'Therefore, selected items array will only have one item at any given time'
          },
          {
            name: 'on-item-click',
            required: false,
            default: 'NA',
            type: 'String',
            description:  'Name of the function to be called when an item is clicked' +
              '<code>on-item-click="artistClicked"</code>'
          },
          {
            name: 'label-display-property',
            required: false,
            default: 'NA',
            type: 'String',
            description:  'The default dropdown button label will be relaced with selected item\'s property' +
              'This will generally be used in single selection mode'
          },
          {
            name: 'page-size',
            required: false,
            default: '10',
            type: 'String',
            description:  'Number of items to load per page (infinite scroll)'
          }
        ]
      }
    ]
  },
  {
    moduleName: 'loadingindicator',
    displayName: 'Loading Indicator',
    controllerName: 'loadingIndicatorCtrl',
    description: 'simple directives to render overlay and inline loading indicators',
    playGroundUrl: 'http://jsfiddle.net/kashjs/n79ydkjh/',
    docFiles: [
      'loadingindicator.view.html',
      'loadingindicator.ctrl.js'
    ],
    directives: [
      {
        name: 'ad-loading-overlay',
        options: [
          {
            name: 'loading',
            required: true,
            globalConfig: false,
            default: 'NA',
            type: 'Boolean',
            description: 'model to show or hide the loading overlay'
          },
          {
            name: 'zIndex',
            required: false,
            globalConfig: false,
            default: '2000',
            type: 'String',
            description: 'z-index of the overlay'
          },
          {
            name: 'position',
            required: false,
            globalConfig: false,
            default: 'absolute',
            type: 'String',
            description: 'This can be either "absolute" or "fixed", ' +
              'in case of "absolute", the parent container need to have none static positioning (Ex: "relative")'
          },
          {
            name: 'container-classes',
            required: false,
            globalConfig: false,
            default: 'NA',
            type: 'String',
            description: 'you may want to add custom class to your ' +
              'overlay container. pass it into this attribute'
          },
          {
            name: 'loading-icon-class',
            required: false,
            globalConfig: true,
            default: '"glyphicon glyphicon-refresh ad-spin"',
            type: 'String',
            description: 'This property is globally configurable. ' +
              'But you can always pass in the value to override global configuration'
          },
          {
            name: 'loading-icon-size',
            required: false,
            globalConfig: false,
            default: '3em',
            type: 'String',
            description: 'You can pass in the size of spinner icon. ' +
              'Ex: <code>loading-icon-size="30px"</code>'
          }
        ]
      },
      {
        name: 'ad-loading-icon',
        options: [
          {
            name: 'loading-icon-class',
            required: false,
            globalConfig: true,
            default: '"glyphicon glyphicon-refresh ad-spin"',
            type: 'String',
            description: 'This property is globally configurable. ' +
              'But you can always pass in the value to override global configuration'
          },
          {
            name: 'loading-icon-size',
            required: false,
            globalConfig: false,
            default: 'font-size inherited from parent elements',
            type: 'String',
            description: 'You can pass in the size of spinner icon. ' +
              'Ex: <code>loading-icon-size="16px"</code>'
          }
        ]
      }
    ]
  }
]);
