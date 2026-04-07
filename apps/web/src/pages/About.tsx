import { useNavigate, Link } from 'react-router';
import { TopBar } from '../components/layout/TopBar';

const contentSources = [
  {
    name: 'Vocabulary data',
    source: 'open-anki-jlpt-decks',
    license: 'MIT License',
    url: 'https://github.com/jamsinclair/open-anki-jlpt-decks',
  },
  {
    name: 'Kanji data',
    source: 'kanji-data by David Gouveia',
    license: 'MIT License',
    url: 'https://github.com/davidluzgouveia/kanji-data',
  },
  {
    name: 'Grammar data',
    source: 'hanabira.org',
    license: 'CC Attribution',
    url: 'https://github.com/tristcoil/hanabira.org-japanese-content',
  },
  {
    name: 'Kanji details',
    source: 'KANJIDIC2 (EDRDG)',
    license: 'CC BY-SA 4.0',
    url: 'https://www.edrdg.org/wiki/index.php/KANJIDIC_Project',
  },
  {
    name: 'Kana data',
    source: 'Japanese-JSON by merwan7',
    license: 'MIT License',
    url: 'https://github.com/merwan7/Japanese-JSON',
  },
];

export function About() {
  const navigate = useNavigate();

  return (
    <>
      <TopBar title="About" onBack={() => navigate('/settings')} />

      <main className="pb-12 animate-fadeIn">
        {/* Editorial hero */}
        <div
          className="px-6 pt-8 pb-10 relative overflow-hidden"
          style={{ background: 'var(--k-surface-container-lowest)' }}
        >
          {/* Decorative kanji watermark */}
          <span
            className="font-headline absolute right-4 top-2 text-[120px] leading-none select-none pointer-events-none"
            style={{ color: 'var(--k-outline-variant)', opacity: 0.35 }}
            aria-hidden="true"
          >
            経
          </span>
          <p
            className="text-xs uppercase tracking-widest font-medium mb-2"
            style={{ color: 'var(--k-secondary)' }}
          >
            Keiro · 経路
          </p>
          <h1
            className="font-headline text-3xl leading-snug"
            style={{ color: 'var(--k-on-surface)' }}
          >
            The Mindful Scholar
          </h1>
          <p
            className="mt-3 text-sm leading-relaxed max-w-xs"
            style={{ color: 'var(--k-secondary)' }}
          >
            Keiro (経路, "the path") guides you from zero Japanese to reading manga — one mindful step at a time.
          </p>
          <p
            className="mt-2 text-xs"
            style={{ color: 'var(--k-outline)' }}
          >
            Version 1.0.0
          </p>
        </div>

        {/* Bento grid */}
        <div className="px-6 pt-6 grid grid-cols-1 gap-4">

          {/* Sources card */}
          <div
            className="rounded-xl p-5"
            style={{ background: 'var(--k-surface-container-lowest)' }}
          >
            <h2
              className="font-headline text-lg mb-4"
              style={{ color: 'var(--k-on-surface)' }}
            >
              出典 <span className="text-sm font-body font-normal" style={{ color: 'var(--k-secondary)' }}>Sources</span>
            </h2>
            <ul className="space-y-3">
              {contentSources.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 active:opacity-60 group"
                  >
                    <span
                      className="material-symbols-outlined text-[18px] mt-0.5 shrink-0"
                      style={{ color: 'var(--k-primary)', fontSize: '18px' }}
                    >
                      link
                    </span>
                    <div className="min-w-0">
                      <p
                        className="text-sm font-medium group-hover:underline"
                        style={{ color: 'var(--k-on-surface)' }}
                      >
                        {item.name}
                      </p>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: 'var(--k-secondary)' }}
                      >
                        {item.source} · {item.license}
                      </p>
                    </div>
                    <span
                      className="material-symbols-outlined text-[16px] shrink-0 ml-auto"
                      style={{ color: 'var(--k-outline)', fontSize: '16px' }}
                    >
                      open_in_new
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Two-column row: Legal + Design Philosophy */}
          <div className="grid grid-cols-2 gap-4">
            {/* Legal card */}
            <div
              className="rounded-xl p-5"
              style={{ background: 'var(--k-surface-container-lowest)' }}
            >
              <h2
                className="font-headline text-base mb-3"
                style={{ color: 'var(--k-on-surface)' }}
              >
                法的 <span className="block text-xs font-body font-normal mt-0.5" style={{ color: 'var(--k-secondary)' }}>Legal</span>
              </h2>
              <Link
                to="/privacy"
                className="flex items-center gap-2 active:opacity-60"
              >
                <span
                  className="material-symbols-outlined text-[18px]"
                  style={{ color: 'var(--k-primary)', fontSize: '18px' }}
                >
                  shield
                </span>
                <span
                  className="text-sm"
                  style={{ color: 'var(--k-on-surface)' }}
                >
                  Privacy Policy
                </span>
                <span
                  className="material-symbols-outlined text-[16px] ml-auto"
                  style={{ color: 'var(--k-outline)', fontSize: '16px' }}
                >
                  chevron_right
                </span>
              </Link>
            </div>

            {/* Design Philosophy card */}
            <div
              className="rounded-xl p-5"
              style={{ background: 'var(--k-tertiary-container)' }}
            >
              <h2
                className="font-headline text-base mb-2"
                style={{ color: 'var(--k-tertiary-fixed-dim)' }}
              >
                哲学
              </h2>
              <p
                className="text-xs leading-relaxed"
                style={{ color: 'var(--k-tertiary-fixed-dim)' }}
              >
                Digital Karesansui — a zen garden of deliberate simplicity.
              </p>
            </div>
          </div>

          {/* Acknowledgements card */}
          <div
            className="rounded-xl p-5"
            style={{ background: 'var(--k-surface-container-lowest)' }}
          >
            <h2
              className="font-headline text-lg mb-3"
              style={{ color: 'var(--k-on-surface)' }}
            >
              謝辞 <span className="text-sm font-body font-normal" style={{ color: 'var(--k-secondary)' }}>Acknowledgements</span>
            </h2>
            <p
              className="text-sm leading-relaxed"
              style={{ color: 'var(--k-secondary)' }}
            >
              Built with gratitude for the open-source community, the scholars who compiled these linguistic datasets, and every learner walking the path.
            </p>
          </div>
        </div>

        {/* System status footer */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between">
          <p
            className="text-xs"
            style={{ color: 'var(--k-outline)' }}
          >
            Keiro (経路) — Learn Japanese
          </p>
          <span
            className="flex items-center gap-1.5 text-xs"
            style={{ color: 'var(--k-correct-secondary)' }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: 'var(--k-correct-secondary)' }}
            />
            All systems nominal
          </span>
        </div>
      </main>
    </>
  );
}
