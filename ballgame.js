(function(){

	var canvas = document.getElementById("ball");
		c = canvas.getContext('2d'),
		gravity = 0.1,
		dampening = 0.99,
		pullStrength = -0.002,
		maxSpeed = 5,
		offset = 200,
		repulsion = 1;

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

		draw: function() {
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

	var hoop = {
		x1: 500,
		y1: 250,
		x2: 550,
		y2: 300,
		lineWidth: 5,

		draw: function() {
			c.beginPath();
			c.moveTo(this.x1, this.y1);
			c.lineTo(this.x2, this.y2);
			c.lineWidth = this.lineWidth;
			c.lineCap = "round";
			c.strokeStyle = '#000';
			c.stroke();
			c.beginPath();
			c.moveTo(600, 300);
			c.lineTo(600, 250);
			c.stroke();
		}
	}

	function executeFrame(){
		// Increment location by velocity
		circle.x += circle.vx;
		circle.y += circle.vy;

		// Increment Gravity
		circle.vy += gravity;

		// Slow down velocity
		circle.vx *= dampening;
		circle.vy *= dampening;

		speedThrottle();

		// Top border
		if (circle.y + circle.radius < offset) {
			circle.y = offset - circle.radius;
			circle.vy = Math.abs(circle.vy);
		}
		// Bottom border
		if (circle.y + circle.radius > canvas.height - offset) {
			circle.y = canvas.height - offset - circle.radius;
			circle.vy = -Math.abs(circle.vy);
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

		// Hoop border
		// if (circle.x + circle.radius > 500 && circle.x + circle.radius < 550 && circle.y + circle.radius > 250 && circle.y + circle.radius < 300) {
			//circle.x = canvas.width - offset - circle.radius;
		// 	circle.vx = -Math.abs(circle.vx) * 0.95;
		// 	circle.vy = -Math.abs(circle.vy) * 0.95;
		// }

		//console.log('circle.x + circle.radius: ' + circle.x + circle.radius);

		c.clearRect(0, 0, canvas.width, canvas.height);

		// Hoop Net
		c.beginPath();
		c.moveTo(500, 250);
		c.lineWidth = 5;
		c.lineCap = "round";
		c.lineTo(600, 250);
		c.strokeStyle = '#7ec0ee';
		c.stroke();
		c.beginPath();
		c.moveTo(550, 300);
		c.lineTo(600, 300);
		c.stroke();

		// Hoop
		hoop.draw();
		circle.draw();

		var adjx = (circle.radius * Math.cos((this.angle + 90) * Math.PI / 180)) + circle.x;
		var adjy = (circle.radius * Math.sin((this.angle + 90) * Math.PI / 180)) + circle.y;

		canvas.addEventListener('mousemove', function(event){
			var mousePosX = event.pageX - 10,
				mousePosY = event.pageY - 10;
			var ballMinX = circle.x - circle.radius,
				ballMinY = circle.y - circle.radius;
			var ballMaxX = circle.x + circle.radius,
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
		// canvas.addEventListener('mousemove', function(event){
		// 	var mousePosX = event.pageX - 10,
		// 		mousePosY = event.pageY - 10;
		// 	circle.x = mousePosX;
		// 	circle.y = mousePosY;
		// });
		hoopCollide();

		requestAnimationFrame(executeFrame);
	}

	function hoopCollide() {
		// compute the euclidean distance between A and B
		var lab = Math.sqrt( Math.pow((hoop.x2 - hoop.x1),2) + Math.pow((hoop.y2 - hoop.y1),2) );

		// compute the direction vector D from A to B
		var dx = (hoop.x2 - hoop.x1) / lab;
		var dy = (hoop.y2 - hoop.y1) / lab;

		// Now the line equation is x = Dx*t + Ax, y = Dy*t + Ay with 0 <= t <= 1.

		// compute the value t of the closest point to the circle center (Cx, Cy)
		var t = dx * (circle.x - hoop.x1) + dy * (circle.y - hoop.y1);

		// This is the projection of C on the line from A to B.

		// compute the coordinates of the point E on line and closest to C
		var ex = t * dx + hoop.x1;
		var ey = t * dy + hoop.y1;

		// console.log('ex: ' + ex);
		// console.log('ey: ' + ey);
		// circle.x2 = ex;
		// circle.y2 = ey;
		// console.log(t);
		circle.x2 = ex;
		circle.y2 = ey;

		// compute the euclidean distance from E to C
		var lec = Math.sqrt( Math.pow((ex - circle.x),2) + Math.pow((ey - circle.y),2) );

		// test if the line intersects the circle
		if( lec < circle.radius ) {
		    // compute distance from t to circle intersection point
		    var dt = Math.sqrt( Math.pow((circle.radius),2) - Math.pow((lec),2) );
		    //console.log(dt);

		    // compute first intersection point on the x (fx) and y (fy) axis
		    var fx = (t - dt) * dx + hoop.x1;
		    var fy = (t - dt) * dy + hoop.y1;
		    //var fOnline = is_on(fx, fy);
		    // console.log(fx + ',' + fy);
		    //console.log(fOnline);

		    // compute second intersection point on the x (gx) and y (gy) axis
		    var gx = (t + dt) * dx + hoop.x1;
		    var gy = (t + dt) * dy + hoop.y1;
		    //var gOnline = is_on(gx, gy);
		    // console.log(gx + ',' + gy);

		    if ((fx > hoop.x1 && fy > hoop.y1) && (fx < hoop.x2 && fy < hoop.y2) || (gx > hoop.x1 && gy > hoop.y1) && (gx < hoop.x2 && gy < hoop.y2)) {
				circle.vx = -Math.abs(circle.vx);
			 	circle.vy = -Math.abs(circle.vy);
			 }

		    // console.log('circle intersects line at: (' + fx + ',' + fy + ') and: (' + gx + ',' + gy + ')');
		}
		// else test if the line is tangent to circle
		else if( lec == circle.radius ) {
		    // tangent point to circle is E
		    console.log('line is tangent to circle');
		}
		else {
		    // line doesn't touch circle
		}
	}

	function distance(c1, c2) {
		return Math.sqrt( Math.pow(hoop.x1 - c1, 2) + Math.pow(hoop.x2 - c2, 2) )
	}
	function distance2(c1, c2) {
		return Math.sqrt( Math.pow(c1 - hoop.x2, 2) + Math.pow(c2 - hoop.y2, 2) )
	}
	function distance3() {
		return Math.sqrt( Math.pow(hoop.x1 - hoop.x2, 2) + Math.pow(hoop.y1 - hoop.y2, 2) )
	}
	function is_on(c1, c2) {
		console.log(distance(c1, c2));
		console.log(distance2(c1, c2));
		console.log(distance3());
		return distance(c1, c2) + distance2(c1, c2) == distance3();
	}

	function speedThrottle() {
		// Set a maximum speed
		if(circle.vx > maxSpeed) {
			circle.vx = maxSpeed;
		}
		if(circle.vx < -maxSpeed) {
			circle.vx = -maxSpeed;
		}
		if(circle.vy > maxSpeed) {
			circle.vy = maxSpeed;
		}
		if(circle.vy < -maxSpeed) {
			circle.vy = -maxSpeed;
		}
	}

	executeFrame();
})();