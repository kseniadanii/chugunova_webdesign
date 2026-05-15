import { Game } from "./Game.js";

const canvas = document.querySelector("#gameCanvas");
const hud = {
  score: document.querySelector("#scoreValue"),
  coins: document.querySelector("#coinValue"),
  level: document.querySelector("#levelValue"),
  health: document.querySelector("#healthValue"),
  overlay: document.querySelector("#gameOverlay"),
  overlayTitle: document.querySelector("#overlayTitle"),
  overlayText: document.querySelector("#overlayText"),
  overlayButton: document.querySelector("#overlayButton"),
  startButton: document.querySelector("#startButton"),
  pauseButton: document.querySelector("#pauseButton"),
  restartButton: document.querySelector("#restartButton"),
};

const game = new Game(canvas, hud);
game.init();
