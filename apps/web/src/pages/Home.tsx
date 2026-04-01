import { useNavigate } from 'react-router';
import { getAllModules } from '@keiro/content';
import { getCurrentModule } from '@keiro/engine';
import { PageContainer } from '../components/layout/PageContainer';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { SecondaryButton } from '../components/common/SecondaryButton';
import { ProgressBar } from '../components/common/ProgressBar';
import { useProgress } from '../hooks/useProgress';
import { useDailyPlan } from '../hooks/useDailyPlan';

function MapIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503-11.307L12 2.25 8.497 5.693A3.75 3.75 0 006.75 8.25v9a3.75 3.75 0 003.75 3.75h3a3.75 3.75 0 003.75-3.75v-9a3.75 3.75 0 00-1.747-3.057z" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87a6.714 6.714 0 01.636.357c.31.212.692.294 1.058.196l1.25-.365a1.14 1.14 0 011.316.505l1.296 2.244a1.14 1.14 0 01-.205 1.435l-1.037.916c-.282.249-.429.625-.414 1.011.009.232.009.463 0 .695-.015.386.132.762.414 1.011l1.037.916c.424.374.53.998.205 1.435l-1.296 2.244a1.14 1.14 0 01-1.316.505l-1.25-.365c-.366-.098-.748-.016-1.058.196a6.714 6.714 0 01-.636.357c-.332.184-.582.496-.645.87l-.213 1.281c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.212-1.282c-.063-.373-.313-.685-.645-.869a6.72 6.72 0 01-.636-.357c-.31-.212-.692-.294-1.058-.196l-1.25.365a1.14 1.14 0 01-1.316-.505l-1.296-2.244a1.14 1.14 0 01.205-1.435l1.037-.916c.282-.249.429-.625.414-1.011a6.613 6.613 0 010-.695c.015-.386-.132-.762-.414-1.011l-1.037-.916a1.14 1.14 0 01-.205-1.435l1.296-2.244a1.14 1.14 0 011.316-.505l1.25.365c.366.098.748.016 1.058-.196.2-.13.424-.248.636-.357.332-.184.582-.496.645-.87l.213-1.28z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

export function Home() {
  const navigate = useNavigate();
  const { allProgress } = useProgress();
  const { plan, isComplete } = useDailyPlan();

  const allModules = getAllModules();
  const passedCount = allProgress.filter((p) => p.status === 'passed').length;
  const totalCount = allModules.length;
  const percentComplete = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;

  // Determine current level label from the current module
  const progressMap = new Map(allProgress.map((p) => [p.moduleId, p]));
  const currentModule = getCurrentModule(allModules, progressMap);
  const levelLabel = currentModule?.level?.toUpperCase() ?? (totalCount > 0 ? 'Complete' : 'N5');

  function handleStart() {
    if (plan && plan.modules.length > 0) {
      navigate(`/study/${plan.modules[0]}/intro`);
    }
  }

  function handleKeepGoing() {
    // After completing daily plan, start the next available module
    if (currentModule) {
      navigate(`/study/${currentModule.id}/intro`);
    }
  }

  const allModulesComplete = passedCount === totalCount && totalCount > 0;

  return (
    <>
      <header className="sticky top-0 z-10 flex h-12 items-center justify-between bg-white px-4 shadow-sm">
        <button
          onClick={() => navigate('/path')}
          className="flex h-11 w-11 items-center justify-center rounded-full active:bg-gray-100"
          aria-label="Path Map"
        >
          <MapIcon />
        </button>
        <button
          onClick={() => navigate('/settings')}
          className="flex h-11 w-11 items-center justify-center rounded-full active:bg-gray-100"
          aria-label="Settings"
        >
          <SettingsIcon />
        </button>
      </header>

      <PageContainer>
        {/* Overall progress */}
        <div className="mt-4">
          <p className="mb-2 text-sm font-medium text-gray-700">
            {levelLabel} — {percentComplete}% complete
          </p>
          <ProgressBar value={percentComplete} />
        </div>

        {allModulesComplete ? (
          /* All modules complete state */
          <div className="mt-8 text-center">
            <p className="text-lg font-semibold">
              Congratulations! You've completed the entire path. You're ready to read manga. Keep reviewing to stay sharp.
            </p>
            <div className="mt-6">
              <SecondaryButton onClick={() => navigate('/review')}>
                Review
              </SecondaryButton>
            </div>
          </div>
        ) : isComplete ? (
          /* Daily plan complete state */
          <div className="mt-8 text-center">
            <p className="text-lg font-semibold">Today's plan complete!</p>
            <div className="mt-6 space-y-3">
              <PrimaryButton onClick={handleKeepGoing}>
                Keep going
              </PrimaryButton>
              <SecondaryButton onClick={() => navigate('/review')}>
                Review
              </SecondaryButton>
            </div>
          </div>
        ) : (
          /* Active daily plan state */
          <>
            {/* Today's Plan card */}
            <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <h2 className="text-base font-semibold">Today's Plan</h2>
              {plan ? (
                <ul className="mt-2 space-y-1 text-sm text-gray-600">
                  {plan.newItemCount > 0 && (
                    <li>&bull; {plan.newItemCount} new kana</li>
                  )}
                  <li>&bull; ~{plan.estimatedMinutes} min session</li>
                </ul>
              ) : (
                <p className="mt-2 text-sm text-gray-500">Loading plan...</p>
              )}
            </div>

            {/* Actions */}
            <div className="mt-8 space-y-3">
              <PrimaryButton onClick={handleStart} disabled={!plan}>
                Start
              </PrimaryButton>
              <SecondaryButton onClick={() => navigate('/review')}>
                Review
              </SecondaryButton>
            </div>
          </>
        )}
      </PageContainer>
    </>
  );
}
