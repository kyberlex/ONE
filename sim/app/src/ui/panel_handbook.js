/**
 * O-ASIS Dual-Track: In-Game Survival Rulebook & Player Field Manual (Agent SIM-5)
 * Provides instant, anywhere-in-game access to game goals, win/lose conditions,
 * quickstart guide, 4 vital flows, housing usufruct rules, robot labor cancellation,
 * keybindings cheatsheet, and emergency diagnostics in all 14 official languages.
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

import { t, i18n } from '../i18n/index.js';

export class PanelHandbookController {
  constructor(sim, hud) {
    this.sim = sim;
    this.hud = hud;
    this.modalEl = document.getElementById('modal-handbook');
    this.contentEl = document.getElementById('handbook-modal-content');
    this.activeTab = 'objective';
    this.savedSpeed = 1;

    this.bindEvents();

    if (i18n && typeof i18n.onLanguageChange === 'function') {
      i18n.onLanguageChange(() => {
        if (this.isOpen()) {
          this.render();
        }
      });
    }
  }

  bindEvents() {
    const btnOpen = document.getElementById('btn-open-handbook');
    if (btnOpen) {
      btnOpen.addEventListener('click', () => this.toggle());
    }

    const btnClose = document.getElementById('btn-close-handbook-modal');
    if (btnClose) {
      btnClose.addEventListener('click', () => this.close());
    }

    if (this.modalEl) {
      this.modalEl.addEventListener('click', e => {
        if (e.target === this.modalEl) {
          this.close();
        }
      });
    }

    window.addEventListener('keydown', e => {
      // Don't intercept when user is typing in forms/chat
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable)) {
        return;
      }
      if (e.key === 'F1' || ((e.key === 'g' || e.key === 'G') && !e.ctrlKey && !e.metaKey && !e.altKey)) {
        e.preventDefault();
        this.toggle();
      } else if (e.key === 'Escape' && this.isOpen()) {
        this.close();
      }
    });
  }

  isOpen() {
    return this.modalEl && !this.modalEl.classList.contains('hidden');
  }

  toggle() {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  open(initialTab = null) {
    if (initialTab) {
      this.activeTab = initialTab;
    }
    // Auto-pause to give player peace of mind while reading
    if (this.sim) {
      this.savedSpeed = this.sim.speedMultiplier !== undefined ? this.sim.speedMultiplier : (this.sim.speed || 1);
      this.sim.setSpeed(0);
      if (this.hud && typeof this.hud.updateSpeedButtons === 'function') {
        this.hud.updateSpeedButtons(0);
      }
    }

    // Hide any conflicting modal overlays
    document.querySelectorAll('.modal-overlay').forEach(m => {
      if (m !== this.modalEl) m.classList.add('hidden');
    });

    if (this.modalEl) {
      this.modalEl.classList.remove('hidden');
    }
    this.render();
  }

  close() {
    if (this.modalEl) {
      this.modalEl.classList.add('hidden');
    }
    // Restore previous simulation speed if it was playing
    if (this.sim && this.savedSpeed > 0) {
      this.sim.setSpeed(this.savedSpeed);
      if (this.hud && typeof this.hud.updateSpeedButtons === 'function') {
        this.hud.updateSpeedButtons(this.savedSpeed);
      }
    }
  }

  setTab(tab) {
    this.activeTab = tab;
    this.render();
  }

  render() {
    if (!this.contentEl) return;

    const tabs = [
      { id: 'objective', icon: '🏆', label: t('handbookTabObjective', 'Goals & Win/Lose') },
      { id: 'quickstart', icon: '🚀', label: t('handbookTabQuickstart', 'First 5 Mins') },
      { id: 'resources', icon: '⚡', label: t('handbookTabResources', '4 Magic Bars') },
      { id: 'rules', icon: '🏡', label: t('handbookTabRules', 'Housing Rules') },
      { id: 'robots', icon: '🤖', label: t('handbookTabRobots', '5 Robots') },
      { id: 'controls', icon: '⌨️', label: t('handbookTabControls', 'Controls') },
      { id: 'faq', icon: '❓', label: t('handbookTabFaq', 'Emergency FAQ') }
    ];

    let contentHtml = '';
    switch (this.activeTab) {
      case 'quickstart':
        contentHtml = this.renderQuickstartTab();
        break;
      case 'resources':
        contentHtml = this.renderResourcesTab();
        break;
      case 'rules':
        contentHtml = this.renderRulesTab();
        break;
      case 'robots':
        contentHtml = this.renderRobotsTab();
        break;
      case 'controls':
        contentHtml = this.renderControlsTab();
        break;
      case 'faq':
        contentHtml = this.renderFaqTab();
        break;
      case 'objective':
      default:
        contentHtml = this.renderObjectiveTab();
        break;
    }

    this.contentEl.innerHTML = `
      <div class="handbook-container">
        <!-- Top Navigation Tabs Bar -->
        <div class="handbook-tabs-nav" role="tablist">
          ${tabs.map(tab => `
            <button 
              class="handbook-tab-btn ${this.activeTab === tab.id ? 'active' : ''}" 
              data-tab="${tab.id}"
              role="tab"
              aria-selected="${this.activeTab === tab.id}"
            >
              <span class="tab-icon">${tab.icon}</span>
              <span class="tab-label">${tab.label}</span>
            </button>
          `).join('')}
        </div>

        <!-- Scrollable Tab Content Pane -->
        <div class="handbook-tab-viewport">
          ${contentHtml}
        </div>
      </div>
    `;

    // Bind tab clicks
    this.contentEl.querySelectorAll('.handbook-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        if (tab) this.setTab(tab);
      });
    });
  }

  renderObjectiveTab() {
    return `
      <div class="handbook-section">
        <div class="handbook-hero-banner">
          <div class="hero-badge">🌱 SOLARPUNK RESILIENCE MMO</div>
          <h2 class="hero-title">${t('handbookHeroTitle', 'Welcome to O-ASIS!')}</h2>
          <p class="hero-desc">${t('handbookHeroDesc', 'You woke up in a world of blackouts and debt. Together with your friends, you build an autonomous solarpunk eco-village: no banks, no rent, no cryptocurrency tokens, and no microtransactions.')}</p>
        </div>

        <div class="handbook-grid-2col">
          <!-- How to Win -->
          <div class="handbook-card card-win">
            <div class="card-header">
              <span class="card-icon">🏆</span>
              <h3 class="card-title">${t('handbookHowToWinTitle', 'How to Win (The 4 Triumphs)')}</h3>
            </div>
            <ul class="handbook-list">
              <li>
                <strong>1. 🌟 ${t('winMilestone1Title', 'Total Autonomy:')}</strong>
                <span>${t('winMilestone1Desc', 'Keep all 4 resource bars green for 30 consecutive days without any blackout or famine.')}</span>
              </li>
              <li>
                <strong>2. 🤖 ${t('winMilestone2Title', 'Robot Utopia:')}</strong>
                <span>${t('winMilestone2Desc', 'Build all 5 robots in the FabLab to reduce mandatory human chores toward 0 hours per week!')}</span>
              </li>
              <li>
                <strong>3. 🏗️ ${t('winMilestone3Title', '5 Cantieri Civici:')}</strong>
                <span>${t('winMilestone3Desc', 'Collaborate to build the Amphitheater, Geothermal loop, Induction smelter, Biogas sphere, and Mesh mast.')}</span>
              </li>
              <li>
                <strong>4. 🛠️ ${t('winMilestone4Title', 'Dual-Track Legend:')}</strong>
                <span>${t('winMilestone4Desc', 'Download real 3D .STL models and Home Assistant YAML to build real resilience in your house!')}</span>
              </li>
            </ul>
          </div>

          <!-- How You Lose -->
          <div class="handbook-card card-lose">
            <div class="card-header">
              <span class="card-icon">💀</span>
              <h3 class="card-title">${t('handbookHowToLoseTitle', 'How You Lose (The 4 Disasters)')}</h3>
            </div>
            <ul class="handbook-list">
              <li>
                <strong>1. ⚡ ${t('loseCondition1Title', 'Midnight Blackout (Energy = 0):')}</strong>
                <span>${t('loseCondition1Desc', 'If community batteries drain at night, greenhouse heaters shut down and crops freeze.')}</span>
              </li>
              <li>
                <strong>2. 💧 ${t('loseCondition2Title', 'Hydroponic Drought (Water = 0):')}</strong>
                <span>${t('loseCondition2Desc', 'If water tanks empty, vertical aeroponic misting stops and salad crops dry out in 6 hours.')}</span>
              </li>
              <li>
                <strong>3. 🥗 ${t('loseCondition3Title', 'Village Famine (Food = 0):')}</strong>
                <span>${t('loseCondition3Desc', 'Citizens need 2,200 kcal/day. When the granary empties, exhausted pioneers leave.')}</span>
              </li>
              <li>
                <strong>4. 🏦 ${t('loseCondition4Title', 'Debt Trap (Autonomy = 0%):')}</strong>
                <span>${t('loseCondition4Desc', 'Accepting predatory loans or surveillance smart meters from the old Legacy grid results in foreclosure!')}</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- The Living Movement Callout Banner -->
        <div class="handbook-callout-platform">
          <div class="callout-platform-icon">🏛️</div>
          <div class="callout-platform-content">
            <h4 class="callout-platform-title">${t('handbookOneMovementTitle', 'The Living Movement Behind O-ASIS')}</h4>
            <p class="callout-platform-desc">${t('handbookOneMovementDesc', 'O-ASIS is the discrete thermodynamic simulation of the Open Networked Earth (O.N.E.) post-work civilization. Explore the 46 articles of the Living Constitution, download the 6-volume thriller novel saga for free, or inspect the open hardware transition roadmap at one-commons.github.io.')}</p>
            <div class="callout-platform-btns">
              <a href="https://one-commons.github.io/#constitution" target="_blank" rel="noopener noreferrer" class="btn-callout-link">
                📜 ${t('btnReadConstitution', 'Read Constitution v2.0 ↗')}
              </a>
              <a href="https://one-commons.github.io/#books" target="_blank" rel="noopener noreferrer" class="btn-callout-link">
                📚 ${t('btnReadThrillers', 'Free Thriller Ebooks ↗')}
              </a>
              <a href="https://one-commons.github.io" target="_blank" rel="noopener noreferrer" class="btn-callout-link btn-callout-highlight">
                🌐 ${t('btnVisitPortal', 'Explore O.N.E. Portal ↗')}
              </a>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderQuickstartTab() {
    return `
      <div class="handbook-section">
        <h2 class="section-title">🚀 ${t('quickstartTitle', 'Your First 5 Minutes in O-ASIS')}</h2>
        <p class="section-subtitle">${t('quickstartSubtitle', 'Follow these simple steps when entering the village for the first time:')}</p>

        <div class="quickstart-steps-box">
          <div class="qs-step">
            <div class="qs-num">1</div>
            <div class="qs-content">
              <h4>${t('qsStep1Title', 'Take a Breath & Pause Time')} <kbd>[Space]</kbd></h4>
              <p>${t('qsStep1Desc', 'If things are moving too fast, hit the Spacebar to freeze time. You can look around, inspect buildings, and plan without anything depleting.')}</p>
            </div>
          </div>

          <div class="qs-step">
            <div class="qs-num">2</div>
            <div class="qs-content">
              <h4>${t('qsStep2Title', 'Read the 4 Magic Bars on Top')}</h4>
              <p>${t('qsStep2Desc', 'Watch ⚡ Energy (solar by day, battery by night), 💧 Water (cistern levels), 🥗 Calories (food pantry), and 💻 Compute (robot brains). Keep them out of the red!')}</p>
            </div>
          </div>

          <div class="qs-step">
            <div class="qs-num">3</div>
            <div class="qs-content">
              <h4>${t('qsStep3Title', 'Claim Your Free Dwelling Pod')} <kbd>[H]</kbd></h4>
              <p>${t('qsStep3Desc', 'Press [H] or click any empty hexagonal dome on the canvas. Click "Claim Dwelling Pod"—it is freely yours under usufruct rights!')}</p>
            </div>
          </div>

          <div class="qs-step">
            <div class="qs-num">4</div>
            <div class="qs-content">
              <h4>${t('qsStep4Title', 'Pick Your Daily Chore Shift')} <kbd>[C]</kbd></h4>
              <p>${t('qsStep4Desc', 'Press [C] to open the Chores Board. Choose a guild: Land & Food, Facilities & Energy, Care & Cooking, or Workshop & Repairs.')}</p>
            </div>
          </div>

          <div class="qs-step">
            <div class="qs-num">5</div>
            <div class="qs-content">
              <h4>${t('qsStep5Title', 'Control Simulation Speed')} <kbd>[1]</kbd> <kbd>[2]</kbd> <kbd>[5]</kbd></h4>
              <p>${t('qsStep5Desc', 'Press [1] for normal speed (1 second = 1 in-game hour), [2] for fast forward, or [5] to warp through the quiet night until sunrise.')}</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderResourcesTab() {
    return `
      <div class="handbook-section">
        <h2 class="section-title">⚡ ${t('resourcesTitle', 'The 4 Magic Bars & Thermodynamics')}</h2>
        <p class="section-subtitle">${t('resourcesSubtitle', 'Nothing spawns from magic. Everything follows real Leontief biophysical input-output balances:')}</p>

        <div class="resources-cards-grid">
          <div class="res-card res-energy">
            <div class="res-card-top">
              <span class="res-icon">⚡</span>
              <h3>${t('resEnergyTitle', 'Energy (kWh)')}</h3>
            </div>
            <p>${t('resEnergyDesc', 'Solar PV arrays charge your batteries from 06:00 to 18:00 (peaks at solar noon). At night, your village runs strictly on stored battery juice!')}</p>
            <div class="res-danger-tag">⚠️ ${t('resEnergyTip', 'Shut down heavy metal smelters at sunset to avoid blackouts.')}</div>
          </div>

          <div class="res-card res-water">
            <div class="res-card-top">
              <span class="res-icon">💧</span>
              <h3>${t('resWaterTitle', 'Water (Liters)')}</h3>
            </div>
            <p>${t('resWaterDesc', 'Rain catchment tanks and deep aquifer wells provide clean water. Greenhouses, aeroponic misting towers, and human hydration drink water every hour.')}</p>
            <div class="res-danger-tag">⚠️ ${t('resWaterTip', 'Recycle greywater to keep reserves topped up during dry spells.')}</div>
          </div>

          <div class="res-card res-food">
            <div class="res-card-top">
              <span class="res-icon">🥗</span>
              <h3>${t('resFoodTitle', 'Calories (Food kcal)')}</h3>
            </div>
            <p>${t('resFoodDesc', 'High-yield aeroponic greenhouses produce fresh salads, vegetables, and legumes. Every citizen consumes 2,200 calories per day to stay healthy.')}</p>
            <div class="res-danger-tag">⚠️ ${t('resFoodTip', 'Maintain at least 15 days of grain buffer in case of bad weather.')}</div>
          </div>

          <div class="res-card res-compute">
            <div class="res-card-top">
              <span class="res-icon">💻</span>
              <h3>${t('resComputeTitle', 'Compute (MFLOPS)')}</h3>
            </div>
            <p>${t('resComputeDesc', 'Decentralized local mesh routers power automated robot pathfinding, climate SCADA sensors, and encrypted village messaging.')}</p>
            <div class="res-danger-tag">⚠️ ${t('resComputeTip', 'If compute drops, automated robots stop moving!')}</div>
          </div>
        </div>

        <div class="handbook-callout-emerald">
          <strong>🎒 ${t('backpackRuleTitle', 'The Backpack Rule (Thermodynamics):')}</strong>
          <span>${t('backpackRuleDesc', 'Just like in Minecraft crafting, you cannot consume what you haven\'t harvested or recycled. Matter and energy are 100% conserved.')}</span>
        </div>
      </div>
    `;
  }

  renderRulesTab() {
    return `
      <div class="handbook-section">
        <h2 class="section-title">🏡 ${t('rulesTitle', 'Housing Rules: "Use It or Lose It"')}</h2>
        <p class="section-subtitle">${t('rulesSubtitle', 'How shelter and circular economy work in a post-capitalist solarpunk commons:')}</p>

        <div class="rules-box">
          <div class="rule-item">
            <div class="rule-icon">🔑</div>
            <div class="rule-text">
              <h4>${t('ruleUsufructTitle', 'Free Usufruct Housing')}</h4>
              <p>${t('ruleUsufructDesc', 'Homes are for living, not rent extraction. Any newcomer can claim an empty pod for free. Nobody can own 10 homes or charge rent to others.')}</p>
            </div>
          </div>

          <div class="rule-item">
            <div class="rule-icon">⏳</div>
            <div class="rule-text">
              <h4>${t('rule30DayTitle', 'The 30-Day Abandonment Rule')}</h4>
              <p>${t('rule30DayDesc', 'If a player claims a house and disappears for more than 30 consecutive days without setting a lock, the village council automatically reassigns it to someone in need.')}</p>
            </div>
          </div>

          <div class="rule-item">
            <div class="rule-icon">🔒</div>
            <div class="rule-text">
              <h4>${t('ruleSabbaticalTitle', 'The Sabbatical Lock (Vacation Shield)')}</h4>
              <p>${t('ruleSabbaticalDesc', 'Going on an expedition or vacation? Turn on your Sabbatical Lock in [H] to protect your pod for up to 90 days. The pod enters low-power standby mode.')}</p>
            </div>
          </div>

          <div class="rule-item">
            <div class="rule-icon">🎒</div>
            <div class="rule-text">
              <h4>${t('ruleGearTitle', 'Personal Gear is Inviolable')}</h4>
              <p>${t('ruleGearDesc', 'Your clothes, tools, private diary, and cryptographic keys can NEVER be taken by anyone. Large furniture moves to the circular swap shop.')}</p>
            </div>
          </div>

          <div class="rule-item">
            <div class="rule-icon">⚙️</div>
            <div class="rule-text">
              <h4>${t('ruleEntropyTitle', 'Second-Law Entropy (Machines Wear Out)')}</h4>
              <p>${t('ruleEntropyDesc', 'Water pumps and solar inverters degrade over time. If you neglect maintenance chores, pumps turn yellow, then red, and finally explode!')}</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderRobotsTab() {
    return `
      <div class="handbook-section">
        <h2 class="section-title">🤖 ${t('robotsTitle', 'The 5 Cybernetic Robots (Labor Cancellation)')}</h2>
        <p class="section-subtitle">${t('robotsSubtitle', 'Why do manual chores when you can build friendly robots in the FabLab [B] to do them for you?')}</p>

        <div class="robots-grid">
          <div class="robot-card">
            <div class="robot-card-header">
              <span class="bot-badge">ROV-01</span>
              <h4>🚜 ${t('botRoverName', 'Agro-Rover')}</h4>
            </div>
            <p>${t('botRoverDesc', 'A rugged 4-wheeled rover tending outdoor vegetable beds, checking soil moisture sensors, and weeding without chemicals.')}</p>
            <div class="bot-bonus">🌱 ${t('botRoverOffset', 'Cancels: 12h/week of Food Chores')}</div>
          </div>

          <div class="robot-card">
            <div class="robot-card-header">
              <span class="bot-badge">DRN-02</span>
              <h4>🚁 ${t('botDroneName', 'Mist Drone')}</h4>
            </div>
            <p>${t('botDroneDesc', 'A solar quadcopter flying through greenhouse domes, spraying organic bio-nutrients and scanning leaf canopy health.')}</p>
            <div class="bot-bonus">💧 ${t('botDroneOffset', 'Cancels: 10h/week of Greenhouse Chores')}</div>
          </div>

          <div class="robot-card">
            <div class="robot-card-header">
              <span class="bot-badge">SCADA-03</span>
              <h4>🐛 ${t('botScadaName', 'SCADA Crawler')}</h4>
            </div>
            <p>${t('botScadaDesc', 'A small tracked robot crawling along high-voltage conduits and water pipes, diagnosing leaks and electrical shorts.')}</p>
            <div class="bot-bonus">⚡ ${t('botScadaOffset', 'Cancels: 14h/week of Facilities Chores')}</div>
          </div>

          <div class="robot-card">
            <div class="robot-card-header">
              <span class="bot-badge">LOG-04</span>
              <h4>🚚 ${t('botLogisticsName', 'Logistics Carrier')}</h4>
            </div>
            <p>${t('botLogisticsDesc', 'An omnidirectional cargo cart ferrying harvest crates, compost, and shredded plastic between greenhouses and workshops.')}</p>
            <div class="bot-bonus">📦 ${t('botLogisticsOffset', 'Cancels: 8h/week of Hauling Chores')}</div>
          </div>

          <div class="robot-card">
            <div class="robot-card-header">
              <span class="bot-badge">BOT-05</span>
              <h4>🦾 ${t('botCobotName', 'Cobot Fabricator')}</h4>
            </div>
            <p>${t('botCobotDesc', 'A multi-axis articulated robot arm stationed in the FabLab, 3D printing spare machine parts and recycling plastic bottles.')}</p>
            <div class="bot-bonus">🔧 ${t('botCobotOffset', 'Cancels: 16h/week of FabLab Chores')}</div>
          </div>
        </div>

        <div class="handbook-callout-cyan">
          <strong>🎉 ${t('robotZeroHourGoal', 'The Zero-Chore Milestone:')}</strong>
          <span>${t('robotZeroHourDesc', 'Once your village builds a full fleet of all 5 robots, mandatory human labor drops below 4 hours per week for all pioneers!')}</span>
        </div>
      </div>
    `;
  }

  renderControlsTab() {
    return `
      <div class="handbook-section">
        <h2 class="section-title">⌨️ ${t('controlsTitle', 'Master Keyboard & Touch Cheatsheet')}</h2>
        <p class="section-subtitle">${t('controlsSubtitle', 'All shortcuts and action triggers at your fingertips:')}</p>

        <table class="handbook-controls-table">
          <thead>
            <tr>
              <th>${t('ctrlColKey', 'Shortcut')}</th>
              <th>${t('ctrlColAction', 'Action Triggered')}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><kbd>[Space]</kbd></td>
              <td><strong>${t('ctrlKeySpaceTitle', 'Pause / Resume:')}</strong> ${t('ctrlKeySpaceDesc', 'Freeze time immediately to plan or stop an emergency.')}</td>
            </tr>
            <tr>
              <td><kbd>[1]</kbd> <kbd>[2]</kbd> <kbd>[5]</kbd></td>
              <td><strong>${t('ctrlKeySpeedTitle', 'Speed Controls:')}</strong> ${t('ctrlKeySpeedDesc', '1x Normal, 2x Fast, or 5x Hyper-Warp through quiet nights.')}</td>
            </tr>
            <tr>
              <td><kbd>[W]</kbd> <kbd>[A]</kbd> <kbd>[S]</kbd> <kbd>[D]</kbd></td>
              <td><strong>${t('ctrlKeyWasdTitle', 'Pan Camera:')}</strong> ${t('ctrlKeyWasdDesc', 'Move viewport north, west, south, and east across the map.')}</td>
            </tr>
            <tr>
              <td><kbd>[+]</kbd> / <kbd>[-]</kbd></td>
              <td><strong>${t('ctrlKeyZoomTitle', 'Zoom Viewport:')}</strong> ${t('ctrlKeyZoomDesc', 'Zoom in close to inspect citizens or pull back to see the village.')}</td>
            </tr>
            <tr>
              <td><kbd>[H]</kbd></td>
              <td><strong>${t('ctrlKeyHTitle', 'Housing Sheet:')}</strong> ${t('ctrlKeyHDesc', 'Inspect dwelling domes, claim a pod, or engage Sabbatical Lock.')}</td>
            </tr>
            <tr>
              <td><kbd>[C]</kbd></td>
              <td><strong>${t('ctrlKeyCTitle', 'Chores Board:')}</strong> ${t('ctrlKeyCDesc', 'View the 4 civic guilds and assign daily shifts.')}</td>
            </tr>
            <tr>
              <td><kbd>[D]</kbd></td>
              <td><strong>${t('ctrlKeyDTitle', 'Demarchy Council:')}</strong> ${t('ctrlKeyDDesc', 'Deliberate in the Citizen Assembly and review the Codex.')}</td>
            </tr>
            <tr>
              <td><kbd>[P]</kbd></td>
              <td><strong>${t('ctrlKeyPTitle', 'Megaprojects (Cantieri):')}</strong> ${t('ctrlKeyPDesc', 'Collaborative infrastructure: Amphitheater, Geothermal, Biogas.')}</td>
            </tr>
            <tr>
              <td><kbd>[B]</kbd></td>
              <td><strong>${t('ctrlKeyBTitle', 'FabLab & Hardware:')}</strong> ${t('ctrlKeyBDesc', 'Inspect 3D CAD props, download STL models, and build robots.')}</td>
            </tr>
            <tr>
              <td><kbd>[M]</kbd></td>
              <td><strong>${t('ctrlKeyMTitle', 'World Map:')}</strong> ${t('ctrlKeyMDesc', 'Toggle between Village canvas and 100% Offline Global Cartography.')}</td>
            </tr>
            <tr>
              <td><kbd>[T]</kbd></td>
              <td><strong>${t('ctrlKeyTTitle', 'Village Chat:')}</strong> ${t('ctrlKeyTDesc', 'Open campfire plaza chat, secret E2EE whispers, and quick-phrases.')}</td>
            </tr>
            <tr>
              <td><kbd>[F1]</kbd> / <kbd>[G]</kbd></td>
              <td><strong>${t('ctrlKeyGTitle', 'Open This Rulebook:')}</strong> ${t('ctrlKeyGDesc', 'Open/close this Survival Field Manual at any second.')}</td>
            </tr>
            <tr>
              <td><kbd>[Esc]</kbd></td>
              <td><strong>${t('ctrlKeyEscTitle', 'Close Window:')}</strong> ${t('ctrlKeyEscDesc', 'Dismiss any open dialog, modal, or drawer.')}</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }

  renderFaqTab() {
    return `
      <div class="handbook-section">
        <h2 class="section-title">❓ ${t('faqTitle', 'Pioneer Emergency FAQ & Field Fixes')}</h2>
        <p class="section-subtitle">${t('faqSubtitle', 'What to do when disaster strikes:')}</p>

        <div class="faq-cards-stack">
          <div class="faq-card faq-alert">
            <div class="faq-q">🚨 ${t('faqQ1', 'My battery buffer is at 10% and it\'s 2 AM! How do I stop a blackout?')}</div>
            <div class="faq-a">${t('faqA1', 'Hit [Space] immediately to pause! Open the Chores board [C], and shut down high-power FabLab induction smelters. Keep only essential greenhouse heaters running until sunrise brings solar power back online at 06:00.')}</div>
          </div>

          <div class="faq-card faq-alert">
            <div class="faq-q">🚨 ${t('faqQ2', 'A machine is flashing red and smoking!')}</div>
            <div class="faq-a">${t('faqA2', 'A water pump or solar inverter broke from wear-and-tear entropy. Open the Chores board [C], assign an engineer from the Facilities Guild, and ensure your FabLab [B] has spare parts.')}</div>
          </div>

          <div class="faq-card">
            <div class="faq-q">❓ ${t('faqQ3', 'Can another player steal my house while I am offline?')}</div>
            <div class="faq-a">${t('faqA3', 'Not if you turned on your Sabbatical Lock [H]! A sabbatical lock legally protects your home for up to 90 days. If you leave without a lock for over 30 days, the community can reassign it.')}</div>
          </div>

          <div class="faq-card">
            <div class="faq-q">❓ ${t('faqQ4', 'How do I invite friends from school or home?')}</div>
            <div class="faq-a">${t('faqA4', 'Click the Invite button in the top bar, copy your unique room link (e.g. ?joinNode=valencia), and send it via WhatsApp or Discord. They join instantly in their browser with zero logins or accounts!')}</div>
          </div>

          <div class="faq-card">
            <div class="faq-q">❓ ${t('faqQ5', 'How do I switch between PC and mobile phone?')}</div>
            <div class="faq-a">${t('faqA5', 'Open your Sovereign Passport [Shift+P], click "Sync Devices", and point your smartphone camera at the 2D QR code. Your citizen identity pairs in 2 seconds!')}</div>
          </div>
        </div>
      </div>
    `;
  }
}
