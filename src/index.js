// SCENE =====================================================================================

function Scene(screen, controls) {
    this.canvas = screen.canvas;
    this.ctx = this.canvas.getContext('2d');
    this.controls = controls;
    this.images = screen.images;
}

// LIB =====================================================================================

function Lib(screen, controls) {
    Scene.apply(this, arguments);

    this.assets = [
        {name: 'orc', path: 'src/images/orc.png'},
        {name: 'player', path: 'src/images/player.png'},
        {name: 'sceleton', path: 'src/images/sceleton.png'},
        {name: 'bg', path: 'src/images/tiles.png'},
        {name: 'title', path: 'src/images/title.jpg'}
    ];

    this.total = this.assets.length;
    this.loaded = 0;
    this.status = 'loading';
    this.loadedAt = 0;

    var _this = this;

    for (var i = 0; i < this.total; i++) {
        // DOM object <Image>
        var image = new Image();

        image.onload = function() {
            _this.loaded++;
        };

        image.src = _this.assets[i].path;
        screen.images[_this.assets[i].name] = image;
    }


}

Lib.prototype = Object.create(Scene.prototype);
Lib.prototype.constructor = Lib;
Lib.prototype.render = function(time) {
    if (this.status === 'loading') {
        if (this.loaded === this.total) {
            this.status = 'loaded';
            this.loadedAt = time;
        }

        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '22px Georgia';
        this.ctx.fillText('Loading' + this.loaded + '/' + this.total, 50, 70);

        return 'lib';
    }

    if (this.status === 'loaded') {
        if((time - this.loadedAt) > 1000) {
            return 'menu';
        } else {
            return 'lib';
        }
    }
};

// WIN =====================================================================================

function Win(screen, controls) {
    Scene.apply(this, arguments);
}

Win.prototype = Object.create(Scene.prototype);
Win.prototype.constructor = Win;
Win.prototype.render = function(time) {
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = '#fff';
    this.ctx.fint = '22px Georgia';
    this.ctx.fillText('You won!', 50, 70);

    return 'Win';
};

// MENU =====================================================================================

function Menu(screen, controls) {
    Scene.apply(this, arguments);
};

Menu.prototype = Object.create(Scene.prototype);
Menu.prototype.constructor = Menu;
Menu.prototype.render = function(time) {
    this.ctx.drawImage(this.images['title'], 0, 0, 640, 640, 0, 0, 640, 640);
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '22px Arial';
    this.ctx.fillText('Click space', 250, 500);

    if (this.controls.states['fire']) {
        return 'game';
    } else {
        return 'menu';
    }
};

// GAME =====================================================================================

