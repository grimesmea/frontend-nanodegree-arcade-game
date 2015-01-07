var currentGameState,
    level,
    enemies = [],
    gems = [],
    levelKeys = [];

var GameState = {
  STARTMENU: 1,
  LEVEL: 2,
  GAMEOVER: 3,
};


var GemTypes = {
  GREEN: 100,
  BLUE: 250,
  ORANGE: 550,
};

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
    resetLevel();
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

  this.originalX = x;
  this.originalY = y;

  this.width = 75;

  this.hitboxX = x + 30;
  this.hitboxY = y + 75;
  this.hitboxWidth = 15;
  this.hitboxHeight = 10;

  this.sprite = 'images/char-princess-girl-cropped.png';

  this.lives = 3;
  this.score = 0;
  this.hasKey = false;
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
    if(!player.hasKey && tempY > 40 && tempY < canvas.height - 100) {
      this.y = tempY;
    } else if(player.hasKey && tempY > 0 && tempY < canvas.height - 100) {
      this.y = tempY;
    }
  } else if (key === 'enter') {
    currentGameState = GameState.LEVEL;
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

  /* Future versions of the game may include more than one key per level, thus
   * the for loop is left intact despite there only ever being one key per level in this
   * verion.
   */
  for(var k = 0; k < levelKeys.length; k++){
    if(isColliding(levelKeys[k]) === true) {
      levelKeys[k].onCollision();
    }
  }
};

Player.prototype.reset = function() {
  this.x = this.originalX;
  this.y = this.originalY;

  this.hitboxX = this.x + 30;
  this.hitboxY = this.y + 75;

  if(currentGameState === GameState.GAMEOVER) {
    player.lives = 3;
    player.score = 0;
    player.hasKey = false;
  }
};

Player.prototype.update = function(dt) {
  this.hitboxX = this.x + 30;
  this.hitboxY = this.y + 75;

  this.checkCollisions();
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
  player.hasKey = true;
  levelKeys.splice(levelKeys.indexOf(this), 1);
};

function getSpeed(minSpeed, maxSpeed) {
  return Math.random() * (maxSpeed - minSpeed) + minSpeed;
}

function generateGemCoords() {
   var x = Math.round(Math.random() * 10 / 2.5) * 100 + 20;
   var y = Math.round(Math.random() * 10 / 5) * 85 + 140;

   for(var i = 0; i < gems.length ; i++) {
     if(gems[i].x === x && gems[i].y === y) {
       x = Math.round(Math.random() * 10 / 2.5) * 100 + 20;
       y = Math.round(Math.random() * 10 / 5) * 85 + 140;

       i = -1;
     }
   }

  return [x, y];
}

function generateKeyCoords() {
  var x = Math.round(Math.random() * 10 / 2.5) * 100 + 35;
  var y = Math.round(Math.random() * 10 / 5) * 85 + 140;

  for(var i = 0; i < gems.length ; i++) {
    if(gems[i].x + 15 === x && gems[i].y === y) {
      x = Math.round(Math.random() * 10 / 2.5) * 100 + 35;
      y = Math.round(Math.random() * 10 / 5) * 85 + 140;

      i = -1;
    }
  }

  return [x, y];
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

/* This function does nothing but it could have been a good place to
 * handle game reset states - maybe a new game menu or a game over screen
 * those sorts of things. It's only called once by the init() method.
 */
function reset() {
  this.player = new Player(215, 430);

  resetLevel();

  this.currentGameState = GameState.STARTMENU;
}

function resetLevel() {
  player.reset();

  enemies = [];
  gems = [];
  levelKeys =[];

  enemies.push(new Enemy(-40, 299));
  enemies.push(new Enemy(-40, 133));
  enemies.push(new Enemy(-180, 216));
  enemies.push(new Enemy(-120, 133));

  for(var gemType in GemTypes) {
    var gemCoords = generateGemCoords();
    gems.push(new Gem(gemCoords[0], gemCoords[1], GemTypes[gemType]));
  }

  var keyCoords = generateKeyCoords();
  levelKeys.push(new LevelKey(keyCoords[0], keyCoords[1]));
}

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

  if(typeof player !== 'undefined') {
    player.handleInput(allowedKeys[e.keyCode]);
  }
});
