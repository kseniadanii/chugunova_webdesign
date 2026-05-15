export class InputHandler {
  constructor() {
    this.keys = new Set();
    this.justPressed = new Set();

    window.addEventListener("keydown", (event) => {
      const key = this.normalize(event.key);
      if (!this.keys.has(key)) {
        this.justPressed.add(key);
      }
      this.keys.add(key);

      if (["ArrowLeft", "ArrowRight", "ArrowUp", "Space"].includes(key)) {
        event.preventDefault();
      }
    });

    window.addEventListener("keyup", (event) => {
      this.keys.delete(this.normalize(event.key));
    });
  }

  normalize(key) {
    if (key === " ") return "Space";
    return key;
  }

  isDown(...keys) {
    return keys.some((key) => this.keys.has(key));
  }

  wasPressed(...keys) {
    return keys.some((key) => this.justPressed.has(key));
  }

  clearFramePresses() {
    this.justPressed.clear();
  }
}
