function GunnerClass() {
	this.position = vec2.create(-shipWidth/2, Math.random() * shipSpawnBandThickness + shipSpawnBandMargin);
	this.shipSpeed = 4;
	this.velocity = vec2.create(this.shipSpeed, 0);
    this.colliderAABB = new aabb(shipWidth/2, shipHeight/2);
	this.removeMe = false;
	this.hasDroppedYet = false;
	this.isShooting = false;
	this.dropX = getValidDropX();

	var gunnerWidth = 75;
	var gunnerHeight = 25;

	var frameNow = 0;
	var numFrames = 3;
	var frameOffsetY = 0;


  if(Math.random()<0.5) {
    this.position.x = -shipWidth/2;
    this.velocity.x = 4;
  } else {
    this.position.x = canvas.width+shipWidth/2;
    this.velocity.x = -4;
  }
  this.position.y = Math.random() * shipSpawnBandThickness + shipSpawnBandMargin;
  this.velocity.y = 0;

  var velocityX = this.velocity.x;
  var movingLeft = this.velocity.x < 0;
  var movingRight = this.velocity.x > 0;

  var pic = (movingLeft) ? gunnerShipLeftPic : gunnerShipRightPic;

	this.draw = function () {
    canvasContext.drawImage(pic,
      frameNow * gunnerWidth, frameOffsetY,
      gunnerWidth, gunnerHeight,
      this.position.x - gunnerWidth / 2, this.position.y - gunnerHeight,
      gunnerWidth, gunnerHeight);
	};

	this.move = function () {
		vec2.add(this.position, this.position, this.velocity);
		this.colliderAABB.setCenter(this.position.x, this.position.y);	// Synchronize AABB position with ship position
		this.colliderAABB.computeBounds();

		if (this.isShooting) {
      if (masterFrameDelayTick % 10 === 1) {
        frameNow++;
        if (frameNow >= numFrames) {
          this.isShooting = false;
          this.velocity.x = velocityX;
          frameNow--;
          // shoot bullet back
					console.log('shoot bullet!');
//          var newShot = new shotClass();
//          shotList.push(newShot);
        }
      }
		}
	};

	this.edgeOfScreenDetection = function () {
		var movingLeft = this.velocity.x < 0;
		var movingRight = this.velocity.x > 0;
		if ((movingLeft && this.position.x < -this.colliderAABB.width / 2) ||
			(movingRight && this.position.x > canvas.width + this.colliderAABB.width / 2)) {
			this.removeMe = true;
		}
	};

	this.spawnAliensFromShip = function () {
		if (this.hasDroppedYet) {
      return;
    }

		if ((movingLeft && this.position.x < this.dropX) ||
			(movingRight && this.position.x > this.dropX)) {
			this.hasDroppedYet = true;
			this.velocity.x = 0;
      this.isShooting = true;
      frameOffsetY = gunnerHeight;
		} // crossing drop line
	}
}

function gunnerSpawn() {
	var newShip = new GunnerClass();
	shipList.push(newShip);
}