    const gameScreen = document.getElementById("game");
    const game = gameScreen.getContext('2d');
    const playerSprite = new Image();
    playerSprite.src = "birdSprite.png";
    const pipeSprite = new Image();
    pipeSprite.src = "pipe.png";
    const background = new Image();
    background.src = "sky.png";
    const audio = new Audio("cn.mp3");
    let gameOver = false;
    let score = 0;

    const player = {
        Left: false,
        x: 20,
        y: 20,
        width: 16,
        height: 16,
        vX: 0,
        vY: 0,
        fY: 20,
        fG: 1.01,
        playerSpeed: 3,
        jumping: false,
        jumped: false,
        frameIndex: 3,
        numFrames: 10,
        frameTime: 0,
        frameSpeed: 6,
        get top() {return this.y;},
        get bottom() {return this.y + this.height;},
        get left() {return this.x;},
        get right() {return this.x + this.width;},

        Update() {
            this.x += this.vX;
            this.y += this.vY;
            this.vY += this.fG;
            if (player.vY > 20) {player.vY = 20;}
            if (player.vY < -20) {player.vY = -20;}
            
            if (inputs['ArrowLeft']) {
                if (!this.Left) {
                    this.Left = true;
                }
                this.vX = -this.playerSpeed;
            }
            else if (inputs['ArrowRight']) {
                if (this.Left) {
                    this.Left = false;
                }
                this.vX = this.playerSpeed
            }
            else {
                this.vX *= 0.8;
                if (this.vX < 0.1) {
                    this.vX = 0;
                }
            }
            if (inputs[" "] && !this.jumped) {
                if (!this.jumping) {
                    this.vY = -this.fY;
                    this.jumping = true;
                }
            }
            if (!inputs[" "]) {
                this.jumped = false;
            }

            if (this.x < 0) {this.x = 0;}
            if (this.x + this.width > gameScreen.width) {this.x = gameScreen.width - this.width;}
            if (this.y <= 0 || this.y + this.height >= gameScreen.height) {
                gameOver = true;
            }

            this.frameTime++;
            if (this.jumping) { // Jumping
                this.frameIndex = this.Left ? 8 : 9;
            }
            else if (this.vX !== 0) { // Running
                if (this.frameTime >= this.frameSpeed) {
                    this.frameTime = 0;
                    this.frameIndex = (this.Left) ? (this.frameIndex + 1) % 3 : 5 + ((this.frameIndex - 5 + 1) % 3);
                }
            }
            else { // Standing
                this.frameIndex = this.Left ? 3 : 4;
            }
        }
    }

    const inputs = {};
    document.addEventListener('keydown', (event) => {inputs[event.key] = true;});
    document.addEventListener('keyup', (event) => {inputs[event.key] = false;});

    let pipes = [];

    const CreatePipes = (posY) => {
        const space = 80;
        const spacePos = Math.random() * (gameScreen.width - space);
        return {
            y: posY,
            spacePos,
            width: 480,
            height: 60,
            speed: 1,
            get top() {return this.y;},
            get bottom() {return this.y + this.height;},

            Update() {
                this.y += this.speed;
                if (this.y > gameScreen.height) {
                    this.y = -90;
                    this.spacePos = Math.random() * (gameScreen.width - 80);
                    score++;
                }
            },

            CheckCollision() {
                if (player.vY >= 0 && player.bottom > this.top && player.top < this.bottom) {
                    if (player.right > 0 && player.left < this.spacePos) {
                        if (player.bottom >= this.top && player.bottom <= this.top + player.vY) {
                            player.y = this.top - player.height;
                            player.vY = 0;
                            player.jumping = false;
                        }
                    }
                    if (player.left < gameScreen.width && player.right > this.spacePos + 80) {
                        if (player.bottom >= this.top && player.bottom <= this.top + player.vY) {
                            player.y = this.top - player.height;
                            player.vY = 0;
                            player.jumping = false;
                        }
                    }
                }
                if (player.vY < 0 && player.top + player.vY <= this.bottom && player.bottom + player.vY > this.top && ((player.right > 0 && player.left < this.spacePos) || (player.left < gameScreen.width && player.right > this.spacePos + 80))) {
                    player.y = this.bottom;
                    player.vY = 0;
                } 
            }
        };
    }

    for (let i = 0; i < 5; i++) {
        pipes.push(CreatePipes(i * -150));
    }

    const Draw = () => {
        game.clearRect(0, 0, gameScreen.width, gameScreen.height);
        game.drawImage(background, 0, 0, gameScreen.width, gameScreen.height);
        player.Update();
        game.drawImage(playerSprite, player.frameIndex * player.width, 0, player.width, player.height, player.x, player.y, player.width, player.height);
        pipes.forEach((pipe) => {
            pipe.Update();
            game.drawImage(pipeSprite, 0, pipe.y, pipe.spacePos, pipe.height);
            game.drawImage(pipeSprite, pipe.spacePos + 80, pipe.y, gameScreen.width - pipe.spacePos - 80, pipe.height);
            pipe.CheckCollision();
        });
        game.fillStyle = "white";
        game.font = "16px monospace";
        game.fillText("Score: " + score, 50, 20);
        if (!gameOver) {
            requestAnimationFrame(Draw);
        }
        else {
            audio.play();
            alert("You were involved in a workplace accident resulting in your death by natural causes. Your family was too busy praising the CCP to arrange your funeral and thus your corpse was harvested for the good of the Party.");
        }
    }

    pipes.forEach((pipe) => {pipe.y += 200});
    Draw();
    