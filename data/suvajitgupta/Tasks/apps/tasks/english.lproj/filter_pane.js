// ==========================================================================
// Tasks.filterPane
// ==========================================================================
/*globals Tasks CoreTasks SCUI sc_require */

/** @static
    
  @extends SC.SheetPane
  @author Suvajit Gupta
  
  Filter Panel
  
*/

Tasks.filterPane = SC.SheetPane.create({  
  
  layout: Tasks.isMobile? { top: 0, bottom: 0, left: 0, right: 0 } : { centerX: 0, height: Tasks.softwareMode? 465 : 360, width: 310 },
  classNames: ['filter-pane'],
  
  contentView: SC.View.design({
    
    childViews: 'quickfilterToolbar typeLabel typeCheckboxes priorityLabel priorityCheckboxes statusLabel statusCheckboxes validationLabel validationCheckboxes effortSpecifiedLabel effortSpecifiedSegments recentlyUpdatedLabel recentlyUpdatedSegments beingWatchedLabel beingWatchedSegments cancelButton applyButton'.w(),
    
    quickfilterToolbar: SC.View.design(SC.Border, {

      layout: { top: 4, left: 5, height: 70, right: 5 },
      borderStyle: SC.BORDER_BEZEL,
      classNames: ['quickfilter-toolbar'],
      childViews: 'allButton showstoppersButton urgentButton troubledButton unfinishedButton unvalidatedButton upcomingButton completedButton '.w(),
  
      allButton: SC.ButtonView.design({
        layout: { width: 90, height: 30, left: 5, top: 7 },
        titleMinWidth: 0,
        theme: 'capsule',
        classNames: ['all'],
        title: "_NoFilter".loc(),
        toolTip: "_NoFilterTooltip".loc(),
        action: 'setAttributeFilterNone'
      }),

      showstoppersButton: SC.ButtonView.design({
        layout: { width: 100, height: 30, centerX: 0, top: 7 },
        titleMinWidth: 0,
        theme: 'capsule',
        classNames: ['showstoppers'],
        isVisible: Tasks.softwareMode,
        title: "_Showstoppers".loc(),
        toolTip: "_ShowstoppersTooltip".loc(),
        action: 'setAttributeFilterShowstoppers'
      }),      

      urgentButton: SC.ButtonView.design({
        layout: { width: 100, height: 30, centerX: 0, top: 7 },
        titleMinWidth: 0,
        theme: 'capsule',
        classNames: ['urgent'],
        isVisible: !Tasks.softwareMode,
        title: "_Urgent".loc(),
        toolTip: "_UrgentTooltip".loc(),
        action: 'setAttributeFilterUrgent'
      }),      

      troubledButton: SC.ButtonView.design({
        layout: { width: 90, height: 30, right: 5, top: 7 },
        titleMinWidth: 0,
        theme: 'capsule',
        classNames: ['troubled'],
        title: "_Troubled".loc(),
        toolTip: "_TroubledTooltip".loc(),
        action: 'setAttributeFilterTroubled'
      }),
  
      unfinishedButton: SC.ButtonView.design({
        layout: { width: 90, height: 30, left: 5, top: 39 },
        titleMinWidth: 0,
        theme: 'capsule',
        classNames: ['unfinished'],
        title: "_Unfinished".loc(),
        toolTip: "_UnfinishedTooltip".loc(),
        action: 'setAttributeFilterUnfinished'
      }),
  
      unvalidatedButton: SC.ButtonView.design({
        layout: { width: 100, height: 30, centerX: 0, top: 39 },
        titleMinWidth: 0,
        theme: 'capsule',
        classNames: ['unvalidated'],
        isVisible: Tasks.softwareMode,
        title: "_Unvalidated".loc(),
        toolTip: "_UnvalidatedTooltip".loc(),
        action: 'setAttributeFilterUnvalidated'
      }),
  
      upcomingButton: SC.ButtonView.design({
        layout: { width: 100, height: 30, centerX: 0, top: 39 },
        titleMinWidth: 0,
        theme: 'capsule',
        classNames: ['upcoming'],
        isVisible: !Tasks.softwareMode,
        title: "_Upcoming".loc(),
        toolTip: "_UpcomingTooltip".loc(),
        action: 'setAttributeFilterUpcoming'
      }),
  
      completedButton: SC.ButtonView.design({
        layout: { width: 90, height: 30, right: 5, top: 39 },
        titleMinWidth: 0,
        theme: 'capsule',
        classNames: ['completed'],
        title: "_Completed".loc(),
        toolTip: "_CompletedTooltip".loc(),
        action: 'setAttributeFilterCompleted'
      })
                     
    }),
    
    typeLabel: SC.LabelView.design({
      layout: { top: 86, height: 24, left: 10, right: 10 },
      isVisible: Tasks.softwareMode,
      classNames: ['attribute-label'],
      value: "_Type".loc(),
      toolTip: "_TypeTooltip".loc()
    }),

    typeCheckboxes: SC.View.design({
      layout: { top: 104, height: 24, left: 10, right: 10 },
      classNames: ['item-group', 'checkbox-icon'],
      isVisible: Tasks.softwareMode,
      displayProperties: [ 'feature', 'bug', 'other' ],
      childViews: 'feature bug other'.w(),
      
      feature: SC.CheckboxView.design({
        layout: { left: 5, top: 4, width: 95 },
        icon: 'task-icon-feature',
        title: CoreTasks.TASK_TYPE_FEATURE.loc(),
        valueBinding: 'Tasks.filterSearchController.attributeFilterTypeFeature'
      }),
      
      bug: SC.CheckboxView.design({
        layout: { centerX: 0, top: 4, width: 65 },
        icon: 'task-icon-bug',
        title: CoreTasks.TASK_TYPE_BUG.loc(),
        valueBinding: 'Tasks.filterSearchController.attributeFilterTypeBug'
      }),
      
      other: SC.CheckboxView.design({
        layout: { right: 5, top: 4, width: 75 },
        icon: 'task-icon-other',
        title: CoreTasks.TASK_TYPE_OTHER.loc(),
        valueBinding: 'Tasks.filterSearchController.attributeFilterTypeOther'
      })

    }),

    priorityLabel: SC.LabelView.design({
      layout: { top: Tasks.softwareMode? 141 : 86, height: 24, left: 10, right: 10 },
      classNames: ['attribute-label'],
      value: "_Priority".loc(),
      toolTip: "_PriorityTooltip".loc()
    }),

    priorityCheckboxes: SC.View.design({
      layout: { top: Tasks.softwareMode? 160 : 104, height: 24, left: 10, right: 10 },
      classNames: ['item-group'],
      displayProperties: [ 'high', 'medium', 'low' ],
      childViews: 'high medium low'.w(),
      
      high: SC.CheckboxView.design({
        layout: { left: 5, top: 4, width: 50 },
        title: CoreTasks.TASK_PRIORITY_HIGH.loc(),
        valueBinding: 'Tasks.filterSearchController.attributeFilterPriorityHigh',
        classNames: [ 'task-priority-high' ]
      }),
              
      medium: SC.CheckboxView.design({
        layout: { centerX: 0, top: 4, width: 65 },
        title: CoreTasks.TASK_PRIORITY_MEDIUM.loc(),
        valueBinding: 'Tasks.filterSearchController.attributeFilterPriorityMedium',
        classNames: [ 'task-priority-medium' ]
      }),
      
      low: SC.CheckboxView.design({
        layout: { right: 5, top: 4, width: 45 },
        title: CoreTasks.TASK_PRIORITY_LOW.loc(),
        valueBinding: 'Tasks.filterSearchController.attributeFilterPriorityLow',
        classNames: [ 'task-priority-low' ]
      })
      
    }),

    statusLabel: SC.LabelView.design({
      layout: { top: Tasks.softwareMode? 197 : 147, height: 24, left: 10, right: 10 },
      classNames: ['attribute-label'],
      value: "_Status".loc(),
      toolTip: "_StatusTooltip".loc()
    }),

    statusCheckboxes: SC.View.design({
      layout: { top: Tasks.softwareMode? 214 : 163, height: 24, left: 10, right: 10 },
      classNames: ['item-group'],
      displayProperties: [ 'planned', 'active', 'done', 'risky' ],
      childViews: 'planned active done risky'.w(),
      
      planned: SC.CheckboxView.design({
        layout: { left: 5, top: 4, width: 65 },
        title: CoreTasks.STATUS_PLANNED.loc(),
        valueBinding: 'Tasks.filterSearchController.attributeFilterStatusPlanned',
        classNames: [ 'status-planned' ]
      }),
      
      active: SC.CheckboxView.design({
        layout: { centerX: -30, top: 4, width: 55 },
        title: CoreTasks.STATUS_ACTIVE.loc(),
        valueBinding: 'Tasks.filterSearchController.attributeFilterStatusActive',
        classNames: [ 'status-active' ]
      }),
      
      done: SC.CheckboxView.design({
        layout: { centerX: 50, top: 4, width: 50 },
        title: CoreTasks.STATUS_DONE.loc(),
        valueBinding: 'Tasks.filterSearchController.attributeFilterStatusDone',
        classNames: [ 'status-done' ]
      }),
      
      risky: SC.CheckboxView.design({
        layout: { right: 5, top: 4, width: 50 },
        title: CoreTasks.STATUS_RISKY.loc(),
        valueBinding: 'Tasks.filterSearchController.attributeFilterStatusRisky',
        classNames: [ 'status-risky' ]
      })

    }),

    validationLabel: SC.LabelView.design({
      layout: { top: 251, height: 24, left: 10, right: 10 },
      classNames: ['attribute-label'],
      isVisible: Tasks.softwareMode,
      value: "_Validation".loc(),
      toolTip: "_ValidationTooltip".loc()
    }),

    validationCheckboxes: SC.View.design({
      layout: { top: 269, height: 24, left: 10, right: 10 },
      classNames: ['item-group'],
      isVisible: Tasks.softwareMode,
      displayProperties: [ 'untested', 'passed', 'failed' ],
      childViews: 'untested passed failed'.w(),
      
      untested: SC.CheckboxView.design({
        layout: { left: 5, top: 3, width: 75 },
        escapeHTML: NO,
        title: '<span class=task-validation-untested>' + CoreTasks.TASK_VALIDATION_UNTESTED.loc() + '</span>',
        isEnabledBinding: SC.Binding.oneWay('Tasks.filterSearchController.attributeFilterStatusDone'),
        valueBinding: 'Tasks.filterSearchController.attributeFilterValidationUntested'
      }),
      
      passed: SC.CheckboxView.design({
        layout: { centerX: 0, top: 3, width: 65 },
        escapeHTML: NO,
        title: '<span class=task-validation-passed>' + CoreTasks.TASK_VALIDATION_PASSED.loc() + '</span>',
        isEnabledBinding: SC.Binding.oneWay('Tasks.filterSearchController.attributeFilterStatusDone'),
        valueBinding: 'Tasks.filterSearchController.attributeFilterValidationPassed'
      }),
      
      failed: SC.CheckboxView.design({
        layout: { right: 5, top: 3, width: 60 },
        escapeHTML: NO,
        title: '<span class=task-validation-failed>' + CoreTasks.TASK_VALIDATION_FAILED.loc() + '</span>',
        isEnabledBinding: SC.Binding.oneWay('Tasks.filterSearchController.attributeFilterStatusDone'),
        valueBinding: 'Tasks.filterSearchController.attributeFilterValidationFailed'
      })

    }),

    effortSpecifiedLabel: SC.LabelView.design({
      layout: { bottom: 120, height: 22, left: 0, width: 120 },
      textAlign: SC.ALIGN_RIGHT,
      value: "_EffortSpecified:".loc()
    }),

    effortSpecifiedSegments: SC.SegmentedView.design({
      layout: { bottom: 120, height: 24, left: 125, right: 10 },
      layoutDirection: SC.LAYOUT_HORIZONTAL,
      items: [
        { title: "_DontCare".loc(), value: Tasks.FILTER_DONT_CARE },
        { title: "_Yes".loc(), value: Tasks.FILTER_YES },
        { title: "_No".loc(), value: Tasks.FILTER_NO }
      ],
      itemTitleKey: 'title',
      itemValueKey: 'value',
      valueBinding: 'Tasks.filterSearchController.effortSpecified'
    }),

    recentlyUpdatedLabel: SC.LabelView.design({
      layout: { bottom: 85, height: 22, left: 0, width: 120 },
      textAlign: SC.ALIGN_RIGHT,
      value: "_RecentlyUpdated:".loc()
    }),

    recentlyUpdatedSegments: SC.SegmentedView.design(SCUI.ToolTip, {
      layout: { bottom: 85, height: 24, left: 125, right: 10 },
      layoutDirection: SC.LAYOUT_HORIZONTAL,
      items: [
        { title: "_DontCare".loc(), value: Tasks.FILTER_DONT_CARE },
        { title: "_Yes".loc(), value: Tasks.FILTER_YES },
        { title: "_No".loc(), value: Tasks.FILTER_NO }
      ],
      itemTitleKey: 'title',
      itemValueKey: 'value',
      valueBinding: 'Tasks.filterSearchController.recentlyUpdated'
    }),

    beingWatchedLabel: SC.LabelView.design({
      layout: { bottom: 50, height: 22, left: 0, width: 65 },
      textAlign: SC.ALIGN_RIGHT,
      value: "_Watched:".loc()
    }),

    beingWatchedSegments: SC.SegmentedView.design({
      layout: { bottom: 50, height: 24, left: 65, right: 10 },
      layoutDirection: SC.LAYOUT_HORIZONTAL,
      items: [
        { title: "_DontCare".loc(), value: Tasks.FILTER_DONT_CARE },
        { title: "_ByMe".loc(), value: Tasks.FILTER_MY_WATCHES },
        { title: "_ByAnyone".loc(), value: Tasks.FILTER_ANY_WATCHES }
      ],
      itemTitleKey: 'title',
      itemValueKey: 'value',
      valueBinding: 'Tasks.filterSearchController.watched'
    }),

    cancelButton: SC.ButtonView.design({
      layout: { width: 80, height: 30, right: 96, bottom: 8 },
      titleMinWidth: 0,
      title: "_Cancel".loc(),
      action: 'cancel'
    }),
    
    applyButton: SC.ButtonView.design({
      layout: { width: 80, height: 30, right: 10, bottom: 8 },
      titleMinWidth: 0,
      keyEquivalent: 'return',
      isDefault: YES,
      title: "_Apply".loc(),
      action: 'apply'
    })
        
  })
  
});