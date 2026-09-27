/**
 * In-Game Community Feedback & Bug Reporter (Agent SIM-5)
 * Allows players to submit ideas and bug reports directly to GitHub
 * via an anonymous Google Apps Script privacy relay (or direct pre-filled fallback)
 * without requiring player accounts or revealing private tokens.
 * 
 * Gate D8 Compliant: Universal English Base with Registered i18n StringIDs.
 * 
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

import { t } from '../i18n/index.js';

// Official anonymous Google Apps Script privacy relay for kyberlex/ONE
export const DEFAULT_FEEDBACK_RELAY_URL = 'https://script.google.com/macros/s/AKfycbwSQqxUmYuEFK27a12Fp48CclNgkegzxP2IM38krA-94xK0MR0f0OFwdH47KTyQG-2u/exec';

export class PanelFeedbackController {
  constructor(sim) {
    this.sim = sim;
    this.modalEl = document.getElementById('modal-feedback');
    this.contentEl = document.getElementById('feedback-modal-content');
    this.activeType = 'idea'; // 'idea' | 'bug'
    this.isSubmitting = false;

    this.bindEvents();
  }

  bindEvents() {
    const btnClose = document.getElementById('btn-close-feedback-modal');
    if (btnClose) {
      btnClose.addEventListener('click', () => this.close());
    }

    if (this.modalEl) {
      this.modalEl.addEventListener('click', e => {
        if (e.target === this.modalEl) this.close();
      });
    }

    const btnOpen = document.getElementById('btn-open-feedback');
    if (btnOpen) {
      btnOpen.addEventListener('click', () => this.open());
    }
  }

  open(initialType = 'idea') {
    this.activeType = initialType;
    if (this.modalEl) this.modalEl.classList.remove('hidden');
    this.render();
  }

  close() {
    if (this.modalEl) this.modalEl.classList.add('hidden');
    this.isSubmitting = false;
  }

  getRelayUrl() {
    return localStorage.getItem('oasis_feedback_relay_url') || DEFAULT_FEEDBACK_RELAY_URL;
  }

  setRelayUrl(url) {
    if (url) {
      localStorage.setItem('oasis_feedback_relay_url', url.trim());
    } else {
      localStorage.removeItem('oasis_feedback_relay_url');
    }
  }

  render() {
    if (!this.contentEl) return;

    const activeNodeName = this.sim?.node?.name || 'Detroit Delray';
    const activeBioregion = this.sim?.node?.bioregion || 'Laurentian Great Lakes';
    const tick = this.sim?.tickCount ?? 0;
    const relayUrl = this.getRelayUrl();

    let html = `
      <div class="feedback-container">
        <!-- Mode Switcher -->
        <div class="feedback-type-tabs">
          <button class="feedback-tab ${this.activeType === 'idea' ? 'active' : ''}" data-type="idea">
            💡 ${t('feedbackTabIdea', 'Propose an Idea / RFC')}
          </button>
          <button class="feedback-tab ${this.activeType === 'bug' ? 'active' : ''}" data-type="bug">
            🐛 ${t('feedbackTabBug', 'Report a Bug / Problem')}
          </button>
        </div>

        <p class="feedback-intro">
          ${this.activeType === 'idea'
            ? t('feedbackIntroIdea', 'Noticed a thermodynamic bottleneck or have an idea to improve demarchy or simulation mechanics? Submit your proposal to the confederation.')
            : t('feedbackIntroBug', 'Encountered a visual glitch, incorrect text, or a simulation issue? Report it to help improve the code.')}
        </p>

        <form id="feedback-form" class="feedback-form">
          <div class="form-group">
            <label for="feedback-title">${t('feedbackTitleLabel', 'Summary Title')}</label>
            <input type="text" id="feedback-title" class="feedback-input" 
              placeholder="${this.activeType === 'idea' ? t('feedbackTitlePlaceholderIdea', 'E.g.: Increase night-time wind turbine baseline yield') : t('feedbackTitlePlaceholderBug', 'E.g.: Tooltip disappears during camera drag')}" 
              required maxlength="120" />
          </div>

          ${this.activeType === 'idea' ? `
            <div class="form-group">
              <label for="feedback-category">${t('feedbackCategoryLabel', 'Domain / Category')}</label>
              <select id="feedback-category" class="feedback-select">
                <option value="Demarchy & Sortition">${t('feedbackCatDemarchy', '🏛️ Demarchy & Sortition (Art. 4)')}</option>
                <option value="Thermodynamics & Energy">${t('feedbackCatThermo', '⚡ Thermodynamics & Energy (Art. 2)')}</option>
                <option value="Robotics & Open Hardware">${t('feedbackCatRobotics', '🤖 Robotics & Open Hardware')}</option>
                <option value="Cartography & Maps">${t('feedbackCatCartography', '🌍 Cartography & Bioregional Maps')}</option>
                <option value="Housing & Usufruct">${t('feedbackCatUsufruct', '🏘️ Housing & Circular Usufruct')}</option>
                <option value="UI & Accessibility">${t('feedbackCatUI', '🎨 UI, Graphics & Accessibility')}</option>
                <option value="General">${t('feedbackCatGeneral', '🌱 Other / General')}</option>
              </select>
            </div>
          ` : ''}

          <div class="form-group">
            <label for="feedback-desc">${t('feedbackDescLabel', 'Detailed Description')}</label>
            <textarea id="feedback-desc" class="feedback-textarea" rows="4" 
              placeholder="${this.activeType === 'idea' ? t('feedbackDescPlaceholderIdea', 'Explain your idea and what positive impact it would have on node resilience...') : t('feedbackDescPlaceholderBug', 'Describe steps to reproduce the issue and what happened...')}" 
              required></textarea>
          </div>

          <!-- Metadata Telemetry Box -->
          <div class="feedback-telemetry-box">
            <div class="telemetry-item">
              <span class="telemetry-lbl">${t('originBadge', 'Node')}:</span>
              <span class="telemetry-val">${activeNodeName} (${activeBioregion})</span>
            </div>
            <div class="telemetry-item">
              <span class="telemetry-lbl">Tick:</span>
              <span class="telemetry-val">#${tick}</span>
            </div>
            <div class="telemetry-item">
              <span class="telemetry-lbl">${t('anonStatus', 'Privacy')}:</span>
              <span class="telemetry-val text-green">${t('privacyBadge', '🛡️ 100% Anonymous (Zero-Account)')}</span>
            </div>
          </div>

          <!-- Submission Feedback Result Box -->
          <div id="feedback-status-msg" class="feedback-status-msg hidden"></div>

          <!-- Action Buttons -->
          <div class="feedback-action-row">
            <button type="submit" id="btn-submit-feedback" class="btn-primary btn-submit-feedback" ${this.isSubmitting ? 'disabled' : ''}>
              ${this.isSubmitting ? `⏳ ${t('feedbackSubmitting', 'Submitting...')}` : `🚀 ${t('feedbackSubmitBtn', 'Submit Feedback')}`}
            </button>
            <button type="button" id="btn-fallback-github" class="btn-secondary btn-fallback-gh" title="GitHub Web">
              🐙 GitHub Web
            </button>
          </div>

          <!-- Advanced Relay Endpoint Configuration Toggle -->
          <details class="feedback-relay-details">
            <summary>⚙️ ${t('feedbackRelayConfig', 'Configure Google Apps Script Relay URL')}</summary>
            <div class="relay-config-box">
              <p class="relay-config-hint">
                ${t('relayConfigHint', 'Paste the web app URL deployed from Google Apps Script. If empty, you can still submit via pre-filled GitHub issues.')}
              </p>
              <div class="relay-input-row">
                <input type="url" id="relay-url-input" class="feedback-input" 
                  placeholder="https://script.google.com/macros/s/.../exec" 
                  value="${relayUrl}" />
                <button type="button" id="btn-save-relay-url" class="btn-secondary">${t('btnSave', 'Save')}</button>
              </div>
            </div>
          </details>
        </form>
      </div>
    `;

    this.contentEl.innerHTML = html;
    this.attachFormListeners();
  }

  attachFormListeners() {
    // Tab switching
    this.contentEl.querySelectorAll('.feedback-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const type = tab.getAttribute('data-type');
        if (type && type !== this.activeType) {
          this.activeType = type;
          this.render();
        }
      });
    });

    // Form submit
    const form = document.getElementById('feedback-form');
    if (form) {
      form.addEventListener('submit', e => {
        e.preventDefault();
        this.submitFeedback();
      });
    }

    // Direct GitHub fallback button
    const btnFallback = document.getElementById('btn-fallback-github');
    if (btnFallback) {
      btnFallback.addEventListener('click', () => {
        this.openGitHubFallback();
      });
    }

    // Save Relay URL button
    const btnSaveRelay = document.getElementById('btn-save-relay-url');
    if (btnSaveRelay) {
      btnSaveRelay.addEventListener('click', () => {
        const input = document.getElementById('relay-url-input');
        if (input) {
          this.setRelayUrl(input.value);
          const statusEl = document.getElementById('feedback-status-msg');
          if (statusEl) {
            statusEl.className = 'feedback-status-msg status-success';
            statusEl.textContent = t('relayUrlSaved', '✅ Relay URL saved successfully in browser!');
            statusEl.classList.remove('hidden');
          }
        }
      });
    }
  }

  async submitFeedback() {
    const titleInput = document.getElementById('feedback-title');
    const descInput = document.getElementById('feedback-desc');
    const catInput = document.getElementById('feedback-category');
    const statusEl = document.getElementById('feedback-status-msg');
    const submitBtn = document.getElementById('btn-submit-feedback');

    if (!titleInput || !descInput) return;

    const title = titleInput.value.trim();
    const description = descInput.value.trim();
    const category = catInput ? catInput.value : 'General';
    const relayUrl = this.getRelayUrl();

    if (!title || !description) return;

    // If relay URL is not configured yet, direct the player to GitHub fallback
    if (!relayUrl) {
      if (statusEl) {
        statusEl.className = 'feedback-status-msg status-warning';
        statusEl.innerHTML = `
          <span>${t('relayNotConfigured', '⚠️ <strong>Apps Script Relay URL not configured.</strong>')}</span><br/>
          ${t('openingGithubFallback', 'Opening pre-filled GitHub submission with your text...')}
        `;
        statusEl.classList.remove('hidden');
      }
      setTimeout(() => {
        this.openGitHubFallback(title, description, category);
      }, 1000);
      return;
    }

    this.isSubmitting = true;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = `⏳ ${t('feedbackSubmitting', 'Submitting...')}`;
    }
    if (statusEl) {
      statusEl.className = 'feedback-status-msg status-info';
      statusEl.textContent = t('connectingToRelay', '📡 Connecting to Google Apps Script Relay...');
      statusEl.classList.remove('hidden');
    }

    const payload = {
      type: this.activeType,
      title,
      description,
      category,
      bioregion: `${this.sim?.node?.name || 'Detroit Delray'} (${this.sim?.node?.bioregion || 'Great Lakes'})`,
      tick: this.sim?.tickCount ?? 0,
      clientVersion: '0.1.0-alpha'
    };

    try {
      const response = await fetch(relayUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // Apps Script handles text/plain without CORS preflight block
        body: JSON.stringify(payload)
      });

      const resData = await response.json();

      if (resData.success) {
        if (statusEl) {
          statusEl.className = 'feedback-status-msg status-success';
          statusEl.innerHTML = `
            <span>${t('feedbackSuccessMsg', '✅ <strong>Thank you! Your feedback has been recorded!</strong>')}</span><br/>
            ${resData.issueUrl ? `<a href="${resData.issueUrl}" target="_blank" rel="noopener noreferrer" class="feedback-issue-link">${t('viewOnGithub', 'View on GitHub')} (#${resData.issueNumber}) ↗</a>` : ''}
          `;
        }
        titleInput.value = '';
        descInput.value = '';
      } else {
        throw new Error(resData.error || 'Relay server error');
      }
    } catch (err) {
      console.warn('[FeedbackRelay] Direct POST failed, offering GitHub fallback:', err);
      if (statusEl) {
        statusEl.className = 'feedback-status-msg status-warning';
        statusEl.innerHTML = `
          <span>${t('feedbackFailedMsg', '⚠️ Automatic submission failed')} (${err.message}).</span><br/>
          <button type="button" id="btn-retry-gh-link" class="btn-secondary" style="margin-top: 6px;">
            ${t('openPrefilledGh', 'Open pre-filled on GitHub ↗')}
          </button>
        `;
        document.getElementById('btn-retry-gh-link')?.addEventListener('click', () => {
          this.openGitHubFallback(title, description, category);
        });
      }
    } finally {
      this.isSubmitting = false;
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = `🚀 ${t('feedbackSubmitBtn', 'Submit Feedback')}`;
      }
    }
  }

  openGitHubFallback(title = '', description = '', category = '') {
    title = title || document.getElementById('feedback-title')?.value || '';
    description = description || document.getElementById('feedback-desc')?.value || '';
    category = category || document.getElementById('feedback-category')?.value || 'General';

    const repo = 'kyberlex/ONE';
    const isBug = this.activeType === 'bug';
    const fallbackTitle = title || t('newSimReport', 'New report from simulation');
    const issueTitle = encodeURIComponent(`${isBug ? '🐛 [Bug]: ' : '💡 [Idea]: '}${fallbackTitle}`);
    
    const bodyContent = [
      `### ${isBug ? '🐛 In-Game Bug Report' : '💡 In-Game Community Idea / RFC'}`,
      '',
      `**Category:** ${category}`,
      '',
      '**Description:**',
      description || '*(Enter description here)*',
      '',
      '---',
      `**System Telemetry & Metadata:**`,
      `- Origin Node: ${this.sim?.node?.name || 'Detroit Delray'}`,
      `- Simulation Tick: #${this.sim?.tickCount ?? 0}`,
      `- Client Version: 0.1.0-alpha`
    ].join('\n');

    const issueBody = encodeURIComponent(bodyContent);
    const labels = encodeURIComponent(isBug ? 'bug,community-report' : 'idea,enhancement,community-rfc');

    const url = `https://github.com/${repo}/issues/new?title=${issueTitle}&body=${issueBody}&labels=${labels}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
