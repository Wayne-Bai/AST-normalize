angular.module('main').factory('timelineFactory', [
  '$rootScope',
  'logClient',
  'programStateFactory',
  'settingsService', function(
  $rootScope,
  logClient,
  programStateFactory,
  settingsService) {

  'use strict'

  return function() {

    /////////////////
    // Initialize. //
    /////////////////
  
    var timeline = $rootScope.$new()  
      , handlers = {}
      , playing = true
      , position = -1
      , settings = settingsService.load({
        timeline: {
          maxHistoryLength: 1000,
          logLostMessages: true
        }
      })
  
    timeline.history = []
    var programState = timeline.programState = programStateFactory.create()
    
    ///////////////////////
    // Player interface. //
    ///////////////////////
    
    timeline.setPosition = function(newVal) {
  
      movePosition(newVal, position)
  
      if(newVal !== getEndPosition())
        timeline.pause()
        
      position = newVal
    }
    
    timeline.getPosition = function() {
      return position
    }
    
    function getEndPosition() {
      return timeline.history.length - 1
    }
  
    function movePositionForward(newVal, oldVal) {
      for(var i = oldVal + 1; i <= newVal && i < timeline.history.length; i++)
        programState.forward(timeline.history[i])
    }
    
    function movePositionBackward(newVal, oldVal) {
  
      for(var i = oldVal; i > newVal && i >= 0; i--)
        programState.reverse(timeline.history[i])
    }
    
    function movePosition(newVal, oldVal) {
      movePositionForward(newVal, oldVal)
      movePositionBackward(newVal, oldVal)
    }
    
    timeline.isPlaying = function() {
      return playing
    }
  
    timeline.play = function() {
      timeline.setPosition(getEndPosition())
      playing = true
    }
  
    timeline.pause = function() {
      playing = false
    }
    
    timeline.step = function(stepSize) {
      if(!timeline.history.length) return
      timeline.pause()
      var candidate = position + stepSize
      if(candidate < 0 || candidate >= timeline.history.length) return
      timeline.setPosition(candidate)
    }
    
    timeline.stepForward = function() { 
      timeline.step(1) 
    } 
    
    timeline.stepBackward = function() { 
      timeline.step(-1) 
    }
    
    timeline.fastForward = function() {
      timeline.step(timeline.history.length - position - 1)
    }
  
    timeline.fastBackward = function() {
      timeline.step(-position)
    }
    
    timeline.clear = function() {
      timeline.history.length = 0
      position = -1
      programState.clearLogs()
    }
    
    /////////////////////
    // Route messages. //
    /////////////////////
  
    var lostMessageCounts = {}
  
    logClient.$on('main.logClient.logs', function(evt, records) {
  
      var missingScripts = {} // Scripts whose contents haven't been received.
        , recordCount = 0
  
      records.forEach(function(record) {
        handlers[record.type](record, missingScripts)
        recordCount++
      })
      
      // If we are receiving logs for scripts we haven't received yet,
      // let's request them now.  Let's run the request here to coalesce the 
      // messages and cause less traffic between the timeline and logClient.
      logClient.requestScripts(Object.keys(missingScripts))
      
      if(recordCount) timeline.$broadcast('main.timeline', recordCount)
    })
    
    ///////////////////////////
    // Handle announcements. //
    ///////////////////////////
    
    handlers.announcement = function(record) {
  
      // Find the last place in the timeline where the script appeared.
      var lastIndex = _(timeline.history).
        pluck('script').
        lastIndexOf(record.script)
  
      if(lastIndex >= 0) {
        
        var lastValid = lastIndex + 1
        
        // Move to after this location in history.
        if(!playing && position < lastValid) {
          var newPosition = Math.min(lastValid, timeline.history.length - 1)
          timeline.setPosition(newPosition)
        }
    
        // Remove references to this script from history.
        timeline.history.splice(0, lastValid)
        
        // Adjust our position accordingly.
        position -= lastValid
      }
        
      programState.announce(record)
    }
    
    //////////////////
    // Handle logs. //
    //////////////////
    
    handlers.log = function(record, missingScripts) {
  
      // If we don't have the script associated with the log,
      // we can't really do anything.  We just note that the
      // script is missing and return.
      if(!programState.scripts[record.script]) {
        missingScripts[record.script] = null
        return
      }
      
      // We need to drop messages if we're paused and if adding the
      // message would exceed the maximum history capacity.
      // Otherwise, information that's important to the user could
      // be pushed out of the timeline.
      if(!playing &&
        timeline.history.length >= settings.timeline.maxHistoryLength - 1) {
        lostMessageCounts[record.script] = lostMessageCounts[record.script] || 0
        lostMessageCounts[record.script]++
        return
      }
  
      // Track message loss.
      var lostMessages = 0
      
      Object.
        keys(lostMessageCounts).
        forEach(function(x) { lostMessages += lostMessageCounts[x]})
        
      if(lostMessages) {
        if(settings.timeline.logLostMessages)
          console.warn(lostMessages, 'messages dropped', lostMessageCounts)
        record.lostMessageCounts = lostMessageCounts
        lostMessageCounts = {}
      }
      
      // Add the record to the history.
      timeline.history.push(record)
  
      if(playing) {
  
        timeline.setPosition(getEndPosition())
  
        // Max sure history doesn't overflow its capacity.
        if(timeline.history.length >= settings.timeline.maxHistoryLength) {
          timeline.history.shift()
          position--
        }
      }
    }
    
    return timeline

  }

}])