// A key map of allowed keys
var allowedKeys = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down',
    65: 'a',
    66: 'b'
  };
  
  
  // The 'official' Konami Code sequence
  var konamiCode = ['up', 'up', 'down', 'down', 'left', 'right', 'left', 'right', 'b', 'a'];
  
  // A variable to remember the 'position' the user has reached so far
  var konamiCodePosition = 0;
  
  // Add a keydown event listener
  document.addEventListener('keydown', function(e) {
    // Get the value of the key code from the key map
    var key = allowedKeys[e.keyCode];
    // Get the value of the required key from the Konami code
    var requiredKey = konamiCode[konamiCodePosition];
  
    // Compare the key with the required key
    if (key == requiredKey) {
      // Move to the next key in the Konami code sequence
      konamiCodePosition++;
  
      // If the last key is reached, activate cheats
      if (konamiCodePosition == konamiCode.length) {
        activateCheats();
        konamiCodePosition = 0;
      }
    } else {
      konamiCodePosition = 0;
    }
  });
  
  // Function to activate cheats
  function activateCheats() {

    window.location.href = "/error";


  }
  //scroll down upon game starting
  function gameScroll(){
    document.getElementById('jump').scrollIntoView();
  }