function Game(screen, controls) {
    Scene.apply(this, arguments);

    this.camera = new Camera(0, 0, this);
    this.player = new Player(100, -64, this);
    this.monster = new Player(896, 128, this);
    this.monster.type = 'monster';
    this.monster.status = 'walking';
    this.sounds = {};
    this.sounds['arrow'] = new Sound('src/sounds/arrow.wav');
    this.sounds['sword'] = new Sound('src/sounds/sword.wav');

    this.map = [
        [3 ,20,22,3 ,3 ,3 ,3 ,1 ,1 ,3 ,3 ,14,3 ,0 ,3 ,3 ,0 ,3 ,15,3],
        [3 ,20,22,3 ,3 ,0 ,1 ,17,19,1 ,3 ,14,17,18,18,18,18,19,15,3],
        [3 ,20,22,3 ,3 ,0 ,0 ,20,22,0 ,3 ,14,23,24,24,24,24,25,15,3],
        [3 ,20,22,3 ,0 ,0 ,1 ,23,25,1 ,3 ,8 ,6 ,6 ,6 ,6 ,16,6 ,7 ,3],
        [3 ,20,22,0 ,0 ,3 ,3 ,1 ,1 ,3 ,3 ,13,5 ,5 ,5 ,5 ,16,5 ,9 ,3],
        [3 ,20,22,3 ,3 ,3 ,3 ,3 ,3 ,3 ,3 ,12,10,10,10,10,16,10,11,3],
        [3 ,20,22,3 ,3 ,2 ,0 ,2 ,0 ,3 ,3 ,0 ,2 ,0 ,4 ,0 ,0 ,0 ,2 ,3],
        [3 ,20,28,18,18,18,18,18,18,18,18,18,18,18,18,18,18,19,0 ,3],
        [3 ,23,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,25,3 ,3],
        [3 ,2 ,3 ,3 ,3 ,3 ,3 ,3 ,2 ,3 ,3 ,3 ,3 ,3 ,3 ,3 ,0 ,3 ,3 ,3],
        [3 ,0 ,0 ,0 ,0 ,0 ,0 ,3 ,0 ,3 ,17,18,18,19,0 ,0 ,2 ,0 ,0 ,1],
        [3 ,3 ,3 ,3 ,3 ,3 ,3 ,3 ,0 ,3 ,20,26,27,22,2 ,3 ,0 ,0 ,1 ,3],
        [3 ,0 ,0 ,0 ,0 ,0 ,0 ,0 ,0 ,0 ,20,28,29,22,0 ,0 ,3 ,0 ,0 ,3],
        [3 ,1 ,1 ,0 ,1 ,1 ,1 ,1 ,1 ,1 ,23,24,24,25,0 ,2 ,0 ,0 ,4 ,3],
        [3 ,1 ,0 ,0 ,0 ,0 ,0 ,0 ,0 ,1 ,0 ,0 ,0 ,3 ,0 ,0 ,0 ,1 ,0 ,3],
        [3 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ,0 ,1 ,0 ,0 ,0 ,0 ,0 ,3 ,0 ,0 ,0 ,1],
        [3 ,1 ,0 ,0 ,0 ,0 ,0 ,0 ,0 ,1 ,2 ,2 ,0 ,1 ,0 ,0 ,0 ,2 ,0 ,1],
        [3 ,1 ,1 ,1 ,1 ,0 ,1 ,1 ,1 ,1 ,0 ,1 ,17,18,18,18,18,18,18,18],
        [3 ,0 ,0 ,0 ,0 ,0 ,0 ,0 ,0 ,0 ,0 ,1 ,23,24,24,24,24,24,24,24],
        [3 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ,1]
    ];

    this.tiles = [
        {j : 0, i : 0, walk: true},  //0 - grass
        {j : 1, i : 0, walk: false}, //1 - stone
        {j : 2, i : 0, walk: true},  //2 - plant
        {j : 3, i : 0, walk: false}, //3 - tree
        {j : 4, i : 0, walk: true},  //4 - flowers
        {j : 5, i : 0, walk: false}, //5 - wall
        {j : 6, i : 0, walk: false}, //6 - top wall
        {j : 7, i : 0, walk: false}, //7 - top wall with r end
        {j : 8, i : 0, walk: false}, //8 - top wall with l end
        {j : 9, i : 0, walk: false}, //9 - wall with r end
        {j : 5, i : 1, walk: false}, //10 - bottom-wall
        {j : 6, i : 1, walk: false}, //11 - bottom-wall with r-end
        {j : 7, i : 1, walk: false}, //12 - bottom-wall with l-end
        {j : 8, i : 1, walk: false}, //13 - wall with l end
        {j : 9, i : 1, walk: true}, //14 - top-grass with l-end
        {j : 9, i : 2, walk: true}, //15 - top-grass with r-end
        {j : 8, i : 2, walk: true}, //16 - stairs
        {j : 0, i : 1, walk: true}, //17 - sand in grass b-r
        {j : 1, i : 1, walk: true}, //18 - sand in grass b
        {j : 2, i : 1, walk: true}, //19 - sand in grass b-l
        {j : 0, i : 2, walk: true}, //20 - sand in grass r
        {j : 1, i : 2, walk: true}, //21 - sand
        {j : 2, i : 2, walk: true}, //22 - sand in grass l
        {j : 0, i : 3, walk: true}, //23 - sand in grass u-r
        {j : 1, i : 3, walk: true}, //24 - sand in grass u
        {j : 2, i : 3, walk: true}, //25 - sand in grass u-l
        {j : 3, i : 1, walk: true}, //26 - gras in sand b-r
        {j : 4, i : 1, walk: true}, //27 - gras in sand b-l
        {j : 3, i : 2, walk: true}, //28 - gras in sand u-r
        {j : 4, i : 2, walk: true} //29 - gras in sand u-l
    ];

    this.arrows = [];
}

