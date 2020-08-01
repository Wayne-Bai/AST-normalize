/*
 *  Copyright 2014 TWO SIGMA OPEN SOURCE, LLC
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
/**
 * bkoImage
 * This is the output display component for displaying images transferred in byte arrays.
 */
(function() {
  'use strict';
  beaker.bkoDirective("Image", function() {
    return {
      template: "<img />",
      link: function(scope, element, attrs) {
        var img = element.find("img").first();
        if (scope.model.getCellModel()) {
          img.attr("src", "data:image/png;base64," +
              scope.model.getCellModel().imageData);
        }
      }
    };
  });
})();
