(function(){

	var canvas = document.getElementById("ball");
		c = canvas.getContext('2d'),
		gravity = 0.1,
		dampening = 0.99,
		pullStrength = -0.002,
		maxSpeed = 10,
		offset = 200,
		repulsion = 1;

	function getRandomInt(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	var circle = {
		x: getRandomInt(200, 600),
		y: getRandomInt(200, 600),
		// (vx, vy) = Velocity vector
		vx: 0,
		vy: 0,
		radius: 20
	};

	function executeFrame(){
		// Increment location by velocity
		circle.x += circle.vx;
		circle.y += circle.vy;

		// Increment Gravity
		circle.vy += gravity;

		// Slow down velocity
		circle.vx *= dampening;
		circle.vy *= dampening;

		// Top border
		if (circle.y + circle.radius < offset) {
			circle.y = offset + circle.radius;
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

		//console.log('circle.x + circle.radius: ' + circle.x + circle.radius);

		c.clearRect(0, 0, canvas.width, canvas.height);

		c.beginPath();
		c.arc(circle.x, circle.y, circle.radius, 0, 2*Math.PI);
		c.closePath();
		c.fill();

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

				if(circle.vx > maxSpeed || circle.vx > maxSpeed) {
					circle.vx == maxSpeed;
					circle.vy == maxSpeed;
				}

			}
		});

		requestAnimationFrame(executeFrame);
	}

	executeFrame();
})();