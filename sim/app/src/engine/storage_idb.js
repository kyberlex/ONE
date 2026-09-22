/**
 * Local-First Distributed Database Engine (Agent SIM-0 & SIM-1)
 * Powered by IndexedDB: High-capacity, zero-lag local persistence.
 *
 * Implements:
 * 1. Object Stores: 'identities', 'nodes', 'event_log' (signed action deltas).
 * 2. Automatic migration and fallback from localStorage (5MB limit surpassed).
 * 3. Append-only signed event delta log for peer-to-peer reconciliation.
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

const DB_NAME = 'oasis_distributed_db';
const DB_VERSION = 1;

export class StorageIDB {
  constructor() {
    this.db = null;
    this.isReady = false;
    this.fallbackMemory = {
      identities: {},
      nodes: {},
      event_log: []
    };
  }

  /**
   * Initializes the IndexedDB connection and performs object store creation
   * @returns {Promise<boolean>}
   */
  async init() {
    if (this.isReady && this.db) return true;

    if (typeof indexedDB === 'undefined') {
      console.warn('[StorageIDB] indexedDB not supported in this environment, using memory/localStorage fallback.');
      return false;
    }

    return new Promise(resolve => {
      try {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = event => {
          const db = event.target.result;

          // 1. Identities store
          if (!db.objectStoreNames.contains('identities')) {
            const idStore = db.createObjectStore('identities', { keyPath: 'id' });
            idStore.createIndex('token', 'token', { unique: false });
            idStore.createIndex('active', 'active', { unique: false });
          }

          // 2. Nodes store (planetary node snapshots)
          if (!db.objectStoreNames.contains('nodes')) {
            db.createObjectStore('nodes', { keyPath: 'id' });
          }

          // 3. Event Log (append-only delta log)
          if (!db.objectStoreNames.contains('event_log')) {
            const evStore = db.createObjectStore('event_log', { keyPath: 'id' });
            evStore.createIndex('timestamp', 'timestamp', { unique: false });
            evStore.createIndex('type', 'type', { unique: false });
            evStore.createIndex('tick', 'tick', { unique: false });
          }
        };

        request.onsuccess = async event => {
          this.db = event.target.result;
          this.isReady = true;
          console.log('📦 [StorageIDB] IndexedDB initialized successfully (Store: identities, nodes, event_log)');
          await this.migrateFromLocalStorage();
          resolve(true);
        };

        request.onerror = err => {
          console.error('[StorageIDB] Failed to open IndexedDB:', err);
          this.isReady = false;
          resolve(false);
        };
      } catch (e) {
        console.error('[StorageIDB] IndexedDB exception:', e);
        this.isReady = false;
        resolve(false);
      }
    });
  }

  /**
   * Migrates legacy localStorage saves into IndexedDB on first run
   */
  async migrateFromLocalStorage() {
    if (typeof localStorage === 'undefined') return;
    try {
      // 1. Check legacy simulation save
      const legacySave = localStorage.getItem('oasis_dualtrack_save');
      if (legacySave) {
        const state = JSON.parse(legacySave);
        const nodeId = state.node?.id || 'node-detroit';
        const existingNode = await this.getNodeState(nodeId);
        if (!existingNode) {
          await this.saveNodeState(nodeId, state);
          console.log(`[StorageIDB] Migrated legacy save for ${nodeId} into IndexedDB`);
        }
      }

      // 2. Check legacy player profile
      const legacyProfile = localStorage.getItem('oasis_player_profile');
      if (legacyProfile) {
        const p = JSON.parse(legacyProfile);
        const existingIdentities = await this.getAllIdentities();
        if (existingIdentities.length === 0) {
          const importedIdentity = {
            id: 'cit-legacy-' + (p.claimedAt || Date.now()),
            name: 'Pioneer',
            vocationId: p.vocationId || 'farmer',
            timestampMs: p.claimedAt || Date.now(),
            token: `ONE:Pioneer:${p.claimedAt || Date.now()}:0000:legacy_key`,
            pubKeyHex: 'legacy_key',
            shortFingerprint: 'legacy…0000',
            active: true,
            claimedDwellingId: p.dwellingId,
            claimedNodeId: p.nodeId
          };
          await this.saveIdentity(importedIdentity);
          console.log('[StorageIDB] Migrated legacy player profile into IndexedDB identity');
        }
      }
    } catch (e) {
      console.warn('[StorageIDB] Migration check skipped:', e);
    }
  }

  // --- IDENTITY & PASSPORT OPERATIONS ---

  /**
   * Saves or updates a sovereign citizen identity
   * @param {object} identity
   * @param {object|null} privateKeyJwk
   */
  async saveIdentity(identity, privateKeyJwk = null) {
    const record = {
      ...identity,
      active: true,
      lastActiveAt: Date.now()
    };
    if (privateKeyJwk) {
      record.privateKeyJwk = privateKeyJwk;
    }

    if (!this.db) {
      for (const k of Object.keys(this.fallbackMemory.identities)) {
        this.fallbackMemory.identities[k].active = false;
      }
      this.fallbackMemory.identities[record.id] = record;
      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem('oasis_active_identity', JSON.stringify(record));
        } catch (e) {}
      }
      return record;
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(['identities'], 'readwrite');
      const store = tx.objectStore('identities');

      // First mark all existing as inactive
      const cursorReq = store.openCursor();
      cursorReq.onsuccess = e => {
        const cursor = e.target.result;
        if (cursor) {
          if (cursor.value.id !== record.id && cursor.value.active) {
            cursor.value.active = false;
            cursor.update(cursor.value);
          }
          cursor.continue();
        } else {
          // Put the active record
          store.put(record);
        }
      };

      tx.oncomplete = () => {
        if (typeof localStorage !== 'undefined') {
          try {
            localStorage.setItem('oasis_active_identity_id', record.id);
          } catch (e) {}
        }
        resolve(record);
      };
      tx.onerror = err => reject(err);
    });
  }

  /**
   * Gets the currently active citizen identity
   * @returns {Promise<object|null>}
   */
  async getActiveIdentity() {
    if (!this.db) {
      const inMemoryActive = Object.values(this.fallbackMemory.identities).find(i => i.active) 
        || Object.values(this.fallbackMemory.identities)[0];
      if (inMemoryActive) return inMemoryActive;

      if (typeof localStorage !== 'undefined') {
        try {
          const str = localStorage.getItem('oasis_active_identity');
          return str ? JSON.parse(str) : null;
        } catch (e) {
          return null;
        }
      }
      return null;
    }

    return new Promise(resolve => {
      const tx = this.db.transaction(['identities'], 'readonly');
      const store = tx.objectStore('identities');
      const req = store.openCursor();

      let activeRecord = null;
      let firstRecord = null;

      req.onsuccess = e => {
        const cursor = e.target.result;
        if (cursor) {
          if (!firstRecord) firstRecord = cursor.value;
          if (cursor.value.active) {
            activeRecord = cursor.value;
          }
          cursor.continue();
        } else {
          resolve(activeRecord || firstRecord || null);
        }
      };

      req.onerror = () => resolve(null);
    });
  }

  /**
   * Gets all stored identities on this device
   * @returns {Promise<Array>}
   */
  async getAllIdentities() {
    if (!this.db) return Object.values(this.fallbackMemory.identities);

    return new Promise(resolve => {
      const tx = this.db.transaction(['identities'], 'readonly');
      const store = tx.objectStore('identities');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  }

  /**
   * Permanently burns a citizen identity (Right to Oblivion / Sovereign Departure).
   * Irreversibly purges private keys and identity records from IndexedDB and localStorage.
   * @param {string} identityId
   */
  async purgeCitizenIdentity(identityId) {
    if (!this.db) {
      delete this.fallbackMemory.identities[identityId];
      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.removeItem('oasis_active_identity');
          localStorage.removeItem('oasis_active_identity_id');
          localStorage.removeItem('oasis_player_profile');
        } catch (e) {}
      }
      return true;
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(['identities'], 'readwrite');
      const store = tx.objectStore('identities');
      store.delete(identityId);

      tx.oncomplete = () => {
        if (typeof localStorage !== 'undefined') {
          try {
            localStorage.removeItem('oasis_active_identity');
            localStorage.removeItem('oasis_active_identity_id');
            localStorage.removeItem('oasis_player_profile');
          } catch (e) {}
        }
        resolve(true);
      };
      tx.onerror = err => reject(err);
    });
  }

  // --- NODE STATE PERSISTENCE ---

  /**
   * Saves planetary node snapshot
   * @param {string} nodeId
   * @param {object} state
   */
  async saveNodeState(nodeId, state) {
    const record = {
      id: nodeId,
      updatedAt: Date.now(),
      state
    };

    if (!this.db) {
      this.fallbackMemory.nodes[nodeId] = record;
      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem(`oasis_node_${nodeId}`, JSON.stringify(record));
        } catch (e) {}
      }
      return record;
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(['nodes'], 'readwrite');
      const store = tx.objectStore('nodes');
      store.put(record);
      tx.oncomplete = () => resolve(record);
      tx.onerror = err => reject(err);
    });
  }

  /**
   * Loads planetary node snapshot
   * @param {string} nodeId
   * @returns {Promise<object|null>}
   */
  async getNodeState(nodeId) {
    if (!this.db) {
      if (this.fallbackMemory.nodes[nodeId]) {
        return this.fallbackMemory.nodes[nodeId].state;
      }
      if (typeof localStorage !== 'undefined') {
        try {
          const str = localStorage.getItem(`oasis_node_${nodeId}`);
          return str ? JSON.parse(str).state : null;
        } catch (e) {
          return null;
        }
      }
      return null;
    }

    return new Promise(resolve => {
      const tx = this.db.transaction(['nodes'], 'readonly');
      const store = tx.objectStore('nodes');
      const req = store.get(nodeId);
      req.onsuccess = () => resolve(req.result ? req.result.state : null);
      req.onerror = () => resolve(null);
    });
  }

  // --- EVENT DELTA LOG (APPEND-ONLY) ---

  /**
   * Appends a signed delta to the distributed event log
   * @param {object} delta - Signed action delta
   */
  async appendEvent(delta) {
    if (!this.db) {
      this.fallbackMemory.event_log.push(delta);
      return delta;
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(['event_log'], 'readwrite');
      const store = tx.objectStore('event_log');
      store.add(delta);
      tx.oncomplete = () => resolve(delta);
      tx.onerror = err => reject(err);
    });
  }

  /**
   * Retrieves recent event log deltas
   * @param {number} limit
   * @returns {Promise<Array>}
   */
  async getEventHistory(limit = 50) {
    if (!this.db) return this.fallbackMemory.event_log.slice(-limit).reverse();

    return new Promise(resolve => {
      const tx = this.db.transaction(['event_log'], 'readonly');
      const store = tx.objectStore('event_log');
      const index = store.index('timestamp');
      const req = index.openCursor(null, 'prev');

      const results = [];
      req.onsuccess = e => {
        const cursor = e.target.result;
        if (cursor && results.length < limit) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      req.onerror = () => resolve([]);
    });
  }

  /**
   * Returns total count of signed events in the database
   * @returns {Promise<number>}
   */
  async getEventCount() {
    if (!this.db) return this.fallbackMemory.event_log.length;

    return new Promise(resolve => {
      const tx = this.db.transaction(['event_log'], 'readonly');
      const store = tx.objectStore('event_log');
      const req = store.count();
      req.onsuccess = () => resolve(req.result || 0);
      req.onerror = () => resolve(0);
    });
  }
}

// Global Singleton Instance
export const storageIDB = new StorageIDB();
