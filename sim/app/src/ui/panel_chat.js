/**
 * P2P Village Chat & Mesh Telegram UI Controller (Agent SIM-5)
 * Solarpunk Glassmorphic Floating Dockable Chat with:
 * - Smart Quick-Phrases categorized drawer (Alerts, Logistics, Sortition, Commons)
 * - Interactive actionable messages (1-click resource claiming/donating)
 * - Cryptographically verified citizen messages (ECDSA Web Crypto)
 * - Multi-channel support (Village Commons, Planetary Radio Mesh, Whispers)
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

import { CHAT_CHANNELS, QUICK_PHRASE_CATEGORIES } from '../engine/chat_engine.js';
import { storageIDB } from '../engine/storage_idb.js';
import { PlayerProfileManager } from '../engine/player_profile.js';
import { t } from '../i18n/index.js';

export class PanelChatController {
  constructor(sim, chatEngine, p2pMesh, onMessageSentCallback = () => {}) {
    this.sim = sim;
    this.chatEngine = chatEngine;
    this.p2pMesh = p2pMesh;
    this.onMessageSent = onMessageSentCallback;

    this.isOpen = false;
    this.activeChannel = CHAT_CHANNELS.VILLAGE;
    this.activeQuickCategory = 'ALERTS';
    this.quickDrawerOpen = false;

    this.initDOM();
  }

  initDOM() {
    // 1. Create Floating Chat Launcher Button if not exists
    let launcher = document.getElementById('btn-toggle-chat');
    if (!launcher) {
      launcher = document.createElement('button');
      launcher.id = 'btn-toggle-chat';
      launcher.className = 'btn-floating-chat-launcher';
      launcher.setAttribute('title', 'P2P Village Commons Chat (E2EE)');
      launcher.innerHTML = `
        <span class="chat-launcher-icon">💬</span>
        <span class="chat-launcher-label">${t('chatLauncherLabel', 'Village Chat')}</span>
        <span id="chat-unread-badge" class="chat-unread-badge hidden">0</span>
      `;
      document.body.appendChild(launcher);
    }
    this.launcherBtn = launcher;

    // 2. Create Floating Chat Window Container if not exists
    let container = document.getElementById('chat-drawer-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'chat-drawer-container';
      container.className = 'chat-drawer-container hidden';
      document.body.appendChild(container);
    }
    this.container = container;

    this.bindEvents();
    this.render();
  }

  bindEvents() {
    this.launcherBtn.onclick = () => {
      this.toggle();
    };
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.isOpen = true;
    this.container.classList.remove('hidden');
    this.launcherBtn.classList.add('active');
    this.chatEngine.markAllAsRead();
    this.updateUnreadBadge();
    this.render();
    this.scrollToBottom();
  }

  close() {
    this.isOpen = false;
    this.container.classList.add('hidden');
    this.launcherBtn.classList.remove('active');
  }

  updateUnreadBadge() {
    const badge = document.getElementById('chat-unread-badge');
    if (!badge) return;
    const count = this.chatEngine.unreadCount;
    if (count > 0 && !this.isOpen) {
      badge.textContent = count > 9 ? '9+' : count;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }

  scrollToBottom() {
    setTimeout(() => {
      const feed = document.getElementById('chat-message-feed');
      if (feed) feed.scrollTop = feed.scrollHeight;
    }, 50);
  }

  render() {
    if (!this.container) return;

    const messages = this.chatEngine.getFilteredMessages(this.activeChannel);
    const activeCat = QUICK_PHRASE_CATEGORIES[this.activeQuickCategory] || QUICK_PHRASE_CATEGORIES.ALERTS;

    let html = `
      <div class="chat-window-glass">
        <!-- Header -->
        <div class="chat-header">
          <div class="chat-title-group">
            <span class="chat-status-dot online"></span>
            <div>
              <div class="chat-title-text">${t('chatTitle', 'Village Commons Chat')}</div>
              <div class="chat-subtitle">
                ${this.activeChannel === CHAT_CHANNELS.VILLAGE 
                  ? `🏘️ ${this.sim.node.name} (P2P Local Mesh)` 
                  : (this.activeChannel === CHAT_CHANNELS.PLANETARY ? '📻 Planetary Radio Mesh (Inter-Node)' : '🔒 Sovereign Whisper (E2EE)')}
              </div>
            </div>
          </div>
          <div class="chat-header-actions">
            <button id="btn-close-chat" class="btn-chat-icon" title="Minimize Chat">✕</button>
          </div>
        </div>

        <!-- Channel Filter Tabs -->
        <div class="chat-channel-tabs">
          <button class="chat-tab-pill ${this.activeChannel === CHAT_CHANNELS.VILLAGE ? 'active' : ''}" data-channel="${CHAT_CHANNELS.VILLAGE}">
            🏘️ ${t('channelVillage', 'Village')}
          </button>
          <button class="chat-tab-pill ${this.activeChannel === CHAT_CHANNELS.PLANETARY ? 'active' : ''}" data-channel="${CHAT_CHANNELS.PLANETARY}">
            📻 ${t('channelPlanetary', 'Radio Mesh')}
          </button>
          <button class="chat-tab-pill ${this.activeChannel === CHAT_CHANNELS.WHISPER ? 'active' : ''}" data-channel="${CHAT_CHANNELS.WHISPER}">
            🔒 ${t('channelWhisper', 'Whisper')}
          </button>
        </div>

        <!-- Message Feed -->
        <div id="chat-message-feed" class="chat-message-feed">
          ${messages.length === 0 ? `
            <div class="chat-empty-feed">
              <span class="empty-icon">🕊️</span>
              <p>No messages in this channel yet. Send a Smart Quick-Phrase or type below to coordinate with neighbors.</p>
            </div>
          ` : messages.map(msg => this.renderMessageCard(msg)).join('')}
        </div>

        <!-- Quick Phrases Drawer (Accordion) -->
        <div class="quick-phrases-drawer ${this.quickDrawerOpen ? 'expanded' : ''}">
          <div class="quick-drawer-toggle-bar" id="btn-toggle-quick-drawer">
            <span>⚡ ${t('smartQuickPhrases', 'Smart Quick-Phrases')}</span>
            <span class="toggle-arrow">${this.quickDrawerOpen ? '▼' : '▲'}</span>
          </div>

          ${this.quickDrawerOpen ? `
            <div class="quick-category-tabs">
              ${Object.values(QUICK_PHRASE_CATEGORIES).map(cat => `
                <button class="btn-quick-cat ${cat.id === this.activeQuickCategory ? 'active' : ''}" data-cat-id="${cat.id}">
                  ${cat.icon} ${cat.name.split(' ')[1] || cat.name}
                </button>
              `).join('')}
            </div>

            <div class="quick-phrase-chips-grid">
              ${activeCat.phrases.map(qp => `
                <button class="btn-quick-phrase-chip" data-phrase-id="${qp.id}" title="${qp.text}">
                  <span class="phrase-label">${qp.label}</span>
                  ${qp.actionType ? '<span class="action-tag">⚡ ACTION</span>' : ''}
                </button>
              `).join('')}
            </div>
          ` : ''}
        </div>

        <!-- Input Bar -->
        <form id="chat-input-form" class="chat-input-bar">
          <input 
            type="text" 
            id="chat-input-text" 
            class="chat-input-field" 
            placeholder="${t('chatPlaceholder', 'Type signed message to neighbors...')}" 
            autocomplete="off" 
          />
          <button type="submit" id="btn-send-chat" class="btn-send-chat" title="Send (Enter)">
            ➤
          </button>
        </form>
      </div>
    `;

    this.container.innerHTML = html;
    this.bindWindowInteractions();
  }

  renderMessageCard(msg) {
    const isPlayer = msg.isPlayer;
    const timeStr = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let actionCardHtml = '';
    if (msg.actionType && !msg.actionExecuted) {
      actionCardHtml = `
        <div class="chat-action-card">
          <div class="action-card-header">
            <span>⚡ Community Action Available:</span>
            <strong>${msg.actionPayload?.amount ? `${msg.actionPayload.amount} ${msg.actionPayload.unit}` : ''}</strong>
          </div>
          <button class="btn-claim-action" data-msg-id="${msg.id}">
            ✓ ${t('btnAcceptCommunityAction', 'Accept & Transfer into Commons')}
          </button>
        </div>
      `;
    } else if (msg.actionExecuted) {
      actionCardHtml = `
        <div class="chat-action-card executed">
          <span>✓ Community transfer executed successfully.</span>
        </div>
      `;
    }

    return `
      <div class="chat-msg-row ${isPlayer ? 'player-row' : 'peer-row'}">
        <div class="msg-avatar-icon">${msg.authorIcon || '🧑'}</div>
        <div class="msg-bubble-box">
          <div class="msg-author-bar">
            <span class="msg-author-name">${msg.authorName}</span>
            <span class="msg-vocation-tag">${msg.authorVocation || 'Resident'}</span>
            ${msg.verified ? '<span class="msg-verified-badge" title="Firma crittografica verificata dal passaporto">🔒 Verificato</span>' : ''}
            <span class="msg-time">${timeStr}</span>
          </div>
          <div class="msg-text-content">${msg.text}</div>
          ${actionCardHtml}
        </div>
      </div>
    `;
  }

  bindWindowInteractions() {
    // Close button
    const closeBtn = document.getElementById('btn-close-chat');
    if (closeBtn) closeBtn.onclick = () => this.close();

    // Channel switchers
    this.container.querySelectorAll('.chat-tab-pill').forEach(btn => {
      btn.onclick = () => {
        this.activeChannel = btn.getAttribute('data-channel');
        this.chatEngine.activeChannel = this.activeChannel;
        this.render();
        this.scrollToBottom();
      };
    });

    // Quick phrases drawer toggle
    const toggleQuick = document.getElementById('btn-toggle-quick-drawer');
    if (toggleQuick) {
      toggleQuick.onclick = () => {
        this.quickDrawerOpen = !this.quickDrawerOpen;
        this.render();
      };
    }

    // Quick categories tabs
    this.container.querySelectorAll('.btn-quick-cat').forEach(btn => {
      btn.onclick = () => {
        this.activeQuickCategory = btn.getAttribute('data-cat-id');
        this.render();
      };
    });

    // Quick phrase chip dispatch
    this.container.querySelectorAll('.btn-quick-phrase-chip').forEach(btn => {
      btn.onclick = async () => {
        const pid = btn.getAttribute('data-phrase-id');
        const cat = QUICK_PHRASE_CATEGORIES[this.activeQuickCategory];
        const phrase = cat?.phrases.find(p => p.id === pid);
        if (!phrase) return;

        const identity = await storageIDB.getActiveIdentity();
        const profile = PlayerProfileManager.getProfile();
        const authorData = identity || (profile ? { name: profile.name, vocationName: profile.vocationName } : null);

        const sent = await this.chatEngine.sendPlayerMessage({
          text: phrase.text,
          channel: this.activeChannel,
          quickPhrase: phrase,
          identity: authorData,
          p2pMesh: this.p2pMesh
        });

        this.quickDrawerOpen = false;
        this.render();
        this.scrollToBottom();
        this.onMessageSent(sent);
      };
    });

    // Claim actionable message button
    this.container.querySelectorAll('.btn-claim-action').forEach(btn => {
      btn.onclick = () => {
        const msgId = btn.getAttribute('data-msg-id');
        const res = this.chatEngine.executeMessageAction(msgId, this.sim.thermo, this.sim.node);
        if (res.success) {
          this.sim.emitNotification('🤝 Action Executed', res.message);
          this.render();
        } else {
          alert(res.reason);
        }
      };
    });

    // Text Input Form submit
    const form = document.getElementById('chat-input-form');
    const input = document.getElementById('chat-input-text');
    if (form && input) {
      form.onsubmit = async e => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;

        const identity = await storageIDB.getActiveIdentity();
        const profile = PlayerProfileManager.getProfile();
        const authorData = identity || (profile ? { name: profile.name, vocationName: profile.vocationName } : null);

        const sent = await this.chatEngine.sendPlayerMessage({
          text,
          channel: this.activeChannel,
          identity: authorData,
          p2pMesh: this.p2pMesh
        });

        input.value = '';
        this.render();
        this.scrollToBottom();
        this.onMessageSent(sent);
      };
    }
  }
}
