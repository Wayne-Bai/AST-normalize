


var caseSwitch = function () {
  var characters = this.value.split('').map(
    function (letter) {
      if(letter.toLowerCase() === letter) {
        return letter.toUpperCase();
      } else {
        return letter.toLowerCase();
      }
    });
  transformed = characters.join('');
  document.getElementById('output-switch').value = transformed;
}


document.getElementById('input-switch').addEventListener('input', caseSwitch, false);