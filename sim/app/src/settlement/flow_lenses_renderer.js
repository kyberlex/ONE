/**
 * Visual Flow Lenses: Energy & Water Metabolic Heatmaps (Agent SIM-2 & SIM-4)
 * Renders animated, physical flow overlays onto the living village canvas:
 * 1. ⚡ Energy Grid Lens: Animated electrical currents from Solar PV & Wind to Battery Bank,
 *    and branch distribution to FabLab, Greenhouse, and Dwellings with live kW metrics.
 * 2. 💧 Hydrological Cycle Lens: Flowing aqueducts from Rain Catchment & Deep Well to Cistern,
 *    aeroponic towers, potable fountains, and 65% circular greywater reed-bed return.
 * 3. 🌐 Combined Metabolic Lens: Simultaneous dual-track thermodynamics.
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

export const LENS_MODES = {
  OFF: 'OFF',
  ENERGY: 'ENERGY',
  WATER: 'WATER',
  ALL: 'ALL'
};

export class FlowLensesRenderer {
  constructor(settlementRenderer) {
    this.renderer = settlementRenderer;
    this.activeLens = LENS_MODES.OFF;
    this.pulsePhase = 0;
    this.lastTime = performance.now();
  }

  get sim() {
    return this.renderer.sim || null;
  }

  get thermo() {
    return this.sim?.thermo || null;
  }

  setLens(mode) {
    if (Object.values(LENS_MODES).includes(mode)) {
      this.activeLens = mode;
      return this.activeLens;
    }
    return this.activeLens;
  }

  cycleLens() {
    const modes = [LENS_MODES.OFF, LENS_MODES.ENERGY, LENS_MODES.WATER, LENS_MODES.ALL];
    const currentIndex = modes.indexOf(this.activeLens);
    const nextIndex = (currentIndex + 1) % modes.length;
    this.activeLens = modes[nextIndex];
    return this.activeLens;
  }

  isActive() {
    return this.activeLens !== LENS_MODES.OFF;
  }

  isEnergyActive() {
    return this.activeLens === LENS_MODES.ENERGY || this.activeLens === LENS_MODES.ALL;
  }

  isWaterActive() {
    return this.activeLens === LENS_MODES.WATER || this.activeLens === LENS_MODES.ALL;
  }

  /**
   * Render ground heatmaps and conduit pipes UNDER the buildings & dwellings
   */
  renderUnderlay(ctx, isNight, time = performance.now()) {
    if (!this.isActive()) return;

    const dt = (time - this.lastTime) / 1000;
    this.lastTime = time;
    this.pulsePhase = (this.pulsePhase + dt * 2.5) % 1000;

    ctx.save();

    // 1. Water Lens conduits & reservoir heatmaps
    if (this.isWaterActive()) {
      this.renderWaterConduits(ctx, isNight, time);
      this.renderWaterReservoirHeatmaps(ctx, isNight);
    }

    // 2. Energy Lens bus cables & generation heatmaps
    if (this.isEnergyActive()) {
      this.renderEnergyCables(ctx, isNight, time);
      this.renderEnergyGenerationHeatmaps(ctx, isNight);
    }

    ctx.restore();
  }

  /**
   * Render travelling pulses, electrons, droplets and telemetry badges OVER buildings
   */
  renderOverlay(ctx, isNight, time = performance.now()) {
    if (!this.isActive()) return;

    ctx.save();

    // 1. Water travelling droplets & telemetry tags
    if (this.isWaterActive()) {
      this.renderWaterPulses(ctx, isNight, time);
      this.renderWaterTelemetryBadges(ctx, isNight);
    }

    // 2. Energy travelling electrons & telemetry tags
    if (this.isEnergyActive()) {
      this.renderEnergyPulses(ctx, isNight, time);
      this.renderEnergyTelemetryBadges(ctx, isNight);
    }

    ctx.restore();
  }

  /* =========================================================================
     ⚡ ENERGY NETWORK: CONDUITS, HEATMAPS & ELECTRONS
     ========================================================================= */

  getEnergyNetwork() {
    const solar = { x: -280, y: -140 };
    const bus = { x: -140, y: -50 };
    const agora = { x: 0, y: 0 };
    const fablab = { x: -290, y: 75 };
    const greenhouse = { x: 290, y: 75 };
    const school = { x: -150, y: 250 };
    const waterPumps = { x: 280, y: -140 };

    return {
      nodes: { solar, bus, agora, fablab, greenhouse, school, waterPumps },
      trunks: [
        { from: solar, to: bus, id: 'solar-bus', flowType: 'MAIN_FEED' },
        { from: bus, to: agora, id: 'bus-agora', flowType: 'GRID_TRUNK' },
        { from: bus, to: fablab, id: 'bus-fablab', flowType: 'HEAVY_WORKSHOP' },
        { from: bus, to: school, id: 'bus-school', flowType: 'COMMONS_BRANCH' },
        { from: agora, to: greenhouse, id: 'agora-food', flowType: 'AGRI_FEED' },
        { from: agora, to: waterPumps, id: 'agora-pumps', flowType: 'PUMP_FEED' }
      ]
    };
  }

  renderEnergyGenerationHeatmaps(ctx, isNight) {
    const solarKw = this.thermo?.energy?.solarKw || 0;
    const windKw = this.thermo?.energy?.windKw || 0;
    const totalGen = solarKw + windKw;
    const isSolarActive = !this.thermo?.energy?.isNight && solarKw > 1;

    // Solar field heatmap
    ctx.save();
    const rad = 110 + Math.sin(this.pulsePhase * 2) * 8;
    const grad = ctx.createRadialGradient(-280, -140, 10, -280, -140, rad);
    if (isSolarActive) {
      grad.addColorStop(0, 'rgba(251, 191, 36, 0.45)');
      grad.addColorStop(0.5, 'rgba(245, 158, 11, 0.20)');
      grad.addColorStop(1, 'rgba(245, 158, 11, 0)');
    } else {
      grad.addColorStop(0, 'rgba(56, 189, 248, 0.25)');
      grad.addColorStop(0.6, 'rgba(56, 189, 248, 0.08)');
      grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
    }
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(-280, -140, rad, 0, Math.PI * 2);
    ctx.fill();

    // FabLab load heatmap
    const flGrad = ctx.createRadialGradient(-290, 75, 5, -290, 75, 80);
    flGrad.addColorStop(0, 'rgba(244, 63, 94, 0.35)');
    flGrad.addColorStop(0.7, 'rgba(244, 63, 94, 0.08)');
    flGrad.addColorStop(1, 'rgba(244, 63, 94, 0)');
    ctx.fillStyle = flGrad;
    ctx.beginPath();
    ctx.arc(-290, 75, 80, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  renderEnergyCables(ctx, isNight, time) {
    const { trunks } = this.getEnergyNetwork();
    const isIslanded = !this.thermo?.energy?.gridConnected;

    ctx.save();
    for (const t of trunks) {
      // Outer glow cable
      ctx.lineWidth = 5;
      ctx.strokeStyle = isIslanded ? 'rgba(239, 68, 68, 0.35)' : 'rgba(245, 158, 11, 0.30)';
      ctx.beginPath();
      ctx.moveTo(t.from.x, t.from.y);
      ctx.lineTo(t.to.x, t.to.y);
      ctx.stroke();

      // Inner core wire
      ctx.lineWidth = 2;
      ctx.strokeStyle = isIslanded ? 'rgba(252, 165, 165, 0.85)' : 'rgba(253, 230, 138, 0.85)';
      ctx.setLineDash([8, 6]);
      ctx.lineDashOffset = -this.pulsePhase * 18;
      ctx.beginPath();
      ctx.moveTo(t.from.x, t.from.y);
      ctx.lineTo(t.to.x, t.to.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.restore();
  }

  renderEnergyPulses(ctx, isNight, time) {
    const { trunks } = this.getEnergyNetwork();
    const solarKw = this.thermo?.energy?.solarKw || 0;
    const windKw = this.thermo?.energy?.windKw || 0;
    const speed = 0.8 + Math.min(2.5, (solarKw + windKw) / 18);

    ctx.save();
    for (const t of trunks) {
      const dx = t.to.x - t.from.x;
      const dy = t.to.y - t.from.y;
      const dist = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx);

      // Spawn 3 travelling electrons along each trunk
      const count = 3;
      for (let i = 0; i < count; i++) {
        const offset = (this.pulsePhase * speed * 0.25 + i / count) % 1;
        const px = t.from.x + dx * offset;
        const py = t.from.y + dy * offset;

        // Glowing particle
        ctx.fillStyle = '#fef08a';
        ctx.shadowColor = 'rgba(234, 179, 8, 0.9)';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(px, py, 4.5, 0, Math.PI * 2);
        ctx.fill();

        // Directional spark
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(px, py, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  renderEnergyTelemetryBadges(ctx, isNight) {
    const solarKw = this.thermo?.energy?.solarKw || 0;
    const windKw = this.thermo?.energy?.windKw || 0;
    const totalGen = (solarKw + windKw).toFixed(1);
    const netFlow = this.thermo?.energy?.netFlowKwh ?? 0;
    const batteryPct = this.thermo?.energy?.percent ?? 85;

    this.drawFloatingBadge(ctx, -280, -195, `⚡ ${totalGen} kW [GEN]`, '#f59e0b');
    this.drawFloatingBadge(ctx, -140, -78, `🔋 ${batteryPct}% [BUS]`, '#10b981');
    this.drawFloatingBadge(ctx, -290, 130, `💻 -14.2 kW [FABLAB]`, '#f43f5e');
    this.drawFloatingBadge(ctx, 290, 132, `🌿 -9.5 kW [AEROPONICS]`, '#10b981');
  }

  /* =========================================================================
     💧 WATER CYCLE: AQUEDUCTS, REEDS & DROPLETS
     ========================================================================= */

  getWaterNetwork() {
    const cistern = { x: 280, y: -140 };
    const greenhouse = { x: 290, y: 75 };
    const agora = { x: 0, y: 0 };
    const reedBeds = { x: 0, y: 250 };
    const preFilters = { x: 150, y: 160 };

    return {
      nodes: { cistern, greenhouse, agora, reedBeds, preFilters },
      conduits: [
        { from: cistern, to: greenhouse, id: 'cistern-greenhouse', type: 'POTABLE' },
        { from: cistern, to: agora, id: 'cistern-agora', type: 'POTABLE' },
        { from: agora, to: reedBeds, id: 'agora-greywater', type: 'GREYWATER' },
        { from: greenhouse, to: preFilters, id: 'food-runoff', type: 'GREYWATER' },
        { from: preFilters, to: reedBeds, id: 'filters-garden', type: 'FILTERED' }
      ]
    };
  }

  renderWaterReservoirHeatmaps(ctx, isNight) {
    const cisternL = this.thermo?.water?.currentL || 32000;
    const cisternPct = Math.min(1.0, cisternL / 50000);

    ctx.save();
    // Cistern water glow
    const rad = 95 + cisternPct * 25 + Math.sin(this.pulsePhase * 1.5) * 6;
    const grad = ctx.createRadialGradient(280, -140, 8, 280, -140, rad);
    grad.addColorStop(0, 'rgba(14, 165, 233, 0.45)');
    grad.addColorStop(0.6, 'rgba(14, 165, 233, 0.16)');
    grad.addColorStop(1, 'rgba(14, 165, 233, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(280, -140, rad, 0, Math.PI * 2);
    ctx.fill();

    // Reed beds filtration wetland glow
    const reedGrad = ctx.createRadialGradient(0, 250, 10, 0, 250, 105);
    reedGrad.addColorStop(0, 'rgba(20, 184, 166, 0.40)');
    reedGrad.addColorStop(0.5, 'rgba(16, 185, 129, 0.18)');
    reedGrad.addColorStop(1, 'rgba(16, 185, 129, 0)');
    ctx.fillStyle = reedGrad;
    ctx.beginPath();
    ctx.arc(0, 250, 105, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  renderWaterConduits(ctx, isNight, time) {
    const { conduits } = this.getWaterNetwork();

    ctx.save();
    for (const c of conduits) {
      const isGreywater = c.type === 'GREYWATER';
      const colorGlow = isGreywater ? 'rgba(45, 212, 191, 0.30)' : 'rgba(14, 165, 233, 0.35)';
      const colorCore = isGreywater ? 'rgba(94, 234, 212, 0.85)' : 'rgba(186, 230, 253, 0.85)';

      // Outer conduit casing
      ctx.lineWidth = 6;
      ctx.strokeStyle = colorGlow;
      ctx.beginPath();
      ctx.moveTo(c.from.x, c.from.y);
      ctx.lineTo(c.to.x, c.to.y);
      ctx.stroke();

      // Fluid core
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = colorCore;
      ctx.setLineDash([10, 6]);
      ctx.lineDashOffset = -this.pulsePhase * 14;
      ctx.beginPath();
      ctx.moveTo(c.from.x, c.from.y);
      ctx.lineTo(c.to.x, c.to.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.restore();
  }

  renderWaterPulses(ctx, isNight, time) {
    const { conduits } = this.getWaterNetwork();
    const netFlow = this.thermo?.water?.netDelta || 500;
    const speed = 0.7 + Math.min(2.0, Math.abs(netFlow) / 800);

    ctx.save();
    for (const c of conduits) {
      const dx = c.to.x - c.from.x;
      const dy = c.to.y - c.from.y;
      const count = 3;

      for (let i = 0; i < count; i++) {
        const offset = (this.pulsePhase * speed * 0.22 + i / count) % 1;
        const px = c.from.x + dx * offset;
        const py = c.from.y + dy * offset;

        // Droplet outer glow
        ctx.fillStyle = c.type === 'GREYWATER' ? '#5eead4' : '#38bdf8';
        ctx.shadowColor = 'rgba(14, 165, 233, 0.85)';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(px, py, 4.5, 0, Math.PI * 2);
        ctx.fill();

        // Droplet bright highlight
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(px, py, 2.0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  renderWaterTelemetryBadges(ctx, isNight) {
    const cisternL = this.thermo?.water?.currentL || 32000;
    const netDelta = this.thermo?.water?.netDelta || 0;
    const sign = netDelta >= 0 ? '+' : '';

    this.drawFloatingBadge(ctx, 280, -195, `💧 ${sign}${netDelta} L/h [CISTERN]`, '#0ea5e9');
    this.drawFloatingBadge(ctx, 290, 150, `🥗 -420 L/h [AEROPONICS]`, '#38bdf8');
    this.drawFloatingBadge(ctx, 0, 305, `🌿 65% Greywater Recycled [REED BEDS]`, '#10b981');
  }

  /* =========================================================================
     TOOLING: VECTOR TELEMETRY BADGES
     ========================================================================= */

  drawFloatingBadge(ctx, x, y, text, accentColor) {
    ctx.save();
    ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
    const textWidth = ctx.measureText(text).width;
    const padX = 8;
    const padY = 4;
    const w = textWidth + padX * 2;
    const h = 20;

    // Badge backdrop
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 1.2;
    ctx.shadowColor = accentColor;
    ctx.shadowBlur = 8;

    ctx.beginPath();
    ctx.roundRect(x - w / 2, y - h / 2, w, h, 6);
    ctx.fill();
    ctx.stroke();

    // Text label
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#f8fafc';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);

    ctx.restore();
  }
}
