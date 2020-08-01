if (!window.AudioContext) alert('you browser doesnt support Web Audio API')

var currentTempo = 60
  , context, clock, osc
  , freqEvent1, freqEvent2

// To change the tempo, we use the function `Clock.timeStretch`.
var setTempo = function(newTempo) {
  clock.timeStretch(context.currentTime, [freqEvent1, freqEvent2], currentTempo / newTempo)
  currentTempo = newTempo
}

$('#startButton').click(function() {

  context = new AudioContext()
  clock = new WAAClock(context)
  clock.start()
  osc = context.createOscillator()
  osc.connect(context.destination)
  osc.start(0)

  // Scheduling functions provided by WAAClock merely execute your callback slightly before
  // the given deadline, so you would have time to schedule things exactly using Web Audio API
  // primitives. Setting the tolerance allows to control this behaviour, by telling the clock 
  // how early before the deadline it can run the callback.

  // The following creates an event that will fire first at second 1 and repeat every 2 seconds.
  freqEvent1 = clock.setTimeout(function(event) {
    osc.frequency.setValueAtTime(220, event.deadline)
  }, 1).repeat(2).tolerance({early: 0.1})

  // And this creates an event that will fire first at second 2 and repeat every 2 seconds.
  freqEvent2 = clock.setTimeout(function(event) {
    osc.frequency.setValueAtTime(440, event.deadline)
  }, 2).repeat(2).tolerance({early: 0.1})

})