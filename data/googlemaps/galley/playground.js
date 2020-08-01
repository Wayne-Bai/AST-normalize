/**
 * Copyright (C) 2013 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 * @fileoverview GME Viewer / Editor.
 * @author jlivni@google.com (Josh Livni).
 */

var GME = {
  baseUrl: 'https://www.googleapis.com/mapsengine/v1/',
  token: null,
  currentRectangles: [],
  mapsEngineLayers: [],
  highlightedRect: null,
  tableDetails: {},
  currentOverlays: {},
  infoWindow: new google.maps.InfoWindow({
    maxWidth: '500px'
  })
};

/**
 * Set up page resize events, and start the initial auth callback.
 */
GME.initialize = function() {
  $(window).resize(function() {
    GME.resizeMapToWindow();
  });
  GME.resizeMapToWindow();
  // This will set GME.token in the callback and then call initializeMap().
  checkAuth(false, handleAuthResult());
};

/**
 * Already authorized; set up the base map and retrieve list of Projects *
 */
GME.initializeMap = function() {
  var desat = [{
    'stylers': [
      { 'saturation': -90 },
      { 'lightness': 40 }
    ]
  }];

  var mapOptions = {
    zoom: 5,
    center: new google.maps.LatLng(40, -76),
    streetViewControl: false,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    styles: desat
  };
  GME.map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);

  GME.resizeMapToWindow();
  GME.setProjects();
  GME.configureDrawingTools();

  // Initialize the bbox which will highlight the selected table.
  GME.highlightedRect = new google.maps.Rectangle({
    map: GME.map,
    fillOpacity: 0.1,
    strokeColor: '#E8CD61',
    strokeWeight: 5
  });
};

/**
 * Initalizes the drawing tool manager.
 */
GME.configureDrawingTools = function() {
  GME.drawingManager = new google.maps.drawing.DrawingManager({
    drawingControl: true,
    drawingControlOptions: {
      position: google.maps.ControlPosition.TOP_CENTER,
      drawingModes: [
        google.maps.drawing.OverlayType.MARKER,
        google.maps.drawing.OverlayType.POLYGON,
        google.maps.drawing.OverlayType.POLYLINE
      ]
    },
    markerOptions: {
      icon: 'https://maps.gstatic.com/intl/en_us/mapfiles/markers2/measle.png'
    },
    polygonOptions: {
      fillColor: '#ffff00',
      fillOpacity: .5,
      strokeWeight: 5,
      clickable: false,
      editable: true,
      zIndex: 1
    }
  });
  google.maps.event.addListener(GME.drawingManager,
                                'overlaycomplete',
                                GME.createFeature);
};


/**
 * Adds a newly created feature to local cache, and POST to backend.
 * @param {google.maps.MVCObject} drawingResult the Overlay that was created.
 */
GME.createFeature = function(drawingResult) {
  var endpoint = '/features/batchInsert';
  var url = [GME.baseUrl, 'tables/', GME.currentTableId, endpoint].join('');
  var geomTypes = {
    'polyline': 'LineString',
    'polygon': 'Polygon',
    'marker': 'Point'
  };
  var overlay = drawingResult.overlay;
  overlay._gmeGeomType = geomTypes[drawingResult.type];
  // For now, just hack a randomish id.
  var gx_id = 'galley_' + parseInt(Math.random() * 10000000000);
  var geojson = {
    properties: {
      gx_id: gx_id
    },
    geometry: GME.getGeoJSONGeometryFromOverlay(overlay),
    type: 'Feature'
  };
  var request = {
    'features': [
      geojson
    ]
  };
  $.ajax({
    type: 'POST',
    url: url,
    data: window.JSON.stringify(request),
    dataType: 'json',
    headers: {
      Authorization: 'Bearer ' + GME.token,
      'content-type': 'application/json'
    },
    success: function(response, newValue) {
      overlay.setMap(null);
      var table = GME.tableDetails[GME.currentTableId];
      table.features[gx_id] = geojson;
      GME.notify('New feature added');
      // Add empty schema for editing
      var schema = table.schema;
      var geom_col = schema.primaryGeometry;
      $.each(schema.columns, function(i, col) {
        if (col.name != geom_col) {
          geojson.properties[col.name] = '';
        }
      });
      geojson.properties['gx_id'] = gx_id;
      table.features[gx_id] = geojson;
      GME.displayFeatures(GME.currentTableId);
    },
    error: function(response) {
      GME.notify('Error saving feature');
      console.log('SAVE error', response);
      overlay.setMap(null);
    }
  });
};


