import './styles/main.css';
import Phaser from 'phaser';
import { createGameConfig } from './game/config';
import { isPortrait } from './game/utils/helpers';

const gameContainer = document.getElementById('game-container');

if (!gameContainer) {
  throw new Error('Game container element not found');
}

const game = new Phaser.Game(createGameConfig(gameContainer));

function updateRotateOverlay(): void {
  const overlay = document.getElementById('rotate-overlay');
  if (!overlay) return;

  const showOverlay = isPortrait() && isMobileDevice();
  overlay.classList.toggle('rotate-overlay--visible', showOverlay);
  overlay.setAttribute('aria-hidden', showOverlay ? 'false' : 'true');
}

function isMobileDevice(): boolean {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

updateRotateOverlay();
window.addEventListener('resize', updateRotateOverlay);
window.addEventListener('orientationchange', updateRotateOverlay);

export default game;
