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
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    speechSynthesis.speak(utterance);
  });
}
