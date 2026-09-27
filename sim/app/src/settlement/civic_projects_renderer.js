/**
 * Civic Megaprojects Canvas 2D Renderer (Agent SIM-2 & SIM-4)
 * Renders Solarpunk community megaprojects directly onto the village canvas:
 * - Scaffolding & holographic blueprints for in-progress projects
 * - Rich vector architectural models for completed megaprojects
 * - Particle emissions (sparks, bubbles, thermal glow)
 * - Raycast hover detection and HUD card rendering
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

export class CivicProjectsRenderer {
  constructor(settlementRenderer) {
    this.renderer = settlementRenderer;
  }

  get engine() {
    return this.renderer.sim?.civicProjects || null;
  }

  render(ctx, isNight = false, time = performance.now()) {
    const engine = this.engine;
    if (!engine) return;

    for (const proj of engine.getAllProjects()) {
      if (proj.status === 'PLANNED') continue; // Hidden until foundation begins

      ctx.save();
      const coords = proj.canvasCoords;

      if (proj.status === 'IN_PROGRESS') {
        this.renderScaffolding(ctx, proj, coords, isNight, time);
      } else if (proj.status === 'COMPLETED') {
        this.renderCompletedStructure(ctx, proj, coords, isNight, time);
      }

      ctx.restore();
    }
  }

  renderScaffolding(ctx, proj, coords, isNight, time) {
    const cx = coords.x;
    const cy = coords.y;
    const w = coords.width || coords.radius * 2 || 70;
    const h = coords.height || coords.radius * 1.5 || 55;
    const halfW = w / 2;
    const halfH = h / 2;

    // 1. Excavated foundation footprint
    ctx.fillStyle = isNight ? 'rgba(30, 41, 59, 0.65)' : 'rgba(120, 113, 108, 0.45)';
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.roundRect(cx - halfW, cy - halfH, w, h, 6);
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);

    // 2. Timber Scaffolding Struts
    ctx.strokeStyle = '#b45309'; // warm timber brown
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    // Perimeter frame
    ctx.strokeRect(cx - halfW + 4, cy - halfH + 4, w - 8, h - 8);
    // Diagonal cross bracing
    ctx.moveTo(cx - halfW + 4, cy - halfH + 4);
    ctx.lineTo(cx + halfW - 4, cy + halfH - 4);
    ctx.moveTo(cx + halfW - 4, cy - halfH + 4);
    ctx.lineTo(cx - halfW + 4, cy + halfH - 4);
    ctx.stroke();

    // 3. Blinking Amber Safety Beacons on Corners
    const blink = Math.sin(time / 200) > 0;
    const beaconColor = blink ? '#fbbf24' : 'rgba(217, 119, 6, 0.3)';
    ctx.fillStyle = beaconColor;
    const corners = [
      [cx - halfW + 2, cy - halfH + 2],
      [cx + halfW - 2, cy - halfH + 2],
      [cx - halfW + 2, cy + halfH - 2],
      [cx + halfW - 2, cy + halfH - 2]
    ];
    for (const [bx, by] of corners) {
      ctx.beginPath();
      ctx.arc(bx, by, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. Floating Construction Tag & Progress Badge
    const pct = this.engine ? this.engine.getProgressPercentage(proj) : 0;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(cx - 36, cy - halfH - 16, 72, 14, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fef3c7';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`🏗️ ${pct}%`, cx, cy - halfH - 9);
  }

  renderCompletedStructure(ctx, proj, coords, isNight, time) {
    switch (proj.id) {
      case 'amphitheater':
        this.renderAmphitheater(ctx, coords, isNight, time);
        break;
      case 'biogasDigester':
        this.renderBiogasDigester(ctx, coords, isNight, time);
        break;
      case 'deepRainReservoir':
        this.renderRainReservoir(ctx, coords, isNight, time);
        break;
      case 'solarTower':
        this.renderSolarTower(ctx, coords, isNight, time);
        break;
      case 'seedVault':
        this.renderSeedVault(ctx, coords, isNight, time);
        break;
      default:
        this.renderGenericProject(ctx, coords, proj);
    }
  }

  // 🏛️ Agora Socratic Amphitheater & Acoustic Shell
  renderAmphitheater(ctx, coords, isNight, time) {
    const cx = coords.x;
    const cy = coords.y;
    const r = coords.radius || 46;

    // 1. Tiered Concentric Semicircular Stone Steps
    const tiers = [r, r - 9, r - 18, r - 27];
    for (let i = 0; i < tiers.length; i++) {
      const tr = tiers[i];
      ctx.fillStyle = isNight ? (i % 2 === 0 ? '#1e293b' : '#334155') : (i % 2 === 0 ? '#e2e8f0' : '#cbd5e1');
      ctx.strokeStyle = isNight ? '#475569' : '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      // Upper semicircle arc (from PI to 2*PI, facing south toward Agora)
      ctx.arc(cx, cy, tr, Math.PI * 0.95, Math.PI * 2.05, false);
      ctx.stroke();
    }

    // 2. Central Speaker Dais / Socratic Podium
    ctx.fillStyle = isNight ? '#047857' : '#10b981';
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy - 2, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 3. Curved Wooden Acoustic Pergola Arch
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(cx, cy, r + 4, Math.PI * 1.05, Math.PI * 1.95, false);
    ctx.stroke();

    // 4. Warm Lanterns along perimeter
    if (isNight) {
      const lanternAngles = [Math.PI * 1.15, Math.PI * 1.5, Math.PI * 1.85];
      for (const ang of lanternAngles) {
        const lx = cx + Math.cos(ang) * (r - 4);
        const ly = cy + Math.sin(ang) * (r - 4);
        ctx.fillStyle = '#fbbf24';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(lx, ly, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
  }

  // 🌿 Closed-Loop Anaerobic Biogas Digester
  renderBiogasDigester(ctx, coords, isNight, time) {
    const cx = coords.x;
    const cy = coords.y;
    const w = coords.width || 80;
    const h = coords.height || 60;

    // 1. Concrete Base Slab
    ctx.fillStyle = isNight ? '#1e293b' : '#94a3b8';
    ctx.beginPath();
    ctx.roundRect(cx - w / 2, cy - h / 2, w, h, 8);
    ctx.fill();

    // 2. Cylindrical Digester Tank with Domed Top
    const tankR = 24;
    const tankGrad = ctx.createLinearGradient(cx - tankR, cy, cx + tankR, cy);
    tankGrad.addColorStop(0, '#064e3b');
    tankGrad.addColorStop(0.5, '#059669');
    tankGrad.addColorStop(1, '#047857');
    ctx.fillStyle = tankGrad;
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx - 10, cy, tankR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 3. Bioluminescent Fluid Inspection Tube (bubbles gently)
    ctx.fillStyle = 'rgba(16, 185, 129, 0.4)';
    ctx.strokeStyle = '#6ee7b7';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(cx + 20, cy - 18, 12, 36, 4);
    ctx.fill();
    ctx.stroke();

    // Bubbles
    const b1Y = cy + 12 - ((time / 30) % 28);
    const b2Y = cy + 12 - (((time / 30) + 14) % 28);
    ctx.fillStyle = '#a7f3d0';
    ctx.beginPath();
    ctx.arc(cx + 26, b1Y, 2, 0, Math.PI * 2);
    ctx.arc(cx + 26, b2Y, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // 4. Brass Pressure Dial
    ctx.fillStyle = '#fef08a';
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx - 10, cy - tankR - 4, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // 💧 Deep Basalt Rain Reservoir & Reed Wetland
  renderRainReservoir(ctx, coords, isNight, time) {
    const cx = coords.x;
    const cy = coords.y;
    const w = coords.width || 85;
    const h = coords.height || 65;

    // 1. Basalt Cut Stone Perimeter
    ctx.fillStyle = isNight ? '#0f172a' : '#475569';
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(cx - w / 2, cy - h / 2, w, h, 10);
    ctx.fill();
    ctx.stroke();

    // 2. Clear Turquoise Deep Water Pool
    const waterGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, 35);
    waterGrad.addColorStop(0, '#06b6d4');
    waterGrad.addColorStop(0.7, '#0284c7');
    waterGrad.addColorStop(1, '#0369a1');
    ctx.fillStyle = waterGrad;
    ctx.beginPath();
    ctx.roundRect(cx - w / 2 + 6, cy - h / 2 + 6, w - 12, h - 12, 6);
    ctx.fill();

    // 3. Gentle Animated Water Ripples
    const rippleScale = 1 + Math.sin(time / 800) * 0.15;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 18 * rippleScale, 9 * rippleScale, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 4. Wetland Reed Filter Patches (horizontal green clusters)
    ctx.fillStyle = '#10b981';
    for (let rx = -25; rx <= 25; rx += 14) {
      ctx.beginPath();
      ctx.arc(cx + rx, cy + h / 2 - 10, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ⚡ Solar Thermal Molten Salt Tower & Stirling Spire
  renderSolarTower(ctx, coords, isNight, time) {
    const cx = coords.x;
    const cy = coords.y;
    const w = coords.width || 80;
    const h = coords.height || 75;

    // 1. Circular Foundation Pad
    ctx.fillStyle = isNight ? '#1e293b' : '#64748b';
    ctx.beginPath();
    ctx.arc(cx, cy, 32, 0, Math.PI * 2);
    ctx.fill();

    // 2. Micro-Heliostat Reflective Mirrors (4 tracking pads)
    const angles = [0.2, 1.8, 3.4, 4.9];
    ctx.fillStyle = '#bae6fd';
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 1;
    for (const a of angles) {
      const mx = cx + Math.cos(a) * 22;
      const my = cy + Math.sin(a) * 22;
      ctx.save();
      ctx.translate(mx, my);
      ctx.rotate(a + Math.PI / 2);
      ctx.fillRect(-6, -3, 12, 6);
      ctx.strokeRect(-6, -3, 12, 6);
      ctx.restore();
    }

    // 3. Central Receiver Lattice Spire
    ctx.strokeStyle = isNight ? '#f59e0b' : '#e2e8f0';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx - 8, cy + 12);
    ctx.lineTo(cx, cy - 24);
    ctx.lineTo(cx + 8, cy + 12);
    ctx.stroke();

    // 4. Molten Salt Receiver Bulb (Glowing Thermal Core)
    const pulse = 1 + Math.sin(time / 300) * 0.12;
    const glowR = 7 * pulse;
    const coreGrad = ctx.createRadialGradient(cx, cy - 24, 1, cx, cy - 24, glowR + 4);
    coreGrad.addColorStop(0, '#fef08a');
    coreGrad.addColorStop(0.5, '#f59e0b');
    coreGrad.addColorStop(1, 'rgba(217, 119, 6, 0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(cx, cy - 24, glowR + 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy - 24, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // 🌾 Cryo-Passive Heirloom Seed Vault & Genomic Bank
  renderSeedVault(ctx, coords, isNight, time) {
    const cx = coords.x;
    const cy = coords.y;
    const w = coords.width || 75;
    const h = coords.height || 55;

    // 1. Bermed Earth Midden / Grass Canopy
    ctx.fillStyle = isNight ? '#064e3b' : '#047857';
    ctx.beginPath();
    ctx.roundRect(cx - w / 2, cy - h / 2, w, h, 12);
    ctx.fill();

    // 2. Concrete Vault Portal Face
    ctx.fillStyle = isNight ? '#1e293b' : '#cbd5e1';
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(cx - 22, cy - 14, 44, 28, 4);
    ctx.fill();
    ctx.stroke();

    // 3. Heavy Hermetic Steel Door with Central Locking Wheel
    ctx.fillStyle = '#475569';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Brass handles
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 7, cy);
    ctx.lineTo(cx + 7, cy);
    ctx.moveTo(cx, cy - 7);
    ctx.lineTo(cx, cy + 7);
    ctx.stroke();

    // 4. Botanical Green Sprout Emblem above Door
    ctx.fillStyle = '#22c55e';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🌱', cx, cy - 18);
  }

  renderGenericProject(ctx, coords, proj) {
    const cx = coords.x;
    const cy = coords.y;
    const w = coords.width || 60;
    const h = coords.height || 50;

    ctx.fillStyle = '#065f46';
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(cx - w / 2, cy - h / 2, w, h, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(proj.icon || '🏗️', cx, cy);
  }

  checkRaycast(worldX, worldY) {
    const engine = this.engine;
    if (!engine) return null;

    for (const proj of engine.getAllProjects()) {
      if (proj.status === 'PLANNED') continue;
      const coords = proj.canvasCoords;
      const w = coords.width || coords.radius * 2 || 60;
      const h = coords.height || coords.radius * 2 || 60;

      if (coords.radius) {
        const dist = Math.hypot(worldX - coords.x, worldY - coords.y);
        if (dist <= coords.radius) {
          return { type: 'CIVIC_PROJECT', project: proj };
        }
      } else {
        if (
          worldX >= coords.x - w / 2 &&
          worldX <= coords.x + w / 2 &&
          worldY >= coords.y - h / 2 &&
          worldY <= coords.y + h / 2
        ) {
          return { type: 'CIVIC_PROJECT', project: proj };
        }
      }
    }
    return null;
  }
}
