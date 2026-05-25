import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Pre-load the github project files metadata in the background
import('./githubFiles').then((module) => {
  (window as any).GITHUB_PROJECT_FILES = module.GITHUB_PROJECT_FILES;
}).catch((err) => {
  console.warn("Could not pre-fetch github project files structure:", err);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