/**
 * Clears map of bounding boxes, overlays, and mapsEngineLayers.
 */
GME.clearMap = function() {
  GME.infoWindow.setMap(null);
  GME.highlightedRect.setMap(null);

  var overlayArrays = [
    GME.currentRectangles,
    GME.currentOverlays,
    GME.mapsEngineLayers
  ];

  $.each(overlayArrays, function(i, overlays) {
    $.each(overlays, function(i, overlay) {
      overlay.setMap(null);
    });
  });
  GME.currentRectangles = [];
  GME.currentOverlays = {};
  GME.mapsEngineLayers = [];
};

/**
 * Display a short-lived notification in the sidebar.
 * @param {string} message the message to display.
 */
GME.notify = function(message) {
  $('#notification').show().html(message).delay(5000).fadeOut();
};
/**
 * Clears and resets the sidebar content.

 */
GME.resetSidebar = function() {
  // Reset sidebar.
  var notify_li = $('<li/>', {
    id: 'notification',
    class: 'notification sidebar'
  }).hide();
  var info_li = $('<li/>', {
    id: 'information',
    class: 'information sidebar'
  }).hide();
  $('#sidebar-list').html('').append(notify_li).append(info_li);
};

/**
 * Helper method to return a LatLngBounds from a BBox.
 * @param {Array} bbox a bounding box as returned from GME.
 * @return {google.maps.LatLngBounds} a maps api bounding box.
 */
GME.getBoundsFromBBox = function(bbox) {
  var southWest = new google.maps.LatLng(bbox[1], bbox[0]);
  var northEast = new google.maps.LatLng(bbox[3], bbox[2]);
  return new google.maps.LatLngBounds(southWest, northEast);
};


/**
 * Sets up sidebar with list of clickable tables for a project
 * @param {Array} results is a list of assets (tables, maps, layers).
 * @param {string} apiEndpoint the GME endpoint (such as 'table').
 */
GME.displayAssets = function(results, apiEndpoint) {
  GME.clearMap();
  GME.resetSidebar();
  GME.drawingManager.setMap(null);
  $('#table-map-switcher').hide();

  var rectBounds = new google.maps.LatLngBounds();
  results[apiEndpoint].sort(function(a, b) {
    return a.name < b.name ? 1 : -1;
  });
  $.each(results[apiEndpoint], function(i, asset) {
    var assetType = asset.type ? asset.type : apiEndpoint.slice(0, -1);
    var bbox = asset.bbox;
    if (bbox) {
      var bounds = GME.getBoundsFromBBox(bbox);
      var li = $('<li/>', {
        class: 'sidebar'
      }).css('list-style-image', 'url(images/' + assetType + '.png)');

      // Set up clickable link for each Asset
      var link = $('<a/>', {
        id: 'side_' + asset.id,
        text: asset.name,
        click: function() {
          GME.clearMap();
          GME.highlightedRect.setBounds(bounds);
          GME.map.fitBounds(bounds);

          switch (assetType) {
            case 'table':
              GME.setTableSwitcher();
              GME.displayTable(asset, bounds);
              GME.drawingManager.setMap(GME.map);
              break;
            case 'layer':
              GME.displayLayer(asset, bounds);
              break;
            case 'map':
              GME.displayMap(asset, bounds);
              break;
          }
        }
      });
      if (asset.processingStatus == 'complete') {
        link.css('color', '#006633');
      }
      link.appendTo(li);
      li.appendTo($('#sidebar-list'));

      var rect = new google.maps.Rectangle({
        bounds: bounds,
        fillOpacity: .001,
        strokeWeight: .5,
        zIndex: 1,
        map: GME.map}
      );
      GME.currentRectangles.push(rect);
      rectBounds = rectBounds.union(bounds);
    } else {
      console.log('no bounds?', asset);
    }

  });
  GME.map.fitBounds(rectBounds);
};

