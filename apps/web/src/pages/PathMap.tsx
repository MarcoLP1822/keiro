import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { getAllModules } from '@keiro/content';
import { getModuleStatus, getCurrentModule } from '@keiro/engine';
import type { Module, ModuleProgress } from '@keiro/types';
import { TopBar } from '../components/layout/TopBar';
import { PageContainer } from '../components/layout/PageContainer';
import { Modal } from '../components/common/Modal';
import { ModuleCard } from '../components/module/ModuleCard';
import { useProgress } from '../hooks/useProgress';

// Ordered level display names
const LEVEL_ORDER = ['beginner', 'n5', 'n4', 'n3'];
const LEVEL_LABELS: Record<string, string> = {
  beginner: 'BEGINNER',
  n5: 'N5',
  n4: 'N4',
  n3: 'N3',
};

// Ordered type display names within a level
const TYPE_ORDER = ['hiragana', 'katakana', 'vocabulary', 'kanji', 'grammar', 'reading'];
const TYPE_LABELS: Record<string, string> = {
  hiragana: 'Hiragana',
  katakana: 'Katakana',
  vocabulary: 'Vocabulary',
  kanji: 'Kanji',
  grammar: 'Grammar',
  reading: 'Reading',
};

interface TypeSection {
  sectionId: string; // e.g. "n5-vocabulary"
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
    // Split kana into hiragana/katakana based on module id
    if (type === 'kana') {
      type = mod.id.startsWith('katakana') ? 'katakana' : 'hiragana';
    }
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
      sections.push({
        sectionId: `${level}-${type}`,
        level,
        type,
        label: TYPE_LABELS[type] ?? type,
        modules: mods,
      });
    }

    if (sections.length > 0) {
      groups.push({ level, label: LEVEL_LABELS[level] ?? level.toUpperCase(), sections });
    }
  }

  return groups;
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className="h-4 w-4 shrink-0 transition-transform duration-[350ms] ease-[cubic-bezier(0.25,0.1,0.25,1)]"
      style={{
        transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
        color: 'var(--ios-gray3)',
      }}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}

interface SectionPanelProps {
  section: TypeSection;
  isOpen: boolean;
  onToggle: () => void;
  allModules: Module[];
  progressMap: Map<string, ModuleProgress>;
  onModuleClick: (module: Module) => void;
  getProgress: (id: string) => ModuleProgress | undefined;
}

