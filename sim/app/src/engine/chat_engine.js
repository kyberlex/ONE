/**
 * P2P Village Chat & Mesh Telegram Engine (Agent SIM-5 & SIM-3)
 * Manages:
 * 1. P2P E2EE message stream (Village Commons, Planetary Radio, Direct Whispers).
 * 2. 4 Categorized Smart Quick-Phrases with dynamic parameter interpolation.
 * 3. Action-rich community messages with executable resource transfers.
 * 4. Ambient resident life chatter based on local thermodynamic triggers.
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

import { CitizenPassportManager } from './citizen_passport.js';
import { PlayerProfileManager } from './player_profile.js';

export const CHAT_CHANNELS = {
  VILLAGE: 'VILLAGE',     // Local settlement commons
  PLANETARY: 'PLANETARY', // Inter-node radio mesh telegram
  WHISPER: 'WHISPER'      // Direct peer-to-peer whisper
};

function bufToHex(buffer) {
  const bytes = new Uint8Array(buffer);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

function hexToBuf(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes.buffer;
}

/**
 * Encrypts a private direct whisper payload bound to recipient public key / fingerprint
 * @param {string} plaintext
 * @param {string} recipientKey
 * @returns {Promise<{ ciphertext: string, iv: string }>}
 */
export async function encryptWhisper(plaintext, recipientKey) {
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    return { ciphertext: btoa(unescape(encodeURIComponent(plaintext))), iv: 'compat' };
  }
  try {
    const enc = new TextEncoder();
    const keyData = enc.encode(String(recipientKey || 'oasis-whisper-key'));
    const hash = await crypto.subtle.digest('SHA-256', keyData);
    const key = await crypto.subtle.importKey(
      'raw',
      hash,
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encryptedBuf = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      enc.encode(plaintext)
    );
    return {
      ciphertext: bufToHex(encryptedBuf),
      iv: bufToHex(iv)
    };
  } catch (e) {
    console.warn('[ChatEngine] Whisper encryption fallback:', e);
    return { ciphertext: btoa(unescape(encodeURIComponent(plaintext))), iv: 'plain' };
  }
}

/**
 * Decrypts a private direct whisper payload bound to recipient public key / fingerprint
 * @param {string} ciphertext
 * @param {string} ivHex
 * @param {string} recipientKey
 * @returns {Promise<string>}
 */
export async function decryptWhisper(ciphertext, ivHex, recipientKey) {
  if (!ciphertext) return '';
  if (ivHex === 'plain' || ivHex === 'compat') {
    try {
      return decodeURIComponent(escape(atob(ciphertext)));
    } catch (e) {
      return ciphertext;
    }
  }
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    return ciphertext;
  }
  try {
    const enc = new TextEncoder();
    const keyData = enc.encode(String(recipientKey || 'oasis-whisper-key'));
    const hash = await crypto.subtle.digest('SHA-256', keyData);
    const key = await crypto.subtle.importKey(
      'raw',
      hash,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );
    const cipherBuf = hexToBuf(ciphertext);
    const ivBuf = hexToBuf(ivHex);
    const decryptedBuf = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: ivBuf },
      key,
      cipherBuf
    );
    return new TextDecoder().decode(decryptedBuf);
  } catch (e) {
    console.warn('[ChatEngine] Whisper decryption failed:', e);
    return '[🔒 Encrypted Whisper Payload]';
  }
}

