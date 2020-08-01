jQuery(document).ready(function() {
  jQuery('abbr.timeago').timeago();
});

function emptyTable(id) {
}

function decorateButtons() {
  ['service', 'configuration'].forEach(function(label) {
    // see if the next_$label.attr.marker is not empty.
  });
}

function buildServiceTableRow(service) {
  var date = new Date(service.last_seen).toISOString();

  return '<tr>' +
    '<td><a data-toggle="modal" href="#' + service.key + '">' + service.key + '</a></td>' +
    '<td>' + service.heartbeat_timeout + '</td>' +
    '<td><abbr class="timeago" title="' + date + '"></abbr></td>' +
    '</tr>';
  return '<tr><td><a data-toggle="modal" href="#' + service.key + '">' + service.key + '</a></td><td></td><td></td><td></td>/tr>';
}

function buildServiceModal(service) {
  var s = '',
      metaRows = '',
      tagRows = '';
      lastSeen = new Date(service.last_seen).toISOString();

  Object.keys(service.metadata).forEach(function(key) {
    metaRows += '<tr><td>' + key + '</td><td>' + service.metadata[key] + '</td></tr>';
  });

  service.tags.forEach(function(tag) {
    tagRows += '<tr><td>' + tag + '</td></tr>';
  });

  // todo: there has _GOT_ to be a better web pattern for doing this. a client side templating or something.
  s += '<div id="' + service.key + '" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="myModalDialog">';
    s+= '<div class="modal-header">';
      s+= '<button class="close" type="button" data-dismiss="modal" aria-hidden="true">x</button>';
      s+= '<h3>Service ' + service.key + '</h3>';
    s+= '</div>';
    s+= '<div class="modal-body">';
    s += '<table class="table table-bordered table-condensed>"';
    s += '<tr><td>Heartbeat Timeout (sec)</td><td>' + service.heartbeat_timeout + '</td>';
    s += '<tr><td>Last Seen</td><td><abbr class="timeago" title="' + lastSeen + '"></abbr></td>';
    s += '</table>'
      s+= '<div class="accordion" id="meta_' + service.key + '">';
        s+= '<div class="accordion-group">';
          s+= '<div class="accordion-heading">';
            s+= '<a class="accordion-toggle" data-toggle="collapse" data-parent="meta_' + service.key + '" href="#collapse_meta_' + service.key + '">Metadata</a>';
          s+= '</div>';
          s+= '<div class="accordion-body collapse in" id="collapse_meta_' + service.key + '">';
            s+= '<div class="accordion-inner"><table class="table table-bordered table-condensed">';
              s+= metaRows;
            s+= '</table></div>';
          s+= '</div>';
        s+= '</div>';
      s+= '</div>';
      s+= '<div class="accordion" id="tags_' + service.key + '">';
        s+= '<div class="accordion-group">';
          s+= '<div class="accordion-heading">';
            s+= '<a class="accordion-toggle" data-toggle="collapse" data-parent="tags_' + service.key + '" href="#collapse_tags_' + service.key + '">Tags</a>';
          s+= '</div>';
          s+= '<div class="accordion-body collapse in" id="collapse_tags_' + service.key + '">';
            s+= '<div class="accordion-inner"><table class="table table-bordered table-condensed">';
              s+= tagRows;
            s+= '</table></div>';
          s+= '</div>';
        s+= '</div>';
      s+= '</div>';
    s+= '</div>';
  s += '</div>';
  return s;
}

function buildConfigurationTableRow(config) {
  var createdAt = new Date(config.created_at).toISOString(),
      s = '';
  s += '<tr>';
    s += '<td>' + config.key + '</td>';
    s += '<td>' + config.value + '</td>';
    s += '<td><abbr class="timeago" title="' + createdAt + '"></abbr></td>';
  s += '</tr>';
  return s;
}

function maintainStackAndButtons(which, markerStack, nextKey) {
  // maintain the marker stack.
  if (nextKey) {
    markerStack.push(nextKey);
  } else {
    markerStack.push('END');
  }
  $('#' + which + '_markers').attr('stack', markerStack.join(','));

  // see if we need to disable buttons.
  if (markerStack.length === 2) {
    $('#' + which + '_prev_btn').addClass('disabled');
  } else {
    $('#' + which + '_prev_btn').removeClass('disabled');
  }
  if (markerStack[markerStack.length - 1] === 'END') {
    $('#' + which + '_next_btn').addClass('disabled');
  } else {
    $('#' + which + '_next_btn').removeClass('disabled');
  }
}

function loadServices(acctId, markerStack) {
  $.get('/_dashboard/data/services/' + acctId + '/' + markerStack[markerStack.length-1] + '/10', {}, function(json) {
    var obj = JSON.parse(json);
    $('#service_table').empty();
    $('#service_modals').empty();
    if (obj.err) {
      console.log(obj.err);
      // todo: show an error.
    } else {
      obj.services.forEach(function(service) {
        $('#service_table').append(buildServiceTableRow(service));
        $('#service_modals').append(buildServiceModal(service));
        jQuery('abbr.timeago').timeago();
      });

      maintainStackAndButtons('service', markerStack, obj.nextKey);
    }
  });
}

function loadConfigurations(acctId, markerStack) {
  $.get('/_dashboard/data/configurations/' + acctId + '/' + markerStack[markerStack.length -1] + '/10', {}, function(json) {
    var obj = JSON.parse(json);
    $('#configuration_table').empty();
    if (obj.err) {
      console.log(obj.err);
      // todo: show an error.
    } else {
      obj.configurations.forEach(function(config) {
        $('#configuration_table').append(buildConfigurationTableRow(config));
      });
      jQuery('abbr.timeago').timeago();

      maintainStackAndButtons('configuration', markerStack, obj.nextKey);
    }
  });
}

function nextServices() {
  // bail if button is disabled
  if ($('#service_next_btn').attr('class').indexOf('disabled') >= 0) {
    return;
  }

  var acctId = $('#account').attr('key'),
      markerStack = $('#service_markers').attr('stack').split(',');
  loadServices(acctId, markerStack);
}

function prevServices() {
  if ($('#service_prev_btn').attr('class').indexOf('disabled') >= 0) {
    return;
  }

  var acctId = $('#account').attr('key'),
      markerStack = $('#service_markers').attr('stack').split(',');
  // slice off the last two.
  markerStack = markerStack.slice(0, markerStack.length - 2);
  loadServices(acctId, markerStack);
}

function nextConfigurations() {
  // bail if button is disabled
  if ($('#configuration_next_btn').attr('class').indexOf('disabled') >= 0) {
    return;
  }

  var acctId = $('#account').attr('key'),
      markerStack = $('#configuration_markers').attr('stack').split(',');
  loadConfigurations(acctId, markerStack);
}

function prevConfigurations() {
  if ($('#configuration_prev_btn').attr('class').indexOf('disabled') >= 0) {
    return;
  }

  var acctId = $('#account').attr('key'),
      markerStack = $('#configuration_markers').attr('stack').split(',');
  // slice off the last two.
  markerStack = markerStack.slice(0, markerStack.length - 2);
  loadConfigurations(acctId, markerStack);
}
