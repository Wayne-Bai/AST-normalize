// Functions related to rendering and attaching DOM elements

var TT = TT || {};
TT.View = (function () {

  var pub = {};

  pub.MIN_COLUMN_WIDTH = 220;

  pub.Templates = {};

  // client-side templating is abstracted away
  pub.render = function (name, data) {
    if (!pub.Templates[name]) {
      pub.Templates[name] = new Hogan.Template(HoganTemplates[name]);
    }
    return pub.Templates[name].render(data);
  };

  pub.attach = function (html, target, method) {
    // Valid methods are appendTo, prependTo, insertAfter, insertBefore
    // since they return the new element, not the target
    method = method || 'appendTo';
    return $(html)[method](target);
  };

  pub.drawPageLayout = function () {
    return pub.attach(pub.render('layout'), 'body');
  };

  var containerWidthTimeout;
  pub.updateColumnDimensions = function () {
    var $window = $(window);
    var $columns = $('#columns .column');
    var $container = $('#columns');

    if ($columns.length === 0) {
      $('#columns').width('90%');

      return false;
    }

    // Calculate column height.
    var heightOffset = 26;
    var columnHeight = $window.height() - ($('.column-bucket').offset().top + heightOffset);
    $('.column-bucket').height(columnHeight);

    // Tally empty columns.
    var emptyColumnCount = 0;
    $columns.each(function () {
      var $column = $(this);
      var name = $column.data('name');
      if ($column.find('.story').length === 0 && name !== 'Labels') {
        $column.addClass('empty-column');
        emptyColumnCount++;
      } else {
        $column.removeClass('empty-column');
      }
    });

    // Calculate column width.
    var columnCount = $columns.length;
    var windowMargin = 14;
    var columnMargin = 6;
    var emptyColumnWidth = 100 + columnMargin;
    var calculatedColumnWidth = 0;
    var availableWidth = $window.width() - windowMargin;

    if (emptyColumnCount === columnCount) {
      $container.removeClass('not-all-empty');
    } else {
      $container.addClass('not-all-empty');
    }

    if (emptyColumnCount > 0 && emptyColumnCount !== columnCount) {
      // Revise available width and recalculate
      availableWidth -= (emptyColumnWidth * emptyColumnCount);
      calculatedColumnWidth = availableWidth / (columnCount - emptyColumnCount);
    } else {
      calculatedColumnWidth = availableWidth / columnCount;
    }

    var finalColumnWidth = Math.max(pub.MIN_COLUMN_WIDTH, calculatedColumnWidth - columnMargin);
    $columns.width(finalColumnWidth);

    // Set column container width.
    var times = 20;
    clearTimeout(containerWidthTimeout);
    function setContainerWidth() {
      var containerWidth = 0;
      $columns.each(function () {
        containerWidth += $(this).width() + columnMargin;
      });
      $container.css({ minWidth: containerWidth });
      if (times--) {
        containerWidthTimeout = setTimeout(setContainerWidth, 20);
      }
    }

    pub.setSortableColumnHeight(columnHeight);
    setContainerWidth();
  };

  pub.setSortableColumnHeight = function (columnHeight) {
    $('#columns .bucket-content').each(function () {
      var parent = $(this).parent();
      var height = columnHeight - parent.find('.bucket-template').outerHeight() - 4;
      $(this).css({ minHeight: height });
    });
  };

  pub.drawColumnListNav = function () {
    $('#columnList .column-list-nav').remove();
    var html = pub.render('columnListNav', { columns: TT.Model.Layout.get() });

    return pub.attach(html, '#columnList');
  };

  pub.drawColumns = function () {
    $('#columns .column').remove();
    TT.Model.Layout.each(function (index, column) {
      if (column.active) {
        pub.drawColumn(column.name);
      }
    });
  };

  pub.drawColumn = function (name) {
    var column = TT.Model.Column.get({ name: name });
    var html = pub.render('column', column);
    var element = pub.attachColumn(column, html);
    pub.drawColumnTemplate(column);

    return element;
  };

  pub.attachColumn = function (column, html) {
    var activeColumns = TT.Model.Layout.find({ active: true });
    if (activeColumns[0].name === column.name) {
      return pub.attach(html, '#columns', 'prependTo');
    }

    var precedingColumn;
    $.each(activeColumns, function (index, activeColumn) {
      if (activeColumn.name === column.name) {
        precedingColumn = $('#columns .column[data-name="' + activeColumns[index - 1].name + '"]')[0];
      }
    });
    if (precedingColumn) {
      return pub.attach(html, precedingColumn, 'insertAfter');
    }

    return pub.attach(html, '#columns');
  };

  pub.setColumnState = function (name, state) {
    TT.Model.Column.update({ name: name }, { active: state });
    TT.Model.Layout.update({ name: name }, { active: state });
    TT.Model.Layout.clientSave();
  };

  pub.addColumn = function (name) {
    pub.setColumnState(name, true);
    pub.drawColumn(name);
    pub.drawStoriesInColumn(TT.Model.Column.get({ name: name }));
    pub.afterColumnUpdate();
  };

  pub.removeColumn = function (name) {
    $('#columns .column[data-name="' + name + '"]').remove();
    pub.setColumnState(name, false);
    pub.afterColumnUpdate();
  };

  pub.afterColumnUpdate = function () {
    pub.updateColumnDimensions();
    pub.drawColumnListNav();
    pub.refreshColumnStoryCount();
    TT.DragAndDrop.initStorySorting();
  };

  pub.drawColumnTemplates = function () {
    $('#columns .column-template').remove();
    TT.Model.Layout.each(function (index, column) {
      if (column.active) {
        var actualColumn = TT.Model.Column.get({ name: column.name });
        pub.drawColumnTemplate(actualColumn);
      }
    });
  };

  pub.drawColumnTemplate = function (column) {
    if (column.template) {
      var html = '<div class="column-template">' + column.template() + '</div>';
      var element = pub.attach(html, '#columns .' + column.class_name + ' .bucket-template');

      if (column.afterTemplateRender) {
        column.afterTemplateRender();
      }

      return element;
    }
  };

  pub.refreshColumnStoryCount = function () {
    TT.Model.Column.each(function (index, column) {
      var $counter = $('#columnList .column-selector[data-name="' + column.name + '"] span.column-story-count');
      if (column.storyCount === 0) {
        $counter.hide();
      } else {
        $counter.show().html(column.storyCount);
      }
    });
  };

  pub.refreshLayout = function () {
    pub.drawColumns();
    pub.drawStories();
  };

  pub.drawProjectList = function (projects) {
    $('#projects .projects').remove();
    var html = pub.render('projectList', { projects: projects });

    return pub.attach(html, '#projects');
  };

  pub.clearStories = function () {
    $('#columns .story').remove();
  };

  pub.drawStories = function () {
    pub.setProjectActiveState();
    pub.setProjectDisabilityState();
    pub.clearStories();

    TT.Model.Column.each(function (index, column) {
      pub.drawStoriesInColumn(column);
    });

    pub.afterColumnUpdate();
    pub.drawColumnTemplates();
  };

  pub.drawStoriesInColumn = function (column) {
    column.storyCount = 0;
    TT.Model.Story.each(function (index, story) {
      if (column.filter && column.filter(story) &&
        TT.Model.Project.isActive({ id: story.project_id }) &&
        TT.Model.Story.isNotFiltered(story)) {
        column.storyCount++;
        if (column.active) {
          pub.drawStory(story, column);
        }
      }
    });
  };

  pub.setProjectActiveState = function () {
    var projectList = [];
    $('#projects .project').each(function () {
      var id = $(this).data('project-id');
      var isActive = !$(this).hasClass('inactive');
      TT.Model.Project.update({ id: id }, { active: isActive });
      if (isActive) {
        projectList.push(id);
      }
    });

    TT.Utils.localStorage('projectList', projectList);
  };

  pub.setProjectDisabilityState = function () {
    var projectList = [];
    $('#projects .project').each(function () {
      var id = $(this).data('project-id');
      var isDisabled = $(this).hasClass('disabled');
      TT.Model.Project.update({ id: id }, {
        disabled: isDisabled,
        status: isDisabled ? 'on' : ''
      });
      if (isDisabled) {
        projectList.push(id);
      }
    });

    TT.Utils.localStorage('projectDisabledList', projectList);
  };

  pub.restoreStoryState = function (element, story) {
    if (story.expanded) {
      element.toggleClass('expanded-story');
      pub.drawStoryDetails(element);

      var state = TT.Utils.getStoryState(story.id);
      // TODO: clean this up
      if (state.description) {
        element.find('.description').click();
        element.find('.description-container textarea').val(state.description).height(state.descriptionHeight).focus();
      }
      if (state.note) {
        element.find('.add-note').click();
        element.find('.notes textarea').val(state.note).height(state.noteHeight).focus();
      }
      if (state.name) {
        element.find('.title').click();
        element.find('.title-container textarea').val(state.name).height(state.nameHeight).focus();
      }
    }
  };

  pub.drawStory = function (story, column) {
    return pub.drawStoryHelper(story, '.' + column.class_name + ' .bucket-content');
  };

  pub.redrawStory = function (story) {
    $('#columns .story-' + story.id).each(function () {
      pub.drawStoryHelper(story, this, 'insertAfter');
      $(this).remove();
    });
    pub.redrawFloatingStory(story);
  };

  pub.redrawFloatingStory = function (story) {
    var container = $('.floating-story');
    if (container.length > 0) {
      container.find('.story').remove();
      TT.View.drawStoryHelper(story, container);
      var storyElement = container.find('.story');
      storyElement.addClass('expanded-story');
      TT.View.drawStoryDetails(storyElement);
    }
  };

  pub.drawStoryHelper = function (story, target, insertMethod) {
    var label_backup = story.labels;
    story.labels = pub.labels_without_metadata(story.labels);
    var html = pub.render('story', story);
    story.labels = label_backup;
    var element = pub.attach(html, target, insertMethod);

    var specialLabels = ['blocked', 'orange', 'yellow', 'green', 'blue'];
    $.each(specialLabels, function (i, label) {
      if (TT.Model.Story.hasTag(story, label)) {
        element.addClass(TT.Utils.cssify(label));
      }
    });

    pub.restoreStoryState(element, story);

    return element;
  };

  pub.labels_without_metadata = function (labels) {
    var output = [];
    $.each(labels, function (index, label) {
      if (!/^\[.+\=.+\]$/.test(label)) {
        output[output.length] = label;
      }
    });
    return output;
  };

  pub.drawStoryDetails = function (storyElement) {
    var story = TT.Model.Story.get({ id: storyElement.data('id') });

    if (!story.formatted) {
      story.formatted_description = story.description ? TT.Utils.marked(story.description) : '<span class="ghost">Click to add a description</span>';
      story.notes = TT.Model.Story.compileNotes(story);
      story.formatted = true;
    }

    TT.Event.trigger('beforeStoryDetailsRender', story);

    var html = pub.render('storyDetails', story);

    return pub.attach(html, storyElement);
  };

  pub.drawFilter = function (filter) {
    var html = pub.render('filter', filter);
    var element = pub.attach(html, '#filters', 'prependTo');
    if (filter.active === false) {
      element.addClass('inactive');
    }

    return element;
  };

  pub.drawResetDialog = function () {
    TT.Dialog.open(pub.render('resetDialog'));
  };

  pub.drawAccountSettingsForm = function () {
    TT.Dialog.open(pub.render('accountSettings'));

    var id;
    $('#pivotal-token-input').val($.cookie('pivotalToken')).focus().bind('keyup paste', function () {
      var me = this;
      clearTimeout(id);
      id = setTimeout(function () {
        var token = $.trim($(me).val());
        if (token && token !== TT.Utils.getToken()) {
          $(me).addClass('updating');
          $.cookie('pivotalToken', token, { expires: 365 });
          $.ajax({
            url: '/projects',
            success: function (projects) {
              $(me).removeClass('updating');
              if (projects) {
                $(me).addClass('valid').removeClass('invalid');
                TT.Utils.localStorage('projects', projects);
                TT.Init.addProjects(projects);
              } else {
                $(me).addClass('invalid').removeClass('valid');
              }
            }
          });
        }
      }, 100);
    });

    $('#pivotal-username').val($.cookie('pivotalUsername'));
    $('#pivotal-username').focus(TT.UI.openPivotalUsernameAutocomplete);
  };

  pub.message = function (str, options) {
    options = $.extend({
      type: 'info',
      timeout: 3000
    }, options || {});

    var html = pub.render('message', { str: str, type: options.type });
    var element = pub.attach(html, '#messages').click(function () {
      $(this).fadeOut(250, function () { $(this).remove(); });
      return false;
    });

    if (options.timeout) {
      setTimeout(function () {
        element.fadeOut(1000, function () { element.remove(); });
      }, options.timeout);
    }

    return element;
  };

  return pub;

}());
