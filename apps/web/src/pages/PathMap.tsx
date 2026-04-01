import { useState } from 'react';
import { useNavigate } from 'react-router';
import { getAllModules } from '@keiro/content';
import { getModuleStatus } from '@keiro/engine';
import type { Module } from '@keiro/types';
import { TopBar } from '../components/layout/TopBar';
import { PageContainer } from '../components/layout/PageContainer';
import { Modal } from '../components/common/Modal';
import { ModuleCard } from '../components/module/ModuleCard';
import { useProgress } from '../hooks/useProgress';

export function PathMap() {
  const navigate = useNavigate();
  const { allProgress, getProgress } = useProgress();
  const [testOutModule, setTestOutModule] = useState<Module | null>(null);

  const allModules = getAllModules().sort((a, b) => a.order - b.order);
  const progressMap = new Map(allProgress.map((p) => [p.moduleId, p]));

  function handleModuleClick(module: Module) {
    const status = getModuleStatus(module.id, allModules, progressMap);

    if (status === 'passed') {
      navigate(`/study/${module.id}/exercises?mode=review`);
    } else if (status === 'available' || status === 'in_progress') {
      navigate(`/study/${module.id}/intro`);
    } else {
      // locked — show test-out modal
      setTestOutModule(module);
    }
  }

  function handleTestOut() {
    if (testOutModule) {
      navigate(`/study/${testOutModule.id}/exercises`);
      setTestOutModule(null);
    }
  }

  return (
    <>
      <TopBar title="Learning Path" onBack={() => navigate('/')} />
      <PageContainer>
        <div className="space-y-2">
          {allModules.map((module) => {
            const status = getModuleStatus(module.id, allModules, progressMap);
            const progress = getProgress(module.id);
            return (
              <ModuleCard
                key={module.id}
                module={module}
                status={status}
                score={progress?.score}
                onClick={() => handleModuleClick(module)}
              />
            );
          })}
        </div>

        <p className="mt-8 text-center text-sm text-gray-500">
          {'\uD83C\uDFAF'} Goal: Read Manga
        </p>
      </PageContainer>

      <Modal
        isOpen={testOutModule !== null}
        title={`Test out of ${testOutModule?.name ?? ''}?`}
        body="Answer questions to prove you know this material. You need 80% to pass."
        primaryLabel="Take the test"
        secondaryLabel="Cancel"
        onPrimary={handleTestOut}
        onSecondary={() => setTestOutModule(null)}
      />
    </>
  );
}
