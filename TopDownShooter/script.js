//init visual vars
var canvas, ctx, height, width;
//Logic values
var lastDrawn = 0;

const topBar = 100;

var player;


//eneimes
var eneimes = [];
var toRemove,toRemoveLen,eneimesLen,newEnimies;

var keyMap = {
	68: 'right',
	65: 'left',
	87: 'up',
	83: 'down',
	32: 'space'
}

class enemy {
	constructor(){
		this.randomSegemnt = Math.floor(Math.random()*4);
		if(this.randomSegemnt === 0){
			this.x = Math.floor(Math.random()*width);
			this.y = topBar;
			this.rotation = Math.PI;
		} else if(this.randomSegemnt === 1){
			this.x = Math.floor(Math.random()*width);
			this.y = height;
			this.rotation = 0;
		} else if (this.randomSegemnt === 2){
			this.x = 0;
			this.y = Math.floor(Math.random()*height);
			this.rotation = Math.PI/2;
		} else {
			this.x = width;
			this.y = Math.floor(Math.random()*height);
			this.rotation = Math.PI*3/2;
		}
		
		this.thurst = Math.floor(Math.random()*1)+ 1;
		this.xAccel = 0;
		this.yAccel = 0;
		this.rotaterate = (0.06*Math.random())-0.03;
	};

	draw(){
		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.rotate(this.rotation);

		ctx.strokeStyle = 'black';
		ctx.lineWidth = 2;
		ctx.beginPath ();
		ctx.moveTo(0, 0);
		ctx.lineTo(10, 10);
		ctx.lineTo(0, -20);
		ctx.lineTo(-10, 10);
		ctx.lineTo(0, 0);
		ctx.closePath();
		ctx.stroke();
		ctx.restore();
	};

	update(progress){

		this.xAccel += Math.sin(this.rotation)*progress*0.06*this.thurst;
		this.yAccel -= Math.cos(this.rotation)*progress*0.06*this.thurst;
		this.xAccel *= 0.9;
		this.yAccel *= 0.9;

		this.x += this.xAccel*progress*0.05;
		this.y += this.yAccel*progress*0.05;

		this.rotation -= this.rotaterate;


	};

	isDead(){
		if(this.x < -20 || this.x > width+20 || this.y < topBar-20 || this.y > height + 20){
			return true;
		} else if (this.x < player.x + player.width/2 && this.x > player.x - player.width/2 && this.y < player.y + player.height/2 && this.y > player.y - player.height+player.height/2 ){
			player.hp -= 40;
			return true;
		}
		return false;
	}

};

var pressedKeys = {
	left : false,
	right : false,
	up : false,
	down : false,
	space : false
}

function keydown(event) {
	var key = keyMap[event.keyCode];
	pressedKeys[key] = true;
}

function keyup(event) {
	var key = keyMap[event.keyCode];
	pressedKeys[key] = false;
}

window.addEventListener("keydown", keydown, false)
window.addEventListener("keyup", keyup, false)

//On start up
window.onload = function(){
	canvas = document.getElementById("canvas");
	width = canvas.width;
	height = canvas.height;
	ctx = canvas.getContext("2d");
	setUp();
};

function restart(){
	player = {
		hp : 100,
		x: width/2,
		y: height/2,
		maxSpeed : 1,
		slowRate : 0.1,

		width: 20,
		height: 20,

		accelX : 0,
		accelY : 0,

		update : function(progress){
			if(this.hp <= 0){
				restart();
			}

			if(this.accelX > this.maxSpeed){
				this.accelX = this.maxSpeed;
			} else if (this.accelX < -this.maxSpeed){
				this.accelX = -this.maxSpeed;
			};

			if(this.accelY > this.maxSpeed){
				this.accelY = this.maxSpeed;
			} else if (this.accelY < -this.maxSpeed){
				this.accelY =-this.maxSpeed;
			};

			this.x += this.accelX * progress;
			this.y += this.accelY * progress;

			if(this.x > width - this.width/2){
				this.hitEdge();
				this.x = width - this.width/2;
				this.accelX = -this.accelX*0.5;
			} else if (this.x < this.width/2){
				this.hitEdge();
				this.x = this.width/2;
				this.accelX = -this.accelX*0.5;
			};

			if(this.y > height - this.height/2){
				this.hitEdge();
				this.y = height - this.height/2;
				this.accelY = -this.accelY*0.5;
			} else if (this.y < topBar + this.height/2){
				this.hitEdge();
				this.y = topBar + this.height/2;
				this.accelY = -this.accelY*0.5;
			};

			this.accelY *= 0.997;
			this.accelX *= 0.997;

		},

		hitEdge : function(){
			var magAccel = Math.sqrt(this.accelY*this.accelY + this.accelX*this.accelX);
			this.hp -= Math.floor(Math.pow(20,magAccel));
		},

		draw : function(){

			ctx.fillStyle = 'blue';
			ctx.fillRect(this.x-this.width/2,this.y-this.height/2,this.width,this.height);
		},

		setAccel : function(x,y){
			if(x != null){
				this.accelX = x;
			}

			if(y != null){
				this.accelY = y;
			}
		},

		updateAccel : function(x,y,progress){
			if(x != null){
				this.accelX += x*progress;
			}

			if(y != null){
				this.accelY += y*progress;
			}
		},

		slowDown : function(){
			if(this.accelX > this.slowRate) {
				this.accelX -= this.slowRate*0.4;
			} else if (this.accelX < -this.slowRate){
				this.accelX += this.slowRate*0.4;
			} else {
				this.accelX = 0;
			}

			if(this.accelY > this.slowRate) {
				this.accelY -= this.slowRate*0.4;
			} else if (this.accelY < -this.slowRate){
				this.accelY += this.slowRate*0.4;
			} else {
				this.accelY = 0;
			}
		}
	};
	newEnimies = 0;
	eneimes = [];


}

function setUp(){

	restart();
	window.requestAnimationFrame(loop);
};

function loop(timestamp){
	console.log(eneimes.length);
	var progress = timestamp - lastDrawn;
	update(progress);

	if(timestamp > newEnimies){

		
		eneimes.push(new enemy());
		eneimes.push(new enemy());
		
		newEnimies = timestamp + 150;
	}

	toRemove = [];

	eneimesLen = eneimes.length;

	for(var i = 0; i < eneimesLen; i++){
		eneimes[i].update(progress);
		if(eneimes[i].isDead()){
			toRemove.push(i);
		}
	}

	toRemoveLen = toRemove.length;

	for(var i = toRemoveLen-1; i >= 0; i--){
		eneimes.splice(toRemove[i],1);
	}


	draw();

	lastDrawn = timestamp;
	
	window.requestAnimationFrame(loop);

};

function draw(){
	ctx.fillStyle = "white";
	ctx.fillRect(0,0,width,height);

	player.draw();
	var eneimesLen = eneimes.length;

	for(var i = 0; i < eneimesLen; i++){
		eneimes[i].draw();
	}

	ctx.fillStyle ="grey";
	ctx.fillRect(0,0,width,topBar)
	ctx.fillStyle = 'black';
	ctx.font = "30px Arial";
	ctx.fillText("HP:" + player.hp, 50, 50);
};

function update(progress){
	if(pressedKeys.left){
		player.updateAccel(-0.025,null,progress);
	};
	if(pressedKeys.right){
		player.updateAccel(0.025,null,progress);
	};
	if(pressedKeys.up){
		player.updateAccel(null,-0.025,progress);
	};
	if(pressedKeys.down){
		player.updateAccel(null,0.025,progress);
	};
	if(pressedKeys.space){
		player.slowDown();
	};
	player.update(progress);
};
