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
		lineWidth: 2,
		fillColour: 'rgba(0,0,0,0.5)',
		strokeColour: '#000',
		radius: 20,
		mass: 10,
		elasticity: 0.8,

		draw: function() {
			c.beginPath();
			c.arc(circle.x, circle.y, circle.radius, 0, 2*Math.PI);
			c.closePath();
			c.moveTo(this.x, this.y);
			// c.lineTo(this.x2, this.y2);
			c.fillStyle = 'rgba(0,0,0,0.5)';
			c.fill();
			c.lineCap = "round";
			c.lineWidth = this.lineWidth;
			c.strokeStyle = this.strokeStyle;
			c.stroke();
		}
	};

	var hoop = {
		x1: 500,
		y1: 250,
		x2: 520,
		y2: 300,
		backX: 700,
		lineWidth: 5,
		angle: function() {
			return Math.atan((this.x2 - this.x1) / (this.y2 - this.y1))
		},
		draw: function() {
			c.beginPath();
			c.moveTo(this.x1, this.y1);
			c.lineTo(this.x2, this.y2);
			c.lineWidth = this.lineWidth;
			c.lineCap = "round";
			c.strokeStyle = '#000';
			c.stroke();
			c.beginPath();
			c.moveTo(this.backX, 300);
			c.lineTo(this.backX, 250);
			c.stroke();
		},
		net: function(){
			c.beginPath();
			c.moveTo(this.x1, this.y1);
			c.lineTo(this.backX, this.y1);
			c.lineWidth = this.lineWidth;
			c.lineCap = "round";
			c.strokeStyle = '#7ec0ee';
			c.stroke();
			c.beginPath();
			c.moveTo(this.x2, this.y2);
			c.lineTo(this.backX, this.y2);
			c.stroke();
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
		hoop.net();
		hoop.draw();
		circle.draw();

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

		// Collision events
		// Track score and reflection off of the net
		hoopCollide = netCollision(hoop.x2, hoop.y2, hoop.y1)
		netTopTouch = netCollision(hoop.backX, hoop.y1, hoop.y1)
	    if ((hoopCollide.fx > hoop.x1 && hoopCollide.fy > hoop.y1) &&
	    	(hoopCollide.fx < hoop.x2 && hoopCollide.fy < hoop.y2) ||
	    	(hoopCollide.gx > hoop.x1 && hoopCollide.gy > hoop.y1) &&
	    	(hoopCollide.gx < hoop.x2 && hoopCollide.gy < hoop.y2))
	    {
	    	////////////////////////////////
			// Click on line (both sides) to
			// see bug
	    	////////////////////////////////
	    // 	if (circle.x <= hoopCollide.ex && circle.y >= hoopCollide.ey && (circle.y - circle.radius) <= hoop.y2 ) {
		   //  	// Collide on left of hoop
	    // 		circle.y = Math.abs(hoopCollide.ey + circle.radius);
		 		// circle.vy = circle.vx;
		 		// circle.vx = -Math.abs(circle.vx);
	    // 	} else if (circle.x >= hoopCollide.ex && circle.y <= hoopCollide.ey && (circle.y - circle.radius) >= hoop.y1) {
	    // 		// Collide on right of hoop
	    // 		circle.y = Math.abs(hoopCollide.ey - circle.radius);
		 		// circle.vx = circle.vy;
		 		// circle.vy = -Math.abs(circle.vy);
	    // 	} else {
	    // 		circle.vy = -Math.abs(circle.vy);
	    // 	}
	    	// Try to figure out how angles work:
	    	// http://math.stackexchange.com/questions/1844/how-to-calculate-reflected-light-angle

	    	if (circle.x <= hoopCollide.ex && circle.y >= hoopCollide.ey) {
		    	// Collide on left of hoop
	    		circle.y = Math.abs(hoopCollide.ey + circle.radius);
		 		circle.vy = circle.vx;
		 		circle.vx = -Math.abs(circle.vx);
	    	}
	    	if (circle.x >= hoopCollide.ex && circle.y <= hoopCollide.ey) {
	    		// Collide on right of hoop
	    		circle.y = Math.abs(hoopCollide.ey - circle.radius);
		 		circle.vx = circle.vy;
		 		circle.vy = -Math.abs(circle.vy);
	    	}
	    	if ( (circle.y - circle.radius) >= (hoop.y2 - 3)) {
	    		// Collide on bottom of hoop
	    		circle.y = Math.abs(hoopCollide.ey + circle.radius);
	    		circle.vy = -Math.abs(circle.vy);
	    	}
	    	if ( (circle.y + circle.radius) <= (hoop.y1 + 3)) {
	    		// Collide on top of hoop
	    		circle.y = Math.abs(hoopCollide.ey - circle.radius);
	    		circle.vy = -Math.abs(circle.vy);
	    	}
		}
	    if ((netTopTouch.fx > hoop.x1) &&
	    	(netTopTouch.fx < hoop.backX) &&
	    	(netTopTouch.gx > hoop.x1) &&
	    	(netTopTouch.gx < hoop.backX))
	    {
	    	netTop = true;
	    }
	    if (netTop) {
			netBotTouch = netCollision(hoop.backX, hoop.y2, hoop.y2);
		    if ((netBotTouch.fx > hoop.x2) &&
		    	(netBotTouch.fx < hoop.backX) &&
		    	(netBotTouch.gx > hoop.x2) &&
		    	(netBotTouch.gx < hoop.backX))
		    {
				points += 1;
				console.log(points);
				netTop = false;
		    }
	    }

		requestAnimationFrame(executeFrame);
	}

	function netCollision(endX, bottomY, topY) {
		var fx, fy, gx, gy;
		// compute the euclidean distance between A and B
		var lab = Math.sqrt( Math.pow((endX - hoop.x1),2) + Math.pow((bottomY - topY),2) );

		// compute the direction vector D from A to B
		var dx = (endX - hoop.x1) / lab;
		var dy = (bottomY - topY) / lab;

		// Now the line equation is x = Dx*t + Ax, y = Dy*t + Ay with 0 <= t <= 1.

		// compute the value t of the closest point to the circle center (Cx, Cy)
		var t = dx * (circle.x - hoop.x1) + dy * (circle.y - topY);

		// This is the projection of C on the line from A to B.

		// compute the coordinates of the point E on line and closest to C
		var ex = t * dx + hoop.x1;
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
		    fx = (t - dt) * dx + hoop.x1;
		    fy = (t - dt) * dy + topY;

		    // compute second intersection point on the x (gx) and y (gy) axis
		    gx = (t + dt) * dx + hoop.x1;
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