export const QUICK_PHRASE_CATEGORIES = {
  ALERTS: {
    id: 'ALERTS',
    name: '⚡ Thermodynamic Alerts',
    icon: '⚡',
    phrases: [
      {
        id: 'galvanic_island',
        label: 'Pass to Galvanic Islanding',
        text: '⚠️ Grid vulnerability detected! Recommending immediate galvanic islanding to protect community battery banks.',
        actionType: 'TRIGGER_ISLAND_MODE'
      },
      {
        id: 'shed_luxury_loads',
        label: 'Shed High-Draw Loads',
        text: '🔋 Thermal stress alert: let us pause luxury appliances and prioritize medical cold-chains and hydroponics.',
        actionType: null
      },
      {
        id: 'burn_solar_surplus',
        label: 'Engage FabLab Smelter (Surplus)',
        text: '☀️ Battery bank at 95%! Fire up the induction furnace and CNC mills to convert surplus solar energy into structural ingots.',
        actionType: 'DONATE_ENERGY',
        actionAmount: 30,
        actionUnit: 'kWh'
      },
      {
        id: 'water_conservation',
        label: 'Activate Drip Conservation',
        text: '💧 Cistern level below optimal buffer. Let us switch vertical farms to pulsed night drip irrigation.',
        actionType: null
      }
    ]
  },
  LOGISTICS: {
    id: 'LOGISTICS',
    name: '🚚 Barter & Logistics',
    icon: '🚚',
    phrases: [
      {
        id: 'offer_surplus_energy',
        label: 'Offer 50 kWh Energy Buffer',
        text: '⚡ We have 50 kWh surplus energy stored in transport cells. Any sister node in need of battery buffer?',
        actionType: 'OFFER_ENERGY',
        actionAmount: 50,
        actionUnit: 'kWh'
      },
      {
        id: 'offer_surplus_water',
        label: 'Offer 1,000 L Pure Water',
        text: '💧 Gravity headwaters running clear! Offering 1,000 L filtered water for exchange with regional caravans.',
        actionType: 'OFFER_WATER',
        actionAmount: 1000,
        actionUnit: 'L'
      },
      {
        id: 'request_spare_parts',
        label: 'Request CNC Machine Parts',
        text: '🧰 Our reverse-osmosis pump needs replacement mechanical seals. Can a machining haven dispatch spare kits?',
        actionType: null
      },
      {
        id: 'solidarity_convoy_alert',
        label: 'Launch Solidarity Shipment',
        text: '🕊️ Calling for mutual aid: sister settlement facing disaster. Let us assemble a relief convoy!',
        actionType: null
      }
    ]
  },
  DEMARCHY: {
    id: 'DEMARCHY',
    name: '🏛️ Sortition Council & Agora',
    nameKey: 'chat.cat_demarchy',
    shortName: 'Council',
    shortNameKey: 'chat.cat_demarchy_short',
    icon: '🏛️',
    phrases: [
      {
        id: 'council_caucus',
        label: 'Council Opinion Query',
        labelKey: 'chat.phrase_council_caucus_label',
        text: '🏛️ As a member of the Citizen Council, I ask everyone for input on the active dilemma!',
        textKey: 'chat.phrase_council_caucus_text',
        actionType: null
      },
      {
        id: 'uphold_usufruct',
        label: 'Defend Usufruct Invariant',
        labelKey: 'chat.phrase_uphold_usufruct_label',
        text: '📜 Reminder: unoccupied dwellings return to the civic commons. Zero real-estate speculation.',
        textKey: 'chat.phrase_uphold_usufruct_text',
        actionType: null
      },
      {
        id: 'call_mediation',
        label: 'Civic Mediation Board',
        labelKey: 'chat.phrase_call_mediation_label',
        text: '⚖️ Community friction detected. Requesting review by the Civic Mediation Board.',
        textKey: 'chat.phrase_call_mediation_text',
        actionType: null
      },
      {
        id: 'celebrate_rotation',
        label: 'Council Rotation Handover',
        labelKey: 'chat.phrase_celebrate_rotation_label',
        text: '🌿 Thanks to outgoing citizens for their civic rotation. Welcome to the newly drawn sortition members!',
        textKey: 'chat.phrase_celebrate_rotation_text',
        actionType: null
      }
    ]
  },
  COMMONS: {
    id: 'COMMONS',
    name: '🤝 Civic Projects & Mutual Aid',
    icon: '🤝',
    phrases: [
      {
        id: 'volunteer_baking',
        label: 'Community Kitchen Volunteer Shift',
        text: '🥖 Baking fresh sourdough and roasting harvested tubers at the civic clay oven. Everyone welcome for lunch!',
        actionType: 'DONATE_FOOD',
        actionAmount: 5000,
        actionUnit: 'kcal'
      },
      {
        id: 'sabbatical_custody_offer',
        label: 'Offer Sabbatical Plant Care',
        text: '🌱 Offering neighborly plant custody for anyone taking a sabbatical journey this month.',
        actionType: null
      },
      {
        id: 'fablab_shredding_bee',
        label: 'Plastic Shredding & Filament Bee',
        text: '♻️ Gathering at the FabLab tonight to shred post-consumer PETG and wind 10 new 3D printing spools. Join in!',
        actionType: 'DONATE_MATERIALS',
        actionAmount: 10,
        actionUnit: 'kg'
      },
      {
        id: 'night_music_circle',
        label: 'Acoustic Music Circle at Pavilion',
        text: '🪕 Shift duties done for today! Gathering under the geodesic dome for acoustic music, hot tea, and stargazing.',
        actionType: 'COMMUNITY_CHEER'
      }
    ]
  }
};

