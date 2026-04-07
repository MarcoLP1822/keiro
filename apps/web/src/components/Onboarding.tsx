import { useState } from 'react';
import { PrimaryButton } from './common/PrimaryButton';
import { storage } from '../services/storage';

interface Slide {
  icon: string;
  title: string;
  description: string;
}

const slides: Slide[] = [
  {
    icon: '経',
    title: 'Welcome to Keiro 経路',
    description: 'Your path from zero to reading manga in Japanese.',
  },
  {
    icon: 'ひ',
    title: 'Follow the Path',
    description: 'Start with hiragana, then vocabulary, grammar, and kanji. Each step builds on what you know.',
  },
  {
    icon: '復',
    title: 'Smart Reviews',
    description: "Keiro remembers what you've learned and schedules reviews at the perfect time. No cramming, no overwhelm.",
  },
  {
    icon: '始',
    title: '5 Minutes a Day',
    description: 'A short daily practice is all you need. Open the app, follow the plan, done.',
  },
];

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const isLast = currentSlide === slides.length - 1;
  const slide = slides[currentSlide];

  async function handleDismiss() {
    await storage.setSetting('onboardingComplete', true);
    onComplete();
  }

  function handleTap() {
    if (isLast) return;
    setCurrentSlide((prev) => prev + 1);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center px-8"
      style={{ background: 'var(--k-surface)' }}
      onClick={handleTap}
    >
      <div className="flex flex-col items-center text-center max-w-sm">
        <span
          className="text-[72px] leading-none mb-8"
          style={{ color: 'var(--k-outline)' }}
          aria-hidden="true"
        >
          {slide.icon}
        </span>

        <h2
          className="text-[22px] font-semibold mb-3"
          style={{ color: 'var(--k-on-surface)' }}
        >
          {slide.title}
        </h2>

        <p
          className="text-[17px] leading-relaxed"
          style={{ color: 'var(--k-secondary)' }}
        >
          {slide.description}
        </p>

        {/* Slide 2: mini path visualization */}
        {currentSlide === 1 && (
          <div className="mt-6 flex items-center gap-2 text-[15px]" style={{ color: 'var(--k-outline)' }}>
            <span className="text-[18px]">ひ</span>
            <span>→</span>
            <span className="text-[18px]">言葉</span>
            <span>→</span>
            <span className="text-[18px]">文法</span>
            <span>→</span>
            <span className="text-[18px]">漢字</span>
          </div>
        )}

        {isLast && (
          <div className="mt-10 w-full" onClick={(e) => e.stopPropagation()}>
            <PrimaryButton onClick={handleDismiss}>
              Get Started
            </PrimaryButton>
          </div>
        )}
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-12 flex gap-2">
        {slides.map((_, i) => (
          <div
            key={i}
            className="h-2 w-2 rounded-full transition-colors"
            style={{
              background: i === currentSlide ? 'var(--k-primary)' : 'var(--k-outline-variant)',
            }}
          />
        ))}
      </div>

      {!isLast && (
        <p
          className="absolute bottom-6 text-[13px]"
          style={{ color: 'var(--k-outline)' }}
        >
          Tap to continue
        </p>
      )}
    </div>
  );
}
