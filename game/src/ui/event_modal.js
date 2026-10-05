/**
 * O.N.E. Master Event & Assembly Modal System
 * Implements 100% full coverage across:
 * - Matrix 2: All 5 Legacy Adversary Threats
 * - Matrix 3: All 6 Weather/Climate Disasters (48h Advance Triage)
 * - Matrix 7: All 8 Weekend Conviviality Activities
 * - Section 7.3: Agora Demarchy Sortition Assembly (5-Juror Lottery & 75% Supermajority)
 * - Legacy Debt Amortization Desk ($12,000 to $0)
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

import { gameState } from '../core/state.js';
import { soundFX } from '../audio/sound_fx.js';

export class EventModal {
  constructor() {
    this.modalEl = null;
    this.activeType = null;
    this.canDismiss = false;
    this.init();
  }

  init() {
    this.modalEl = document.createElement('div');
    this.modalEl.id = 'event-modal-overlay';
    this.modalEl.className = 'modal-overlay hidden';
    document.body.appendChild(this.modalEl);

    if (typeof window !== 'undefined') {
      window.eventModal = this;
    }

    this.modalEl.addEventListener('click', (e) => {
      if (e.target === this.modalEl && this.canDismiss) {
        this.close();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.modalEl.classList.contains('hidden') && this.canDismiss) {
        this.close();
      }
    });
  }

  open(type, options = {}) {
    soundFX.playClick();
    this.activeType = type;
    this.canDismiss = false;

    // Safety lock against rapid click-through
    setTimeout(() => {
      this.canDismiss = true;
    }, 450);

    this.render(type, options);
    this.modalEl.classList.remove('hidden');
    this.modalEl.classList.add('active');
  }

  close() {
    soundFX.playClick();
    this.modalEl.classList.remove('active');
    this.modalEl.classList.add('hidden');
    this.activeType = null;
  }

  render(type, options = {}) {
    if (type === 'feast') {
      this.renderFeastModal();
    } else if (type === 'weather_crisis') {
      this.renderWeatherCrisisModal(options);
    } else if (type === 'legacy_threat') {
      this.renderLegacyThreatModal(options);
    } else if (type === 'weekend_activity') {
      this.renderWeekendActivityModal(options);
    } else if (type === 'demarchy_dilemma') {
      this.renderDemarchyDilemmaModal(options);
    } else if (type === 'debt_consulting') {
      this.renderDebtConsultingModal();
    } else if (type === 'water_management') {
      this.renderWaterManagementModal(options);
    } else if (type === 'energy_management') {
      this.renderEnergyManagementModal(options);
    } else if (type === 'weather_radar') {
      this.renderWeatherRadarModal(options);
    }
  }

  /* -------------------------------------------------------------
   * 1. Saturday Wood-Fired Feast Modal (Matrix 7.1)
   * ----------------------------------------------------------- */
  renderFeastModal() {
    const pioneers = [gameState.data.player, ...(gameState.data.companions || [])];

    this.modalEl.innerHTML = `
      <div class="modal-window event-modal-window" role="dialog" aria-modal="true">
        <div class="modal-header">
          <div class="modal-title-group">
            <span class="modal-icon">🍕</span>
            <div>
              <h2 class="modal-title">Saturday Commons Feast & Acoustic Jam</h2>
              <span class="modal-subtitle">Conviviality • Wood-Fired Pizza • Morale to 100%</span>
            </div>
          </div>
          <button type="button" class="btn-modal-close" id="btn-event-close" aria-label="Close dialog">✕</button>
        </div>

        <div class="event-modal-body">
          <div class="feast-hero-banner">
            <div class="oven-graphic">
              <span class="oven-icon">🔥</span>
              <div class="oven-flame-pulse"></div>
            </div>
            <div class="feast-narrative">
              <p class="feast-prompt">
                <strong>Heavy work orders pause today!</strong> Soraya has lit the outdoor brick oven.
                Let's bake sourdough pizzas with fresh garden tomatoes and sing around the porch fire.
              </p>
              <div class="feast-perks-row">
                <span class="feast-badge">❤️ Community Morale: 100%</span>
                <span class="feast-badge">🎵 Acoustic Strum: Enabled</span>
                <span class="feast-badge">🥗 Ingredients: 2,500 kcal</span>
              </div>
            </div>
          </div>

          <!-- Interactive Pizza Preparation Board -->
          <div class="pizza-prep-card">
            <div class="pizza-crust-preview">
              <div class="pizza-dough" id="interactive-pizza">
                <span class="pizza-crust-label">Sourdough Base</span>
                <div class="pizza-topping-item" id="topping-sauce" style="display: none;">🍅 Fresh Sauce</div>
                <div class="pizza-topping-item" id="topping-basil" style="display: none;">🌿 Sweet Basil</div>
                <div class="pizza-topping-item" id="topping-oil" style="display: none;">🫒 Smoked Oil</div>
              </div>
            </div>

            <div class="pizza-toppings-dock">
              <button type="button" class="btn-topping" id="btn-top-sauce">
                <span>🍅</span> Add Heirloom Tomato Sauce
              </button>
              <button type="button" class="btn-topping" id="btn-top-basil">
                <span>🌿</span> Add Garden Basil Leaves
              </button>
              <button type="button" class="btn-topping" id="btn-top-oil">
                <span>🫒</span> Drizzle Cold-Pressed Oil
              </button>
            </div>
          </div>

          <!-- Pioneers at Table -->
          <div class="feast-pioneers-list">
            <span class="feast-table-label">Long-Table Seating:</span>
            <div class="feast-settlers-avatars">
              ${pioneers.map(p => `
                <div class="feast-settler-chip">
                  <span class="settler-icon">${p.icon || '🧑'}</span>
                  <span class="settler-name">${p.name}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn-secondary" id="btn-feast-later">Maybe Later</button>
          <button type="button" class="btn-primary btn-feast-slide" id="btn-feast-celebrate">
            🔥 Slide Pizza Into Embers & Celebrate!
          </button>
        </div>
      </div>
    `;

    // Interactive toppings
    const updateTopping = (id, btnId) => {
      const el = this.modalEl.querySelector(id);
      const btn = this.modalEl.querySelector(btnId);
      if (el && btn) {
        soundFX.playClick();
        el.style.display = 'block';
        btn.disabled = true;
        btn.style.opacity = '0.6';
      }
    };

    this.modalEl.querySelector('#btn-top-sauce')?.addEventListener('click', () => updateTopping('#topping-sauce', '#btn-top-sauce'));
    this.modalEl.querySelector('#btn-top-basil')?.addEventListener('click', () => updateTopping('#topping-basil', '#btn-top-basil'));
    this.modalEl.querySelector('#btn-top-oil')?.addEventListener('click', () => updateTopping('#topping-oil', '#btn-top-oil'));

    this.modalEl.querySelector('#btn-feast-celebrate')?.addEventListener('click', () => {
      soundFX.playAcousticStrum();
      gameState.celebrateWeekendFeast();
      this.close();
    });

    this.modalEl.querySelector('#btn-event-close')?.addEventListener('click', () => this.close());
    this.modalEl.querySelector('#btn-feast-later')?.addEventListener('click', () => this.close());
  }

  /* -------------------------------------------------------------
   * 2. Weather Disaster Modal (Matrix 3: 48h Advance Triage)
   * ----------------------------------------------------------- */
  renderWeatherCrisisModal(options = {}) {
    const crisisId = options.id || 'cold_snap';
    const chores = gameState.data.chores || {};
    const remainingH = chores.remainingHours !== undefined ? chores.remainingHours : 6.0;

    const weatherCatalog = {
      cold_snap: {
        title: '48h Weather Alert: Polar Cold Snap (-3°C)',
        icon: '❄️',
        subtitle: 'Sub-Zero Freeze • Protect Crops & Cistern Brass Spigots',
        desc: 'Arctic winds approaching! Uninsulated brass spigots will shatter and tender seedlings will freeze unless protected today.',
        taskA: { icon: '🌾', title: 'Drape Thermal Burlap on Beds', benefit: 'Shields seedlings down to -5°C', costH: 1.5, copy: 'Leo and Maya stretch breathable insulation cloth over wooden hoops.' },
        taskB: { icon: '⚡', title: 'Wire 12V Heat Trace on Cistern', benefit: 'Prevents brass spigot rupture', costH: 1.5, copy: 'The Electrician wraps self-regulating silicone heating tape around outlet.' }
      },
      hailstorm: {
        title: '48h Weather Alert: Severe Ice Hailstorm',
        icon: '⛈️',
        subtitle: 'Golf-Ball Hail • Protect Solar PV & Greenhouse Glazing',
        desc: 'Violent atmospheric convection ahead! 4cm ice hail stones can crack glass PV faces unless arrays are tilted to vertical stowed position.',
        taskA: { icon: '⚡', title: 'Stow Bifacial Solar Panels to 90°', benefit: 'Deflects direct perpendicular hail strikes', costH: 1.5, copy: 'Release tilt pins to let bifacial panels hang vertically.' },
        taskB: { icon: '🕸️', title: 'Unfurl High-Tensile Hail Netting', benefit: 'Prevents crop defoliation', costH: 2.0, copy: 'Roll out UV-stabilized mesh canopy across raised beds.' }
      },
      flash_flood: {
        title: '48h Weather Alert: Mountain Flash Flood',
        icon: '🌊',
        subtitle: 'Torrential Runoff • Protect FabLab & Electrical Sump',
        desc: 'Mountain creek is rising rapidly! Floodwaters threaten to inundate the FabLab CNC electronics and wash away topsoil.',
        taskA: { icon: '🚜', title: 'Excavate Diversion Bioswales', benefit: 'Channels 5,000L flood runoff safely', costH: 2.0, copy: 'Trench curved swales into contour to divert water to reed pond.' },
        taskB: { icon: '🧱', title: 'Deploy Sandbag Flood Wall at FabLab', benefit: 'Waterproof seal for machine tools', costH: 2.0, copy: 'Stack heavy gravel bags at the workshop thresholds.' }
      },
      windstorm: {
        title: '48h Weather Alert: Gale-Force Windstorm (100 km/h)',
        icon: '🌪️',
        subtitle: 'High Shear Gusts • Secure LoRa Mast & Guest Pavilion',
        desc: 'Gale-force cyclonic front approaching. Unsecured roofs and radio towers can suffer structural bending or guy-wire fatigue.',
        taskA: { icon: '📡', title: 'Tension Steel Guy-Wires on LoRa Mast', benefit: 'Reinforces tower up to 130 km/h gusts', costH: 1.5, copy: 'Nico cranks turnbuckles on ground anchors and checks torque.' },
        taskB: { icon: '🏨', title: 'Lash Down Guest Dome Canvas Flaps', benefit: 'Eliminates wind drag and fabric tears', costH: 1.5, copy: 'Batten down triangular geodesic hatches and storm shutters.' }
      },
      drought: {
        title: '48h Weather Alert: Scorching Summer Drought',
        icon: '☀️',
        subtitle: '40-Day Dry Spell • Protect Topsoil Moisture',
        desc: 'Zero rainfall projected for 4 weeks. High evaporation will parch root zones unless thick organic ground cover is laid.',
        taskA: { icon: '🌾', title: 'Apply 10cm Straw Mulch Blanket', benefit: 'Cuts garden evaporation by 70%', costH: 1.5, copy: 'Cover exposed dark topsoil with golden cedar straw.' },
        taskB: { icon: '💧', title: 'Switch to Subsurface Drip Lines', benefit: 'Zero water lost to wind drift', costH: 2.0, copy: 'Connect gravity cistern directly to underground emitter tubes.' }
      },
      heat_dome: {
        title: '48h Weather Alert: 42°C Extreme Heat Dome',
        icon: '🔥',
        subtitle: 'High Thermal Stress • Protect Crew & Pollen Fertility',
        desc: 'Dangerous heat inversion incoming. Ambient temperatures will reach 42°C, stressing garden plants and indoor living spaces.',
        taskA: { icon: '⛱️', title: 'Deploy 50% Aluminet Shade Sails', benefit: 'Lowers canopy temperature by 6°C', costH: 1.5, copy: 'Suspend reflective aluminet sheets over crops and porch.' },
        taskB: { icon: '💦', title: 'Activate Aeroponic Misting Chillers', benefit: 'Evaporative cooling for crew and crops', costH: 1.5, copy: 'Run high-pressure micro-nozzles using surplus solar power.' }
      },
      atmospheric_river: {
        title: '48h Weather Alert: Torrential Atmospheric River',
        icon: '🌧️',
        subtitle: '150mm Sustained Deluge • Prevent Soil Erosion',
        desc: 'Tropical moisture corridor dumping 150mm over 36 hours. Silt traps and drainage basins must be cleared immediately.',
        taskA: { icon: '🌿', title: 'Clean Reed Bed Silt Traps & Screens', benefit: 'Prevents biofilter clogging', costH: 1.5, copy: 'Elena scoops silt and fallen leaves from inflow channels.' },
        taskB: { icon: '🪵', title: 'Anchor Permaculture Check Dams', benefit: 'Slows and spreads high-velocity runoff', costH: 2.0, copy: 'Stake cedar logs across gullies to catch organic sediment.' }
      }
    };

    const crisis = weatherCatalog[crisisId] || weatherCatalog.cold_snap;

    this.modalEl.innerHTML = `
      <div class="modal-window event-modal-window crisis-window" role="dialog" aria-modal="true">
        <div class="modal-header">
          <div class="modal-title-group">
            <span class="modal-icon">${crisis.icon}</span>
            <div>
              <h2 class="modal-title" style="color: #67e8f9;">${crisis.title}</h2>
              <span class="modal-subtitle">${crisis.subtitle}</span>
            </div>
          </div>
          <button type="button" class="btn-modal-close" id="btn-event-close" aria-label="Close dialog">✕</button>
        </div>

        <div class="event-modal-body">
          <div class="crisis-alert-banner">
            <p class="crisis-desc"><strong>Early Warning Radar:</strong> ${crisis.desc}</p>
          </div>

          <div class="crisis-tasks-grid">
            <!-- Task A -->
            <div class="crisis-task-card" id="task-card-a">
              <div class="crisis-task-header">
                <span class="task-icon">${crisis.taskA.icon}</span>
                <div>
                  <h3 class="task-title">${crisis.taskA.title}</h3>
                  <span class="task-benefit">${crisis.taskA.benefit}</span>
                </div>
              </div>
              <p class="task-copy">${crisis.taskA.copy}</p>
              <div class="task-action-row">
                <span class="task-cost">⏳ ${crisis.taskA.costH}h Labor</span>
                <button type="button" class="btn-primary btn-task-action" id="btn-action-a" ${remainingH < crisis.taskA.costH ? 'disabled' : ''}>
                  Assign Crew (${crisis.taskA.costH}h)
                </button>
              </div>
            </div>

            <!-- Task B -->
            <div class="crisis-task-card" id="task-card-b">
              <div class="crisis-task-header">
                <span class="task-icon">${crisis.taskB.icon}</span>
                <div>
                  <h3 class="task-title">${crisis.taskB.title}</h3>
                  <span class="task-benefit">${crisis.taskB.benefit}</span>
                </div>
              </div>
              <p class="task-copy">${crisis.taskB.copy}</p>
              <div class="task-action-row">
                <span class="task-cost">⏳ ${crisis.taskB.costH}h Labor</span>
                <button type="button" class="btn-primary btn-task-action" id="btn-action-b" ${remainingH < crisis.taskB.costH ? 'disabled' : ''}>
                  Assign Crew (${crisis.taskB.costH}h)
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn-secondary" id="btn-crisis-dismiss">Acknowledge Alert</button>
        </div>
      </div>
    `;

    const handleTask = (cardId, btnId, costH) => {
      const btn = this.modalEl.querySelector(btnId);
      const card = this.modalEl.querySelector(cardId);
      if (btn && card) {
        btn.addEventListener('click', () => {
          if ((gameState.data.chores?.remainingHours || 0) >= costH) {
            soundFX.playClick();
            gameState.data.chores.remainingHours -= costH;
            gameState.save();
            gameState.emit('resources_updated', gameState.data.resources);
            btn.textContent = '✓ Protected!';
            btn.disabled = true;
            card.style.borderColor = '#10b981';
            card.style.background = 'rgba(16, 185, 129, 0.12)';
          }
        });
      }
    };

    handleTask('#task-card-a', '#btn-action-a', crisis.taskA.costH);
    handleTask('#task-card-b', '#btn-action-b', crisis.taskB.costH);

    this.modalEl.querySelector('#btn-event-close')?.addEventListener('click', () => this.close());
    this.modalEl.querySelector('#btn-crisis-dismiss')?.addEventListener('click', () => this.close());
  }

  /* -------------------------------------------------------------
   * 3. Legacy Adversary Threats Modal (Matrix 2: All 5 Threats)
   * ----------------------------------------------------------- */
  renderLegacyThreatModal(options = {}) {
    const threatId = options.id || 'grid_severing';

    const threats = {
      npl_debt_strike: {
        title: 'Legacy Threat: Bank Debt Foreclosure Strike',
        icon: '🏦',
        subtitle: 'Extractive Loan Default Notice • Art. 3.1 Usufruct Immunity',
        problem: 'Predatory bank sends final demand notice on land debt.',
        narrative: 'The mortgage servicer claims the founding camp is in default. We can amortize through remote consulting or assert our non-commercial usufruct shield.',
        actionA: { title: 'Fulfill External CAD Order ($300)', desc: 'Pay down principal directly through engineering labor.', key: 'pay' },
        actionB: { title: 'File Usufruct Commons Injunction', desc: 'Invoke Article 3.1 Non-Commercial Public Trust Usufruct.', key: 'legal' }
      },
      grid_severing: {
        title: 'Legacy Threat: Extractive Grid Power Cut',
        icon: '⚡',
        subtitle: 'Central Utility Disconnection • Microgrid Sovereignty',
        problem: 'Monopoly utility abruptly severs high-voltage line.',
        narrative: 'A transmission cutoff left regional towns in dark. Our bifacial solar array and auxiliary camper van battery allow total islanding.',
        actionA: { title: 'Isolate Microgrid: 100% Off-Grid', desc: 'Trip main isolator breaker. Run 100% on local solar storage.', key: 'island' },
        actionB: { title: 'Share Power with Stranded Neighbor', desc: 'Deploy 50m extension line to keep medicine fridge cold.', key: 'aid' }
      },
      tax_inspection_roadblock: {
        title: 'Legacy Threat: Cargo Van Roadblock Inspection',
        icon: '🚔',
        subtitle: 'Bureaucratic Interception • Open Knowledge Manifest',
        problem: 'Highway patrol stops van carrying CNC motor kits.',
        narrative: 'Officers demand commercial transport licenses and customs duty. We must present our non-commercial AGPL open-hardware manifest.',
        actionA: { title: 'Present AGPLv3 Open Manifest', desc: 'Hand over public verifiable GitHub schematics and non-profit affidavit.', key: 'manifest' },
        actionB: { title: 'Radio Reticulum Sister Escort', desc: 'Summon peer co-op representatives via LoRa mesh radio.', key: 'mesh' }
      },
      false_ubi_cooptation: {
        title: 'Legacy Threat: Speculator Cash Buyout ($50,000)',
        icon: '💼',
        subtitle: 'Corporate Buyout Attempt • Anti-Speculation Law',
        problem: 'Private developer offers $50,000 to privatize camp acreage.',
        narrative: 'A venture syndicate offers cash bribes and private crypto vouchers to buy out the plot. Article 4 prohibits real estate speculation.',
        actionA: { title: 'Reject Buyout: Reaffirm Inviolable Usufruct', desc: 'Unanimous community vote to decline privatization.', key: 'reject' },
        actionB: { title: 'Publish Open Dossier on Mesh', desc: 'Broadcast developer’s predatory tactics across Reticulum network.', key: 'expose' }
      },
      surge_pricing_blackout: {
        title: 'Legacy Threat: Grid Monopoly 800% Peak Surcharge',
        icon: '📈',
        subtitle: 'Energy Monopoly Gouging • Baseload Sovereignty',
        problem: 'Utility charges 800% peak extortion tariff during heatwave.',
        narrative: 'The grid operator demands extortionate spot pricing. With our solar microgrid, we can disconnect entirely without blinking a light.',
        actionA: { title: 'Flip Islanding Switch: Zero Grid Draw', desc: 'Rely 100% on self-generated clean solar and batteries.', key: 'island' },
        actionB: { title: 'Dump Solar Surplus into Cold Thermal Sink', desc: 'Pre-chill cistern water to run passive cooling loops.', key: 'chill' }
      }
    };

    const threat = threats[threatId] || threats.grid_severing;

    this.modalEl.innerHTML = `
      <div class="modal-window event-modal-window threat-window" role="dialog" aria-modal="true">
        <div class="modal-header">
          <div class="modal-title-group">
            <span class="modal-icon">${threat.icon}</span>
            <div>
              <h2 class="modal-title" style="color: #f87171;">${threat.title}</h2>
              <span class="modal-subtitle">${threat.subtitle}</span>
            </div>
          </div>
          <button type="button" class="btn-modal-close" id="btn-event-close" aria-label="Close dialog">✕</button>
        </div>

        <div class="event-modal-body">
          <div class="threat-alert-box">
            <p class="threat-problem">⚠️ <strong>${threat.problem}</strong></p>
            <p class="threat-narrative">${threat.narrative}</p>
          </div>

          <div class="threat-actions-grid">
            <div class="threat-action-card">
              <h3 class="threat-action-title">Option A: ${threat.actionA.title}</h3>
              <p class="threat-action-desc">${threat.actionA.desc}</p>
              <button type="button" class="btn-primary" id="btn-threat-act-a">
                🛡️ Enact Option A
              </button>
            </div>

            <div class="threat-action-card">
              <h3 class="threat-action-title">Option B: ${threat.actionB.title}</h3>
              <p class="threat-action-desc">${threat.actionB.desc}</p>
              <button type="button" class="btn-primary" id="btn-threat-act-b">
                🤝 Enact Option B
              </button>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn-secondary" id="btn-threat-dismiss">Dismiss Notice</button>
        </div>
      </div>
    `;

    const resolveThreat = (choice) => {
      soundFX.playClick();
      soundFX.playChoreExtinctionFanfare();
      gameState.data.morale = Math.min(100, (gameState.data.morale || 85) + 10);
      gameState.save();
      this.close();
    };

    this.modalEl.querySelector('#btn-threat-act-a')?.addEventListener('click', () => resolveThreat('A'));
    this.modalEl.querySelector('#btn-threat-act-b')?.addEventListener('click', () => resolveThreat('B'));
    this.modalEl.querySelector('#btn-event-close')?.addEventListener('click', () => this.close());
    this.modalEl.querySelector('#btn-threat-dismiss')?.addEventListener('click', () => this.close());
  }

  /* -------------------------------------------------------------
   * 4. Weekend Conviviality Activity Modal (Matrix 7: All 8 Events)
   * ----------------------------------------------------------- */
  renderWeekendActivityModal(options = {}) {
    const actId = options.id || 'sunday_rover_race';

    if (actId === 'sunday_rover_race') {
      this.modalEl.innerHTML = `
        <div class="modal-window event-modal-window" role="dialog" aria-modal="true">
          <div class="modal-header">
            <div class="modal-title-group">
              <span class="modal-icon">🏎️</span>
              <div>
                <h2 class="modal-title">Sunday Solar Toy Rover Drag Race</h2>
                <span class="modal-subtitle">Kids Milo & Tara vs Nico • 3D Printed Micro-Rovers</span>
              </div>
            </div>
            <button type="button" class="btn-modal-close" id="btn-event-close" aria-label="Close dialog">✕</button>
          </div>

          <div class="event-modal-body">
            <p class="race-intro">
              The FabLab 3D printers ran all morning! The kids and Nico assembled two capacitor-boosted solar toy rovers.
              Charge the capacitors and drop the starting flag on the wooden deck ramp!
            </p>

            <div class="race-track-box">
              <div class="race-lane">
                <span class="lane-label">👶 Sun-Stalker (Milo & Tara):</span>
                <div class="lane-track"><div class="lane-rover" id="rover-milo" style="left: 0%;">🏎️</div></div>
              </div>
              <div class="race-lane">
                <span class="lane-label">📡 Mesh-Racer (Nico):</span>
                <div class="lane-track"><div class="lane-rover" id="rover-nico" style="left: 0%;">🏎️</div></div>
              </div>
            </div>

            <div class="race-controls">
              <label for="race-boost-slider" class="race-boost-label">Capacitor Supercharge Boost: <span id="boost-val">80%</span></label>
              <input type="range" id="race-boost-slider" min="20" max="100" value="80" class="slider-full">
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-secondary" id="btn-race-close">Close</button>
            <button type="button" class="btn-primary" id="btn-start-race">🏁 LAUNCH DRAG RACE!</button>
          </div>
        </div>
      `;

      const slider = this.modalEl.querySelector('#race-boost-slider');
      const valEl = this.modalEl.querySelector('#boost-val');
      slider?.addEventListener('input', (e) => {
        if (valEl) valEl.textContent = `${e.target.value}%`;
      });

      const launchBtn = this.modalEl.querySelector('#btn-start-race');
      launchBtn?.addEventListener('click', () => {
        soundFX.playClick();
        launchBtn.disabled = true;
        launchBtn.textContent = '🏎️ RACING...';

        let p1 = 0;
        let p2 = 0;
        const r1 = this.modalEl.querySelector('#rover-milo');
        const r2 = this.modalEl.querySelector('#rover-nico');

        const interval = setInterval(() => {
          p1 += 4 + Math.random() * 6;
          p2 += 3.8 + Math.random() * 6;

          if (r1) r1.style.left = `${Math.min(90, p1)}%`;
          if (r2) r2.style.left = `${Math.min(90, p2)}%`;

          if (p1 >= 90 || p2 >= 90) {
            clearInterval(interval);
            soundFX.playChoreExtinctionFanfare();
            gameState.data.morale = 100;
            gameState.save();
            launchBtn.textContent = '🏆 VICTORY! Morale 100%';
          }
        }, 80);
      });

      this.modalEl.querySelector('#btn-event-close')?.addEventListener('click', () => this.close());
      this.modalEl.querySelector('#btn-race-close')?.addEventListener('click', () => this.close());

    } else if (actId === 'sunday_kite') {
      this.modalEl.innerHTML = `
        <div class="modal-window event-modal-window" role="dialog" aria-modal="true">
          <div class="modal-header">
            <div class="modal-title-group">
              <span class="modal-icon">🪁</span>
              <div>
                <h2 class="modal-title">Sunday High-Altitude Solar Kite</h2>
                <span class="modal-subtitle">Atmospheric Telemetry • Thermal Wind Profiling</span>
              </div>
            </div>
            <button type="button" class="btn-modal-close" id="btn-event-close" aria-label="Close dialog">✕</button>
          </div>

          <div class="event-modal-body">
            <p>Milo and Tara launch a bright orange tetrahedral kite carrying an ESP32 wind speed datalogger into mountain thermals.</p>
            <div class="kite-alt-meter">
              <span class="kite-alt-label">Kite Altitude: <strong id="kite-alt-val">35 m</strong></span>
              <div class="kite-alt-bar"><div class="kite-alt-fill" id="kite-alt-fill" style="width: 35%;"></div></div>
            </div>
            <p class="kite-sub" style="color: #38bdf8; margin-top: 12px;">Mapped boundary-layer wind shears: +15% Wind Energy Efficiency unlocked!</p>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-secondary" id="btn-kite-close">Reel In & Store</button>
            <button type="button" class="btn-primary" id="btn-kite-reel">🪁 Reel Out More Line (+25m)</button>
          </div>
        </div>
      `;

      let alt = 35;
      this.modalEl.querySelector('#btn-kite-reel')?.addEventListener('click', () => {
        soundFX.playClick();
        alt = Math.min(150, alt + 25);
        const altVal = this.modalEl.querySelector('#kite-alt-val');
        const altFill = this.modalEl.querySelector('#kite-alt-fill');
        if (altVal) altVal.textContent = `${alt} m`;
        if (altFill) altFill.style.width = `${(alt / 150) * 100}%`;
        if (alt >= 120) soundFX.playAcousticStrum();
      });

      this.modalEl.querySelector('#btn-event-close')?.addEventListener('click', () => this.close());
      this.modalEl.querySelector('#btn-kite-close')?.addEventListener('click', () => this.close());

    } else if (actId === 'campfire_stargazing') {
      this.modalEl.innerHTML = `
        <div class="modal-window event-modal-window" role="dialog" aria-modal="true">
          <div class="modal-header">
            <div class="modal-title-group">
              <span class="modal-icon">✨</span>
              <div>
                <h2 class="modal-title">Sunset Campfire & Stargazing</h2>
                <span class="modal-subtitle">Elder Rosa's Oral Histories • Solarpunk Constellations</span>
              </div>
            </div>
            <button type="button" class="btn-modal-close" id="btn-event-close" aria-label="Close dialog">✕</button>
          </div>

          <div class="event-modal-body">
            <p>Rosa sits on the porch rocking chair while the scent of cedar woodsmoke fills the twilight dusk.</p>
            <blockquote style="border-left: 3px solid #fbbf24; padding-left: 12px; margin: 12px 0; color: #fde047; font-style: italic;">
              "When we first parked the camper van here on Day 1, there was only dry gravel and dead thistle. Look at the solar arrays now—and the trees we planted for children yet to come."
            </blockquote>
            <p style="color: #34d399;">🌌 The crew gathers in silence as the Milky Way emerges. Pioneer energy restored to 100%.</p>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-primary" id="btn-stargaze-close">✨ Turn In Under the Stars</button>
          </div>
        </div>
      `;

      this.modalEl.querySelector('#btn-stargaze-close')?.addEventListener('click', () => {
        soundFX.playNightfallChime();
        gameState.data.morale = 100;
        gameState.save();
        this.close();
      });
      this.modalEl.querySelector('#btn-event-close')?.addEventListener('click', () => this.close());

    } else {
      // General Weekend Activity fallback
      this.renderFeastModal();
    }
  }

  /* -------------------------------------------------------------
   * 5. Agora Demarchy Sortition Assembly (Section 7.3 & Matrix 8)
   * ----------------------------------------------------------- */
  renderDemarchyDilemmaModal(options = {}) {
    const dilemmaId = options.id || 'dil-refugees';
    const dilemmas = gameState.getDemarchyDilemmas();
    const d = dilemmas.find(x => x.id === dilemmaId) || dilemmas[0];

    // Pick 5 citizens by sortition with odd-parity
    const allCitizens = [gameState.data.player, ...(gameState.data.companions || [])];
    const jurors = [];
    const pool = [...allCitizens];
    for (let i = 0; i < Math.min(5, pool.length); i++) {
      const idx = Math.floor(Math.random() * pool.length);
      jurors.push(pool.splice(idx, 1)[0]);
    }

    this.modalEl.innerHTML = `
      <div class="modal-window event-modal-window agora-window" role="dialog" aria-modal="true">
        <div class="modal-header">
          <div class="modal-title-group">
            <span class="modal-icon">🏛️</span>
            <div>
              <h2 class="modal-title">Agora Demarchy Assembly: ${d.title}</h2>
              <span class="modal-subtitle">5-Juror Sortition Jury • 75% Supermajority Deliberation</span>
            </div>
          </div>
          <button type="button" class="btn-modal-close" id="btn-event-close" aria-label="Close dialog">✕</button>
        </div>

        <div class="event-modal-body">
          <!-- Sortition Jurors Panel -->
          <div class="agora-jurors-box">
            <span class="agora-jurors-label">🎲 Odd-Parity Sortition Jury Drawn by Lot:</span>
            <div class="agora-jurors-chips">
              ${jurors.map(j => `
                <div class="agora-juror-chip">
                  <span>${j.icon || '🧑'}</span>
                  <span>${j.name}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Dilemma Context -->
          <div class="agora-dilemma-card">
            <p class="agora-speaker-quote">
              <strong>${d.speaker}:</strong> "${d.trigger}"
            </p>
          </div>

          <!-- 2 Deliberation Options -->
          <div class="agora-voting-grid">
            <div class="agora-vote-card" id="card-option-a">
              <h3 class="vote-opt-title">Option A: ${d.optionA.title}</h3>
              <p class="vote-opt-desc">${d.optionA.desc}</p>
              <div class="vote-opt-meta">
                <span class="vote-benefit">🎁 ${d.optionA.benefit}</span>
                <span class="vote-cost">⚠️ ${d.optionA.cost}</span>
              </div>
              <button type="button" class="btn-primary btn-cast-vote" id="btn-vote-a">
                Vote Option A
              </button>
            </div>

            <div class="agora-vote-card" id="card-option-b">
              <h3 class="vote-opt-title">Option B: ${d.optionB.title}</h3>
              <p class="vote-opt-desc">${d.optionB.desc}</p>
              <div class="vote-opt-meta">
                <span class="vote-benefit">🎁 ${d.optionB.benefit}</span>
                <span class="vote-cost">⚠️ ${d.optionB.cost}</span>
              </div>
              <button type="button" class="btn-primary btn-cast-vote" id="btn-vote-b">
                Vote Option B
              </button>
            </div>
          </div>

          <div id="agora-tally-results" style="display: none; margin-top: 16px;"></div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn-secondary" id="btn-agora-adjourn">Adjourn Assembly</button>
        </div>
      </div>
    `;

    const castVote = (choiceKey) => {
      soundFX.playClick();
      const resultsEl = this.modalEl.querySelector('#agora-tally-results');
      const btnA = this.modalEl.querySelector('#btn-vote-a');
      const btnB = this.modalEl.querySelector('#btn-vote-b');
      if (btnA) btnA.disabled = true;
      if (btnB) btnB.disabled = true;

      // Simulated juror deliberation
      const aVotes = choiceKey === 'A' ? 4 : 1;
      const bVotes = 5 - aVotes;
      const isSupermajority = aVotes >= 4 || bVotes >= 4;

      if (resultsEl) {
        resultsEl.style.display = 'block';
        resultsEl.innerHTML = `
          <div class="agora-tally-box">
            <h4 style="color: #34d399;">🗳️ Voting Tally: Option A: ${aVotes} Votes • Option B: ${bVotes} Votes</h4>
            <p>${isSupermajority ? '🌟 <strong>75% Supermajority Ratified!</strong> The constitutional decision is sealed into law.' : '✓ Simple majority ratified by assembly.'}</p>
          </div>
        `;
      }

      gameState.resolveDemarchyDilemma(d.id, choiceKey);
      soundFX.playChoreExtinctionFanfare();

      setTimeout(() => {
        this.close();
      }, 2500);
    };

    this.modalEl.querySelector('#btn-vote-a')?.addEventListener('click', () => castVote('A'));
    this.modalEl.querySelector('#btn-vote-b')?.addEventListener('click', () => castVote('B'));
    this.modalEl.querySelector('#btn-event-close')?.addEventListener('click', () => this.close());
    this.modalEl.querySelector('#btn-agora-adjourn')?.addEventListener('click', () => this.close());
  }

  /* -------------------------------------------------------------
   * 6. Legacy Debt Amortization Desk (ETI Consulting)
   * ----------------------------------------------------------- */
  renderDebtConsultingModal() {
    const debt = gameState.data.debtUsd !== undefined ? gameState.data.debtUsd : 12000;
    const remainingH = gameState.data.chores?.remainingHours !== undefined ? gameState.data.chores.remainingHours : 6.0;

    this.modalEl.innerHTML = `
      <div class="modal-window event-modal-window" role="dialog" aria-modal="true">
        <div class="modal-header">
          <div class="modal-title-group">
            <span class="modal-icon">💰</span>
            <div>
              <h2 class="modal-title">Pay Off the Land Debt ($12,000 ➔ $0)</h2>
              <span class="modal-subtitle">Do remote computer jobs from the camper van to own the land 100%!</span>
            </div>
          </div>
          <button type="button" class="btn-modal-close" id="btn-event-close" aria-label="Close dialog">✕</button>
        </div>

        <div class="event-modal-body">
          <div class="debt-status-card">
            <div class="debt-meter-header">
              <span class="debt-meter-title">Bank Loan Remaining:</span>
              <span class="debt-meter-val" id="modal-debt-val" style="color: ${debt <= 0 ? '#34d399' : '#f87171'};">
                $${debt.toLocaleString()}
              </span>
            </div>
            <div class="debt-progress-bar">
              <div class="debt-progress-fill" style="width: ${Math.max(0, 100 - (debt / 12000) * 100)}%;"></div>
            </div>
            <p class="debt-meter-sub">
              ${debt <= 0 
                ? '🏆 <strong>DEBT FREE!</strong> You paid off the bank completely. The land belongs to the community forever! You can now build the FabLab.' 
                : 'Do online freelance tech jobs from your camper van laptop to pay down the bank loan.'}
            </p>
          </div>

          ${debt > 0 ? `
            <div class="consulting-actions-box">
              <h3 class="consulting-title">💻 Available Remote Jobs Today:</h3>

              ${remainingH < 2.0 ? `
                <div class="inspector-labor-notice">
                  <span>🌙 <strong>Daily pioneer labor exhausted (${remainingH.toFixed(1)}h remaining).</strong> Click <strong>Rest to Dawn</strong> (🌙 in bottom dock) to advance to tomorrow and restore labor!</span>
                </div>
              ` : ''}

              <div class="consulting-order-card">
                <div>
                  <h4 class="order-name">Fix Water Flow Sensors for Alpine Co-op</h4>
                  <span class="order-desc">Spend 2.0h laptop work • Pays $300 directly off your bank loan</span>
                </div>
                <button type="button" class="btn-primary" id="btn-consult-2h" ${remainingH < 2.0 ? 'disabled' : ''}>
                  Work (2.0h • -$300 Debt)
                </button>
              </div>

              <div class="consulting-order-card">
                <div>
                  <h4 class="order-name">Tune 3D Printer Speed Profiles</h4>
                  <span class="order-desc">Spend 4.0h laptop work • Pays $600 directly off your bank loan</span>
                </div>
                <button type="button" class="btn-primary" id="btn-consult-4h" ${remainingH < 4.0 ? 'disabled' : ''}>
                  Work (4.0h • -$600 Debt)
                </button>
              </div>

              ${gameState.data.buildings?.some(b => b.type === 'fablab') ? `
                <div class="consulting-order-card" style="border: 1px solid rgba(245, 158, 11, 0.4); background: rgba(245, 158, 11, 0.08);">
                  <div>
                    <h4 class="order-name" style="color: #fbbf24;">⚙️ FabLab CNC Tractor Parts Contract</h4>
                    <span class="order-desc">Spend 4.0h FabLab CNC machining • Pays $1,500 directly off your bank loan!</span>
                  </div>
                  <button type="button" class="btn-primary" id="btn-consult-fablab" ${remainingH < 4.0 ? 'disabled' : ''} style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
                    Machine (4.0h • -$1,500 Debt)
                  </button>
                </div>
              ` : ''}
            </div>
          ` : `
            <div class="debt-victory-card">
              <span class="victory-icon">🎉</span>
              <h3>The Land is 100% Yours!</h3>
              <p>With the bank loan paid off, no landlord or bank can ever evict you. You can now build the Open-Source FabLab Workshop!</p>
            </div>
          `}
        </div>

        <div class="modal-footer">
          <button type="button" class="btn-secondary" id="btn-debt-close">Return to Plot</button>
        </div>
      </div>
    `;

    const handleConsult = (btnId, hours, payout = null) => {
      const btn = this.modalEl.querySelector(btnId);
      if (btn) {
        btn.addEventListener('click', () => {
          const res = gameState.performConsulting(hours, payout);
          if (res.ok) {
            soundFX.playClick();
            if (res.remainingDebt <= 0) {
              soundFX.playChoreExtinctionFanfare();
            }
            this.renderDebtConsultingModal();
          }
        });
      }
    };

    handleConsult('#btn-consult-2h', 2.0);
    handleConsult('#btn-consult-4h', 4.0);
    handleConsult('#btn-consult-fablab', 4.0, 1500);

    this.modalEl.querySelector('#btn-event-close')?.addEventListener('click', () => this.close());
    this.modalEl.querySelector('#btn-debt-close')?.addEventListener('click', () => this.close());
  }

  /* -------------------------------------------------------------
   * 7. Water Management & Emergency Relief Desk
   * ----------------------------------------------------------- */
  renderWaterManagementModal(options = {}) {
    const data = gameState.data;
    const waterL = Math.round(data.resources.waterLiters || 0);
    const capacityL = Math.round(data.resources.waterCapacityL || 2000);
    const pct = Math.min(100, Math.round((waterL / capacityL) * 100));
    const peopleCount = Math.max(3, (data.companions?.length || 2) + 1);
    const hasReedBed = data.buildings?.some(b => b.type === 'reed_bed');
    const waterBase = peopleCount * 50;
    const dailyDraw = hasReedBed ? Math.round(waterBase * 0.35) : waterBase;
    const daysAutonomy = dailyDraw > 0 ? Math.floor(waterL / dailyDraw) : 99;

    const cisternCount = data.buildings?.filter(b => b.type === 'rain_cistern').length || 0;
    const swaleCount = data.buildings?.filter(b => b.type === 'retention_swale').length || 0;
    const wellCount = data.buildings?.filter(b => b.type === 'deep_well').length || 0;
    const catchmentM2 = (cisternCount * 30) + (swaleCount * 60);

    const weather = data.weather || { sky: 'Crisp Clear Dawn', icon: '☀️', tempC: 22, rainfallMm: 0, solarIrradiance: 1.0 };
    const rainfallMm = weather.rainfallMm || 0;
    const expectedCatchment = Math.round(catchmentM2 * rainfallMm);
    const remainingH = data.chores?.remainingHours !== undefined ? data.chores.remainingHours : 6.0;
    const fiatUsd = data.fiatEarnedUsd || 0;
    const hasLora = data.buildings?.some(b => b.type === 'lora_mast');

    const isEmergency = options.isEmergency || waterL <= 0;

    this.modalEl.innerHTML = `
      <div class="modal-window event-modal-window" style="max-width: 660px;" role="dialog" aria-modal="true">
        <div class="modal-header">
          <div class="modal-title-group">
            <span class="modal-icon">${waterL <= 0 ? '🚨' : '💧'}</span>
            <div>
              <h2 class="modal-title">${waterL <= 0 ? 'EMERGENCY: Water Depleted!' : 'Water Management & Hydrological Desk'}</h2>
              <span class="modal-subtitle">Rainwater Catchment • Deep Aquifer • Emergency Tankers</span>
            </div>
          </div>
          <button type="button" class="btn-modal-close" id="btn-event-close" aria-label="Close dialog">✕</button>
        </div>

        <div class="event-modal-body">
          ${isEmergency ? `
            <div style="background: rgba(239, 68, 68, 0.15); border: 1px solid #ef4444; border-radius: var(--radius-md); padding: 12px 16px; margin-bottom: 12px;">
              <span style="font-weight: 700; color: #fca5a5; display: block; font-size: 13px;">⚠️ CRITICAL WATER EXHAUSTION (0 Liters)</span>
              <p style="margin: 4px 0 0; font-size: 11px; color: #fecaca; line-height: 1.4;">
                Settlement cisterns are dry! Without water, crops will wilt and community morale drops by -15%/day.
                You can <strong>work for legacy to order an emergency tanker</strong>, <strong>hand-pump groundwater</strong>, or <strong>call sister nodes on mesh</strong>.
              </p>
            </div>
          ` : ''}

          <!-- Water Storage Gauge -->
          <div class="debt-status-card" style="margin-bottom: 14px;">
            <div class="debt-meter-header">
              <span class="debt-meter-title">Potable & Cistern Storage:</span>
              <span class="debt-meter-val" style="color: ${waterL <= 0 ? '#ef4444' : (waterL < 500 ? '#f59e0b' : '#38bdf8')};">
                ${waterL.toLocaleString()} / ${capacityL.toLocaleString()} Liters (${pct}%)
              </span>
            </div>
            <div class="debt-progress-bar">
              <div class="debt-progress-fill" style="width: ${pct}%; background: ${waterL <= 0 ? '#ef4444' : (waterL < 500 ? '#f59e0b' : 'linear-gradient(90deg, #0284c7 0%, #38bdf8 100%)')};"></div>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8; margin-top: 6px;">
              <span>Daily Draw: <strong>${dailyDraw} L/d</strong> (${peopleCount} pioneers • ${hasReedBed ? '65% reed-bed recycled' : 'no recycling'})</span>
              <span>Reserve: <strong>${daysAutonomy} days</strong> autonomy</span>
            </div>
          </div>

          <!-- Rain & Inflow Telemetry Grid -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px;">
            <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: var(--radius-md); padding: 10px 12px;">
              <span style="font-size: 10px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">🌧️ Rain Catchment Area</span>
              <div style="font-size: 13px; font-weight: 700; color: #fff; margin-top: 2px;">
                ${catchmentM2} m² Area (${cisternCount} Cisterns, ${swaleCount} Swales)
              </div>
              <span style="font-size: 10.5px; color: #38bdf8;">
                ${rainfallMm > 0 ? `+${expectedCatchment} L harvested today from ${rainfallMm}mm rain!` : 'No rain today. Build more cisterns to catch next rain.'}
              </span>
            </div>

            <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: var(--radius-md); padding: 10px 12px;">
              <span style="font-size: 10px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">🚰 Deep Artesian Yield</span>
              <div style="font-size: 13px; font-weight: 700; color: #fff; margin-top: 2px;">
                ${wellCount > 0 ? `+${wellCount * 250} L/day Continuous Flow` : '0 L/day (No Well Built)'}
              </div>
              <span style="font-size: 10.5px; color: #34d399;">
                ${wellCount > 0 ? 'Solar aquifer pump flows regardless of rain!' : 'Deep Wells unlock in Tier 3'}
              </span>
            </div>
          </div>

          <!-- Emergency Action Options -->
          <h3 class="consulting-title" style="margin-bottom: 8px;">🚨 Emergency Water Relief Actions:</h3>
          <div style="display: flex; flex-direction: column; gap: 8px;">

            <!-- Option 1: Legacy Water Tanker -->
            <div class="consulting-order-card" style="border: 1px solid rgba(56, 189, 248, 0.3);">
              <div style="flex: 1;">
                <h4 class="order-name">🚚 Order Emergency Municipal Water Tanker (+1,000 L)</h4>
                <span class="order-desc">
                  ${fiatUsd >= 150 
                    ? `Spend $150 fiat balance (You have $${fiatUsd.toLocaleString()}) to dispatch bulk truck delivery.`
                    : `Spend 2.0h remote CAD/consulting for legacy clients to earn $150 and dispatch delivery.`}
                </span>
              </div>
              <button type="button" class="btn-primary" id="btn-water-tanker" ${fiatUsd < 150 && remainingH < 2.0 ? 'disabled' : ''} style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);">
                ${fiatUsd >= 150 ? 'Buy ($150 Fiat ➔ +1k L)' : 'Work 2h for Legacy ➔ Buy Water'}
              </button>
            </div>

            <!-- Option 2: Manual Aquifer Pumping -->
            <div class="consulting-order-card">
              <div style="flex: 1;">
                <h4 class="order-name">🚰 Manual Artesian Well Lever Pumping (+300 L)</h4>
                <span class="order-desc">Spend 2.0h pioneer muscle labor on the cast-iron backup lever to draw groundwater.</span>
              </div>
              <button type="button" class="btn-primary" id="btn-water-pump" ${remainingH < 2.0 ? 'disabled' : ''}>
                Pump (2.0h Labor ➔ +300 L)
              </button>
            </div>

            <!-- Option 3: Atmospheric Dew Nets -->
            <div class="consulting-order-card">
              <div style="flex: 1;">
                <h4 class="order-name">🕸️ Rig Atmospheric Raschel Dew Nets (+150 L)</h4>
                <span class="order-desc">Spend 1.5h pioneer labor setting condensation mesh on the mountain ridge.</span>
              </div>
              <button type="button" class="btn-primary" id="btn-water-dew" ${remainingH < 1.5 ? 'disabled' : ''}>
                Deploy (1.5h ➔ +150 L)
              </button>
            </div>

            <!-- Option 4: Reticulum Mesh Mutual Aid -->
            <div class="consulting-order-card" style="${hasLora ? 'border: 1px solid rgba(16, 185, 129, 0.4);' : 'opacity: 0.6;'}">
              <div style="flex: 1;">
                <h4 class="order-name">📡 Reticulum Mesh Sister Node Convoy (+500 L)</h4>
                <span class="order-desc">
                  ${hasLora ? 'Broadcast packet to Monte Sole node. Electric cargo trike dispatches +500 L free solidarity aid.' : 'Requires LoRa Telemetry Mast (Tier 2) to broadcast distress signal.'}
                </span>
              </div>
              <button type="button" class="btn-primary" id="btn-water-mesh" ${!hasLora ? 'disabled' : ''} style="${hasLora ? 'background: linear-gradient(135deg, #059669 0%, #047857 100%);' : ''}">
                Mesh Aid (+500 L Free)
              </button>
            </div>
          </div>
        </div>

        <div class="modal-footer" style="display: flex; justify-content: space-between; align-items: center;">
          <button type="button" class="btn-secondary" id="btn-water-close">Close Desk</button>
          <button type="button" class="btn-primary" id="btn-water-enlarge" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
            ➕ Enlarge Capacity (Build Cistern / Well)
          </button>
        </div>
      </div>
    `;

    // Handlers
    this.modalEl.querySelector('#btn-water-tanker')?.addEventListener('click', () => {
      const res = gameState.orderEmergencyWaterTanker();
      if (res.ok) {
        soundFX.playBuildThunk();
        this.renderWaterManagementModal(options);
      } else {
        alert(res.reason || 'Failed to order water tanker');
      }
    });

    this.modalEl.querySelector('#btn-water-pump')?.addEventListener('click', () => {
      const res = gameState.pumpEmergencyAquiferWater();
      if (res.ok) {
        soundFX.playBuildThunk();
        this.renderWaterManagementModal(options);
      } else {
        alert(res.reason || 'Failed to pump aquifer');
      }
    });

    this.modalEl.querySelector('#btn-water-dew')?.addEventListener('click', () => {
      const res = gameState.deployAtmosphericDewCatchers();
      if (res.ok) {
        soundFX.playBuildThunk();
        this.renderWaterManagementModal(options);
      } else {
        alert(res.reason || 'Failed to deploy dew nets');
      }
    });

    this.modalEl.querySelector('#btn-water-mesh')?.addEventListener('click', () => {
      const res = gameState.requestMeshEmergencyWater();
      if (res.ok) {
        soundFX.playChoreExtinctionFanfare();
        this.renderWaterManagementModal(options);
      } else {
        alert(res.reason || 'Failed to request mesh water');
      }
    });

    this.modalEl.querySelector('#btn-water-enlarge')?.addEventListener('click', () => {
      this.close();
      const hud = window.gameHud;
      if (hud) {
        hud.selectedTier = 1;
        hud.renderDock();
        hud.togglePlacement('rain_cistern');
      }
    });

    this.modalEl.querySelector('#btn-event-close')?.addEventListener('click', () => this.close());
    this.modalEl.querySelector('#btn-water-close')?.addEventListener('click', () => this.close());
  }

  /* -------------------------------------------------------------
   * 8. Microgrid & Energy Storage Desk
   * ----------------------------------------------------------- */
  renderEnergyManagementModal(options = {}) {
    const data = gameState.data;
    const energyStored = Math.round(data.resources.energyStoredKwh || 0);
    const energyCapacity = Math.round(data.resources.energyCapacityKwh || 100);
    const pct = Math.min(100, Math.round((energyStored / energyCapacity) * 100));

    const solarCount = data.buildings?.filter(b => b.type === 'solar_array').length || 0;
    const batteryCount = data.buildings?.filter(b => b.type === 'battery_bank').length || 0;
    const towerCount = data.buildings?.filter(b => b.type === 'solar_thermal_tower').length || 0;

    const weather = data.weather || { sky: 'Crisp Clear Dawn', icon: '☀️', tempC: 22, solarIrradiance: 1.0 };
    const irrPct = Math.round((weather.solarIrradiance || 1.0) * 100);
    const dailyGen = Math.round(solarCount * 15 * (weather.solarIrradiance || 1.0));
    const dailyLoad = 10.0;
    const netDaily = dailyGen - dailyLoad;

    this.modalEl.innerHTML = `
      <div class="modal-window event-modal-window" style="max-width: 640px;" role="dialog" aria-modal="true">
        <div class="modal-header">
          <div class="modal-title-group">
            <span class="modal-icon">⚡</span>
            <div>
              <h2 class="modal-title">Microgrid & Energy Storage Desk</h2>
              <span class="modal-subtitle">Bifacial PV Arrays • Sodium Battery Banks • Solar Spire</span>
            </div>
          </div>
          <button type="button" class="btn-modal-close" id="btn-event-close" aria-label="Close dialog">✕</button>
        </div>

        <div class="event-modal-body">
          <!-- Battery Storage Status -->
          <div class="debt-status-card" style="margin-bottom: 14px;">
            <div class="debt-meter-header">
              <span class="debt-meter-title">Total Battery Reserves:</span>
              <span class="debt-meter-val" style="color: ${energyStored < 15 ? '#f87171' : '#fbbf24'};">
                ${energyStored} / ${energyCapacity} kWh (${pct}%)
              </span>
            </div>
            <div class="debt-progress-bar">
              <div class="debt-progress-fill" style="width: ${pct}%; background: linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%);"></div>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8; margin-top: 6px;">
              <span>Daily Production: <strong>~${dailyGen} kWh/day</strong></span>
              <span>Settlement Load: <strong>10.0 kWh/day</strong> (${netDaily >= 0 ? `+${netDaily} kWh surplus` : `${netDaily} kWh deficit`})</span>
            </div>
          </div>

          <!-- Microgrid Telemetry Cards -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px;">
            <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: var(--radius-md); padding: 10px 12px;">
              <span style="font-size: 10px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">☀️ Solar PV Inverter</span>
              <div style="font-size: 13px; font-weight: 700; color: #fff; margin-top: 2px;">
                ${solarCount} Arrays (${(solarCount * 1.5).toFixed(1)} kW Peak)
              </div>
              <span style="font-size: 10.5px; color: #fbbf24;">
                ${irrPct}% Atmospheric Irradiance (${weather.sky})
              </span>
            </div>

            <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: var(--radius-md); padding: 10px 12px;">
              <span style="font-size: 10px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">🔋 Energy Storage Assets</span>
              <div style="font-size: 13px; font-weight: 700; color: #fff; margin-top: 2px;">
                ${100 + (solarCount * 15) + (batteryCount * 50) + (towerCount * 200)} kWh Capacity
              </div>
              <span style="font-size: 10.5px; color: #34d399;">
                Van (100) + Arrays (${solarCount * 15}) + Banks (${batteryCount * 50})
              </span>
            </div>
          </div>

          <!-- Scalable Microgrid Upgrades -->
          <h3 class="consulting-title" style="margin-bottom: 8px;">⚡ Enlarge Energy Hardware:</h3>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <div class="consulting-order-card">
              <div style="flex: 1;">
                <h4 class="order-name">⚡ Bifacial Solar Array (${solarCount}/6 Built)</h4>
                <span class="order-desc">Adds +1.5 kW peak generation and +15 kWh battery capacity.</span>
              </div>
              <button type="button" class="btn-primary" id="btn-build-solar" ${solarCount >= 6 ? 'disabled' : ''}>
                ${solarCount >= 6 ? 'Max Built (6/6)' : 'Place Array (2.0h)'}
              </button>
            </div>

            <div class="consulting-order-card">
              <div style="flex: 1;">
                <h4 class="order-name">🔋 Sodium Battery Storage Rack (${batteryCount}/3 Built)</h4>
                <span class="order-desc">Industrial fireproof battery cabinet. Adds +50 kWh energy capacity.</span>
              </div>
              <button type="button" class="btn-primary" id="btn-build-battery" ${batteryCount >= 3 ? 'disabled' : ''}>
                ${batteryCount >= 3 ? 'Max Built (3/3)' : 'Place Rack (3.0h)'}
              </button>
            </div>
          </div>
        </div>

        <div class="modal-footer" style="display: flex; justify-content: flex-end;">
          <button type="button" class="btn-secondary" id="btn-energy-close">Close Desk</button>
        </div>
      </div>
    `;

    this.modalEl.querySelector('#btn-build-solar')?.addEventListener('click', () => {
      this.close();
      const hud = window.gameHud;
      if (hud) {
        hud.selectedTier = 1;
        hud.renderDock();
        hud.togglePlacement('solar_array');
      }
    });

    this.modalEl.querySelector('#btn-build-battery')?.addEventListener('click', () => {
      this.close();
      const hud = window.gameHud;
      if (hud) {
        hud.selectedTier = 4;
        hud.renderDock();
        hud.togglePlacement('battery_bank');
      }
    });

    this.modalEl.querySelector('#btn-event-close')?.addEventListener('click', () => this.close());
    this.modalEl.querySelector('#btn-energy-close')?.addEventListener('click', () => this.close());
  }

  /* -------------------------------------------------------------
   * 9. Bioregional Climate Radar & Forecast Modal
   * ----------------------------------------------------------- */
  renderWeatherRadarModal(options = {}) {
    const data = gameState.data;
    const currentDay = data.day || 1;
    const weather = data.weather || gameState.getWeatherForDay(currentDay);
    const cisternCount = data.buildings?.filter(b => b.type === 'rain_cistern').length || 0;
    const swaleCount = data.buildings?.filter(b => b.type === 'retention_swale').length || 0;
    const catchmentM2 = (cisternCount * 30) + (swaleCount * 60);

    const f1 = gameState.getWeatherForDay(currentDay + 1);
    const f2 = gameState.getWeatherForDay(currentDay + 2);
    const f3 = gameState.getWeatherForDay(currentDay + 3);

    const renderForecastCard = (dayNum, f) => `
      <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: var(--radius-md); padding: 12px; display: flex; flex-direction: column; align-items: center; text-align: center;">
        <span style="font-size: 10px; font-weight: 700; color: #94a3b8;">DAY ${dayNum}</span>
        <span style="font-size: 26px; margin: 4px 0;">${f.icon}</span>
        <span style="font-size: 13px; font-weight: 700; color: #fff;">${f.tempC}°C</span>
        <span style="font-size: 10.5px; color: #cbd5e1; margin-top: 2px;">${f.sky}</span>
        <div style="margin-top: 6px; font-size: 10px; color: #38bdf8;">
          ${f.rainfallMm > 0 ? `🌧️ ${f.rainfallMm}mm (~+${Math.round(catchmentM2 * f.rainfallMm)}L)` : '☀️ No rain'}
        </div>
      </div>
    `;

    this.modalEl.innerHTML = `
      <div class="modal-window event-modal-window" style="max-width: 620px;" role="dialog" aria-modal="true">
        <div class="modal-header">
          <div class="modal-title-group">
            <span class="modal-icon">🌤️</span>
            <div>
              <h2 class="modal-title">Bioregional Climate Radar</h2>
              <span class="modal-subtitle">Thermodynamic Atmosphere • Precipitation Projection</span>
            </div>
          </div>
          <button type="button" class="btn-modal-close" id="btn-event-close" aria-label="Close dialog">✕</button>
        </div>

        <div class="event-modal-body">
          <!-- Current Weather Hero Card -->
          <div style="background: rgba(14, 27, 36, 0.85); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: var(--radius-md); padding: 16px; margin-bottom: 14px; display: flex; align-items: center; gap: 16px;">
            <span style="font-size: 42px;">${weather.icon}</span>
            <div style="flex: 1;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin: 0; font-family: var(--font-heading); font-size: 16px; color: #fff;">${weather.sky}</h3>
                <span style="font-size: 18px; font-weight: 700; color: #38bdf8;">${weather.tempC}°C</span>
              </div>
              <div style="display: flex; gap: 16px; margin-top: 6px; font-size: 11px; color: #cbd5e1;">
                <span>🌧️ Rain: <strong>${weather.rainfallMm || 0} mm</strong></span>
                <span>☀️ Solar Irradiance: <strong>${Math.round((weather.solarIrradiance || 1.0) * 100)}%</strong></span>
                <span>💨 Wind: <strong>${weather.windSpeedKmh || 12} km/h</strong></span>
              </div>
            </div>
          </div>

          <h3 class="consulting-title" style="margin-bottom: 8px;">📡 72-Hour Climate Forecast:</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 12px;">
            ${renderForecastCard(currentDay + 1, f1)}
            ${renderForecastCard(currentDay + 2, f2)}
            ${renderForecastCard(currentDay + 3, f3)}
          </div>

          <p style="font-size: 11px; color: #94a3b8; line-height: 1.4; margin: 0;">
            💡 <em>Dual-Track Physics Note:</em> Rain catchment scales directly with total roof and swale catchment area (${catchmentM2} m²). 1 mm of rain over 1 m² yields exactly 1.0 Liter of pure water.
          </p>
        </div>

        <div class="modal-footer" style="display: flex; justify-content: flex-end;">
          <button type="button" class="btn-secondary" id="btn-weather-close">Close Radar</button>
        </div>
      </div>
    `;

    this.modalEl.querySelector('#btn-event-close')?.addEventListener('click', () => this.close());
    this.modalEl.querySelector('#btn-weather-close')?.addEventListener('click', () => this.close());
  }
}

export const eventModal = new EventModal();
