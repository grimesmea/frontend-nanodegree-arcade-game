var Entity = function(x, y) {
  this.x = x;
  this.y = y;
};

Entity.prototype.update = function(dt) {
  this.move(dt);
  this.checkCollisions();
};

Entity.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

var Enemy = function(x, y) {
  Entity.call(this, x, y);

  var maxSpeed = 200;
  var minSpeed = 100;

  this.sprite = 'images/enemy-bug-cropped.png';

  this.speedX = getSpeed(maxSpeed, minSpeed);
  this.speedY = 0;
};

Enemy.prototype = Object.create(Entity.prototype);
Enemy.prototype.constructor = Enemy;

Enemy.prototype.move = function(dt) {
  var newX = this.x + this.speedX * dt;
  var newY = this.y + this.speedY * dt;

  if(newX < canvas.width) {
    this.x += this.speedX * dt;
  } else {
    this.x = -100;
  }

  if(newY < canvas.height + 100) {
    this.y += this.speedY * dt;
  } else {
    this.y = this.y;
  }
};

Enemy.prototype.checkCollisions = function() {};

function getSpeed(minSpeed, maxSpeed) {
  return Math.random() * (maxSpeed - minSpeed) + minSpeed;
}

var Player = function(x, y) {
  Entity.call(this, x, y);

  this.sprite = 'images/char-princess-girl-cropped.png';
};

Player.prototype = Object.create(Entity.prototype);
Player.prototype.constructor = Player;

Player.prototype.handleInput = function(key) {
  var tempX = this.x;
  var tempY = this.y;

  if (key === 'left') {
    tempX -= 101;
  }
  if (key === 'up') {
    tempY -= 83;
  }
  if (key === 'right') {
    tempX += 101;
  }
  if (key === 'down') {
    tempY += 83;
  }

  if(tempX > 0 && tempX < canvas.width - 75) {
    this.x = tempX;
  }
  if(tempY > 0 && tempY < canvas.height - 100) {
    this.y = tempY;
  }
};

Player.prototype.move = function(dt) {};

Player.prototype.checkCollisions = function() {
  for(var i = 0; i < enemies.length; i++){
    if(isColliding(enemies[i]) === true) {
      console.log('hit');
    }
  }
};

var player = new Player(215, 430);
var enemies = [];

enemies.push(new Enemy(-100, 299));
enemies.push(new Enemy(-100, 299));
enemies.push(new Enemy(-100, 133));
enemies.push(new Enemy(-100, 216));
enemies.push(new Enemy(-100, 133));

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
  var allowedKeys = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down'
  };

  player.handleInput(allowedKeys[e.keyCode]);
});

function isColliding(collidable) {
  var collisionStatus = false;

  if(player.x < collidable.x + 98 &&
     collidable.x < player.x + 75 &&
     player.y - 12 < collidable.y - 65 &&
     collidable.y - 10 < player.y - 60) {

      console.log('y:' + player.y);
    //collisionStatus = true;
  }
  console.log('x:' + player.x);
  return collisionStatus;
}
