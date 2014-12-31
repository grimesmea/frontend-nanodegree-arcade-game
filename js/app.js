var Entity = function(x, y) {
  this.x = x;
  this.y = y;
};

Entity.prototype.update = function(dt) {
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

Enemy.prototype.update = function(dt) {
  this.move(dt);
};

var Player = function(x, y) {
  Entity.call(this, x, y);

  originalX = x;
  originalY = y;

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

Player.prototype.checkCollisions = function() {
  for(var i = 0; i < enemies.length; i++){
    if(isColliding(enemies[i]) === true) {
      this.reset();
    }
  }
};

Player.prototype.reset = function() {
  this.x = originalX;
  this.y = originalY;
};

Player.prototype.update = function(dt) {
  this.checkCollisions();
};

var gemTypes = {
  GREEN: 100,
  BLUE: 250,
  ORANGE: 550,
};

var Gem = function(x, y, gemType) {
  Entity.call(this, x, y);

  this.type = gemType;

  if(this.type === gemTypes.GREEN) {
    this.sprite = 'images/gem-green-resized.png';
  }
  if(this.type === gemTypes.BLUE) {
    this.sprite = 'images/gem-blue-resized.png';
  }
  if(this.type === gemTypes.ORANGE) {
    this.sprite = 'images/gem-orange-resized.png';
  }
};

Gem.prototype = Object.create(Entity.prototype);
Gem.prototype.constructor = Gem;


var player = new Player(215, 430);
var enemies = [];
var gems = [];

enemies.push(new Enemy(-100, 299));
enemies.push(new Enemy(-100, 299));
enemies.push(new Enemy(-100, 133));
enemies.push(new Enemy(-100, 216));
enemies.push(new Enemy(-100, 133));

gems.push(new Gem(220, 225, gemTypes.GREEN));
gems.push(new Gem(120, 310, gemTypes.BLUE));
gems.push(new Gem(325, 140, gemTypes.ORANGE));

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

function getSpeed(minSpeed, maxSpeed) {
  return Math.random() * (maxSpeed - minSpeed) + minSpeed;
}

function move(dt) {
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
}

function isColliding(collidable) {
  if(player.x + 30 > collidable.x + 98 ||
     collidable.x > player.x + 45 ||
     player.y + 75 > collidable.y + 65 ||
     collidable.y + 10 > player.y + 85) {
    return false;
  } else {
    return true;
  }
}
