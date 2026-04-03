import { describe, it, expect, vi, beforeEach } from 'vitest';
import { playCorrectSound, playIncorrectSound } from '../services/sounds';

// Mock AudioContext since jsdom doesn't provide it
const mockOscillator = {
  type: 'sine',
  frequency: { value: 0 },
  connect: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
};

const mockGain = {
  gain: { value: 0 },
  connect: vi.fn(),
};

const mockAudioContext = {
  currentTime: 0,
  destination: {},
  createOscillator: vi.fn(() => ({ ...mockOscillator })),
  createGain: vi.fn(() => ({ ...mockGain })),
};

describe('sounds', () => {
  beforeEach(() => {
    // Provide AudioContext mock
    vi.stubGlobal('AudioContext', vi.fn(() => ({ ...mockAudioContext })));
  });

  it('playCorrectSound does not throw', () => {
    expect(() => playCorrectSound()).not.toThrow();
  });

  it('playIncorrectSound does not throw', () => {
    expect(() => playIncorrectSound()).not.toThrow();
  });

  it('works gracefully when AudioContext is unavailable', () => {
    vi.stubGlobal('AudioContext', undefined);
    expect(() => playCorrectSound()).not.toThrow();
    expect(() => playIncorrectSound()).not.toThrow();
  });
});
