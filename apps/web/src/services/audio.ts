/**
 * Warm up the speech engine on first user interaction.
 * iOS Safari has ~300ms cold-start latency on the first speak() call.
 */
let warmedUp = false;
export function warmUpSpeech() {
  if (warmedUp || typeof speechSynthesis === 'undefined') return;
  const u = new SpeechSynthesisUtterance('');
  u.volume = 0;
  speechSynthesis.speak(u);
  warmedUp = true;
}

/**
 * Find the best available Japanese voice.
 * Prefers enhanced/premium voices over compact ones.
 */
let cachedVoice: SpeechSynthesisVoice | null = null;
let voiceSearched = false;

function getJapaneseVoice(): SpeechSynthesisVoice | null {
  if (voiceSearched) return cachedVoice;

  const voices = speechSynthesis.getVoices();
  if (voices.length === 0) return null; // voices not loaded yet

  voiceSearched = true;

  const jaVoices = voices.filter((v) => v.lang === 'ja-JP' || v.lang.startsWith('ja'));
  if (jaVoices.length === 0) return null;

  // Prefer enhanced/premium voices (iOS names them with "Enhanced" or "Premium")
  const premium = jaVoices.find((v) =>
    /enhanced|premium/i.test(v.name),
  );
  if (premium) { cachedVoice = premium; return premium; }

  // Prefer non-compact, non-default voices (typically higher quality)
  const nonCompact = jaVoices.find((v) =>
    !v.localService || jaVoices.length === 1,
  );
  if (nonCompact) { cachedVoice = nonCompact; return nonCompact; }

  cachedVoice = jaVoices[0];
  return cachedVoice;
}

// Listen for voices to load (Chrome loads them async)
if (typeof speechSynthesis !== 'undefined') {
  speechSynthesis.addEventListener?.('voiceschanged', () => {
    voiceSearched = false;
    cachedVoice = null;
  });
}

/**
 * Speaks Japanese text using the Web Speech API.
 * Returns immediately if audio is disabled or the API is unavailable.
 */
export function speak(text: string, enabled: boolean): Promise<void> {
  if (!enabled) return Promise.resolve();
  if (typeof speechSynthesis === 'undefined') return Promise.resolve();

  return new Promise((resolve) => {
    if (speechSynthesis.speaking) speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.6;

    const voice = getJapaneseVoice();
    if (voice) utterance.voice = voice;

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    speechSynthesis.speak(utterance);
  });
}
