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

// Group modules by their level for iOS grouped list sections
function groupByLevel(modules: Module[]): { level: string; modules: Module[] }[] {
  const groups: { level: string; modules: Module[] }[] = [];
  let currentLevel = '';

  for (const mod of modules) {
    const level = mod.level?.toUpperCase() ?? 'Other';
    if (level !== currentLevel) {
      currentLevel = level;
      groups.push({ level, modules: [] });
    }
    groups[groups.length - 1].modules.push(mod);
  }

  return groups;
}

export function PathMap() {
  const navigate = useNavigate();
  const { allProgress, getProgress } = useProgress();
  const [testOutModule, setTestOutModule] = useState<Module | null>(null);

  const allModules = getAllModules().sort((a, b) => a.order - b.order);
  const progressMap = new Map(allProgress.map((p) => [p.moduleId, p]));
  const groups = groupByLevel(allModules);

  function handleModuleClick(module: Module) {
    const status = getModuleStatus(module.id, allModules, progressMap);

    if (status === 'passed') {
      navigate(`/study/${module.id}/exercises?mode=review`);
    } else if (status === 'available' || status === 'in_progress') {
      navigate(`/study/${module.id}/intro`);
    } else {
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
        {groups.map((group) => (
          <div key={group.level} className="mb-8">
            {/* iOS section header */}
            <p
              className="mb-2 px-4 text-[13px] font-normal uppercase tracking-wide"
              style={{ color: 'var(--ios-secondary-label)' }}
            >
              {group.level}
            </p>

            {/* White card with grouped list cells */}
            <div
              className="rounded-[10px] overflow-hidden"
              style={{ background: 'var(--ios-bg-grouped-secondary)' }}
            >
              {group.modules.map((module) => {
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
          </div>
        ))}

        {/* Goal indicator */}
        <p
          className="mt-4 mb-8 text-center text-[15px]"
          style={{ color: 'var(--ios-secondary-label)' }}
        >
          Goal: Read Manga
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
