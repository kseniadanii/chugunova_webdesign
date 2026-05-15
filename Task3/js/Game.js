import { InputHandler } from "./InputHandler.js";
import { Platform } from "./Platform.js";
import { Player } from "./Player.js";
import { intersects, resolvePlatformCollision } from "./Collision.js";

const STORAGE_KEY = "skyline-runner-progress";

export class Game {
  constructor(canvas, hud) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.hud = hud;
    this.input = new InputHandler();
    this.state = "menu";
    this.frame = 0;
    this.lastTime = 0;
    this.cameraX = 0;
    this.score = 0;
    this.health = 3;
    this.levelIndex = 0;
    this.checkpoint = null;
    this.bestScore = Number(localStorage.getItem(STORAGE_KEY) || 0);

    this.physics = {
      gravity: 0.58,
      acceleration: 0.82,
      friction: 0.82,
      maxSpeed: 6.2,
      jumpPower: 13.8,
      doubleJumpPower: 11.2,
      terminalVelocity: 18,
    };

    this.levels = createLevels();
  }

  init() {
    this.bindUi();
    this.loadLevel(0);
    this.updateHud();
    requestAnimationFrame((time) => this.loop(time));
  }

  bindUi() {
    this.hud.startButton.addEventListener("click", () => this.start());
    this.hud.pauseButton.addEventListener("click", () => this.togglePause());
    this.hud.restartButton.addEventListener("click", () => this.restart());
    this.hud.overlayButton.addEventListener("click", () => this.start());

    window.addEventListener("keydown", (event) => {
      if (event.key.toLowerCase() === "p") this.togglePause();
      if (event.key.toLowerCase() === "r") this.restart();
      if (event.key === "Enter" && this.state !== "playing") this.start();
    });
  }

  start() {
    if (this.state === "win" || this.state === "gameover") {
      this.score = 0;
      this.health = 3;
      this.loadLevel(0);
    }

    this.state = "playing";
    this.hideOverlay();
  }

  togglePause() {
    if (this.state === "playing") {
      this.state = "paused";
      this.showOverlay("Пауза", "Нажмите P или кнопку ниже, чтобы продолжить.", "Продолжить");
      return;
    }

    if (this.state === "paused") {
      this.state = "playing";
      this.hideOverlay();
    }
  }

  restart() {
    this.score = 0;
    this.health = 3;
    this.loadLevel(0);
    this.state = "playing";
    this.hideOverlay();
  }

  loadLevel(index) {
    this.levelIndex = index;
    const level = this.levels[index];
    this.currentLevel = {
      ...level,
      platforms: level.platforms.map((platform) => new Platform(platform)),
      coins: level.coins.map((coin) => ({ ...coin, collected: false, width: 18, height: 18 })),
      enemies: level.enemies.map((enemy) => ({ ...enemy, width: 36, height: 30, direction: 1 })),
      hazards: level.hazards.map((hazard) => ({ ...hazard })),
      portal: { ...level.portal, width: 52, height: 72 },
    };
    this.player = new Player(level.spawn);
    this.checkpoint = { ...level.spawn };
    this.cameraX = 0;
    this.updateHud();
  }

  loop(time) {
    const elapsed = Math.min(32, time - this.lastTime || 16.67);
    const deltaScale = elapsed / 16.67;
    this.lastTime = time;

    if (this.state === "playing") {
      this.update(deltaScale);
    }

    this.draw();
    this.input.clearFramePresses();
    requestAnimationFrame((nextTime) => this.loop(nextTime));
  }

  update(deltaScale) {
    this.frame += 1;
    const level = this.currentLevel;
    this.player.update(this.input, this.physics, level.width, deltaScale);

    for (const platform of level.platforms) {
      resolvePlatformCollision(this.player, platform);
    }

    this.updateEnemies(deltaScale);
    this.collectCoins();
    this.checkHazards();
    this.checkGoal();

    if (this.player.y > this.canvas.height + 170) {
      this.damagePlayer();
    }

    this.cameraX = clamp(
      this.player.x + this.player.width / 2 - this.canvas.width * 0.42,
      0,
      level.width - this.canvas.width,
    );
    this.updateHud();
  }

  updateEnemies(deltaScale) {
    for (const enemy of this.currentLevel.enemies) {
      enemy.x += enemy.speed * enemy.direction * deltaScale;
      if (enemy.x < enemy.minX || enemy.x > enemy.maxX) {
        enemy.direction *= -1;
        enemy.x = clamp(enemy.x, enemy.minX, enemy.maxX);
      }

      if (intersects(this.player, enemy)) {
        const playerBottomBefore = this.player.previousY + this.player.height;
        if (playerBottomBefore <= enemy.y + 8 && this.player.velocityY > 0) {
          enemy.defeated = true;
          this.player.velocityY = -9;
          this.score += 120;
        } else {
          this.damagePlayer();
        }
      }
    }

    this.currentLevel.enemies = this.currentLevel.enemies.filter((enemy) => !enemy.defeated);
  }

  collectCoins() {
    for (const coin of this.currentLevel.coins) {
      if (!coin.collected && intersects(this.player, coin)) {
        coin.collected = true;
        this.score += 100;
      }
    }
  }

  checkHazards() {
    for (const hazard of this.currentLevel.hazards) {
      if (intersects(this.player, hazard)) {
        this.damagePlayer();
      }
    }
  }

  checkGoal() {
    if (!intersects(this.player, this.currentLevel.portal)) return;

    const collected = this.currentLevel.coins.filter((coin) => coin.collected).length;
    this.score += 300 + collected * 25;

    if (this.levelIndex < this.levels.length - 1) {
      this.loadLevel(this.levelIndex + 1);
      return;
    }

    this.state = "win";
    this.saveBestScore();
    this.showOverlay(
      "Победа!",
      `Финальный счет: ${this.score}. Лучший результат: ${this.bestScore}.`,
      "Сыграть снова",
    );
  }

  damagePlayer() {
    const wasHit = this.player.takeHit(this.checkpoint);
    if (!wasHit) return;

    this.health -= 1;
    if (this.health <= 0) {
      this.state = "gameover";
      this.saveBestScore();
      this.showOverlay(
        "Игра окончена",
        `Счет: ${this.score}. Лучший результат: ${this.bestScore}.`,
        "Попробовать снова",
      );
    }
  }

  saveBestScore() {
    this.bestScore = Math.max(this.bestScore, this.score);
    localStorage.setItem(STORAGE_KEY, String(this.bestScore));
  }

  updateHud() {
    const totalCoins = this.currentLevel.coins.length;
    const collectedCoins = this.currentLevel.coins.filter((coin) => coin.collected).length;
    this.hud.score.textContent = String(this.score);
    this.hud.coins.textContent = `${collectedCoins}/${totalCoins}`;
    this.hud.level.textContent = `${this.levelIndex + 1}/${this.levels.length}`;
    this.hud.health.innerHTML = "";

    for (let i = 0; i < 3; i += 1) {
      const heart = document.createElement("span");
      heart.textContent = i < this.health ? "♥" : "♡";
      this.hud.health.append(heart);
    }
  }

  draw() {
    this.drawBackground();
    this.drawPlatforms();
    this.drawHazards();
    this.drawCoins();
    this.drawEnemies();
    this.drawPortal();
    this.player.draw(this.ctx, this.cameraX, this.frame);
  }

  drawBackground() {
    const ctx = this.ctx;
    const { width, height } = this.canvas;
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#78b7e8");
    gradient.addColorStop(0.58, "#d7edf5");
    gradient.addColorStop(1, "#f7d79b");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "rgba(26, 45, 64, 0.22)";
    for (let i = 0; i < 14; i += 1) {
      const x = ((i * 210 - this.cameraX * 0.25) % (width + 260)) - 160;
      const y = 95 + (i % 4) * 42;
      ctx.fillRect(x, y, 88, 18);
      ctx.fillRect(x + 20, y - 34, 52, 34);
    }

    ctx.fillStyle = "rgba(38, 51, 72, 0.18)";
    for (let i = 0; i < 20; i += 1) {
      const x = ((i * 130 - this.cameraX * 0.45) % (width + 170)) - 90;
      ctx.fillRect(x, height - 90 - (i % 5) * 18, 64, 100);
    }
  }

  drawPlatforms() {
    for (const platform of this.currentLevel.platforms) {
      platform.draw(this.ctx, this.cameraX);
    }
  }

  drawCoins() {
    const ctx = this.ctx;
    for (const coin of this.currentLevel.coins) {
      if (coin.collected) continue;

      const pulse = Math.sin((this.frame + coin.x) / 12) * 2;
      const x = coin.x - this.cameraX + coin.width / 2;
      const y = coin.y + coin.height / 2 + pulse;
      ctx.fillStyle = "#ffca5c";
      ctx.beginPath();
      ctx.ellipse(x, y, 9, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
      ctx.fillRect(x - 2, y - 7, 3, 14);
    }
  }

  drawEnemies() {
    const ctx = this.ctx;
    for (const enemy of this.currentLevel.enemies) {
      const x = enemy.x - this.cameraX;
      ctx.fillStyle = "#263348";
      ctx.fillRect(x, enemy.y + 7, enemy.width, enemy.height - 7);
      ctx.fillStyle = "#b7e0f8";
      ctx.fillRect(x + 7, enemy.y + 12, 7, 5);
      ctx.fillRect(x + 22, enemy.y + 12, 7, 5);
      ctx.fillStyle = "#f05a3c";
      ctx.fillRect(x + 4, enemy.y, 28, 7);
    }
  }

  drawHazards() {
    const ctx = this.ctx;
    for (const hazard of this.currentLevel.hazards) {
      const x = hazard.x - this.cameraX;
      ctx.fillStyle = "#cf3d31";
      for (let i = 0; i < hazard.width; i += 18) {
        ctx.beginPath();
        ctx.moveTo(x + i, hazard.y + hazard.height);
        ctx.lineTo(x + i + 9, hazard.y);
        ctx.lineTo(x + i + 18, hazard.y + hazard.height);
        ctx.closePath();
        ctx.fill();
      }
    }
  }

  drawPortal() {
    const ctx = this.ctx;
    const portal = this.currentLevel.portal;
    const x = portal.x - this.cameraX;
    const y = portal.y;
    const pulse = Math.sin(this.frame / 12) * 4;
    ctx.strokeStyle = "#28b487";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.ellipse(x + 26, y + 36, 22 + pulse, 34, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "rgba(40, 180, 135, 0.22)";
    ctx.fillRect(x + 8, y + 9, 36, 56);
  }

  showOverlay(title, text, buttonText) {
    this.hud.overlayTitle.textContent = title;
    this.hud.overlayText.textContent = text;
    this.hud.overlayButton.textContent = buttonText;
    this.hud.overlay.classList.remove("is-hidden");
  }

  hideOverlay() {
    this.hud.overlay.classList.add("is-hidden");
  }
}

function createLevels() {
  return [
    {
      name: "Район крыш",
      width: 2300,
      spawn: { x: 70, y: 350 },
      portal: { x: 2170, y: 318 },
      platforms: [
        { x: 0, y: 492, width: 520, height: 48 },
        { x: 610, y: 448, width: 260, height: 36, color: "#42647f" },
        { x: 940, y: 398, width: 250, height: 36 },
        { x: 1260, y: 460, width: 300, height: 36, color: "#42647f" },
        { x: 1630, y: 410, width: 230, height: 36 },
        { x: 1980, y: 390, width: 310, height: 48, color: "#42647f" },
        { x: 370, y: 355, width: 150, height: 30, color: "#5c7892" },
        { x: 1390, y: 310, width: 160, height: 30, color: "#5c7892" },
      ],
      coins: [
        { x: 390, y: 318 },
        { x: 660, y: 410 },
        { x: 730, y: 410 },
        { x: 1018, y: 360 },
        { x: 1460, y: 272 },
        { x: 1698, y: 372 },
        { x: 2070, y: 350 },
      ],
      enemies: [
        { x: 980, y: 368, minX: 955, maxX: 1135, speed: 1.5 },
        { x: 1325, y: 430, minX: 1280, maxX: 1505, speed: 1.8 },
      ],
      hazards: [
        { x: 520, y: 514, width: 90, height: 26 },
        { x: 870, y: 514, width: 70, height: 26 },
        { x: 1560, y: 514, width: 70, height: 26 },
      ],
    },
    {
      name: "Техно-мост",
      width: 2700,
      spawn: { x: 70, y: 330 },
      portal: { x: 2555, y: 278 },
      platforms: [
        { x: 0, y: 480, width: 390, height: 60 },
        { x: 470, y: 418, width: 180, height: 34 },
        { x: 760, y: 360, width: 210, height: 34, color: "#42647f" },
        { x: 1070, y: 435, width: 280, height: 34 },
        { x: 1470, y: 382, width: 190, height: 34, color: "#42647f" },
        { x: 1780, y: 318, width: 210, height: 34 },
        { x: 2110, y: 430, width: 250, height: 34, color: "#42647f" },
        { x: 2460, y: 350, width: 240, height: 48 },
        { x: 1160, y: 282, width: 120, height: 28, color: "#5c7892" },
      ],
      coins: [
        { x: 515, y: 380 },
        { x: 820, y: 322 },
        { x: 910, y: 322 },
        { x: 1198, y: 244 },
        { x: 1525, y: 344 },
        { x: 1840, y: 280 },
        { x: 2190, y: 392 },
        { x: 2515, y: 312 },
      ],
      enemies: [
        { x: 1110, y: 405, minX: 1085, maxX: 1295, speed: 2 },
        { x: 1815, y: 288, minX: 1790, maxX: 1950, speed: 2.3 },
        { x: 2160, y: 400, minX: 2125, maxX: 2320, speed: 2 },
      ],
      hazards: [
        { x: 390, y: 514, width: 80, height: 26 },
        { x: 650, y: 514, width: 110, height: 26 },
        { x: 970, y: 514, width: 100, height: 26 },
        { x: 1660, y: 514, width: 120, height: 26 },
        { x: 1990, y: 514, width: 120, height: 26 },
      ],
    },
  ];
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
