class Entity {
  constructor(id, x, y) {

    this.xvel = 0;
    this.yvel = 0;
    this.xmax = 800;
    this.ymax = 600;
    this.grav = this.ymax/150;
    this.falling = true;
    this.isOnGround = false;
    this.facingRight = true;
  }

  // variables restricted to function scope atm, to use when optimizing
  init(p, a) {
    let platforms = [];
    for (let i in p) {
      platforms.push(p[i]);
    }
    let animals = [];
    for (let i in a) {
      animals.push(a[i]);
    }
  }

  applyForces() {
    this.x += this.xvel;
    this.y += this.yvel;
  }

  collide(p) {
    // on ground
    let platforms = [];
    for (let i in p) {
      platforms.push(p[i]);
    }

    for (let i = 0; i < platforms.length; i++) { // loop through platforms
      // in line with x
      if (this.x + this.width/2 > platforms[i].x - platforms[i].width/2 && this.x - this.width/2 < platforms[i].x + platforms[i].width/2) {
        // feet touching platform
        if (((this.y + this.height/2) > (platforms[i].y - platforms[i].height/2)) && ((this.y + this.height/2) < (platforms[i].y + platforms[i].height/2))) {
          if (this.currentPlat != platforms[i] && this.dropping) {
            // this.currentPlat = null;
            this.isOnGround = true;
          }
          // if (this.currentPlat == platforms[i] && this.dropping) {
          if (this.currentPlat == platforms[i] && this.dropCount < 4) {
            this.dropCount++;
            continue;
          }
          if (this.falling) {
            this.yvel = 0;
            this.y = platforms[i].y - this.height/2 - platforms[i].height/2;
            this.isOnGround = true;
            break;
          }
        }
        else {
          this.isOnGround = false;
        }
      }
    }
  }


}
module.exports = Entity;
