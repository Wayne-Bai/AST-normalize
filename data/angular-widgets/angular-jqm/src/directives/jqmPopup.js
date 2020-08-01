/**
 * @ngdoc directive
 * @name jqm.directive:jqmPopup
 * @restrict A
 *
 * @description
 * Creates a popup with the given content.  The popup can be opened and closed on an element using {@link jqm.directive:jqmPopupTarget jqmPopupTarget}.
 *
 * Tip: put a {@link jqm.directive:jqmView jqmView} inside a popup to have full scrollable pages inside.
 * <pre>
 * <div jqm-popup="myPopup">
 *   <div jqm-view="{
 *   templateUrl: 'views/my-popup-content-page.html',
 *   controller: 'MyPopupController'
 *   }"></div>
 * </div>
 * </pre>
 *
 * @param {expression} jqmPopup Assignable angular expression to bind this popup to.  jqmPopupTargets will point to this model.
 * @param {expression=} animation jQuery Mobile animation to use to show/hide this popup.  Default 'fade'.
 * @param {expression=} placement Where to put the popup relative to its target.  Available: 'left', 'right', 'top', 'bottom', 'inside'. Default: 'inside'.
 * @param {expression=} overlay-theme The theme to use for the overlay behind the popup. Defaults to the popup's theme.
 * @param {expression=} corners Whether the popup has corners. Default true.
 * @param {expression=} shadow Whether the popup has shadows. Default true.
 *
 * @example
<example module="jqm">
  <file name="index.html">
    <div jqm-popup="myPopup">
    Hey guys, here's a popup!
    </div>
    <div style="padding: 50px;"
     jqm-popup-target="myPopup"
     jqm-popup-model="pageCenterPop">

     <div jqm-button ng-click="pageCenterPop = true">
      Open Page Center Popup
     </div>
     <div jqm-button
       jqm-popup-target="myPopup"
       jqm-popup-model="buttonPop"
       jqm-popup-placement="left"
       ng-click="buttonPop = true">
       Open popup left of this button!
     </div>
    </div>
  </file>
</example>
 */
jqmModule.directive('jqmPopup', ['$position', '$animationComplete', '$parse', '$rootElement', '$timeout', '$compile', '$rootScope',
function($position, animationComplete, $parse, $rootElement, $timeout, $compile, $rootScope) {
  var isDef = angular.isDefined;
  var popupOverlayTemplate = '<div jqm-popup-overlay></div>';

  return {
    restrict: 'A',
    replace: true,
    transclude: true,
    templateUrl: 'templates/jqmPopup.html',
    require: '^?jqmPage',
    scope: {
      corners: '@',
      shadow: '@',
      placement: '@',
      animation: '@',
      overlayTheme: '@'
    },
    compile: function(elm, attr) {
      attr.animation = isDef(attr.animation) ? attr.animation : 'fade';
      attr.corners = isDef(attr.corners) ? attr.corners==='true' : true;
      attr.shadow = isDef(attr.shadow) ? attr.shadow==='true' : true;

      return postLink;
    }
  };
  function postLink(scope, elm, attr, pageCtrl) {
    animationComplete(elm, onAnimationComplete);

    var popupModel = $parse(attr.jqmPopup);
    if (!popupModel.assign) {
      throw new Error("jqm-popup expected assignable expression for jqm-popup attribute, got '" + attr.jqmPopup + "'");
    }
    popupModel.assign(scope.$parent, scope);

    elm.parent().prepend( $compile(popupOverlayTemplate)(scope) );

    //Publicly expose show, hide methods
    scope.show = show;
    scope.hideForElement = hideForElement;
    scope.hide = hide;
    scope.target = null;
    scope.opened = false;

    function show(target, placement) {
      scope.target = target;
      scope.opened = true;
      placement = placement || scope.placement;

      elm.css( getPosition(elm, target, placement) );
      scope.$root.$broadcast('$popupStateChanged', scope);
      if (scope.animation === 'none') {
        onAnimationComplete();
      } else {
        elm.addClass('in').removeClass('out');
      }

    }
    function hideForElement(target) {
      if (scope.target && target && scope.target[0] === target[0]) {
        scope.hide();
      }
    }
    function hide() {
      scope.target = null;
      scope.opened = false;
      elm.addClass('out').removeClass('in');

      scope.$root.$broadcast('$popupStateChanged', scope);
      if (scope.animation === 'none') {
        onAnimationComplete();
      } else {
        elm.addClass('out').removeClass('in');
      }
    }

    function onAnimationComplete() {
      elm.toggleClass('ui-popup-active', scope.opened);
      elm.toggleClass('ui-popup-hidden', !scope.opened);
      if (!scope.opened) {
        elm.css('left', '');
        elm.css('top', '');
      }
    }

    function getPosition(elm, target, placement) {
      var popWidth = elm.prop( 'offsetWidth' );
      var popHeight = elm.prop( 'offsetHeight' );
      var pos = $position.position(target);

      var newPosition = {};
      switch (placement) {
        case 'right':
          newPosition = {
            top: pos.top + pos.height / 2 - popHeight / 2,
            left: pos.left + pos.width
          };
          break;
        case 'bottom':
          newPosition = {
            top: pos.top + pos.height,
            left: pos.left + pos.width / 2 - popWidth / 2
          };
          break;
        case 'left':
          newPosition = {
            top: pos.top + pos.height / 2 - popHeight / 2,
            left: pos.left - popWidth
          };
          break;
        case 'top':
          newPosition = {
            top: pos.top - popHeight,
            left: pos.left + pos.width / 2 - popWidth / 2
          };
          break;
        default:
          newPosition = {
            top: pos.top + pos.height / 2 - popHeight / 2,
            left: pos.left + pos.width / 2 - popWidth / 2
          };
          break;
      }

      newPosition.top = Math.max(newPosition.top, 0);
      newPosition.left = Math.max(newPosition.left, 0);

      newPosition.top += 'px';
      newPosition.left += 'px';

      return newPosition;
    }
  }
}]);
