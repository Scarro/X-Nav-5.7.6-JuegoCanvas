// Original game from:
// http://www.lostdecadegames.com/how-to-make-a-simple-html5-canvas-game/
// Slight modifications by Gregorio Robles <grex@gsyc.urjc.es>
// to meet the criteria of a canvas class for DAT @ Univ. Rey Juan Carlos

// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 512;
canvas.height = 480;
document.body.appendChild(canvas);

// Background image
var bgReady = false;
var bgImage = new Image();
bgImage.onload = function () {
	bgReady = true;
};
bgImage.src = "images/background.png";

// Hero image
var heroReady = false;
var heroImage = new Image();
heroImage.onload = function () {
	heroReady = true;
};
heroImage.src = "images/hero.png";

// princess image
var princessReady = false;
var princessImage = new Image();
princessImage.onload = function () {
	princessReady = true;
};
princessImage.src = "images/princess.png";

//Stone image
var stoneReady = false;
var stoneImage = new Image();
stoneImage.onload = function(){
	stoneReady = true;
}
stoneImage.src = "images/stone.png";

//Monster image
var monsterReady = false;
var monsterImage = new Image();
monsterImage.onload = function(){
	monsterReady = true;
}
monsterImage.src = "images/monster.png";


// Game objects
var basespeed = localStorage.getItem("basespeed");
if(basespeed == null){
	basespeed = 30;
}

// HEROE
var hero = {
	speed: basespeed*8,  // movement in pixels per second
	size: 32
};

//PRINCESA
function Princess(){
	var princesa = localStorage.getItem("princess");
	if(princesa != null){
		princesaOk = JSON.parse(princesa);
		this.x = princesaOk.x;
		this.y = princesaOk.y;
	}
	this.size = 32;
}

// PIEDRAS
var stones = JSON.parse(localStorage.getItem("stones"));
var numStones = localStorage.getItem("numStones");
if(numStones == null){
	numStones = 4;
}

// MONSTRUOS
var monsters = JSON.parse(localStorage.getItem("monsters"));
var numMonsters = localStorage.getItem("numMonsters");
if(numMonsters == null){
	numMonsters = 1;
}

// ARBOLES
var tree = {
	size: 30
}

// PRINCESAS CAPTURADAS
var princessesCaught = localStorage.getItem("princessesCaught");
if(princessesCaught == null){
	princessesCaught = 0;
}

// VIDAS
var lives = localStorage.getItem("lives");
if(lives == null){
	lives = 3;
}

// NIVEL
var level = localStorage.getItem("level");
if(level == null){
	level = 0;
}

// ULTIMA POSICION
var lastPos = {};
var final = false;
var nueva = false;

// Handle keyboard controls
var keysDown = {};

addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
}, false);


// Devuelve true/false si 2 objetos se tocan
var touch = function(obj1, obj2, size1, size2){
	if(
		obj1.x <= (obj2.x + size2)
		&& obj2.x <= (obj1.x + size1)
		&& obj1.y <= (obj2.y + size2)
		&& obj2.y <= (obj1.y + size1)
	){
		return true;
	} else {
		return false;
	}
}

var touchTree = function(object){
	if(object.y < tree.size
		|| object.y > (canvas.height - object.size - tree.size)
		|| object.x < tree.size
		|| object.x > (canvas.width - object.size - tree.size)
	){
		return true;
	}
	return false;
}

// Devuelve true/false en caso de que object toque alguna piedra
var touchStones = function(object){
	if(stones){
		for(var i = 0; i<stones.length; i++){
			if(touch(stones[i], object, stones[i].size, object.size)){
				return true;
			}
		}
		return false;
	}else {
		return false;
	}
}

var touchMonster = function(object){
	if(monsters){
		for(var i = 0; i<monsters.length;i++){
			if(touch(monsters[i], object, monsters[i].size, object.size)){
				return true;
			}
		}
		return false;
	} else {
		return false;
	}
}

// Devuelve true/false en caso de que un objeto esté tocando un arbol o una piedra
var touchObject = function(object){
	if(touchTree(object)){
		return true;
	}else if(touchStones(hero)){
		return true;
	}else{
		return false;
	}
}

var createObjects = function(objects, numObjects){
	var object = {};
	var num = numObjects;

	for(var i=0; i<numObjects; i++){
		do{
			object.x = 32 + (Math.random() * (canvas.width - 96));
			object.y = 32 + (Math.random() * (canvas.height - 96));
			object.size = 28;
		}while(touch(object, princess, object.size, princess.size)
			|| touch(object, hero, object.size, hero.size)
			|| touchStones(object));
		objects.push(object);
		object = {};
	}
}

var moveMonsters = function(i, modifier){
	var distanceX = hero.x - monsters[i].x;
	var distanceY = hero.y - monsters[i].y;
	var lastPos = {}
	lastPos.x = monsters[i].x;
	lastPos.y = monsters[i].y;
	lastPos.size = 32;

	if(distanceX < 0){
		lastPos.x -= monsters[i].speed * modifier;
	}else if (distanceX > 0){
		lastPos.x += monsters[i].speed * modifier;
	}
	if(distanceY < 0){
		lastPos.y -= monsters[i].speed * modifier; 
	}else if (distanceY > 0){
		lastPos.y += monsters[i].speed * modifier;
	}
	if(touchStones(lastPos) == false){
		console.log("no toca piedra");
		monsters[i].x = lastPos.x;
		monsters[i].y = lastPos.y;
	}
}

