import '@workspace/ui/theme/tokens.css';
import './index.css';

import ReactDOM from 'react-dom/client';
import { StrictMode } from 'react';

import { App } from '@/app/App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
