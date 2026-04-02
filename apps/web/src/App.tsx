import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './services/db';

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

function AppRoutes() {
  const progressCount = useLiveQuery(() => db.moduleProgress.count());

  // Still loading from IndexedDB
  if (progressCount === undefined) return null;

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
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
