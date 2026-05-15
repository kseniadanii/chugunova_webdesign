export class Platform {
  constructor({ x, y, width, height, color = "#35516e" }) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
  }

  draw(ctx, cameraX) {
    const drawX = Math.round(this.x - cameraX);
    ctx.fillStyle = this.color;
    ctx.fillRect(drawX, this.y, this.width, this.height);
    ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
    ctx.fillRect(drawX, this.y, this.width, 5);
  }
}