/**
 * Creates the initial projects dropdown.
 */
GME.setProjects = function() {
  var url = GME.baseUrl + 'projects/';
  GME.queryGME(url, null, function(response) {
    response.projects.sort(function(a, b) {
      return a.name > b.name ? 1 : -1;
    });
    $.each(response.projects, function(i, project) {
      $('#project_select')
         .append($('<option></option>')
         .attr('value', project.id)
         .text(project.name));
    });
    $('#project_select').change(function() {
      GME.projectId = $('#project_select option:selected').val();
      window.location.hash = GME.projectId;
      GME.getAssets();
    });

    // Set up endoint clicks
    $('.endpoint').click(function(e) {
      var endpoint = this.id.split('_')[1];
      $('.header').removeClass('active');
      $(this).parent().addClass('active');
      GME.getAssets(endpoint);
    });

    //set project based on url hash
    if (window.location.hash) {
      GME.projectId = window.location.hash.slice(1);
      $('#project_select [value="' + GME.projectId + '"]')
        .attr('selected', 'selected');
      $('#project_select option:selected').val();
      GME.getAssets();
    }
  });
};

/**
 * Display a list of features on the map.
 * @param {string} tableId id of the table containing the features.
 */
GME.displayFeatures = function(tableId) {
  var features = GME.tableDetails[tableId].features;
  GME.infoWindow.setMap(null);
  var style = {
    strokeColor: '#003366',
    strokeWeight: 1.2,
    fillColor: '#0066CC',
    zIndex: 50,
    icon: 'https://maps.gstatic.com/intl/en_us/mapfiles/markers2/measle_blue.png'
  };
  // Clear out old overlays, if any.
  $.each(GME.currentOverlays, function(i, overlay) {
    overlay.setMap(null);
  });
  GME.currentOverlays = {};
  $.each(features, function(i, feature) {
    if (!feature.properties) {
      window.alert('no properties for feature');
    }
    var overlay = new GeoJSON(feature, style || null);
    try {
      overlay._gmeGeomType = feature.geometry.type;
    } catch (e) {
      console.log('Error: No geometry type for feature', feature);
    }
    if (!overlay.length) {
      // It could be a multigeom, so we force into rendering single overlays.
      overlay = [overlay];
    }
    $.each(overlay, function(j, singleOverlay) {
      singleOverlay.setMap(GME.map);
      GME.currentOverlays[i + '_' + j] = singleOverlay;
      if (singleOverlay.geojsonProperties) {
        google.maps.event.addListener(singleOverlay,
            'click', GME.displayInfoWindow);
      }
    });
  });
};

/**
 * Create html for a row that's ready for click-edit in an infowindow.
 * @param {string} key key of the attribute.
 * @param {string} val value of the attribute.
 * @param {string} id GME id of the feature.
 * @return {Object} jQuery tr element.
 */
GME.getEditableRow = function(key, val, id) {
  var tr = $('<tr/>');
  var tdKey = $('<td/>', {
    text: key
  });
  var tdVal = $('<td/>');
  var tdHref = $('<a/>', {
    text: val,
    href: '#',
    id: 'editable_' + key,
    class: 'editable',
    'data-type': val.length > 60 ? 'textarea' : 'text',
    'data-pk': id,
    'data-name': key
  });

  tdKey.appendTo(tr);
  tdHref.appendTo(tdVal);
  tdVal.appendTo(tr);
  return tr;
};

