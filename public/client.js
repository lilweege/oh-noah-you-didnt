let socket = io();

let muteDiv = document.getElementById('muteDiv');
let titleDiv = document.getElementById('titleDiv');
let signDiv = document.getElementById('signDiv');
let gameDiv = document.getElementById('gameDiv');
let statsDiv = document.getElementById('statsDiv');
let instructionsDiv = document.getElementById('instructionsDiv');
let settingsDiv = document.getElementById('settingsDiv');
let playingSettings = document.getElementById('playingSettings');
let creditsDiv = document.getElementById('creditsDiv');
let backButtons = document.getElementsByClassName('backButton');
let loading = document.getElementById('loading');
let statsLoading = document.getElementById('statsLoading');
let splashimg = document.getElementById("splash-img");

let titleDivPlay = document.getElementById('titleDiv-play');
let titleDivStats = document.getElementsByClassName('titleDiv-stats');
let titleDivInstructions = document.getElementById('titleDiv-instructions');
let titleDivCredits = document.getElementById('titleDiv-credits');
let settingsButtons = document.getElementsByClassName('titleDiv-settings');
let signDivUser = document.getElementById('signDiv-user');
let signDivPass = document.getElementById('signDiv-pass');
let signDivLogin = document.getElementById('signDiv-login');
let signDivRegister = document.getElementById('signDiv-register');
let chatText = document.getElementById('chat-text');
let chatInput = document.getElementById('chat-input');
let chatForm = document.getElementById('chat-form');
let results = document.getElementById('results');

titleDivPlay.onmouseenter = function() {
  whoosh.play();
};
titleDivCredits.onmouseenter = function() {
  whoosh.play();
};
titleDivInstructions.onmouseenter = function() {
  whoosh.play();
};

var detector = new MobileDetect(window.navigator.userAgent);

titleDiv.addEventListener('click', function(event) {
  event.preventDefault();
});
splashimg.addEventListener('click', function(event) {
  window.open('https://www.soundcloud.com/neatobeats', '_blank');
});
signDiv.addEventListener('click', function(event) {
  event.preventDefault();
});
gameDiv.addEventListener('click', function(event) {
  event.preventDefault();
});
instructionsDiv.addEventListener('click', function(event) {
  event.preventDefault();
});
settingsDiv.addEventListener('click', function(event) {
  event.preventDefault();
});
creditsDiv.addEventListener('click', function(event) {
  event.preventDefault();
});

titleDivPlay.onclick = function() {
  whoosh.play();
  signDiv.style.display = "inline-block";
  // gameDiv.style.display = "inline-block";
  titleDiv.style.display = "none";
};
for (let i in titleDivStats) {
  titleDivStats[i].onclick = function() {
    whoosh.play();
    statsDiv.style.display = "inline-block";
    gameDiv.style.display = "none"
    titleDiv.style.display = "none";
    statsLoading.style.display = "flex";
    results.innerHTML = '<ul><div id="player">Player</div><div id="avg">Average Score</div><div id="hs">High&nbsp;Score</div></ul>'
    socket.emit('leaderboard', socket.id);
  };
}
titleDivInstructions.onclick = function() {
  whoosh.play();
  instructionsDiv.style.display = "inline-block";
  titleDiv.style.display = "none";
};
titleDivCredits.onclick = function() {
  whoosh.play();
  creditsDiv.style.display = "inline-block";
  titleDiv.style.display = "none";
};
for (let i in settingsButtons) {
  settingsButtons[i].onmouseenter = function() {
    whoosh.play();
  };
  settingsButtons[i].onclick = function() {
    whoosh.play();
    settingsDiv.style.display = "inline-block";
    gameDiv.style.display = "none";
    titleDiv.style.display = "none";
  };
}

for (let i in backButtons) {
  backButtons[i].onmouseenter = function() {
    whoosh.play();
  };
  if (backButtons[i].name == "Menu") {
    backButtons[i].onclick = function() {
      menu();
    };
  }
  else if (backButtons[i].name == "settingsBack") {
    backButtons[i].onclick = function() {
      if (playing) {
        gameDiv.style.display = "inline-block";
        settingsDiv.style.display = "none";
      }
      else {
        whoosh.play();
        titleDiv.style.display = "inline-block";
        statsDiv.style.display = "none";
        signDiv.style.display = "none";
        gameDiv.style.display = "none";
        creditsDiv.style.display = "none";
        instructionsDiv.style.display = "none";
        settingsDiv.style.display = "none";
      }
    };
  }
  else if (backButtons[i].name == "statsBack") {
    backButtons[i].onclick = function() {
      if (playing) {
        gameDiv.style.display = "inline-block";
        statsDiv.style.display = "none";
      }
      else {
        whoosh.play();
        titleDiv.style.display = "inline-block";
        statsDiv.style.display = "none";
        signDiv.style.display = "none";
        gameDiv.style.display = "none";
        creditsDiv.style.display = "none";
        instructionsDiv.style.display = "none";
        settingsDiv.style.display = "none";
      }
    };
  }
  else {
    backButtons[i].onclick = function() {
      whoosh.play();
      titleDiv.style.display = "inline-block";
      statsDiv.style.display = "none";
      signDiv.style.display = "none";
      gameDiv.style.display = "none";
      creditsDiv.style.display = "none";
      instructionsDiv.style.display = "none";
      settingsDiv.style.display = "none";
    };
  }
}

