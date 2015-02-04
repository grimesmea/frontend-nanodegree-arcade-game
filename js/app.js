var currentGameState,
    level,
    enemies = [],
    gems = [],
    levelKeys = [];

/**
 * Enum that defines game states. Game state is set initially to STARTMENU in
 * in the reset() method.
 * @enum {number}
 */
var GameState = {
  STARTMENU: 1,
  LEVEL: 2,
  LEVELTRANSITION: 3,
  GAMEWON: 4,
  GAMEOVER: 5
};

/**
 * Enum for gem colors and values that allows the creation of gems whose
 * point value is associate with the gem's color and appropriate sprite.
 * @enum {number}
 */
var GemTypes = {
  GREEN: 100,
  BLUE: 250,
  ORANGE: 550,
};

/**
 * Any object with a position and sprite.
 * @param {number} x, y Coordinates of the object's sprite sprite.
 * @constructor
 */
var Entity = function(x, y) {
  this.x = x;
  this.y = y;
};

/**
 * This method by default does nothing, but classes that extend Entity may
 * override this method.
 * @param {number} Time delta
 */
Entity.prototype.update = function(dt) {
};

/** Draw the entity's sprite on the canvas */
Entity.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

/**
 * Entity that moves and can kill the player.
 * @param {number} x, y Coordinates of the sprite which are passed into Entity.
 * @constructor
 * @extends {Entity}
 */
var Enemy = function(x, y) {
  Entity.call(this, x, y);

  this.maxSpeed = 180 + (level * 30);
  this.minSpeed = 80 + (level * 30);

  this.hitboxX = this.x + 15;
  this.hitboxY = this.y + 15;
  this.hitboxWidth = 85;
  this.hitboxHeight = 50;

  this.sprite = 'images/enemy-bug-cropped.png';

  this.speedX = getSpeed(this.maxSpeed, this.minSpeed);
  this.speedY = 0;
};

Enemy.prototype = Object.create(Entity.prototype);
Enemy.prototype.constructor = Enemy;

/**
 * Sets the enemy's new position based on its speed. Checks if the new position
 * remains on the canvas. If not, sets the x coordinate off-screen to the left.
 */
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

/**
 * Reduces the player's lives by one when the player collides with an enemy. If
 * the player has 0 lives after subtracting one life, the currentGameState is
 * set to game over, the level is reset, and the player is reset.
 */
Enemy.prototype.onCollision = function() {
  player.lives--;

  if(player.lives === 0) {
    currentGameState = GameState.GAMEOVER;
    resetLevel();
    level = 1;
  }
  player.reset();
};

/**
 * Updates the enemy's position and hitbox if playing a level.
 * @param {number} Time delta
 * @override
 */
Enemy.prototype.update = function(dt) {
  if(currentGameState === GameState.LEVEL) {
    this.move(dt);
    this.hitboxX = this.x;
    this.hitboxY = this.y + 10;
  }
};

/**
 * Entity controlled by user input.
 * @param {number} x, y Coordinates of the sprite which are passed into Entity.
 * @constructor
 * @extends {Entity}
 */
var Player = function(x, y) {
  Entity.call(this, x, y);

  this.originalX = x;
  this.originalY = y;

  this.width = 75;

  this.hitboxX = x + 30;
  this.hitboxY = y + 75;
  this.hitboxWidth = 20;
  this.hitboxHeight = 20;

  this.sprite = 'images/char-princess-girl-cropped.png';

  this.lives = 3;
  this.score = 0;
  this.hasKey = false;
};

Player.prototype = Object.create(Entity.prototype);
Player.prototype.constructor = Player;

/** Handles key input to move the sprite on the screen if playing a level. */
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
    if(currentGameState !== GameState.GAMEWON) {
      currentGameState = GameState.LEVEL;
    } else {
      reset();
    }
  }
};

/**
 * Check to see if the player is colliding with another entity on the screen.
 */
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

  /**
   * Future versions of the game may include more than one key per level, thus
   * the for loop is left intact despite there only being one key per level in
   * this verion.
   */
  for(var k = 0; k < levelKeys.length; k++){
    if(isColliding(levelKeys[k]) === true) {
      levelKeys[k].onCollision();
    }
  }
};

/**
 * Resets the player's position and hitbox. If the player has lost the game, the
 * player's number of lives, score, and hasKey() boolean are reset to defaults
 * as defined in this method. All of this together resets the player.
 */
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

