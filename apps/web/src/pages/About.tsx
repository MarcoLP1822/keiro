import { useNavigate, Link } from 'react-router';
import { PageContainer } from '../components/layout/PageContainer';
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
      <PageContainer>
        {/* App identity card */}
        <div
          className="rounded-[14px] px-4 py-8 mb-8 flex flex-col items-center text-center"
          style={{ background: 'var(--ios-bg-grouped-secondary)' }}
        >
          <span
            className="text-[72px] leading-none mb-3"
            style={{ color: 'var(--ios-tertiary-label)' }}
            aria-hidden="true"
          >
            経
          </span>
          <p className="text-[22px] font-bold" style={{ color: 'var(--ios-label)' }}>
            Keiro
          </p>
          <p className="text-[15px] mt-1" style={{ color: 'var(--ios-secondary-label)' }}>
            Learn Japanese
          </p>
          <p className="text-[13px] mt-1" style={{ color: 'var(--ios-tertiary-label)' }}>
            Version 1.0.0
          </p>
        </div>

        {/* About section */}
        <p
          className="mb-2 px-4 text-[13px] font-normal uppercase tracking-wide"
          style={{ color: 'var(--ios-secondary-label)' }}
        >
          About
        </p>
        <div
          className="rounded-[10px] px-4 py-[11px]"
          style={{ background: 'var(--ios-bg-grouped-secondary)' }}
        >
          <p className="text-[17px] leading-relaxed" style={{ color: 'var(--ios-label)' }}>
            Keiro (経路, "the path") is a structured learning app that guides you from zero Japanese to reading manga.
          </p>
        </div>

        {/* Content Sources section */}
        <p
          className="mt-8 mb-2 px-4 text-[13px] font-normal uppercase tracking-wide"
          style={{ color: 'var(--ios-secondary-label)' }}
        >
          Content Sources
        </p>
        <div
          className="rounded-[10px] overflow-hidden"
          style={{ background: 'var(--ios-bg-grouped-secondary)' }}
        >
          {contentSources.map((item, i, arr) => (
            <a
              key={item.name}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-[11px] min-h-[44px] active:opacity-60"
              style={{
                borderBottom: i < arr.length - 1 ? '0.5px solid var(--ios-separator)' : 'none',
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[17px]" style={{ color: 'var(--ios-label)' }}>
                    {item.name}
                  </p>
                  <p className="text-[13px] mt-0.5" style={{ color: 'var(--ios-secondary-label)' }}>
                    {item.source} · {item.license}
                  </p>
                </div>
                <span className="text-[17px]" style={{ color: 'var(--ios-tertiary-label)' }}>
                  ›
                </span>
              </div>
            </a>
          ))}
        </div>

        {/* Legal section */}
        <p
          className="mt-8 mb-2 px-4 text-[13px] font-normal uppercase tracking-wide"
          style={{ color: 'var(--ios-secondary-label)' }}
        >
          Legal
        </p>
        <div
          className="rounded-[10px] overflow-hidden"
          style={{ background: 'var(--ios-bg-grouped-secondary)' }}
        >
          <Link
            to="/privacy"
            className="block px-4 py-[11px] min-h-[44px] active:opacity-60"
          >
            <div className="flex items-center justify-between">
              <p className="text-[17px]" style={{ color: 'var(--ios-label)' }}>
                Privacy Policy
              </p>
              <span className="text-[17px]" style={{ color: 'var(--ios-tertiary-label)' }}>
                ›
              </span>
            </div>
          </Link>
        </div>

        <p
          className="mt-8 mb-6 text-center text-[13px]"
          style={{ color: 'var(--ios-tertiary-label)' }}
        >
          Keiro (経路) — Learn Japanese
        </p>
      </PageContainer>
    </>
  );
}
