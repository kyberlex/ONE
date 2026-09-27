/**
 * Multiplayer Settlement Invite & Serverless Signaling Controller (Agent SIM-5 & SIM-0)
 * Class-0 Invariant: 100% Serverless, Zero-Lag, Local-First Event Replication.
 *
 * Implements:
 * 1. One-click shareable URL generator with active node and ephemeral room token.
 * 2. 2D SVG QR Code generator for instant camera pairing across mobile & desktop.
 * 3. Live Serverless Nostr WebRTC mesh status telemetry.
 * 4. Native Web Share API integration with clipboard fallback.
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

import { QRCodeSVG } from '../engine/qr_generator.js';
import { t } from '../i18n/index.js';

export class PanelInviteController {
  constructor(sim, p2pMesh, options = {}) {
    this.sim = sim;
    this.p2pMesh = p2pMesh;
    this.onPeerJoined = options.onPeerJoined || (() => {});

    this.modalEl = document.getElementById('modal-invite');
    this.contentEl = document.getElementById('invite-modal-content');
    this.closeBtn = document.getElementById('btn-close-invite-modal');
    this.hudInviteBtn = document.getElementById('btn-invite-friend');

    this.isOpen = false;
    this.activeNode = null;
    this.currentRoomId = null;
    this.lastPeerCount = 0;

    this.bindEvents();

    if (this.p2pMesh) {
      this.p2pMesh.onStatusChange(status => {
        this.handleStatusUpdate(status);
      });
    }
  }

  bindEvents() {
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }

    if (this.modalEl) {
      this.modalEl.addEventListener('click', e => {
        if (e.target === this.modalEl) this.close();
      });
    }

    if (this.hudInviteBtn) {
      this.hudInviteBtn.addEventListener('click', () => this.open());
    }
  }

  handleStatusUpdate(status) {
    if (this.isOpen) {
      this.updateTelemetrySection(status);
    }

    // Trigger celebration when a new peer connects
    const remotePeers = (status.peers || []).filter(p => p.type === 'serverless-room');
    if (remotePeers.length > this.lastPeerCount) {
      const latestPeer = remotePeers[remotePeers.length - 1];
      const peerName = latestPeer.name || t('defaultPioneerName', 'Pioneer');
      this.onPeerJoined(peerName);
    }
    this.lastPeerCount = remotePeers.length;
  }

  open(options = {}) {
    this.isOpen = true;
    this.activeNode = options.node || this.sim.node;

    // Preserve existing room if already joined, or generate a fresh room token
    if (this.p2pMesh.activeRoomId) {
      this.currentRoomId = this.p2pMesh.activeRoomId;
    } else {
      this.currentRoomId = this.p2pMesh.generateRoomId(this.activeNode.id || 'settlement');
      this.p2pMesh.joinSignalingRoom(this.currentRoomId);
    }

    this.render();

    if (this.modalEl) {
      this.modalEl.classList.remove('hidden');
    }
  }

  close() {
    this.isOpen = false;
    if (this.modalEl) {
      this.modalEl.classList.add('hidden');
    }
  }

  generateFreshRoom() {
    this.currentRoomId = this.p2pMesh.generateRoomId(this.activeNode.id || 'settlement');
    this.p2pMesh.joinSignalingRoom(this.currentRoomId);
    this.render();
  }

  render() {
    if (!this.contentEl) return;

    const nodeId = this.activeNode.id || 'detroit';
    const nodeName = this.activeNode.name || 'Detroit Delray';
    const inviteUrl = this.p2pMesh.generateInviteUrl(nodeId, this.currentRoomId);
    const qrSvg = QRCodeSVG.generateSVG(inviteUrl, { size: 160, color: '#38bdf8' });
    const hasWebShare = typeof navigator !== 'undefined' && !!navigator.share;

    const status = this.p2pMesh.getStatus();
    const remotePeers = (status.peers || []).filter(p => p.type === 'serverless-room');
    const isConnected = remotePeers.length > 0;

    this.contentEl.innerHTML = `
      <div class="invite-modal-container">
        <!-- Node Context Header Banner -->
        <div class="invite-node-banner">
          <div class="invite-banner-icon">🌿</div>
          <div class="invite-banner-text">
            <h4>${nodeName}</h4>
            <span>${t('inviteModalDesc', 'Invite a friend to build resilience together! Anyone visiting this link connects directly via serverless WebRTC over Nostr relays — zero servers, zero accounts.')}</span>
          </div>
        </div>

        <!-- URL Copy Section -->
        <div class="invite-link-section">
          <label class="invite-field-label">🔗 ${t('inviteShareUrlLabel', 'Shareable Settlement Room URL:')}</label>
          <div class="invite-input-row">
            <input type="text" id="invite-url-input" class="invite-url-field" readonly value="${inviteUrl}" />
            <button id="btn-copy-invite-url" class="btn-action-small btn-primary" title="${t('btnCopyInviteLink', 'Copy Link')}">
              📋 <span id="copy-btn-label">${t('btnCopyInviteLink', 'Copy Link')}</span>
            </button>
            ${hasWebShare ? `
              <button id="btn-share-invite-url" class="btn-action-small btn-secondary" title="${t('btnShareInviteLink', 'Share Link')}">
                📲 <span>${t('btnShareInviteLink', 'Share Link')}</span>
              </button>
            ` : ''}
          </div>
        </div>

        <!-- QR Code & Scanning Guide -->
        <div class="invite-qr-card">
          <div class="invite-qr-box">
            ${qrSvg}
          </div>
          <div class="invite-qr-info">
            <h5>📱 ${t('inviteQrCaption', 'Scan with any phone or tablet camera to instantly enter this settlement.')}</h5>
            <p class="invite-qr-subtext">
              ${t('inviteQrSubtext', 'Direct air-to-browser handshake: zero installation required. Instant WebRTC DataChannel established automatically.')}
            </p>
            <div class="invite-quick-actions">
              <button id="btn-regenerate-room" class="btn-action-small btn-secondary">
                🔄 ${t('inviteBtnNewRoom', 'New Room Code')}
              </button>
            </div>
          </div>
        </div>

        <!-- Serverless Mesh Status Telemetry -->
        <div id="invite-telemetry-container" class="invite-telemetry-card">
          ${this.getTelemetryHtml(status)}
        </div>
      </div>
    `;

    this.bindCardActions(inviteUrl);
  }

  bindCardActions(inviteUrl) {
    // Copy URL button
    const copyBtn = this.contentEl.querySelector('#btn-copy-invite-url');
    const copyLabel = this.contentEl.querySelector('#copy-btn-label');
    const inputField = this.contentEl.querySelector('#invite-url-input');

    if (copyBtn && inputField) {
      copyBtn.addEventListener('click', async () => {
        try {
          inputField.select();
          inputField.setSelectionRange(0, 99999);
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(inviteUrl);
          } else {
            document.execCommand('copy');
          }
          if (copyLabel) {
            copyLabel.textContent = t('btnCopiedInviteLink', 'Copied! ✔');
            copyBtn.classList.add('btn-copied-flash');
            setTimeout(() => {
              if (copyLabel) copyLabel.textContent = t('btnCopyInviteLink', 'Copy Link');
              copyBtn.classList.remove('btn-copied-flash');
            }, 2500);
          }
        } catch (err) {
          console.warn('[Invite] Clipboard copy failed:', err);
        }
      });
    }

    // Web Share button
    const shareBtn = this.contentEl.querySelector('#btn-share-invite-url');
    if (shareBtn && typeof navigator !== 'undefined' && navigator.share) {
      shareBtn.addEventListener('click', async () => {
        try {
          await navigator.share({
            title: `O-ASIS: ${this.activeNode.name || 'Settlement'}`,
            text: t('inviteShareText', 'Join my resilience haven in O.N.E. Dual-Track!'),
            url: inviteUrl
          });
        } catch (err) {
          // User cancelled or share aborted
        }
      });
    }

    // Regenerate room button
    const regenBtn = this.contentEl.querySelector('#btn-regenerate-room');
    if (regenBtn) {
      regenBtn.addEventListener('click', () => {
        this.generateFreshRoom();
      });
    }
  }

  getTelemetryHtml(status) {
    const remotePeers = (status.peers || []).filter(p => p.type === 'serverless-room');
    const isConnected = remotePeers.length > 0;
    const roomCode = this.currentRoomId || status.activeRoomId || '—';

    let peerListHtml = '';
    if (isConnected) {
      peerListHtml = `
        <div class="invite-connected-peers-list">
          ${remotePeers.map(p => `
            <div class="invite-peer-badge">
              <span class="invite-peer-dot">●</span>
              <span class="invite-peer-name">${p.name || 'Pioneer'}</span>
              <span class="invite-peer-id">(${p.id.replace('trystero-', '').slice(0, 6)})</span>
            </div>
          `).join('')}
        </div>
      `;
    }

    return `
      <div class="invite-telemetry-header">
        <span>📡 ${t('inviteRoomDetailsTitle', 'Live Serverless Mesh Status')}</span>
        <span class="badge ${isConnected ? 'badge-success' : 'badge-neutral'}">
          ${isConnected ? 'P2P CONNECTED' : 'RELAY STANDBY'}
        </span>
      </div>
      <div class="invite-telemetry-grid">
        <div class="invite-telemetry-row">
          <span>${t('inviteRoomCodeLabel', 'Room Code:')}</span>
          <strong class="invite-code-pill">${roomCode}</strong>
        </div>
        <div class="invite-telemetry-row">
          <span>${t('inviteRelayStatusLabel', 'Relay Network:')}</span>
          <span style="color: #67e8f9;">● ${t('inviteRelayStatusVal', 'Nostr NIP-01 WebRTC Mesh')}</span>
        </div>
        <div class="invite-telemetry-row">
          <span>${t('passport.label_direct_connection', 'Direct Network Mesh:')}</span>
          <span class="${isConnected ? 'status-indicator-active' : 'status-indicator-waiting'}">
            ${isConnected 
              ? `🎉 ${t('inviteStatusConnected', '{count} peer(s) connected! WebRTC DataChannel active.').replace('{count}', remotePeers.length)}` 
              : `⏳ ${t('inviteStatusWaiting', 'Waiting for friend to open link...')}`}
          </span>
        </div>
      </div>
      ${peerListHtml}
    `;
  }

  updateTelemetrySection(status) {
    const container = this.contentEl ? this.contentEl.querySelector('#invite-telemetry-container') : null;
    if (container) {
      container.innerHTML = this.getTelemetryHtml(status);
    }
  }
}
