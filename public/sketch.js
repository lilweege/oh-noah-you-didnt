console.log('HELLO!');

// canvas
let w;
let h;
let cnv;
let x = 800;
let y = 600;

// audio
let bgmSlider;
let sfxSlider;
let bgmVolume = 0.35;
let sfxVolume = 0.2;
let titleMusic;
let gameMusic = [];
let whoosh;

// image
let bg;
let noah;
let playing = false;
let pig;
let cow;
let sheep;
let types;
let arak;
let jump;
let score;
let end;
let scores = [];

function preload() {
  gameMusic[0] = loadSound('/public/assets/ARAB_WOODWIND_HYPE.mp3');
  gameMusic[1] = loadSound('/public/assets/PHOON_ZBLOCK.mp3');
  gameMusic[2] = loadSound('/public/assets/BEATHOT_BANGER.mp3');
  whoosh = loadSound('/public/assets/whoosh.wav');
  jump = loadSound('/public/assets/jump.wav');
  score = loadSound('/public/assets/blip.wav');
  end = loadSound('/public/assets/sound.mp3');
}

function loaded() {
  muteDiv.children[0].innerHTML = "click to continue";
  document.getElementsByClassName('loading')[0].style.display = "none";
  muteDiv.style.cursor = "pointer";
  muteDiv.onclick = function() {
    muteDiv.style.display = "none";
    titleMusic.play();
  }
}

function getSize() {
  if (windowWidth > windowHeight * 4/3) {
    h = floor(windowHeight * 2 / 3);
    w = floor(h * 4 / 3);
  }
  else {
    w = floor(windowWidth * 2 / 3);
    h = floor(w * 3 / 4);
  }
}

function centerCanvas() {
  let x = (windowWidth - w) / 2;
  let y = (windowHeight - h) / 2 - 50;
  cnv.position(x, y);
}

function windowResized() {
  if (playing) {
    centerCanvas();
    getSize();
    resizeCanvas(w, h);
  }
}

function setup() {
  // canvas
  rectMode(CORNER);
  getSize();
  cnv = createCanvas(w, h);
  cnv.parent('sketch-holder');
  cnv.style('display', 'block');
  centerCanvas();
  clear();
  noLoop();
  rectMode(CENTER);
  textSize(w / 50 / 2);
  textAlign(CENTER, CENTER);

  // audio
  titleMusic = loadSound('/public/assets/C418_STRAD.mp3', loaded);
  for (let i in gameMusic) {
    gameMusic[i].onended(nextSong);
  }
  bgmSlider = createSlider(0, 1, bgmVolume, 0.01);
  sfxSlider = createSlider(0, 1, sfxVolume, 0.01);
  bgmSlider.parent('bgmvol');
  sfxSlider.parent('sfxvol');
  titleMusic.setLoop(true);
  bgmSlider.changed(updateVolume);
  sfxSlider.changed(updateVolume);
  updateVolume();

  // image
  imageMode(CENTER);
  noah = loadImage('/public/assets/noah_sheet.png');
  bg = loadImage('/public/assets/sand.png');
  arak = loadImage('/public/assets/arc.png');
  pig = loadImage('/public/assets/pig.png');
  cow = loadImage('/public/assets/cow.png');
  sheep = loadImage('/public/assets/sheep.png');
  turtle = loadImage('/public/assets/turtle.png');
  goldenpig = loadImage('/public/assets/golden_pig.png')
  platform = loadImage('/public/assets/platforms.png');
  types = [pig, cow, sheep, turtle, goldenpig];
  noStroke();
  textFont('MinecraftiaRegular');
}

function updateVolume() {
  bgmVolume = bgmSlider.value();
  sfxVolume = sfxSlider.value();
  titleMusic.setVolume(bgmVolume);
  whoosh.setVolume(sfxVolume);
  jump.setVolume(sfxVolume);
  score.setVolume(sfxVolume);
  end.setVolume(sfxVolume);
  for (let i in gameMusic) {
    gameMusic[i].setVolume(bgmVolume);
  }
}

function nextSong(elt) {
  if (gameDiv.style.display == "inline-block") {
    if (gameMusic.indexOf(elt) == gameMusic.length - 1) {
      gameMusic[0].play();
    }
    else {
      gameMusic[gameMusic.indexOf(elt)+1].play();
    }
  }
}

function draw() {
  if (playing) {
    if (frameCount % 30 == 0) {
      if (chatInput != document.activeElement) {
        gameDiv.children[0].focus();
      }
      windowResized();
    }
    background(255);

    if (self != {}) {
      drawEnvironment();
      drawAnimals();
      drawPlayers();
      drawUi();
    }
  }
}

function drawEnvironment() {
  image(bg, w-map(self.x, 0, x, 0, w), h/2, map(bg.width, 0, x, 0, w), map(bg.height, 0, y, 0, h));
  image(arak, w-map(self.x, 0, x, 0, w), h-map(25/2, 0, y, 0, h)-map(arak.height/2, 0, y, 0, h), map(arak.width, 0, x, 0, w), map(arak.height, 0, y, 0, h));
  fill(0);
  for (let i = 2; i < platforms.length; i++) {
    // rect((w/2 - map(self.x - platforms[i].x, 0, x, 0, w)), map(platforms[i].y, 0, y, 0, h), map(platforms[i].width, 0, x, 0, w), map(platforms[i].height, 0, y, 0, h));
    image(platform, (w/2 - map(self.x - platforms[i].x, 0, x, 0, w)), map(platforms[i].y, 0, y, 0, h), map(platforms[i].width, 0, x, 0, w), map(platforms[i].height, 0, y, 0, h), 0, (platforms[i].type == 0 ? 0 : platform.height/2), platform.width, platform.height/2);
  }
}

