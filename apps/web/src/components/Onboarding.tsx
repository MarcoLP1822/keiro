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
    icon: '\u9053',
    title: 'Welcome to Keiro',
    description: 'Your path from zero to reading manga in Japanese.',
  },
  {
    icon: '\u6B69',
    title: 'One step at a time',
    description: 'Follow the structured path. Each lesson builds on the last.',
  },
  {
    icon: '\u65E5',
    title: 'Daily practice',
    description: 'A short daily plan keeps you on track. 5-10 minutes is all you need.',
  },
  {
    icon: '\u59CB',
    title: "Let's begin!",
    description: 'Start with the basics and work your way up.',
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
      style={{ background: 'var(--ios-bg-grouped)' }}
      onClick={handleTap}
    >
      <div className="flex flex-col items-center text-center max-w-sm">
        <span
          className="text-[72px] leading-none mb-8"
          style={{ color: 'var(--ios-tertiary-label)' }}
          aria-hidden="true"
        >
          {slide.icon}
        </span>

        <h2
          className="text-[22px] font-semibold mb-3"
          style={{ color: 'var(--ios-label)' }}
        >
          {slide.title}
        </h2>

        <p
          className="text-[17px] leading-relaxed"
          style={{ color: 'var(--ios-secondary-label)' }}
        >
          {slide.description}
        </p>

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
              background: i === currentSlide ? 'var(--ios-blue)' : 'var(--ios-gray4)',
            }}
          />
        ))}
      </div>

      {!isLast && (
        <p
          className="absolute bottom-6 text-[13px]"
          style={{ color: 'var(--ios-tertiary-label)' }}
        >
          Tap to continue
        </p>
      )}
    </div>
  );
}