Game.prototype = Object.create(Scene.prototype);
Game.prototype.constructor = Game;
Game.prototype.renderBg = function(time) {
    var startCol = Math.floor(this.camera.x / 64);
    var startRow = Math.floor(this.camera.y / 64);

    for (var i = startRow; i < (startRow + 11); i++) {
        for (var j = startCol; j < (startCol + 11); j++) {
            if (j < 20 && i < 20) {
                var tile = this.tiles[this.map[i][j]];

                this.ctx.drawImage(this.images['bg'], tile.j * 64, tile.i *64, 64, 64, (j * 64) - this.camera.x, (i * 64) - this.camera.y, 64, 64);
            }
        }
    }
};
Game.prototype.renderSprites = function(time) {
    this.player.update(time);
    this.monster.update(time);
    this.camera.update(time);

    // render monster
    this.ctx.drawImage(this.images['orc'], this.monster.j * 64, this.monster.i *64, 64, 64, (this.monster.x) - this.camera.x, (this.monster.y) - this.camera.y, 64, 64);

    // render player
    this.ctx.drawImage(this.images['player'], this.player.j * 64, this.player.i *64, 64, 64, (this.player.x) - this.camera.x, (this.player.y) - this.camera.y, 64, 64);

    // render arrows
    for (var i = this.arrows.length; i > 0; i--) {
        if (this.arrows[i - 1].active === false) {
            this.arrows.splice(i - 1, 1);
        }
    }

    for (var j = 0; j < this.arrows.length; j++) {
        this.arrows[j].update(time);
        this.ctx.drawImage(this.images['player'], this.arrows[j].j * 64, this.arrows[j].i * 64, 64, 64, (this.arrows[j].x) - this.camera.x, (this.arrows[j].y) - this.camera.y, 64, 64);
    }
};
Game.prototype.render = function(time) {
    this.ctx.fillStyle = '#fff';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.renderBg(time);
    this.renderSprites(time);

    if (this.monster.dead && this.player.x > 1152 && this.player.y > 1100) {
        return 'win';
    } else {
        return 'game';
    }
};

//  CAMERA =====================================================================================

function Camera(x, y, scene) {
    this.x = x;
    this.y = y;
    this.w = 640;
    this.h = 640;
    this.scene = scene;
}

Camera.prototype.update = function(time) {
    if ((this.scene.player.x - this.x) < 200) {
        this.x = this.scene.player.x  - 200;
    }

    if ((this.scene.player.x - this.x) > 440) {
        this.x = this.scene.player.x  - 440;
    }

    if (this.x < 0) this.x = 0;
    if (this.x > 640) this.x = 640;


    if ((this.scene.player.y - this.y) < 200) {
        this.y = this.scene.player.y  - 200;
    }

    if((this.scene.player.y - this.y) > 440) {
        this.y = this.scene.player.y  - 440;
    }

    if (this.x < 0) this.x = 0;
    if (this.x > 640) this.x = 640;

    if (this.y < 0) this.y = 0;
    if (this.y > 640) this.y = 640;
};

//  ARROW =====================================================================================

function Arrow(x, y, direction, scene) {
    this.active = true;
    this.x = x;
    this.y = y;
    this.scene = scene;
    this.speed = 10;
    this.direction = direction;
    this.sprites = {
        right: [10, 0],
        left: [9, 0],
        up: [11, 0],
        down: [12, 0]
    };
    this.j = this.sprites[direction][0];
    this.i = this.sprites[direction][1];
}

