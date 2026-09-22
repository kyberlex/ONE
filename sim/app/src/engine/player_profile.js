/**
 * Player Profile & Dynamic Usufruct Home Persistence (Agent SIM-0 & SIM-5)
 * Enforces Constitutional Usufruct Invariant ("Use It or Lose It" + Sabbatical Lock).
 * Automatically stores and restores player's home node, claimed dwelling,
 * vocation, and inviolable personal belongings in localStorage.
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

const STORAGE_KEY = 'oasis_player_profile';

export class PlayerProfileManager {
  /**
   * Retrieves player profile from localStorage
   */
  static getProfile() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Failed to read player profile from localStorage:', e);
      return null;
    }
  }

  /**
   * Claims a dwelling in dynamic usufruct for the player
   */
  static claimDwelling(nodeId, nodeName, dwelling, vocationId = 'farmer', appearance = null) {
    const existing = this.getProfile();
    const profile = {
      nodeId, // e.g. 'node-detroit'
      nodeName: nodeName || 'Detroit Delray Commons',
      dwellingId: dwelling.id, // e.g. 'dwelling-2'
      dwellingNumber: dwelling.number,
      vocationId,
      appearance: appearance || existing?.appearance || null,
      claimedAt: Date.now(),
      lastSeenAt: Date.now(),
      sabbaticalActive: true,
      sabbaticalDays: 30, // 30 days protection by default
      sabbaticalUntil: Date.now() + (30 * 24 * 60 * 60 * 1000),
      personalInventory: [
        'OpenMesh Cryptographic Key',
        'Personal Multitool',
        'Biometric Seed Vault Pocket'
      ]
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save player profile:', e);
    }

    return profile;
  }

  /**
   * Updates player avatar appearance (gender, hairStyle, hairColor, skinTone)
   */
  static updateAppearance(appearance) {
    const p = this.getProfile() || {};
    p.appearance = { ...(p.appearance || {}), ...appearance };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    } catch (e) {
      console.error('Failed to update player appearance:', e);
    }
    return p;
  }

  /**
   * Updates last active timestamp to renew presence
   */
  static touchPresence() {
    const p = this.getProfile();
    if (!p) return null;
    p.lastSeenAt = Date.now();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    } catch (e) {
      console.error(e);
    }
    return p;
  }

  /**
   * Releases usufruct home back to the community pool
   */
  static releaseDwelling() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to remove player profile:', e);
    }
  }

  /**
   * Toggles sabbatical lock protection
   */
  static toggleSabbatical(days = 30) {
    const p = this.getProfile();
    if (!p) return null;
    p.sabbaticalActive = !p.sabbaticalActive;
    if (p.sabbaticalActive) {
      p.sabbaticalUntil = Date.now() + (days * 24 * 60 * 60 * 1000);
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    } catch (e) {
      console.error(e);
    }
    return p;
  }

  /**
   * Checks if player owns a specific dwelling in a specific node
   */
  static isPlayerHome(nodeId, dwellingId) {
    const p = this.getProfile();
    if (!p) return false;
    return p.nodeId === nodeId && p.dwellingId === dwellingId;
  }
}
