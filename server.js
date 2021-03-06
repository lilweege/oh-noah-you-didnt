console.log('server running');
const env = require("dotenv").config({ path: "./.env" });

// mongodb atlas
const Mongoose = require('mongoose');

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rlus3.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
;(async() => {
	await Mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
	console.log("db connected");
})()

const userSchema = new Mongoose.Schema({
	username: String,
	password: String,
	highscore: Number,
	avgscore: Number,
	scores: [Number],
});
const Account = Mongoose.model('Account', userSchema);

// express
let location = '/public';
let express = require('express');
let app = express();
let serv = require('http').Server(app);
app.get('/',function(req, res) {
	// res.send("Temp Text")
	res.sendFile(__dirname + location + '/index.html');
});
app.use(location, express.static(__dirname + location));
let port = process.env.PORT || 8080;
serv.listen(port);

// socket
let state = 0;
let d = false;
let timer = 45000;
let SOCKET_LIST = {};
let io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket) {
	SOCKET_LIST[socket.id] = socket;
	socket.on('signIn', async function(data) {

		await Account.find({
			username: data.user,
			password: data.pass
		}).then(entries => {
			let taken = false;
			if (PLAYER_LIST.length != 0) {
				for (let i in PLAYER_LIST) {
					if (PLAYER_LIST[i].user == data.user) {
						taken = true;
						socket.emit('signInResponse', {success: 2}); // user taken
						break;
					}
				}
			}

			if (!taken) {
				let exists = entries.length > 0
				if (exists) {
					socket.emit('signInResponse', {success:1}); // successful login
					if (state == 2 && countProperties(PLAYER_LIST) + 1 >= 2) timer = 10000;
					createPlayer(socket.id, data.user);
					for (let i in SOCKET_LIST) {
						SOCKET_LIST[i].emit('addToChat', PLAYER_LIST[socket.id].user + ' has joined the game.');
					}
				}
				else {
					socket.emit('signInResponse', {success:0}); // wrong user and pass
				}
			}

		}).catch(err => {
			console.error(err)
		})
	});

	socket.on('register', async function(data) {
		let empty = (data.user == "" || data.pass == "");
		let longer = (data.user.length >= 14);

		if (longer) {
			socket.emit('registerResponse', {success:4}); // user too long
		}
		else if (empty) {
			socket.emit('registerResponse', {success:0}); // empty user or pass
		}
		else {
			let exists = true
			await Account.find({username: data.user})
				.then(entries => {
					exists = entries.length > 0
				})
				.catch(err => {
					console.error(err)
				})

			if (exists) {
				socket.emit('registerResponse', {success:2}); // user taken
			}
			else {
				socket.emit('registerResponse', {success:1}); // successful register
				new Account({
					username: data.user,
					password: data.pass,
					highscore: 0,
					scores: [],
					avgscore: 0
				}).save(err => {});
			}

		}
	});

	socket.on('leaderboard', async function(id) {
		await Account.find({})
		.then(entries => {
			let leader = [];
			for (let entry of entries) {
				leader.push({
					username: entry.username,
					avgScore: entry.avgscore,
					highScore: entry.highscore
				});
			}
			socket.emit("leaderboardResponse", leader);
		}).catch(err => {
			console.error(err)
		})
	});

	socket.on('sendMsgToServer', function(data) {
		for (let i in SOCKET_LIST) {
			SOCKET_LIST[i].emit('addToChat', PLAYER_LIST[data.player].user + ': ' + data.chat);
		}
	});

	socket.on('forceDisconnect', function(id) {
		if (PLAYER_LIST[socket.id]) {
			for (let i in SOCKET_LIST) {
				SOCKET_LIST[i].emit('addToChat', PLAYER_LIST[id].user + ' has left the game.');
			}
		}
		delete PLAYER_LIST[id];
	});

	socket.on('disconnect', function() {
		if (PLAYER_LIST[socket.id]) {
			for (let i in SOCKET_LIST) {
				SOCKET_LIST[i].emit('addToChat', PLAYER_LIST[socket.id].user + ' has left the game.');
			}
		}
		delete PLAYER_LIST[socket.id];
		delete SOCKET_LIST[socket.id];

	});
});