Arrow.prototype.update = function(time) {
    this.move();
};
Arrow.prototype.move = function() {
    var newX = this.x;
    var newY = this.y;

    if(this.direction === "right" ) newX += this.speed;
    if(this.direction === "left" ) newX -= this.speed;
    if(this.direction === "up" ) newY -= this.speed;
    if(this.direction === "down" ) newY += this.speed;


    if(this.isHit(newX, newY)) {
        this.active = false;

        return true;
    } else {
        this.x = newX;
        this.y = newY;
    }
};
Arrow.prototype.isHit = function(x, y) {
    var posX = x;
    var posY = y;

    if (this.direction === "right" ) { posX += 64; posY += 32; }
    if (this.direction === "left" ) {posY += 32; }
    if (this.direction === "up" ) { posX += 32;  }
    if (this.direction === "down" ) { posX += 32; posY += 64; }

    if(posX < 0 || posX > 1280 || posY < 0 || posY > 1280) {
        return true;
    }

    var j = Math.floor(posX / 64);
    var i = Math.floor(posY / 64);

    if ((posX > this.scene.monster.x) &&
        (posX < (this.scene.monster.x + 64)) &&
        (posY > this.scene.monster.y) &&
        (posY < (this.scene.monster.y + 64)))
    {
        this.scene.monster.setAction("down", "dead");

        return true;
    }
    return	!this.scene.tiles[this.scene.map[i][j]].walk;
};

//  LIB =====================================================================================

function Player(x, y, scene) {
    this.x = x;
    this.y = y;
    this.i = 0;
    this.j = 0;
    this.type = "player";
    this.scene = scene;
    this.dead = false;
    this.lastTime = 0;
    this.speed = 3;
    this.direction = "down";
    this.status = "start";
    this.changeAnimation = true;
    this.currentAnimationFrame = 0;
    this.currentAction = this.moveDown;
    this.gotObstacle = false;
    this.sprites = {
        standing: {
            right: {
                total: 1,
                frames: [[0,3]]
            },
            left: {
                total: 1,
                frames: [[0,1]]
            },
            up: {
                total: 1,
                frames: [[0,0]]
            },
            down: {
                total: 1,
                frames: [[0,2]]
            }
        },
        walking: {
            right: {
                total: 9,
                frames: [[0,11],[1,11],[2,11],[3,11],[4,11],[5,11],[6,11],[7,11],[8,11]]
            },
            left: {
                total: 9,
                frames: [[0,9],[1,9],[2,9],[3,9],[4,9],[5,9],[6,9],[7,9],[8,9]]
            },
            up: {
                total: 9,
                frames: [[0,8],[1,8],[2,8],[3,8],[4,8],[5,8],[6,8],[7,8],[8,8]]
            },
            down: {
                total: 9,
                frames: [[0,10],[1,10],[2,10],[3,10],[4,10],[5,10],[6,10],[7,10],[8,10]]
            }
        },
        start: {
            down: {
                total: 9,
                frames: [[0,10],[1,10],[2,10],[3,10],[4,10],[5,10],[6,10],[7,10],[8,10]]
            }
        },
        dead: {
            down: {
                total: 6,
                frames: [[0,20],[1,20],[2,20],[3,20],[4,20],[5,20]]
            }
        },
        fire: {
            right: {
                total: 13,
                frames: [[0,19],[1,19],[2,19],[3,19],[4,19],[5,19],[6,19],[7,19],[8,19],[9,19],[10,19],[11,19],[12,19]]
            },
            left: {
                total: 13,
                frames: [[0,17],[1,17],[2,17],[3,17],[4,17],[5,17],[6,17],[7,17],[8,17],[9,17],[10,17],[11,17],[12,17]]
            },
            up: {
                total: 13,
                frames: [[0,16],[1,16],[2,16],[3,16],[4,16],[5,16],[6,16],[7,16],[8,16],[9,16],[10,16],[11,16],[12,16]]
            },
            down: {
                total: 13,
                frames: [[0,18],[1,18],[2,18],[3,18],[4,18],[5,18],[6,18],[7,18],[8,18],[9,18],[10,18],[11,18],[12,18]]
            }
        },
        attack: {
            right: {
                total: 6,
                frames: [[0,15],[1,15],[2,15],[3,15],[4,15],[5,15]]
            },
            left: {
                total: 6,
                frames: [[0,13],[1,13],[2,13],[3,13],[4,13],[5,13]]
            },
            up: {
                total: 6,
                frames: [[0,12],[1,12],[2,12],[3,12],[4,12],[5,12]]
            },
            down: {
                total: 6,
                frames: [[0,14],[1,14],[2,14],[3,14],[4,14],[5,14]]
            }
        }

    };
}

