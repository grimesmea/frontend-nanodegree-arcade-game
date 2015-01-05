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

  this.hitboxX = this.x;
  this.hitboxY = this.y + 10;
  this.hitboxWidth = 98;
  this.hitboxHeight = 55;

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

Enemy.prototype.onCollision = function() {
  player.lives--;

  if(player.lives === 0) {
    currentGameState = GameState.GAMEOVER;
  }
  player.reset();
};

Enemy.prototype.update = function(dt) {
  this.move(dt);
  this.hitboxX = this.x;
  this.hitboxY = this.y + 10;
};

var Player = function(x, y) {
  Entity.call(this, x, y);

  originalX = x;
  originalY = y;

  this.width = 75;

  this.hitboxX = x + 30;
  this.hitboxY = y + 75;
  this.hitboxWidth = 15;
  this.hitboxHeight = 10;

  this.sprite = 'images/char-princess-girl-cropped.png';

  this.lives = 3;
  this.score = 0;
  this.numberOfKeys = 0;
};

Player.prototype = Object.create(Entity.prototype);
Player.prototype.constructor = Player;

Player.prototype.handleInput = function(key) {
  if(currentGameState === GameState.LEVEL) {
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
  } else {
    if (key === 'enter') {
      currentGameState = GameState.LEVEL;
    }
  }
};

Player.prototype.checkCollisions = function() {
  for(var i = 0; i < enemies.length; i++){
    if(isColliding(enemies[i]) === true) {
      enemies[i].onCollision();
      break;
    }
  }

  for(var j = 0; j < gems.length; j++){
    if(isColliding(gems[j]) === true) {
      gems[j].onCollision();
    }
  }

  for(var k = 0; k < levelKeys.length; k++){
    if(isColliding(levelKeys[k]) === true) {
      console.log('hi');
      levelKeys[k].onCollision();
    }
  }
};

Player.prototype.reset = function() {
  this.x = originalX;
  this.y = originalY;

  if(currentGameState === GameState.GAMEOVER) {
    player.lives = 3;
    player.score = 0;
    player.numberOfKeys = 0;
  }
};

Player.prototype.update = function(dt) {
  this.hitboxX = this.x + 30;
  this.hitboxY = this.y + 75;

  this.checkCollisions();
};

var GemTypes = {
  GREEN: 100,
  BLUE: 250,
  ORANGE: 550,
};

var Gem = function(x, y, gemType) {
  Entity.call(this, x, y);

  this.type = gemType;

  this.hitboxX = this.x;
  this.hitboxY = this.y;
  this.hitboxWidth = 60;
  this.hitboxHeight = 63;

  if(this.type === GemTypes.GREEN) {
    this.sprite = 'images/gem-green-resized.png';
  }
  if(this.type === GemTypes.BLUE) {
    this.sprite = 'images/gem-blue-resized.png';
  }
  if(this.type === GemTypes.ORANGE) {
    this.sprite = 'images/gem-orange-resized.png';
  }
};

Gem.prototype = Object.create(Entity.prototype);
Gem.prototype.constructor = Gem;

Gem.prototype.onCollision = function() {
  player.score += this.type;
  gems.splice(gems.indexOf(this), 1);
};

var LevelKey = function(x, y) {
  Entity.call(this, x, y);

  this.hitboxX = this.x + 8;
  this.hitboxY = this.y;
  this.hitboxWidth = 43;
  this.hitboxHeight = 83;

  this.sprite = 'images/key-cropped.png';
};

LevelKey.prototype = Object.create(Entity.prototype);
LevelKey.prototype.constructor = LevelKey;

LevelKey.prototype.onCollision = function() {
  player.numberOfKeys++;
  levelKeys.splice(levelKeys.indexOf(this), 1);
};

var player = new Player(215, 430);
var enemies = [];
var gems = [];
var levelKeys = [];

enemies.push(new Enemy(-100, 299));
enemies.push(new Enemy(-100, 299));
enemies.push(new Enemy(-100, 133));
enemies.push(new Enemy(-100, 216));
enemies.push(new Enemy(-100, 133));

gems.push(new Gem(220, 225, GemTypes.GREEN));
gems.push(new Gem(120, 310, GemTypes.BLUE));
gems.push(new Gem(325, 140, GemTypes.ORANGE));

levelKeys.push(new LevelKey(220, 299));

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
  var allowedKeys = {
    13: 'enter',
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
  if(player.hitboxX > collidable.hitboxX + collidable.hitboxWidth||
     collidable.hitboxX > player.hitboxX + player.hitboxWidth ||
     player.hitboxY > collidable.hitboxY + collidable.hitboxHeight ||
     collidable.hitboxY > player.hitboxY + player.hitboxHeight) {
    return false;
  } else {
    return true;
  }
}

function drawPlayerLife() {
  for(var i = 0; i < player.lives; i++) {
    ctx.drawImage(Resources.get('images/heart-resized.png'), player.x  + (player.width / 2) + (15 * i) - (6 * player.lives), player.y - 20);
  }
}

function drawPlayerKeys() {
  for(var i = 1; i <= player.numberOfKeys; i++) {
    ctx.drawImage(Resources.get('images/key-hud-icon.png'), canvas.width - 30, 12);
  }
}

function drawPlayerScore() {
  ctx.fillStyle = 'rgb(66, 66, 66)';
  ctx.font = 'bold 20px Verdana';
  ctx.textAlign = 'left';
  ctx.fillText('Score: ' + player.score, 5, 32);
}
