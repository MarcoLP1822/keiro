import { useNavigate } from 'react-router';
import { getAllModules } from '@keiro/content';
import { getModuleStatus } from '@keiro/engine';
import { TopBar } from '../components/layout/TopBar';
import { PageContainer } from '../components/layout/PageContainer';
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
      <PageContainer>
        {passedModules.length === 0 ? (
          <p className="mt-12 text-center text-gray-500">
            Nothing to review yet. Complete your first module to unlock review.
          </p>
        ) : (
          <div className="space-y-2">
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
        )}
      </PageContainer>
    </>
  );
}
