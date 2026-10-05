/**
 * O.N.E. 3D Sovereign Avatar Customizer & Character Studio
 * Directly ported from sim/ with Sim-Reuse-First compliance.
 * Allows pioneers to customize outfits, hairstyles, hair colors, and skin tones
 * with an interactive real-time 3D WebGL Three.js character viewer.
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

import { Avatar3DViewer } from './avatar_3d_viewer.js';

export const OUTFIT_OPTIONS = [
  { id: 'F', label: 'Solarpunk Tunic', icon: '🌿' },
  { id: 'M', label: 'Work Overalls', icon: '🛠️' }
];

export const ALL_HAIRSTYLES = [
  { id: 'short', label: 'Classic Short', icon: '💇' },
  { id: 'ponytail', label: 'Ponytail', icon: '🐎' },
  { id: 'long', label: 'Long Flowing', icon: '✨' },
  { id: 'bob', label: 'Bob Cut', icon: '💁' },
  { id: 'bun', label: 'High Bun', icon: '🌸' },
  { id: 'pigtails', label: 'Double Buns', icon: '👧' },
  { id: 'messy', label: 'Messy Waves', icon: '🌊' },
  { id: 'fade', label: 'Modern Fade', icon: '⚡' },
  { id: 'beard', label: 'Solarpunk Beard', icon: '🧔' }
];

export const HAIR_COLORS = [
  { color: '#1e293b', name: 'Jet Black' },
  { color: '#3b1d11', name: 'Dark Brown' },
  { color: '#78350f', name: 'Chestnut' },
  { color: '#d97706', name: 'Honey Blonde' },
  { color: '#9a3412', name: 'Auburn' },
  { color: '#e2e8f0', name: 'Silver' }
];

export const SKIN_TONES = [
  { color: '#fed7aa', name: 'Fair Peach' },
  { color: '#fcd34d', name: 'Warm Beige' },
  { color: '#fbb77a', name: 'Golden Olive' },
  { color: '#d97706', name: 'Caramel' },
  { color: '#92400e', name: 'Bronze' },
  { color: '#78350f', name: 'Rich Espresso' }
];

export function createAvatarCustomizer(containerEl, initialAppearance = {}, onChangeCallback = () => {}) {
  const prefix = `avatar-${Math.random().toString(36).substring(2, 7)}`;
  
  const state = {
    gender: initialAppearance.gender || 'M',
    hairStyle: initialAppearance.hairStyle || 'fade',
    hairColor: initialAppearance.hairColor || '#1e293b',
    skinTone: initialAppearance.skinTone || '#fbb77a',
    color: initialAppearance.color || '#fbbf24',
    isPlayer: true
  };

  const outfitButtonsHtml = OUTFIT_OPTIONS.map(o => `
    <button type="button" class="btn-avatar-pill ${state.gender === o.id ? 'selected' : ''}" data-prefix="${prefix}" data-gender="${o.id}">
      <span>${o.icon}</span> ${o.label}
    </button>
  `).join('');

  const hairStylesHtml = ALL_HAIRSTYLES.map(h => `
    <button type="button" class="btn-avatar-pill ${state.hairStyle === h.id ? 'selected' : ''}" data-prefix="${prefix}" data-hairstyle="${h.id}">
      <span>${h.icon}</span> ${h.label}
    </button>
  `).join('');

  const hairColorsHtml = HAIR_COLORS.map(c => `
    <div class="swatch-circle ${state.hairColor === c.color ? 'selected' : ''}" 
         style="background-color: ${c.color};" 
         data-prefix="${prefix}" 
         data-haircolor="${c.color}" 
         title="${c.name}"></div>
  `).join('');

  const skinTonesHtml = SKIN_TONES.map(s => `
    <div class="swatch-circle ${state.skinTone === s.color ? 'selected' : ''}" 
         style="background-color: ${s.color};" 
         data-prefix="${prefix}" 
         data-skintone="${s.color}" 
         title="${s.name}"></div>
  `).join('');

  containerEl.innerHTML = `
    <div class="avatar-3d-layout">
      <!-- 3D WebGL Character Studio Viewport -->
      <div class="avatar-3d-viewport-box">
        <div class="avatar-3d-badge-header">
          <span class="badge-3d-pill">✨ PIONEER STUDIO</span>
          <span class="badge-3d-hint">🖱️ Drag to Rotate 360°</span>
        </div>
        <div id="${prefix}-canvas-container" class="avatar-3d-canvas-container"></div>
      </div>

      <!-- Customization Controls Grid -->
      <div class="avatar-3d-controls">
        <div class="custom-control-group">
          <span class="custom-control-title">Outfit & Silhouette</span>
          <div class="btn-pills-row" id="${prefix}-gender-container">
            ${outfitButtonsHtml}
          </div>
        </div>

        <div class="custom-control-group">
          <span class="custom-control-title">Hairstyle</span>
          <div class="btn-pills-row" id="${prefix}-hairstyle-container">
            ${hairStylesHtml}
          </div>
        </div>

        <div class="custom-control-group">
          <span class="custom-control-title">Hair Color</span>
          <div class="color-swatches-row" id="${prefix}-haircolor-container">
            ${hairColorsHtml}
          </div>
        </div>

        <div class="custom-control-group">
          <span class="custom-control-title">Biocultural Skin Tone</span>
          <div class="color-swatches-row" id="${prefix}-skintone-container">
            ${skinTonesHtml}
          </div>
        </div>
      </div>
    </div>
  `;

  // Mount 3D Three.js Studio Viewer
  const canvasContainer = containerEl.querySelector(`#${prefix}-canvas-container`);
  let viewer = null;
  if (canvasContainer) {
    viewer = new Avatar3DViewer(canvasContainer, state, { isMiniPhoto: false });
  }

  // Attach Interaction Listeners
  // 1. Gender / Outfit
  containerEl.querySelectorAll(`button[data-prefix="${prefix}"][data-gender]`).forEach(btn => {
    btn.addEventListener('click', () => {
      state.gender = btn.dataset.gender;
      containerEl.querySelectorAll(`button[data-prefix="${prefix}"][data-gender]`).forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      if (viewer) viewer.updateAppearance(state);
      onChangeCallback(state);
    });
  });

  // 2. Hairstyle
  containerEl.querySelectorAll(`button[data-prefix="${prefix}"][data-hairstyle]`).forEach(btn => {
    btn.addEventListener('click', () => {
      state.hairStyle = btn.dataset.hairstyle;
      containerEl.querySelectorAll(`button[data-prefix="${prefix}"][data-hairstyle]`).forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      if (viewer) viewer.updateAppearance(state);
      onChangeCallback(state);
    });
  });

  // 3. Hair Color
  containerEl.querySelectorAll(`.swatch-circle[data-prefix="${prefix}"][data-haircolor]`).forEach(sw => {
    sw.addEventListener('click', () => {
      state.hairColor = sw.dataset.haircolor;
      containerEl.querySelectorAll(`.swatch-circle[data-prefix="${prefix}"][data-haircolor]`).forEach(s => s.classList.remove('selected'));
      sw.classList.add('selected');
      if (viewer) viewer.updateAppearance(state);
      onChangeCallback(state);
    });
  });

  // 4. Skin Tone
  containerEl.querySelectorAll(`.swatch-circle[data-prefix="${prefix}"][data-skintone]`).forEach(sw => {
    sw.addEventListener('click', () => {
      state.skinTone = sw.dataset.skintone;
      containerEl.querySelectorAll(`.swatch-circle[data-prefix="${prefix}"][data-skintone]`).forEach(s => s.classList.remove('selected'));
      sw.classList.add('selected');
      if (viewer) viewer.updateAppearance(state);
      onChangeCallback(state);
    });
  });

  return {
    state,
    viewer,
    setAppearance(newApp) {
      Object.assign(state, newApp);
      if (viewer) viewer.updateAppearance(state);
    },
    destroy() {
      if (viewer) {
        viewer.destroy();
        viewer = null;
      }
      containerEl.innerHTML = '';
    }
  };
}
