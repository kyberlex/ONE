/**
 * Generative Solarpunk Ambience Audio Synthesizer (Agent SIM-5)
 * Synthesizes dynamic, relaxing, zero-dependency environmental soundscapes
 * using the Web Audio API. 0 KB audio assets to download, 100% offline-first.
 *
 * Sound Layers:
 * 1. Warm Harmonic Drone: Pentatonic sine chords (A2/E3) with slow resonant lowpass sweep.
 * 2. Hydrological Flow: Bandpass-filtered water noise simulating Agora fountains and bioswales.
 * 3. Meteorological Rain & Wind: Pink/white noise buffer dynamically scaling with weather rainfall/cloud.
 * 4. Daytime Songbirds: Procedural FM frequency sweeps triggering during daylight.
 * 5. Nocturnal Crickets & Hearth: High-frequency rhythmic micro-chirps and soft firepit crackles at night.
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

export class AmbienceAudioEngine {
  constructor(sim, options = {}) {
    this.sim = sim;
    this.isMuted = localStorage.getItem('oasis_ambience_muted') !== 'false'; // Default muted until user engages
    this.volume = Number(localStorage.getItem('oasis_ambience_vol') || 0.6);
    this.audioCtx = null;
    this.isInitialized = false;

    // Node references
    this.masterGain = null;
    this.droneGain = null;
    this.waterGain = null;
    this.rainGain = null;
    this.nightGain = null;

    // Timers
    this.birdTimer = null;
    this.cricketTimer = null;
    this.hearthTimer = null;

    // State tracking
    this.currentHour = 12;
    this.currentWeather = 'SUNNY';
  }

  init() {
    if (this.isInitialized) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    this.audioCtx = new AudioContextClass();

    // Master Gain
    this.masterGain = this.audioCtx.createGain();
    this.masterGain.gain.setValueAtTime(this.isMuted ? 0.0001 : this.volume, this.audioCtx.currentTime);
    this.masterGain.connect(this.audioCtx.destination);

    // 1. Build Ambient Warm Drone
    this.initHarmonicDrone();

    // 2. Build Water Stream / Fountain
    this.initWaterFlow();

    // 3. Build Weather / Rain / Wind Layer
    this.initWeatherNoise();

    // 4. Build Night Layer (Crickets & Embers)
    this.initNightSoundscape();

    // 5. Start procedural event loops (Birds & Embers)
    this.startProceduralLoops();

    this.isInitialized = true;
  }

  initHarmonicDrone() {
    if (!this.audioCtx) return;

    this.droneGain = this.audioCtx.createGain();
    this.droneGain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, this.audioCtx.currentTime);
    filter.Q.setValueAtTime(3.0, this.audioCtx.currentTime);

    // Slow LFO for filter breath
    const lfo = this.audioCtx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.08, this.audioCtx.currentTime);

    const lfoGain = this.audioCtx.createGain();
    lfoGain.gain.setValueAtTime(140, this.audioCtx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    // Fundamental A2 (110 Hz)
    const osc1 = this.audioCtx.createOscillator();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(110, this.audioCtx.currentTime);
    osc1.detune.setValueAtTime(-3, this.audioCtx.currentTime);

    // Fifth E3 (164.8 Hz)
    const osc2 = this.audioCtx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(164.8, this.audioCtx.currentTime);
    osc2.detune.setValueAtTime(4, this.audioCtx.currentTime);

    // Octave A3 (220 Hz soft)
    const osc3 = this.audioCtx.createOscillator();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(220, this.audioCtx.currentTime);

    const osc3Gain = this.audioCtx.createGain();
    osc3Gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
    osc3.connect(osc3Gain);

    osc1.connect(filter);
    osc2.connect(filter);
    osc3Gain.connect(filter);

    filter.connect(this.droneGain);
    this.droneGain.connect(this.masterGain);

    osc1.start();
    osc2.start();
    osc3.start();
  }

  createNoiseBuffer(seconds = 2.0) {
    if (!this.audioCtx) return null;
    const bufferSize = this.audioCtx.sampleRate * seconds;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Pinkish smooth filter
      lastOut = (lastOut * 0.94) + (white * 0.06);
      data[i] = lastOut * 3.0;
    }
    return buffer;
  }

  initWaterFlow() {
    if (!this.audioCtx) return;

    const noiseBuffer = this.createNoiseBuffer(2.0);
    if (!noiseBuffer) return;

    const noiseSource = this.audioCtx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const bandpass = this.audioCtx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(700, this.audioCtx.currentTime);
    bandpass.Q.setValueAtTime(2.2, this.audioCtx.currentTime);

    this.waterGain = this.audioCtx.createGain();
    this.waterGain.gain.setValueAtTime(0.045, this.audioCtx.currentTime);

    noiseSource.connect(bandpass);
    bandpass.connect(this.waterGain);
    this.waterGain.connect(this.masterGain);

    noiseSource.start();
  }

  initWeatherNoise() {
    if (!this.audioCtx) return;

    const noiseBuffer = this.createNoiseBuffer(3.0);
    if (!noiseBuffer) return;

    const noiseSource = this.audioCtx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1100, this.audioCtx.currentTime);

    this.rainGain = this.audioCtx.createGain();
    this.rainGain.gain.setValueAtTime(0.001, this.audioCtx.currentTime);

    noiseSource.connect(filter);
    filter.connect(this.rainGain);
    this.rainGain.connect(this.masterGain);

    noiseSource.start();
  }

  initNightSoundscape() {
    if (!this.audioCtx) return;

    this.nightGain = this.audioCtx.createGain();
    this.nightGain.gain.setValueAtTime(0.001, this.audioCtx.currentTime);
    this.nightGain.connect(this.masterGain);
  }

  startProceduralLoops() {
    // 1. Bird chirps loop
    const scheduleNextBird = () => {
      const delayMs = 3500 + Math.random() * 5500;
      this.birdTimer = setTimeout(() => {
        if (!this.isMuted && this.isDaytime() && this.currentWeather !== 'RAIN' && this.currentWeather !== 'STORMY') {
          this.synthesizeBirdChirp();
        }
        scheduleNextBird();
      }, delayMs);
    };
    scheduleNextBird();

    // 2. Night crickets & hearth embers loop
    const scheduleNightSounds = () => {
      const delayMs = 1200 + Math.random() * 1800;
      this.cricketTimer = setTimeout(() => {
        if (!this.isMuted && !this.isDaytime()) {
          this.synthesizeCricketChirp();
          if (Math.random() < 0.4) {
            this.synthesizeHearthCrackle();
          }
        }
        scheduleNightSounds();
      }, delayMs);
    };
    scheduleNightSounds();
  }

  synthesizeBirdChirp() {
    if (!this.audioCtx || this.isMuted) return;
    const now = this.audioCtx.currentTime;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    const baseFreq = 2600 + Math.random() * 800;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.45, now + 0.06);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.95, now + 0.14);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.035, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.16);

    // Optional follow-up chirp
    if (Math.random() < 0.6) {
      setTimeout(() => {
        if (!this.audioCtx || this.isMuted) return;
        const now2 = this.audioCtx.currentTime;
        const osc2 = this.audioCtx.createOscillator();
        const gain2 = this.audioCtx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(baseFreq * 1.2, now2);
        osc2.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now2 + 0.05);
        osc2.frequency.exponentialRampToValueAtTime(baseFreq * 1.05, now2 + 0.12);

        gain2.gain.setValueAtTime(0.001, now2);
        gain2.gain.linearRampToValueAtTime(0.025, now2 + 0.02);
        gain2.gain.exponentialRampToValueAtTime(0.001, now2 + 0.13);

        osc2.connect(gain2);
        gain2.connect(this.masterGain);
        osc2.start(now2);
        osc2.stop(now2 + 0.14);
      }, 140);
    }
  }

  synthesizeCricketChirp() {
    if (!this.audioCtx || this.isMuted) return;
    const now = this.audioCtx.currentTime;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    const filter = this.audioCtx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(4600 + Math.random() * 200, now);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(4600, now);
    filter.Q.setValueAtTime(8.0, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.018, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.07);
  }

  synthesizeHearthCrackle() {
    if (!this.audioCtx || this.isMuted) return;
    const now = this.audioCtx.currentTime;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(350 + Math.random() * 600, now);

    gain.gain.setValueAtTime(0.015, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.025);
  }

  isDaytime() {
    return this.currentHour >= 6 && this.currentHour < 20;
  }

  update(hour, weather) {
    this.currentHour = hour ?? this.currentHour;
    this.currentWeather = weather?.type || weather?.id || this.currentWeather;

    if (!this.isInitialized || !this.audioCtx || this.isMuted) return;

    const now = this.audioCtx.currentTime;

    // 1. Cross-fade Rain/Weather
    if (this.rainGain) {
      let targetRain = 0.001;
      if (this.currentWeather === 'RAIN') targetRain = 0.18;
      else if (this.currentWeather === 'STORMY') targetRain = 0.32;
      else if (this.currentWeather === 'HEATWAVE') targetRain = 0.02; // Warm dry whisper
      else if (this.currentWeather === 'OVERCAST') targetRain = 0.015; // Soft wind

      this.rainGain.gain.cancelScheduledValues(now);
      this.rainGain.gain.linearRampToValueAtTime(targetRain, now + 1.2);
    }

    // 2. Cross-fade Night Ambient (Crickets/Hearth bed)
    if (this.nightGain) {
      const isNight = !this.isDaytime();
      const targetNight = isNight ? 0.06 : 0.001;
      this.nightGain.gain.cancelScheduledValues(now);
      this.nightGain.gain.linearRampToValueAtTime(targetNight, now + 1.5);
    }
  }

  toggleMute() {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  setMuted(muted) {
    this.isMuted = Boolean(muted);
    localStorage.setItem('oasis_ambience_muted', String(this.isMuted));

    if (!this.isInitialized && !this.isMuted) {
      this.init();
    }

    if (this.audioCtx) {
      if (this.audioCtx.state === 'suspended' && !this.isMuted) {
        this.audioCtx.resume();
      }

      if (this.masterGain) {
        const now = this.audioCtx.currentTime;
        this.masterGain.gain.cancelScheduledValues(now);
        const targetVol = this.isMuted ? 0.0001 : this.volume;
        this.masterGain.gain.linearRampToValueAtTime(targetVol, now + 0.4);
      }
    }
  }

  destroy() {
    clearTimeout(this.birdTimer);
    clearTimeout(this.cricketTimer);
    clearTimeout(this.hearthTimer);
    if (this.audioCtx) {
      this.audioCtx.close().catch(() => {});
      this.audioCtx = null;
    }
    this.isInitialized = false;
  }
}
