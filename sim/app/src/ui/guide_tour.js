/**
 * O-ASIS Dual-Track: Interactive Onboarding Guide & Spotlight Walkthrough (Agent SIM-5)
 * Guides first-time players through the 4 vital flows, living usufruct canvas,
 * Athenian sortition demarchy, and Dual-Track cybernetic automation.
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

import { t, i18n } from '../i18n/index.js';
import { ZOOM_LEVELS } from '../engine/zoom_coordinator.js';

export class GuideTourController {
  constructor(sim, zoomCoordinator, settlementRenderer, hud) {
    this.sim = sim;
    this.zoomCoordinator = zoomCoordinator;
    this.settlementRenderer = settlementRenderer;
    this.hud = hud;

    this.currentStep = 0;
    this.isActive = false;
    this.storageKey = 'oasis_onboarding_completed';

    // DOM Elements
    this.overlayEl = document.getElementById('onboarding-guide-overlay');
    this.cutoutEl = document.getElementById('guide-mask-cutout');
    this.reticleEl = document.getElementById('guide-spotlight-reticle');
    this.cardEl = document.getElementById('guide-card');
    this.stepBadgeEl = document.getElementById('guide-step-badge');
    this.phaseTagEl = document.getElementById('guide-phase-tag');
    this.cardTitleEl = document.getElementById('guide-card-title');
    this.cardDescEl = document.getElementById('guide-card-desc');
    this.dotsContainerEl = document.getElementById('guide-dots');
    this.prevBtn = document.getElementById('btn-guide-prev');
    this.nextBtn = document.getElementById('btn-guide-next');
    this.skipBtn = document.getElementById('btn-guide-skip');
    this.closeBtn = document.getElementById('btn-guide-close');
    this.hudGuideBtn = document.getElementById('btn-open-guide');

    this.steps = [
      {
        id: 'survival_meters',
        targetSelector: '.hud-meters-row',
        titleKey: 'guideStep1Title',
        tagKey: 'guideStep1Tag',
        renderContent: () => `
          <p class="guide-lead-text">${t('guideStep1Intro', 'Your settlement survives on 4 physical flows, not speculative debt. Keep them above zero:')}</p>
          <div class="guide-bullet-list">
            <div class="guide-bullet-item">
              <span>${t('guideStep1FlowEnergy', '⚡ Energy (kWh): Solar PV microgrids & battery buffers. Drops at night and in winter.')}</span>
            </div>
            <div class="guide-bullet-item">
              <span>${t('guideStep1FlowWater', '💧 Water (Liters): Rain catchment cisterns & greywater recycling for drinking and crops.')}</span>
            </div>
            <div class="guide-bullet-item">
              <span>${t('guideStep1FlowFood', '🥗 Calories (Food): Greenhouse farming guarantees an unconditional 2,200 kcal/day biometric floor.')}</span>
            </div>
            <div class="guide-bullet-item">
              <span>${t('guideStep1FlowMorale', '⏳ Free Time & Morale: Build robots in the FabLab to cancel chore shifts and maximize community morale.')}</span>
            </div>
          </div>
        `,
        onEnter: () => {
          if (this.zoomCoordinator) {
            this.zoomCoordinator.setLevel(ZOOM_LEVELS.NODE);
          }
        }
      },
      {
        id: 'living_canvas',
        targetSelector: '#btn-quick-claim',
        titleKey: 'guideStep2Title',
        tagKey: 'guideStep2Tag',
        renderContent: () => `
          <p class="guide-lead-text">${t('guideStep2Intro', 'Housing in O.N.E. is an unconditional birthright—no rent, mortgages, or landlords:')}</p>
          <div class="guide-bullet-list">
            <div class="guide-bullet-item">
              <span>${t('guideStep2PointAgora', '🏛️ Central Agora: Communal hearth where citizens gather, share meals, and deliberate around the fire.')}</span>
            </div>
            <div class="guide-bullet-item">
              <span>${t('guideStep2PointPods', '🏡 Usufruct Pods: Vacant pods are freely yours under dynamic usufruct ("use it or lose it").')}</span>
            </div>
            <div class="guide-bullet-item">
              <span>${t('guideStep2PointSabbatical', '🔒 Sabbatical Lock: Travel anywhere on Earth for up to 180 days with your dwelling securely locked.')}</span>
            </div>
          </div>
          <div class="guide-tip-box">
            ${t('guideStep2Tip', '💡 Step 1: Click any vacant pod on the canvas or click "Claim Usufruct Dwelling" above to choose your home!')}
          </div>
        `,
        onEnter: () => {
          if (this.zoomCoordinator) {
            this.zoomCoordinator.setLevel(ZOOM_LEVELS.NODE);
          }
          if (this.settlementRenderer) {
            this.settlementRenderer.camera.x = 0;
            this.settlementRenderer.camera.y = 0;
            this.settlementRenderer.camera.targetZoom = 1.35;
          }
        }
      },
      {
        id: 'civic_governance',
        targetSelector: '#hud-facilities-dock',
        titleKey: 'guideStep3Title',
        tagKey: 'guideStep3Tag',
        renderContent: () => `
          <p class="guide-lead-text">${t('guideStep3Intro', 'The facilities along the bottom dock keep the settlement running:')}</p>
          <div class="guide-bullet-list">
            <div class="guide-bullet-item">
              <span>${t('guideStep3PointCouncil', '🏛️ Sortition Council: Randomly drawn citizen juries (3 or 15) deliberate on civic dilemmas and crisis defense.')}</span>
            </div>
            <div class="guide-bullet-item">
              <span>${t('guideStep3PointChores', '📋 Chore Roster: Essential maintenance is shared through 2–4h daily shifts (water, food, repairs).')}</span>
            </div>
            <div class="guide-bullet-item">
              <span>${t('guideStep3PointConvoys', '🚚 Trade Convoys: Dispatch zero-emission electric cargo convoys to barter physical surpluses worldwide.')}</span>
            </div>
          </div>
        `,
        onEnter: () => {
          if (this.zoomCoordinator) {
            this.zoomCoordinator.setLevel(ZOOM_LEVELS.NODE);
          }
        }
      },
      {
        id: 'dualtrack_tech',
        targetSelector: '[data-infra-id="infra-fablab"]',
        titleKey: 'guideStep4Title',
        tagKey: 'guideStep4Tag',
        renderContent: () => `
          <p class="guide-lead-text">${t('guideStep4Intro', 'Technology exists to liberate human time from compulsory drudgery:')}</p>
          <div class="guide-bullet-list">
            <div class="guide-bullet-item">
              <span>${t('guideStep4PointRobots', '🤖 Robotic Workforce: Fabricate agro-rovers, mist drones, and SCADA crawlers to permanently eliminate chore hours.')}</span>
            </div>
            <div class="guide-bullet-item">
              <span>${t('guideStep4PointDualTrack', '📐 Dual-Track Handshake: In-game milestones unlock real-world 3D printable CAD (.STL) and Home Assistant YAML packages.')}</span>
            </div>
          </div>
          <div class="guide-tip-box">
            ${t('guideStep4Tip', '💡 Step 2: Open the FabLab (🤖 on the dock) to build your first robot and free citizen time!')}
          </div>
        `,
        onEnter: () => {
          if (this.zoomCoordinator) {
            this.zoomCoordinator.setLevel(ZOOM_LEVELS.NODE);
          }
        }
      },
      {
        id: 'sovereign_passport',
        targetSelector: '#hud-starter-objectives',
        titleKey: 'guideStep5Title',
        tagKey: 'guideStep5Tag',
        renderContent: () => `
          <p class="guide-lead-text">${t('guideStep5Intro', 'You are now ready to build and defend the settlement:')}</p>
          <div class="guide-bullet-list">
            <div class="guide-bullet-item">
              <span>${t('guideStep5PointPassport', '🏦 The Corporate AI: Simulates financial extraction—launching blackout strikes and eviction audits.')}</span>
            </div>
            <div class="guide-bullet-item">
              <span>${t('guideStep5PointSync', '🏛️ Democratic Defense: When alerts ring, vote in the Athenian Assembly to protect the community.')}</span>
            </div>
            <div class="guide-bullet-item">
              <span>${t('guideStep5PointZoom', '🎯 Starter Objectives: Follow the 3 starter goals in the top-right widget to secure the village!')}</span>
            </div>
          </div>
          <div class="guide-welcome-box">
            <strong>${t('guideStep5Welcome', "Welcome to O-ASIS! Follow your Starter Objectives to begin.")}</strong>
            <div class="guide-portal-backlink-row" style="margin-top: 12px;">
              <a href="https://one-commons.github.io" target="_blank" rel="noopener noreferrer" class="btn-guide-portal-link" style="display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; background: rgba(16,185,129,0.18); border: 1px solid rgba(16,185,129,0.45); border-radius: 8px; color: #34d399; font-weight: 600; font-size: 0.85rem; text-decoration: none; box-shadow: 0 2px 10px rgba(16,185,129,0.2);">
                🌐 ${t('guideExploreOnePlatform', 'Discover the O.N.E. Movement (Constitution & Thrillers) ↗')}
              </a>
            </div>
          </div>
        `,
        onEnter: () => {}
      }
    ];

    this.bindEvents();
  }

  bindEvents() {
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.prevStep());
    }
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.nextStep());
    }
    if (this.skipBtn) {
      this.skipBtn.addEventListener('click', () => this.skipTour());
    }
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.skipTour());
    }
    if (this.hudGuideBtn) {
      this.hudGuideBtn.addEventListener('click', () => this.start(0));
    }

    // Keyboard navigation
    window.addEventListener('keydown', e => {
      if (!this.isActive) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.nextStep();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.prevStep();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this.skipTour();
      }
    });

    // Window resize handler
    window.addEventListener('resize', () => {
      if (this.isActive) {
        this.updatePosition();
      }
    });

    // Language switch listener
    i18n.onLanguageChange(() => {
      if (this.isActive) {
        this.renderStep();
      }
    });
  }

  isCompleted() {
    try {
      return localStorage.getItem(this.storageKey) === 'true';
    } catch (e) {
      return false;
    }
  }

  markCompleted() {
    try {
      localStorage.setItem(this.storageKey, 'true');
    } catch (e) {
      // ignore
    }
  }

  start(initialStep = 0) {
    this.currentStep = Math.max(0, Math.min(initialStep, this.steps.length - 1));
    this.isActive = true;

    // Close any other open modals so they don't obscure or collide with the tour
    document.querySelectorAll('.modal-overlay').forEach(m => {
      if (m.id !== 'onboarding-guide-overlay') {
        m.classList.add('hidden');
      }
    });
    document.body.classList.remove('has-dilemma-open');

    // Auto-pause simulation clock while reading the walkthrough steps
    if (this.sim) {
      if (this.savedSpeed === undefined) {
        this.savedSpeed = this.sim.speedMultiplier !== undefined ? this.sim.speedMultiplier : (this.sim.speed || 1);
      }
      this.sim.setSpeed(0);
      if (this.hud && typeof this.hud.updateSpeedButtons === 'function') {
        this.hud.updateSpeedButtons(0);
      }
    }

    if (this.overlayEl) {
      this.overlayEl.classList.remove('hidden');
    }

    // Ensure we are in settlement village view
    if (this.zoomCoordinator) {
      this.zoomCoordinator.setLevel(ZOOM_LEVELS.NODE);
    }

    this.renderStep();
  }

  renderStep() {
    if (!this.isActive) return;
    const step = this.steps[this.currentStep];
    if (!step) return;

    if (step.onEnter) {
      step.onEnter();
    }

    // Step counter badge
    if (this.stepBadgeEl) {
      const counterStr = t('guideStepCounter', 'Step {current} of {total}')
        .replace('{current}', this.currentStep + 1)
        .replace('{total}', this.steps.length);
      this.stepBadgeEl.textContent = `🧭 ${counterStr}`;
    }

    // Phase tag
    if (this.phaseTagEl) {
      this.phaseTagEl.textContent = t(step.tagKey, step.tagKey);
    }

    // Title
    if (this.cardTitleEl) {
      this.cardTitleEl.textContent = t(step.titleKey, step.titleKey);
    }

    // Body content
    if (this.cardDescEl) {
      this.cardDescEl.innerHTML = step.renderContent();
    }

    // Navigation buttons
    if (this.prevBtn) {
      this.prevBtn.style.display = this.currentStep === 0 ? 'none' : 'inline-flex';
      this.prevBtn.textContent = t('guideBtnBack', '⬅ Back');
    }

    if (this.nextBtn) {
      if (this.currentStep === this.steps.length - 1) {
        this.nextBtn.textContent = t('guideBtnFinish', 'Enter Settlement 🚀');
        this.nextBtn.classList.add('btn-finish');
      } else {
        this.nextBtn.textContent = t('guideBtnNext', 'Next ➔');
        this.nextBtn.classList.remove('btn-finish');
      }
    }

    if (this.skipBtn) {
      this.skipBtn.textContent = t('guideBtnSkip', 'Skip Tour');
    }

    // Progress dots
    this.renderDots();

    // Position spotlight and card
    setTimeout(() => {
      this.updatePosition();
    }, 40);
  }

  renderDots() {
    if (!this.dotsContainerEl) return;
    this.dotsContainerEl.innerHTML = '';
    this.steps.forEach((_, idx) => {
      const dot = document.createElement('span');
      dot.className = `guide-dot ${idx === this.currentStep ? 'active' : ''}`;
      dot.title = `Go to Step ${idx + 1}`;
      dot.addEventListener('click', () => {
        this.currentStep = idx;
        this.renderStep();
      });
      this.dotsContainerEl.appendChild(dot);
    });
  }

  updatePosition() {
    if (!this.isActive) return;
    const step = this.steps[this.currentStep];
    if (!step) return;

    const pad = 10;
    const viewW = window.innerWidth;
    const viewH = window.innerHeight;

    let targetRect = null;

    if (step.isCanvasCenter) {
      // Spotlight central Agora area in village canvas
      const width = Math.min(360, viewW * 0.7);
      const height = Math.min(260, viewH * 0.42);
      const left = (viewW - width) / 2;
      const top = (viewH - height) / 2 - 20;

      targetRect = {
        left,
        top,
        right: left + width,
        bottom: top + height,
        width,
        height
      };
    } else if (step.targetSelector) {
      const el = document.querySelector(step.targetSelector);
      if (el) {
        targetRect = el.getBoundingClientRect();
      }
    }

    // Fallback if element not found or hidden
    if (!targetRect || (targetRect.width === 0 && targetRect.height === 0)) {
      const w = Math.min(380, viewW * 0.8);
      const h = 180;
      targetRect = {
        left: (viewW - w) / 2,
        top: (viewH - h) / 2,
        right: (viewW + w) / 2,
        bottom: (viewH + h) / 2,
        width: w,
        height: h
      };
    }

    // Update SVG mask cutout
    if (this.cutoutEl) {
      this.cutoutEl.setAttribute('x', Math.max(0, targetRect.left - pad));
      this.cutoutEl.setAttribute('y', Math.max(0, targetRect.top - pad));
      this.cutoutEl.setAttribute('width', targetRect.width + pad * 2);
      this.cutoutEl.setAttribute('height', targetRect.height + pad * 2);
      this.cutoutEl.setAttribute('rx', '14');
    }

    // Update Glowing Reticle
    if (this.reticleEl) {
      this.reticleEl.style.left = `${Math.max(0, targetRect.left - pad)}px`;
      this.reticleEl.style.top = `${Math.max(0, targetRect.top - pad)}px`;
      this.reticleEl.style.width = `${targetRect.width + pad * 2}px`;
      this.reticleEl.style.height = `${targetRect.height + pad * 2}px`;
      this.reticleEl.style.display = 'block';
    }

    // Position the Card
    if (this.cardEl) {
      const cardW = this.cardEl.offsetWidth || Math.min(460, viewW - 32);
      const cardH = this.cardEl.offsetHeight || 380;

      let cardLeft = 0;
      let cardTop = 0;

      if (step.isCanvasCenter) {
        // Place card centered at the bottom of the screen above footer
        cardLeft = (viewW - cardW) / 2;
        cardTop = Math.max(16, viewH - cardH - 85);
      } else {
        // Decide whether card fits above or below target
        const spaceBelow = viewH - targetRect.bottom;
        const spaceAbove = targetRect.top;

        if (spaceBelow >= cardH + 24 || spaceBelow >= spaceAbove) {
          // Place below target
          cardTop = targetRect.bottom + 18;
        } else {
          // Place above target
          cardTop = targetRect.top - cardH - 18;
        }

        // Align horizontally centered with target
        cardLeft = targetRect.left + (targetRect.width - cardW) / 2;
      }

      // Clamp strictly within viewport boundaries
      cardLeft = Math.max(16, Math.min(viewW - cardW - 16, cardLeft));
      cardTop = Math.max(16, Math.min(viewH - cardH - 16, cardTop));

      this.cardEl.style.left = `${cardLeft}px`;
      this.cardEl.style.top = `${cardTop}px`;
    }
  }

  nextStep() {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
      this.renderStep();
    } else {
      this.finishTour();
    }
  }

  prevStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.renderStep();
    }
  }

  skipTour() {
    this.markCompleted();
    this.close();
  }

  finishTour() {
    this.markCompleted();
    this.close();

    if (this.hud) {
      this.hud.showNotification({
        title: '🧭 ' + t('guideCompletedTitle', 'Onboarding Complete'),
        message: t('guideCompletedMsg', 'Welcome to the commons! Explore the village or claim your dwelling.')
      });
    }
  }

  close() {
    this.isActive = false;
    if (this.overlayEl) {
      this.overlayEl.classList.add('hidden');
    }
    if (this.reticleEl) {
      this.reticleEl.style.display = 'none';
    }

    // Restore simulation clock speed
    if (this.sim && this.savedSpeed !== undefined) {
      const restoreSpeed = this.savedSpeed;
      this.sim.setSpeed(restoreSpeed);
      if (this.hud && typeof this.hud.updateSpeedButtons === 'function') {
        this.hud.updateSpeedButtons(restoreSpeed);
      }
      this.savedSpeed = undefined;
    }
  }
}
