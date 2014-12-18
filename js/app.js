// Enemies our player must avoid
var Entity = function(x, y) {
  this.x = x;
  this.y = y;
};

// Update the entity's position, required method for game
// Parameter: dt, a time delta between ticks
Entity.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
};

// Draw the entity on the screen, required method for game
Entity.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Entity.prototype.move = function() {
  this.x += this.speedX;
  this.y += this.speedY;
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Enemy = function(x, y) {
  Entity.call(this, x, y);

  var maxSpeed = 3;
  var minSpeed = 1;

  this.sprite = 'images/enemy-bug.png';

  this.speedX = getSpeed(maxSpeed, minSpeed);
  this.speedY = 0;
};

Enemy.prototype = Object.create(Entity.prototype);
Enemy.prototype.constructor = Enemy;

function getSpeed(minSpeed, maxSpeed) {
  return Math.random() * (maxSpeed - minSpeed) + minSpeed;
}

var Player = function(x, y) {
  Entity.call(this, x, y);

  this.sprite = 'images/char-princess-girl.png';
};

Player.prototype = Object.create(Entity.prototype);
Player.prototype.constructor = Player;

Player.prototype.handleInput = function(key) {
  if (key === 'left') {
    this.x -= 85;
  }

  if (key === 'up') {
    this.y -= 85;
  }

  if (key === 'right') {
    this.x += 85;
  }

  if (key === 'down') {
    this.y += 85;
  }
};

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var player = new Player(200, 380);
var enemies = [];

enemies.push(new Enemy(-100, 50));

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
