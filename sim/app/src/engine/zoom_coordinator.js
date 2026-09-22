/**
 * Discrete 4-Level Zoom Orchestrator (Agent SIM-0 & SIM-2)
 * Coordinates transitions between 4 discrete view levels:
 * - LEVEL 0 (WORLD): Global planetary Earth view (Leaflet zoom 3)
 * - LEVEL 1 (REGION): Bioregional watershed view centered on active node (Leaflet zoom 9)
 * - LEVEL 2 (NODE): 2D Bioclimatic settlement village canvas (overview)
 * - LEVEL 3 (BUILDING): Architectural interior cutaway view of facility/dwelling
 *
 * Provides discrete step zoom on +/- buttons, segmented pills, and 2-finger pinch / wheel snapping.
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

export const ZOOM_LEVELS = {
  WORLD: 0,
  REGION: 1,
  NODE: 2,
  BUILDING: 3
};

export const ZOOM_LEVEL_NAMES = {
  0: 'WORLD',
  1: 'REGION',
  2: 'NODE',
  3: 'BUILDING'
};

export class ZoomCoordinator {
  constructor(options = {}) {
    this.currentLevel = options.initialLevel ?? ZOOM_LEVELS.NODE;
    this.onLevelChange = options.onLevelChange || (() => {});
    this.getActiveNode = options.getActiveNode || (() => null);

    // Gesture debouncing / quantization accumulator
    this.accumulatedDelta = 0;
    this.deltaThreshold = 50; // threshold for wheel / pinch step
    this.cooldownUntil = 0;
    this.cooldownDurationMs = 380; // minimum ms between discrete level jumps

    this.bindDom();
  }

  bindDom() {
    // Zoom in buttons
    const btnZoomInHeader = document.getElementById('btn-zoom-in');
    const btnZoomInFloat = document.getElementById('btn-float-zoom-in');

    // Zoom out buttons
    const btnZoomOutHeader = document.getElementById('btn-zoom-out');
    const btnZoomOutFloat = document.getElementById('btn-float-zoom-out');

    if (btnZoomInHeader) {
      btnZoomInHeader.addEventListener('click', () => this.zoomIn());
    }
    if (btnZoomInFloat) {
      btnZoomInFloat.addEventListener('click', () => this.zoomIn());
    }

    if (btnZoomOutHeader) {
      btnZoomOutHeader.addEventListener('click', () => this.zoomOut());
    }
    if (btnZoomOutFloat) {
      btnZoomOutFloat.addEventListener('click', () => this.zoomOut());
    }

    // Segmented level pills
    const segmentButtons = document.querySelectorAll('.zoom-segment-btn');
    segmentButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetLevel = parseInt(btn.dataset.level, 10);
        if (!isNaN(targetLevel)) {
          this.setLevel(targetLevel);
        }
      });
    });

    this.updateUi();
  }

  getCurrentLevel() {
    return this.currentLevel;
  }

  setLevel(level, targetEntity = null, force = false) {
    const clamped = Math.max(ZOOM_LEVELS.WORLD, Math.min(ZOOM_LEVELS.BUILDING, level));
    if (!force && clamped === this.currentLevel && !targetEntity) return;

    const previousLevel = this.currentLevel;
    this.currentLevel = clamped;
    this.updateUi();

    this.onLevelChange(this.currentLevel, previousLevel, targetEntity);
  }

  zoomIn(targetEntity = null) {
    if (this.currentLevel < ZOOM_LEVELS.BUILDING) {
      this.setLevel(this.currentLevel + 1, targetEntity);
    }
  }

  zoomOut() {
    if (this.currentLevel > ZOOM_LEVELS.WORLD) {
      this.setLevel(this.currentLevel - 1);
    }
  }

  /**
   * Quantized gesture handler for mouse wheel & 2-finger touch pinch.
   * Stepping only happens from one discrete level to the adjacent level.
   */
  handleGestureDelta(delta, targetEntity = null) {
    const now = performance.now();
    if (now < this.cooldownUntil) return false;

    this.accumulatedDelta += delta;

    if (this.accumulatedDelta >= this.deltaThreshold) {
      // Zoom IN step
      this.accumulatedDelta = 0;
      this.cooldownUntil = now + this.cooldownDurationMs;
      this.zoomIn(targetEntity);
      return true;
    } else if (this.accumulatedDelta <= -this.deltaThreshold) {
      // Zoom OUT step
      this.accumulatedDelta = 0;
      this.cooldownUntil = now + this.cooldownDurationMs;
      this.zoomOut();
      return true;
    }

    return false;
  }

  resetGestureAccumulator() {
    this.accumulatedDelta = 0;
  }

  updateUi() {
    // 1. Update Segmented Pills in Top Header
    const segmentButtons = document.querySelectorAll('.zoom-segment-btn');
    segmentButtons.forEach(btn => {
      const lvl = parseInt(btn.dataset.level, 10);
      if (lvl === this.currentLevel) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // 2. Update Header Zoom Buttons Disabled State
    const btnZoomOutHeader = document.getElementById('btn-zoom-out');
    const btnZoomInHeader = document.getElementById('btn-zoom-in');
    if (btnZoomOutHeader) btnZoomOutHeader.disabled = (this.currentLevel <= ZOOM_LEVELS.WORLD);
    if (btnZoomInHeader) btnZoomInHeader.disabled = (this.currentLevel >= ZOOM_LEVELS.BUILDING);

    // 3. Update Floating Viewport Widget
    const floatBadge = document.getElementById('floating-zoom-level-name');
    const btnZoomOutFloat = document.getElementById('btn-float-zoom-out');
    const btnZoomInFloat = document.getElementById('btn-float-zoom-in');

    const levelIcons = {
      0: '🌍 WORLD',
      1: '🏞️ REGION',
      2: '🏘️ NODE',
      3: '🏢 BUILDING'
    };

    if (floatBadge) {
      floatBadge.textContent = levelIcons[this.currentLevel] || 'NODE';
    }
    if (btnZoomOutFloat) btnZoomOutFloat.disabled = (this.currentLevel <= ZOOM_LEVELS.WORLD);
    if (btnZoomInFloat) btnZoomInFloat.disabled = (this.currentLevel >= ZOOM_LEVELS.BUILDING);
  }
}
