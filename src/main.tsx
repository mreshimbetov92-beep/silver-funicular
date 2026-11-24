import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Home from './app/page';
import './app/globals.css';
import './app/model.css';
import './app/studio.css';
import './app/workspace32.css';
import './app/studio33.css';
import './app/shared34.css';
import './app/monitor35.css';

createRoot(document.getElementById('root')!).render(<StrictMode><Home /></StrictMode>);
