/**
 * Generative Solarpunk Ambience Audio Synthesizer (Epic 5 Engine Polish)
 * Synthesizes dynamic, relaxing, zero-dependency environmental soundscapes
 * using Web Audio API. 0 KB external audio files, 100% offline-first.
 *
 * Soundscape Layers:
 * 1. Warm Harmonic Drone: Pentatonic sine chords (A2/E3) with slow resonant breathing LFO.
 * 2. Hydrological Flow: Bandpass-filtered water noise simulating Agro swales & reed-bed filtration.
 * 3. Meteorological Wind & Rain: Pink noise buffer dynamically modulating with seasons & storms.
 * 4. District Ambient Generators:
 *    - Agro Belt: Summer cicadas & evening crickets.
 *    - FabLab: 60Hz transformer hum, stepper motor frequency sweeps & machine clicks.
 *    - MHU Ecovillage: Pentatonic wind chimes (E4, G4, A4, B4, D5) on gentle breezes.
 *    - Transit Corridor: Distant electric motor whine & drone rotor resonance.
 * 5. Seasonal Modulations:
 *    - Spring: Procedural daylight songbirds.
 *    - Summer: Cicada chorus & dry heat whisper.
 *    - Autumn: Sweeping gusty wind envelope.
 *    - Winter: Crystalline stillness & cozy hearth crackle.
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

export class AmbienceAudioEngine {
  constructor() {
    this.isMuted = typeof localStorage !== 'undefined' ? localStorage.getItem('one_game_sound_muted') === 'true' : false;
    this.volume = 0.55;
    this.audioCtx = null;
    this.isInitialized = false;

    // Master & Sub-Gain nodes
    this.masterGain = null;
    this.droneGain = null;
    this.waterGain = null;
    this.windGain = null;
    this.nightGain = null;
    this.fablabGain = null;

    // Filters
    this.windFilter = null;

    // Procedural timers
    this.birdTimer = null;
    this.cricketTimer = null;
    this.hearthTimer = null;
    this.chimeTimer = null;
    this.fablabTimer = null;
    this.windGustTimer = null;

    // State tracking
    this.currentHour = 12;
    this.currentWeather = 'SUNNY';
    this.currentSeason = 'spring';
    this.activeDistrict = null;
  }

  init() {
    if (this.isInitialized) return;
    const AudioContextClass = typeof window !== 'undefined' ? (window.AudioContext || window.webkitAudioContext) : null;
    if (!AudioContextClass) return;

    this.audioCtx = new AudioContextClass();

    // 1. Master Output Gain
    this.masterGain = this.audioCtx.createGain();
    const initialVol = this.isMuted ? 0.0001 : this.volume;
    this.masterGain.gain.setValueAtTime(initialVol, this.audioCtx.currentTime);
    this.masterGain.connect(this.audioCtx.destination);

    // 2. Build Warm Harmonic Drone
    this.initHarmonicDrone();

    // 3. Build Hydrological Stream (Agro & Cisterns)
    this.initWaterFlow();

    // 4. Build Weather & Seasonal Wind/Rain Layer
    this.initWeatherNoise();

    // 5. Build Night & Embers Bed
    this.initNightBed();

    // 6. Build FabLab Transformer Hum
    this.initFablabHum();

    // 7. Start Procedural Event Loops (Birds, Wind Chimes, Steppers, Cicadas)
    this.startProceduralLoops();

    this.isInitialized = true;
  }

  createPinkNoiseBuffer(seconds = 3.0) {
    if (!this.audioCtx) return null;
    const bufferSize = this.audioCtx.sampleRate * seconds;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  initHarmonicDrone() {
    if (!this.audioCtx) return;

    this.droneGain = this.audioCtx.createGain();
    this.droneGain.gain.setValueAtTime(0.09, this.audioCtx.currentTime);

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, this.audioCtx.currentTime);
    filter.Q.setValueAtTime(2.5, this.audioCtx.currentTime);

    // Breathing LFO
    const lfo = this.audioCtx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.06, this.audioCtx.currentTime);
    const lfoGain = this.audioCtx.createGain();
    lfoGain.gain.setValueAtTime(110, this.audioCtx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    // Fundamental A2 (110 Hz)
    const osc1 = this.audioCtx.createOscillator();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(110, this.audioCtx.currentTime);

    // Fifth E3 (164.8 Hz)
    const osc2 = this.audioCtx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(164.8, this.audioCtx.currentTime);

    // Octave A3 (220 Hz soft)
    const osc3 = this.audioCtx.createOscillator();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(220, this.audioCtx.currentTime);
    const osc3Gain = this.audioCtx.createGain();
    osc3Gain.gain.setValueAtTime(0.25, this.audioCtx.currentTime);
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

  initWaterFlow() {
    if (!this.audioCtx) return;

    const noiseBuffer = this.createPinkNoiseBuffer(2.5);
    if (!noiseBuffer) return;

    const src = this.audioCtx.createBufferSource();
    src.buffer = noiseBuffer;
    src.loop = true;

    const bandpass = this.audioCtx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(680, this.audioCtx.currentTime);
    bandpass.Q.setValueAtTime(2.0, this.audioCtx.currentTime);

    this.waterGain = this.audioCtx.createGain();
    this.waterGain.gain.setValueAtTime(0.035, this.audioCtx.currentTime);

    src.connect(bandpass);
    bandpass.connect(this.waterGain);
    this.waterGain.connect(this.masterGain);

    src.start();
  }

  initWeatherNoise() {
    if (!this.audioCtx) return;

    const noiseBuffer = this.createPinkNoiseBuffer(3.0);
    if (!noiseBuffer) return;

    const src = this.audioCtx.createBufferSource();
    src.buffer = noiseBuffer;
    src.loop = true;

    this.windFilter = this.audioCtx.createBiquadFilter();
    this.windFilter.type = 'lowpass';
    this.windFilter.frequency.setValueAtTime(800, this.audioCtx.currentTime);

    this.windGain = this.audioCtx.createGain();
    this.windGain.gain.setValueAtTime(0.005, this.audioCtx.currentTime);

    src.connect(this.windFilter);
    this.windFilter.connect(this.windGain);
    this.windGain.connect(this.masterGain);

    src.start();
  }

  initNightBed() {
    if (!this.audioCtx) return;
    this.nightGain = this.audioCtx.createGain();
    this.nightGain.gain.setValueAtTime(0.001, this.audioCtx.currentTime);
    this.nightGain.connect(this.masterGain);
  }

  initFablabHum() {
    if (!this.audioCtx) return;

    this.fablabGain = this.audioCtx.createGain();
    this.fablabGain.gain.setValueAtTime(0.001, this.audioCtx.currentTime);

    // 60 Hz transformer sub-harmonic
    const humOsc = this.audioCtx.createOscillator();
    humOsc.type = 'triangle';
    humOsc.frequency.setValueAtTime(60, this.audioCtx.currentTime);

    const humFilter = this.audioCtx.createBiquadFilter();
    humFilter.type = 'lowpass';
    humFilter.frequency.setValueAtTime(140, this.audioCtx.currentTime);

    humOsc.connect(humFilter);
    humFilter.connect(this.fablabGain);
    this.fablabGain.connect(this.masterGain);

    humOsc.start();
  }

  startProceduralLoops() {
    // 1. Spring & Daytime Songbirds
    const loopBirds = () => {
      const delay = 4000 + Math.random() * 6000;
      this.birdTimer = setTimeout(() => {
        if (!this.isMuted && this.isDaytime() && this.currentSeason !== 'winter' && this.currentWeather !== 'RAIN') {
          this.synthesizeSongbird();
        }
        loopBirds();
      }, delay);
    };
    loopBirds();

    // 2. Summer Cicadas & Evening Meadow Crickets
    const loopCrickets = () => {
      const delay = 1400 + Math.random() * 1600;
      this.cricketTimer = setTimeout(() => {
        if (!this.isMuted) {
          if (!this.isDaytime()) {
            this.synthesizeCricketChirp();
          } else if (this.currentSeason === 'summer') {
            this.synthesizeCicadaDrone();
          }
        }
        loopCrickets();
      }, delay);
    };
    loopCrickets();

    // 3. MHU Ecovillage Pentatonic Wind Chimes (E4, G4, A4, B4, D5)
    const loopWindChimes = () => {
      const delay = 5000 + Math.random() * 8000;
      this.chimeTimer = setTimeout(() => {
        if (!this.isMuted) {
          this.synthesizeWindChime();
        }
        loopWindChimes();
      }, delay);
    };
    loopWindChimes();

    // 4. FabLab Stepper Frequency Micro-Chirps
    const loopFabLab = () => {
      const delay = 3500 + Math.random() * 5000;
      this.fablabTimer = setTimeout(() => {
        if (!this.isMuted && this.isDaytime()) {
          this.synthesizeStepperMotorPulse();
        }
        loopFabLab();
      }, delay);
    };
    loopFabLab();

    // 5. Hearth & Stove Embers
    const loopHearth = () => {
      const delay = 1800 + Math.random() * 2400;
      this.hearthTimer = setTimeout(() => {
        if (!this.isMuted && (!this.isDaytime() || this.currentSeason === 'winter')) {
          this.synthesizeHearthCrackle();
        }
        loopHearth();
      }, delay);
    };
    loopHearth();

    // 6. Autumn Sweeping Wind Gusts
    const loopWindGusts = () => {
      const delay = 7000 + Math.random() * 9000;
      this.windGustTimer = setTimeout(() => {
        if (!this.isMuted && (this.currentSeason === 'autumn' || this.currentWeather === 'STORMY')) {
          this.synthesizeWindGust();
        }
        loopWindGusts();
      }, delay);
    };
    loopWindGusts();
  }

  synthesizeSongbird() {
    if (!this.audioCtx || this.isMuted) return;
    const now = this.audioCtx.currentTime;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    const baseFreq = 2400 + Math.random() * 900;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.05);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.9, now + 0.13);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.03, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  synthesizeCricketChirp() {
    if (!this.audioCtx || this.isMuted) return;
    const now = this.audioCtx.currentTime;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    const filter = this.audioCtx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(4500 + Math.random() * 300, now);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(4500, now);
    filter.Q.setValueAtTime(7.0, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.016, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.07);
  }

  synthesizeCicadaDrone() {
    if (!this.audioCtx || this.isMuted) return;
    const now = this.audioCtx.currentTime;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(3200 + Math.sin(now * 8) * 400, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.012, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.65);
  }

  synthesizeWindChime() {
    if (!this.audioCtx || this.isMuted) return;

    // E-Minor Pentatonic scale: E4 (329.6), G4 (392.0), A4 (440.0), B4 (493.8), D5 (587.3)
    const chimeFreqs = [329.63, 392.00, 440.00, 493.88, 587.33, 659.25];
    const freq = chimeFreqs[Math.floor(Math.random() * chimeFreqs.length)];

    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.02, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 1.25);
  }

  synthesizeStepperMotorPulse() {
    if (!this.audioCtx || this.isMuted) return;
    const now = this.audioCtx.currentTime;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    const freq = 880 + Math.random() * 600;
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.008, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  synthesizeHearthCrackle() {
    if (!this.audioCtx || this.isMuted) return;
    const now = this.audioCtx.currentTime;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(260 + Math.random() * 500, now);

    gain.gain.setValueAtTime(0.018, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.025);
  }

  synthesizeWindGust() {
    if (!this.audioCtx || !this.windGain || this.isMuted) return;
    const now = this.audioCtx.currentTime;

    this.windGain.gain.cancelScheduledValues(now);
    this.windGain.gain.linearRampToValueAtTime(0.08, now + 1.2);
    this.windGain.gain.linearRampToValueAtTime(0.008, now + 3.0);
  }

  isDaytime() {
    return this.currentHour >= 6 && this.currentHour < 20;
  }

  update(hour, weather, season, district) {
    this.currentHour = hour ?? this.currentHour;
    this.currentWeather = weather?.type || weather?.id || this.currentWeather;
    this.currentSeason = season?.id || season || this.currentSeason;
    this.activeDistrict = district ?? this.activeDistrict;

    if (!this.isInitialized || !this.audioCtx || this.isMuted) return;
    const now = this.audioCtx.currentTime;

    // 1. Modulate Weather & Wind
    if (this.windGain) {
      let targetWind = 0.008;
      if (this.currentWeather === 'RAIN') targetWind = 0.14;
      else if (this.currentWeather === 'STORMY') targetWind = 0.28;
      else if (this.currentWeather === 'HEATWAVE') targetWind = 0.025;
      else if (this.currentSeason === 'autumn') targetWind = 0.035;

      this.windGain.gain.cancelScheduledValues(now);
      this.windGain.gain.linearRampToValueAtTime(targetWind, now + 1.5);
    }

    // 2. Modulate Night Bed
    if (this.nightGain) {
      const isNight = !this.isDaytime();
      const targetNight = isNight ? 0.05 : 0.001;
      this.nightGain.gain.cancelScheduledValues(now);
      this.nightGain.gain.linearRampToValueAtTime(targetNight, now + 2.0);
    }

    // 3. Modulate FabLab Hum
    if (this.fablabGain) {
      const isFablabActive = this.activeDistrict === 'fablab' || this.activeDistrict === 'foundry';
      const targetHum = isFablabActive ? 0.04 : 0.005;
      this.fablabGain.gain.cancelScheduledValues(now);
      this.fablabGain.gain.linearRampToValueAtTime(targetHum, now + 1.5);
    }
  }

  toggleMute() {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  setMuted(muted) {
    this.isMuted = Boolean(muted);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('one_game_sound_muted', String(this.isMuted));
    }

    if (!this.isInitialized && !this.isMuted) {
      this.init();
    }

    if (this.audioCtx) {
      if (this.audioCtx.state === 'suspended' && !this.isMuted) {
        this.audioCtx.resume().catch(() => {});
      }
      if (this.masterGain) {
        const now = this.audioCtx.currentTime;
        this.masterGain.gain.cancelScheduledValues(now);
        const targetVol = this.isMuted ? 0.0001 : this.volume;
        this.masterGain.gain.linearRampToValueAtTime(targetVol, now + 0.3);
      }
    }
  }

  destroy() {
    clearTimeout(this.birdTimer);
    clearTimeout(this.cricketTimer);
    clearTimeout(this.hearthTimer);
    clearTimeout(this.chimeTimer);
    clearTimeout(this.fablabTimer);
    clearTimeout(this.windGustTimer);

    if (this.audioCtx) {
      this.audioCtx.close().catch(() => {});
      this.audioCtx = null;
    }
    this.isInitialized = false;
  }
}

export const ambienceAudio = new AmbienceAudioEngine();
