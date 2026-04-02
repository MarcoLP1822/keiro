import { createRoot } from 'react-dom/client';
import { initSentry } from './services/sentry';
import { App } from './App';
import './index.css';

initSentry();

const root = document.getElementById('root')!;
createRoot(root).render(<App />);
