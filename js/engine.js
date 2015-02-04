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
  /* Predefine the variables we'll be using within this scope,
   * create the canvas element, grab the 2D context for that canvas
   * set the canvas elements height/width and add it to the DOM.
   */
  var doc = global.document,
      win = global.window,
      canvas = doc.createElement('canvas'),
      ctx = canvas.getContext('2d'),
      lastTime;

  canvas.width = 505;
  canvas.height = 606;
  doc.body.appendChild(canvas);

  /* This function serves as the kickoff point for the game loop itself
   * and handles properly calling the update and render methods.
   */
  function main() {
    /** Get time delta information to allow for smooth animation. */
    var now = Date.now(),
    dt = (now - lastTime) / 1000.0;

    update(dt);
    render();

    lastTime = now;

    /* Use the browser's requestAnimationFrame function to call this
     * function again as soon as the browser is able to draw another frame.
     */
    win.requestAnimationFrame(main);
  }

  /* This function does some initial setup that should only occur once,
   * particularly setting the lastTime variable that is required for the
   * game loop.
   */
  function init() {
    reset();
    lastTime = Date.now();
    main();
  }

  /* This function is called by main (our game loop) and itself calls all
   * of the functions which may need to update entity's data. Based on how
   * you implement your collision detection (when two entities occupy the
   * same space, for instance when your character should die), you may find
   * the need to add an additional function call here. For now, we've left
   * it commented out - you may or may not want to implement this
   * functionality this way (you could just implement collision detection
   * on the entities themselves within your app.js file).
   */
  function update(dt) {
    updateEntities(dt);
  }

  /* This is called by the update function  and loops through all of the
   * objects within your enemies array as defined in app.js and calls
   * their update() methods. It will then call the update function for your
   * player object. These update methods should focus purely on updating
   * the data/properties related to  the object. Do your drawing in your
   * render methods.
   */
  function updateEntities(dt) {
    enemies.forEach(function(enemy) {
      enemy.update(dt);
    });
    player.update(dt);
  }

  /* This function initially draws the "game level", it will then call
   * the renderEntities function. Remember, this function is called every
   * game tick (or loop of the game engine) because that's how games work -
   * they are flipbooks creating the illusion of animation but in reality
   * they are just drawing the entire screen over and over.
   */
  function render() {
    /** Clear the canvas before redrawing. */
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    /* This array holds the relative URL to the image used for that particular
     * row of the game level.
     */
    var rowImages = [
      'images/stone-block.png',
      'images/stone-block.png',
      'images/stone-block.png',
      'images/stone-block.png',
      'images/grass-block.png',
      'images/grass-block.png'
    ],
    numRows = 6,
    numCols = 5,
    row, col;

    /* Loop through the number of rows and columns we've defined above
     * and, using the rowImages array, draw the correct image for that
     * portion of the "grid"
     */
    for (row = 0; row < numRows; row++) {
      for (col = 0; col < numCols; col++) {
        /* The drawImage function of the canvas' context element
         * requires 3 parameters: the image to draw, the x coordinate
         * to start drawing and the y coordinate to start drawing.
         * We're using our Resources helpers to refer to our images
         * so that we get the benefits of caching these images, since
         * we're using them over and over.
         */
        ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
      }
    }

    /** Draw the porcullis fram. */
    ctx.drawImage(Resources.get('images/portcullis-frame.png'), 0, 8);

    /** Draw the porcullis gate if the player does not have the key */
    if(!player.hasKey) {
      ctx.drawImage(Resources.get('images/portcullis-gate.png'), 0, 8);
    }

    /* Draw the player's life, represented in hearts, score, and keys
     * needed/possessed if playing a level.
     */
    if(currentGameState === GameState.LEVEL) {
      drawKeysNeeded();

      drawPlayerLife();
      drawPlayerScore();
      drawPlayerKeys();
    }

    renderEntities();

    /* Draws appropriate transition screen over top of level map based on the
     * currentGameState.
     */
    switch (currentGameState) {
      case GameState.STARTMENU:
        drawStartMenu();
        break;
      case GameState.LEVELTRANSITION:
        drawLevelTransitionScreen();
        break;
      case GameState.GAMEWON:
        drawWinScreen();
        break;
      case GameState.GAMEOVER:
        drawGameOverMenu();
        break;
    }
  }

  /* This function is called by the render function and is called on each game
   * tick. It's purpose is to then call the render functions you have defined
   * on your enemy and player entities within app.js
   */
  function renderEntities() {
    /**
     * Loop through all of the objects within the enemies array and call
     * the render function that is defined.
     */
    enemies.forEach(function(enemy) {
      enemy.render();
    });

    /* Loop through all of the objects within the gems array and call
     * the render function you have defined.
     */
    gems.forEach(function(gem) {
      gem.render();
    });

    /* Loop through all of the objects within the levelKeys array and call
     * the render function you have defined.
     */
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

    ctx.font = 'normal 12px Lucida Console';
    ctx.fillText('Despite the protests of your parents, the king and', canvas.width/2 , 220, canvas.width - 100);
    ctx.fillText('queen, you want nothing more than to become a fletcher.', canvas.width/2 , 240, canvas.width - 100);
    ctx.fillText('Having started a secret, night apprenticeship with the', canvas.width/2 , 260, canvas.width - 100);
    ctx.fillText('royal fletcher you still have one problem holding you back —', canvas.width/2 , 280, canvas.width - 100);
    ctx.fillText('sneaking back into your room before your parents notice!', canvas.width/2 , 300, canvas.width - 100);

    ctx.font = 'bold 14px Lucida Console';
    ctx.fillText('Objective: Sneak back into the castle after', canvas.width/2 , 340, canvas.width - 100);
    ctx.fillText('your apprenticeship. Be sure to avoid the beetles!', canvas.width/2 , 360, canvas.width - 100);
  }

  function drawLevelTransitionScreen() {
    ctx.fillStyle = 'rgba(178, 102, 255, 0.95)';
    ctx.fillRect(0, 0, canvas.width, canvas.height - 20);

    ctx.font = 'bold 48px Lucida Console';
    ctx.fillStyle = 'rgb(240, 240, 240)';
    ctx.textAlign = 'center';
    ctx.fillText('Success!', canvas.width/2 , 150, canvas.width - 100);

    ctx.strokeStyle = 'rgb(66, 66, 66)';
    ctx.lineWidth = 3;
    ctx.strokeText('Success!', canvas.width/2 , 150, canvas.width - 100);

    ctx.font = 'bold 32px Lucida Console';
    ctx.fillText('Press "ENTER" to continue on your quest!', canvas.width/2 , 475, canvas.width - 100);
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
    ctx.fillText('You successfully helped the princess complete', canvas.width/2 , 240, canvas.width - 100);
    ctx.fillText('her apprenticeship. Her parents, moved by her passion', canvas.width/2 , 255, canvas.width - 100);
    ctx.fillText('and new found skills in fletching, have come to accept and', canvas.width/2 , 270, canvas.width - 100);
    ctx.fillText('encourage princess Celia to open her own fletching business.', canvas.width/2 , 285, canvas.width - 100);

    ctx.fillText('From all the gems found lying about, Celia has', canvas.width/2 , 310, canvas.width - 100);
    ctx.fillText('with which to start her business!', canvas.width/2 , 370, canvas.width - 100);

    ctx.font = 'bold 20px Lucida Console';
    ctx.fillText(player.score + ' gold pieces', canvas.width/2 , 345, canvas.width - 100);

    ctx.font = 'bold 24px Lucida Console';
    ctx.fillText('Press "ENTER" to restart the game!', canvas.width/2 , 475, canvas.width - 100);
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
    ctx.fillText('Press "ENTER" to play again!', canvas.width/2 , 475, canvas.width - 100);
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

  /* Go ahead and load all of the images we know we're going to need to
   * draw our game level. Then set init as the callback method, so that when
   * all of these images are properly loaded our game will start.
   */
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

  /** Make the ctx and canvas variables avaiable globally. */
  global.ctx = ctx;
  global.canvas = canvas;

})(this);
