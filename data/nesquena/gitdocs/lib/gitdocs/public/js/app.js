GitDocs = {
  // Links all breadcrumb options in the explored path
  linkBreadcrumbs : function() {
    var fullPath = $('span.path').text().replace(/\/+/g, '/').replace(/\/$/, '');
    if (fullPath.length === 0) { return; }
    var docIdx = window.location.pathname.match(/\/(\d+)/);
    if (!docIdx) { return false; }
    var paths = fullPath.split("/");
    $(paths).each(function(idx, subpath) {
      var relPath = paths.slice(0, idx+1).join("/");
      var link = "<a href='" + relPath + "'>" + subpath + "/</a>";
      fullPath = fullPath.replace(subpath + "/", link);
    });
    $('span.path').html(fullPath);
  },
  // fills in directory meta author and modified for every file
  fillDirMeta : function(){
    $('table#fileListing tbody tr').each(function(i, e) {
      var file = $(e).find('a').attr('href');
      var fileListingBody = $('table#fileListing tbody');
      $.getJSON(file + "?mode=meta", function(data) {
        $(e).addClass('loaded').find('td.author').html(data.author);
        $(e).find('td.modified').html(RelativeDate.time_ago_in_words(data.modified));
        $(e).find('td.size').html(Utils.humanizeBytes(data.size)).data("val", data.size);
        if ($(fileListingBody).find('tr').length == $(fileListingBody).find('tr.loaded').length) {
          GitDocs.pageLoaded(); // Fire on completion
        }
      });
    });
  },
  // Fire when the page is finished loading
  pageLoaded : function() {
    // Enable table sorter
    var extractor = function(e) { return $(e).data('val') || $(e).text(); };
    $("table#fileListing").tablesorter({ textExtraction : extractor, sortList: [[0,0]] });
  },
  // Displays a closeable alert within the content pane
  // Gitdocs.showAlert('This is the message', 'success')
  showAlert : function(body, result) {
    if (result === null) { result = 'info'; }
    $('.content div.alert-message').remove();
    var el = $('.content').prepend(
      '<div class="alert-message ' + result + '">'
      + '<a class="close" href="#">×</a>'
      + body
      + '</div>'
    );
    $('div.alert-message').alert();
  },
  // converts iso8601 dates tagged with .reldate to relative
  convertRelativeTimes : function() {
    $('.reldate').each(function(ind, el) {
      if ($(el).data("iso")) { return; }
      var iso = $(el).text();
      $(el).data("iso", iso);
      $(el).text(RelativeDate.time_ago_in_words(iso));
    });
  },
  activateTabs : function() {
    $('ul.tabs li a').each(function() {
      var href = $(this).attr('href');
      if ((href === location.pathname && location.search === '') || href === location.search) {
        $(this).parent().addClass('active');
      }
    });
  }
};

$(document).ready(function() {
  GitDocs.linkBreadcrumbs();
  GitDocs.fillDirMeta();
  GitDocs.convertRelativeTimes();
  GitDocs.activateTabs();
  StringFormatter.autoLink();
});

// Link method redirection
$('a[data-method]').live('click', function(e) {
  e.preventDefault();
  var link = $(this);
  var href = link.attr('href'),
    method = link.data('method'),
    target = link.attr('target'),
    form = $('<form method="post" action="' + href + '"></form>'),
    metadata_input = '<input name="_method" value="' + method + '" type="hidden" />';
  if (target) { form.attr('target', target); }
  form.hide().append(metadata_input).appendTo('body');
  form.submit();
});

// Confirm form submission when specified by data attribute.
$('form[data-confirm-submit]').live('submit', function(e) {
  return confirm($(this).attr('data-confirm-submit'));
});
