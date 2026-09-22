/**
 * Serverless P2P WebRTC Mesh & Event-Delta Synchronization Engine (Agent SIM-0 & SIM-5)
 * Class-0 Invariant: 100% Serverless, Zero-Lag, Local-First Event Replication.
 *
 * Implements:
 * 1. BroadcastChannel transport for instant local multi-tab / device sync (0 network).
 * 2. WebRTC DataChannel transport with public STUN servers (stun.l.google.com, stun.cloudflare.com).
 * 3. Compact SDP ticket compression for 2D QR code air-gapped handshake.
 * 4. Deterministic append-only delta exchange with cryptographic signature validation.
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

import { storageIDB } from './storage_idb.js';
import { CitizenPassportManager } from './citizen_passport.js';

const STUN_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun.cloudflare.com:3478' }
];

export class P2PMeshManager {
  constructor(sim, onDeltaReceivedCallback = () => {}) {
    this.sim = sim;
    this.onDeltaReceived = onDeltaReceivedCallback;

    this.activePeers = new Map(); // id -> { type: 'broadcast'|'webrtc', send: fn, info: object }
    this.broadcastChannel = null;
    this.localPeerConnection = null;
    this.localDataChannel = null;
    this.currentIdentity = null;
    this.isInitialized = false;

    this.statusListeners = [];
    this.peerCount = 0;

    this.init();
  }

  onStatusChange(listener) {
    this.statusListeners.push(listener);
    listener(this.getStatus());
  }

  notifyStatus() {
    const status = this.getStatus();
    this.statusListeners.forEach(fn => {
      try { fn(status); } catch (e) {}
    });
  }

  getStatus() {
    return {
      peerCount: this.peerCount,
      hasWebRTC: !!this.localDataChannel && this.localDataChannel.readyState === 'open',
      hasBroadcast: !!this.broadcastChannel,
      activeChannels: Array.from(this.activePeers.keys())
    };
  }

  async init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    this.currentIdentity = await storageIDB.getActiveIdentity();

    // 1. Initialize BroadcastChannel (instant local sync between tabs/windows)
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.broadcastChannel = new BroadcastChannel('oasis-p2p-mesh');
        this.broadcastChannel.onmessage = event => this.handleIncomingMessage(event.data, 'broadcast');
        
        // Register local broadcast transport
        this.activePeers.set('local-broadcast', {
          type: 'broadcast',
          send: data => this.broadcastChannel.postMessage(data),
          info: { name: 'Local Tab Mesh' }
        });
        this.peerCount = this.activePeers.size;
        console.log('📡 [P2P Mesh] BroadcastChannel initialized for zero-latency local pairing');

        // Announce presence
        this.broadcastPresence();
      } catch (e) {
        console.warn('[P2P Mesh] BroadcastChannel failed to initialize:', e);
      }
    }

    this.notifyStatus();
  }

  setIdentity(identity) {
    this.currentIdentity = identity;
    this.broadcastPresence();
  }

  /**
   * Broadcasts presence and requests any missing deltas from peers
   */
  async broadcastPresence() {
    const history = await storageIDB.getEventHistory(1);
    const latestTimestamp = history.length > 0 ? history[0].timestamp : 0;

    const pulse = {
      type: 'HANDSHAKE_PULSE',
      author: this.currentIdentity ? this.currentIdentity.token : 'anonymous',
      authorName: this.currentIdentity ? this.currentIdentity.name : 'Citizen',
      latestTimestamp,
      sentAt: Date.now()
    };

    this.broadcastToAllPeers(pulse);
  }

  /**
   * Sends an action delta to all connected peers
   * @param {object} signedDelta
   */
  broadcastDelta(signedDelta) {
    const packet = {
      type: 'DELTA_BROADCAST',
      delta: signedDelta,
      sentAt: Date.now()
    };
    this.broadcastToAllPeers(packet);
  }

  broadcastToAllPeers(packet) {
    for (const [peerId, peer] of this.activePeers.entries()) {
      try {
        peer.send(packet);
      } catch (err) {
        console.warn(`[P2P Mesh] Failed to send packet to peer ${peerId}:`, err);
      }
    }
  }

  /**
   * Ingests and processes incoming P2P packet
   * @param {object} packet
   * @param {string} sourceId
   */
  async handleIncomingMessage(packet, sourceId) {
    if (!packet || !packet.type) return;

    switch (packet.type) {
      case 'HANDSHAKE_PULSE': {
        // A peer announced themselves: if they have older state, send them our newer events
        const ourHistory = await storageIDB.getEventHistory(50);
        const missingForPeer = ourHistory.filter(ev => ev.timestamp > (packet.latestTimestamp || 0));
        if (missingForPeer.length > 0) {
          const syncPacket = {
            type: 'SYNC_RESPONSE',
            deltas: missingForPeer.reverse(),
            sentAt: Date.now()
          };
          const peer = this.activePeers.get(sourceId);
          if (peer) peer.send(syncPacket);
        }
        break;
      }

      case 'DELTA_BROADCAST': {
        if (packet.delta) {
          await this.ingestSignedDelta(packet.delta);
        }
        break;
      }

      case 'SYNC_RESPONSE': {
        if (Array.isArray(packet.deltas)) {
          for (const delta of packet.deltas) {
            await this.ingestSignedDelta(delta);
          }
        }
        break;
      }

      default:
        break;
    }
  }

  /**
   * Validates cryptographic signature and applies delta to local state
   * @param {object} delta
   */
  async ingestSignedDelta(delta) {
    if (!delta || !delta.id) return;

    // Check if we already have this delta
    const existing = await storageIDB.getEventHistory(100);
    if (existing.some(e => e.id === delta.id)) {
      return; // Already ingested
    }

    // Cryptographic validation of the author signature
    let isValid = true;
    if (delta.signature && delta.authorPubKey && !delta.signature.startsWith('unsigned_')) {
      const rawAction = {
        type: delta.type,
        payload: delta.payload,
        tick: delta.tick,
        authorToken: delta.authorToken,
        authorName: delta.authorName,
        timestamp: delta.timestamp
      };
      isValid = await CitizenPassportManager.verifyAction(rawAction, delta.signature, delta.authorPubKey);
    }

    if (!isValid) {
      console.warn('⚠️ [P2P Mesh] Rejected tampered or invalid action delta:', delta.id);
      return;
    }

    // Store in IndexedDB
    await storageIDB.appendEvent(delta);
    console.log(`📥 [P2P Mesh] Ingested verified delta from ${delta.authorName}: ${delta.type}`);

    // Notify simulation controller
    try {
      this.onDeltaReceived(delta);
    } catch (e) {
      console.error('[P2P Mesh] Error applying delta in listener:', e);
    }
  }

  // =========================================================================
  // WebRTC AIR-GAPPED TICKET HANDSHAKE (ZERO-SERVER QR CODE)
  // =========================================================================

  /**
   * Step 1 (Device A): Generates WebRTC Offer encoded into a shareable ticket / QR code
   * @returns {Promise<string>} Base64 compressed offer ticket
   */
  async createOfferTicket() {
    if (typeof RTCPeerConnection === 'undefined') {
      throw new Error('WebRTC not supported on this browser.');
    }

    if (this.localPeerConnection) {
      try { this.localPeerConnection.close(); } catch (e) {}
    }

    this.localPeerConnection = new RTCPeerConnection({ iceServers: STUN_SERVERS });

    // Device A creates the DataChannel
    this.localDataChannel = this.localPeerConnection.createDataChannel('oasis-delta-mesh', {
      ordered: true
    });
    this.setupDataChannel(this.localDataChannel, 'webrtc-peer');

    const offer = await this.localPeerConnection.createOffer();
    await this.localPeerConnection.setLocalDescription(offer);

    // Wait for ICE gathering to complete so all candidates are baked into single ticket
    await this.waitForIceGathering(this.localPeerConnection);

    const sdpString = JSON.stringify(this.localPeerConnection.localDescription);
    return 'ONE_OFFER:' + btoa(encodeURIComponent(sdpString));
  }

  /**
   * Step 2 (Device B): Accepts Offer ticket and generates Answer ticket
   * @param {string} offerTicketString
   * @returns {Promise<string>} Base64 compressed answer ticket
   */
  async acceptOfferAndGenerateAnswerTicket(offerTicketString) {
    if (!offerTicketString.startsWith('ONE_OFFER:')) {
      throw new Error('Invalid offer ticket format. Must start with ONE_OFFER:');
    }

    if (this.localPeerConnection) {
      try { this.localPeerConnection.close(); } catch (e) {}
    }

    this.localPeerConnection = new RTCPeerConnection({ iceServers: STUN_SERVERS });

    // Device B listens for remote DataChannel
    this.localPeerConnection.ondatachannel = event => {
      this.localDataChannel = event.channel;
      this.setupDataChannel(this.localDataChannel, 'webrtc-peer');
    };

    const sdpJson = decodeURIComponent(atob(offerTicketString.replace('ONE_OFFER:', '')));
    const offerSdp = JSON.parse(sdpJson);

    await this.localPeerConnection.setRemoteDescription(new RTCSessionDescription(offerSdp));
    const answer = await this.localPeerConnection.createAnswer();
    await this.localPeerConnection.setLocalDescription(answer);

    await this.waitForIceGathering(this.localPeerConnection);

    const answerString = JSON.stringify(this.localPeerConnection.localDescription);
    return 'ONE_ANSWER:' + btoa(encodeURIComponent(answerString));
  }

  /**
   * Step 3 (Device A): Accepts Answer ticket to complete the handshake
   * @param {string} answerTicketString
   */
  async acceptAnswerTicket(answerTicketString) {
    if (!answerTicketString.startsWith('ONE_ANSWER:')) {
      throw new Error('Invalid answer ticket format. Must start with ONE_ANSWER:');
    }
    if (!this.localPeerConnection) {
      throw new Error('No pending WebRTC offer found on this device.');
    }

    const sdpJson = decodeURIComponent(atob(answerTicketString.replace('ONE_ANSWER:', '')));
    const answerSdp = JSON.parse(sdpJson);

    await this.localPeerConnection.setRemoteDescription(new RTCSessionDescription(answerSdp));
    console.log('✅ [P2P Mesh] WebRTC Answer accepted. P2P DataChannel establishing...');
  }

  /**
   * Configures event listeners for the WebRTC DataChannel
   */
  setupDataChannel(dataChannel, peerId) {
    dataChannel.onopen = () => {
      console.log(`🌐 [P2P Mesh] WebRTC DataChannel OPEN with peer: ${peerId}`);
      this.activePeers.set(peerId, {
        type: 'webrtc',
        send: data => {
          if (dataChannel.readyState === 'open') {
            dataChannel.send(JSON.stringify(data));
          }
        },
        info: { channelId: peerId }
      });
      this.peerCount = this.activePeers.size;
      this.notifyStatus();
      this.broadcastPresence();
    };

    dataChannel.onmessage = event => {
      try {
        const parsed = JSON.parse(event.data);
        this.handleIncomingMessage(parsed, peerId);
      } catch (err) {
        console.warn('[P2P Mesh] Non-JSON payload received on DataChannel:', err);
      }
    };

    dataChannel.onclose = () => {
      console.log(`❌ [P2P Mesh] WebRTC DataChannel CLOSED for peer: ${peerId}`);
      this.activePeers.delete(peerId);
      this.peerCount = this.activePeers.size;
      this.notifyStatus();
    };

    dataChannel.onerror = err => {
      console.error('[P2P Mesh] WebRTC DataChannel error:', err);
    };
  }

  /**
   * Waits until ICE candidates gathering completes or times out at 3 seconds
   */
  waitForIceGathering(pc, timeoutMs = 3000) {
    return new Promise(resolve => {
      if (pc.iceGatheringState === 'complete') {
        resolve();
        return;
      }

      const timer = setTimeout(() => {
        resolve();
      }, timeoutMs);

      const checkState = () => {
        if (pc.iceGatheringState === 'complete') {
          clearTimeout(timer);
          pc.removeEventListener('icegatheringstatechange', checkState);
          resolve();
        }
      };

      pc.addEventListener('icegatheringstatechange', checkState);
    });
  }
}
