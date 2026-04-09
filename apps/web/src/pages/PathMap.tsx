import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { getAllModules } from '@keiro/content';
import { getModuleStatus, getCurrentModule } from '@keiro/engine';
import type { Module, ModuleProgress } from '@keiro/types';
import { BottomNav } from '../components/layout/BottomNav';
import { PageHeader } from '../components/layout/PageHeader';
import { Modal } from '../components/common/Modal';
import { ProgressBar } from '../components/common/ProgressBar';
import { ModuleCard } from '../components/module/ModuleCard';
import { useProgress } from '../hooks/useProgress';

const LEVEL_ORDER = ['beginner', 'n5', 'n4', 'n3'];
const LEVEL_LABELS: Record<string, string> = {
  beginner: 'The Basics',
  n5: 'Foundations',
  n4: 'Building Blocks',
  n3: 'Intermediate',
};
const LEVEL_ICONS: Record<string, string> = {
  beginner: 'language_japanese_kana',
  n5: 'auto_stories',
  n4: 'menu_book',
  n3: 'school',
};

const TYPE_ORDER = ['thematic', 'hiragana', 'katakana', 'vocabulary', 'kanji', 'grammar', 'reading'];
const TYPE_LABELS: Record<string, string> = {
  hiragana: 'Hiragana', katakana: 'Katakana', vocabulary: 'Vocabulary',
  kanji: 'Kanji', grammar: 'Grammar', reading: 'Reading', thematic: 'Theme',
};

interface TypeSection {
  sectionId: string;
  level: string;
  type: string;
  label: string;
  modules: Module[];
}

interface LevelGroup {
  level: string;
  label: string;
  sections: TypeSection[];
}

function buildGroups(modules: Module[]): LevelGroup[] {
  const levelMap = new Map<string, Map<string, Module[]>>();
  for (const mod of modules) {
    const level = mod.level ?? 'beginner';
    let type: string = mod.type ?? 'vocabulary';
    if (type === 'kana') type = mod.id.startsWith('katakana') ? 'katakana' : 'hiragana';
    if (!levelMap.has(level)) levelMap.set(level, new Map());
    const typeMap = levelMap.get(level)!;
    if (!typeMap.has(type)) typeMap.set(type, []);
    typeMap.get(type)!.push(mod);
  }

  const groups: LevelGroup[] = [];
  for (const level of LEVEL_ORDER) {
    const typeMap = levelMap.get(level);
    if (!typeMap) continue;
    const sections: TypeSection[] = [];
    for (const type of TYPE_ORDER) {
      const mods = typeMap.get(type);
      if (!mods || mods.length === 0) continue;
      sections.push({ sectionId: `${level}-${type}`, level, type, label: TYPE_LABELS[type] ?? type, modules: mods });
    }
    if (sections.length > 0) {
      groups.push({ level, label: LEVEL_LABELS[level] ?? level.toUpperCase(), sections });
    }
  }
  return groups;
}

type LevelStatus = 'completed' | 'active' | 'locked';

function getLevelStatus(
  group: LevelGroup,
  allModules: Module[],
  progressMap: Map<string, ModuleProgress>,
): LevelStatus {
  const allMods = group.sections.flatMap((s) => s.modules);
  const allPassed = allMods.every((m) => getModuleStatus(m.id, allModules, progressMap) === 'passed');
  if (allPassed) return 'completed';
  const anyStarted = allMods.some((m) => {
    const s = getModuleStatus(m.id, allModules, progressMap);
    return s === 'in_progress' || s === 'available' || s === 'passed';
  });
  return anyStarted ? 'active' : 'locked';
}

function getLevelPercent(
  group: LevelGroup,
  allModules: Module[],
  progressMap: Map<string, ModuleProgress>,
): number {
  const allMods = group.sections.flatMap((s) => s.modules);
  const passed = allMods.filter((m) => getModuleStatus(m.id, allModules, progressMap) === 'passed').length;
  return allMods.length > 0 ? Math.round((passed / allMods.length) * 100) : 0;
}

interface SectionPanelProps {
  section: TypeSection;
  isOpen: boolean;
  onToggle: () => void;
  allModules: Module[];
  progressMap: Map<string, ModuleProgress>;
}

