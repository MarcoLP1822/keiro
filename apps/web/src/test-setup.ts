import '@testing-library/jest-dom';

// Mock matchMedia for components that use it
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Mock speechSynthesis
Object.defineProperty(window, 'speechSynthesis', {
  writable: true,
  value: { speak: () => {}, cancel: () => {} },
});

// Mock navigator.vibrate
Object.defineProperty(navigator, 'vibrate', {
  writable: true,
  value: () => true,
});

// Mock SpeechSynthesisUtterance
class MockSpeechSynthesisUtterance {
  text: string;
  lang = '';
  rate = 1;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(text: string) {
    this.text = text;
  }
}
Object.defineProperty(window, 'SpeechSynthesisUtterance', {
  writable: true,
  value: MockSpeechSynthesisUtterance,
});

// Mock HTMLDialogElement methods not available in jsdom
HTMLDialogElement.prototype.showModal = HTMLDialogElement.prototype.showModal || function () {
  this.setAttribute('open', '');
};
HTMLDialogElement.prototype.close = HTMLDialogElement.prototype.close || function () {
  this.removeAttribute('open');
};
