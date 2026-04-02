import { useParams, useNavigate } from 'react-router';
import { getModuleById } from '@keiro/content';
import { TopBar } from '../components/layout/TopBar';
import { PageContainer } from '../components/layout/PageContainer';
import { PrimaryButton } from '../components/common/PrimaryButton';

export function StudyIntro() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const module = moduleId ? getModuleById(moduleId) : undefined;

  if (!module) {
    return (
      <>
        <TopBar onBack={() => navigate('/')} title="Not Found" />
        <PageContainer>
          <p
            className="text-center text-[17px] mt-12"
            style={{ color: 'var(--ios-secondary-label)' }}
          >
            Module not found.
          </p>
        </PageContainer>
      </>
    );
  }

  return (
    <>
      <TopBar onBack={() => navigate('/')} />
      <PageContainer>
        {/* Lesson content card */}
        <div
          className="rounded-[10px] p-5 mt-2"
          style={{ background: 'var(--ios-bg-grouped-secondary)' }}
        >
          <h1
            className="text-[22px] font-bold"
            style={{ color: 'var(--ios-label)' }}
          >
            {module.intro.title}
          </h1>

          <p
            className="mt-4 text-[17px] leading-relaxed"
            style={{ color: 'var(--ios-label)' }}
          >
            {module.intro.explanation}
          </p>
        </div>

        {module.intro.cultureNote && (
          <>
            {/* Section header */}
            <p
              className="mt-8 mb-2 px-4 text-[13px] font-normal uppercase tracking-wide"
              style={{ color: 'var(--ios-secondary-label)' }}
            >
              Culture Note
            </p>

            {/* Culture note in a subtle tinted card */}
            <div
              className="rounded-[10px] p-4"
              style={{ background: 'rgba(0, 122, 255, 0.05)' }}
            >
              <p
                className="text-[15px] leading-relaxed"
                style={{ color: 'var(--ios-label)' }}
              >
                {module.intro.cultureNote}
              </p>
            </div>
          </>
        )}

        <div className="mt-8">
          <PrimaryButton onClick={() => navigate(`/study/${moduleId}/exercises`)}>
            Begin
          </PrimaryButton>
        </div>
      </PageContainer>
    </>
  );
}