// game
let Entity = require('./entity.js');
let Player = require('./player.js');
let Animal = require('./animal.js');
let Platform = require('./platform.js');
let PLAYER_LIST = {};
let ANIMAL_LIST = {};
let PLATFORM_LIST = [];
let final = null;
let finala = null;
let framerate = 30;
let width = 800;
let height = 600;
let ark = {
  x: width/2,
  y: height/2-65,
  width: 155,
  height: 70
};

let ph = 50;
createPlatform(width/2, height+ph-25, width + 1200, 100, 1); // ground
createPlatform(width/2, height+ph/2-330, 900, ph, 1); // boat floor

// bottom platforms
createPlatform(width*5/6, height+ph/2-105, 200, ph, 0);
createPlatform(width/6, height+ph/2-105, 200, ph, 0);

// middle platforms
createPlatform(width/2, height+ph/2-179, 250, ph, 0);
createPlatform(width*39/40, height+ph/2-189, 100, ph, 0);
createPlatform(width/40, height+ph/2-189, 100, ph, 0);

// top platforms
createPlatform(width*4/5, height+ph/2-265, 200, ph, 0);
createPlatform(width/5, height+ph/2-265, 200, ph, 0);

// roof platforms
createPlatform(width/4, height+ph/2-404, 50, ph, 1);
createPlatform(width*3/4, height+ph/2-404, 50, ph, 1);
createPlatform(width/2, height+ph/2-460, 300, ph, 1);


function waitForPlayers() {
  state = 2;
  timer = 10000;
}

function startGame() {
  final = null;
  finala = null;
  timer = 45000;
  let count = 1;
  let numPlayers = countProperties(PLAYER_LIST);
  for (let i in PLAYER_LIST) {
	PLAYER_LIST[i].x = ((width)/(numPlayers+1)) * count;
	PLAYER_LIST[i].y = 0;
	count++;
  }
  for (let i = 0; i <= 800; i += 200) {
	createAnimal(i, height, Math.round(Math.random()) * 2 - 1);
  }
  state = 1;
}

async function endGame() {
	state = 3;
	timer = 10000;
  for (let i in PLAYER_LIST) {
		if (!PLAYER_LIST[i].spectating) {
			Account.updateOne(
				{ username: PLAYER_LIST[i].user },
				{ $push: {scores: PLAYER_LIST[i].score} },
			(err, num, raw) => {})
			let entry
			let totalScores = 0
			await Account.find({
				username: PLAYER_LIST[i].user
			}).then(entries => {
				entry = entries[0]
				for (let i = 0; i < entry.scores.length; i++) {
					totalScores += entry.scores[i];
				}
			}).catch(err => {
				console.error(err)
			})
			Account.updateOne(
				{ username: PLAYER_LIST[i].user },
				{ avgscore: (totalScores / entry.scores.length).toFixed(2),
				highscore: Math.max(entry.highscore, PLAYER_LIST[i].score)},
				(err, num, raw) => {})
		}
  }
}

function createPlayer(id, user) {
  let socket = SOCKET_LIST[id];
  PLAYER_LIST[id] = new Player(id, user, width/2, 0);
  PLAYER_LIST[id].spectating = (state == 1 || state == 3);

  socket.on('keyPress', function(data) {
	if (id in PLAYER_LIST) {
	  if (data.inputId === 'left') PLAYER_LIST[id].pressingLeft = data.state;
	  if (data.inputId === 'right') PLAYER_LIST[id].pressingRight = data.state;
	  if (data.inputId === 'jump') PLAYER_LIST[id].pressingJump = data.state;
	  if (data.inputId === 'drop') PLAYER_LIST[id].pressingDrop = data.state;
	  if (data.inputId === 'grab') PLAYER_LIST[id].pressingGrab = data.state;
	}
  });

  let pack = {
	players: updatePlayers(),
	animals: updateAnimals(),
	platforms: initPlatforms(),
	ark: ark
  };

  socket.emit('init', {p: pack, self: PLAYER_LIST[socket.id]});
}

