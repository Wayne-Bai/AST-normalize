'use strict';

var mapping = {
};

//The algorithm has methods that recalculate the scores for tasks in the Tasks service
//higher score is better
angular.module('global.tasks',[])
  .factory('Algorithm', function() {
    var algo = {};

    algo.nextTask = function(tasks) {
      return algo.recalculateScores(tasks,true);
    };

    algo.recalculateScores = function(tasks, returnMax) {
      var list = tasks.list;
      var prev = tasks.previousTaskOffset;
      var maxScore = {index:null, score:0};
      var now = moment();
      for (var i = 0; i < list.length; i++) {
        var task = list[i];
        if (task.createdAtUnixOffset === prev) {
          continue;
        }

        var timeToDeadline;
        //no deadline
        if (task.deadline === null) {
          timeToDeadline = moment.duration({months:1}).asMinutes();
        }
        else if (task.deadline) {
          timeToDeadline = moment(task.deadline).diff(now, 'minutes');
        }
        //past deadline or elapsed time is greater than estimated time left
        if (timeToDeadline < 0 || (task.durationTotal>0 && task.durationElapsed > task.durationTotal)) {
          continue;
        }
        // ** DEBUG **
        console.log('***Score:***');
        console.log('task name:'+task.name);
        console.log('timeToDeadline:'+timeToDeadline+' minutes');
        console.log('task.priority:'+task.priority);
        console.log('(task.priority * 0.4) + 5 / Math.sqrt(timeToDeadline)');
        console.log('('+task.priority+' * 0.4) + 5 / Math.sqrt('+timeToDeadline+')');
        console.log('('+task.priority * 0.3+') + '+ 50 / Math.sqrt(timeToDeadline));
        var score = (task.priority * 0.3) + 50 / Math.sqrt(timeToDeadline);
        console.log(score);
        task.calcPriority = score;

        if (score > maxScore.score) {
          maxScore.score = score;
          maxScore.index = i;
        }
      }
      console.log(list[maxScore.index]);
      if (returnMax) {
        return list[maxScore.index];
      }
    };

    return algo;
  });