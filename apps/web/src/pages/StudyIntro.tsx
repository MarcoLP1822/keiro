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
          <p className="text-center text-gray-500">Module not found.</p>
        </PageContainer>
      </>
    );
  }

  return (
    <>
      <TopBar onBack={() => navigate('/')} />
      <PageContainer>
        <div className="flex flex-col gap-6">
          <h1 className="text-2xl font-bold text-gray-900">{module.intro.title}</h1>

          <p className="text-base leading-relaxed text-gray-700">
            {module.intro.explanation}
          </p>

          {module.intro.cultureNote && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
              <div className="flex gap-2">
                <span className="text-amber-600 shrink-0" aria-hidden="true">
                  <svg className="h-5 w-5 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                  </svg>
                </span>
                <div>
                  <p className="text-sm font-medium text-amber-800 mb-1">Culture note</p>
                  <p className="text-sm leading-relaxed text-amber-700">
                    {module.intro.cultureNote}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-4">
            <PrimaryButton onClick={() => navigate(`/study/${moduleId}/exercises`)}>
              Begin
            </PrimaryButton>
          </div>
        </div>
      </PageContainer>
    </>
  );
}