// Reset the game when the player catches a princess
var reset = function () {
	hero.x = canvas.width / 2;
	hero.y = canvas.height / 2;

	princess = new Princess();
	if(princess.x == undefined){
		do{
			princess.x = 32 + (Math.random() * (canvas.width - 96));
			princess.y = 32 + (Math.random() * (canvas.height - 96));
			princess.size = 32;
		}while(touch(hero, princess, hero.size, princess.size)
			|| touchStones(princess));
		localStorage.setItem("princess", JSON.stringify(princess));
	}

	if(stones == null){
		stones = [];
		createObjects(stones, numStones);
		localStorage.setItem("stones", JSON.stringify(stones));
	}

	if(monsters == null){
		monsters = [];
		createObjects(monsters, numMonsters);
		for(var i=0; i<numMonsters;i++){
			monsters[i].speed = basespeed;
		};
		localStorage.setItem("monsters", JSON.stringify(monsters));
	}
};

var newGame = function(){
	localStorage.removeItem("stones");
	localStorage.removeItem("monsters");
	localStorage.removeItem("princess");
	stones = null;
	monsters = null;
	princess = null;
	reset();
}

var end = function(){
	localStorage.clear();
	stones = null;
	princess = null;
	monsters = null;
	lives = 3;
	numMonsters = 1;
	numStones = 4;
	final = true;
}

var endGame = function() {
	if (bgReady) {
		ctx.drawImage(bgImage, 0, 0);
	}
	if (bgReady) {
		ctx.drawImage(bgImage, 0, 0);
	}

	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "40px Helvetica";
	ctx.textAlign = "center";
	ctx.textBaseline = "top";
	ctx.fillText("GAME OVER", canvas.width/2, canvas.height/2 - 80);

	ctx.font = "20px Helvetica";
	ctx.fillText(princessesCaught + " princesas capturadas (nivel " + level + ")", canvas.width/2, canvas.height/2-30);

	ctx.font = "20px Helvetica";
	ctx.fillText("Pulsa espacio para continuar", canvas.width/2, canvas.height/2);

	if(32 in keysDown){
		princessesCaught = 0;
		level = 0;
		final = false;
		nueva = true;
	}
}

// Update game objects
var update = function (modifier) {
	lastPos.x = hero.x;
	lastPos.y = hero.y;

	if (38 in keysDown) { // Player holding up
		hero.y -= hero.speed * modifier;
	}
	if (40 in keysDown) { // Player holding down
		hero.y += hero.speed * modifier;
	}
	if (37 in keysDown) { // Player holding left
		hero.x -= hero.speed * modifier;
	}
	if (39 in keysDown) { // Player holding right
		hero.x += hero.speed * modifier;
	}

	for(var i = 0;i<numMonsters;i++){
		moveMonsters(i, modifier);
	}

	if(touchObject(hero)){
		hero.x = lastPos.x;
		hero.y = lastPos.y;
	} else if (touchMonster(hero)){
		lives--;
		if(lives < 1){
			end();
		} else {
			localStorage.setItem("lives", lives);
			newGame();
		}
	} else {
		// Are they touching?
		if (
			hero.x <= (princess.x + 16)
			&& princess.x <= (hero.x + 16)
			&& hero.y <= (princess.y + 16)
			&& princess.y <= (hero.y + 32)
		) {
			++princessesCaught;
			localStorage.setItem("princessesCaught", princessesCaught);
			if(princessesCaught%8 == 0){
				level++;
				localStorage.setItem("level", level);
				if(level%2 == 0){
					numMonsters++;
					basespeed += 20;
					localStorage.setItem("basespeed", basespeed);
					localStorage.setItem("numMonsters", numMonsters);

				}
				numStones++;
				localStorage.setItem("numStones", numStones);
			}
			newGame();
		}
	}
};

var draw = function(array, image){
	for(var i = 0; i<array.length; i++){
		ctx.drawImage(image, array[i].x, array[i].y);
	}
}

// Draw everything
var render = function () {
	if (bgReady) {
		ctx.drawImage(bgImage, 0, 0);
	}
		if (bgReady) {
		ctx.drawImage(bgImage, 0, 0);
	}
	// Score
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "18px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Princesses caught: " + princessesCaught, 32, 32);

	//Level
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "12px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Level: " + level, 435, 32);

	//Lives
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "12px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Lives: " + lives, 435, 50);

	if (heroReady && hero) {
		ctx.drawImage(heroImage, hero.x, hero.y);
	}

	if (princessReady && princess) {
		ctx.drawImage(princessImage, princess.x, princess.y);
	}

	if(stoneReady && stones){
		draw(stones, stoneImage);
	}

	if(monsterReady && monsters){
		draw(monsters, monsterImage);
	}
};

// The main game loop
var main = function () {
	var now = Date.now();
	var delta = now - then;

	if(final == false){
		if(nueva){
			newGame();
			nueva = false;
		}
		update(delta / 1000);
		render();
	} else {
		endGame();
	}

	then = now;
};

// Let's play this game!
reset();
var then = Date.now();
//The setInterval() method will wait a specified number of milliseconds, and then execute a specified function, and it will continue to execute the function, once at every given time-interval.
//Syntax: setInterval("javascript function",milliseconds);
setInterval(main, 1); // Execute as fast as possible
