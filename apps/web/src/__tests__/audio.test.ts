import { describe, it, expect, vi, beforeEach } from 'vitest';
import { speak } from '../services/audio';

describe('speak', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns resolved promise when enabled is false', async () => {
    await expect(speak('あ', false)).resolves.toBeUndefined();
  });

  it('returns resolved promise when speechSynthesis is not available', async () => {
    const original = window.speechSynthesis;
    // Temporarily remove speechSynthesis
    Object.defineProperty(window, 'speechSynthesis', {
      writable: true,
      value: undefined,
    });

    await expect(speak('あ', true)).resolves.toBeUndefined();

    // Restore
    Object.defineProperty(window, 'speechSynthesis', {
      writable: true,
      value: original,
    });
  });

  it('calls speechSynthesis.speak when enabled is true', () => {
    const mockSpeak = vi.fn();
    Object.defineProperty(window, 'speechSynthesis', {
      writable: true,
      value: { speak: mockSpeak, cancel: () => {}, speaking: false, getVoices: () => [], addEventListener: () => {} },
    });

    speak('あ', true);
    expect(mockSpeak).toHaveBeenCalledOnce();
  });
});