/**
 * Updates the player's hitbox according to the player position. Checks for any
 * collisions the player might have had with enemies, gems, and/or keys
 * according to player's checkCollisions() method. Checks to see if the player
 * had beat the level and/or the entire game.
 * @param {number} Time delta
 * @override
 */
Player.prototype.update = function(dt) {
  this.hitboxX = this.x + 30;
  this.hitboxY = this.y + 75;

  this.checkCollisions();
  checkWinConditions();
};

/**
 * Entity that is stationary and has value when retrieved by player.
 * @param {number} x, y Coordinates of the sprite which are passed into Entity.
 * @constructor
 * @extends {Entity}
 */
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

/**
 * Deletes the gem when the player has collided with it and adds the gems value
 * to player's score.
 */
Gem.prototype.onCollision = function() {
  player.score += this.type;
  gems.splice(gems.indexOf(this), 1);
};

/**
 * Entity that is stationary and allows the player to progress to next level.
 * @param {number} x, y Coordinates of the sprite which are passed into Entity.
 * @constructor
 * @extends {Entity}
 */
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

/**
 * Deletes the key when the player has collided with it and changes hasKey
 * boolean to true, allowing the player to progress to the next level.
 */
LevelKey.prototype.onCollision = function() {
  player.hasKey = true;
  levelKeys.splice(levelKeys.indexOf(this), 1);
};

/**
 * Generates random speeds for an enemy.
 * @param {number} minSpeed Minimum speed at which the Entity will move in a
 *     direction.
 * @param {number} maxSpeed Maximum speed at which the Entity will move in a
 *     direction.
 * @returns {number} Randomly generated speed
 */
function getSpeed(minSpeed, maxSpeed) {
  return Math.random() * (maxSpeed - minSpeed) + minSpeed;
}

/**
 * Generates coordinates for a gem and checks positions of existing gems to
 * ensure they do not have the same coordinates. If the gem's coordinates
 * overlap with the position of an existing gem, new coordinates are generated
 * and the coordinates are checked again.
 */
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

/**
 * Generates coordinates for a key and checks  the positions of gems to ensure
 * the key does do occupy the same space as a gem. If the key's coordinates
 * overlap with the position of a gem, new coordinates are generated and the
 * position is checked again.
 */
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

/** @param {number} dt Delta time */
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

/**
 * Checks to see if the player's hitbox overlaps with the hitbox of a
 * collidable.
 * @param {Object} collidable Entity that another Entity can collide with.
 */
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

/**
 * Creates a new player object, sets the currentGameState to the start menu,
 * resets the level, and sets level to 1. All of this together resets the game.
 */
function reset() {
  this.player = new Player(215, 430);

  level = 1;

  resetLevel();

  this.currentGameState = GameState.STARTMENU;
}

/**
 * Resets the player position, the player's hasKey boolean to false, enemies,
 * gems, and key. Function is called when the player wins or dies.All of this
 * together resets the game.
 */
function resetLevel() {
  player.reset();
  player.hasKey = false;

  enemies = [];
  gems = [];
  levelKeys =[];

  enemies.push(new Enemy(-150, 133));
  enemies.push(new Enemy(-40, 133));
  enemies.push(new Enemy(-180, 216));
  enemies.push(new Enemy(-40, 299));

  for(var gemType in GemTypes) {
    var gemCoords = generateGemCoords();
    gems.push(new Gem(gemCoords[0], gemCoords[1], GemTypes[gemType]));
  }

  var keyCoords = generateKeyCoords();
  levelKeys.push(new LevelKey(keyCoords[0], keyCoords[1]));
}

/**
 * Check if the player has completed the level or beat the entire game. Sets the
 * currentGameState accordingly and resets the level.
 */
function checkWinConditions() {
  if(player.hasKey && player.y < 40) {
    /**
     * Number of levels the player has to beat  has been set to a low number to
     * ensure that Udacity reviewers can quickly the beat the game.
     */
     var finalLevel = 3;

    if(level === finalLevel ) {
      currentGameState = GameState.GAMEWON;
    } else {
      currentGameState = GameState.LEVELTRANSITION;
      level++;
    }

    resetLevel();
  }
}

/**
 * Listens for key presses and passes keys pressed to the player.handleInput()
 * method if player has been defined.
 */
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
