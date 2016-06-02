(function(){
	var netTop = false,
		points = 0;

	var canvas = document.getElementById("ball");
		c = canvas.getContext('2d'),
		gravity = 0.1,
		dampening = 0.99,
		pullStrength = -0.002,
		maxSpeed = 5,
		offset = 100;

	var floor = {
		v: {x: 0, y: 0},
		mass: 5.9722 * Math.pow(10, 24)
	}

	function collide() {
		circle.vy = (circle.elasticity * floor.mass * -circle.vy + circle.mass * circle.vy) / (circle.mass + floor.mass);
	}

	function getRandomInt(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	var circle = {
		x: getRandomInt(200, 600),
		y: getRandomInt(200, 600),
		x2: 0,
		y2: 0,
		// (vx, vy) = Velocity vector
		vx: 0,
		vy: 0,
		direction: 1,
		rotate: 1,
		lineWidth: 2,
		fillColour: 'rgba(0,0,0,0.5)',
		strokeColour: '#000',
		radius: 25,
		mass: 10,
		elasticity: 0.8,

		draw: function() {
			c.save();
			c.translate(this.x, this.y);
			c.rotate(this.rotate * Math.PI/180);
			c.drawImage(ball, -(ball.width/2), -(ball.height/2));
			c.restore(); 
		},
		drawTest: function() {
			c.beginPath();
			c.arc(circle.x, circle.y, circle.radius, 0, 2*Math.PI);
			c.closePath();
			c.moveTo(this.x, this.y);
			c.lineTo(this.x2, this.y2);
			c.fillStyle = 'rgba(0,0,0,0.5)';
			c.fill();
			c.lineCap = "round";
			c.lineWidth = this.lineWidth;
			c.strokeStyle = this.strokeStyle;
			c.stroke();
		}
	};
	var ball = new Image();
	ball.src = 'imgs/ball.gif';

	var netImg = new Image();
	netImg.src = 'imgs/hoop-net.svg';
	var hoop = {
		x1: 600,
		y1: 250,
		x2: 620,
		y2: 340,
		backX: 700,
		backX2: 680,
		lineWidth: 5,
		drawTest: function() {
			c.beginPath();
			c.moveTo(this.x1, this.y1);
			c.lineTo(this.x2, this.y2);
			c.lineWidth = this.lineWidth;
			c.lineCap = "round";
			c.strokeStyle = '#000';
			c.stroke();
			c.beginPath();
			c.moveTo(this.backX, this.y1);
			c.lineTo(this.backX2, this.y2);
			c.stroke();
			c.beginPath();
			c.moveTo(this.x1, this.y1);
			c.lineTo(this.backX, this.y1);
			c.lineWidth = this.lineWidth;
			c.lineCap = "round";
			c.strokeStyle = '#7ec0ee';
			c.stroke();
			c.beginPath();
			c.moveTo(this.x2, this.y2);
			c.lineTo(this.backX2, this.y2);
			c.stroke();
		},
		net: function(){
			c.drawImage(netImg, this.x1, this.y1 - 10, 100, 100);
			c.font = '30px Arial';
			c.fillStyle = '#7ec0ee';
			c.fillText('Score: ' + points, 10, 50);
		}
	}

	function executeFrame(){
		// Set a maximum speed
		speedThrottle();

		// Increment location by velocity
		circle.x += circle.vx;
		circle.y += circle.vy;

		// Increment Gravity
		circle.vy += gravity;
		circle.vx += 0.0000001;

		// Slow down velocity
		circle.vx *= dampening;
		circle.vy *= dampening;

		var direction = circle.vx > 0 ? 1 : -1;
		// Slow down rotating
		circle.direction *= dampening;
		// Rotate ball
		circle.rotate += circle.direction * direction;

		// Top border
		if (circle.y + circle.radius < offset) {
			circle.y = offset - circle.radius;
			circle.vy = Math.abs(circle.vy);
		}
		// Bottom border
		if ((circle.y + circle.radius) > canvas.height - offset) { 
			circle.y = canvas.height - offset - circle.radius;
			collide();
		}
		// Left border
		if (circle.x - circle.radius < offset) {
			circle.x = offset + circle.radius;
			circle.vx = Math.abs(circle.vx);
		}
		// Right border
		if (circle.x + circle.radius > canvas.width - offset) {
			circle.x = canvas.width - offset - circle.radius;
			circle.vx = -Math.abs(circle.vx);
		}

		c.clearRect(0, 0, canvas.width, canvas.height);

		// Hoop
		circle.draw();
		hoop.net();
		// hoop.drawTest();

		canvas.addEventListener('mousemove', function(event){
			var mousePosX = event.pageX - 10,
				mousePosY = event.pageY - 10;
			var ballMinX = circle.x - circle.radius,
				ballMinY = circle.y - circle.radius,
				ballMaxX = circle.x + circle.radius,
				ballMaxY = circle.y + circle.radius;
			var dx = mousePosX - circle.x,
				dy = mousePosY - circle.y;

			if (mousePosX <= ballMaxX && mousePosX >= ballMinX && mousePosY <= ballMaxY && mousePosY >= ballMinY) {
				circle.vx += dx * pullStrength;
				circle.vy += dy * pullStrength;
				circle.direction = getRandomInt(5, 30);
				speedThrottle();
			}
		});

		// Test ball position event
		canvas.addEventListener('mousedown', function(event){
			var mousePosX = event.pageX - 10,
				mousePosY = event.pageY - 10;
			circle.x = mousePosX;
			circle.y = mousePosY;
		});

	    	// Ideas: change game on point
	    	// Shoot through hoop
	    	// Shoot through bucket
	    	// Turn bucket sideways
	    	////////////////////////////////
			// Click on line (both sides) to
			// see bug
	    	////////////////////////////////
	    	// Try to figure out how angles work:
	    	// http://math.stackexchange.com/questions/1844/how-to-calculate-reflected-light-angle
	    	// Vector platformer (endless runner):
	    	// http://codepen.io/jordanranson/pen/ckIso

		// Collision events
		// Track score and reflection off of the net
		var hoopCollide = netCollision(hoop.x1, hoop.x2, hoop.y2, hoop.y1);
		var backhoopCollide = netCollision(hoop.backX, hoop.backX2, hoop.y2, hoop.y1);
		var netTopTouch = netCollision(hoop.x1, hoop.backX, hoop.y1, hoop.y1);

		var collisionDetect = [];
		collisionDetect.push(hoopCollide, backhoopCollide);
		for (i = 0; i < collisionDetect.length; i++) {
		    if ((collisionDetect[i].fx || collisionDetect[i].fy) ||
		    	(collisionDetect[i].gx || collisionDetect[i].gy ))
		    {
		    	// lineAngle either positive or negative number
		    	var lineAngle = Math.atan((collisionDetect[i].endX - collisionDetect[i].startX) / (collisionDetect[i].bottomY - collisionDetect[i].topY));
		    	// console.log('collisionDetect[i].startX: ' + collisionDetect[i].startX);
		    	// console.log('collisionDetect[i].endX: ' + collisionDetect[i].endX);
		    	// console.log('collisionDetect[i].topY: ' + collisionDetect[i].topY);
		    	// console.log('collisionDetect[i].bottomY: ' + collisionDetect[i].bottomY);
		    	// console.log('collisionDetect[i].fx: ' + collisionDetect[i].fx);
		    	// console.log('collisionDetect[i].fy: ' + collisionDetect[i].fy);
		    	// console.log('collisionDetect[i].gx: ' + collisionDetect[i].gx);
		    	// console.log('collisionDetect[i].gy: ' + collisionDetect[i].gy);
		    	if (lineAngle > 0) {
		    		if ((collisionDetect[i].fx > collisionDetect[i].startX && collisionDetect[i].fy > collisionDetect[i].topY) &&
				    	(collisionDetect[i].fx < collisionDetect[i].endX && collisionDetect[i].fy < collisionDetect[i].bottomY) ||
				    	(collisionDetect[i].gx > collisionDetect[i].startX && collisionDetect[i].gy > collisionDetect[i].topY) &&
				    	(collisionDetect[i].gx < collisionDetect[i].endX && collisionDetect[i].gy < collisionDetect[i].bottomY))
		    		{
				    	if ( (circle.y + circle.radius) <= (collisionDetect[i].topY + 3)) {
				    		// Collide on top of line
				    		circle.vy = -Math.abs(circle.vy);
				    	} else if (circle.x <= collisionDetect[i].ex && circle.y >= collisionDetect[i].ey) {
					    	// Collide on left of line
					 		circle.vy = circle.vx * dampening;
					 		circle.vx = -Math.abs(circle.vx);
				    	}
				    	if ( (circle.y - circle.radius) >= (collisionDetect[i].bottomY - 3)) {
				    		// Collide on bottom of line
				    		circle.y = Math.abs(collisionDetect[i].ey + circle.radius/2);
				    		circle.vy = -Math.abs(circle.vy);
				    	} else if (circle.x >= collisionDetect[i].ex && circle.y <= collisionDetect[i].ey) {
				    		// Collide on right of line
				    		// If the ball is going up when it collides with the right of the line
				    		// then displace the ball
				    		circle.x = circle.vy < 0 ? Math.abs(collisionDetect[i].ex + circle.radius) : circle.x;
					 		circle.vx = circle.vy * 0.7;
					 		circle.vy = circle.vy < 0 ? circle.vy * 0.1 : -circle.vy * 0.1;
				    	}
		    		}
		    	}
		    	else {
		    		if ((collisionDetect[i].fx < collisionDetect[i].startX && collisionDetect[i].fy > collisionDetect[i].topY) &&
				    	(collisionDetect[i].fx > collisionDetect[i].endX && collisionDetect[i].fy < collisionDetect[i].bottomY) ||
				    	(collisionDetect[i].gx < collisionDetect[i].startX && collisionDetect[i].gy > collisionDetect[i].topY) &&
				    	(collisionDetect[i].gx > collisionDetect[i].endX && collisionDetect[i].gy < collisionDetect[i].bottomY))
		    		{
		    			if ( (circle.y + circle.radius) <= (collisionDetect[i].topY + 3)) {
				    		// Collide on top of line
				    		circle.vy = -Math.abs(circle.vy);
				    	} else if (circle.x >= collisionDetect[i].ex && circle.y >= collisionDetect[i].ey) {
					    	// Collide on left of line
				    		// If the ball is going up when it collides with the left of the line
				    		// then displace the ball
				    		circle.x = circle.vy < 0 ? Math.abs(collisionDetect[i].ex - circle.radius) : circle.x;
					 		circle.vx = circle.vy * 0.7;
					 		circle.vy = circle.vy < 0 ? -circle.vy * 0.1 : circle.vy * 0.1;
				    	}
				    	if ( (circle.y - circle.radius) >= (collisionDetect[i].bottomY - 3)) {
				    		// Collide on bottom of line
				    		circle.y = Math.abs(collisionDetect[i].ey + circle.radius/2);
				    		circle.vy = -Math.abs(circle.vy);
				    	} else if (circle.x <= collisionDetect[i].ex && circle.y <= collisionDetect[i].ey) {
				    		// Collide on right of line
					 		circle.vy = circle.vx * dampening;
					 		circle.vx = -Math.abs(circle.vx);
				    	}
		    		}
		    	}
		    }
		}
	    // if ((hoopCollide.fx > hoop.x1 && hoopCollide.fy > hoop.y1) &&
	    // 	(hoopCollide.fx < hoop.x2 && hoopCollide.fy < hoop.y2) ||
	    // 	(hoopCollide.gx > hoop.x1 && hoopCollide.gy > hoop.y1) &&
	    // 	(hoopCollide.gx < hoop.x2 && hoopCollide.gy < hoop.y2))
	    // {
	    // 	if ( (circle.y + circle.radius) <= (hoop.y1 + 3)) {
	    // 		// Collide on top of hoop
	    // 		circle.vy = -Math.abs(circle.vy);
	    // 	} else if (circle.x <= hoopCollide.ex && circle.y >= hoopCollide.ey) {
		   //  	// Collide on left of hoop
		 		// circle.vy = circle.vx * dampening;
		 		// circle.vx = -Math.abs(circle.vx);
	    // 	}
	    // 	if ( (circle.y - circle.radius) >= (hoop.y2 - 3)) {
	    // 		// Collide on bottom of hoop
	    // 		circle.y = Math.abs(hoopCollide.ey + circle.radius/2);
	    // 		circle.vy = -Math.abs(circle.vy);
	    // 	} else if (circle.x >= hoopCollide.ex && circle.y <= hoopCollide.ey) {
	    // 		// Collide on right of hoop
	    // 		circle.x = circle.vy < 0 ? Math.abs(hoopCollide.ex + circle.radius) : circle.x;
		 		// circle.vx = circle.vy * 0.7;
		 		// circle.vy = circle.vy < 0 ? circle.vy * 0.1 : -circle.vy * 0.1;
	    // 	}
		// }
	    if ((netTopTouch.fx > hoop.x1) &&
	    	(netTopTouch.fx < hoop.backX) &&
	    	(netTopTouch.gx > hoop.x1) &&
	    	(netTopTouch.gx < hoop.backX))
	    {
	    	netTop = true;
	    }
	    if (netTop) {
			netBotTouch = netCollision(hoop.x2, hoop.backX2, hoop.y2, hoop.y2);
		    if ((netBotTouch.fx > hoop.x2) &&
		    	(netBotTouch.fx < hoop.backX2) &&
		    	(netBotTouch.gx > hoop.x2) &&
		    	(netBotTouch.gx < hoop.backX2))
		    {
				points += 1;
				console.log(points);
				netTop = false;
		    }
	    }

		requestAnimationFrame(executeFrame);
	}

	function netCollision(startX, endX, bottomY, topY) {
		var fx, fy, gx, gy;
		// compute the euclidean distance between A and B
		var lab = Math.sqrt( Math.pow((endX - startX),2) + Math.pow((bottomY - topY),2) );

		// compute the direction vector D from A to B
		var dx = (endX - startX) / lab;
		var dy = (bottomY - topY) / lab;

		// Now the line equation is x = Dx*t + Ax, y = Dy*t + Ay with 0 <= t <= 1.

		// compute the value t of the closest point to the circle center (Cx, Cy)
		var t = dx * (circle.x - startX) + dy * (circle.y - topY);

		// This is the projection of C on the line from A to B.

		// compute the coordinates of the point E on line and closest to C
		var ex = t * dx + startX;
		var ey = t * dy + topY;

		// circle.x2 = ex;
		// circle.y2 = ey;

		// compute the euclidean distance from E to C
		var lec = Math.sqrt( Math.pow((ex - circle.x),2) + Math.pow((ey - circle.y),2) );

		// test if the line intersects the circle
		if( lec < circle.radius ) {
		    // compute distance from t to circle intersection point
		    var dt = Math.sqrt( Math.pow((circle.radius),2) - Math.pow((lec),2) );

		    // compute first intersection point on the x (fx) and y (fy) axis
		    fx = (t - dt) * dx + startX;
		    fy = (t - dt) * dy + topY;

		    // compute second intersection point on the x (gx) and y (gy) axis
		    gx = (t + dt) * dx + startX;
		    gy = (t + dt) * dy + topY;
		}
		// else test if the line is tangent to circle
		else if( lec == circle.radius ) {
		    // tangent point to circle is E
		}
		else {
		    // line doesn't touch circle
		}

	    var collisionPoints = {
	    	ex: ex,
	    	ey: ey,
	    	lec: lec,
	    	fx: fx,
	    	fy: fy,
	    	gx: gx,
	    	gy: gy,
	    	startX: startX,
	    	endX: endX,
	    	bottomY: bottomY,
	    	topY: topY,
	    };
	    return collisionPoints;
	};

	function speedThrottle() {
		// Set a maximum speed
		if(circle.vx > 10) {
			circle.vx = maxSpeed + circle.vx / maxSpeed;
		}
		if(circle.vx < -10) {
			circle.vx /= -maxSpeed - circle.vx / maxSpeed;
		}
		if(circle.vy > 10) {
			circle.vy /= maxSpeed + circle.vy / maxSpeed;
		}
		if(circle.vy < -10) {
			circle.vy /= -maxSpeed - circle.vy / maxSpeed;
		}
	}

	executeFrame();
})();