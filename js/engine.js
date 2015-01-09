/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine is available globally via the Engine variable and it also makes
 * the canvas' context (ctx) object globally available to make writing app.js
 * a little simpler to work with.
 */

var Engine = (function(global) {
  var doc = global.document,
      win = global.window,
      canvas = doc.createElement('canvas'),
      ctx = canvas.getContext('2d'),
      lastTime;

  canvas.width = 505;
  canvas.height = 606;
  doc.body.appendChild(canvas);

  function main() {

    var now = Date.now(),
    dt = (now - lastTime) / 1000.0;

    update(dt);
    render();

    lastTime = now;

    win.requestAnimationFrame(main);
  }

  function init() {
    reset();
    lastTime = Date.now();
    main();
  }

  function update(dt) {
    updateEntities(dt);
  }

  function updateEntities(dt) {
    enemies.forEach(function(enemy) {
      enemy.update(dt);
    });
    player.update(dt);
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var rowImages = [
      'images/stone-block.png',   // Row 1 of 4 of stone
      'images/stone-block.png',   // Row 2 of 4 of stone
      'images/stone-block.png',   // Row 3 of 4 of stone
      'images/stone-block.png',   // Row 4 of 4 of stone
      'images/grass-block.png',   // Row 1 of 2 of grass
      'images/grass-block.png'    // Row 2 of 2 of grass
    ],
    numRows = 6,
    numCols = 5,
    row, col;

    for (row = 0; row < numRows; row++) {
      for (col = 0; col < numCols; col++) {
        ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
      }
    }

    ctx.drawImage(Resources.get('images/portcullis-frame.png'), 0, 8);

    if(!player.hasKey) {
      ctx.drawImage(Resources.get('images/portcullis-gate.png'), 0, 8);
    }

    if(currentGameState === GameState.LEVEL) {
      drawKeysNeeded();

      drawPlayerLife();
      drawPlayerScore();
      drawPlayerKeys();
    }

    renderEntities();

    if(currentGameState === GameState.STARTMENU) {
      drawStartMenu();
    }
    if(currentGameState === GameState.LEVELTRANSITION) {
      drawLevelTransitionScreen();
    }
    if(currentGameState === GameState.GAMEWON) {
      drawWinScreen();
    }
    if(currentGameState === GameState.GAMEOVER) {
      drawGameOverMenu();
    }
  }

  function renderEntities() {
    enemies.forEach(function(enemy) {
      enemy.render();
    });

    gems.forEach(function(gem) {
      gem.render();
    });

    levelKeys.forEach(function(key) {
      key.render();
    });

    player.render();
  }

  function drawStartMenu() {
    ctx.fillStyle = 'rgba(0, 153, 76, 0.95)';
    ctx.fillRect(0, 0, canvas.width, canvas.height - 20);

    ctx.font = 'bold 44px Lucida Console';
    ctx.fillStyle = 'rgb(240, 240, 240)';
    ctx.textAlign = 'center';
    ctx.fillText('Megafun Castle Adventure', canvas.width/2 , 150, canvas.width - 100);

    ctx.strokeStyle = 'rgb(66, 66, 66)';
    ctx.lineWidth = 3;
    ctx.strokeText('Megafun Castle Adventure', canvas.width/2 , 150, canvas.width - 100);

    ctx.font = 'bold 32px Lucida Console';
    ctx.fillText('Press "ENTER" to begin your quest!', canvas.width/2 , 475, canvas.width - 100);

    ctx.font = 'normal 14px Lucida Console';
    ctx.fillText('Despite the protests of her father, princess', canvas.width/2 , 240, canvas.width - 100);
    ctx.fillText('Celia wants nothing more than to become a fletcher.', canvas.width/2 , 260, canvas.width - 100);
    ctx.fillText('Embark on the quest of a lifetime to help her sneak back', canvas.width/2 , 300, canvas.width - 100);
    ctx.fillText('into the castle after her secret fletching lessons.', canvas.width/2 , 320, canvas.width - 100);
  }

  function drawLevelTransitionScreen() {
    ctx.fillStyle = 'rgba(178, 102, 255, 0.95)';
    ctx.fillRect(0, 0, canvas.width, canvas.height - 20);

    ctx.font = 'bold 48px Lucida Console';
    ctx.fillStyle = 'rgb(240, 240, 240)';
    ctx.textAlign = 'center';
    ctx.fillText('Level Up!', canvas.width/2 , 150, canvas.width - 100);

    ctx.strokeStyle = 'rgb(66, 66, 66)';
    ctx.lineWidth = 3;
    ctx.strokeText('Level Up!', canvas.width/2 , 150, canvas.width - 100);

    ctx.font = 'bold 32px Lucida Console';
    ctx.fillText('Press "ENTER" to continue on your quest!', canvas.width/2 , 400, canvas.width - 100);
  }

  function drawWinScreen() {
    ctx.fillStyle = 'rgba(153, 204, 255, 0.95)';
    ctx.fillRect(0, 0, canvas.width, canvas.height - 20);

    ctx.font = 'bold 48px Lucida Console';
    ctx.fillStyle = 'rgb(240, 240, 240)';
    ctx.textAlign = 'center';
    ctx.fillText('You won!', canvas.width/2 , 175, canvas.width - 100);

    ctx.strokeStyle = 'rgb(66, 66, 66)';
    ctx.lineWidth = 3;
    ctx.strokeText('You won!', canvas.width/2 , 175, canvas.width - 100);

    ctx.font = 'normal 12px Lucida Console';
    ctx.fillStyle = 'rgb(22, 22, 22)';
    ctx.fillText('You successfully help the princess complete', canvas.width/2 , 240, canvas.width - 100);
    ctx.fillText('her apprenticeship. She can now follow her dreams!', canvas.width/2 , 255, canvas.width - 100);

    ctx.font = 'bold 24px Lucida Console';
    ctx.fillText('Press "ENTER" to restart the game!', canvas.width/2 , 400, canvas.width - 100);
  }

  function drawGameOverMenu() {
    ctx.fillStyle = 'rgba(66, 66, 66, 0.9)';
    ctx.fillRect(0, 0, canvas.width, canvas.height - 20);

    ctx.font = 'bold 46px Lucida Console';
    ctx.fillStyle = 'rgb(240, 240, 240)';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width/2 , 150, canvas.width - 100);

    ctx.font = 'normal 16px Lucida Console';
    ctx.fillText('You were caught and have been grounded for a fortnight.', canvas.width/2 , 300, canvas.width - 100);

    ctx.font = 'bold 32px Lucida Console';
    ctx.fillText('Press "ENTER" to try again!', canvas.width/2 , 475, canvas.width - 100);
  }

  function drawPlayerLife() {
    for(var i = 0; i < player.lives; i++) {
      ctx.drawImage(Resources.get('images/heart-resized.png'), player.x  + (player.width / 2) + (15 * i) - (6 * player.lives), player.y - 15);
    }
  }

  function drawKeysNeeded() {
    ctx.drawImage(Resources.get('images/key-hud-icon.png'), canvas.width - 30, 12);
    var myImageData = ctx.getImageData(canvas.width - 30, 12, canvas.width, 33);

    for(var i = 0; i < myImageData.data.length/4; i++) {
      var r = myImageData.data[i*4];
      var g = myImageData.data[i*4 + 1];
      var b = myImageData.data[i*4 + 2];
      var a = myImageData.data[i*4 + 3];

      var grayValue = (r + g + b) / 3;

      myImageData.data[i*4] = grayValue;
      myImageData.data[i*4 + 1] = grayValue;
      myImageData.data[i*4 + 2] = grayValue;
      myImageData.data[i*4 + 3] = grayValue;
    }

    ctx.putImageData(myImageData, canvas.width - 30, 12);
  }

  function drawPlayerKeys() {
    if (player.hasKey) {
      ctx.drawImage(Resources.get('images/key-hud-icon.png'), canvas.width - 30, 12);
    }
  }

  function drawPlayerScore() {
    ctx.fillStyle = 'rgba(66, 66, 66, 0.8)';
    ctx.font = 'bold 20px Lucida Console';
    ctx.textAlign = 'left';
    ctx.fillText('Score: ' + player.score, 5, 32);
  }

  Resources.load([
    'images/stone-block.png',
    'images/water-block.png',
    'images/grass-block.png',
    'images/enemy-bug-cropped.png',
    'images/char-princess-girl-cropped.png',
    'images/gem-green-resized.png',
    'images/gem-blue-resized.png',
    'images/gem-orange-resized.png',
    'images/key-cropped.png',
    'images/key-hud-icon.png',
    'images/heart-resized.png',
    'images/portcullis-frame.png',
    'images/portcullis-gate.png'
  ]);
  Resources.onReady(init);

  global.ctx = ctx;
  global.canvas = canvas;

})(this);
