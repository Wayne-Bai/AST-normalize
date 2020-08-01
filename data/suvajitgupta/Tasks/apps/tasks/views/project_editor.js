// ==========================================================================
// Project: Tasks
// ==========================================================================
/*globals Tasks CoreTasks */

/** 

  Project details editor.
  
  @extends SC.View
  @author Suvajit Gupta
*/
Tasks.projectEditorHelper = SC.Object.create({
  statuses: function() {
     var ret = [];
     ret.push({ name: '<span class=status-planned>' + CoreTasks.STATUS_PLANNED.loc() + '</span>', value: CoreTasks.STATUS_PLANNED });
     ret.push({ name: '<span class=status-active>' + CoreTasks.STATUS_ACTIVE.loc() + '</span>', value: CoreTasks.STATUS_ACTIVE });
     ret.push({ name: '<span class=status-done>' + CoreTasks.STATUS_DONE.loc() + '</span>', value: CoreTasks.STATUS_DONE });
     return ret;
  }
});
  
Tasks.projectEditorPage = SC.Page.create({
  
  // CHANGED: [SC] remove hack below to create/destroy project editor panel to make text field views get updated properly after remove() is called
  popup: function(project) {
    this.panel = this.panelView.create();
    this.panel.popup(project);
  },
  
  panel: null,
  panelView: SCUI.ModalPane.extend({

    classNames: ['project-editor' + (Tasks.isMobile? ' mobile' : '')],
    
    project: null,
    titleBarHeight: 40,
    minWidth: Tasks.isMobile? 0 : 700,
    minHeight: 250,

    layout: Tasks.isMobile? { top: 0, left: 0, right: 0, bottom: 0 } : { centerX:0, centerY: 0, width: 700, height: 315 },

    _preEditing: function() {
      this.set('_modifying', true); // to prevent timeLeftDidChange and stoppedAtDidChange below from doing anything
      var project = this.get('project');
      // console.log('DEBUG: preEditing project: ' + project.get('name'));
      this.set('title', "_Project".loc() + ' ' + project.get('displayId'));
      var editor = this.get('contentView');
      editor.setPath('nameField.value', project.get('name'));
      if(CoreTasks.getPath('permissions.canUpdateProject')) {
        this.invokeLater(function() { Tasks.getPath('projectEditorPage.panel.contentView.nameField').becomeFirstResponder(); }, 400);
      }
      editor.setPath('statusField.value', project.get('developmentStatusValue'));
      editor.setPath('activatedAtField.date', project.get('activatedAtValue'));
      editor.setPath('timeLeftField.value', project.get('timeLeftValue'));
      editor.setPath('descriptionField.value', project.get('description'));
      if(!Tasks.isMobile) {
        editor.setPath('createdAtLabel.value', project.get('displayCreatedAt'));
        editor.setPath('updatedAtLabel.value', project.get('displayUpdatedAt'));
      }
      this.set('_modifying', false); // timeLeftDidChange and stoppedAtDidChange are active
      this._timeLeftOrActivatedAtDidChange(); // to set stoppedAt field
    },

    _postEditing: function() {
      var project = this.get('project');
      // console.log('DEBUG: postEditing project: ' + project.get('name'));
      var editor = this.get('contentView');
      var name = editor.getPath('nameField.value');
      if(/^\s*$/.test(name) || name === CoreTasks.NEW_PROJECT_NAME.loc()) {
        project.destroy(); // blow away unmodified new project
        Tasks.projectsController.selectObject(CoreTasks.get('allTasksProject'));
      }
      else {
        project.setIfChanged('developmentStatusValue', editor.getPath('statusField.value'));
        project.setIfChanged('activatedAtValue', editor.getPath('activatedAtField.date'));
        var oldTimeLeft = project.get('timeLeftValue');
        project.setIfChanged('timeLeftValue', editor.getPath('timeLeftField.value'));
        var oldActivatedAt = project.get('activatedAtValue');
        project.setIfChanged('displayName', name);
        var description = CoreTasks.stripDescriptionPrefixes(editor.getPath('descriptionField.value'));
        project.setIfChanged('description',  description);
        // If timeLeft or activatedAt has changed, recalculate load balancing
        if(oldTimeLeft !== project.get('timeLeftValue') || oldActivatedAt !== project.get('activatedAtValue')) {
          // console.log('DEBUG: need to redraw assignments since project timeLeft or activatedAt changed');
          Tasks.assignmentsController.computeTasks();
        }
      }
    },
    
    _timeLeftOrActivatedAtDidChange: function() {
      if(this.get('_modifying')) return;
      var timeLeft = this.getPath('contentView.timeLeftField.value');
      // console.log('DEBUG: _timeLeftOrActivatedAtDidChange to ' + (timeLeft? timeLeft : 'None'));
      var endDate = null;
      if(!SC.empty(timeLeft) && timeLeft.match(/\d/)) {
        timeLeft = Math.ceil(CoreTasks.convertTimeToDays(timeLeft));
        var activatedAt = this.getPath('contentView.activatedAtField.date');
        // console.log('DEBUG: _timeLeftOrActivatedAtDidChange activatedAt ' + (activatedAt? activatedAt.toFormattedString(CoreTasks.DATE_FORMAT) : 'None'));
        if(activatedAt) {
          endDate = CoreTasks.computeEndDate(activatedAt, timeLeft);
          // console.log('DEBUG: _timeLeftOrActivatedAtDidChange endDate ' + endDate.toFormattedString(CoreTasks.DATE_FORMAT));
        }
      }
      this.set('_modifying', true); // prevent _stoppedAtDidChange from doing anything
      this.setPath('contentView.stoppedAtField.date', endDate);
      this.set('_modifying', false); // _stoppedAtDidChange is active
    }.observes('.contentView.timeLeftField*value', '.contentView.activatedAtField*date'),

    _stoppedAtDidChange: function() {
      if(this.get('_modifying')) return;
      var stoppedAt = this.getPath('contentView.stoppedAtField.date');
      // console.log('DEBUG: _stoppedAtDidChange to ' + (stoppedAt? stoppedAt.toFormattedString(CoreTasks.DATE_FORMAT) : 'None'));
      if(stoppedAt) {
        var activatedAt = this.getPath('contentView.activatedAtField.date');
        // console.log('DEBUG: _stoppedAtDidChange activatedAt ' + (activatedAt? activatedAt.toFormattedString(CoreTasks.DATE_FORMAT) : 'None'));
        if(activatedAt) {
          var timeLeft = '' + CoreTasks.computeWeekdaysDelta(activatedAt, stoppedAt);
          // console.log('DEBUG: _stoppedAtDidChange timeLeft=' + timeLeft);
          this.set('_modifying', true); // prevent timeLeftDidChange from doing anything
          this.setPath('contentView.timeLeftField.value', timeLeft);
          this.set('_modifying', false); // timeLeftDidChange is active
        }
      }
    }.observes('.contentView.stoppedAtField*date'),

    popup: function(project) {
      Tasks.statechart.sendEvent('showProjectEditor');
      this.set('project', project);
      this._preEditing();
      this.append();
    },

    remove: function() {
      this._postEditing();
      if(Tasks.get('autoSave') && !CoreTasks.get('isSaving')) Tasks.saveChanges();
      this.invokeLater(function() { Tasks.getPath('mainPage.projectsListView').becomeFirstResponder(); }, 400);
      sc_super();
      this.destroy();
    },

    contentView: SC.View.design({
      childViews: ((Tasks.isMobile? '' : 'timeLeftHelpLabel createdAtLabel updatedAtLabel ') + 'nameLabel nameField statusLabel statusField activatedAtLabel activatedAtField timeLeftLabel timeLeftField stoppedAtLabel stoppedAtField descriptionLabel descriptionField closeButton').w(),

      nameLabel: SC.LabelView.design({
        layout: { top: 7, left: 10, height: 24, width: Tasks.isMobile? 50 : 65 },
        textAlign: SC.ALIGN_RIGHT,
        value: "_Name".loc()
      }),
      nameField: SC.TextFieldView.design({
        layout: Tasks.isMobile? { top: 5, left: 65, right: 10, height: 24 } : { top: 5, left: 80, right: 180, height: 24 },
        isEnabledBinding: 'CoreTasks.permissions.canUpdateProject'
      }),

      statusLabel: SC.LabelView.design({
        layout: Tasks.isMobile? { top: 40, left: 10, height: 24, width: 50 } : { top: 7, right: 113, height: 24, width: 50 },
        textAlign: SC.ALIGN_RIGHT,
        value: "_Status".loc()
      }),
      statusField: SC.SelectButtonView.design({
        layout: Tasks.isMobile? { top: 38, left: 65, height: 24, width: 125 } : { top: 5, right: 10, height: 24, width: 125 },
        classNames: ['square'],
        localize: YES,
        isEnabledBinding: 'CoreTasks.permissions.canUpdateProject',
        objects: Tasks.projectEditorHelper.statuses(),
        nameKey: 'name',
        valueKey: 'value',
        toolTip: "_StatusTooltip".loc()
      }),

      activatedAtLabel: SC.LabelView.design({
        layout: Tasks.isMobile? { top: 70, left: 10, height: 24, width: 50 } : { top: 40, left: 10, height: 24, width: 65 },
        textAlign: SC.ALIGN_RIGHT,
        value: "_Activated:".loc()
      }),
      // FIXME: [EG] disable SCUI.DatePickerView text box to prevent data entry
      // FIXME: [EG] add touch events to SCUI.CalendarView days and switch to previous/next SimpleButtons to make this control work on iPad/iPhone/iPod
      activatedAtField: SCUI.DatePickerView.design(SCUI.ToolTip, {
        layout: Tasks.isMobile? { top: 67, left: 65, height: 24, width: 100 } : { top: 37, left: 80, height: 24, width: 100 },
        dateFormat: CoreTasks.DATE_FORMAT,
        hint: "_ChooseDate".loc(),
        toolTip: "_ActivatedAtTooltip".loc(),
        isEnabledBinding: 'CoreTasks.permissions.canUpdateProject'
      }),

      timeLeftLabel: SC.LabelView.design({
        layout: Tasks.isMobile? { top: 70, right: 75, height: 24, width: 65 } : { top: 40, right: 416, height: 24, width: 65 },
        textAlign: SC.ALIGN_RIGHT,
        value: "_TimeLeft:".loc()
      }),
      timeLeftField: SC.TextFieldView.design({
        layout: Tasks.isMobile? { top: 67, right: 10, width: 60, height: 24 } : { top: 37, right: 350, width: 60, height: 24 },
        isEnabledBinding: 'CoreTasks.permissions.canUpdateProject'
      }),
      timeLeftHelpLabel: Tasks.isMobile? null : SC.LabelView.design({
        layout: { top: 38, right: 183, height: 30, width: 160 },
        escapeHTML: NO,
        classNames: [ 'onscreen-help'],
        value: "_TimeLeftOnscreenHelp".loc()
      }),

      stoppedAtLabel: SC.LabelView.design({
        layout: { top: Tasks.isMobile? 100 : 40, right: 113, height: 24, width: 80 },
        textAlign: SC.ALIGN_RIGHT,
        value: "_Stopped:".loc()
      }),
      stoppedAtField: SCUI.DatePickerView.design(SCUI.ToolTip, {
        layout: { top: Tasks.isMobile? 97 : 37, right: 10, height: 24, width: 100 },
        dateFormat: CoreTasks.DATE_FORMAT,
        hint: "_ChooseDate".loc(),
        toolTip: "_StoppedTooltip".loc(),
        isEnabledBinding: 'CoreTasks.permissions.canUpdateProject'
      }),

      descriptionLabel: SC.LabelView.design({
        layout: { top: Tasks.isMobile? 115 : 65, left: 10, height: 17, width: 100 },
        icon: 'description-icon',
        value: "_Description:".loc()
      }),
      descriptionField: SC.TextFieldView.design({
        layout: Tasks.isMobile? { top: 135, left: 10, right: 10, bottom: 45 } : { top: 85, left: 10, right: 10, bottom: 65 },
        hint: "_DescriptionHint".loc(),
        maxLength: 500000,
        isTextArea: YES,
        isEnabledBinding: 'CoreTasks.permissions.canUpdateProject'
      }),
      
      createdAtLabel: Tasks.isMobile? null : SC.LabelView.design({
        layout: { left: 10, bottom: 45, height: 17, width: 250 },
        classNames: [ 'date-time'],
        textAlign: SC.ALIGN_LEFT
      }),
      updatedAtLabel: Tasks.isMobile? null : SC.LabelView.design({
        layout: { right: 10, bottom: 45, height: 17, width: 250 },
        classNames: [ 'date-time'],
        textAlign: SC.ALIGN_RIGHT
      }),

      closeButton: SC.ButtonView.design({
        layout: { bottom: 10, right: 20, width: 80, height: 24 },
        isDefault: YES,
        title: "_Close".loc(),
        action: 'close'
      })

    })

  })
  
});