function drawAnimals() {
  for (let i = 0; i < animals.length; i++) {
    push();
    if (animals[i].alive) {
      if (!animals[i].facingRight) {
        scale(-1.0, 1.0);
      }
      image(types[animals[i].type], (animals[i].facingRight ? 1 : -1) * (w/2 - map(self.x - animals[i].x, 0, x, 0, w)), map(animals[i].y, 0, y, 0, h), map(animals[i].width, 0, x, 0, w), map(animals[i].height, 0, y, 0, h));
    }
    pop();
  }
}

function drawPlayers() {
  for (let i = 0; i < players.length; i++) {

    if (!players[i].spectating) {

      if (players[i].yvel == -players[i].jumpForce && (jump.currentTime() < 0.01 || !jump._playing) && state != 3) {
        jump.play();
      }

      push();
      if (!players[i].facingRight) {
        scale(-1.0, 1.0);
      }
      if (players[i].id == selfId) {
        image(noah, (players[i].facingRight ? 1 : -1) * w/2, map(players[i].y, 0, y, 0, h), map(players[i].width, 0, x, 0, w), map(players[i].height, 0, y, 0, h), Math.floor(players[i].walkframe) * noah.width/3, (players[i].holding.length > 0 ? noah.height/2 : 0), noah.width/3, noah.height/2);
      }
      else {
        image(noah, (players[i].facingRight ? 1 : -1) * (w/2 - map(self.x - players[i].x, 0, x, 0, w)), map(players[i].y, 0, y, 0, h), map(players[i].width, 0, x, 0, w), map(players[i].height, 0, y, 0, h), Math.floor(players[i].walkframe) * noah.width/3, (players[i].holding.length > 0 ? noah.height/2 : 0), noah.width/3, noah.height/2);

        if (!players[i].facingRight) {
          scale(-1.0, 1.0);
        }
        textSize(w / 50 / 2);
        textAlign(CENTER, CENTER);
        fill(255);
        text(players[i].user, (w/2 - map(self.x - players[i].x, 0, x, 0, w)), map(players[i].y - players[i].height/2 - w/25, 0, y, 0, h));
      }
      pop();
    }
  }
}

function drawUi() {
  if (state == 1 && self.spectating) {
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(w/20 / 2);
    text("Spectating", w/2, map(15, 0, y, 0, h));
  }
  textSize(w / 25 / 2);
  fill(0);
  textAlign(LEFT, TOP);
  if (state == 1) {
    text('Score', map(15, 0, x, 0, w), map(15, 0, y, 0, h));
    let specs = 0;
    for (let i in players) {
      if (players[i].spectating) specs++;
    }
    if (scores.length == players.length - specs) {
      for (let i = 0; i < scores.length; i++) {

        if (!players[i].spectating) {
          if (players.find(u => u.user == scores[i][0]) != undefined) {
            text(scores[i][0] + ': ' + scores[i][1], map(15, 0, x, 0, w), map(15 + 30*(i+1), 0, y, 0, h));
            if (players.find(u => u.user == scores[i][0]).score != scores[i][1] && state == 1) {
              score.play();
            }
          }
        }
      }
    }
    scores = [];
    for (let i = 0; i < players.length; i++) {
      if (!players[i].spectating) {
        scores.push([players[i].user, players[i].score]);
      }
      scores.sort(function(a, b) {
        return a[1] - b[1];
      });
      scores.reverse();
    }
  }

  textAlign(RIGHT, TOP);
  if (state == 1) {
    text("Flood Timer: " + (timer/1000 > 0 ? "" : "0") + (timer/1000).toFixed(2), w-map(15, 0, x, 0, w),  map(15, 0, y, 0, h));
  }
  if (state == 2) {
    text("Waiting for more players " + (timer/1000 > 0 ? "" : "0") + (timer/1000).toFixed(2), w-map(15, 0, x, 0, w),  map(15, 0, y, 0, h));
  }

  textAlign(CENTER, CENTER);
  textSize(w/10 / 2);

  fill(255);
  if (state == 2 || state == 0) {
    text("Waiting for players", w/2, h/2);
  }
  else if (state == 3) {
    text("Score", w/2, map(100, 0, y, 0, h));
    for (let i = 0; i < scores.length; i++) {
      text(scores[i][0] + ": " + scores[i][1], w/2, map(100 + 80*(i+1), 0, y, 0, h));
    }
  }
}

function keyPressed() {
  if (chatInput != document.activeElement) {
    if (keyCode === 68) socket.emit('keyPress',{inputId:'right', state:true}); // d
    if (keyCode === 65) socket.emit('keyPress',{inputId:'left', state:true}); // a
    if (keyCode === 87) socket.emit('keyPress',{inputId:'jump', state:true}); // w
    if (keyCode === 83) socket.emit('keyPress',{inputId:'drop', state:true}); // s
    if (keyCode === 32) socket.emit('keyPress',{inputId:'grab', state:true}); // space
  }
}

function keyReleased() {
  if (keyCode === 68) socket.emit('keyPress',{inputId:'right', state:false}); // d
  if (keyCode === 65) socket.emit('keyPress',{inputId:'left', state:false}); // a
  if (keyCode === 87) socket.emit('keyPress',{inputId:'jump', state:false}); // w
  if (keyCode === 83) socket.emit('keyPress',{inputId:'drop', state:false}); // s
  if (keyCode === 32) socket.emit('keyPress',{inputId:'grab', state:false}); // space
}
