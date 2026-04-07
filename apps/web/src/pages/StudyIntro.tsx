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

  // Estimate time: ~1 min per item, minimum 5
  const estimatedMinutes = Math.max(5, Math.round(module.items.length * 1));

  // Get up to 3 preview items for display
  const previewItems = module.items.slice(0, 3).map((item: unknown) => {
    const obj = item as Record<string, string>;
    return obj.character ?? obj.kanji ?? obj.word ?? obj.id ?? '';
  });

  return (
    <>
      <TopBar onBack={() => navigate('/')} title="Keiro" rightAction={
        <span
          className="text-sm font-medium px-3 py-1 rounded-full"
          style={{ background: 'var(--k-secondary-container)', color: 'var(--k-on-secondary-container)' }}
        >
          {module.items.length} items
        </span>
      } />

      <main className="flex-grow pt-24 pb-32 px-6 max-w-2xl mx-auto w-full">
        {/* Hero */}
        <section className="mb-12">
          <div className="mb-8">
            <span
              className="text-sm uppercase tracking-widest mb-2 block"
              style={{ color: 'var(--k-secondary)' }}
            >
              Module Overview
            </span>
            <h1
              className="font-headline text-4xl font-black tracking-tighter leading-tight"
              style={{ color: 'var(--k-primary)' }}
            >
              {module.intro.title}
            </h1>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-6 gap-4">
            {/* Main Card */}
            <div
              className="col-span-4 rounded-xl p-8 flex flex-col justify-between min-h-[240px]"
              style={{ background: 'var(--k-surface-container-lowest)' }}
            >
              <div>
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-6"
                  style={{ background: 'color-mix(in srgb, var(--k-primary-container) 10%, transparent)' }}
                >
                  <span className="material-symbols-outlined" style={{ color: 'var(--k-primary)' }}>{icon}</span>
                </div>
                <p className="text-lg leading-relaxed" style={{ color: 'var(--k-on-surface-variant)' }}>
                  {module.intro.explanation}
                </p>
              </div>
              <div className="flex gap-3 mt-6">
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
                  {levelLabel} LEVEL
                </span>
              </div>
            </div>

            {/* Visual Detail Card */}
            <div
              className="col-span-2 rounded-xl overflow-hidden relative min-h-[200px] flex flex-col justify-end p-6"
              style={{ background: 'var(--k-primary-container)' }}
            >
              {previewItems[0] && (
                <span
                  className="font-headline text-6xl font-black opacity-30"
                  style={{ color: 'var(--k-on-primary-container)' }}
                >
                  {previewItems[0]}
                </span>
              )}
              <span
                className="text-xs font-bold tracking-widest mt-2 uppercase"
                style={{ color: 'var(--k-on-primary)' }}
              >
                Lesson Focus
              </span>
            </div>

            {/* Culture Note */}
            {module.intro.cultureNote && (
              <div
                className="col-span-6 rounded-xl p-8 flex items-start gap-6"
                style={{ background: 'color-mix(in srgb, var(--k-tertiary-fixed-dim) 30%, transparent)' }}
              >
                <span className="material-symbols-outlined text-3xl shrink-0" style={{ color: 'var(--k-tertiary)' }}>
                  lightbulb
                </span>
                <div>
                  <h3 className="font-bold mb-2" style={{ color: 'var(--k-tertiary)' }}>Culture Note</h3>
                  <p className="leading-relaxed text-sm" style={{ color: 'var(--k-on-surface-variant)' }}>
                    {module.intro.cultureNote}
                  </p>
                </div>
              </div>
            )}

            {/* Preview Characters */}
            {previewItems.length > 0 && (
              <div
                className="col-span-3 rounded-xl p-6"
                style={{ background: 'var(--k-surface-container-low)' }}
              >
                <h4
                  className="text-xs font-bold uppercase mb-4 tracking-tighter"
                  style={{ color: 'var(--k-secondary)' }}
                >
                  Preview Characters
                </h4>
                <div className="flex gap-4">
                  {previewItems.map((item, i) => (
                    <div
                      key={i}
                      className="w-12 h-12 rounded-lg flex items-center justify-center font-headline text-2xl"
                      style={{ background: 'var(--k-surface-container-lowest)', color: 'var(--k-primary)' }}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Time Estimate */}
            <div
              className="col-span-3 rounded-xl p-6 flex items-center justify-between"
              style={{ background: 'var(--k-surface-container-low)' }}
            >
              <div>
                <h4 className="text-xs font-bold uppercase tracking-tighter" style={{ color: 'var(--k-secondary)' }}>
                  Estimated Time
                </h4>
                <p className="text-xl font-bold" style={{ color: 'var(--k-primary)' }}>
                  {estimatedMinutes} Minutes
                </p>
              </div>
              <span className="material-symbols-outlined text-4xl opacity-30" style={{ color: 'var(--k-secondary)' }}>
                schedule
              </span>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="flex flex-col items-center gap-6">
          <button
            onClick={() => navigate(`/study/${moduleId}/exercises`)}
            className="w-full max-w-sm h-14 bg-silk-gradient rounded-full flex items-center justify-center gap-3 active:scale-95 transition-all shadow-lg"
          >
            <span className="text-white font-bold tracking-wide">Begin Lesson</span>
            <span className="material-symbols-outlined text-white text-xl">arrow_forward</span>
          </button>
        </div>
      </main>
    </>
  );
}
