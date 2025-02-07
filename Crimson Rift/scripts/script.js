let app;
let keys = {};
let ship;
let bullets = [];
let aliens = [];
let stars = [];
let scoreText;
let score = 0;
let fired = false;

// Asset paths
const ASSETS = {
    ship: 'media/spaceship_small_blue.png',
    bullet: 'media/laser.png',
    alien: 'media/alien.png',
    star: 'media/star.png'
};

// Audio setup
const laser = new Audio('media/newLaser.mp3');
laser.volume = 0.1;

window.onload = async function () {
    const audio = new Audio('media/music.mp3');
    audio.volume = 0.3;
    audio.play();

    // Create application
    app = new PIXI.Application();
    await app.init({ background: '#000', width: 960, height: 540 });

    // Load all assets
    await Promise.all([
        PIXI.Assets.load(ASSETS.ship),
        PIXI.Assets.load(ASSETS.bullet),
        PIXI.Assets.load(ASSETS.alien),
        PIXI.Assets.load(ASSETS.star)
    ]);

    // Canvas setup
    document.querySelector('#game').appendChild(app.canvas);
    app.stage.interactive = true;

    // Ship setup
    ship = PIXI.Sprite.from(ASSETS.ship);
    ship.anchor.set(0.5);
    ship.x = app.screen.width / 2;
    ship.y = app.screen.height / 2;
    app.stage.addChild(ship);

    // Score text setup
    const style = new PIXI.TextStyle({
        fontFamily: 'Tektur',
        fontSize: 36,
        fill: '#fff',
        stroke: { color: '#4a1850', width: 5, join: 'round' },
    });

    scoreText = new PIXI.Text({ text: 'Score: 0', style: style });
    scoreText.x = 30;
    scoreText.y = 30;
    app.stage.addChild(scoreText);

    // Event listeners
    document.addEventListener('keydown', keysDown);
    document.addEventListener('keyup', keysUp);
    document.querySelector('#game').addEventListener('pointerdown', fireBullet);

    // Game loop
    app.ticker.add(gameLoop);

    function createBullet() {
        let firedBullet = PIXI.Sprite.from(ASSETS.bullet);
        firedBullet.anchor.set(0.5);
        firedBullet.position.x = ship.position.x;
        firedBullet.position.y = ship.position.y - 10;
        firedBullet.speed = 5;
        app.stage.addChild(firedBullet);
        return firedBullet;
    }

    function spawnAlien() {
        let alien = PIXI.Sprite.from(ASSETS.alien);
        alien.anchor.set(0.5);
        alien.position.x = randomNum(0, 960);
        alien.position.y = -50; // Ensure offscreen start
        alien.speed = 2;
        app.stage.addChild(alien);
        aliens.push(alien);
    }

    function spawnStar() {
        let star = PIXI.Sprite.from(ASSETS.star);
        star.anchor.set(0.5);
        star.position.x = randomNum(0, 960);
        star.position.y = -30;
        star.speed = 6;
        app.stage.addChild(star);
        stars.push(star);
    }

    function randomNum(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function rectsIntersect(firstObject, secondObject) {
        let aBox = firstObject.getBounds();
        let bBox = secondObject.getBounds();
        return aBox.x + aBox.width > bBox.x &&
            aBox.x < bBox.x + bBox.width &&
            aBox.y + aBox.height > bBox.y &&
            aBox.y < bBox.y + bBox.height;
    }

    function keysDown(e) {
        keys[e.keyCode] = true;
    }

    function keysUp(e) {
        keys[e.keyCode] = false;
        fired = false;
    }

    function fireBullet() {
        let bullet = createBullet();
        laser.play();
        bullets.push(bullet);
    }

    function updateStars() {
        for (let i = stars.length - 1; i >= 0; i--) {
            let star = stars[i];
            star.position.y += star.speed;

            if (star.position.y > 600) {
                app.stage.removeChild(star);
                stars.splice(i, 1);
            }
        }
    }

    function updateGameObjects() {
        // Bullet management
        for (let i = bullets.length - 1; i >= 0; i--) {
            let bullet = bullets[i];
            bullet.position.y -= bullet.speed;

            // Remove bullets out of bounds
            if (bullet.position.y < -40) {
                app.stage.removeChild(bullet);
                bullets.splice(i, 1);
                continue;
            }

            // Collision detection with aliens
            for (let j = aliens.length - 1; j >= 0; j--) {
                let alien = aliens[j];

                if (rectsIntersect(bullet, alien)) {
                    app.stage.removeChild(bullet);
                    app.stage.removeChild(alien);
                    bullets.splice(i, 1);
                    aliens.splice(j, 1);

                    score += 10;
                    scoreText.text = "Score: " + score;
                    break;
                }
            }
        }

        // Alien management
        for (let i = aliens.length - 1; i >= 0; i--) {
            let alien = aliens[i];
            alien.position.y += alien.speed; // Change to positive for downward movement

            // Remove aliens out of bounds
            if (alien.position.y > 600) {
                app.stage.removeChild(alien);
                aliens.splice(i, 1);
            }

            // Ship collision
            if (rectsIntersect(ship, alien)) {
                app.stage.removeChild(alien);
                aliens.splice(i, 1);
                score -= 10;
                scoreText.text = "Score: " + score;
            }
        }
    }

    function gameLoop() {
        // Ship movement
        if (keys['87'] || keys['38']) ship.y -= 3;
        if (keys['65'] || keys['37']) ship.x -= 3;
        if (keys['83'] || keys['40']) ship.y += 3;
        if (keys['68'] || keys['39']) ship.x += 3;

        // Space bar shooting mechanism
        if (keys['32']) {
            if (!fired) {
                fired = true;
                fireBullet();
            }
        }

        // Screen wrap
        if (ship.position.x > 972) ship.position.x = -20;
        if (ship.position.x < -22) ship.position.x = 970;
        if (ship.position.y > 550) ship.position.y = -10;
        if (ship.position.y < -12) ship.position.y = 545;

        // Update game objects
        updateGameObjects();
        updateStars();
    }

    // Spawn intervals
    setInterval(spawnStar, 500);
    setInterval(spawnStar, 720);
    setInterval(spawnStar, 230);
    setInterval(spawnAlien, 1500);
}