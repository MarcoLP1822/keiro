import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './services/db';
import { supabase } from './services/supabase';
import { storage } from './services/storage';
import { reminderService } from './services/reminder';
import { useTheme } from './hooks/useTheme';
import { LoadingPage } from './components/common/LoadingSpinner';
import { ErrorBoundary } from './components/common/ErrorBoundary';

import { Welcome } from './pages/Welcome';
import { PlacementQuiz } from './pages/PlacementQuiz';
import { Home } from './pages/Home';
import { PathMap } from './pages/PathMap';
import { StudyIntro } from './pages/StudyIntro';
import { StudyExercises } from './pages/StudyExercises';
import { ModuleComplete } from './pages/ModuleComplete';
import { Review } from './pages/Review';
import { SrsReview } from './pages/SrsReview';
import { Settings } from './pages/Settings';
import { Stats } from './pages/Stats';
import { Login } from './pages/Login';
import { LeechReview } from './pages/LeechReview';

function AppRoutes() {
  const progressCount = useLiveQuery(() => db.moduleProgress.count());

  // Still loading from IndexedDB
  if (progressCount === undefined) return <LoadingPage />;

  const isFirstLaunch = progressCount === 0;

  return (
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
    </Routes>
  );
}

function AuthHandler({ children }: { children: React.ReactNode }) {
  useTheme();
  const [authReady, setAuthReady] = useState(!supabase);

  useEffect(() => {
    if (!supabase) return;

    // Handle auth code exchange from magic link / OAuth redirects
    // This MUST happen before React Router processes the URL
    const params = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace('#', '?'));

    const hasAuthCode = params.has('code') || hashParams.has('access_token');

    if (hasAuthCode) {
      // Let Supabase exchange the code for a session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          storage.setUserId(session.user.id);
        }
        // Clean up URL
        window.history.replaceState({}, '', window.location.pathname);
        setAuthReady(true);
      });
    } else {
      // No auth code in URL, just check existing session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          storage.setUserId(session.user.id);
        }
        setAuthReady(true);
      });
    }

    // Listen for future auth changes (sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      storage.setUserId(session?.user.id ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (authReady) {
      reminderService.checkAndRemind();
    }
  }, [authReady]);

  if (!authReady) return <LoadingPage />;

  return <>{children}</>;
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
