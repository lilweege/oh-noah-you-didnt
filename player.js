let Entity = require('./entity.js');
class Player extends Entity {
  constructor (id, user, x, y, xvel, yvel, xmax, ymax, grav) {
    super(xvel, yvel, xmax, ymax, grav);
    this.id = id;
    this.user = user;
    this.x = x;
    this.y = y;
    this.width = 44;
    this.height = 88;
    this.pressingLeft = false;
    this.pressingRight = false;
    this.pressingJump = false;
    this.pressingGrab = false;
    this.grabbing = false;
    this.pressingDrop = false;
    this.dropping = false;
    this.dropCount = 0;
    this.currentPlat = null;
    this.speed = this.xmax/75;
    this.jumpForce = this.ymax/25;
    this.holding = [];
    this.score = 0;
    this.spectating = false;
    this.walkframe = 0;
  }

  update(p, a, ark) {
    this.move();
    this.applyForces();
    if (this.dropping != this.pressingDrop && !this.spectating) {
      this.dropping = !this.dropping;
      if (this.pressingDrop) {
        this.drop(p);
      }
    }
    // console.log(this.d);
    this.collide(p);
    if (this.grabbing != this.pressingGrab && !this.spectating) {
      this.grabbing = !this.grabbing;
      if (this.pressingGrab) {
        this.grab(a, ark);
      }
    }
  }

  drop(p) {
    // console.log(this.dropping);
    this.dropCount = 0;
    let platforms = [];
    for (let i in p) {
      platforms.push(p[i]);
    }
    for (let i = platforms.length-1; i > 0; i--) {
      if (this.x + this.width/2 > platforms[i].x - platforms[i].width/2 && this.x - this.width/2 < platforms[i].x + platforms[i].width/2) {
        if (((this.y + this.height/2) > (platforms[i].y - platforms[i].height/2)) && ((this.y + this.height/2) < (platforms[i].y + platforms[i].height/2))) {
          this.currentPlat = platforms[i];
          // this.isOnGround = false;
          break;
        }
      }
    }
  }

  move() {
    // left and right
    if (this.pressingLeft == this.pressingRight) {
      this.xvel = 0;
      this.walkframe = 0;
    }
    else {
      this.walkframe += 0.5;
      if (this.walkframe >= 3) {
        this.walkframe = 0;
      }
      if (this.pressingLeft) {
        this.xvel = -this.speed;
        this.facingRight = false;
      }
      if (this.pressingRight) {
        this.xvel = this.speed;
        this.facingRight = true;
      }
    }

    // invisible bounds
    if (this.x > this.xmax + 400) this.x = this.xmax + 400;
    if (this.x < -400) this.x = -400;

    // gravity
    this.yvel += this.grav;

    // jump
    if (this.pressingJump && this.isOnGround) {
      this.yvel = -this.jumpForce;
    }
    if (!this.isOnGround) {
      this.walkframe = 1;
    }

    // falling
    this.falling = this.yvel > 0;
  }

  grab(a, ark) {
    let animals = [];
    for (let i in a) {
      animals.push(a[i]);
    }

    if (this.x + this.width/2 >= ark.x - ark.width/2 &&
      this.x - this.width/2 <= ark.x + ark.width/2 &&
      this.y + this.height/2 <= ark.y + ark.height/2 &&
      this.y + this.height/2 >= ark.y - ark.height/2 &&
      !this.spectating) {
        this.saveAnimals(a);
      }

    for (let i = 0; i < animals.length; i++) {
      // if (!animals[i].grabbed &&
      if (!this.holding.includes(animals[i]) && animals[i].alive &&
      this.x + this.width/2 >= animals[i].x - animals[i].width/2 &&         // r1 right edge past r2 left
      this.x - this.width/2 <= animals[i].x + animals[i].width/2 &&         // r1 left edge past r2 right
      this.y - this.height/2 <= animals[i].y + animals[i].height/2 &&       // r1 top edge past r2 bottom
      this.y + this.height/2 >= animals[i].y - animals[i].height/2) {       // r1 bottom edge past r2 top)
        animals[i].grabbed = true;
        animals[i].grabbedBy = this.id;
        this.holding.push(animals[i]);
      }
    }

  }

  saveAnimals(a) {
    let animals = [];
    for (let i in a) {
      animals.push(a[i]);
    }
    for (let i in animals) {
      if (this.holding.find(s => s.id == animals[i].id)) {
        this.holding.splice(this.holding.indexOf(animals[i]), 1);
        animals[i].alive = false;
        if (animals[i].type == 4) this.score += 2;
        else this.score++;
      }
    }
  }


}
module.exports = Player;