socket.on('end', function(data) {
  menu();
});



function menu() {
  playing = false;
  noLoop();
  gameDiv.style.display = "none";
  for (let i in gameMusic) {
    gameMusic[i].stop();
  }
  titleMusic.play();
  whoosh.play();
  titleDiv.style.display = "inline-block";
  signDiv.style.display = "none";
  creditsDiv.style.display = "none";
  instructionsDiv.style.display = "none";
  settingsDiv.style.display = "none";
  socket.emit('forceDisconnect', socket.id);
}

signDivLogin.onclick = function() {
  socket.emit('signIn', {user:signDivUser.value, pass:signDivPass.value});
  loading.style.display = "flex";
};
signDivRegister.onclick = function() {
  socket.emit('register', {user:signDivUser.value, pass:signDivPass.value});
  loading.style.display = "flex";
};


socket.on('leaderboardResponse', function(data) {
  let stats = [];
  for (let i in data) {
    stats.push([data[i].username, data[i].avgScore, data[i].highScore]);
    stats.sort(function(a, b) {
      return a[2] - b[2];
    });
    stats.reverse();
  }
  statsLoading.style.display = "none"
  for (let i = 0; i < (stats.length < 10 ? stats.length:10); i++) {
    results.innerHTML += '<ul>' + '<div id="player">' + stats[i][0] + '</div>' +
   '<div id="avg">' + stats[i][1] + '</div>' +
   '<div id="hs">' + stats[i][2] + '</div>' + '</ul>';
  }
});

socket.on('signInResponse', function(data) {
  loading.style.display = "none";
  if (data.success == 1) {
    chatText.innerHTML = "";
    playing = true;
    loop();
    titleMusic.stop();
    gameMusic[0].play();
    gameDiv.style.display = "inline-block";
    signDiv.style.display = "none";
  }
  else if (data.success == 0) {
    alert("Sign in failed: Wrong username or password.");
  }
  else if (data.success == 2) {
    alert("Sign in failed: User is already logged in.");
  }
  else if (data.success == 3) {
    alert("Sign in failed: Connection timed out.");
  }
});
socket.on('registerResponse', function(data) {
  loading.style.display = "none";
  if (data.success == 1) {
    alert("Registration successful.");
  }
  else if (data.success == 0) {
    alert("Registration failed: Empty username or password.");
  }
  else if (data.success == 2) {
    alert("Registration failed: User already exists.");
  }
  else if (data.success == 3) {
    alert("Registration failed: Connection timed out.");
  }
  else if (data.success == 4) {
    alert("Registration failed: Username too long, must be shorter than 14 characters.");
  }
});

// chat
socket.on('addToChat', function(data) {
  if (playing) {
    chatText.innerHTML += '<div>' + sanitize(data) + '</div>';
    chatText.scrollTo(0, chatText.scrollHeight);
  }
});
function sanitize(input) {
  let output = "";
  for (let i = 0; i < input.length; i++) {
    output += "&#x"+input.charCodeAt(i).toString(16)+";"
  }
  return output;
}
chatForm.onsubmit = function(e){
  e.preventDefault();
  if (chatInput.value.length != 0) socket.emit('sendMsgToServer',{chat: chatInput.value, player: selfId});
  chatInput.value = '';
};

let players = [];
let animals = [];
let platforms = [];
let selfId = "";
let self = {};
let ark = {};
let state = 0;
let timer = 30000;

socket.on('init', function(data) {
  selfId = data.self.id;
  // initPlayers(data.p.players);
  updatePlayers(data.p.players);
  updateAnimals(data.p.animals);
  initPlatforms(data.p.platforms);
  ark = data.p.ark;
});

socket.on('update', function(data) {
  updatePlayers(data.players);
  updateAnimals(data.animals);
  timer = data.timer;
  state = data.state;
  if (state != 3 && playing) loop();
});

function updatePlayers(list) {
  players = [];
  for (let i in list) {
    players.push(list[i]);
    if (players[i].id == selfId) self = players[i];
  }
}

function updateAnimals(list) {
  animals = [];
  for (let i in list) {
    animals.push(list[i]);
  }
}

function initPlatforms(list) {
  platforms = [];
  for (let i in list) {
    platforms.push(list[i]);
  }
}
