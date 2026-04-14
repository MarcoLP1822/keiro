import { useParams, useNavigate } from 'react-router';
import { getModuleById } from '@keiro/content';
import { TopBar } from '../components/layout/TopBar';

const TYPE_ICONS: Record<string, string> = {
  kana: 'language_japanese_kana',
  vocabulary: 'translate',
  kanji: 'edit_note',
  grammar: 'menu_book',
  reading: 'auto_stories',
};

export function StudyIntro() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const module = moduleId ? getModuleById(moduleId) : undefined;

  if (!module) {
    return (
      <>
        <TopBar onBack={() => navigate('/')} title="Not Found" />
        <main className="pt-24 px-6 max-w-2xl mx-auto">
          <p className="text-center text-sm mt-12" style={{ color: 'var(--k-secondary)' }}>
            Module not found.
          </p>
        </main>
      </>
    );
  }

  const typeLabel = module.type.charAt(0).toUpperCase() + module.type.slice(1);
  const levelLabel = (module.level ?? 'beginner').toUpperCase();
  const icon = TYPE_ICONS[module.type] ?? 'school';

  const itemCount = module.theme
    ? (module.vocab?.length ?? 0) + (module.grammar?.length ?? 0)
    : module.items.length;
  const estimatedMinutes = Math.max(5, Math.round(itemCount * 1));



  return (
    <>
      <TopBar onBack={() => navigate('/')} rightAction={
        <span
          className="text-sm font-medium px-3 py-1 rounded-full"
          style={{ background: 'var(--k-secondary-container)', color: 'var(--k-on-secondary-container)' }}
        >
          {itemCount} items
        </span>
      } />

      <main className="pt-20 pb-32 px-6 max-w-2xl mx-auto space-y-4">
        {/* Title */}
        <div>
          <h1
            className="font-headline text-3xl font-bold"
            style={{ color: 'var(--k-primary)' }}
          >
            {module.intro.title}
          </h1>
          <div className="flex gap-2 mt-3">
            <span
              className="px-3 py-1 rounded-md text-[11px] font-bold"
              style={{ background: 'var(--k-surface-container)', color: 'var(--k-secondary)' }}
            >
              {typeLabel.toUpperCase()}
            </span>
            <span
              className="px-3 py-1 rounded-md text-[11px] font-bold"
              style={{ background: 'var(--k-surface-container)', color: 'var(--k-secondary)' }}
            >
              {levelLabel}
            </span>
            <span
              className="px-3 py-1 rounded-md text-[11px] font-bold"
              style={{ background: 'var(--k-surface-container)', color: 'var(--k-secondary)' }}
            >
              ~{estimatedMinutes} MIN
            </span>
          </div>
        </div>

        {/* Explanation */}
        <div
          className="rounded-xl p-4"
          style={{ background: 'var(--k-surface-container-lowest)' }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'color-mix(in srgb, var(--k-primary-container) 15%, transparent)' }}
            >
              <span className="material-symbols-outlined" style={{ color: 'var(--k-primary)' }}>{icon}</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--k-on-surface-variant)' }}>
              {module.intro.explanation}
            </p>
          </div>
        </div>

        {/* Culture Note */}
        {module.intro.cultureNote && (
          <div
            className="rounded-xl p-4 flex items-start gap-3"
            style={{ background: 'color-mix(in srgb, var(--k-tertiary-fixed-dim) 30%, transparent)' }}
          >
            <span className="material-symbols-outlined shrink-0" style={{ color: 'var(--k-tertiary)' }}>
              lightbulb
            </span>
            <div>
              <h3 className="text-sm font-bold mb-1" style={{ color: 'var(--k-tertiary)' }}>Culture Note</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--k-on-surface-variant)' }}>
                {module.intro.cultureNote}
              </p>
            </div>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={() => navigate(`/study/${moduleId}/exercises`)}
          className="w-full h-14 bg-silk-gradient rounded-full flex items-center justify-center gap-3 active:scale-95 transition-all shadow-lg"
        >
          <span className="text-white font-bold tracking-wide">Begin Lesson</span>
          <span className="material-symbols-outlined text-white text-xl">arrow_forward</span>
        </button>
      </main>
    </>
  );
}
