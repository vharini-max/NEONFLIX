// Web Audio API Micro-haptics / Subtle sound feedback
let audioCtx: AudioContext | null = null;
let soundEnabled = true;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

let lastTickTime = 0;

/**
 * Plays an ultra-subtle mechanical tick sound on hover (Linear/Apple style)
 */
export function playHoverTick() {
  if (!soundEnabled) return;
  const now = Date.now();
  if (now - lastTickTime < 60) return;
  lastTickTime = now;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Subtle 900Hz micro-click
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.025);

    // Very low volume, imperceptible to casual listeners, tactile to headphones
    gain.gain.setValueAtTime(0.018, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.025);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.028);
  } catch {
    // Gracefully ignore any browser audio constraints
  }
}

/**
 * Plays a clean subtle neon cinematic activation chime on play
 */
export function playCinematicChime() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.035, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.22);
  } catch {}
}

/**
 * Plays cinematic whoosh & sub-bass chord for the Netflix N intro
 */
export function playIntroWhoosh() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(65, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(130, ctx.currentTime + 0.4);
    osc.frequency.exponentialRampToValueAtTime(55, ctx.currentTime + 1.2);

    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.4);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(640, ctx.currentTime + 0.5);
    filter.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 1.4);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 1.5);
  } catch {}
}

export function toggleSoundEffects(): boolean {
  soundEnabled = !soundEnabled;
  return soundEnabled;
}

export function isSoundEnabled(): boolean {
  return soundEnabled;
}

// ============================================================================
// CYBER-AMBIENT SYNTH DRONE ENGINE (Blade Runner / Cyberpunk Neon Atmosphere)
// ============================================================================
interface DroneNodes {
  masterGain: GainNode;
  oscs: OscillatorNode[];
  lfo?: OscillatorNode;
  lfoGain?: GainNode;
  filter: BiquadFilterNode;
}

let droneActive = false;
let droneNodes: DroneNodes | null = null;

/**
 * Starts a smooth, low-volume, loopable cyber-ambient synth drone.
 * Uses detuned dual oscillators, sub-harmonic fifths, and a gentle breathing
 * low-pass resonant filter to create an immersive neon-cinema backdrop.
 */
export function startCyberAmbientDrone(volume = 0.02): boolean {
  try {
    const ctx = getAudioContext();
    if (!ctx) return false;

    if (droneActive && droneNodes) {
      return true; // Already running
    }

    // Master drone gain with slow 2-second cinematic fade-in
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.0001, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 2.0);

    // Warm resonant low-pass filter (cyberpunk atmosphere)
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(220, ctx.currentTime);
    filter.Q.setValueAtTime(2.2, ctx.currentTime);

    // LFO for slow subtle filter pulsation (0.07 Hz ~ 14-second atmospheric breath)
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.07, ctx.currentTime);
    lfoGain.gain.setValueAtTime(90, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const oscs: OscillatorNode[] = [];

    // Voice 1: Deep Fundamental A1 (55Hz sine)
    const osc1 = ctx.createOscillator();
    const g1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(55.0, ctx.currentTime);
    g1.gain.setValueAtTime(0.8, ctx.currentTime);
    osc1.connect(g1);
    g1.connect(filter);
    oscs.push(osc1);

    // Voice 2: Chorus Detuned A1 (55.4Hz triangle for analog warmth)
    const osc2 = ctx.createOscillator();
    const g2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(55.45, ctx.currentTime);
    g2.gain.setValueAtTime(0.35, ctx.currentTime);
    osc2.connect(g2);
    g2.connect(filter);
    oscs.push(osc2);

    // Voice 3: Fifth Harmonic E2 (82.4Hz warm drone)
    const osc3 = ctx.createOscillator();
    const g3 = ctx.createGain();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(82.41, ctx.currentTime);
    g3.gain.setValueAtTime(0.25, ctx.currentTime);
    osc3.connect(g3);
    g3.connect(filter);
    oscs.push(osc3);

    // Voice 4: Octave Shimmer A2 (110Hz subtle sine)
    const osc4 = ctx.createOscillator();
    const g4 = ctx.createGain();
    osc4.type = 'sine';
    osc4.frequency.setValueAtTime(110.0, ctx.currentTime);
    g4.gain.setValueAtTime(0.12, ctx.currentTime);
    osc4.connect(g4);
    g4.connect(filter);
    oscs.push(osc4);

    // Route filter through master gain to audio destination
    filter.connect(masterGain);
    masterGain.connect(ctx.destination);

    // Start all nodes
    lfo.start();
    oscs.forEach((osc) => osc.start());

    droneNodes = { masterGain, oscs, lfo, lfoGain, filter };
    droneActive = true;
    return true;
  } catch (err) {
    console.warn('Could not start ambient drone:', err);
    return false;
  }
}

/**
 * Stops the cyber-ambient synth drone with a smooth fade-out
 */
export function stopCyberAmbientDrone(): void {
  if (!droneNodes) {
    droneActive = false;
    return;
  }

  try {
    const ctx = getAudioContext();
    const currentNodes = droneNodes;
    droneNodes = null;
    droneActive = false;

    if (ctx && currentNodes) {
      // Smooth 1.2s fade out
      currentNodes.masterGain.gain.setValueAtTime(
        currentNodes.masterGain.gain.value,
        ctx.currentTime
      );
      currentNodes.masterGain.gain.exponentialRampToValueAtTime(
        0.0001,
        ctx.currentTime + 1.2
      );

      setTimeout(() => {
        try {
          currentNodes.oscs.forEach((osc) => osc.stop());
          if (currentNodes.lfo) currentNodes.lfo.stop();
          currentNodes.masterGain.disconnect();
        } catch {}
      }, 1300);
    }
  } catch {}
}

/**
 * Toggles the cyber-ambient synth drone and returns new state
 */
export function toggleCyberAmbientDrone(): boolean {
  if (droneActive) {
    stopCyberAmbientDrone();
    return false;
  } else {
    return startCyberAmbientDrone();
  }
}

export function isCyberAmbientPlaying(): boolean {
  return droneActive;
}
