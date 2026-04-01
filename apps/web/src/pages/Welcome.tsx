import { useNavigate } from 'react-router';
import { getAllModules } from '@keiro/content';
import { PageContainer } from '../components/layout/PageContainer';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { SecondaryButton } from '../components/common/SecondaryButton';
import { storage } from '../services/storage';

export function Welcome() {
  const navigate = useNavigate();

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

  return (
    <PageContainer>
      <div className="flex min-h-[80vh] flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-bold tracking-tight" data-testid="welcome-title">
          Let's learn Japanese
        </h1>
        <p className="mt-3 text-lg text-gray-500">
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
