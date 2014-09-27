
$(document).ready(function () {
    $("#restart").click(function () {
        $("#divrestart").hide();
        window.location.reload();
    });
});
gameLoad = function () {
    $levelText = $("#alevel");
    var height =400, width = 800;
    var game = new Core(width, height);
    game.fps = 15;
    game.preload("chara.png", "bg.png", "monsters.png", "man.png", "icon0.png", "gunshot.wav", "stuck.wav", "blast.gif");
    game.score = 0;
    game.enemyinhouse = 0;
    game.enemiesRemove = 0;
    game.level = 1;
    game.runspeed = 5;
    var enemies = new Array();
    game.onload = function () {
        var tochEnable = false, gameLevelRunning = true, gameEnemyGenerated = 0;
        backgroundLoad();
        var man = new Sprite(32, 48);
        man.image = game.assets["man.png"];
        man.x = 0;
        man.y = height - 80; ;
        man.frame = 28;
        game.rootScene.addChild(man);
        var lifecount = 0;
        var life1 = new Life();
        life1.x = 4;
        var life2 = new Life();
        life2.x = 21;
        var life3 = new Life();
        life3.x = 37;

        var label = Label();
        label.x = 10;
        label.y = 20;
        label.font = "italic bold 15px/30px Georgia, serif";
        game.rootScene.addChild(label);
        man.addEventListener("enterframe", function () {
            for (var i in enemies) {
                if (enemies[i].intersect(this)) {
                    enemies[i].remove(i);
                    lifecount++;
                }
            }
            if (lifecount == 3)
                life1.remove();
            else if (lifecount == 2)
                life2.remove();
            else if (lifecount == 1)
                life3.remove();

            if (lifecount >= 3) {
                game.end();
                $("#divrestart").show();
            }
        });

        game.rootScene.addEventListener('touchstart', function (e) {
            tochEnable = true;
            man.x = e.x;
            man.y = e.y;
        });
        game.rootScene.addEventListener('touchmove', function (e) {
            man.x = e.x;
            man.y = e.y;
        });
        game.rootScene.addEventListener('touchend', function (e) {
            tochEnable = false;
        });
        var scoreLabel = new ScoreLabel(60, 6);
        game.rootScene.addChild(scoreLabel);
        game.rootScene.addEventListener("enterframe", function () {
            label.text = "Level - " + game.level;
            scoreLabel.score = game.score;
            if (game.frame % 10 == 0 && gameLevelRunning) {
                var enemyobj;
                var selection = rand(3);
                if (selection == 0)
                    enemyobj = new EnemyGost();
                else if (selection == 1)
                    enemyobj = new EnemySkull();
                else if (selection == 2)
                    enemyobj = new EnemyDragon();
                gameEnemyGenerated++;
                enemyobj.key = game.frame;
                enemies[game.frame] = enemyobj;
                if (gameEnemyGenerated >= 50)
                    gameLevelRunning = false;
            }

            if (game.enemiesRemove >= 50 && !gameLevelRunning) {
                if (game.level >= 3) {
                    game.end();
                    $("#divrestart").show();
                } else {
                    game.stop();
                    $("#divresume").show();
                    game.level += 1;
                    $levelText.text("Level-" + game.level);
                    $("#resume").click(function () {
                        game.resume();
                        $("#divresume").hide();
                        game.fps += 3;
                        game.enemiesRemove = 0;
                        gameLevelRunning = true;
                        game.enemyinhouse = 0;
                        gameEnemyGenerated = 0;
                        game.runspeed += 5;
                    });
                }
            }

            if (tochEnable) {
                var bullet = new Bullets();
                bullet.x = man.x;
                bullet.y = man.y;
                game.assets["gunshot.wav"].play();
            }

            if (game.enemyinhouse >= 20) {
                game.end();
                $("#divrestart").show();
            }
        });
    };

    var Life = enchant.Class.create(enchant.Sprite, {
        initialize: function () {
            enchant.Sprite.call(this, 16, 16);
            this.image = game.assets['icon0.png'];
            this.x = 0;
            this.y = 2;
            this.frame = 10;
            game.rootScene.addChild(this);
        }
    });

    var Bullets = enchant.Class.create(enchant.Sprite, {
        initialize: function () {
            enchant.Sprite.call(this, 16, 16);
            this.image = game.assets['icon0.png']; // set image
            this.frame = 56;                   // set image data
            game.rootScene.addChild(this);     // add to canvas

            this.addEventListener("enterframe", function (e) {
                this.y -= 30;
                if (this.y <= 0)
                    this.remove();
                for (var i in enemies) {
                    if (enemies[i].intersect(this)) {
                        var blast = new Blast();
                        blast.x = enemies[i].x;
                        blast.y = enemies[i].y;
                        this.remove();
                        enemies[i].remove();
                        game.score += 10;
                        game.assets["stuck.wav"].play();
                    }
                }
            });
        }
    });

    var Blast = enchant.Class.create(enchant.Sprite, {
        initialize: function () {
            enchant.Sprite.call(this, 16, 16);
            this.image = game.assets['blast.gif']; // set image
            this.frame = 56;                   // set image data
            game.rootScene.addChild(this);     // add to canvas

            this.addEventListener("enterframe", function () {
                if (this.age % 4 == 0) {
                    this.frame = 4;
                    this.remove();
                }
                this.frame = 3;
            });
        }
    });

    var EnemyGost = enchant.Class.create(enchant.Sprite, {
        initialize: function () {
            enchant.Sprite.call(this, 32, 32);
            this.image = game.assets["monsters.png"];
            this.y = 0;
            this.x = rand(width - 50);
            this.frame = 0;
            this.addEventListener("enterframe", function () {
                this.frame = this.age % 2 + 13;
                this.y += game.runspeed;
                if (this.y > height - 32) {
                    this.remove();
                    game.enemyinhouse++;
                }
            });
            game.rootScene.addChild(this);
        },
        remove: function () {
            game.rootScene.removeChild(this);
            game.enemiesRemove++;
            delete enemies[this.key];
        }
    });

    var EnemySkull = enchant.Class.create(enchant.Sprite, {
        initialize: function () {
            enchant.Sprite.call(this, 32, 32);
            this.image = game.assets["monsters.png"];
            this.y = 0;
            this.x = rand(width - 10);
            this.frame = 11;
            this.addEventListener("enterframe", function () {
                this.frame = this.age % 2 + 13;
                this.y += game.runspeed;
                if (this.y > height - 32) {
                    this.remove();
                    game.enemyinhouse++;
                }
            });
            game.rootScene.addChild(this);
        },
        remove: function () {
            game.rootScene.removeChild(this);
            game.enemiesRemove++;
            delete enemies[this.key];
        }
    });

    var EnemyDragon = enchant.Class.create(enchant.Sprite, {
        initialize: function () {
            enchant.Sprite.call(this, 32, 32);
            this.image = game.assets["monsters.png"];
            this.y = 0;
            this.x = rand(width - 10);
            this.frame = 24;
            this.addEventListener("enterframe", function () {
                this.frame = this.age % 2 + 1;
                this.y += game.runspeed;
                if (this.y > height - 32) {
                    this.remove();
                    game.enemyinhouse++;
                }
            });
            game.rootScene.addChild(this);
        },
        remove: function () {
            game.rootScene.removeChild(this);
            game.enemiesRemove++;
            delete enemies[this.key];
        }
    });

    //Load background Image
    backgroundLoad = function () {
        var map = new Map(16, 16);
        map.image = game.assets['bg.png'];
        map.loadData(gettiles(16));
        game.rootScene.addChild(map);
    }


    gettiles = function (size) {
        var widthtiles = parseInt((game.width / size)) + (game.width % size == 0 ? 0 : 1);
        var heighttiles = parseInt((game.height / size)) + (game.height % size == 0 ? 0 : 1);
        var tiles = [];
        for (var row = 0; row < heighttiles; row++) {
            var temp = [];
            for (var col = 0; col < widthtiles; col++) {
                temp.push(0);
            }
            tiles.push(temp);
        }

        return tiles;
    }

    function rand(num) {
        return Math.floor(Math.random() * num);
    }
    game.start();
};