/**
 * 60 FPS HTML5 Canvas 2D Hexagonal Cartographer (Agent SIM-2)
 * High-performance vector rendering, smooth pan & zoom, responsive touch controls.
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

import { HexLayout } from './hex.js';
import { t } from '../i18n/index.js';

export class HexCanvasRenderer {
  constructor(canvas, world, onSelectTileCallback) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.world = world;
    this.onSelectTile = onSelectTileCallback || (() => {});

    // Camera & Transform
    this.camera = {
      x: 0,
      y: 0,
      zoom: 1.0,
      minZoom: 0.4,
      maxZoom: 2.5
    };

    // Hex geometry layout
    this.baseHexRadius = 70;
    this.layout = new HexLayout({ x: this.baseHexRadius, y: this.baseHexRadius });

    // Interaction state
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };
    this.cameraStart = { x: 0, y: 0 };
    this.hoveredHex = null;
    this.selectedHex = null;

    // Animation ticker
    this.pulsePhase = 0;

    // O.N.E. Logo Asset Preload for Canvas Tiles and Watermark
    this.logoImg = new Image();
    this.logoImg.src = '/one-logo-white.svg';
    this.logoLoaded = false;
    this.currencySymbol = '$';
    this.logoImg.onload = () => {
      this.logoLoaded = true;
    };

    // Initialize
    this.resizeCanvas();
    this.bindEvents();
    this.centerOnOrigin();
    this.startRenderLoop();
  }

  resizeCanvas() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;
    this.ctx.scale(dpr, dpr);
    this.viewportWidth = rect.width;
    this.viewportHeight = rect.height;
  }

  centerOnOrigin() {
    this.camera.x = this.viewportWidth / 2;
    this.camera.y = this.viewportHeight / 2;
  }

  bindEvents() {
    window.addEventListener('resize', () => this.resizeCanvas());

    // Mouse Down
    this.canvas.addEventListener('mousedown', e => {
      this.isDragging = true;
      this.dragStart = { x: e.clientX, y: e.clientY };
      this.cameraStart = { x: this.camera.x, y: this.camera.y };
    });

    // Mouse Move (Pan + Hover)
    window.addEventListener('mousemove', e => {
      if (this.isDragging) {
        const dx = e.clientX - this.dragStart.x;
        const dy = e.clientY - this.dragStart.y;
        this.camera.x = this.cameraStart.x + dx;
        this.camera.y = this.cameraStart.y + dy;
      } else {
        // Raycast hover
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        if (mouseX >= 0 && mouseX <= rect.width && mouseY >= 0 && mouseY <= rect.height) {
          this.updateHover(mouseX, mouseY);
        }
      }
    });

    // Mouse Up (Click detection)
    window.addEventListener('mouseup', e => {
      if (this.isDragging) {
        const dx = Math.abs(e.clientX - this.dragStart.x);
        const dy = Math.abs(e.clientY - this.dragStart.y);
        this.isDragging = false;

        // If movement was small, treat as a click
        if (dx < 5 && dy < 5) {
          if (this.hoveredHex) {
            this.selectedHex = this.hoveredHex;
            const tile = this.world.getTile(this.selectedHex.q, this.selectedHex.r);
            if (tile) {
              this.onSelectTile(tile);
            }
          }
        }
      }
    });

    // Mouse Wheel (Zoom)
    this.canvas.addEventListener('wheel', e => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      const newZoom = Math.min(this.camera.maxZoom, Math.max(this.camera.minZoom, this.camera.zoom * zoomFactor));

      // Zoom towards mouse position
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      this.camera.x = mouseX - (mouseX - this.camera.x) * (newZoom / this.camera.zoom);
      this.camera.y = mouseY - (mouseY - this.camera.y) * (newZoom / this.camera.zoom);
      this.camera.zoom = newZoom;
    }, { passive: false });

    // Touch Support (Single touch pan, click)
    let touchStartDist = 0;
    this.canvas.addEventListener('touchstart', e => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.dragStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        this.cameraStart = { x: this.camera.x, y: this.camera.y };
      } else if (e.touches.length === 2) {
        this.isDragging = false;
        touchStartDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    }, { passive: true });

    this.canvas.addEventListener('touchmove', e => {
      if (e.touches.length === 1 && this.isDragging) {
        const dx = e.touches[0].clientX - this.dragStart.x;
        const dy = e.touches[0].clientY - this.dragStart.y;
        this.camera.x = this.cameraStart.x + dx;
        this.camera.y = this.cameraStart.y + dy;
      } else if (e.touches.length === 2) {
        const currentDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const factor = currentDist / touchStartDist;
        this.camera.zoom = Math.min(this.camera.maxZoom, Math.max(this.camera.minZoom, this.camera.zoom * factor));
        touchStartDist = currentDist;
      }
    }, { passive: true });

    this.canvas.addEventListener('touchend', e => {
      if (this.isDragging && e.changedTouches.length === 1) {
        const dx = Math.abs(e.changedTouches[0].clientX - this.dragStart.x);
        const dy = Math.abs(e.changedTouches[0].clientY - this.dragStart.y);
        this.isDragging = false;
        if (dx < 10 && dy < 10) {
          const rect = this.canvas.getBoundingClientRect();
          const touchX = e.changedTouches[0].clientX - rect.left;
          const touchY = e.changedTouches[0].clientY - rect.top;
          this.updateHover(touchX, touchY);
          if (this.hoveredHex) {
            this.selectedHex = this.hoveredHex;
            const tile = this.world.getTile(this.selectedHex.q, this.selectedHex.r);
            if (tile) this.onSelectTile(tile);
          }
        }
      }
    });
  }

  updateHover(screenX, screenY) {
    // Inverse camera transform
    const worldX = (screenX - this.camera.x) / this.camera.zoom;
    const worldY = (screenY - this.camera.y) / this.camera.zoom;
    const hex = this.layout.pixelToHex({ x: worldX, y: worldY });
    const tile = this.world.getTile(hex.q, hex.r);
    this.hoveredHex = tile ? hex : null;
  }

  startRenderLoop() {
    const loop = () => {
      this.render();
      this.pulsePhase += 0.03;
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.viewportWidth, this.viewportHeight);

    // Save camera state
    ctx.save();
    ctx.translate(this.camera.x, this.camera.y);
    ctx.scale(this.camera.zoom, this.camera.zoom);

    // 1. Draw Mesh Data Links between federated O.N.E. nodes
    this.drawMeshLinks(ctx);

    // 2. Draw all Hex Tiles
    const tiles = this.world.getAllTiles();
    for (const tile of tiles) {
      this.drawHexTile(ctx, tile);
    }

    // 3. Highlight Selected Hex
    if (this.selectedHex) {
      this.drawSelectionHalo(ctx, this.selectedHex);
    }

    ctx.restore();

    // 4. Draw Official Solarpunk Holographic O.N.E. Watermark
    this.drawWatermark(ctx);
  }

  drawMeshLinks(ctx) {
    const links = this.world.getActiveMeshLinks();
    ctx.save();
    for (const link of links) {
      const p1 = this.layout.hexToPixel(link.from);
      const p2 = this.layout.hexToPixel(link.to);

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.45)';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 8]);
      ctx.lineDashOffset = -this.pulsePhase * 25;
      ctx.stroke();

      // Moving data packet particle
      const t = (this.pulsePhase * 0.5) % 1.0;
      const packetX = p1.x + (p2.x - p1.x) * t;
      const packetY = p1.y + (p2.y - p1.y) * t;

      ctx.beginPath();
      ctx.arc(packetX, packetY, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#34d399';
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 10;
      ctx.fill();
    }
    ctx.restore();
  }

  drawHexTile(ctx, tile) {
    const corners = this.layout.polygonCorners(tile.hex);
    const center = this.layout.hexToPixel(tile.hex);

    const isHovered = this.hoveredHex && this.hoveredHex.equals(tile.hex);
    const isSelected = this.selectedHex && this.selectedHex.equals(tile.hex);

    ctx.beginPath();
    ctx.moveTo(corners[0].x, corners[0].y);
    for (let i = 1; i < 6; i++) {
      ctx.lineTo(corners[i].x, corners[i].y);
    }
    ctx.closePath();

    // Color gradient based on territory type
    const grad = ctx.createRadialGradient(center.x, center.y, 10, center.x, center.y, this.baseHexRadius);

    if (tile.type === 'ONE_NODE') {
      // Bioluminescent Solarpunk Usufruct (Green)
      grad.addColorStop(0, '#065f46');
      grad.addColorStop(1, '#022c22');
      ctx.fillStyle = grad;
      ctx.fill();

      // Glowing emerald border
      ctx.strokeStyle = isHovered ? '#6ee7b7' : '#10b981';
      ctx.lineWidth = isHovered ? 4 : 2.5;
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = isHovered ? 18 : 8;
      ctx.stroke();
      ctx.shadowBlur = 0; // reset

      // Stamped O.N.E. Brand Logo Icon with emerald bioluminescence
      if (this.logoLoaded) {
        const logoSize = isHovered ? 34 : 30;
        ctx.save();
        ctx.shadowColor = '#34d399';
        ctx.shadowBlur = isHovered ? 14 : 6;
        ctx.drawImage(this.logoImg, center.x - logoSize / 2, center.y - 34, logoSize, logoSize);
        ctx.restore();
      } else {
        // Fallback text if image not ready
        ctx.fillStyle = '#ecfdf5';
        ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('☀️ O.N.E.', center.x, center.y - 18);
      }

      ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillStyle = '#ecfdf5';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tile.name.split(' ')[0], center.x, center.y + 6);

      // Usufruct badge
      ctx.fillStyle = 'rgba(16, 185, 129, 0.3)';
      ctx.fillRect(center.x - 34, center.y + 18, 68, 14);
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.6)';
      ctx.lineWidth = 1;
      ctx.strokeRect(center.x - 34, center.y + 18, 68, 14);
      ctx.fillStyle = '#a7f3d0';
      ctx.font = '9px monospace';
      ctx.fillText(t('usufructBadge', 'USUFRUCT'), center.x, center.y + 25);

    } else if (tile.type === 'LEGACY_ZONE') {
      // Extractive Debt Monopoly (Dark Crimson / Industrial Red)
      grad.addColorStop(0, '#7f1d1d');
      grad.addColorStop(1, '#1c0505');
      ctx.fillStyle = grad;
      ctx.fill();

      // Pulsing amber/red threat border
      const pulseRed = Math.sin(this.pulsePhase * 2) * 5 + 10;
      ctx.strokeStyle = isHovered ? '#fca5a5' : '#ef4444';
      ctx.lineWidth = isHovered ? 3.5 : 2;
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = pulseRed;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Icon & Name
      ctx.fillStyle = '#fee2e2';
      ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🏦 LEGACY', center.x, center.y - 12);

      ctx.font = '10px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillStyle = '#fca5a5';
      ctx.fillText(t('legacyDebtBadge', 'DEBT ZONE'), center.x, center.y + 6);

      // Debt per capita badge
      const debtSym = tile.data?.currencySymbol || this.currencySymbol || this.world?.activeNode?.currencySymbol || '$';
      const debtVal = Math.round(tile.data?.debtPerCapita || tile.data?.debtPerCapitaEur || 60000);
      const debtText = `${debtSym}${debtVal.toLocaleString()}/pax`;
      ctx.font = '9px monospace';
      const textW = Math.max(68, ctx.measureText(debtText).width + 12);
      ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
      ctx.fillRect(center.x - textW / 2, center.y + 18, textW, 14);
      ctx.fillStyle = '#f87171';
      ctx.fillText(debtText, center.x, center.y + 25);

    } else {
      // Wild / Unclaimed Commons (Deep Blue-Grey Slate)
      grad.addColorStop(0, '#1e293b');
      grad.addColorStop(1, '#0b0f19');
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.strokeStyle = isHovered ? '#94a3b8' : '#334155';
      ctx.lineWidth = isHovered ? 2.5 : 1;
      ctx.stroke();

      // Biome label
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(t('commonsLabel', '🌱 Commons'), center.x, center.y - 4);

      ctx.font = '9px monospace';
      ctx.fillStyle = '#64748b';
      ctx.fillText(`[${tile.hex.q},${tile.hex.r}]`, center.x, center.y + 12);
    }
  }

  drawSelectionHalo(ctx, hex) {
    const corners = this.layout.polygonCorners(hex);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(corners[0].x, corners[0].y);
    for (let i = 1; i < 6; i++) {
      ctx.lineTo(corners[i].x, corners[i].y);
    }
    ctx.closePath();

    ctx.strokeStyle = '#f59e0b'; // Amber Gold
    ctx.lineWidth = 4;
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 15;
    ctx.stroke();
    ctx.restore();
  }

  drawWatermark(ctx) {
    ctx.save();
    const width = 230;
    const height = 44;
    const x = this.viewportWidth - width - 20;
    const y = this.viewportHeight - height - 80;

    // Glassmorphic background
    ctx.fillStyle = 'rgba(7, 13, 18, 0.7)';
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, 10);
    ctx.fill();
    ctx.stroke();

    // O.N.E. Logo Icon
    if (this.logoLoaded) {
      ctx.save();
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 8;
      ctx.drawImage(this.logoImg, x + 10, y + 8, 28, 28);
      ctx.restore();
    }

    // Watermark text
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#ecfdf5';
    ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('OPEN NETWORKED EARTH', x + 46, y + 9);

    ctx.fillStyle = '#34d399';
    ctx.font = '9px monospace';
    ctx.fillText('O-ASIS // DUAL-TRACK v1.0', x + 46, y + 24);

    ctx.restore();
  }
}
