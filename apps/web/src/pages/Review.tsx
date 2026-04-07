import { useNavigate } from 'react-router';
import { getAllModules } from '@keiro/content';
import { getModuleStatus } from '@keiro/engine';
import { TopBar } from '../components/layout/TopBar';
import { ModuleCard } from '../components/module/ModuleCard';
import { useProgress } from '../hooks/useProgress';

export function Review() {
  const navigate = useNavigate();
  const { allProgress, getProgress } = useProgress();

  const allModules = getAllModules().sort((a, b) => a.order - b.order);
  const progressMap = new Map(allProgress.map((p) => [p.moduleId, p]));

  const passedModules = allModules.filter(
    (m) => getModuleStatus(m.id, allModules, progressMap) === 'passed'
  );

  return (
    <>
      <TopBar title="Review" onBack={() => navigate('/')} />
      <main className="pt-24 px-6 max-w-2xl mx-auto pb-32">
        {/* Page header */}
        <div className="mb-8">
          <h1
            className="font-headline text-3xl font-bold tracking-tight"
            style={{ color: 'var(--k-on-surface)' }}
          >
            復習
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--k-secondary)' }}>
            — Review
          </p>
        </div>

        {passedModules.length === 0 ? (
          <p
            className="mt-12 text-center text-[17px] leading-relaxed"
            style={{ color: 'var(--k-secondary)' }}
          >
            Nothing to review yet. Complete your first module to unlock review.
          </p>
        ) : (
          <>
            {/* Section header */}
            <p
              className="mb-2 px-4 text-[13px] font-normal uppercase tracking-wide"
              style={{ color: 'var(--k-secondary)' }}
            >
              Completed Modules
            </p>

            {/* Grouped list card */}
            <div
              className="rounded-xl overflow-hidden"
              style={{ background: 'var(--k-surface-container-lowest)' }}
            >
              {passedModules.map((module) => {
                const progress = getProgress(module.id);
                return (
                  <ModuleCard
                    key={module.id}
                    module={module}
                    status="passed"
                    score={progress?.score}
                    onClick={() => navigate(`/study/${module.id}/exercises?mode=review`)}
                  />
                );
              })}
            </div>
          </>
        )}
      </main>
    </>
  );
}
