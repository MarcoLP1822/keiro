import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import { getAllModules } from '@keiro/content';
import { PageContainer } from '../components/layout/PageContainer';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { SecondaryButton } from '../components/common/SecondaryButton';
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

    // Full page reload ensures Dexie picks up the new data on a fresh query.
    // Client-side navigate('/') can race with the live query subscription.
    window.location.href = '/';
  }

  function handleKnowSome() {
    navigate('/placement');
  }

  if (showOnboarding) {
    return <Onboarding onComplete={() => setOnboardingDismissed(true)} />;
  }

  return (
    <PageContainer>
      <div className="flex min-h-[80vh] flex-col items-center justify-center text-center px-4">
        {/* Decorative Japanese character */}
        <span
          className="text-[72px] leading-none mb-6"
          style={{ color: 'var(--ios-tertiary-label)' }}
          aria-hidden="true"
        >
          道
        </span>

        <h1
          className="text-[34px] font-normal tracking-tight"
          style={{ color: 'var(--ios-label)' }}
          data-testid="welcome-title"
        >
          Let's learn Japanese
        </h1>
        <p
          className="mt-2 text-[17px]"
          style={{ color: 'var(--ios-secondary-label)' }}
        >
          From zero to reading manga
        </p>

        <div className="mt-12 w-full space-y-4">
          <PrimaryButton onClick={handleStartFromZero}>
            I'm starting from zero
          </PrimaryButton>
          <SecondaryButton onClick={handleKnowSome}>
            I already know some Japanese
          </SecondaryButton>
        </div>
      </div>
    </PageContainer>
  );
}
