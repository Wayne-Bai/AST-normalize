// ==========================================================================
// Project: Tasks 
// ==========================================================================
/*globals CoreTasks Tasks sc_require sc_static */
sc_require('mixins/localized_label');
sc_require('views/group_item');

/** 

  Used as groupExampleView for assignee information display in the main workspace.
  
  @extends SC.ListItemView
  @author Suvajit Gupta
*/

Tasks.AssigneeItemView = Tasks.GroupItemView.extend(Tasks.LocalizedLabel,
/** @scope Tasks.AssigneeItemView.prototype */ {
  
  mouseDown: function(event) {
    if(Tasks.assignmentsController.get('displayMode') === Tasks.DISPLAY_MODE_TEAM) {
      Tasks.assignmentsController.set('displayMode', Tasks.DISPLAY_MODE_TASKS);
      var loginNameMatches = this.getPath('content.displayName').match(/\((.+)\)/);
      var assignee = loginNameMatches? loginNameMatches[1] : 'none';
      Tasks.filterSearchController.setAssigneeTasksSearch(assignee);
    }
    else {
      sc_super();
      // HACK: added following line to fix refresh glitch after closing an assignee item for the first time after the app starts in Firefox
      Tasks.tasksController.notifyPropertyChange('arrangedObjects');
    }
  },
  
  render: function(context, firstTime) {
    
    var content = this.get('content');
    if(content) {
      // console.log('DEBUG: Assignee render(' + firstTime + '): ' + content.get('displayName'));
      
      if(!this.get('contentIndex')) context.addClass('first-assignee-item');
      context.addClass('assignee-item');
      
      var assignee = content.getPath('assignee');
      var icon = assignee? assignee.get('icon') : sc_static('images/unassigned.jpg');
      context = context.begin('img').addClass('gravatar').attr('src', icon).end();
      
      var tasksCount = content.get('tasksCount');
      var assigneeTooltip;
      
      var loading = content.get('loading');
      if(loading) {
        if(loading === CoreTasks.USER_NOT_LOADED) {
          assigneeTooltip = "_AssigneeNotLoaded".loc();
          context.addClass('assignee-not-loaded');
        }
        else if(loading === CoreTasks.USER_UNDER_LOADED) {
          assigneeTooltip = "_AssigneeUnderLoaded".loc();
          context.addClass('assignee-under-loaded');
        }
        else if(loading === CoreTasks.USER_PROPERLY_LOADED) {
          assigneeTooltip = "_AssigneeProperlyLoaded".loc();
          context.addClass('assignee-properly-loaded');
        }
        else if(loading === CoreTasks.USER_OVER_LOADED) {
          assigneeTooltip = "_AssigneeOverloaded".loc();
          context.addClass('assignee-overloaded');
        }
      }
      assigneeTooltip += "_with".loc() + tasksCount + "_tasks".loc();
      
      var leftEffort = content.get('displayEffort');
      if(leftEffort && leftEffort.match(/\?$/)) {
        assigneeTooltip += "_IncompleteEffortWarning".loc();
        context.addClass('incomplete-total-effort-warning');
      }
      
      if (Tasks.assignmentsController.get('displayMode') === Tasks.DISPLAY_MODE_TEAM) {
        var riskyTasksCount = content.get('riskyTasksCount');
        var failedTasksCount = content.get('failedTasksCount');
        if((riskyTasksCount + failedTasksCount) > 0) {
          var riskyTooltip = "_Has".loc() + riskyTasksCount + ' ' + "_Risky".loc() +
                             ' & ' + failedTasksCount + ' ' + "_Failed".loc() + "_tasks".loc();
          context.begin('div').addClass('assignee-red-flag').begin('img').attr({
            src: SC.BLANK_IMAGE_URL,
            title: riskyTooltip,
            alt: riskyTooltip
          }).addClass('red-flag-icon').end().end();
        }
      }
            
      context.attr('title', assigneeTooltip);
      context.attr('alt', assigneeTooltip);
      
    }
    sc_super();
  },
  
  renderCount: function(context, count) {
    
    var content = this.get('content');
    var finishedTasksCount = content.get('finishedTasksCount');
    var leftTasksCount = content.get('leftTasksCount');
    if(finishedTasksCount > 0) {
      var percentComplete = Math.round(100*finishedTasksCount/(finishedTasksCount+leftTasksCount));
      context.begin('div').addClass('progress-percent').text(percentComplete + '%').end()
             .begin('div').addClass('progress-bar').begin('div').addClass('progress-bar-inner')
             .addStyle({'width': percentComplete + 'px'}).end().end();
      var finishedEffort = content.get('finishedEffort');
      context.push('<span class="count finished"><span class="inner">')
        .push(finishedEffort.toString()).push('</span></span>') ;
    }
    
    sc_super();
    
  }
  
});