function createAnimal(x, y, d) {
  let id = Math.random();
  if (id > 0.95) { // % chance for golden pig
	ANIMAL_LIST[id] = new Animal(id, x, y, 4, d);
  }
  else {
	ANIMAL_LIST[id] = new Animal(id, x, y, Math.floor(Math.random() * 4), d);
  }
}

function createPlatform(x, y, w, h, t) {
  let id = Math.random();
  PLATFORM_LIST[id] = new Platform(id, x, y, w, h, t);
}

function updatePlayers() {
  let playerPack = [];
  for (let i in PLAYER_LIST) {
	PLAYER_LIST[i].update(PLATFORM_LIST, ANIMAL_LIST, ark);
	playerPack.push(PLAYER_LIST[i]);
  }
  return playerPack;
}

function updateAnimals() {
  let animalPack = [];
  let living = 0;
  for (let i in ANIMAL_LIST) {
	ANIMAL_LIST[i].update(PLATFORM_LIST, PLAYER_LIST);
	animalPack.push(ANIMAL_LIST[i]);
	if (ANIMAL_LIST[i].alive == true && state == 1) {
	  living++;
	}
  }
  if (state == 1) {
	while (living < countProperties(PLAYER_LIST)) {
	  let dir = Math.random() > 0.5;
	  createAnimal((dir ? -600 : width + 600), height, (dir ? 1 : -1) * ((Math.random() * 0.25) + 1.25));
	  living++;
	}
	if (timer % 500 == 0) { // every 0.5 seconds
	  let dir = Math.random() > 0.5;
	  createAnimal((dir ? -600 : width + 600), height, (dir ? 1 : -1) * ((Math.random() * 0.25) + 1.25));
	}
  }
  return animalPack;
}

function initPlatforms() {
  let platformPack = [];
  for (let i in PLATFORM_LIST) {
	platformPack.push(PLATFORM_LIST[i]);
  }
  return platformPack;
}

async function updateGame() {
  let numPlayers = countProperties(PLAYER_LIST);

  if (state == 0 && numPlayers >= 2) {
	for (let i in PLAYER_LIST) {
	  PLAYER_LIST[i].score = 0;
	}
	state = 2;
	timer = 10000;
  }
  if (state == 2 && numPlayers <= 1) {
	state = 0;
  }
  if (state == 2 && numPlayers >= 2 && timer < 0) {
	startGame();
  }
  if ((state == 1 && numPlayers <= 1 && timer > 0) || (state == 1 && timer < 0)) {
	await endGame();
  }
  if (state == 3 && timer < 0) {
	state = 0;
	for (let i in PLAYER_LIST) {
	  PLAYER_LIST[i].spectating = false;
	  PLAYER_LIST[i].x = width/2;
	  PLAYER_LIST[i].y = 0;
	  PLAYER_LIST[i].holding = [];
	}
	for (let i in ANIMAL_LIST) {
	  // ANIMAL_LIST[i].alive = false;
	  delete ANIMAL_LIST[i];
	}
  }
}

setInterval (async function() {
  let pack;
  if (state == 1) {
	timer -= framerate;
	pack = {
	  players: updatePlayers(),
	  animals: updateAnimals(),
	  timer: timer,
	  state: state,
	};
  }
  else if (state == 2) {
	timer -= framerate;
	pack = {
	  players: updatePlayers(),
	  animals: [],
	  timer: timer,
	  state: state,
	};
  }
  else if (state == 3) {
	timer -= framerate;
	if (final == null) {
	  final = updatePlayers();
	}
	if (finala == null) {
	  finala = updateAnimals();
	}
	pack = {
	  players: final,
	  animals: finala,
	  timer: timer,
	  state: state,
	};
  }
  else {
	pack = {
	  players: updatePlayers(),
	  animals: [],
	  timer: 0,
	  state: state,
	};
  }
  await updateGame();
  for (let i in SOCKET_LIST) {
	let socket = SOCKET_LIST[i];
	socket.emit('update', pack);
  }
}, 1000/framerate);

function countProperties(obj) {
  let count = 0;
  for (let prop in PLAYER_LIST) {
	if (PLAYER_LIST.hasOwnProperty(prop) && !PLAYER_LIST[prop].spectating) {
	  ++count;
	}
  }
  return count;
}
