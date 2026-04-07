import { useNavigate } from 'react-router';
import { TopBar } from '../components/layout/TopBar';

const sections = [
  {
    title: 'What We Collect',
    content:
      'We collect your email address when you create an account. We also store your learning progress and settings so we can sync them across your devices when you are signed in.',
  },
  {
    title: 'How We Store It',
    content:
      'Your data is stored locally on your device using IndexedDB. When you sign in, your progress and settings are optionally synced to the cloud using Supabase, hosted in the European Union.',
  },
  {
    title: 'Your Rights',
    content:
      'You can download all your data at any time via Settings > Data & Privacy > Download My Data. You can permanently delete your account and all associated data via Settings > Data & Privacy > Delete My Account.',
  },
  {
    title: 'Cookies',
    content:
      'We do not use cookies. Authentication state is stored in localStorage on your device.',
  },
  {
    title: 'Third Parties',
    content: null,
    link: {
      label: 'Supabase — authentication and data sync. Read their Privacy Policy.',
      url: 'https://supabase.com/privacy',
    },
  },
  {
    title: 'Children',
    content:
      'This app is suitable for all ages. We do not knowingly collect personal data from children under 13 without verified parental consent.',
  },
  {
    title: 'Changes to This Policy',
    content:
      'We may update this privacy policy from time to time. Any changes will be reflected on this page with a new "Last updated" date.',
  },
  {
    title: 'Contact',
    content:
      "For privacy-related questions, please contact us through the app's About page.",
  },
];

// Sections to feature in the "Use of Information" highlight grid
const USE_OF_INFO_TITLES = new Set(['What We Collect', 'How We Store It', 'Your Rights', 'Cookies']);

export function Privacy() {
  const navigate = useNavigate();

  const gridSections = sections.filter((s) => USE_OF_INFO_TITLES.has(s.title));
  const remainingSections = sections.filter((s) => !USE_OF_INFO_TITLES.has(s.title));

  return (
    <>
      <TopBar title="Privacy Policy" onBack={() => navigate(-1)} />

      <main className="pb-12 animate-fadeIn">
        {/* Editorial header */}
        <div
          className="px-6 pt-8 pb-10 relative overflow-hidden"
          style={{ background: 'var(--k-surface-container-lowest)' }}
        >
          {/* Decorative kanji watermark */}
          <span
            className="font-headline absolute right-2 top-0 text-[120px] leading-none select-none pointer-events-none"
            style={{ color: 'var(--k-outline-variant)', opacity: 0.3 }}
            aria-hidden="true"
          >
            秘
          </span>

          {/* "Privacy Matters" chip */}
          <span
            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full mb-4"
            style={{
              background: 'var(--k-surface-container-high)',
              color: 'var(--k-secondary)',
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: '14px', color: 'var(--k-primary)' }}
            >
              lock
            </span>
            Privacy Matters
          </span>

          <h1
            className="font-headline text-3xl leading-snug"
            style={{ color: 'var(--k-on-surface)' }}
          >
            Privacy Policy
          </h1>
          <p
            className="mt-2 text-sm"
            style={{ color: 'var(--k-outline)' }}
          >
            Last updated: April 2026
          </p>
        </div>

        <div className="px-6 pt-6 space-y-8">
          {/* Highlight card — no tracking promise */}
          <div
            className="rounded-xl p-5 border-l-4"
            style={{
              background: 'var(--k-surface-container-lowest)',
              borderLeftColor: 'var(--k-primary)',
            }}
          >
            <div className="flex items-start gap-3">
              <span
                className="material-symbols-outlined shrink-0"
                style={{ color: 'var(--k-primary)', fontVariationSettings: "'FILL' 1" }}
              >
                verified_user
              </span>
              <div>
                <p
                  className="font-headline text-base font-semibold"
                  style={{ color: 'var(--k-on-surface)' }}
                >
                  Your data stays yours
                </p>
                <p
                  className="text-sm mt-1 leading-relaxed"
                  style={{ color: 'var(--k-secondary)' }}
                >
                  We do not sell, rent, or share your personal data with third parties for marketing. Your learning progress is yours alone.
                </p>
              </div>
            </div>
          </div>

          {/* Use of Information grid */}
          <section>
            <h2
              className="font-headline text-2xl mb-4"
              style={{ color: 'var(--k-on-surface)' }}
            >
              情報の利用
              <span
                className="block text-sm font-body font-normal mt-0.5"
                style={{ color: 'var(--k-secondary)' }}
              >
                Use of Information
              </span>
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {gridSections.map((section) => (
                <div
                  key={section.title}
                  className="rounded-xl p-5"
                  style={{ background: 'var(--k-surface-container-lowest)' }}
                >
                  <h3
                    className="font-headline text-base mb-2"
                    style={{ color: 'var(--k-on-surface)' }}
                  >
                    {section.title}
                  </h3>
                  {section.content && (
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: 'var(--k-secondary)' }}
                    >
                      {section.content}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Remaining sections — long-form */}
          {remainingSections.map((section) => (
            <section key={section.title}>
              <h2
                className="font-headline text-2xl mb-3"
                style={{ color: 'var(--k-on-surface)' }}
              >
                {section.title}
              </h2>
              <div
                className="rounded-xl p-5"
                style={{ background: 'var(--k-surface-container-lowest)' }}
              >
                {section.content && (
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: 'var(--k-secondary)' }}
                  >
                    {section.content}
                  </p>
                )}
                {section.link && (
                  <a
                    href={section.link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm leading-relaxed active:opacity-60"
                    style={{ color: 'var(--k-primary)' }}
                  >
                    <span
                      className="material-symbols-outlined text-[16px]"
                      style={{ fontSize: '16px' }}
                    >
                      open_in_new
                    </span>
                    {section.link.label}
                  </a>
                )}
              </div>
            </section>
          ))}
        </div>

        <p
          className="mt-10 mb-4 text-center text-xs"
          style={{ color: 'var(--k-outline)' }}
        >
          Keiro (経路) — Learn Japanese
        </p>
      </main>
    </>
  );
}
