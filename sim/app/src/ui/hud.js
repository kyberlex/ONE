/**
 * Solarpunk Glassmorphic HUD Controller (Agent SIM-5)
 * Manages the top 4 resource meters, compute stats, time controls, i18n switcher, and alert ticker.
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

import { i18n, t } from '../i18n/index.js';

export class HudController {
  constructor(sim, onOpenPanelCallback) {
    this.sim = sim;
    this.onOpenPanel = onOpenPanelCallback || (() => {});
    this.cacheDomElements();
    this.bindControls();
    this.initLanguage();
  }

  cacheDomElements() {
    // 4 Top Bars
    this.elEnergyBar = document.getElementById('meter-energy-bar');
    this.elEnergyVal = document.getElementById('meter-energy-val');
    this.elEnergyDelta = document.getElementById('meter-energy-delta');

    this.elWaterBar = document.getElementById('meter-water-bar');
    this.elWaterVal = document.getElementById('meter-water-val');
    this.elWaterDelta = document.getElementById('meter-water-delta');

    this.elFoodBar = document.getElementById('meter-food-bar');
    this.elFoodVal = document.getElementById('meter-food-val');
    this.elFoodDelta = document.getElementById('meter-food-delta');

    this.elMoraleBar = document.getElementById('meter-morale-bar');
    this.elMoraleVal = document.getElementById('meter-morale-val');
    this.elFreeHours = document.getElementById('meter-freehours-val');

    // Compute status
    this.elComputeStatus = document.getElementById('compute-status-pill');

    // Time & Day
    this.elTimeDisplay = document.getElementById('time-clock-display');
    this.elDayDisplay = document.getElementById('time-day-display');
    this.elSunIcon = document.getElementById('time-sun-icon');

    // Dynamic Weather Badge
    this.elWeatherBadge = document.getElementById('hud-weather-badge');
    this.elWeatherIcon = document.getElementById('weather-icon');
    this.elWeatherTemp = document.getElementById('weather-temp-display');
    this.elWeatherName = document.getElementById('weather-name-display');

    // Legacy Threat Meter
    this.elThreatBar = document.getElementById('threat-level-bar');
    this.elThreatVal = document.getElementById('threat-level-val');

    // Alert Ticker
    this.elTicker = document.getElementById('hud-alert-ticker');

    // Language Dropdown
    this.elLangSelect = document.getElementById('lang-select');

    // Speed buttons
    this.speedButtons = {
      0: document.getElementById('btn-speed-0'),
      1: document.getElementById('btn-speed-1'),
      2: document.getElementById('btn-speed-2'),
      5: document.getElementById('btn-speed-5')
    };
  }

  initLanguage() {
    if (this.elLangSelect) {
      this.elLangSelect.value = i18n.getLanguage();
      this.elLangSelect.addEventListener('change', e => {
        i18n.setLanguage(e.target.value);
        this.updateStaticTranslations();
        if (this.lastState) this.update(this.lastState);
      });
    }

    i18n.onLanguageChange(() => {
      this.updateStaticTranslations();
      if (this.lastState) this.update(this.lastState);
    });

    this.updateStaticTranslations();
  }

  updateStaticTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      const translation = t(key);
      if (translation) {
        el.textContent = translation;
      }
    });
  }

  bindControls() {
    for (const [speed, btn] of Object.entries(this.speedButtons)) {
      if (btn) {
        btn.addEventListener('click', () => {
          this.sim.setSpeed(Number(speed));
          this.updateSpeedButtons(Number(speed));
        });
      }
    }

    // Quick action drawer buttons
    const navButtons = [
      { id: 'btn-open-chores', panel: 'chores' },
      { id: 'btn-open-convoys', panel: 'convoys' },
      { id: 'btn-open-tech', panel: 'tech' },
      { id: 'btn-open-council', panel: 'council' },
      { id: 'btn-open-housing', panel: 'housing' }
    ];

    for (const item of navButtons) {
      const btn = document.getElementById(item.id);
      if (btn) {
        btn.addEventListener('click', () => this.onOpenPanel(item.panel));
      }
    }

    // Clickable Top Resource Meters
    const meterMap = [
      { id: 'meter-food', panel: 'agriculture' },
      { id: 'meter-energy', panel: 'machinery' },
      { id: 'meter-water', panel: 'machinery' },
      { id: 'meter-morale', panel: 'chores' }
    ];
    for (const m of meterMap) {
      const el = document.getElementById(m.id);
      if (el) {
        el.style.cursor = 'pointer';
        el.addEventListener('click', () => this.onOpenPanel(m.panel));
      }
    }
  }

  updateSpeedButtons(activeSpeed) {
    for (const [speed, btn] of Object.entries(this.speedButtons)) {
      if (btn) {
        if (Number(speed) === activeSpeed) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      }
    }
  }

  update(state) {
    this.lastState = state;
    const thermo = state.thermo;
    const node = state.node;

    // 1. ⚡ Energy Meter
    if (this.elEnergyBar) {
      this.elEnergyBar.style.width = `${Math.min(100, Math.max(0, thermo.energy.percent))}%`;
      this.elEnergyVal.textContent = `${thermo.energy.currentKwh} / ${thermo.energy.capacityKwh} kWh`;
      const signE = thermo.energy.netDelta >= 0 ? '+' : '';
      this.elEnergyDelta.textContent = `${signE}${thermo.energy.netDelta} kW`;
      this.elEnergyDelta.className = thermo.energy.netDelta >= 0 ? 'delta positive' : 'delta negative';

      const solarStr = thermo.energy.isNight ? '☀️ 0 kW (Night)' : `☀️ ${thermo.energy.solarKw} kW`;
      const windStr = `💨 ${thermo.energy.windKw} kW (${thermo.weather?.windSpeedKmh || 0} km/h)`;
      const parentCard = this.elEnergyBar.closest('.hud-meter-card');
      if (parentCard) {
        parentCard.title = `Microgrid Flows: ${solarStr} | ${windStr} | Battery: ${thermo.energy.percent}%`;
      }
    }

    // 2. 💧 Water Meter
    if (this.elWaterBar) {
      this.elWaterBar.style.width = `${Math.min(100, Math.max(0, thermo.water.percent))}%`;
      this.elWaterVal.textContent = `${thermo.water.currentL} / ${thermo.water.capacityL} L`;
      const signW = thermo.water.netDelta >= 0 ? '+' : '';
      this.elWaterDelta.textContent = `${signW}${thermo.water.netDelta} L/h`;
      this.elWaterDelta.className = thermo.water.netDelta >= 0 ? 'delta positive' : 'delta negative';
    }

    // 3. 🥗 Food Meter
    if (this.elFoodBar) {
      this.elFoodBar.style.width = `${Math.min(100, Math.max(0, thermo.food.percent))}%`;
      this.elFoodVal.textContent = `${thermo.food.daysRemaining} ${t('meterDays', 'days')} (${Math.round(thermo.food.currentKcal / 1000)}k kcal)`;
      const signF = thermo.food.netDelta >= 0 ? '+' : '';
      this.elFoodDelta.textContent = `${signF}${thermo.food.netDelta} kcal/h`;
      this.elFoodDelta.className = thermo.food.netDelta >= 0 ? 'delta positive' : 'delta negative';
    }

    // 4. ⏳ Morale & Free Time Meter
    if (this.elMoraleBar) {
      this.elMoraleBar.style.width = `${Math.min(100, Math.max(0, node.morale))}%`;
      this.elMoraleVal.textContent = `${node.morale}% ${t('meterMorale', 'Morale')}`;
      this.elFreeHours.textContent = `${node.freeHours}h ${t('meterFreePerDay', 'Free/day')}`;
    }

    // 5. Local Node Time & Circadian Status (ITEM 4 & 5)
    if (this.elTimeDisplay) {
      const localH = typeof state.localHour === 'number' ? state.localHour : state.hour;
      const hh = String(localH).padStart(2, '0');
      this.elTimeDisplay.textContent = `${hh}:00`;

      const tzStr = typeof state.timezoneOffset === 'number'
        ? (state.timezoneOffset >= 0 ? `+${state.timezoneOffset}` : `${state.timezoneOffset}`)
        : '-5';
      const nodeName = state.node?.name ? state.node.name.split(' ')[0] : 'Node';
      this.elDayDisplay.textContent = `${t('dayPrefix', 'Day')} ${state.day} • ${nodeName} (UTC${tzStr})`;

      const isDay = localH >= 6 && localH <= 20;
      this.elSunIcon.textContent = isDay ? '☀️' : '🌙';
      this.elSunIcon.title = isDay
        ? `Daytime (${hh}:00) — Active Pioneers & Playable Time (0.6h/s)`
        : `Nighttime (${hh}:00) — Slumber & Fast Forward (2h/s)`;
    }

    // 5b. Dynamic Weather
    if (this.elWeatherBadge && thermo.weather) {
      const w = thermo.weather;
      if (w.activeDisaster) {
        this.elWeatherBadge.classList.add('disaster-alert');
        const d = w.activeDisaster;
        const hoursLeft = d.durationHoursLeft ?? d.durationHours ?? 24;
        let stressNote = '';
        if (d.id === 'HEAT_DOME') stressNote = ' [PV Derating • BMS Chiller 10kW]';
        else if (d.id === 'ATMOSPHERIC_RIVER') stressNote = ' [Solar Dunkelflaute • Silt Wear 2.8x]';
        this.elWeatherBadge.title = `⚠️ ALERT: ${d.name} (${hoursLeft}h left)${stressNote}`;
        if (this.elWeatherIcon) this.elWeatherIcon.textContent = d.icon;
        if (this.elWeatherTemp) this.elWeatherTemp.textContent = `${w.temperatureC}°C`;
        if (this.elWeatherName) this.elWeatherName.textContent = d.name;
      } else {
        this.elWeatherBadge.classList.remove('disaster-alert');
        this.elWeatherBadge.title = `Weather: ${w.name} • Wind: ${w.windSpeedKmh} km/h • Solar: ${Math.round(w.solarMultiplier * 100)}%`;
        if (this.elWeatherIcon) this.elWeatherIcon.textContent = w.icon;
        if (this.elWeatherTemp) this.elWeatherTemp.textContent = `${w.temperatureC}°C`;
        if (this.elWeatherName) this.elWeatherName.textContent = w.name;
      }
    }

    // 6. Threat Level & Financial Defense Reserve
    if (this.elThreatBar) {
      this.elThreatBar.style.width = `${state.adversary.threatLevel}%`;
      this.elThreatVal.textContent = `${state.adversary.threatLevel}%`;
      const curSym = state.node?.currencySymbol || '$';
      const fiatRes = Math.round(state.node?.fiat ?? state.node?.fiatEur ?? 4200);
      if (this.elThreatVal.parentElement) {
        this.elThreatVal.parentElement.title = `Legacy System Stress: ${state.adversary.threatLevel}% • Emergency Hardware Reserve: ${curSym}${fiatRes.toLocaleString()}`;
      }
    }
  }

  showNotification(notif) {
    if (!this.elTicker) return;
    this.elTicker.innerHTML = `<strong>${notif.title}:</strong> ${notif.message}`;
    this.elTicker.classList.add('flash');
    setTimeout(() => this.elTicker.classList.remove('flash'), 1500);
  }
}
