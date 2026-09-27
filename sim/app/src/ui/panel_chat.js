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

import { CHAT_CHANNELS, QUICK_PHRASE_CATEGORIES, AMBIENT_RESIDENTS } from '../engine/chat_engine.js';
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
    this.activeWhisperRecipient = null;

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
        <span class="chat-launcher-label" data-i18n="chatLauncherLabel">${t('chatLauncherLabel', 'Village Chat')}</span>
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

  updateLauncherText() {
    if (this.launcherBtn) {
      const label = this.launcherBtn.querySelector('.chat-launcher-label');
      if (label) {
        label.textContent = t('chatLauncherLabel', 'Village Chat');
      }
      this.launcherBtn.setAttribute('title', t('chatLauncherTooltip', 'P2P Village Commons Chat (E2EE)'));
    }
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
    this.scrollToBottom(true);
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

  scrollToBottom(force = false) {
    setTimeout(() => {
      const feed = document.getElementById('chat-message-feed');
      if (!feed) return;
      const isNearBottom = (feed.scrollHeight - feed.scrollTop - feed.clientHeight) < 70;
      if (force || isNearBottom) {
        feed.scrollTo({ top: feed.scrollHeight, behavior: 'smooth' });
      }
    }, 40);
  }

  openWhisperWith(recipientName, recipientPubKey = null, recipientFingerprint = null) {
    this.activeChannel = CHAT_CHANNELS.WHISPER;
    this.chatEngine.activeChannel = CHAT_CHANNELS.WHISPER;
    this.activeWhisperRecipient = {
      name: recipientName,
      pubKeyHex: recipientPubKey,
      shortFingerprint: recipientFingerprint || (recipientPubKey ? recipientPubKey.slice(0, 8) + '…' + recipientPubKey.slice(-6) : null)
    };
    this.open();
    setTimeout(() => {
      const inp = document.getElementById('chat-input-text');
      if (inp) inp.focus();
    }, 80);
  }

  render() {
    this.updateLauncherText();
    if (!this.container) return;

    const messages = this.chatEngine.getFilteredMessages(this.activeChannel);
    const activeCat = QUICK_PHRASE_CATEGORIES[this.activeQuickCategory] || QUICK_PHRASE_CATEGORIES.ALERTS;
    const connectedPeers = this.p2pMesh?.getConnectedPeers?.() || [];

    // Ensure default whisper recipient if in WHISPER channel
    if (this.activeChannel === CHAT_CHANNELS.WHISPER && !this.activeWhisperRecipient) {
      if (connectedPeers.length > 0) {
        this.activeWhisperRecipient = {
          name: connectedPeers[0].name,
          pubKeyHex: connectedPeers[0].pubKeyHex,
          shortFingerprint: connectedPeers[0].shortFingerprint
        };
      } else {
        this.activeWhisperRecipient = {
          name: AMBIENT_RESIDENTS[0].name,
          pubKeyHex: 'res_pubkey_elena',
          shortFingerprint: 'res-elen'
        };
      }
    }

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
            <button id="btn-close-chat" class="btn-chat-icon" title="${t('chatMinimizeTitle', 'Minimize Chat')}">✕</button>
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

        <!-- Whisper Direct Recipient Selector -->
        ${this.activeChannel === CHAT_CHANNELS.WHISPER ? `
          <div class="whisper-recipient-bar">
            <span class="whisper-bar-icon">🔒</span>
            <span class="whisper-bar-label">${t('chatWhisperRecipient', 'Recipient')}:</span>
            <select id="select-whisper-recipient" class="whisper-recipient-select">
              ${connectedPeers.length > 0 ? `
                <optgroup label="${t('chatGroupLivePeers', '🌐 Live Human Peers')}">
                  ${connectedPeers.map(p => `
                    <option value="peer:${p.name}:${p.pubKeyHex || ''}:${p.shortFingerprint || ''}" ${this.activeWhisperRecipient?.name === p.name ? 'selected' : ''}>
                      🌐 ${p.name} (${p.pingMs ? `${p.pingMs}ms` : 'P2P'})
                    </option>
                  `).join('')}
                </optgroup>
              ` : ''}
              <optgroup label="${t('chatGroupResidents', '🌱 Settlement Residents')}">
                ${AMBIENT_RESIDENTS.map(r => `
                  <option value="res:${r.name}:res_pubkey_${r.name.toLowerCase()}:res-${r.name.toLowerCase().slice(0, 4)}" ${this.activeWhisperRecipient?.name === r.name ? 'selected' : ''}>
                    ${r.icon} ${r.name} (${r.vocation})
                  </option>
                `).join('')}
              </optgroup>
            </select>
            <span class="whisper-key-chip" title="${t('chatWhisperBoundKey', 'Directly bound to ECDSA public key fingerprint')}">
              🔑 ${this.activeWhisperRecipient?.shortFingerprint || 'E2EE P-256'}
            </span>
          </div>
        ` : ''}

        <!-- Message Feed -->
        <div id="chat-message-feed" class="chat-message-feed">
          ${messages.length === 0 ? `
            <div class="chat-empty-feed">
              <span class="empty-icon">🕊️</span>
              <p>${t('chatEmptyFeed', 'No messages in this channel yet. Send a Smart Quick-Phrase or type below to coordinate with neighbors.')}</p>
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
                  ${cat.icon} ${t(cat.shortNameKey, cat.shortName || cat.name.split(' ')[1] || cat.name)}
                </button>
              `).join('')}
            </div>

            <div class="quick-phrase-chips-grid">
              ${activeCat.phrases.map(qp => `
                <button class="btn-quick-phrase-chip" data-phrase-id="${qp.id}" title="${t(qp.textKey, qp.text)}">
                  <span class="phrase-label">${t(qp.labelKey, qp.label)}</span>
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
            placeholder="${this.activeChannel === CHAT_CHANNELS.WHISPER ? t('chatWhisperPlaceholder', 'Type encrypted whisper (E2EE P-256)...') : t('chatPlaceholder', 'Type signed message to neighbors...')}" 
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
    const isHumanPeer = !isPlayer && (msg.isPeer || msg.isHumanPeer);
    const isNpcResident = !isPlayer && !isHumanPeer;
    const isWhisper = msg.channel === CHAT_CHANNELS.WHISPER;
    const timeStr = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let actionCardHtml = '';
    if (msg.actionType && !msg.actionExecuted) {
      actionCardHtml = `
        <div class="chat-action-card">
          <div class="action-card-header">
            <span>${t('chatActionAvailable', '⚡ Community Action Available:')}</span>
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
          <span>${t('chatTransferExecuted', '✓ Community transfer executed successfully.')}</span>
        </div>
      `;
    }

    let whisperBannerHtml = '';
    if (isWhisper) {
      whisperBannerHtml = `
        <div class="msg-whisper-banner">
          <span class="whisper-banner-lock">🔒</span>
          <span class="whisper-banner-text">
            ${isPlayer 
              ? `${t('chatWhisperTo', 'Whisper to')}: <strong>${msg.recipientName || 'Neighbor'}</strong>`
              : `${t('chatWhisperFrom', 'Private Whisper from')}: <strong>${msg.authorName}</strong>`}
          </span>
          ${msg.recipientFingerprint ? `<span class="whisper-banner-key">🔑 ${msg.recipientFingerprint}</span>` : ''}
          <span class="whisper-e2ee-tag">🔒 ${t('chatWhisperE2EE', 'E2EE P-256')}</span>
        </div>
      `;
    }

    let authorBadgesHtml = '';
    if (isPlayer) {
      authorBadgesHtml = `
        <span class="msg-author-name">${msg.authorName}</span>
        <span class="msg-vocation-tag">${msg.authorVocation || 'Pioneer'}</span>
      `;
    } else if (isHumanPeer) {
      authorBadgesHtml = `
        <span class="msg-author-name peer-name">${msg.authorName}</span>
        <span class="msg-peer-badge live-peer" title="${t('chatPeerLiveTooltip', 'Active real human connected via WebRTC/P2P mesh')}">
          <span class="peer-ping-dot"></span> 🌐 ${t('chatPeerLive', 'Live Peer')} ${msg.pingMs ? `<span class="peer-ping-ms">${msg.pingMs}ms</span>` : ''}
        </span>
        <span class="msg-fingerprint-badge" title="${t('chatFingerprintTooltip', 'ECDSA Public Key Fingerprint')}">
          🔑 ${msg.shortFingerprint || 'Mesh'}
        </span>
      `;
    } else {
      authorBadgesHtml = `
        <span class="msg-author-name resident-name">${msg.authorName}</span>
        <span class="msg-vocation-tag">${msg.authorVocation || 'Resident'}</span>
        <span class="msg-resident-badge" title="${t('chatResidentNpcTooltip', 'Ambient settlement resident (NPC)')}">
          🌱 ${t('chatResidentNpc', 'Resident')}
        </span>
      `;
    }

    if (msg.verified) {
      authorBadgesHtml += `<span class="msg-verified-badge" title="${t('msgVerifiedTooltip', 'Cryptographic signature verified by sovereign passport')}">🔒 ${t('msgVerifiedBadge', 'Verified')}</span>`;
    }

    const rowClasses = [
      'chat-msg-row',
      isPlayer ? 'player-row' : (isHumanPeer ? 'peer-row human-peer' : 'peer-row npc-resident'),
      isWhisper ? 'whisper-row' : ''
    ].filter(Boolean).join(' ');

    return `
      <div class="${rowClasses}">
        <div class="msg-avatar-icon">${msg.authorIcon || (isPlayer ? '👑' : (isHumanPeer ? '🌐' : '🧑'))}</div>
        <div class="msg-bubble-box">
          <div class="msg-author-bar">
            ${authorBadgesHtml}
            <span class="msg-time">${timeStr}</span>
          </div>
          ${whisperBannerHtml}
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

    // Whisper recipient selector change
    const recipientSelect = document.getElementById('select-whisper-recipient');
    if (recipientSelect) {
      recipientSelect.onchange = () => {
        const val = recipientSelect.value;
        const parts = val.split(':');
        // format: type:name:pubKeyHex:shortFingerprint
        this.activeWhisperRecipient = {
          name: parts[1] || 'Resident',
          pubKeyHex: parts[2] || null,
          shortFingerprint: parts[3] || null
        };
        this.render();
      };
    }

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
          p2pMesh: this.p2pMesh,
          recipient: this.activeWhisperRecipient
        });

        this.quickDrawerOpen = false;
        this.render();
        this.scrollToBottom(true);
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
          p2pMesh: this.p2pMesh,
          recipient: this.activeWhisperRecipient
        });

        input.value = '';
        this.render();
        this.scrollToBottom(true);
        this.onMessageSent(sent);
      };
    }
  }
}
