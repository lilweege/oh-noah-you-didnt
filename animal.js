let Entity = require('./entity.js');
class Animal extends Entity {
  constructor (id, x, y, type, initdir, xvel, yvel, xmax, ymax, grav) {
    super(xvel, yvel, xmax, ymax, grav);
    this.id = id;
    this.x = x;
    this.y = y;
    this.type = type; // pig cow sheep tutrle
    if (type == 0 || type == 4) {
      this.width = 50;
    }
    else if (type == 1) {
      this.width = 64;
    }
    else if (type == 2) {
      this.width = 62;
    }
    else if (type == 3) {
      this.width = 72;
    }

    this.height = 40;
    this.speed = this.xmax/125 * (type != 4 ? 1 : 2);
    this.initdir = initdir * this.speed;
    this.grabbed = false;
    this.grabbedBy = null;
    this.moveInterval = Math.random() + 2; // run from 0 to 0.5 secs
    this.frame = 0;
    this.alive = true;
  }

  update (plat, play) {
    // if (!this.alive) {
    //   this = null;
    // }
    if (this.alive) {
      if (!this.grabbed) {
        this.move();
        this.applyForces();
        this.collide(plat);
      }
      else {
        this.following(play);
      }
    }
  }

  following(p) {
    let guy;
    let players = [];
    for (let i in p) {
      players.push(p[i]);
      // if (play[i].id == this.grabbedBy) guy = players[i];
    }
    guy = players.find(s => s.id == this.grabbedBy);
    for (let i in players) {
      if (players[i].holding.includes(this) && players[i] != guy) {
        players[i].holding.splice(players[i].holding.indexOf(this), 1);
      }
    }
    if (guy != undefined) {
      this.facingRight = guy.facingRight;
      this.x = guy.x;
      this.y = guy.y - guy.height/2 - this.height/2 - 10- this.height * guy.holding.indexOf(this);
    }
    else {
      this.grabbedBy = null;
      this.grabbed = false;
      //if your deposited delete from animal list
    }
  }

  move() {
    // bounds (temporary until new bg)
    if (this.initdir == 0) {
      if (this.x > this.xmax + 400) this.x = this.xmax + 400;
      if (this.x < -400) this.x = -400;
    }

    // gravity
    this.yvel += this.grav;

    // passive movement
    this.frame++;
    if (this.initdir != 0) {
      this.xvel = this.initdir;
      this.facingRight = this.initdir > 0;

      if ((this.initdir < 0 && this.x < this.xmax + 200) || (this.initdir > 0 && this.x > -200)) {
        this.initdir = 0;
        this.frame = 0;
      }
    }

    if (Math.floor(30 * this.moveInterval) == this.frame) {
      if (Math.random() > 0.5) {
        this.xvel = this.speed;
        this.facingRight = true;
      }
      else {
        this.xvel = -this.speed;
        this.facingRight = false;
      }
      this.xvel *= (Math.random() * 0.5) + 0.75;
      this.frame = 0;
    }
  }
}
module.exports = Animal;
