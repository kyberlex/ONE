/**
 * O-ASIS Git-as-a-State-Anchor Autonomous Consensus Engine (Agent SIM-0 & SIM-5)
 * Periodically anchors living world state snapshots to GitHub via an anonymous
 * Google Apps Script relay during active gameplay (e.g. hourly / every circadian day).
 * 
 * Invariants:
 * - 100% Free Software & Serverless (AGPL-3.0-or-later)
 * - Zero Token Exposure: GitHub PAT is secured in Apps Script ScriptProperties
 * - Cryptographic Transparency: Deterministic SHA-256 thermoConsensusHash
 * 
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

// Official anonymous Google Apps Script consensus snapshot relay for kyberlex/ONE
export const DEFAULT_SNAPSHOT_RELAY_URL = 'https://script.google.com/macros/s/AKfycbzyNSLiCexwy2KId-N36nyFp9s75dlf6ywR0vAbCngm0-g3tCvDh4gtrN5UDx0GFZc7/exec';

export class ConsensusAnchorManager {
  constructor(sim) {
    this.sim = sim;
    this.enabled = this.loadAutoAnchorEnabled();
    this.intervalTicks = 24; // 1 circadian day (24 in-game hours)
    this.minCooldownMs = 15 * 60 * 1000; // 15 real-world minutes cooldown between commits
    this.lastAnchoredTick = this.loadLastAnchoredTick();
    this.lastAnchoredTime = this.loadLastAnchoredTime();
    this.lastCommitUrl = localStorage.getItem('oasis_last_anchor_commit_url') || '';
    this.isPushing = false;
  }

  loadAutoAnchorEnabled() {
    const saved = localStorage.getItem('oasis_auto_anchor_enabled');
    return saved !== null ? saved === 'true' : true; // Enabled by default
  }

  setAutoAnchorEnabled(val) {
    this.enabled = !!val;
    localStorage.setItem('oasis_auto_anchor_enabled', String(this.enabled));
    console.log(`⚓ [ConsensusAnchor] Auto-Anchor to GitHub ${this.enabled ? 'ENABLED' : 'DISABLED'}`);
  }

  loadLastAnchoredTick() {
    const val = localStorage.getItem('oasis_last_anchored_tick');
    return val !== null ? parseInt(val, 10) : -1;
  }

  loadLastAnchoredTime() {
    const val = localStorage.getItem('oasis_last_anchored_time');
    return val !== null ? parseInt(val, 10) : 0;
  }

  getRelayUrl() {
    return localStorage.getItem('oasis_snapshot_relay_url') || DEFAULT_SNAPSHOT_RELAY_URL;
  }

  setRelayUrl(url) {
    if (url && typeof url === 'string') {
      localStorage.setItem('oasis_snapshot_relay_url', url.trim());
    } else {
      localStorage.removeItem('oasis_snapshot_relay_url');
    }
  }

  /**
   * Called during simulation tick to evaluate auto-anchor conditions
   * @param {number} currentTick
   */
  checkAndAutoAnchor(currentTick) {
    if (!this.enabled || this.isPushing) return;

    // Check tick interval progression
    const ticksSinceLast = currentTick - this.lastAnchoredTick;
    if (ticksSinceLast < this.intervalTicks) return;

    // Check real-world throttling cooldown
    const msSinceLast = Date.now() - this.lastAnchoredTime;
    if (msSinceLast < this.minCooldownMs) return;

    console.log(`⚓ [ConsensusAnchor] Triggering automated GitHub snapshot anchor at Tick ${currentTick}...`);
    this.pushSnapshotToRelay({ isAuto: true });
  }

  /**
   * Pushes current world snapshot to the Google Apps Script GitHub relay
   * @param {object} options
   * @returns {Promise<object>}
   */
  async pushSnapshotToRelay({ isAuto = false, force = false } = {}) {
    if (this.isPushing) {
      return { success: false, error: 'Push already in progress' };
    }

    const relayUrl = this.getRelayUrl();
    if (!relayUrl) {
      console.warn('[ConsensusAnchor] Snapshot relay URL not configured.');
      return { success: false, error: 'Relay URL not configured' };
    }

    this.isPushing = true;
    try {
      // 1. Export canonical snapshot with computed SHA-256 hash
      const snapshot = await this.sim.exportConsensusSnapshot();

      const payload = {
        type: 'snapshot',
        action: 'world_snapshot',
        force: !!force,
        tick: snapshot.tick,
        day: snapshot.day,
        hash: snapshot.thermoConsensusHash,
        snapshot: snapshot,
        bioregion: `${this.sim.node?.name || 'Detroit Delray'} (${this.sim.node?.bioregion || 'Great Lakes'})`,
        clientVersion: '0.1.0'
      };

      // 2. Transmit via text/plain to avoid CORS preflight blocks in Apps Script
      const res = await fetch(relayUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });

      const resData = await res.json();

      if (resData.success) {
        this.lastAnchoredTick = snapshot.tick;
        this.lastAnchoredTime = Date.now();
        this.lastCommitUrl = resData.commitUrl || '';
        localStorage.setItem('oasis_last_anchored_tick', String(this.lastAnchoredTick));
        localStorage.setItem('oasis_last_anchored_time', String(this.lastAnchoredTime));
        if (this.lastCommitUrl) {
          localStorage.setItem('oasis_last_anchor_commit_url', this.lastCommitUrl);
        }

        // Align consensus metadata in simulation manager
        if (this.sim) {
          this.sim.consensusSnapshot = {
            schemaVersion: snapshot.schemaVersion,
            network: snapshot.network,
            genesis: snapshot.genesis,
            tick: snapshot.tick,
            day: snapshot.day,
            timestamp: resData.timestamp || snapshot.timestamp,
            hash: snapshot.thermoConsensusHash,
            commitUrl: this.lastCommitUrl,
            nodes: snapshot.nodes
          };

          const notifyMsg = `Consensus snapshot anchored to GitHub [Tick ${snapshot.tick} • Hash: ${snapshot.thermoConsensusHash.slice(0, 8)}]`;
          this.sim.emitNotification('⚓ Git-Anchor', notifyMsg);

          const tickerEl = document.getElementById('hud-alert-ticker');
          if (tickerEl) {
            tickerEl.textContent = `⚓ ${notifyMsg}`;
          }
        }

        console.log(`✅ [ConsensusAnchor] Successfully anchored Tick ${snapshot.tick} to GitHub (${resData.commitUrl || 'committed'})`);
        return { success: true, tick: snapshot.tick, hash: snapshot.thermoConsensusHash, commitUrl: this.lastCommitUrl };
      } else if (resData.skipped) {
        console.log(`ℹ️ [ConsensusAnchor] Remote repo already ahead: ${resData.reason}`);
        return { success: false, skipped: true, reason: resData.reason };
      } else {
        throw new Error(resData.error || 'Relay returned failure');
      }
    } catch (err) {
      console.warn('[ConsensusAnchor] Failed to push snapshot to relay:', err);
      return { success: false, error: err.message || String(err) };
    } finally {
      this.isPushing = false;
    }
  }
}
