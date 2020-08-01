/**
 * @subject Intervals
 * @author ttakamoto@ciandt.com
 */

// Structural object to be added in the global scope.
var global = {
  // for debugging purpose of states.
  debug: true, 
  /**
  * Separate a given array into a set of arrays determined by sequential numbers.
  */
  createIntervals: function(entries) {
    var intervals = new Array();
    /**
    * Auxiliar variables for current states: 
    * - current number under analysis
    * - current set
    */
    var currentItem = null
    var currentSet = null
    var entriesLength = entries.length;
    global.log('debug','entries length:  '+ entriesLength);
    for (var i in entries){
      currentItem = entries[i];
      
      global.log('debug','==============new=============');
      global.log('debug','i:  '+ i);
      global.log('debug','current: '+ currentItem);

      // case: first item of a set
      if(currentSet == null){
        currentSet = new Array();
        currentSet.push(currentItem);
        continue;
      }
      
      // case: where we found that lastOfInterval is not sequential with current
      if(currentSet[currentSet.length-1] != (currentItem - 1)){
        // close interval (one or more itens)
        intervals.push(currentSet);
        global.log('debug','interval created.');
        
        // reset vars creating new set with currentItem
        currentSet = new Array();
      }

      currentSet.push(currentItem);
      continue;
    }
    if(currentSet != null) {
      intervals.push(currentSet);
      currentSet = null;
    }
    return intervals;
  },

  /**
  * Generate a better HTML version of this output.
  */
  generateIntervalsHTMLOutput: function(intervals) {
    var htmlOutput = document.createElement('div');
    htmlOutput.className = 'output';
    var htmlList = document.createElement('ul');
    for (var i in intervals) {
      var currentInterval = intervals[i];
      var line = document.createElement('li');
      var firstElement = currentInterval[0].toString();
      var lastElement = currentInterval[currentInterval.length-1].toString();
      if(firstElement == lastElement) {
        line.innerHTML = "["+ firstElement +"]";
      } else {
        line.innerHTML = "["+ firstElement +"-"+ lastElement +"]";
      }      
      htmlList.appendChild(line);
    }
    htmlOutput.appendChild(htmlList);
    return htmlOutput;
  }, 

  /**
    * Generate HTML version for entries
    */
  generateEntriesHTMLOutput: function(entries){
    var htmlOutput = document.createElement('p');
    htmlOutput.innerHTML = entries.join(',');
    return htmlOutput;
  }, 

  log: function(type, msg){
    if(window.console != undefined && typeof console.log == 'function') {
      switch(type){
        case 'debug':
          if(global.debug == true){
            console.log(type,msg);
          }
          break;
        default:
          console.log(type,msg);
          break;  
      }        
    } else {
      global.appendUnsupportedLogBrowserMessage();          
    }
  },
  
  appendUnsupportedLogBrowserMessage: function(){
    var msg = document.createElement('p');
    msg.setAttribute('id','log_message');
    msg.innerHTML = '.: Current browser doesn\'t support logging \n\
      functionality. please use Google Chrome';
    if (document.getElementById('log_message') == undefined) {
      document.body.appendChild(msg);
    }
  },

  /**
  * Main function to be executed during window onload
  */
  main: function(){
    var entries = [100];
    var entries = [100, 101];
    var entries = [100, 101, 112];
    var entries = [100, 101, 112, 113, 115, 117, 118];
    var entries = [100, 101, 102, 103, 104, 105, 110, 111, 113, 114, 115, 150];

    var intervals = global.createIntervals(entries);
    var htmlOutput = global.generateIntervalsHTMLOutput(intervals);
    var htmlEntries = global.generateEntriesHTMLOutput(entries);

    document.body.appendChild(htmlEntries);
    document.body.appendChild(htmlOutput);    
  }
}  
window.onload = global.main;