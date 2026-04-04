/**
 * Speaks Japanese text using the Web Speech API.
 * Returns immediately if audio is disabled or the API is unavailable.
 */
export function speak(text: string, enabled: boolean): Promise<void> {
  if (!enabled) return Promise.resolve();
  if (typeof speechSynthesis === 'undefined') return Promise.resolve();

  return new Promise((resolve) => {
    speechSynthesis.cancel(); // Stop any queued/playing speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.6;
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    speechSynthesis.speak(utterance);
  });
}
