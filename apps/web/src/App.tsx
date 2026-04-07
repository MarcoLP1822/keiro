import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './services/db';
import { supabase } from './services/supabase';
import { storage } from './services/storage';
import { useTheme } from './hooks/useTheme';
import { useOnline } from './hooks/useOnline';
import { LoadingPage } from './components/common/LoadingSpinner';
import { ErrorBoundary } from './components/common/ErrorBoundary';

const Welcome = lazy(() => import('./pages/Welcome').then(m => ({ default: m.Welcome })));
const PlacementQuiz = lazy(() => import('./pages/PlacementQuiz').then(m => ({ default: m.PlacementQuiz })));
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const PathMap = lazy(() => import('./pages/PathMap').then(m => ({ default: m.PathMap })));
const StudyIntro = lazy(() => import('./pages/StudyIntro').then(m => ({ default: m.StudyIntro })));
const StudyExercises = lazy(() => import('./pages/StudyExercises').then(m => ({ default: m.StudyExercises })));
const ModuleComplete = lazy(() => import('./pages/ModuleComplete').then(m => ({ default: m.ModuleComplete })));
const Review = lazy(() => import('./pages/Review').then(m => ({ default: m.Review })));
const SrsReview = lazy(() => import('./pages/SrsReview').then(m => ({ default: m.SrsReview })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));
const Stats = lazy(() => import('./pages/Stats').then(m => ({ default: m.Stats })));
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const LeechReview = lazy(() => import('./pages/LeechReview').then(m => ({ default: m.LeechReview })));
const About = lazy(() => import('./pages/About').then(m => ({ default: m.About })));
const Privacy = lazy(() => import('./pages/Privacy').then(m => ({ default: m.Privacy })));
const KanaChart = lazy(() => import('./pages/KanaChart').then(m => ({ default: m.KanaChart })));
const ResetPassword = lazy(() => import('./pages/ResetPassword').then(m => ({ default: m.ResetPassword })));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function AppRoutes() {
  const progressCount = useLiveQuery(() => db.moduleProgress.count());

  // Still loading from IndexedDB
  if (progressCount === undefined) return <LoadingPage />;

  const isFirstLaunch = progressCount === 0;

  return (
    <>
    <ScrollToTop />
    <Suspense fallback={<LoadingPage />}>
    <Routes>
      <Route path="/" element={isFirstLaunch ? <Navigate to="/welcome" replace /> : <Home />} />
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/placement" element={<PlacementQuiz />} />
      <Route path="/path" element={<PathMap />} />
      <Route path="/study/:moduleId/intro" element={<StudyIntro />} />
      <Route path="/study/:moduleId/exercises" element={<StudyExercises />} />
      <Route path="/study/:moduleId/complete" element={<ModuleComplete />} />
      <Route path="/review" element={<Review />} />
      <Route path="/review/srs" element={<SrsReview />} />
      <Route path="/review/leeches" element={<LeechReview />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/login" element={<Login />} />
      <Route path="/stats" element={<Stats />} />
      <Route path="/kana-chart" element={<KanaChart />} />
      <Route path="/about" element={<About />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/reset-password" element={<ResetPassword />} />
    </Routes>
    </Suspense>
    </>
  );
}

function AuthHandler({ children }: { children: React.ReactNode }) {
  useTheme();
  const isOnline = useOnline();
  const [authReady, setAuthReady] = useState(!supabase);

  useEffect(() => {
    if (!supabase) return;

    const hashParams = new URLSearchParams(window.location.hash.replace('#', '?'));
    const hasAuthTokens = hashParams.has('access_token');

    // Listen for auth state changes (includes token exchange from URL hash)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      storage.setUserId(session?.user.id ?? null);

      // Once the recovery/signup token is exchanged, clean the URL and mark ready
      if (hasAuthTokens && !authReady) {
        window.history.replaceState({}, '', window.location.pathname);
      }
      setAuthReady(true);
    });

    // If no hash tokens, just check existing session
    if (!hasAuthTokens) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) storage.setUserId(session.user.id);
        setAuthReady(true);
      }).catch(() => setAuthReady(true));
    }

    // Safety timeout: don't block forever if token exchange fails
    const timeout = hasAuthTokens ? setTimeout(() => setAuthReady(true), 5000) : undefined;

    return () => {
      subscription.unsubscribe();
      if (timeout) clearTimeout(timeout);
    };
  }, []);

  if (!authReady) return <LoadingPage />;

  return (
    <>
      {!isOnline && (
        <div
          className="sticky top-0 z-50 px-4 py-2 text-center text-[13px] font-medium"
          style={{ background: 'var(--k-incorrect-bg)', color: 'white' }}
        >
          You are offline — studying works, but sync is paused
        </div>
      )}
      {children}
    </>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <AuthHandler>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthHandler>
    </ErrorBoundary>
  );
}