Player.prototype.animate = function() {
    var frame = this.sprites[this.status][this.direction];

    if(this.dead) {
        return true;
    }

    if(this.changeAnimation) {
        this.changeAnimation = false;
        this.currentAnimationFrame = 0;
    } else {
        if(frame.total > 1) {
            this.currentAnimationFrame++;
            if( (this.currentAnimationFrame + 1) === frame.total ) {
                if(this.status === "start" || this.status === "walking" || this.status === "attack") {
                    this.currentAnimationFrame = 0;
                }

                if(this.status === "dead") {
                    this.currentAnimationFrame = 5;
                    this.dead = true;
                }

                if(this.status === "fire") {
                    this.currentAnimationFrame = 0;
                    this.setAction(this.direction, "standing");
                    this.scene.arrows.push(new Arrow(this.x, this.y, this.direction, this.scene));
                    this.scene.sounds['arrow'].play();
                }
            }
        }
    }


    this.j = frame.frames[this.currentAnimationFrame][0];
    this.i = frame.frames[this.currentAnimationFrame][1];
};
Player.prototype.setAction = function(direction, status) {
    if (this.direction !== direction) {
        this.direction = direction;
        this.changeAnimation = true;
    }

    if (this.status !== status) {
        this.status = status;
        this.changeAnimation = true;
    }
};
Player.prototype.isWalkable = function(x, y) {
    if(x < 0 ) {
        this.gotObstacle = true;

        return false;
    }

    if(y < 0) {
        this.gotObstacle = true;

        return false;
    }

    var x1 = x;
    var x2 = x + 64;
    var y1 = y;
    var y2 = y + 64;

    x1 = x1 + 20;
    x2 = x2 - 20;
    y1 = y1 + 20;
    y2 = y2 - 10;

    var j1 = Math.floor((x1) / 64);
    var j2 = Math.floor((x2) / 64);
    var i1 = Math.floor((y1) / 64);
    var i2 = Math.floor((y2) / 64);

    var walkable = true;

    for(var i = i1; i <= i2; i++) {
        for(var j = j1; j <= j2; j++) {
            if(!this.scene.tiles[this.scene.map[i][j]].walk) {
                walkable = false;
            }
        }
    }

    this.gotObstacle = !walkable;

    return walkable;
};
Player.prototype.moveLeft = function() {
    this.setAction('left', 'walking');

    if( this.isWalkable(this.x - this.speed, this.y) ) {
        this.x = this.x - this.speed;
        if(this.x < 0) {
            this.x = 0;
        }
    }
};
Player.prototype.moveRight = function() {
    this.setAction('right', 'walking');

    if( this.isWalkable(this.x + this.speed, this.y) ) {
        this.x = this.x + this.speed;
        if(this.x > 1216) {
            this.x = 1216;
        }
    }
};
Player.prototype.moveUp = function() {
    this.setAction('up', 'walking');

    if(this.isWalkable( this.x, this.y - this.speed) ) {
        this.y = this.y - this.speed;
        if(this.y < 0) {
            this.y = 0;
        }
    }
};
Player.prototype.moveDown = function() {
    this.setAction('down', 'walking');

    if(this.isWalkable(this.x, this.y + this.speed)) {
        this.y = this.y + this.speed;
        if(this.y > 1216) {
            this.y = 1216;
        }
    }
};
Player.prototype.fire = function() {
    this.setAction(this.direction, 'fire');
};
Player.prototype.attack = function() {
    this.setAction(this.direction, 'attack');
};
Player.prototype.start = function() {
    if (this.y < 100) {
        this.y = this.y + this.speed;
    } else {
        this.setAction('down', 'standing');
    }
};
Player.prototype.update = function(time) {
    this.animate();
    if(this.status === "start") {
        this.start();
        return true;
    }

    if(this.status === "fire") {
        return true;
    }

    if(this.status === "dead") {
        return true;
    }

    if(this.type === "monster") {
        return this.monsterAiControll(time);
    }

    if(this.scene.controls.states['fire']) {
        this.fire();
        return true;
    }

    if(this.scene.controls.states['left']) {
        this.moveLeft();
        return true;
    }

    if(this.scene.controls.states['right']) {
        this.moveRight();
        return true;
    }

    if(this.scene.controls.states['forward']) {
        this.moveUp();
        return true;
    }

    if(this.scene.controls.states['backward']) {
        this.moveDown();
        return true;
    }

    this.setAction(this.direction,"standing");
};
Player.prototype.monsterAiControll = function(time) {
    if((this.scene.player.dead === false) &&
        (this.scene.player.x < this.x + 64 &&
            this.scene.player.x + 64 > this.x &&
            this.scene.player.y < this.y + 64 &&
            64 + this.scene.player.y > this.y))
    {
        // tactical jump
        if(this.x > this.scene.player.x) {
            this.direction = 'left';
            this.y = this.scene.player.y;
            this.x = this.scene.player.x + 32;
        } else {
            this.direction = 'right';
            this.y = this.scene.player.y;
            this.x = this.scene.player.x - 32;
        }

        this.attack();
        this.scene.sounds['sword'].play();
        this.scene.player.setAction('down', 'dead');

        return true;
    }


    if((this.gotObstacle) || ((time - this.lastTime) > 3000 )) {
        var actions = [this.moveLeft, this.moveRight, this.moveUp, this.moveDown];

        this.currentAction = actions[Math.floor(Math.random() * actions.length)];
        this.lastTime = time;
    }

    this.currentAction();

    return true;
};

