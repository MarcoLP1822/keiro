let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!audioContext) {
      audioContext = new AudioContext();
    }
    return audioContext;
  } catch {
    return null;
  }
}

function playTone(frequency: number, duration: number, startTime: number, ctx: AudioContext, gain: GainNode): void {
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = frequency;
  osc.connect(gain);
  osc.start(startTime);
  osc.stop(startTime + duration);
}

export function playCorrectSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const gain = ctx.createGain();
    gain.gain.value = 0.15;
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    // Pleasant ascending two-note chime: C5 then E5
    playTone(523.25, 0.1, now, ctx, gain);
    playTone(659.25, 0.1, now + 0.1, ctx, gain);
  } catch (err) {
    console.warn('[sounds] playCorrectSound failed:', err);
  }
}

export function playIncorrectSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const gain = ctx.createGain();
    gain.gain.value = 0.15;
    gain.connect(ctx.destination);

    // Soft low tone: C4
    playTone(261.63, 0.15, ctx.currentTime, ctx, gain);
  } catch (err) {
    console.warn('[sounds] playIncorrectSound failed:', err);
  }
}
