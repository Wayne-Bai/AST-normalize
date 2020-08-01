// Controller functions called by UI elements
// These are bound with data-click-handler attributes in the view.
// "this" is the clicked element

var TT = TT || {};
TT.UI = (function () {

  var pub = {};

  function getStoryFromContext(context) {
    var id = $(context).closest('.story').data('id');
    return TT.Model.Story.get({ id: id });
  }

  pub.openResetDialog = function () {
    TT.View.drawResetDialog();

    return false;
  };

  pub.reset = function () {
    TT.Dialog.close();
    TT.Utils.clearLocalStorage();
    $.cookie('pivotalToken', null);
    $.cookie('pivotalUsername', null);
    TT.Init.init();

    return false;
  };

  pub.toggleFullscreen = function () {
    $('body').toggleClass('fullscreen');
    TT.View.updateColumnDimensions();
    TT.Utils.localStorage('fullscreen', $('body').hasClass('fullscreen'));

    return false;
  };

  pub.selectProject = function () {
    $(this).toggleClass('inactive');
    $(window).trigger('workspaceUpdate');
    TT.View.drawStories();

    return false;
  };

  // From the Autocomplete selector
  pub.toggleProjectVisibility = function () {
    var controls = $(this).closest('.project-controls');
    var id = controls.data('id');
    var projectTab = $('#project-' + id);

    if (controls.hasClass('disabled')) {
      return false;
    }

    controls.toggleClass('active');
    projectTab.click();
    $(window).trigger('workspaceUpdate');

    return false;
  };

  pub.toggleProjectStatus = function () {
    var controls = $(this).closest('.project-controls');
    var id = controls.data('id');
    var projectTab = $('#project-' + id);

    controls.toggleClass('disabled');
    projectTab.toggleClass('disabled');
    TT.View.drawStories();

    return; // let checkbox toggle naturally
  };

  pub.refreshProjects = function () {
    TT.Init.requestProjectsAndIterations(true);

    return false;
  };

  pub.toggleColumnSelector = function () {
    var name = $(this).data('name');
    $(window).trigger('workspaceUpdate');

    if ($(this).hasClass('active')) {
      TT.View.removeColumn(name);
    } else {
      TT.View.addColumn(name);
    }

    return false;
  };

  pub.removeColumn = function () {
    var name = $(this).closest('.column').data('name');
    TT.View.removeColumn(name);
    $(window).trigger('workspaceUpdate');

    return false;
  };

  pub.removeColumnOnMiddleClick = function (e) {
    if (TT.Utils.keyPressed(e, 'MIDDLE_CLICK')) {
      $(this).find('span').click();
      return false;
    }

    // intentionally not returning false here to continue event bubbling
  };

  pub.selectText = function () {
    var element = $(this).select();
    setTimeout(function () {
      element.select();
    }, 0);

    return false;
  };

  pub.openFloatingStoryPreview = function () {
    $('.floating-story').unbind('mouseenter').remove();

    var offset = $(this).closest('.story').offset();
    if (offset.top === 0 || offset.left === 0) {
      return false;
    }

    var story = getStoryFromContext(this);
    var win = $(window);
    var container = $('<div class="floating-story"></div>').appendTo('body');
    TT.View.redrawFloatingStory(story);

    container.css({
      left: Math.min(offset.left, win.width() - container.outerWidth() - 7),
      top: Math.min(win.height() / 2, offset.top)
    });

    var maxHeight = win.height() - container.offset().top - 15;
    container.css({ maxHeight: maxHeight });

    var timeoutID;
    container.on('mouseenter', function () {
      clearTimeout(timeoutID);
      TT.Utils.setBoundaryCallback(container, function () {
        clearTimeout(timeoutID);
        timeoutID = setTimeout(function () {
          $('.floating-story').unbind('mouseenter').remove();
        }, 250);
      });
    });
  };

  pub.toggleStory = function () {
    var element = $(this).closest('.story').toggleClass('expanded-story');
    var story = getStoryFromContext(this);

    if (element.hasClass('expanded-story')) {
      TT.View.drawStoryDetails(element);
      TT.Model.Story.update({ id: story.id }, { expanded: true });
    } else {
      TT.Model.Story.update({ id: story.id }, { expanded: false });
      // TODO: Clean this up
      TT.Utils.updateStoryState(story.id, {
        name: null,
        nameHeight: null,
        description: null,
        descriptionHeight: null,
        note: null,
        noteHeight: null
      });
      TT.View.redrawStory(story);
    }

    return false;
  };

  pub.filterByProject = function () {
    var id = $(this).data('project-id');
    $('#projects .project').addClass('inactive');
    $('#project-' + id).removeClass('inactive');
    TT.View.drawStories();

    return false;
  };

  pub.filterByUser = function () {
    var name = $(this).data('username');
    TT.Model.Filter.add({
      name: name,
      type: 'user',
      fn: function (story) {
        return story.owned_by === name || story.requested_by === name ||
          TT.Model.Story.hasTag(story, '[pair=' + name.toLowerCase() + ']') ||
          TT.Model.Story.hasTag(story, '[qa=' + name.toLowerCase() + ']');
      }
    });
    TT.View.drawStories();

    return false;
  };

  pub.filterByTag = function () {
    var tag = $.trim($(this).text());
    TT.Model.Filter.add({
      name: tag,
      type: 'tag',
      fn: function (story) {
        return TT.Model.Story.hasTag(story, tag);
      }
    });
    TT.View.drawStories();

    return false;
  };

  pub.filterByTagFromEpicScale = function () {
    $(this).closest('.row').find('.tag').click();

    return false;
  };

  pub.toggleFilter = function (e) {
    var id = $(this).closest('.filter').data('filter-id');
    var filter = TT.Model.Filter.get({ id: id });

    if (TT.Utils.keyPressed(e, 'MIDDLE_CLICK') && filter.sticky !== true) {
      $(this).find('span.close').click();
      return false;
    }

    TT.Model.Filter.update({ id: id }, { active: !filter.active });
    $(this).toggleClass('inactive');
    $(window).trigger('workspaceUpdate');
    TT.View.drawStories();
    TT.Model.Filter.clientSave();

    return false;
  };

  pub.removeFilter = function () {
    var $filter = $(this).closest('.filter');
    var id = $filter.data('filter-id');
    TT.Model.Filter.remove({ id: id });
    $filter.remove();
    TT.View.drawStories();
    TT.Model.Filter.clientSave();

    return false;
  };

  pub.openAccountSettings = function () {
    TT.View.drawAccountSettingsForm();

    return false;
  };

  pub.saveAccountSettings = function () {
    var pivotalToken = $('#pivotal-token-input').val();
    var pivotalUsername = $('#pivotal-username').val();

    if (!pivotalToken) {
      TT.View.message('Token is required.', { type: 'error' });
      return false;
    }

    $.cookie('pivotalToken', pivotalToken, { expires: 365 });
    $.cookie('pivotalUsername', pivotalUsername, { expires: 365 });

    TT.Dialog.close();
    TT.Init.init();

    return false;
  };

  pub.openPivotalUsernameAutocomplete = function () {
    var items = [];

    TT.Model.User.each(function (index, user) {
      items[items.length] = {
        name: '<strong>' + user.name + '</strong> (' + user.initials + ')',
        value: user.name
      };
    });

    TT.Autocomplete.open({ items: items, target: this });

    return false;
  };

  pub.openProjectListAutocomplete = function () {
    if ($('#autocomplete .project-controls').length > 0) {
      TT.Autocomplete.close();

      return false;
    }

    var items = [];

    TT.Model.Project.each(function (index, project) {
      items[items.length] = {
        name: TT.View.render('projectControls', project),
        value: project.name
      };
    });

    TT.Autocomplete.open({
      applyOnClick: false,
      customTopOffset: 4,
      items: items,
      target: this,
      css: { width: 280 },
      maxHeight: $(window).height() - 60,
      noActive: true
    });

    $('#autocomplete .project-controls .project-status-checkbox').each(function () {
      if (!$(this).closest('.project-controls').hasClass('disabled')) {
        $(this).attr('checked', 'checked');
      }
    });

    pub.initProjectAutoCompleteSortable();

    return false;
  };

  pub.initProjectAutoCompleteSortable = function () {
    $('#autocomplete .list').sortable({
      containment: '#autocomplete',
      distance: 5,
      tolerance: 'pointer',
      start: function (event, ui) {
        var oldIndex = $('#autocomplete .list .item').index(ui.item);
        $(ui.item).data('oldIndex', oldIndex);
      },
      stop: function (event, ui) {
        var newIndex = $('#autocomplete .list .item').index(ui.item);
        var oldIndex = $(ui.item).data('oldIndex');
        var projects = JSON.parse(TT.Utils.localStorage('projects'));
        projects = TT.Utils.arrayMove(projects, oldIndex, newIndex);
        TT.Model.Project.move(oldIndex, newIndex);
        TT.View.drawProjectList(projects);
        TT.Init.setInactiveProjects();
        TT.Init.setDisabledProjects();
        TT.Utils.localStorage('projects', projects);
      }
    });
  };

  pub.openStoryRequesterUpdater = function () {
    var getItems = function (story) {
      var project = TT.Model.Project.get({ id: story.project_id });
      var users = TT.Utils.normalizePivotalArray(project.memberships.membership);
      var items = [];

      $.each(users, function (i, user) {
        items[items.length] = { name: user.person.name, value: user.person.name };
      });

      return items;
    };

    return openStoryUpdater(this, {
      getItems: getItems,
      key: 'requested_by',
      onAfterUpdate: function (id) {
        pub.setStoryUpdatingState(id, '.story-requester');
      }
    });
  };

  pub.openStoryOwnerUpdater = function () {
    var getItems = function (story) {
      var project = TT.Model.Project.get({ id: story.project_id });
      var users = TT.Utils.normalizePivotalArray(project.memberships.membership);
      var items = [];

      if (story.current_state === 'unscheduled' || story.current_state === 'unstarted') {
        items[items.length] = { name: '<em>none</em>', value: 'none' };
      }

      $.each(users, function (i, user) {
        items[items.length] = { name: user.person.name, value: user.person.name };
      });

      return items;
    };

    var onBeforeUpdate = function (update) {
      if (update.owned_by === 'none') {
        update.initials = '';
      } else {
        var user = TT.Model.User.get({ name: update.owned_by }) || {};
        update.initials = user.initials;
      }

      return update;
    };

    return openStoryUpdater(this, {
      getItems: getItems,
      key: 'owned_by',
      onBeforeUpdate: onBeforeUpdate,
      onAfterUpdate: function (id) {
        pub.setStoryUpdatingState(id, '.story-owner');
      }
    });
  };

  pub.openStoryPairUpdater = function () {
    var story = getStoryFromContext(this);

    var getItems = function (story) {
      var project = TT.Model.Project.get({ id: story.project_id });
      var users = TT.Utils.normalizePivotalArray(project.memberships.membership);
      var items = [
        { name: '<em>none</em>', value: 'none' }
      ];

      $.each(users, function (i, user) {
        if (user.person.name !== story.owned_by) {
          items[items.length] = { name: user.person.name, value: user.person.name };
        }
      });

      return items;
    };

    var onApply = function (name) {
      TT.Model.Story.addPair(story, name);
      pub.setStoryUpdatingState(story.id, '.story-pair');
    };

    return openStoryUpdater(this, {
      getItems: getItems,
      onApply: onApply
    });
  };

  pub.openStoryQAUpdater = function () {
    var story = getStoryFromContext(this);

    var getItems = function (story) {
      var project = TT.Model.Project.get({ id: story.project_id });
      var users = TT.Utils.normalizePivotalArray(project.memberships.membership);
      var items = [
        { name: '<em>none</em>', value: 'none' }
      ];

      $.each(users, function (i, user) {
        items[items.length] = { name: user.person.name, value: user.person.name };
      });

      return items;
    };

    var onApply = function (name) {
      TT.Model.Story.addQA(story, name);
      pub.setStoryUpdatingState(story.id, '.story-qa');
    };

    return openStoryUpdater(this, {
      getItems: getItems,
      onApply: onApply
    });
  };

  pub.openStoryPointsUpdater = function () {
    var getItems = function (story) {
      var project = TT.Model.Project.get({ id: story.project_id });
      var items = [];

      if (story.current_state === 'unscheduled' || story.current_state === 'unstarted') {
        items[items.length] = { name: '<em>unestimated</em>', value: '-1' };
      }

      $.each(project.point_scale.split(','), function (i, point) {
        items[items.length] = { name: point, value: point };
      });

      return items;
    };

    var onBeforeUpdate = function (update) {
      if (update.estimate < 0) {
        update.estimate = '';
      }

      return update;
    };

    return openStoryUpdater(this, {
      getItems: getItems,
      key: 'estimate',
      width: 100,
      onBeforeUpdate: onBeforeUpdate,
      onAfterUpdate: function (id) {
        pub.setStoryUpdatingState(id, '.story-points');
      }
    });
  };

  pub.openStoryStateUpdater = function () {
    var getItems = function (story) {
      return [
        { name: 'Unscheduled', value: 'unscheduled' },
        { name: 'Unstarted', value: 'unstarted' },
        { name: 'Started', value: 'started' },
        { name: 'Finished', value: 'finished' },
        { name: 'Delivered', value: 'delivered' },
        { name: 'Accepted', value: 'accepted' },
        { name: 'Rejected', value: 'rejected' }
      ];
    };

    return openStoryUpdater(this, {
      getItems: getItems,
      key: 'current_state',
      width: 120,
      onAfterUpdate: function (id) {
        pub.setStoryUpdatingState(id, '.story-state');
      }
    });
  };

  pub.openStoryTypeUpdater = function () {
    var getItems = function (story) {
      return [
        { name: 'Feature', value: 'feature' },
        { name: 'Bug', value: 'bug' },
        { name: 'Chore', value: 'chore' },
        { name: 'Release', value: 'release' }
      ];
    };

    return openStoryUpdater(this, {
      getItems: getItems,
      key: 'story_type',
      width: 120,
      onAfterUpdate: function (id) {
        pub.setStoryUpdatingState(id, '.story-type');
      }
    });
  };

  pub.setStoryUpdatingState = function (id, selector) {
    $('.story-' + id + ' ' + selector).closest('.detail').addClass('is-updating');
  };

  function openStoryUpdater(context, options) {
    var story = getStoryFromContext(context);

    TT.Autocomplete.open({
      css: { width: options.width || 200 },
      items: options.getItems(story),
      value: $(context).text(),
      showInput: true,
      target: context,
      onApply: options.onApply || function (value) {
        var update = {};
        update[options.key] = (value === 'none') ? null : value;
        TT.Model.Story.serverSave(story, update, function () {
          TT.View.redrawStory(story);
        });
        if (options.onBeforeUpdate) {
          update = options.onBeforeUpdate(update);
        }
        TT.Model.Story.update({ id: story.id }, update);
        TT.View.redrawStory(story);
        if (options.onAfterUpdate) {
          options.onAfterUpdate(story.id);
        }
      }
    });

    return false;
  }

  pub.openStoryAttachmentControls = function () {
    var id = $(this).data('id');
    var url = $(this).data('url');

    var actions = [
      { name: 'Download', value: 'Download' },
      { name: 'Delete', value: 'Delete' }
    ];

    TT.Autocomplete.open({
      css: { width: 80 },
      items: actions,
      target: this,
      noActive: true,
      onApply: function (action) {
        if (action === 'Download') {
          document.location = url;
        } else if (action === 'Delete') {
          // TODO: delete attachment
        }
      }
    });

    return false;
  };

  pub.removeTagFromStory = function () {
    var story = getStoryFromContext(this);
    var label = $.trim($(this).closest('.tag').text());
    TT.Model.Label.removeStory(label, story.id);
    TT.Model.Label.recalculateTotals(label);

    var labels = TT.Model.Story.removeTag(story, label).labels;
    TT.Model.Story.saveLabels(story, labels);

    return false;
  };

  pub.editStoryTags = function () {
    var story = getStoryFromContext(this);

    var labels = $.map(TT.Model.Label.get(), function (label) {
      return { name: label.name, value: label.name };
    });

    TT.Autocomplete.open({
      css: { width: 240 },
      items: TT.Utils.sortByProperty(labels, 'name'),
      target: $(this).closest('.labels'),
      noActive: true,
      showInput: true,
      onApply: function (label) {
        var labels = TT.Model.Story.addTag(story, label.toLowerCase()).labels;
        TT.Model.Story.saveLabels(story, labels);
      }
    });

    return false;
  };

  pub.editStoryTitle = function () {
    var story = getStoryFromContext(this);

    return addStoryEditor(this, story, 'name', {
      text: story.name,
      onSave: 'TT.UI.saveStoryTitle',
      onCancel: 'TT.UI.cancelEditTitle'
    });
  };

  pub.editStoryDescription = function () {
    var story = getStoryFromContext(this);

    return addStoryEditor(this, story, 'description', {
      text: story.description,
      onSave: 'TT.UI.saveStoryDescription',
      onCancel: 'TT.UI.cancelEditDescription'
    });
  };

  pub.addStoryNote = function () {
    var story = getStoryFromContext(this);

    return addStoryEditor(this, story, 'note', {
      onSave: 'TT.UI.saveStoryNote',
      onCancel: 'TT.UI.cancelStoryNote'
    });
  };

  function addStoryEditor(context, story, name, actions) {
    var html = TT.View.render('textarea', actions);

    var textarea = TT.View.attach(html, context, 'insertAfter').find('textarea');
    textarea.focus().autosize().bind('keyup blur', function () {
      var data = {};
      data[name] = textarea.val();
      data[name + 'Height'] = textarea.height();

      TT.Utils.updateStoryState(story.id, data);
    });

    $(context).hide();

    return false;
  }

  pub.saveStoryTitle = function () {
    var story = getStoryFromContext(this);
    var name = $(this).closest('.textarea').find('textarea').val();

    if (name) {
      TT.Model.Story.saveTitle(story, name);
      $(this).closest('.actions').html('<div class="saving">Saving...</div>');
    } else {
      TT.View.message('Title is required.', { type: 'error' });
    }

    return false;
  };

  pub.saveStoryDescription = function () {
    var story = getStoryFromContext(this);
    var description = $(this).closest('.textarea').find('textarea').val();

    TT.Model.Story.saveDescription(story, description);
    $(this).closest('.actions').html('<div class="saving">Saving...</div>');

    return false;
  };

  pub.saveStoryNote = function () {
    var story = getStoryFromContext(this);
    var comment = $(this).closest('.textarea').find('textarea').val();

    if (comment) {
      TT.Model.Story.saveComment(story, comment);
      $(this).closest('.actions').html('<div class="saving">Saving...</div>');
    } else {
      TT.View.message('Your note is empty.', { type: 'error' });
    }

    return false;
  };

  pub.cancelEditTitle = function () {
    return cancelStoryEdit(this, {
      selector: '.title',
      state: { name: null, nameHeight: null }
    });
  };

  pub.cancelEditDescription = function () {
    return cancelStoryEdit(this, {
      selector: '.description',
      state: { description: null, descriptionHeight: null }
    });
  };

  pub.cancelStoryNote = function () {
    return cancelStoryEdit(this, {
      selector: '.add-note',
      state: { note: null, noteHeight: null }
    });
  };

  function cancelStoryEdit(context, options) {
    var story = getStoryFromContext(context);
    TT.Utils.updateStoryState(story.id, options.state);

    $(context).closest('.story').find(options.selector).show();
    $(context).closest('.textarea').remove();

    return false;
  }

  pub.loadIcebox = function () {
    $(this).closest('.column-template').remove();

    var column = TT.Model.Column.get({ name: 'Icebox' });
    column.template = null;

    TT.Search.requestMatchingStories('state:unscheduled');

    return false;
  };

  pub.showEpicDetails = function (e) {
    if (!TT.Tooltip.isActive()) {
      var data = {
        name: $.trim($(this).siblings('.tag').text()),
        details: []
      };
      $(this).find('.epic').each(function () {
        if ($(this).data('stories')) {
          data.details[data.details.length] = {
            name: $(this).data('name'),
            stories: $(this).data('stories'),
            points: $(this).data('points')
          };
        }
      });
      TT.Tooltip.open({
        target: this,
        html: TT.View.render('epicDetails', data)
      });
    }

    return false;
  };

  pub.fireEventHandler = function (target, eventType, e) {
    var handler = target.data(eventType);
    if (handler) {
      handler = TT.Utils.strToFunction(handler);
      if (TT.Utils.isFunction(handler)) {
        return handler.call(target[0], e);
      }
    }
  };

  pub.initClickHandler = function () {
    $('body').click(function (e) {
      var target = $(e.target);
      // Handle links in textareas
      if (target.is('a') && target.attr('href') !== '#' &&
        !target.data('click-handler')) {
        if (target.attr('href').toLowerCase().indexOf('http') === 0) {
          target.attr('target', '_blank');
        }
        return;
      }

      target = target.closest('[data-click-handler]');
      return pub.fireEventHandler(target, 'click-handler', e);
    });
  };

  pub.initHoverHandler = function () {
    var timeoutID;
    $('body').mousemove(function (e) {
      clearTimeout(timeoutID);
      timeoutID = setTimeout(function () {
        var target = $(e.target).closest('[data-hover-handler]');
        pub.fireEventHandler(target, 'hover-handler', e);
      }, 50);
    });
  };

  pub.initSubmitHandler = function () {
    $(window).on('keyup', function (e) {
      var target = $(document.activeElement);
      if (target.is('input, textarea') && TT.Utils.keyPressed(e, 'ENTER')) {
        pub.fireEventHandler(target, 'submit-handler', e);
      }
    });
  };

  pub.init = function () {
    pub.initClickHandler();
    pub.initHoverHandler();
    pub.initSubmitHandler();
  };

  return pub;

}());