//  SOUND =====================================================================================

function Sound(src) {
    this.sound = document.createElement('audio');
    this.sound.src = src;
    this.sound.setAttribute('preload', 'auto');
    this.sound.setAttribute('controls', 'none');
    this.sound.style.display = 'none';

    document.body.appendChild(this.sound);
}

Sound.prototype.play = function() {
    this.sound.play();
};
Sound.prototype.stop = function() {
    this.sound.pause();
};

//  CONTROLS =====================================================================================

function Controls() {
    this.codes  = {37: 'left', 39: 'right', 38: 'forward', 40: 'backward', 32: 'fire'};
    this.states = {'left': false, 'right': false, 'forward': false, 'backward': false, 'fire' : false};

    document.addEventListener('keydown', this.onKey.bind(this, true), false);
    document.addEventListener('keyup', this.onKey.bind(this, false), false);
}

Controls.prototype.onKey = function(val, e) {
    var state = this.codes[e.keyCode];

    if (typeof state === 'undefined') return;

    this.states[state] = val;

    e.preventDefault && e.preventDefault();
    e.stopPropagation && e.stopPropagation();
};

//  GAMELOOP =====================================================================================

function GameLoop() {
    this.frame = this.frame.bind(this);
    this.lastTime = 0;
    this.callback = function() {};
}

GameLoop.prototype.start = function(callback) {
    this.callback = callback;

    requestAnimationFrame(this.frame);
};
GameLoop.prototype.frame = function(time) {
    if((time - this.lastTime) > 30) {
        this.lastTime = time;
        this.callback(time);
    }

    requestAnimationFrame(this.frame);
};

//  OTHER =====================================================================================

var controls = new Controls();

var screen = {};
screen.canvas = document.getElementById('app');
screen.canvas.width = 640;
screen.canvas.height = 640;
screen.images = {};
var loop = new GameLoop();

var scenes = {};
scenes['lib'] = new Lib(screen, controls);
scenes['menu'] = new Menu(screen, controls);
scenes['game'] = new Game(screen, controls);
scenes['win'] = new Win(screen, controls);

var currentScene = 'lib';

loop.start(function frame(time) {
    currentScene = scenes[currentScene].render(time);
});

//  END =====================================================================================
