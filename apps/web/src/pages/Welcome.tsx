import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import { getAllModules } from '@keiro/content';
import { Onboarding } from '../components/Onboarding';
import { db } from '../services/db';
import { storage } from '../services/storage';

export function Welcome() {
  const navigate = useNavigate();
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);

  const onboardingSetting = useLiveQuery(
    () => db.settings.get('onboardingComplete'),
    [],
  );

  const showOnboarding = !onboardingDismissed && onboardingSetting?.value !== true;

  async function handleStartFromZero() {
    const modules = getAllModules();
    const firstModule = modules.find((m) => m.order === 1) ?? modules[0];

    await storage.saveModuleProgress({
      moduleId: firstModule.id,
      status: 'available',
      score: null,
      completedAt: null,
      attempts: 0,
    });

    window.location.href = '/';
  }

  function handleKnowSome() {
    navigate('/placement');
  }

  if (showOnboarding) {
    return <Onboarding onComplete={() => setOnboardingDismissed(true)} />;
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-8 pb-12"
      style={{ background: 'var(--k-surface)' }}
    >
      {/* Decorative kanji */}
      <span
        className="font-headline text-[96px] font-black opacity-[0.07] leading-none select-none mb-6"
        style={{ color: 'var(--k-primary)' }}
        aria-hidden="true"
      >
        経路
      </span>

      {/* Title */}
      <h1
        className="font-headline text-[2.75rem] leading-[1.1] font-black tracking-tight text-center"
        style={{ color: 'var(--k-primary)' }}
        data-testid="welcome-title"
      >
        Start your<br />Japanese path.
      </h1>
      <p className="text-sm text-center leading-relaxed mt-4 max-w-[280px]" style={{ color: 'var(--k-secondary)' }}>
        A mindful approach to mastering Hiragana, Katakana, and Kanji. Designed for focus, built for retention.
      </p>

      {/* Actions */}
      <div className="w-full max-w-sm space-y-4 mt-10">
        <button
          onClick={handleStartFromZero}
          className="w-full h-14 flex items-center justify-center gap-2 bg-silk-gradient text-white rounded-full font-bold text-lg active:scale-[0.98] transition-all shadow-lg"
        >
          <span>Start Learning</span>
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </button>
        <button
          onClick={handleKnowSome}
          className="w-full h-12 flex items-center justify-center font-bold text-sm rounded-full active:opacity-80"
          style={{ color: 'var(--k-primary)' }}
        >
          I already know some Japanese
        </button>
        <button
          onClick={() => navigate('/login')}
          className="w-full h-12 flex items-center justify-center text-sm font-medium active:opacity-60"
          style={{ color: 'var(--k-secondary)' }}
        >
          I already have an account
        </button>
      </div>
    </div>
  );
}
