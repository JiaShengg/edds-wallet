import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Design-system entry points: fonts must load before tokens are useful,
// tokens must load before any component styling makes sense. See
// packages/web/README.md for where each of these lives.
import './styles/fonts.css';
import './styles/tokens.css';
import './styles/app.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
