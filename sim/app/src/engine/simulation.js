/**
 * Master Simulation & State Loop Manager (Agent SIM-0)
 * Drives discrete time progression (1 tick = 1 hour, 24 ticks = 1 day),
 * orchestrates thermodynamics, demographics, adversary events, sortition councils,
 * and deterministic persistence to localStorage.
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

import { ThermodynamicEngine } from './thermodynamics.js';
import { OneNode } from './node.js';
import { LegacyAdversaryDirector } from './adversary.js';
import { AthenianSortitionEngine } from './sortition.js';
import { CIVIC_DILEMMAS } from '../data/dilemmas.js';
import { storageIDB } from './storage_idb.js';
import { TradeConvoyEngine } from './trade_convoy.js';

export class SimulationManager {
  constructor(config = {}) {
    // Temporal state
    this.tickCount = 0;
    this.speedMultiplier = 1; // 0 = pause, 1 = normal, 2 = fast, 5 = hyper
    this.timerTimeout = null;

    // Subsystem engines
    this.thermo = new ThermodynamicEngine(config.thermoConfig);
    this.node = new OneNode(config.nodeConfig);
    this.adversary = new LegacyAdversaryDirector();
    this.sortition = new AthenianSortitionEngine();
    this.trade = new TradeConvoyEngine(this.node.id);

    // Bioregional local solar timezone offset (-5 for Detroit Delray)
    this.timezoneOffset = typeof config.timezoneOffset === 'number'
      ? config.timezoneOffset
      : (this.node?.lng ? Math.round(this.node.lng / 15) : -5);

    // Event callbacks
    this.onTickListeners = [];
    this.onCrisisListeners = [];
    this.onDilemmaListeners = [];
    this.onNotificationListeners = [];

    // Initialize initial Sortition Council
    this.sortition.seatNewCouncil(this.node.citizens, this.tickCount);
    this.node.updateLaborAndMorale();

    // Restore saved simulation state if available
    this.loadFromLocalStorage();
  }

  get currentDay() {
    return Math.floor(this.tickCount / 24) + 1;
  }

  get currentHour() {
    return this.tickCount % 24;
  }

  /**
   * Local solar hour aligned to the node's geographical longitude (ITEM 4)
   */
  get localHour() {
    const offset = this.timezoneOffset ?? -5;
    return (Math.floor(this.currentHour + offset) % 24 + 24) % 24;
  }

  /**
   * True if current local solar hour is nocturnal (21:00 - 05:59)
   */
  get isNight() {
    return this.localHour >= 21 || this.localHour < 6;
  }

  start() {
    this.scheduleNextTick();
  }

  pause() {
    this.setSpeed(0);
  }

  setSpeed(multiplier) {
    this.speedMultiplier = multiplier;
    this.scheduleNextTick();
    this.notifyTick();
  }

  /**
   * Dynamic Circadian Time Warp Scheduler (ITEM 5)
   * - Night (21:00 - 05:59): 500ms base at 1x (~2 hours per second) to swiftly pass slumber.
   * - Day (06:00 - 20:59): 1600ms base at 1x (~0.625 hours per second) for thoughtful gameplay.
   */
  scheduleNextTick() {
    if (this.timerTimeout) {
      clearTimeout(this.timerTimeout);
      this.timerTimeout = null;
    }
    if (this.speedMultiplier === 0) return;

    const baseMs = this.isNight ? 500 : 1600;
    const intervalMs = Math.max(60, Math.round(baseMs / this.speedMultiplier));

    this.timerTimeout = setTimeout(() => {
      this.stepTick();
      this.scheduleNextTick();
    }, intervalMs);
  }

  /**
   * Main discrete hourly step
   */
  stepTick() {
    this.tickCount++;
    const hour = this.currentHour;
    const day = this.currentDay;

    // 1. Thermodynamic step
    this.thermo.tick(hour, this.node.population, this.node.choreAssignments, {
      agroResilience: this.node.agroResilience,
      robots: this.node.robots
    });

    // 2. Node dynamic usufruct daily audit (every 24h at midnight)
    if (hour === 0) {
      const reclaimed = this.node.auditUsufructHousing(this.tickCount);
      if (reclaimed.length > 0) {
        this.emitNotification(
          '🏘️ Usufruct Invariant Audit',
          `${reclaimed.length} abandoned dwelling(s) returned to Civic Pool; furniture moved to Swap Shop.`
        );
      }
      this.saveToLocalStorage();
    } else if (this.tickCount % 12 === 0) {
      this.saveToLocalStorage();
    }

    // 3. Sortition council rotation (every 30 days = 720 ticks)
    if (this.tickCount % this.sortition.mandateDurationTicks === 0) {
      const newCouncil = this.sortition.seatNewCouncil(this.node.citizens, this.tickCount);
      const tier = this.sortition.currentTier;
      this.emitNotification(
        '🏛️ Sortition Rotation',
        `New ${tier.councilSize}-citizen ${tier.titleDefault} seated (${tier.article}).`
      );
    }

    // 4. Random Civic Dilemma (approx every 3-5 days if no dilemma is active)
    if (!this.sortition.activeDilemma && Math.random() < 0.015) {
      const randomDilemma = CIVIC_DILEMMAS[Math.floor(Math.random() * CIVIC_DILEMMAS.length)];
      const councilSetup = this.sortition.presentDilemma(randomDilemma);
      this.emitDilemma(councilSetup);
    }

    // 5. Legacy Adversary AI check
    const thermoSnap = this.thermo.getSnapshot();
    const nodeSnap = {
      communityMorale: this.node.communityMorale,
      freeHours: this.node.averageFreeHoursPerDay
    };
    const adversaryEvent = this.adversary.tick(this.tickCount, thermoSnap, nodeSnap);

    if (adversaryEvent && adversaryEvent.type === 'CRISIS_STARTED') {
      this.emitCrisis(adversaryEvent.crisis);
    } else if (adversaryEvent && adversaryEvent.type === 'CRISIS_RESOLVED') {
      this.emitNotification(
        '🛡️ Legacy Crisis Concluded',
        adversaryEvent.crisis.name
      );
    }

    // 6. Meteorological Disaster & Agricultural Impact Alert Check
    if (this.thermo.weather.activeDisaster && !this.lastDisasterName) {
      this.lastDisasterName = this.thermo.weather.activeDisaster.name;
      const stress = this.thermo.food.activeAgroStress;
      let extraAgroMsg = '';
      if (stress) {
        if (stress.savedKcalPerHour > 0) {
          extraAgroMsg = ` Agro-Resilience active: defenses mitigated ${stress.mitigatedPct}% of crop damage (saved ${stress.savedKcalPerHour} kcal/h).`;
        } else {
          extraAgroMsg = ` Open permaculture fields exposed: ${stress.netLossPct}% potential harvest loss!`;
        }
      }
      this.emitNotification(
        `⚠️ ${this.thermo.weather.activeDisaster.name}!`,
        `${this.thermo.weather.activeDisaster.desc}${extraAgroMsg}`
      );
    } else if (!this.thermo.weather.activeDisaster && this.lastDisasterName) {
      this.emitNotification(
        '🌤️ Weather Alert Cleared',
        `The meteorological hazard has subsided. Community repair shifts active and harvest normalizes.`
      );
      this.lastDisasterName = null;
    }

    // 7. Inter-Node Trade Convoys Logistics Tick
    const tradeEvents = this.trade.tick(this.tickCount, this.thermo, this.node);
    for (const ev of tradeEvents) {
      this.emitNotification(ev.title, ev.message);
    }

    // 8. Broadcast tick update to UI
    this.notifyTick();
  }

  notifyTick() {
    const state = this.getFullState();
    for (const listener of this.onTickListeners) {
      try { listener(state); } catch (e) { console.error(e); }
    }
  }

  emitCrisis(crisis) {
    for (const listener of this.onCrisisListeners) {
      try { listener(crisis); } catch (e) { console.error(e); }
    }
  }

  emitDilemma(dilemmaData) {
    for (const listener of this.onDilemmaListeners) {
      try { listener(dilemmaData); } catch (e) { console.error(e); }
    }
  }

  emitNotification(title, message) {
    for (const listener of this.onNotificationListeners) {
      try { listener({ title, message, time: this.tickCount }); } catch (e) { console.error(e); }
    }
  }

  getFullState() {
    return {
      tick: this.tickCount,
      day: this.currentDay,
      hour: this.currentHour,
      localHour: this.localHour,
      isNight: this.isNight,
      timezoneOffset: this.timezoneOffset,
      speed: this.speedMultiplier,
      thermo: this.thermo.getSnapshot(),
      node: {
        id: this.node.id,
        name: this.node.name,
        population: this.node.population,
        playerVocation: this.node.playerVocation,
        freeHours: this.node.averageFreeHoursPerDay,
        morale: this.node.communityMorale,
        fiatEur: this.node.externalFiatTreasuryEur,
        chores: this.node.choreAssignments,
        robots: this.node.robots,
        housingPool: this.node.housingPool,
        furnitureShop: this.node.furnitureSwapShop
      },
      adversary: {
        threatLevel: this.adversary.threatLevel,
        activeCrisis: this.adversary.activeCrisis,
        history: this.adversary.eventHistory
      },
      sortition: {
        council: this.sortition.currentCouncil,
        rotationCount: this.sortition.rotationCount,
        activeDilemma: this.sortition.activeDilemma
      },
      trade: this.trade.serialize()
    };
  }

  saveToLocalStorage() {
    try {
      const fullState = this.getFullState();
      const serialized = JSON.stringify(fullState);
      localStorage.setItem('oasis_dualtrack_save', serialized);
      // Asynchronously mirror to IndexedDB
      if (this.node && this.node.id) {
        storageIDB.saveNodeState(this.node.id, fullState).catch(err => {
          console.warn('[Simulation] Failed to save to IndexedDB:', err);
        });
      }
      return true;
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
      return false;
    }
  }

  loadFromLocalStorage() {
    try {
      const dataStr = localStorage.getItem('oasis_dualtrack_save');
      if (!dataStr) return false;
      const state = JSON.parse(dataStr);
      if (!state) return false;

      this.tickCount = state.tick || 0;
      if (state.speed !== undefined) this.speedMultiplier = state.speed;

      if (state.node) {
        if (state.node.playerVocation) {
          this.node.setPlayerVocation(state.node.playerVocation);
        }
        if (state.node.chores) {
          this.node.choreAssignments = { ...this.node.choreAssignments, ...state.node.chores };
        }
        if (state.node.robots) {
          this.node.robots = { ...this.node.robots, ...state.node.robots };
        }
        if (state.node.morale !== undefined) {
          this.node.communityMorale = state.node.morale;
        }
        if (state.node.fiatEur !== undefined) {
          this.node.externalFiatTreasuryEur = state.node.fiatEur;
        }
        this.node.updateLaborAndMorale();
      }

      if (state.thermo) {
        if (state.thermo.energy?.currentKwh !== undefined) {
          this.thermo.energy.batteryStoredKwh = state.thermo.energy.currentKwh;
        }
        if (state.thermo.water?.currentL !== undefined) {
          this.thermo.water.cisternStoredL = state.thermo.water.currentL;
        }
        if (state.thermo.food?.currentKcal !== undefined) {
          this.thermo.food.granaryStoredKcal = state.thermo.food.currentKcal;
        }
        if (state.thermo.machinery) {
          this.thermo.machinery = { ...this.thermo.machinery, ...state.thermo.machinery };
        }
        if (state.thermo.circularMaterials) {
          this.thermo.circularMaterials = { ...this.thermo.circularMaterials, ...state.thermo.circularMaterials };
        }
        if (state.thermo.weather) {
          this.thermo.weather = { ...this.thermo.weather, ...state.thermo.weather };
        }
      }

      if (state.trade) {
        this.trade.deserialize(state.trade);
      }

      return true;
    } catch (e) {
      console.error('Failed to load from localStorage:', e);
      return false;
    }
  }
}
