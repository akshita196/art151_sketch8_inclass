//SKETCH 8
//COMPLETED BY: Akshita Addepalli
///DATE: 20th november 2026

nn.on("load", () => {

  // KAPLAY SETUP

  kaplay({

    // button setup

    buttons: {
      moveUp: {
        keyboard: ["up", "w"],
        gamepad: ["dpad-up"],
      },
      moveDown: {
        keyboard: ["down", "s"],
        gamepad: ["dpad-down"],
      },
      moveLeft: {
        keyboard: ["left", "a"],
        gamepad: ["dpad-left"],
      },
      moveRight: {
        keyboard: ["right", "d"],
        gamepad: ["dpad-right"],
      },
    },

    // background color
    background: [211, 211, 211]
    // background settings

  });



  // GLOBAL VARIABLES


  const SPEED = 120;
  const JUMP_FORCE = 500;
  const DEADZONE = 0.15;

  let soundEffect;
  let isPlaying = false;
  let bgm;

  let timeLeft = 30;
  let gameScore = 0;

  let spawnSide = "left";

  // remix - goal of 50 for score, and maximum 3 lives
  const SCORE_GOAL = 50;
  let lives = 3;



  // SPRITES

  // player sprite

  loadSprite(
    "player", "assets/player.png",

    // sprite file

    { // sprite animation
      sliceX: 4,
      sliceY: 4,
      anims: {
        forward: {
          from: 0,
          to: 3,
          speed: 5,
          loop: true
        },
        back: {
          from: 4,
          to: 7,
          speed: 10,
          loop: true
        },
        "left": {
          from: 8,
          to: 11,
          speed: 10,
          loop: true
        },
        "right": {
          from: 12,
          to: 15,
          speed: 10,
          loop: true
        },
      },
    }
  );


  // enemy sprite

  loadSprite("chicken", "assets/chicken.png");

  // enemy file

  // collectible sprite

  loadSprite("egg", "assets/egg.png");

  // collectible file



  // AUDIO ASSETS

  loadSound("egg_collect", "assets/pop.mp3");

  // sound file

  loadSound("chicken_hit", "assets/hurt.mp3");

  loadMusic("bg_music", "assets/music.mp3");

  // music file



  // HELPERS

  function playSoundEffect () {

    // sound logic
    if (!isPlaying) {
      isPlaying = true;
      soundEffect = play("egg_collect", {
        volume: 0.04,
      });
      soundEffect.onEnd(() => {
        isPlaying = false;
      })
    }

  }



  function makePlatform (x, y, w, colorValue) {

    add([
      rect(w, 40),
      area(),
      outline(),
      pos(x, y),
      body({
        isStatic: true
      }),
      color(colorValue),
      "platform"
      // platform setup

    ]);

  }



  function spawnCollectible () {

    add([
      sprite("egg"),
      pos(rand(0, width()), rand(0, height())),
      scale(rand(0.5, 1.5)),
      rotate(rand(0, 65)),
      area(),
      anchor("center"),
      "collectible"
      // collectible setup

    ]);

  }



  function spawnEnemy () {

    const enemy = add([
      sprite("chicken"),
      pos(rand(100, width() - 100), rand(100, height() - 100)),
      area(),
      anchor("center"),
      "enemy"
      
      // enemy setup

    ]);
    wait(rand(3, 30), () => {
      if(enemy.exists()) {
        destroy(enemy);
      }
    });
    // enemy timer

  }



  function spawnEnemyWave () {
    const amount = randi(2,5)
    // wave logic
    for (let i = 0; i < amount; i++) {
      spawnEnemy()
    }
  }



  // LVL 1 SCENE

  scene("level1", () => {

    setGravity(640);

    let facing = RIGHT;

    const scoreText = add([
      text(gameScore.toString(), {
        size: 24,
      }),
      pos(24, 24),
      color(BLACK)

      // score display

    ]);

    const timer = add([
      text(timeLeft.toFixed(0)),
      pos(width()-24, 24),
      anchor("topright"),
      color(BLACK)
      // timer display

    ]);

    // remix - display of lives 
    const livesDis = add([
      text("Lives: "+ lives, {
        size: 24,
      }),
      pos(24, 56),
      color(BLACK)
    ]);

    const player = add([
      sprite("player"),
      pos(center()),
      anchor("center"), 
      area(),
      body({
        jumpForce: JUMP_FORCE,
      }),
      doubleJump(),
      // player setup

    ]);
    player.play("forward");
    // LEVEL EXIT

    const levelExit = add([
      rect(10, height()),
      pos(width()-10,0),
      area(),
      color(GREEN),
      "levelExit"
      // exit setup

    ]);

    // PLATFORMS
    makePlatform(0, height()-24, width(), MAGENTA);



    for (let i = 0; i < 5; i++) {

      // random platforms
      makePlatform(
      rand(0, width()-250),
        height()-150 - (i*100),
        rand(50, 230),
        rgb(rand(0,255),0,rand(0,255))
      )
    }



    // COLLECTIBLES

    for (let i = 0; i < 5; i++) {

      spawnCollectible();

    }

    // collectible loop

loop(5, spawnCollectible);

    // ENEMIES

    spawnEnemyWave();

    // enemy loop
loop(15, spawnEnemyWave);


    // CONTROLS

    onButtonDown("moveRight", () => {

      // move right
      player.move(SPEED, 0);
      facing = RIGHT;
        playSoundEffect();
      player.play("right");

    });



    onButtonDown("moveLeft", () => {

      // move left
      player.move(-SPEED, 0);
      facing = LEFT;
        playSoundEffect();
      player.play("left");
    });



    onButtonDown("moveUp", () => {

      // jump logic
      player.doubleJump();
      player.play("forward");
    });



    onButtonDown("moveDown", () => {

      // move down
      player.move(0, -SPEED)
      player.play("back")
    });



    // PROJECTILES

    function shoot () {

      add([
        circle(4),
        color(BLUE),
        pos(player.pos),
        anchor("center"),
        area(),
        move(facing, 500),
        offscreen({
          destroy: true
        }),
        "bullet",
      ]);

    }
    onGamepadButtonPress("south", shoot);
    onKeyPress("f", shoot);
    // shoot controls



    // CAMERA

    // camera follow



    // TIMER & JOYSTICK (ANALOG) MOVEMENT

    onUpdate(() => {

      // movement logic
      const moveDir = getGamepadStick("left");
      if (moveDir.len() > DEADZONE) {
        player.move(moveDir.scale(SPEED));
      }

      // timer logic
      timeLeft -= dt();
      timer.text = timeLeft.toFixed(1);

      // win check
      // remix - win by reaching 50 points
      if (gameScore >= SCORE_GOAL) {
        go("win");
      }

      // lose check
      // remix - lose if timer runs out
      if (timeLeft <= 0) {
        go("lose");
      }

    });



    // COLLISIONS

    player.onCollide("collectible", (item) => {

      // collect logic
      destroy(item);
      play("egg_collect");
      gameScore++;
      scoreText.text = gameScore.toString();

    });



    player.onCollide("enemy", (enemy) => {

      // lose logic
      // remix - lose a life instead of loosing a game
      destroy(enemy);
      play("chicken_hit", {volume: 0.5});
      lives--;
      livesDis.text = "Lives: " + lives;
      if (lives <= 0) {
        go("lose");
      }

    });



    onCollide("bullet", "enemy", (bullet, enemy) => {

      // projectile collision
      destroy(bullet);
      destroy(enemy);
      // remix - when hit chicken
      play("chicken_hit", {volume: 0.5});

      gameScore += 5;
      scoreText.text = gameScore.toString();

    });



    // TRANSITION EFFECT

    const fade = add([

      // fade overlay
      rect(width(), height()),
      pos(0, 0),
      color(BLACK),
      opacity(0),
      fixed(),

    ]);



    player.onCollide("levelExit", () => {

      // level transition
      tween(
        0,
        1,
        0.5,
        (value) => {
          fade.opacity = value;
        },
        easings.linear
      );

      wait(0.5, () => {
        spawnSide = "left";
        go("level2");
      });

    });

  });



  // LVL 2 SCENE

  scene("level2", () => {

    setGravity(640);

    let facing = RIGHT;



    const scoreText = add([
      text(gameScore.toString(), {
        size: 24,
      }),
      pos(24, 24),
      color(BLACK),
      fixed()

      // score display

    ]);



    const timer = add([
      text(timeLeft.toFixed(1)),
      pos(width() - 24, 24),
      anchor("topright"),
      color(BLACK),
      fixed()

      // timer display

    ]);
    
    // remix - lives display
    const livesDis = add([
      text("Lives: "+ lives, {
        size: 24,
      }),
      pos(24, 56),
      color(BLACK),
      fixed() // doesnt move with camera
    ]);



    const player = add([
      sprite("player"),
      pos(spawnSide === "left" ? 150 : width() - 150,
        height() / 2),
      anchor("center"),
      area(),
      body({ jumpForce: JUMP_FORCE, }),
      doubleJump(),

      // player setup

    ]);
    
    player.play("forward");


    const returnExit = add([
      rect(10, height()),
      pos(0, 0),
      area(),
      color(MAGENTA),
      // opacity(0)
      "returnExit"
      // return exit

    ]);



    // PLATFORMS

    makePlatform(
      0,
      height() - 24,
      width(),
      GREEN

      // floor platform

    );



    // random platforms
    for (let i = 0; i < 12; i++) {
      makePlatform(
        rand(0, width() - 300),
        rand(100, height() - 100),
        rand(100, 350),
        rgb(0, rand(100, 255), rand(100, 255))
      );
    }



    // ENEMIES

    spawnEnemyWave();



    // enemy loop
    loop(20, () => {
      spawnEnemyWave();
    });



    // COLLECTIBLES
    for (let i = 0;  i < 5; i++) {
      spawnCollectible();
    }



    // collectible loop
    loop(5, spawnCollectible);



    // CONTROLS
    onButtonDown("moveRight", () => {

      // move right
      player.move(SPEED, 0);
      facing = RIGHT;
      playSoundEffect();
      player.play("right");

    });



    onButtonDown("moveLeft", () => {

      // move left
      player.move(-SPEED, 0);
      facing = LEFT;
      playSoundEffect();
      player.play("left");

    });



    onButtonDown("moveUp", () => {

      player.doubleJump();
      player.play("forward");
      // jump logic

    });



    onButtonDown("moveDown", () => {

      // move down
      player.move(0, -SPEED)
      player.play("back")
    });

    // movement controls



    // PROJECTILES

    function shoot () {

      add([
        circle(4),
        color(YELLOW),
        pos(player.pos),
        area(),
        move(facing, 500),
        offscreen({ destroy: true }),
        "bullet",
        // projectile setup

      ]);

    }
    onGamepadButtonPress("south", shoot);
    onKeyPress("f", shoot);



    // COLLISIONS

    player.onCollide("collectible", (item) => {

      // collect logic
      destroy(item);
      play("egg_collect");
      gameScore++;
      scoreText.text = gameScore.toString();

    });



    player.onCollide("enemy", (enemy) => {

      // lose logic
      // remix - lose a life instead of loosing a game
      destroy(enemy);
      play("chicken_hit", {volume: 0.5});
      lives--;
      livesDis.text = "Lives: " + lives;
      if (lives <= 0) {
        go("lose");
      }

    });



    onCollide("bullet", "enemy", (bullet, enemy) => {

      // projectile collision
      destroy(bullet);
      destroy(enemy);
      // remix - when hit chicken
      play("chicken_hit", {volume: 0.5});

      gameScore += 5;
      scoreText.text = gameScore.toString();

    });



    // CAMERA
    // camera scale
    setCamScale(1.5);

    // camera follow
    player.onUpdate(() => {
      setCamPos(player.pos);
    })



    // TIMER + ANALOG MOVEMENT

    onUpdate(() => {

      // movement logic
      const moveDir = getGamepadStick("left");
      if (moveDir.len() > DEADZONE) {
        player.move(moveDir.scale(SPEED));
      }

      // timer logic
      timeLeft -= dt();

      timer.text = timeLeft.toFixed(1);

      scoreText.text = gameScore.toString();

      // win check
      // remix - win by reaching 50 points
      if (gameScore >= SCORE_GOAL) {
        go("win");
      }

      // lose check
      // remix - lose if timer runs out
      if (timeLeft <= 0) {
        go("lose");
      }
    });



    player.onCollide("returnExit", () => {

      // return transition
      spawnSide = "right";
      go("level1");

    });

  });



  // WIN GAME SCENE

  scene("win", () => {

    add([
      text(`YOU WIN!\nScore:${gameScore}`, {
        size: 32,
      }),
      pos(center()),
      anchor("center"),
      color(BLACK)
      // win text

    ]);



    add([
      text("Press ENTER to play again"),
      pos(center().add(0, 120)),
      anchor("center"),
      color(BLACK)
      // restart text

    ]);



    onKeyPress("enter", () => {

      // reset variables
      gameScore = 0;
      timeLeft = 30;
      // remix - resetting lives
      lives = 3;
      // restart game
      go("level1");
    });

  });



  //LOSE GAME SCENE

  scene("lose", () => {

    add([
      // showing attained score after loosing
      text("YOU LOSE \n Score: " + gameScore, {
        size: 48,
      }),
      color(BLACK),
      pos(center()),
      anchor("center"),
      // lose text

    ]);



    add([
      text("Press ENTER to try again"),
      pos(center().add(0, 80)),
      anchor("center"),
      color(BLACK),
      // restart text

    ]);



    onKeyPress("enter", () => {

      // reset variables
      gameScore = 0;
      timeLeft = 30;
      // remix - resetting lives
      lives = 3;
      // restart game
      go("level1");

    });

  });



  // START MUSIC ONCE LOADED

  onLoad(() => {

    // music start
    bgm = play("bg_music", {
      loop: true,
      volume: 0.5,
    });

  });



  onKeyPress("space", () => {

    // music toggle
    bgm.paused = !bgm.paused;

  });



  // RESET GAME 

  go("level1");

});

