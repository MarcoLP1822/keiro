import { useNavigate } from 'react-router';
import { PageContainer } from '../components/layout/PageContainer';
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
      'For privacy-related questions, please contact us through the app\'s About page.',
  },
];

export function Privacy() {
  const navigate = useNavigate();

  return (
    <>
      <TopBar title="Privacy Policy" onBack={() => navigate(-1)} />
      <PageContainer>
        <p
          className="mb-6 px-1 text-[15px] leading-relaxed"
          style={{ color: 'var(--ios-secondary-label)' }}
        >
          Last updated: April 2026
        </p>

        {sections.map((section, i) => (
          <div key={section.title} className={i > 0 ? 'mt-8' : ''}>
            <p
              className="mb-2 px-4 text-[13px] font-normal uppercase tracking-wide"
              style={{ color: 'var(--ios-secondary-label)' }}
            >
              {section.title}
            </p>
            <div
              className="rounded-[10px] px-4 py-[11px]"
              style={{ background: 'var(--ios-bg-grouped-secondary)' }}
            >
              {section.content && (
                <p
                  className="text-[17px] leading-relaxed"
                  style={{ color: 'var(--ios-label)' }}
                >
                  {section.content}
                </p>
              )}
              {section.link && (
                <a
                  href={section.link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[17px] leading-relaxed active:opacity-60"
                  style={{ color: 'var(--ios-blue)' }}
                >
                  {section.link.label}
                </a>
              )}
            </div>
          </div>
        ))}

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
