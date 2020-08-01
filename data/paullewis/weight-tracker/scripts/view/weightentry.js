/**
 * Shows a dial entry for the user to enter their weight. Will then dispatch
 * a custom event to the app with the value entered.
 *
 * @license see /LICENSE
 */
WT.View.WeightEntry = function(elementId) {

	var dialEntry = new WT.View.DialEntry("newweight");
  var element = document.getElementById(elementId);
  var confirmButton = element.querySelector('.next');
  var eventName = 'weightreadingcomplete';
  var isGoal = false;
  var removeGoalButton = element.querySelector('.removegoal');

  var callbacks = {
    onWeightConfirm: function(evt) {
      evt.preventDefault();
      dialEntry.hideAndDispatch();
    },

    onGoalRemove: function (evt) {
      evt.preventDefault();
      if (confirm("Are you sure you want to remove your goal?")) {
        WT.App.dispatchEvent(element, 'removegoal');
      }
    }
  };

  function addEventListeners() {
    confirmButton.addEventListener('click', callbacks.onWeightConfirm, false);
    confirmButton.addEventListener('touchend',
        callbacks.onWeightConfirm, false);

    removeGoalButton.addEventListener('click', callbacks.onGoalRemove, false);
    removeGoalButton.addEventListener('touchend',
        callbacks.onGoalRemove, false);
  }

  function removeEventListeners() {
    confirmButton.removeEventListener('click',
        callbacks.onWeightConfirm, false);
    confirmButton.removeEventListener('touchend',
        callbacks.onWeightConfirm, false);

    removeGoalButton.removeEventListener('click',
        callbacks.onGoalRemove, false);
    removeGoalButton.removeEventListener('touchend',
        callbacks.onGoalRemove, false);
  }

  this.clear = function() {
    dialEntry.clear();
  };

  this.show = function() {
    element.classList.add('active');
    addEventListeners();
  };

  this.hide = function() {
    element.classList.remove('active');
    removeEventListeners();
  };

  this.setEventName = function (newEventName) {
    eventName = newEventName;
  };

  this.isCapturingGoal = function (newIsGoal) {
    isGoal = newIsGoal;
    removeGoalButton.classList.toggle('visible', newIsGoal);
  };

  this.showUserWeight = function (user) {

    var label = 'weight';
    var max = WT.App.convertToImperialIfNeeded(label, 140);
    var value = WT.App.convertToImperialIfNeeded(label, user.weight);
    var ratio = WT.App.convertToImperialIfNeeded(label, 5);

    // If we're capturing a goal then we need to switch
    // to using that weight. If the user hasn't set a
    // goal then default to their current weight.
    if (isGoal) {
      if (parseFloat(user.goalWeight) !== 0) {
        value = WT.App.convertToImperialIfNeeded(label, user.goalWeight);
      }
    }

    dialEntry.show();
    dialEntry.setup({
      rawValue: isGoal ? user.goalWeight : user.weight,
      max: max,
      value: value,
      label: WT.App.getFullLabel(label),
      color: WT.Colors.BLUE,
      eventName: eventName,
      trackColor: true,
      decimalPlaces: WT.App.getDecimalPlaces(label),
      ratio: ratio
    });
  };
};

WT.View.WeightEntry.prototype = new WT.View.Base();
