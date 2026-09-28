/**
 * Collapsible Nav Groups Controller (Agent SIM-5 & SIM-3)
 * Implements simplified screen grouping for O-ASIS Dual-Track.
 * Consolidates sprawling UI buttons into compact, expandable glassmorphic palettes:
 * 1. Top System & Community Menu (#group-system-menu)
 * 2. Bottom Village Commons Hub (#group-commons-hub)
 *
 * Enforces auto-close upon action and pauses legacy popups when any group is expanded.
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

export class NavGroupManager {
  constructor(panelDilemma = null) {
    this.panelDilemma = panelDilemma;
    this.openGroupId = null;
    this.closeCallbacks = [];

    this.cacheDom();
    this.bindEvents();

    // Register globally for adversary and legacy modal checks
    window.isAnyNavGroupExpanded = () => this.isAnyExpanded();
  }

  cacheDom() {
    // System menu group
    this.systemGroupEl = document.getElementById('group-system-menu');
    this.systemToggleBtn = document.getElementById('btn-toggle-system-menu');
    this.systemDropdownEl = document.getElementById('system-menu-dropdown');

    // Commons hub group
    this.hubGroupEl = document.getElementById('group-commons-hub');
    this.hubToggleBtn = document.getElementById('btn-toggle-commons-hub');
    this.hubDropdownEl = document.getElementById('commons-hub-dropdown');
    this.hubAlertDot = document.getElementById('commons-hub-alert-dot');
    this.councilAlertPill = document.getElementById('council-alert-pill');
  }

  bindEvents() {
    if (this.systemToggleBtn) {
      this.systemToggleBtn.addEventListener('click', e => {
        e.stopPropagation();
        this.toggle('system');
      });
    }

    if (this.hubToggleBtn) {
      this.hubToggleBtn.addEventListener('click', e => {
        e.stopPropagation();
        this.toggle('hub');
      });
    }

    // Auto-close on any action item click
    if (this.systemDropdownEl) {
      const sysItems = this.systemDropdownEl.querySelectorAll('button.nav-group-item, .lang-dropdown');
      sysItems.forEach(item => {
        item.addEventListener('click', () => {
          // Close after small microtask so button handler executes cleanly
          setTimeout(() => this.closeAll(), 10);
        });
      });
    }

    if (this.hubDropdownEl) {
      const hubItems = this.hubDropdownEl.querySelectorAll('button.nav-group-item');
      hubItems.forEach(item => {
        item.addEventListener('click', () => {
          setTimeout(() => this.closeAll(), 10);
        });
      });
    }

    // Close on outside pointer click
    document.addEventListener('pointerdown', e => {
      if (!this.isAnyExpanded()) return;
      const clickedInsideSystem = this.systemGroupEl && this.systemGroupEl.contains(e.target);
      const clickedInsideHub = this.hubGroupEl && this.hubGroupEl.contains(e.target);
      if (!clickedInsideSystem && !clickedInsideHub) {
        this.closeAll();
      }
    });

    // Close on Escape key
    window.addEventListener('keydown', e => {
      if (e.key === 'Escape' && this.isAnyExpanded()) {
        this.closeAll();
      }
    });
  }

  setPanelDilemma(panelDilemma) {
    this.panelDilemma = panelDilemma;
  }

  onClose(cb) {
    if (typeof cb === 'function') this.closeCallbacks.push(cb);
  }

  isAnyExpanded() {
    return this.openGroupId !== null;
  }

  toggle(groupId) {
    if (this.openGroupId === groupId) {
      this.closeAll();
    } else {
      this.open(groupId);
    }
  }

  open(groupId) {
    this.closeAll(false); // Close others without resuming legacy popups yet

    if (groupId === 'system' && this.systemDropdownEl) {
      this.systemDropdownEl.classList.remove('hidden');
      this.systemToggleBtn?.classList.add('active');
      this.systemGroupEl?.classList.add('expanded');
      this.openGroupId = 'system';
    } else if (groupId === 'hub' && this.hubDropdownEl) {
      this.hubDropdownEl.classList.remove('hidden');
      this.hubToggleBtn?.classList.add('active');
      this.hubGroupEl?.classList.add('expanded');
      this.openGroupId = 'hub';
    }

    document.body.classList.add('nav-group-expanded');

    // Pause any active or incoming legacy full-screen popups
    if (this.panelDilemma) {
      this.panelDilemma.pauseForNavGroup();
    }
  }

  closeAll(notifyResume = true) {
    if (this.systemDropdownEl) {
      this.systemDropdownEl.classList.add('hidden');
      this.systemToggleBtn?.classList.remove('active');
      this.systemGroupEl?.classList.remove('expanded');
    }

    if (this.hubDropdownEl) {
      this.hubDropdownEl.classList.add('hidden');
      this.hubToggleBtn?.classList.remove('active');
      this.hubGroupEl?.classList.remove('expanded');
    }

    const wasOpen = this.openGroupId !== null;
    this.openGroupId = null;
    document.body.classList.remove('nav-group-expanded');

    if (notifyResume && wasOpen) {
      if (this.panelDilemma) {
        this.panelDilemma.resumeFromNavGroup();
      }
      for (const cb of this.closeCallbacks) {
        try { cb(); } catch (err) { console.error(err); }
      }
    }
  }

  updateAlertState(hasAlert) {
    if (this.hubAlertDot) {
      this.hubAlertDot.classList.toggle('hidden', !hasAlert);
      this.hubAlertDot.classList.toggle('active', hasAlert);
    }
    if (this.hubToggleBtn) {
      this.hubToggleBtn.classList.toggle('has-alert', hasAlert);
    }
    if (this.councilAlertPill) {
      this.councilAlertPill.classList.toggle('hidden', !hasAlert);
    }
  }
}
