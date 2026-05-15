export class Player {
  constructor(spawn) {
    this.width = 34;
    this.height = 48;
    this.spawn = { ...spawn };
    this.reset();
  }

  reset() {
    this.x = this.spawn.x;
    this.y = this.spawn.y;
    this.previousX = this.x;
    this.previousY = this.y;
    this.velocityX = 0;
    this.velocityY = 0;
    this.onGround = false;
    this.jumpCount = 0;
    this.facing = 1;
    this.invulnerableTimer = 0;
  }

  update(input, physics, levelWidth, deltaScale) {
    this.previousX = this.x;
    this.previousY = this.y;
    this.onGround = false;

    const movingLeft = input.isDown("a", "A", "ф", "Ф", "ArrowLeft");
    const movingRight = input.isDown("d", "D", "в", "В", "ArrowRight");
    const wantsJump = input.wasPressed("w", "W", "ц", "Ц", "ArrowUp", "Space");

    if (movingLeft) {
      this.velocityX -= physics.acceleration * deltaScale;
      this.facing = -1;
    }

    if (movingRight) {
      this.velocityX += physics.acceleration * deltaScale;
      this.facing = 1;
    }

    if (!movingLeft && !movingRight) {
      this.velocityX *= Math.pow(physics.friction, deltaScale);
    }

    this.velocityX = clamp(this.velocityX, -physics.maxSpeed, physics.maxSpeed);

    if (wantsJump && this.jumpCount < 2) {
      this.velocityY = this.jumpCount === 0 ? -physics.jumpPower : -physics.doubleJumpPower;
      this.jumpCount += 1;
      this.onGround = false;
    }

    this.velocityY += physics.gravity * deltaScale;
    this.velocityY = Math.min(this.velocityY, physics.terminalVelocity);

    this.x += this.velocityX * deltaScale;
    this.y += this.velocityY * deltaScale;
    this.x = clamp(this.x, 0, levelWidth - this.width);

    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= deltaScale;
    }
  }

  takeHit(spawn) {
    if (this.invulnerableTimer > 0) {
      return false;
    }

    this.spawn = { ...spawn };
    this.x = spawn.x;
    this.y = spawn.y;
    this.velocityX = 0;
    this.velocityY = 0;
    this.invulnerableTimer = 90;
    return true;
  }

  draw(ctx, cameraX, frame) {
    const drawX = Math.round(this.x - cameraX);
    const bob = this.onGround ? Math.sin(frame / 7) * 1.2 : 0;
    const blink = this.invulnerableTimer > 0 && Math.floor(frame / 6) % 2 === 0;

    if (blink) return;

    ctx.save();
    ctx.translate(drawX + this.width / 2, this.y + this.height / 2 + bob);
    ctx.scale(this.facing, 1);

    ctx.fillStyle = "#172033";
    ctx.fillRect(-13, -11, 26, 28);
    ctx.fillStyle = "#f05a3c";
    ctx.fillRect(-16, -23, 32, 22);
    ctx.fillStyle = "#ffe0b6";
    ctx.fillRect(-10, -31, 20, 14);
    ctx.fillStyle = "#fff";
    ctx.fillRect(2, -26, 4, 4);
    ctx.fillStyle = "#28b487";
    ctx.fillRect(-16, 17, 11, 9);
    ctx.fillRect(5, 17, 11, 9);
    ctx.restore();
  }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
