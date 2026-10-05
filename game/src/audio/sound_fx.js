/**
 * O.N.E. Solarpunk Web Audio Synthesizer Engine
 * Zero external audio assets, zero latency, pure procedural acoustic/synth design.
 * Generates warm, calming pentatonic chimes, wood-tap clicks, and ambient dawn soundscapes.
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

class SoundFX {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.ambientOsc = null;
    this.isMuted = false;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return !this.isMuted;
  }

  // Soft wooden tap / UI click
  playClick() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.04);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  // Satisfying construction thunk & dust chime
  playBuildThunk() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // 1. Low mechanical thunk
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(160, now);
    osc1.frequency.exponentialRampToValueAtTime(45, now + 0.14);
    gain1.gain.setValueAtTime(0.35, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.16);

    // 2. High metallic/wooden resonance
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(523.25, now + 0.02); // C5
    osc2.frequency.exponentialRampToValueAtTime(659.25, now + 0.2); // E5
    gain2.gain.setValueAtTime(0.15, now + 0.02);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start(now + 0.02);
    osc2.stop(now + 0.26);
  }

  // Morning Dawn Sunbeam Arpeggio (C Major Pentatonic)
  playDawnChime() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [261.63, 329.63, 392.00, 523.25, 659.25]; // C4, E4, G4, C5, E5
    notes.forEach((freq, idx) => {
      const now = this.ctx.currentTime + idx * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.65);
    });
  }

  // Nightfall Twilight Lullaby (G Pentatonic Descending)
  playNightfallChime() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [587.33, 493.88, 392.00, 293.66]; // D5, B4, G4, D4
    notes.forEach((freq, idx) => {
      const now = this.ctx.currentTime + idx * 0.12;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.85);
    });
  }

  // Chore Automation / Milestone Victory Fanfare
  playChoreExtinctionFanfare() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    // Upbeat major fanfare (C5, G5, C6)
    const chords = [523.25, 659.25, 783.99, 1046.50];
    chords.forEach((freq, idx) => {
      const now = this.ctx.currentTime + idx * 0.09;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.75);
    });
  }

  // Acoustic Guitar Strum for Saturday Feasts
  playAcousticStrum() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const guitarNotes = [196.00, 246.94, 293.66, 392.00, 493.88]; // G major open strum
    guitarNotes.forEach((freq, idx) => {
      const now = this.ctx.currentTime + idx * 0.035;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.995, now + 0.8);

      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.95);
    });
  }

  // Inter-Node Cargo Convoy Dispatch (Bright two-tone bicycle bell / telemetry chime)
  playCargoDispatch() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    [0, 0.12].forEach((offset, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(idx === 0 ? 1200 : 1600, now + offset);
      osc.frequency.exponentialRampToValueAtTime(idx === 0 ? 1100 : 1500, now + offset + 0.18);

      gain.gain.setValueAtTime(0.18, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + offset);
      osc.stop(now + offset + 0.2);
    });
  }
}

export const soundFX = new SoundFX();

