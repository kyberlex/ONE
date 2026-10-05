/**
 * O.N.E. The Living Commons Game — Main Entry Point
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

import { gameState } from './core/state.js';
import { EmbarkationDesk } from './ui/embarkation.js';
import { SettlementCanvas } from './render/settlement_canvas.js';
import { GameHUD } from './ui/hud.js';

console.log('🌱 [O.N.E. Game] Initializing Living Commons Engine...');

// DOM Containers
const embarkationContainer = document.getElementById('embarkation-screen');
const gameWorldContainer = document.getElementById('game-world');

let settlementCanvas = null;
let gameHUD = null;

window.gameState = gameState;

function startLivingPlot(data) {
  // Ensure canvas and HUD overlays exist
  gameWorldContainer.innerHTML = `
    <canvas id="village-canvas"></canvas>
    <div id="hud-overlay"></div>
    <div id="dock-overlay"></div>
  `;

  const canvasEl = document.getElementById('village-canvas');
  const hudEl = document.getElementById('hud-overlay');
  const dockEl = document.getElementById('dock-overlay');

  if (settlementCanvas) {
    settlementCanvas.destroy();
  }

  settlementCanvas = new SettlementCanvas(canvasEl);
  gameHUD = new GameHUD(hudEl, dockEl, settlementCanvas);

  window.settlementCanvas = settlementCanvas;
  window.gameHUD = gameHUD;

  // Initial atmospheric welcome
  setTimeout(() => {
    settlementCanvas.addFloatingText(0, -50, `🌅 Landed on Plot • Day 1 Dawn (06:00)`, '#fbbf24');
    settlementCanvas.addFloatingText(0, -25, `Welcome, Pioneer ${data.player.name}!`, '#38bdf8');
  }, 400);
}

// Auto-resume if already embarked in previous session
if (gameState.data.embarked || gameState.data.day > 1 || (gameState.data.buildings && gameState.data.buildings.length > 1)) {
  console.log('🌱 [O.N.E. Game] Resuming active seed node on Day', gameState.data.day);
  embarkationContainer.classList.remove('active');
  embarkationContainer.classList.add('hidden');
  gameWorldContainer.classList.remove('hidden');
  gameWorldContainer.classList.add('active');
  startLivingPlot(gameState.data);
} else {
  // Initialize Milestone 1: Pioneer Embarkation Desk
  const embarkDesk = new EmbarkationDesk(embarkationContainer, (data) => {
    console.log('✨ [EmbarkationDesk] Embarkation complete. Transitioning to Day 1 plot...');
    gameState.data.embarked = true;
    gameState.save();

    // Smooth cross-fade transition
    embarkationContainer.classList.remove('active');
    embarkationContainer.classList.add('hidden');

    gameWorldContainer.classList.remove('hidden');
    gameWorldContainer.classList.add('active');

    startLivingPlot(data);
  });
}
