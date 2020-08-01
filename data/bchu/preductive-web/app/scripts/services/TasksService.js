'use strict';

var Task = function(params) {
  params = params || {};
  this.name = params.name || '';
  this.details = params.details || '';
  this.deadline = params.deadline || null; //moment object, null for no deadline
  this.durationTotal = params.durationTotal || -2; //milliseconds, -1 for long time, -2 for don't know
  this.durationElapsed = params.durationElapsed || 0; //milliseconds //moment.duration(0); //moment duration object. We use this instead of durationLeft because sometimes there is no total duration.
  this.priority = params.priority || 3;
  this.chunk =  params.chunk || {hours:1}; //object representing the moment duration
  this.createdAtUnixOffset = params.createdAtUnixOffset || moment().valueOf(); //serves as a unique identifier
  this.localTimezoneOffsetMinutes = params.localTimezoneOffsetMinutes || moment().zone();
  this.calcPriority = 0;
};
Task.createProto = function() {
  return Object.create(Task.prototype);
};
Task.prototype.serialize = function() {
  var skip = {animateTrigger:true};
  return JSON.stringify(this, function(key,value) {
    if (skip[key]) {
      return;
    }
    switch(key) {
    case 'deadline':
      if (value && value !== -1) {
        return value.valueOf();
      }
      break;
    // case 'durationTotal':
    //   if (value !== -1 && value !== -2) {
    //     return value.asMilliseconds();
    //   }
    //   break;
    // case 'durationElapsed':
    //   if (value !== -1 && value !== -2) {
    //     return value.asMilliseconds();
    //   }
    //   break;
    }
    return value;
  });
};
Task.deserialize = function(model) {
  if (typeof model === 'string') {
    model = JSON.parse(model);
  }
  if (model.deadline){
    model.deadline = moment(model.deadline);
  }
  // if (model.durationTotal > -1) {
    // model.durationTotal = moment.duration(model.durationTotal);
  // }
  // model.durationElapsed = moment.duration(model.durationElapsed);
  var task = new Task();
  _.assign(task,model);
  return task;
};

var buildTasksFunctions = function(Algorithm) {
  var tasks = {};

  tasks.returnTask = function(params) {
    return new Task(params);
  };

  tasks.addTask = function(params) {
    var task = new Task(params);
    if (!tasks.list.length) {
      tasks.activeTask = task;
    }
    tasks.list.push(task);
    Algorithm.recalculateScores(tasks);
    localStorage.setItem('tasks',tasks.serialize());
    console.log(tasks.list); //** DEBUG
    return task;
  };

  tasks.done = function() {
    var active = tasks.activeTask;
    active.durationElapsed += moment.duration(active.chunk).asMilliseconds();
    active.animateTrigger = !active.animateTrigger;
    tasks.previousTaskOffset = active.createdAtUnixOffset;
    if (tasks.list.length>1) {
      tasks.activeTask = Algorithm.nextTask(tasks) || tasks.finishedTasksPlaceholder;
    }
    localStorage.setItem('tasks',tasks.serialize());
  };

  tasks.skip = function() {
    var active = tasks.activeTask;
    tasks.previousTaskOffset = active.createdAtUnixOffset;
    active.animateTrigger = !active.animateTrigger;
    if (tasks.list.length>1) {
      tasks.activeTask = Algorithm.nextTask(tasks);
    }
    localStorage.setItem('tasks',tasks.serialize());
  };

  tasks.keepWorking = function() {
  };

  tasks.serialize = function() {
    var skip = {
      'finishedTasksPlaceholder':true
    };
    return JSON.stringify(tasks, function(key,value) {
      if (skip[key]) {
        return;
      }
      if (!isNaN(parseInt(key,10))) {
        return value.serialize();
      }
      return value;
    });
  };
  tasks.deserialize = function(string) {
    var obj = JSON.parse(string);
    var list = tasks.list;
    _.each(obj.list, function(task,index) {
      list[index] = Task.deserialize(task);
    });
    tasks.activeTask = _.find(list, {createdAtUnixOffset:obj.activeTask.createdAtUnixOffset}) || obj.activeTask;
    tasks.previousTaskOffset = obj.previousTaskOffset;
  };
  return tasks;
};


angular.module('global.tasks')
  .factory('Tasks', function(Algorithm) {
    var tasks = buildTasksFunctions(Algorithm);
    //placeholder task
    tasks.activeTask  = tasks.returnTask({
      name: 'Start adding tasks!',
      chunk: 'as long as it takes!',
      deadline: 'Now!',
      durationTotal: 'Forever. Hah!',
      priority: 'Max',
      details: 'Really!'
    });
    tasks.finishedTasksPlaceholder = {
      name: "It looks like you've finished every task! Add more tasks or edit the tasks you still need to finish",
      chunk: 'as long as it takes!',
      deadline: 'Now!',
      durationTotal: 'Forever. Hah!',
      priority: 'Max'
    };
    tasks.list = [];
    tasks.previousTaskOffset = null;

    var local = localStorage.getItem('tasks');
    if (local) {
      tasks.deserialize(local);
    }
    console.log(tasks);
    return tasks;
  });