function SectionPanel({
  section,
  isOpen,
  onToggle,
  allModules,
  progressMap,
  onModuleClick,
  getProgress,
}: SectionPanelProps) {
  const passedCount = section.modules.filter(
    (m) => getModuleStatus(m.id, allModules, progressMap) === 'passed'
  ).length;
  const totalCount = section.modules.length;
  const allPassed = passedCount === totalCount;

  return (
    <div
      className="overflow-hidden rounded-[10px]"
      style={{ background: 'var(--ios-bg-grouped-secondary)' }}
    >
      {/* Section header — tap to toggle */}
      <button
        onClick={onToggle}
        className="flex w-full min-h-[44px] items-center px-4 py-3 text-left active:bg-black/5"
        aria-expanded={isOpen}
        aria-label={`${section.label}, ${totalCount} modules, ${passedCount} passed`}
      >
        <ChevronIcon open={isOpen} />

        <div className="ml-3 flex-1 min-w-0">
          <span
            className="text-[17px] font-medium"
            style={{ color: 'var(--ios-label)' }}
          >
            {section.label}
          </span>
          <span
            className="ml-1.5 text-[15px]"
            style={{ color: 'var(--ios-secondary-label)' }}
          >
            ({totalCount})
          </span>
        </div>

        <div className="ml-2 shrink-0 flex items-center gap-1.5">
          {allPassed ? (
            <span
              className="text-[17px] font-semibold"
              style={{ color: 'var(--ios-green)' }}
              aria-label="All passed"
            >
              ✓
            </span>
          ) : (
            <span
              className="text-[15px]"
              style={{ color: 'var(--ios-secondary-label)' }}
            >
              {passedCount}/{totalCount}
            </span>
          )}
        </div>
      </button>

      {/* Animated module list */}
      <div
        style={{
          display: 'grid',
          gridTemplateRows: isOpen ? '1fr' : '0fr',
          transition: 'grid-template-rows 350ms cubic-bezier(0.25, 0.1, 0.25, 1)',
        }}
      >
        <div className="overflow-hidden">
          <div
            className="h-px"
            style={{ background: 'var(--ios-separator)' }}
          />
          {section.modules.map((module) => {
            const status = getModuleStatus(module.id, allModules, progressMap);
            const progress = getProgress(module.id);
            return (
              <ModuleCard
                key={module.id}
                module={module}
                status={status}
                score={progress?.score}
                onClick={() => onModuleClick(module)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function PathMap() {
  const navigate = useNavigate();
  const { allProgress, getProgress } = useProgress();
  const [testOutModule, setTestOutModule] = useState<Module | null>(null);

  const allModules = useMemo(
    () => getAllModules().sort((a, b) => a.order - b.order),
    [],
  );
  const progressMap = useMemo(
    () => new Map(allProgress.map((p) => [p.moduleId, p])),
    [allProgress],
  );

  const groups = useMemo(() => buildGroups(allModules), [allModules]);

  // Find which section contains the current (first non-passed available) module
  const currentModule = useMemo(
    () => getCurrentModule(allModules, progressMap),
    [allModules, progressMap],
  );

  const defaultExpandedSectionId = useMemo(() => {
    if (!currentModule) return null;
    let type: string = currentModule.type;
    if (type === 'kana') {
      type = currentModule.id.startsWith('katakana') ? 'katakana' : 'hiragana';
    }
    return `${currentModule.level ?? 'beginner'}-${type}`;
  }, [currentModule]);

  // Build initial expanded state: expand section with current module, auto-collapse all-passed sections
  const initialExpanded = useMemo<Set<string>>(() => {
    const expanded = new Set<string>();
    for (const group of groups) {
      for (const section of group.sections) {
        const allPassed = section.modules.every(
          (m) => getModuleStatus(m.id, allModules, progressMap) === 'passed'
        );
        // Expand if: it has the current module, or it's not fully passed
        if (section.sectionId === defaultExpandedSectionId) {
          expanded.add(section.sectionId);
        } else if (!allPassed) {
          // Don't auto-expand everything — only expand the current section
        }
      }
    }
    // If nothing expanded (e.g. first launch), expand the first section
    if (expanded.size === 0 && groups.length > 0 && groups[0].sections.length > 0) {
      expanded.add(groups[0].sections[0].sectionId);
    }
    return expanded;
  }, [groups, defaultExpandedSectionId, allModules, progressMap]);

  const [expandedSections, setExpandedSections] = useState<Set<string>>(initialExpanded);

  function toggleSection(sectionId: string) {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  }

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
            {/* Level header — uppercase, secondary label color, sticky */}
            <p
              className="sticky top-[44px] z-10 mb-2 px-4 py-1 text-[13px] font-normal uppercase tracking-wide"
              style={{
                color: 'var(--ios-secondary-label)',
                background: 'var(--ios-bg-grouped)',
              }}
            >
              {group.label}
            </p>

            {/* Type sections */}
            <div className="space-y-3">
              {group.sections.map((section) => (
                <SectionPanel
                  key={section.sectionId}
                  section={section}
                  isOpen={expandedSections.has(section.sectionId)}
                  onToggle={() => toggleSection(section.sectionId)}
                  allModules={allModules}
                  progressMap={progressMap}
                  onModuleClick={handleModuleClick}
                  getProgress={getProgress}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Goal indicator */}
        <p
          className="mt-4 mb-8 text-center text-[15px]"
          style={{ color: 'var(--ios-secondary-label)' }}
        >
          🎯 Goal: Read Manga
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