function SectionPanel({
  section, isOpen, onToggle, allModules, progressMap,
}: SectionPanelProps) {
  const passedCount = section.modules.filter(
    (m) => getModuleStatus(m.id, allModules, progressMap) === 'passed'
  ).length;
  const totalCount = section.modules.length;

  return (
    <div
      className="flex items-center justify-between p-3 rounded-lg active:opacity-80 transition-opacity cursor-pointer"
      style={{ background: 'var(--k-surface-container-low)' }}
      onClick={onToggle}
      role="button"
      aria-expanded={isOpen}
    >
      <div className="flex items-center gap-3">
        <span
          className="material-symbols-outlined text-xl"
          style={{ color: passedCount === totalCount ? 'var(--k-correct-secondary)' : 'var(--k-primary)' }}
        >
          {passedCount === totalCount ? 'check_circle' : 'radio_button_checked'}
        </span>
        <span className="text-sm font-medium" style={{ color: 'var(--k-on-surface)' }}>
          {section.label}
        </span>
      </div>
      <span
        className="text-[10px] font-bold"
        style={{ color: 'var(--k-secondary)' }}
      >
        {passedCount}/{totalCount}
      </span>
    </div>
  );
}

export function PathMap() {
  const navigate = useNavigate();
  const { allProgress, getProgress } = useProgress();
  const [testOutModule, setTestOutModule] = useState<Module | null>(null);
  const [expandedLevel, setExpandedLevel] = useState<string | null>(null);

  const allModules = useMemo(
    () => getAllModules().sort((a, b) => a.order - b.order),
    [],
  );
  const progressMap = useMemo(
    () => new Map(allProgress.map((p) => [p.moduleId, p])),
    [allProgress],
  );
  const groups = useMemo(() => buildGroups(allModules), [allModules]);

  const currentModule = useMemo(
    () => getCurrentModule(allModules, progressMap),
    [allModules, progressMap],
  );

  // Auto-expand the active level
  const activeLevelId = useMemo(() => {
    for (const g of groups) {
      if (getLevelStatus(g, allModules, progressMap) === 'active') return g.level;
    }
    return groups[0]?.level ?? null;
  }, [groups, allModules, progressMap]);

  const prevActiveLevel = useRef<string | null>(null);
  useEffect(() => {
    if (activeLevelId && activeLevelId !== prevActiveLevel.current) {
      prevActiveLevel.current = activeLevelId;
      setExpandedLevel(activeLevelId);
    }
  }, [activeLevelId]);

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
      <main className="pt-8 pb-32 px-6 max-w-2xl mx-auto min-h-screen overflow-x-hidden">
        <PageHeader titleJp="学習の道" subtitle="Learning Path" />

        {/* Vertical Timeline */}
        <div className="relative">
          {/* Dashed line */}
          <div
            className="absolute left-[23px] top-6 bottom-6 w-[2px] opacity-30"
            style={{
              backgroundImage: 'linear-gradient(to bottom, var(--k-secondary) 33%, transparent 0%)',
              backgroundSize: '2px 12px',
              backgroundRepeat: 'repeat-y',
            }}
          />

          {groups.map((group) => {
            const status = getLevelStatus(group, allModules, progressMap);
            const percent = getLevelPercent(group, allModules, progressMap);
            const isExpanded = expandedLevel === group.level;
            const isLocked = status === 'locked';

            return (
              <section
                key={group.level}
                className={`relative mb-8 ${isLocked ? 'opacity-60 grayscale' : ''}`}
              >
                <div className="flex gap-3">
                  {/* Node */}
                  <div className="relative z-10 shrink-0">
                    {status === 'completed' ? (
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                        style={{ background: 'var(--k-primary)', color: 'var(--k-on-primary)' }}
                      >
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                          check_circle
                        </span>
                      </div>
                    ) : status === 'active' ? (
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center shadow-sm"
                        style={{
                          background: 'var(--k-surface-container-lowest)',
                          border: '4px solid var(--k-primary)',
                          color: 'var(--k-primary)',
                        }}
                      >
                        <span className="material-symbols-outlined">
                          {LEVEL_ICONS[group.level] ?? 'school'}
                        </span>
                      </div>
                    ) : (
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ background: 'var(--k-surface-container-high)', color: 'var(--k-secondary)' }}
                      >
                        <span className="material-symbols-outlined">lock</span>
                      </div>
                    )}
                  </div>

                  {/* Card */}
                  <div
                    className="flex-1 min-w-0 rounded-xl p-4 transition-shadow"
                    style={{
                      background: 'var(--k-surface-container-lowest)',
                      borderLeft: status === 'active' ? '4px solid var(--k-primary)' : undefined,
                      border: status !== 'active'
                        ? '1px solid color-mix(in srgb, var(--k-outline-variant) 10%, transparent)'
                        : undefined,
                      boxShadow: status === 'active'
                        ? '0 8px 30px rgba(0,0,0,0.04)'
                        : undefined,
                    }}
                  >
                    <button
                      className="w-full text-left"
                      onClick={() => setExpandedLevel(isExpanded ? null : group.level)}
                      aria-expanded={isExpanded}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span
                            className="text-xs font-bold uppercase tracking-tighter mb-1 block"
                            style={{ color: status === 'active' ? 'var(--k-primary)' : 'var(--k-secondary)' }}
                          >
                            {group.level === 'beginner' ? 'Level 1' : `Level ${LEVEL_ORDER.indexOf(group.level) + 1}`}
                            {status === 'active' && ' — Active'}
                          </span>
                          <h3 className="font-headline text-xl" style={{ color: isLocked ? 'var(--k-secondary)' : 'var(--k-primary)' }}>
                            {group.label}
                          </h3>
                        </div>
                        <span className="material-symbols-outlined" style={{ color: isLocked ? 'var(--k-secondary)' : 'var(--k-primary)' }}>
                          {isLocked ? 'lock' : isExpanded ? 'expand_less' : 'expand_more'}
                        </span>
                      </div>
                    </button>

                    {/* Type chips */}
                    {!isLocked && (
                      <div className="flex gap-2 flex-wrap mb-4">
                        {group.sections.map((s) => {
                          const isThematicSection = s.type === 'thematic';
                          // Thematic sections show the theme title (e.g., "自己紹介 — Self-Introduction")
                          // rather than the generic type label
                          const chipLabel = isThematicSection
                            ? (s.modules[0]?.intro?.title ?? s.label)
                            : s.label.toUpperCase();
                          return (
                            <span
                              key={s.sectionId}
                              className="px-3 py-1 text-[11px] font-bold rounded-md"
                              style={{
                                background: 'var(--k-secondary-container)',
                                color: 'var(--k-on-secondary-container)',
                              }}
                            >
                              {chipLabel}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* Expanded: module list */}
                    {isExpanded && !isLocked && (
                      <div className="space-y-3 mb-6">
                        {group.sections.map((section) => (
                          <div key={section.sectionId}>
                            <SectionPanel
                              section={section}
                              isOpen={false}
                              onToggle={() => {}}
                              allModules={allModules}
                              progressMap={progressMap}
                            />
                            {/* Module cards under each section */}
                            <div className="mt-1 space-y-1">
                              {section.modules.map((module) => {
                                const moduleStatus = getModuleStatus(module.id, allModules, progressMap);
                                const progress = getProgress(module.id);
                                return (
                                  <ModuleCard
                                    key={module.id}
                                    module={module}
                                    status={moduleStatus}
                                    score={progress?.score}
                                    onClick={() => handleModuleClick(module)}
                                  />
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Progress bar */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <ProgressBar value={percent} />
                      </div>
                      <span
                        className="text-[11px] font-bold"
                        style={{ color: isLocked ? 'var(--k-secondary)' : 'var(--k-primary)' }}
                      >
                        {isLocked ? 'Locked' : `${percent}%`}
                      </span>
                    </div>

                    {/* Continue button for active level */}
                    {status === 'active' && currentModule && isExpanded && (
                      <button
                        onClick={() => navigate(`/study/${currentModule.id}/intro`)}
                        className="mt-6 w-full py-3 rounded-full bg-silk-gradient text-white font-bold text-sm tracking-wide active:scale-95 transition-transform"
                      >
                        CONTINUE PATH
                      </button>
                    )}
                  </div>
                </div>
              </section>
            );
          })}

        </div>
      </main>

      <BottomNav />

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