/**
 * Ambient simulated citizen profiles for village life immersion
 */
export const AMBIENT_RESIDENTS = [
  { name: 'Elena', vocation: 'Permaculturist', icon: '🌱' },
  { name: 'Tariq', vocation: 'Solar Microgrid Engineer', icon: '⚡' },
  { name: 'Maya', vocation: 'Community Health Medic', icon: '🩺' },
  { name: 'Liam', vocation: 'FabLab CNC Artisan', icon: '🔨' },
  { name: 'Amara', vocation: 'Hydroponics & Aquaculture', icon: '💧' },
  { name: 'Kwame', vocation: 'Logistics Caravan Navigator', icon: '🚚' }
];

export class ChatEngine {
  constructor(sim, onNewMessageCallback = () => {}) {
    this.sim = sim;
    this.onNewMessage = onNewMessageCallback;
    this.messages = [];
    this.unreadCount = 0;
    this.activeChannel = CHAT_CHANNELS.VILLAGE;
    this.lastAmbientTick = 0;

    this.loadHistory();
    this.seedWelcomeMessages();
  }

  seedWelcomeMessages() {
    if (this.messages.length === 0) {
      this.addMessage({
        id: 'msg-welcome-1',
        channel: CHAT_CHANNELS.VILLAGE,
        authorName: 'Tariq',
        authorVocation: 'Solar Microgrid Engineer',
        authorIcon: '⚡',
        isPeer: false,
        text: 'Morning everyone! Microgrid battery banks reached 94% with morning sun. Water pumps operating on direct solar.',
        timestamp: Date.now() - 3600000,
        verified: true
      });
      this.addMessage({
        id: 'msg-welcome-2',
        channel: CHAT_CHANNELS.VILLAGE,
        authorName: 'Elena',
        authorVocation: 'Permaculturist',
        authorIcon: '🌱',
        isPeer: false,
        text: 'The southern greenhouse aeroponic towers are in full bloom. Fresh leafy greens available at the civic pantry.',
        timestamp: Date.now() - 1800000,
        verified: true
      });
    }
  }

  getFilteredMessages(channel = this.activeChannel) {
    return this.messages.filter(m => m.channel === channel);
  }

  async addMessage(msg) {
    if (!msg || (!msg.text && !msg.ciphertext)) return null;

    // 1. Deduplicate by exact ID
    if (msg.id && this.messages.some(m => m.id === msg.id)) {
      return this.messages.find(m => m.id === msg.id);
    }

    // 2. Whisper Privacy Filter & Decryption
    let displayText = msg.text ? msg.text.trim() : '';
    if (msg.channel === CHAT_CHANNELS.WHISPER && !msg.isPlayer) {
      const myIdentity = this.sim?.myIdentity || null;
      const myProfile = PlayerProfileManager.getProfile();
      const myName = myIdentity?.name || myProfile?.name || 'Player';
      const myPubKey = myIdentity?.pubKeyHex || null;
      const myFingerprint = myIdentity?.shortFingerprint || null;

      const isTargetedToMe = (
        !msg.recipientName ||
        (msg.recipientName.toLowerCase() === myName.toLowerCase() ||
         msg.recipientName === 'Player (You)' ||
         msg.recipientName === 'You' ||
         msg.recipientName === 'Pioneer') ||
        (msg.recipientFingerprint && myFingerprint && msg.recipientFingerprint === myFingerprint) ||
        (msg.recipientPubKey && myPubKey && msg.recipientPubKey === myPubKey)
      );

      // Discard whisper if not addressed to local player
      if (!isTargetedToMe) {
        return null;
      }

      // If encrypted, decrypt using our key material
      if (msg.isEncrypted && msg.ciphertext && msg.iv) {
        const keyMaterial = myPubKey || myFingerprint || myName;
        displayText = await decryptWhisper(msg.ciphertext, msg.iv, keyMaterial);
        msg.decrypted = true;
      }
    }

    // 3. Deduplicate by content + author + recent time window (within 12 seconds)
    const msgAuthor = msg.authorName || 'Citizen';
    const now = msg.timestamp || Date.now();
    const isRecentDuplicate = this.messages.some(m => 
      m.authorName === msgAuthor &&
      m.text?.trim() === displayText &&
      Math.abs(now - (m.timestamp || 0)) < 12000
    );
    if (isRecentDuplicate) {
      return null;
    }

    const formatted = {
      id: msg.id || `msg-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`,
      channel: msg.channel || this.activeChannel,
      authorName: msgAuthor,
      authorVocation: msg.authorVocation || 'Resident',
      authorIcon: msg.authorIcon || '🧑',
      authorPubKey: msg.authorPubKey || null,
      shortFingerprint: msg.shortFingerprint || null,
      isPlayer: !!msg.isPlayer,
      isPeer: !!msg.isPeer,
      isHumanPeer: !!msg.isPeer,
      pingMs: msg.pingMs || null,
      recipientName: msg.recipientName || null,
      recipientPubKey: msg.recipientPubKey || null,
      recipientFingerprint: msg.recipientFingerprint || null,
      isEncrypted: !!msg.isEncrypted,
      ciphertext: msg.ciphertext || null,
      iv: msg.iv || null,
      text: displayText,
      actionType: msg.actionType || null,
      actionPayload: msg.actionPayload || null,
      actionExecuted: !!msg.actionExecuted,
      timestamp: now,
      verified: msg.verified !== undefined ? msg.verified : true
    };

    this.messages.push(formatted);
    if (!formatted.isPlayer) {
      this.unreadCount++;
    }

    this.saveHistory();
    this.onNewMessage(formatted);
    return formatted;
  }