/**
 * Generic method for querying GME endpoints; takes care of boilerplate ajax.
 * @param {string} url URL of the endpoint.
 * @param {Object} parameters query parameters.
 * @param {function} success method to call on success of async request.
 */
GME.queryGME = function(url, parameters, success) {
  $.ajax({
    url: url,
    dataType: 'json',
    headers: {
      Authorization: 'Bearer ' + GME.token,
      'content-type': 'application/json'
    },
    data: parameters,
    error: function(response) {
      var response = JSON.parse(response.responseText);
      if (response.error) {
        var error = response.error.message;
      } else {
        var error = 'Error:  Unknown (no error response from API)';
      }
      window.alert(error);
    },
    success: success
  });
};

/**
 * Sets all elements with a specified class to be editable, with a
 * callback to write the changes to GME.
 * @param {string} tableId the id of the table being edited.
 * @param {string} editableClass the editable class (default "editable").
 */
GME.setEditable = function(tableId, editableClass) {
  editableClass = editableClass || '.editable';

  $(editableClass).editable({
    url: [GME.baseUrl, 'tables/', tableId, '/features/batchPatch'].join(''),
    params: function(params) {
      var feature = {};
      feature.properties = {};
      feature.properties['gx_id'] = params.pk + '';
      feature.properties[params.name] = params.value;
      var request = {
        'features': [feature]
      };
      return window.JSON.stringify(request);
    },
    ajaxOptions: {
      dataType: 'json',
      headers: {
        Authorization: 'Bearer ' + GME.token,
        'content-type': 'application/json'
      }
    },
    success: function(response, newValue) {
      GME.notify('Feature edits saved');
      console.log('success', response, newValue);
    },
    error: function(response) {
      console.log('error', response);
    }
  });
};

/**
 * Open an InfoWindow for a given Feature.
 * @param {google.maps.MapsEventListener} event the click event.
 * @this {google.maps.MVCObject} the Overlay that was clicked.
 */
GME.displayInfoWindow = function(event) {
  var overlay = this;
  var container = $('<div/>');
  var geomDeleteLink = $('<a/>', {
    html: 'delete',
    id: 'geom_delete_link',
    class: 'padding',
    href: '#'
  });
  geomDeleteLink.appendTo(container);
  var geomEditLink = $('<a/>', {
    html: 'edit geometry',
    id: 'geom_edit_link',
    class: 'padding',
    href: '#'
  });
  geomEditLink.appendTo(container);
  var content = $('<table/>', {
    id: 'GME.infoWindowContent',
    class: 'table table-bordered table-striped'
  });
  var id = overlay.geojsonProperties.gx_id;
  $.each(this.geojsonProperties, function(key, val) {
    var row = GME.getEditableRow(key, val, id);
    row.appendTo(content);
  });
  content.appendTo(container);
  GME.infoWindow.setContent(container.html());
  GME.infoWindow.setPosition(event.latLng);
  GME.infoWindow.open(GME.map);

  GME.setEditable(GME.currentTableId);
  //make geom editable
  $('#geom_edit_link').click(function(e) {
    overlay.set('editable', true);
    overlay.set('draggable', true);
    //TODO zoom to feature
    GME.setupGeomSaveLink(GME.currentTableId, overlay);
  });
  $('#geom_delete_link').click(function(e) {
    GME.deleteFeature(overlay.geojsonProperties.gx_id);
  });
};


/**
 * Deletes a feature from GME.
 * @param {string} featureId is the gx_id of the feature.
 */
