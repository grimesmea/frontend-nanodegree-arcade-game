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
    /* Get our time delta information which is required if your game
     * requires smooth animation. Because everyone's computer processes
     * instructions at different speeds we need a constant value that
     * would be the same for everyone (regardless of how fast their
     * computer is) - hurray time!
     */
    var now = Date.now(),
    dt = (now - lastTime) / 1000.0;

    /* Call our update/render functions, pass along the time delta to
     * our update function since it may be used for smooth animation.
     */
    update(dt);
    render();

    /* Set our lastTime variable which is used to determine the time delta
     * for the next time this function is called.
     */
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
   * objects within your allEnemies array as defined in app.js and calls
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
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    /* This array holds the relative URL to the image used
     * for that particular row of the game level.
     */
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
    if(currentGameState === GameState.GAMEOVER) {
      drawGameOverMenu();
    }
  }

  /* This function is called by the render function and is called on each game
   * tick. It's purpose is to then call the render functions you have defined
   * on your enemy and player entities within app.js
   */
  function renderEntities() {
    /* Loop through all of the objects within the allEnemies array and call
     * the render function you have defined.
     */
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
    ctx.fillStyle = 'rgba(195, 35, 57, 0.95)';
    ctx.fillRect(0, 0, canvas.width, canvas.height - 20);

    ctx.font = 'bold 40px Verdana';
    ctx.fillStyle = 'rgb(240, 240, 240)';
    ctx.textAlign = 'center';
    ctx.fillText('Megafun Castle Adventure:', canvas.width/2 , 150, canvas.width - 100);

    ctx.strokeStyle = 'rgb(66, 66, 66)';
    ctx.lineWidth = 3;
    ctx.strokeText('Megafun Castle Adventure:', canvas.width/2 , 150, canvas.width - 100);

    ctx.font = 'bold 32px Verdana';
    ctx.fillText('Press "ENTER" to being your quest!', canvas.width/2 , 475, canvas.width - 100);

    ctx.font = 'normal 16px Verdana';
    ctx.fillText('A quest to help a young princess find her place in the world', canvas.width/2 , 200, canvas.width - 100);

    ctx.font = 'normal 12px Verdana';
    ctx.fillStyle = 'rgb(22, 22, 22)';
    ctx.fillText('Despite the protests of her father, princess Celia wants', canvas.width/2 , 240, canvas.width - 100);
    ctx.fillText('nothing more than to become a fletcher. Help her sneak back into', canvas.width/2 , 255, canvas.width - 100);
    ctx.fillText('the castle after her secret fletching lessons.', canvas.width/2 , 270, canvas.width - 100);
  }

  function drawLevelTransitionScreen() {
    ctx.fillStyle = 'rgba(94, 7, 245, 0.95)';
    ctx.fillRect(0, 0, canvas.width, canvas.height - 20);

    ctx.font = 'bold 44px Verdana';
    ctx.fillStyle = 'rgb(240, 240, 240)';
    ctx.textAlign = 'center';
    ctx.fillText('Level Up!', canvas.width/2 , 250, canvas.width - 100);

    ctx.strokeStyle = 'rgb(66, 66, 66)';
    ctx.lineWidth = 3;
    ctx.strokeText('Level Up!', canvas.width/2 , 250, canvas.width - 100);

    ctx.font = 'bold 32px Verdana';
    ctx.fillText('Press "ENTER" to continue on your quest!', canvas.width/2 , 400, canvas.width - 100);
  }

  function drawGameOverMenu() {
    ctx.fillStyle = 'rgba(66, 66, 66, 0.9)';
    ctx.fillRect(0, 0, canvas.width, canvas.height - 20);

    ctx.font = 'bold 46px Verdana';
    ctx.fillStyle = 'rgb(240, 240, 240)';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width/2 , 150, canvas.width - 100);

    ctx.font = 'normal 16px Verdana';
    ctx.fillText('You were caught and have been grounded for a fortnight.', canvas.width/2 , 300, canvas.width - 100);

    ctx.font = 'bold 32px Verdana';
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
    ctx.font = 'bold 20px Verdana';
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

  /* Assign the canvas' context object and dt property to the global variable (the window
   * object when run in a browser) so that developer's can use it more easily
   * from within their app.js files.
   */
  global.ctx = ctx;
  global.canvas = canvas;

})(this);