  markAllAsRead() {
    this.unreadCount = 0;
  }

  /**
   * Dispatches an outgoing message from the local player
   */
  async sendPlayerMessage({ text, channel = this.activeChannel, quickPhrase = null, identity = null, p2pMesh = null, recipient = null }) {
    let actionType = null;
    let actionPayload = null;

    if (quickPhrase) {
      actionType = quickPhrase.actionType;
      if (quickPhrase.actionAmount) {
        actionPayload = {
          amount: quickPhrase.actionAmount,
          unit: quickPhrase.actionUnit,
          source: identity ? identity.name : 'Player'
        };
      }
    }

    let isEncrypted = false;
    let ciphertext = null;
    let iv = null;
    let recipientName = null;
    let recipientPubKey = null;
    let recipientFingerprint = null;

    if (channel === CHAT_CHANNELS.WHISPER) {
      recipientName = recipient?.name || 'Resident';
      recipientPubKey = recipient?.pubKeyHex || null;
      recipientFingerprint = recipient?.shortFingerprint || (recipientPubKey ? recipientPubKey.slice(0, 8) + '…' + recipientPubKey.slice(-6) : null);

      const encTarget = recipientPubKey || recipientFingerprint || recipientName;
      const enc = await encryptWhisper(text, encTarget);
      ciphertext = enc.ciphertext;
      iv = enc.iv;
      isEncrypted = true;
    }

    const newMsg = {
      id: `msg-p2p-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`,
      channel,
      authorName: identity ? identity.name : 'You (Pioneer)',
      authorVocation: identity ? (identity.vocationName || 'Pioneer') : 'Pioneer',
      authorIcon: identity ? (identity.avatarIcon || '👑') : '👑',
      authorPubKey: identity ? identity.pubKeyHex : null,
      shortFingerprint: identity ? identity.shortFingerprint : 'Local',
      isPlayer: true,
      isPeer: false,
      isHumanPeer: false,
      recipientName,
      recipientPubKey,
      recipientFingerprint,
      isEncrypted,
      ciphertext,
      iv,
      text,
      actionType,
      actionPayload,
      timestamp: Date.now(),
      verified: true
    };

    await this.addMessage(newMsg);

    // Broadcast across P2P WebRTC / BroadcastChannel
    if (p2pMesh) {
      const deltaId = `delta-chat-${newMsg.id}`;
      const signedDelta = {
        id: deltaId,
        type: 'CHAT_MESSAGE',
        authorToken: identity ? identity.token : 'anonymous',
        authorName: newMsg.authorName,
        authorPubKey: newMsg.authorPubKey,
        payload: {
          ...newMsg,
          isPlayer: false,
          isPeer: true,
          pingMs: p2pMesh.getPeerLatency?.() || 12
        },
        timestamp: Date.now(),
        tick: this.sim.tickCount
      };

      if (identity?.privateKeyJwk) {
        try {
          const sig = await CitizenPassportManager.signAction(
            {
              type: signedDelta.type,
              payload: signedDelta.payload,
              tick: signedDelta.tick,
              authorToken: signedDelta.authorToken,
              authorName: signedDelta.authorName,
              timestamp: signedDelta.timestamp
            },
            identity.privateKeyJwk
          );
          signedDelta.signature = sig;
        } catch (e) {
          signedDelta.signature = 'unsigned_' + Date.now();
        }
      } else {
        signedDelta.signature = 'unsigned_' + Date.now();
      }

      p2pMesh.broadcastDelta(signedDelta);
    }

    // Interactive simulated resident response for solo Whisper verification
    if (channel === CHAT_CHANNELS.WHISPER && recipientName) {
      const isAmbientResident = AMBIENT_RESIDENTS.some(r => r.name === recipientName);
      if (isAmbientResident) {
        setTimeout(async () => {
          const resObj = AMBIENT_RESIDENTS.find(r => r.name === recipientName);
          const replyText = `🔒 Decrypted whisper from ${newMsg.authorName}. Water & microgrid systems running smoothly. Zero telemetry anomalies.`;
          const myKey = identity ? (identity.pubKeyHex || identity.shortFingerprint || identity.name) : 'Player';
          const encReply = await encryptWhisper(replyText, myKey);
          await this.addMessage({
            id: `msg-reply-${Date.now().toString(36)}`,
            channel: CHAT_CHANNELS.WHISPER,
            authorName: recipientName,
            authorVocation: resObj?.vocation || 'Resident',
            authorIcon: resObj?.icon || '🌱',
            authorPubKey: 'res_pubkey_' + recipientName.toLowerCase(),
            shortFingerprint: 'res-' + recipientName.toLowerCase().slice(0, 4),
            isPlayer: false,
            isPeer: false,
            recipientName: newMsg.authorName,
            recipientFingerprint: newMsg.shortFingerprint,
            isEncrypted: true,
            ciphertext: encReply.ciphertext,
            iv: encReply.iv,
            text: replyText,
            timestamp: Date.now(),
            verified: true
          });
        }, 1200);
      }
    }

    return newMsg;
  }