GME.deleteFeature = function(featureId) {
  var endpoint = '/features/batchDelete';
  var url = [GME.baseUrl, 'tables/', GME.currentTableId, endpoint].join('');
  if (window.confirm('Are you sure you want to delete this feature?')) {
    var request = {
      'gx_ids': [featureId]
    };
    $.ajax({
      type: 'POST',
      url: url,
      data: window.JSON.stringify(request),
      dataType: 'json',
      headers: {
        Authorization: 'Bearer ' + GME.token,
        'content-type': 'application/json'
      },
      success: function(response, newValue) {
        GME.notify('Successfully deleted feature');
        GME.currentOverlays[featureId].setMap(null);
        GME.infoWindow.setMap(null);
        // Remove from local copy of features
        var features = GME.tableDetails[GME.currentTableId].features;
        delete features[featureId];
        // Redraw table view if needed;
        if ($('#table-map-switcher').html() == 'Map View') {
          GME.displayTableEditor(GME.currentTableId);
        }
      },
      error: function(response) {
        GME.notify('Error deleting feature');
        console.log('DELETE error', response);
      }
    });
  }
};


/**
 * Return a GeoJSON formatted geometry for a given Overlay.
 * @param {google.maps.MVCObject} overlay the map overlay.
 * @return {Object} the geojson geometry.
 */
GME.getGeoJSONGeometryFromOverlay = function(overlay) {
  // Hard to tell if overlay is polyline or polygon, so we've set geomType attr.
  var coords = [];
  geometry = {
    type: overlay._gmeGeomType
  };
  switch (geometry.type) {
    case 'Polygon':
      $.each(overlay.getPath().getArray(), function(i, ll) {
        coords.push([ll.lng(), ll.lat()]);
      });
      // Ensure loop is closed.
      var last = coords[coords.length - 1];
      if ((coords[0][0] != last[0]) || (coords[0][1] != last[1])) {
        coords.push(coords[0]);
      }
      // Assume single ring.
      coords = [coords];
    break;

    case 'LineString':
      $.each(overlay.getPath().getArray(), function(i, ll) {
        coords.push([ll.lng(), ll.lat()]);
      });
    break;

    case 'Point':
      var pos = overlay.getPosition();
      coords.push(pos.lng());
      coords.push(pos.lat());
    break;

  }
  geometry.coordinates = coords;
  return geometry;
};

/**
 * Enables a "save edits" link which will POST the geometry back to GME.
 * @param {string} tableId the id of the table to post back to.
 * @param {google.maps.MVCObject} overlay the map overlay.
 */
GME.setupGeomSaveLink = function(tableId, overlay) {
  //on save, turn geoms to geojson
  //TODO (assumes polygon)
  $('#geom_edit_link')
   .html('save edits')
   .click(function(e) {
    var geojson = {
      properties: {
        gx_id: overlay.geojsonProperties.gx_id
      },
      geometry: GME.getGeoJSONGeometryFromOverlay(overlay)
    };
    var request = {
      'features': [
        geojson
      ]
    };
    $.ajax({
      type: 'POST',
      url: [GME.baseUrl, 'tables/', tableId, '/features/batchPatch'].join(''),
      data: window.JSON.stringify(request),
      dataType: 'json',
      headers: {
        Authorization: 'Bearer ' + GME.token,
        'content-type': 'application/json'
      },
      success: function(response, newValue) {
        GME.notify('Geometry edits saved');
        overlay.set('editable', false);
        if (overlay.bounce) {
          overlay.set('draggable', false);
          overlay.bounce();
        }
        $('#geom_edit_link').html('edit geometry');
      },
      error: function(response) {
        GME.notify('Error saving geometry edit');
        console.log('error', response);
      }
   });
  });
};

/**
 * Displays a given GME 'Map' by adding each layer individually.
 * @param {string} asset object for the map to be displayed.
 * @param {google.maps.MVCObject} bounds the maps api bounds to zoom to.
 */
GME.displayMap = function(asset, bounds) {
  var uri = GME.getMapsEngineLink(asset.id, 'MapCreation');
  $('#information').show().html(uri + '<br/>' + asset.id);
  var mapsEngingeLayer = new google.maps.visualization.MapsEngineLayer({
    map: GME.map,
    oAuthToken: GME.token
  });
  //TODO (jlivni):  Actually add the individual layers instead of the map.
};


