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
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--k-surface)' }}>
      {/* Header */}
      <header
        className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16"
        style={{
          background: 'color-mix(in srgb, var(--k-surface) 90%, transparent)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        <span className="font-headline text-lg font-bold tracking-tight" style={{ color: 'var(--k-primary)' }}>
          Keiro
        </span>
      </header>

      <main className="flex-1 flex flex-col pt-16 pb-12 px-6 max-w-lg mx-auto w-full">
        {/* Hero Section */}
        <div className="relative mt-8 mb-12">
          {/* Zen circle */}
          <div
            className="aspect-[4/5] w-full rounded-full overflow-hidden flex items-center justify-center"
            style={{
              background: 'var(--k-surface-container)',
              border: '12px solid var(--k-surface-container-lowest)',
            }}
          >
            <span
              className="font-headline text-[120px] font-black opacity-10"
              style={{ color: 'var(--k-primary)' }}
            >
              道
            </span>
          </div>

          {/* Floating Zen Mark */}
          <div
            className="absolute top-8 -right-4 p-6 rounded-xl flex flex-col items-center gap-4 shadow-lg"
            style={{ background: 'var(--k-primary)', color: 'var(--k-on-primary)' }}
          >
            <span className="font-headline text-2xl font-black tracking-[0.2em]" style={{ writingMode: 'vertical-rl' }}>
              経路
            </span>
            <div className="w-px h-12" style={{ background: 'rgba(255,255,255,0.3)' }} />
            <span className="material-symbols-outlined text-xl">self_improvement</span>
          </div>
        </div>

        {/* Typography */}
        <div className="space-y-6">
          <h1
            className="font-headline text-[2.75rem] leading-[1.1] font-black tracking-tight"
            style={{ color: 'var(--k-primary)' }}
            data-testid="welcome-title"
          >
            Start your <br />Japanese path.
          </h1>
          <p className="text-sm max-w-[80%] leading-relaxed" style={{ color: 'var(--k-secondary)' }}>
            A mindful approach to mastering Hiragana, Katakana, and Kanji. Designed for focus, built for retention.
          </p>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Actions */}
        <div className="space-y-4 mt-12">
          <button
            onClick={handleStartFromZero}
            className="w-full h-14 flex items-center justify-center gap-2 bg-silk-gradient text-white rounded-full font-bold text-lg active:scale-[0.98] transition-all shadow-lg"
          >
            <span>Start Learning</span>
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>
          <button
            onClick={handleKnowSome}
            className="w-full h-12 flex items-center justify-center font-bold text-sm rounded-full transition-colors active:opacity-80"
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

        {/* Quality Indicators */}
        <div className="mt-10 flex justify-center items-center gap-8 opacity-40 grayscale">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px]">verified</span>
            <span className="text-[11px] font-bold uppercase tracking-widest">Mastery</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px]">history_edu</span>
            <span className="text-[11px] font-bold uppercase tracking-widest">Calligraphy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px]">psychology</span>
            <span className="text-[11px] font-bold uppercase tracking-widest">Retention</span>
          </div>
        </div>
      </main>

      {/* Bottom bar */}
      <div className="h-2 w-full" style={{ background: 'var(--k-surface-container-low)' }} />
    </div>
  );
}
