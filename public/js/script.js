(function() {
  'use strict';

  var socket = io();

  var TYPING_DELAY = 100;
  var PHASE = 'START'; //START, NAME
  var PRINTING = false;
  
  document.onkeypress = function(e) {
    if(PRINTING){
      return false;
    }
    e = e || window.event;
    var keyCode = e.keyCode || e.which;
    if (keyCode == 13) {
      switch(PHASE){
        case 'START':
        break;
        case 'NAME':
          $.post('/start', {team: $('.name-input').val()}, function(res){
            $('.name-input').remove();
            PHASE = 'START';
            showMsg('Start playing by pushing any of the buttons once.', function() {});
          });
        break;
      }
    }
  }

  function showMsg(msg, cb) {
    PRINTING = true;
    $('#message').text('');
    var letters = msg.split('');
    async.forEachOf(letters, function(letter, i, callback) {
      return setTimeout(function() {
        $('#message').text($('#message').text() + letter);
        callback();
      }, i * TYPING_DELAY)
    }, function(err) {
      PRINTING = false;
      if (typeof cb === 'function') {
        cb();
      }
    });
  }
  
  function askName(){
    showMsg('What is your name?', function() {
      var nameInput = $('<input />')
        .attr('type', 'text')
        .addClass('name-input')
        .insertAfter('#message')
        .focus();
        PHASE = 'NAME';
    });
  }

  socket.on('score:received', function(data){
    showMsg('You got '+data.score+' points!', function() {
      setTimeout(function(){
        askName();
      }, 2500);
    });    
  });

  showMsg('Start playing by pushing any of the buttons once.', function() {});
  
})();