  /**
   * Executes the action embedded in an actionable chat message
   */
  executeMessageAction(messageId, thermo, node) {
    const msg = this.messages.find(m => m.id === messageId);
    if (!msg || msg.actionExecuted || !msg.actionType) return { success: false, reason: 'Invalid or already claimed action.' };

    const payload = msg.actionPayload;

    if (msg.actionType === 'DONATE_ENERGY' || msg.actionType === 'OFFER_ENERGY') {
      const space = thermo.energy.batteryCapacityKwh - thermo.energy.batteryStoredKwh;
      const amt = payload?.amount || 25;
      const added = Math.min(space, amt);
      thermo.energy.batteryStoredKwh += added;
      msg.actionExecuted = true;
      this.saveHistory();
      return { success: true, message: `Transferred +${added} kWh to community battery storage!` };
    }

    if (msg.actionType === 'DONATE_WATER' || msg.actionType === 'OFFER_WATER') {
      const space = thermo.water.cisternCapacityL - thermo.water.cisternStoredL;
      const amt = payload?.amount || 500;
      const added = Math.min(space, amt);
      thermo.water.cisternStoredL += added;
      msg.actionExecuted = true;
      this.saveHistory();
      return { success: true, message: `Transferred +${added} Liters to communal cistern!` };
    }

    if (msg.actionType === 'DONATE_FOOD') {
      const space = thermo.food.granaryCapacityKcal - thermo.food.granaryStoredKcal;
      const amt = payload?.amount || 5000;
      const added = Math.min(space, amt);
      thermo.food.granaryStoredKcal += added;
      msg.actionExecuted = true;
      this.saveHistory();
      return { success: true, message: `Added +${added.toLocaleString()} kcal to community granary!` };
    }

    if (msg.actionType === 'DONATE_MATERIALS') {
      const amt = payload?.amount || 10;
      thermo.circularMaterials.recycledAluminiumKg += Math.round(amt * 0.5);
      thermo.circularMaterials.recycledPetgKg += Math.round(amt * 0.5);
      msg.actionExecuted = true;
      this.saveHistory();
      return { success: true, message: `Supplied +${amt} kg circular filament & aluminum to FabLab bins!` };
    }

    if (msg.actionType === 'COMMUNITY_CHEER') {
      if (node) {
        node.communityMorale = Math.min(100, (node.communityMorale || 75) + 5);
      }
      msg.actionExecuted = true;
      this.saveHistory();
      return { success: true, message: `Community morale boosted by togetherness! (+5%)` };
    }

    if (msg.actionType === 'TRIGGER_ISLAND_MODE') {
      thermo.energy.islandMode = true;
      msg.actionExecuted = true;
      this.saveHistory();
      return { success: true, message: `Galvanic island mode engaged. Legacy grid severed!` };
    }

    return { success: false, reason: 'Unknown action type.' };
  }