/**
 * Displays a given GME 'Layer' by adding each layer individually.
 * @param {string} asset object for the layer to be displayed.
 * @param {google.maps.MVCObject} bounds the maps api bounds to zoom to.
 */
GME.displayLayer = function(asset, bounds) {
  var uri = GME.getMapsEngineLink(asset.id, 'Layers');
  $('#information').show().html(uri + '<br/>' + asset.id);
  var mapsEngingeLayer = new google.maps.visualization.MapsEngineLayer({
    map: GME.map,
    layerId: asset.id,
    oAuthToken: GME.token
  });
  GME.mapsEngineLayers.push(mapsEngingeLayer);
  google.maps.event.addListener(mapsEngingeLayer, 'click', function(event) {
    console.log('layer click', event);
    GME.infoWindow.setContent(event.properties.infoWindowHtml);
    GME.infoWindow.setPosition(event.latLng);
    GME.infoWindow.open(GME.map);
  });
  GME.map.fitBounds(bounds);
};


/**
 * Switches between table and map view.
 * @param {bool} showMap whether to display the map or the table view.
 */
GME.displayMapView = function(showMap) {
  if (showMap) {
    $('#table-canvas').hide();
    $('#map-canvas').show();
  } else {
    $('#map-canvas').hide();
    $('#table-canvas').show();
  }
};


/**
 * Sets up the html to optinally view features in a table.
 */
GME.setTableSwitcher = function() {
  $('#table-map-switcher')
    .html('Table View')
    .show()
    .click(function() {
      GME.displayTableEditor();
  });
};

/**
 * Create a link to the asset within Maps Engine
 * @param {string} id of the asset.
 * @param {place} assetType for the GME.
 * @return {string} html link.
 *
 */
GME.getMapsEngineLink = function(id, assetType) {
  var tableUrl = ['https://earthbuilder.google.com/admin/#',
                  assetType,
                  'Place:cid=',
                  id.split('-')[0],
                  '&v=DETAIL_INFO&aid=',
                  id].join('');
  return ['<a target="_blank" href="',
          tableUrl,
          '">Display in Maps Engine</a>'].join('');
};

/**
 * Get the selected features for the table; zoom map.
 * @param {string} asset the asset object of the table to display.
 * @param {google.maps.MVCObject} bounds the Maps API bounds to zoom to.
 */
GME.displayTable = function(asset, bounds) {
  var id = asset.id;
  var gmeLink = GME.getMapsEngineLink(id, 'Repository');
  var createLink = $('<a/>', {
    text: 'Create Layer',
    href: '#'
  }).click(function() {
    GME.createLayer(asset);
  });
  $('#information').show().html(gmeLink).append(createLink).append(asset.id);
  GME.displayMapView(true);
  $('.sidebar.active').removeClass('active');
  $('#side_' + id).parent().addClass('active');
  GME.currentTableId = id;
  if (GME.tableDetails[id]) {
    GME.displayFeatures(id);
  } else {
    var url = [GME.baseUrl, 'tables/', id, '/features?include=schema'].join('');
    parameters = {
      projectId: GME.projectId,
      maxResults: 500
    };
    GME.queryGME(url, parameters, function(response) {
      // create dict of features
      var features = {};
      $.each(response.features, function(i, feature) {
        features[feature.properties.gx_id] = feature;
      });
      response.features = features;
      GME.tableDetails[id] = response;
      GME.displayFeatures(id);
    });
  }
};

/**
 * Display the table editor (and hide the map viewer).
 * @param {string} id the ID of the table to be edited.
 */
