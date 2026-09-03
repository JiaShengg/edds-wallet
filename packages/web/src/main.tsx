import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Design-system entry points: the token bundle (fonts, colors, typography,
// spacing, shape, motion) must load before any component styling makes
// sense. See packages/web/design-system/README.md for where each token
// file and each component lives.
import './styles/tokens/index.css';
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