  /**
   * Periodic ambient chatter simulation based on thermodynamic state (ITEM 3)
   */
  tickAmbientChatter(currentTick, thermo, node) {
    // Generate contextual resident message roughly every 16-24 simulated hours
    if (currentTick - this.lastAmbientTick < 16) return null;
    if (Math.random() > 0.35) return null;

    // At night (21:00 - 05:59), citizens are resting! Silence chatter except rare night-watch log
    const isNight = this.sim ? (typeof this.sim.isNight === 'boolean' ? this.sim.isNight : (this.sim.localHour >= 21 || this.sim.localHour < 6)) : false;
    if (isNight) {
      if (Math.random() > 0.15) return null; // Very quiet at night
    }

    this.lastAmbientTick = currentTick;
    const resident = AMBIENT_RESIDENTS[Math.floor(Math.random() * AMBIENT_RESIDENTS.length)];
    let text = '';
    let actionType = null;
    let actionPayload = null;

    if (isNight) {
      text = '🌙 Night watch log: perimeter microgrid secure, battery cells balanced, quiet stars overhead.';
    } else if (thermo.weather.activeDisaster) {
      const d = thermo.weather.activeDisaster;
      if (d.id === 'HEAT_DOME') {
        text = `Sun radiation is intense (${thermo.weather.temperatureC}°C)! Checking the shade nets over aeroponic sector B.`;
      } else if (d.id === 'ATMOSPHERIC_RIVER') {
        text = `Torrential rainfall outside! Swales are diverting runoffs nicely into the lower settling pond.`;
      } else {
        text = `Storm alert: staying indoors and running diagnostic checks on inverter firmware.`;
      }
    } else if (thermo.energy.batteryStoredKwh / thermo.energy.batteryCapacityKwh > 0.9) {
      text = `Batteries are near 100% capacity! Anyone needing high-amperage welding or 3D filament drying should take advantage now.`;
      actionType = 'DONATE_ENERGY';
      actionPayload = { amount: 20, unit: 'kWh', source: resident.name };
    } else if (thermo.food.granaryStoredKcal / thermo.food.granaryCapacityKcal > 0.75) {
      text = `Granary reserves are looking exceptionally healthy. Picked heirloom tomatoes and fresh basil for dinner.`;
      actionType = 'DONATE_FOOD';
      actionPayload = { amount: 3000, unit: 'kcal', source: resident.name };
    } else {
      const generalChat = [
        'Checked the solar tracker bearings this morning—zero backlash. Great machining work by the workshop team.',
        'The greywater reed-bed filtration is running with pure clarity. Tested pH at 6.8.',
        'Enjoying my 14 hours of free discretionary time today. Working on an open-source acoustic guitar CAD design in the studio.',
        'Notice for newcomers: the Circular Furniture Swap Shop has two fresh modular cedar desks available at zero cost.'
      ];
      text = generalChat[Math.floor(Math.random() * generalChat.length)];
    }

    return this.addMessage({
      channel: CHAT_CHANNELS.VILLAGE,
      authorName: resident.name,
      authorVocation: resident.vocation,
      authorIcon: resident.icon,
      isPlayer: false,
      isPeer: false,
      text,
      actionType,
      actionPayload,
      timestamp: Date.now(),
      verified: true
    });
  }

  saveHistory() {
    try {
      const trimmed = this.messages.slice(-60);
      localStorage.setItem('oasis_chat_history', JSON.stringify(trimmed));
    } catch (e) {
      console.warn('[ChatEngine] Could not save history to localStorage', e);
    }
  }

  loadHistory() {
    try {
      const raw = localStorage.getItem('oasis_chat_history');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const seen = new Set();
          this.messages = [];
          for (const m of parsed) {
            const key = m.id || `${m.authorName}-${m.text}`;
            if (!seen.has(key)) {
              seen.add(key);
              this.messages.push(m);
            }
          }
        }
      }
    } catch (e) {
      console.warn('[ChatEngine] Could not parse chat history', e);
    }
  }
}