GME.displayTableEditor = function(id) {
  $('#table-map-switcher').html('Map View').click(function() {
    GME.displayMapView(true);
    GME.setTableSwitcher('table');
  });
  GME.displayMapView(false);
  //get current table
  var result = GME.tableDetails[GME.currentTableId];
  var container = $('<div/>');
  var content = $('<table/>', {
    class: 'table table-bordered table-striped'
  });
  var header = '<tr>';
  // Add columns for view/delete
  header += '<th>Show</th>';
  header += '<th>Delete</th>';
  $.each(result.schema.columns, function(i, metadata) {
    if (metadata.name != 'geometry') {
      header += '<th>' + metadata.name + '</th>';
    }
  });
  header += '</tr' >
  content.append(header);
  $.each(result.features, function(i, feature) {
    var id = feature.properties.gx_id;
    var tr = $('<tr/>');
    // view on map
    var td = $('<td/>');
    var tdHref = $('<a/>', {
      text: 'show'
    }).click(function() {
      GME.zoomToFeature(id);
    });
    td.appendTo(tr);
    tdHref.appendTo(td);
    // delete
    var td = $('<td/>');
    var tdHref = $('<a/>', {
      text: 'delete'
    }).click(function() {
      GME.deleteFeature(id);
    });
    td.appendTo(tr);
    tdHref.appendTo(td);

    $.each(result.schema.columns, function(i, metadata) {
      if (metadata.name == 'geometry') {
        return true; // Continue
      } else {
        var value = feature.properties[metadata.name] || 'no value found';
      }
      var td = $('<td/>');
      var tdHref = $('<a/>', {
        text: value,
        href: '#',
        id: 'editable_' + metadata.name,
        class: metadata.name == 'geometry' ? '' : 'editable',
        'data-type': value.length > 60 ? 'textarea' : 'text',
        'data-pk': id,
        'data-name': metadata.name
        });
        td.appendTo(tr);
        tdHref.appendTo(td);
      });
    tr.appendTo(content);
  });
  container.append(content);
  $('#table-canvas').html('');
  $('#table-canvas').append(container);
  GME.setEditable(GME.currentTableId);
};


/**
 * Zoom to a given feature on the map.
 * @param {string} featureId ID of the feature to zoom.
 */
GME.zoomToFeature = function(featureId) {
  // Ensure we're in map view
  GME.displayMapView(true);
  GME.setTableSwitcher();
  overlay = GME.currentOverlays[featureId];
  if (overlay.getPosition) {
    GME.map.setCenter(overlay.getPosition());
    GME.map.setZoom(16);
  } else {
    var bounds = new google.maps.LatLngBounds();
    $.each(overlay.getPath().getArray(), function(i, latLng) {
      bounds.extend(latLng);
    });
    GME.map.fitBounds(bounds);
  }
};


/**
};
 * For a given project, puts all the assets (maps, layers, etc) in the sidebar.
 * @param {string} apiEndpoint which endpoint (such as 'map') to query.
 */
GME.getAssets = function(apiEndpoint) {
  GME.clearMap();
  GME.resetSidebar();
  apiEndpoint = $('.header.active a')[0].id.split('-')[1];
  parameters = {
    projectId: GME.projectId,
    maxResults: 500
  };

  if (GME.projectId != 'FusionTables') {
    var url = GME.baseUrl + apiEndpoint + '/';
  } else {
    parameters.key = GME.FTKey;
    var url = GME.FTUrl + 'tables/';
  }

  GME.queryGME(url, parameters, function(response) {
    GME.clearMap();
    GME.resetSidebar();
    GME.displayAssets(response, apiEndpoint);
  });
};

/**
 * Fits the map div to the window (minus header and sidebar).
 */
GME.resizeMapToWindow = function() {
  var h = $(window).height(),
      offsetTop = 90; // Calculate the top offset
  $('#map-canvas').css('height', (h - offsetTop));
  $('.sidebar-nav').css('height', (h - offsetTop - 40));
};

google.maps.event.addDomListener(window, 'load', GME.initialize);
