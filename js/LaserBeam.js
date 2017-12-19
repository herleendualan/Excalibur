var usingTimedWeapon = false;
var laserTopPosition = vec2.create(0, -laserPicFrameH);
var lowerRight, lowerLeft, topRight, topLeft;
var restoreLaserPic = laserPic;

function laserShotClass(x, y, angle, speed) {
	this.speed = speed;
	this.position = vec2.create(x, y);
	// this.moveAng is angle + 90 deg. This is because the image is vertical (pointing in the -Y direction)
	// To orient the image along the +X direction, have to add 90 degrees (PI/2 radians)
	this.moveAng = angle + Math.PI / 2;
	this.removeMe = false;
	this.frameNow = 0;
	this.colliderLineSegLaserRight = new lineSegment();
	this.colliderLineSegLaserLeft = new lineSegment();

	this.draw = function () {
		canvasContext.save();
		canvasContext.translate(this.position.x,this.position.y);
		canvasContext.rotate(this.moveAng + Math.PI);	// Rotate by 180 degrees, so the "top" of the laser is at the cannon, and the bottom points away from the cannon
		canvasContext.scale(-1,-1);
		if (masterFrameDelayTick % 5 == 0) {
				this.frameNow = 0;
			} else if (masterFrameDelayTick % 5 == 1) {
					this.frameNow = 1;
			}
		canvasContext.drawImage(laserPic,
			this.frameNow * laserPicFrameW, 0, laserPicFrameW, laserPicFrameH,
			laserPicFrameW/2, 0, laserPicFrameW * -1, laserPicFrameH * -1);
		if (weaponFrameCount > 35) {
				laserPic = laserPicEnding;
			}
		canvasContext.restore();
	};

	this.move = function () {
		cannonAngle = angle;
		playerMoveSpeed = 0;
		// laser shot doesn't actually go anywhere
	};

	this.shotCollisionAndBoundaryCheck = function () {
		if (weaponFrameCount >= 54) {
			cannonAngle = Math.atan2(mouseCannonY, mouseCannonX);
			this.removeMe = true;
			usingTimedWeapon = false;
			weaponFrameCount = 0;
			playerMoveSpeed = 4;
			playerX = playerX;
			laserPic = restoreLaserPic;
		}

		/*lowerRight = vec2.create((this.position.x + laserPicFrameW/2) * Math.cos(this.moveAng), this.position.y);
		lowerLeft = vec2.create((this.position.x - laserPicFrameW/2) * Math.cos(this.moveAng), this.position.y);
		// topRight = vec2.create(this.position.x + laserPicFrameW/2, this.position.y - laserPicFrameH);
		// topLeft = vec2.create(this.position.x - laserPicFrameW/2, this.position.y - laserPicFrameH);
		topRight = vec2.create();
		topLeft = vec2.create();
		//vec2.set(lowerRight,(this.position.x + laserPicFrameW/2) * Math.cos(this.moveAng), this.position.y * Math.sin(this.moveAng));
		vec2.add(topRight, lowerRight, laserTopPosition);
		vec2.scale(lowerRight, lowerRight, Math.sin(this.moveAng));
		topRight.x *= (Math.cos(this.moveAng + Math.PI));
		//topRight.x *= -1;
		//topRight.y *= -1;
		//vec2.set(lowerLeft,(this.position.x - laserPicFrameW/2) * Math.cos(this.moveAng), this.position.y * Math.sin(this.moveAng));
		vec2.add(topLeft, lowerLeft, laserTopPosition);
		vec2.scale(lowerLeft, lowerLeft, Math.sin(this.moveAng));
		topLeft.x *= (Math.cos(this.moveAng + Math.PI));
		//topLeft.x *= -1;
		//topLeft.y *= -1;
		//topRight = vec2.create(this.position.x + laserPicFrameW/2, this.position.y - laserPicFrameH);
		//topLeft = vec2.create(this.position.x - laserPicFrameW/2, this.position.y - laserPicFrameH);
		this.colliderLineSegLaserRight.setEndPoints(lowerRight,topRight);
		this.colliderLineSegLaserLeft.setEndPoints(lowerLeft,topLeft);*/

        powerUpBoxList.forEach(function(powerUpBox) {
            if (isColliding_AABB_LineSeg(powerUpBox.colliderAABB, this.colliderLineSegLaserRight) 
            	|| isColliding_AABB_LineSeg(powerUpBox.colliderAABB, this.colliderLineSegLaserLeft)) {
            	powerupExplosion(powerUpBox.position.x - powerUpWidth / 2,
            					 powerUpBox.position.y - powerUpWidth / 2);
            	shieldPowerUpSound.play();
                var useMaxDuration = true;
                score += scoreForPowerUpShot;
                powerUpBox.setActive(useMaxDuration);
            }
        }, this);

		for (var e = 0; e < shipList.length; e++) {
            if (isColliding_AABB_LineSeg(shipList[e].colliderAABB, this.colliderLineSegLaserRight)
            	|| isColliding_AABB_LineSeg(shipList[e].colliderAABB, this.colliderLineSegLaserLeft) 
            	&& !shipList[e].isDamaged) {

                if(!shipList[e].isDamaged){
                    score += scoreForShipShot;
                    shipHitExplosion(shipList[e].position.x,shipList[e].position.y);
                    shipList[e].isDamaged = true;
                }

                if (canSpawnPowerUp()) {
                    spawnPowerUp(shipList[e]);
                }
            }
        }
		for (var t = 0; t < alienList.length; t++) {
			if (this.position.y > alienList[t].position.y - alienHeight && this.position.y < alienList[t].position.y &&
				this.position.x > alienList[t].position.x - alienWidth / 2 && this.position.x < alienList[t].position.x + alienWidth / 2) {
			   
				score += scoreForAlienShot;
				alienList[t].removeMe = true;
			} else if (this.position.y > alienList[t].chuteY && this.position.y < alienList[t].chuteY + parachuteH &&
				this.position.x > alienList[t].chuteX && this.position.x < alienList[t].position.x + parachuteW && alienList[t].isChuteDrawn) {
				// TODO replace with line segment/aabb intersection test (use shot velocity to compute previous known position; make line seg from last-known to current position)
			   	
				score += scoreForParachuteShot;
				alienList[t].isChuteDrawn = false;
			} // end of parachute collision check
		} // end of alien collision check
	}; // end of shotCollisionAndBoundaryCheck function
}// end of laserShotClass