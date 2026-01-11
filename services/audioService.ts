let audioCtx: AudioContext | null = null;

export const playClickSound = (enabled: boolean) => {
  if (!enabled) return;

  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;

    // Layer 1: The "Tick" (Very high frequency light transient)
    const tickOsc = audioCtx.createOscillator();
    const tickGain = audioCtx.createGain();
    tickOsc.type = 'sine';
    tickOsc.frequency.setValueAtTime(3500, now);
    tickOsc.frequency.exponentialRampToValueAtTime(2000, now + 0.005);
    
    tickGain.gain.setValueAtTime(0.04, now);
    tickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.01);
    
    tickOsc.connect(tickGain);
    tickGain.connect(audioCtx.destination);

    // Layer 2: The "Pop" (Soft mid-high resonance for body)
    const popOsc = audioCtx.createOscillator();
    const popGain = audioCtx.createGain();
    popOsc.type = 'sine'; // Sine is smoother than triangle/square
    popOsc.frequency.setValueAtTime(800, now);
    popOsc.frequency.exponentialRampToValueAtTime(600, now + 0.03);
    
    popGain.gain.setValueAtTime(0.06, now);
    popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    
    popOsc.connect(popGain);
    popGain.connect(audioCtx.destination);

    // Layer 3: The "Smooth Air" (High-passed subtle noise)
    const bufferSize = audioCtx.sampleRate * 0.02; // Short 20ms burst
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseSource = audioCtx.createBufferSource();
    noiseSource.buffer = buffer;
    
    const noiseFilter = audioCtx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(6000, now);

    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.015, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);

    // Trigger layers
    tickOsc.start(now);
    tickOsc.stop(now + 0.02);
    
    popOsc.start(now);
    popOsc.stop(now + 0.05);
    
    noiseSource.start(now);
    noiseSource.stop(now + 0.02);

  } catch (e) {
    console.warn("Lightweight audio playback failed", e);
  }
};