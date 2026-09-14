import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { AppProvider } from './context/AppContext';
import { RoleTimerProvider } from './context/RoleTimerContext';
import { SettingsProvider } from './context/SettingsContext';
import { ToastProvider } from './components/Toast';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('ไม่พบ element #root ในหน้า index.html');

createRoot(rootElement).render(
  <StrictMode>
    <ToastProvider>
      <SettingsProvider>
        <AppProvider>
          <RoleTimerProvider>
            <App />
          </RoleTimerProvider>
        </AppProvider>
      </SettingsProvider>
    </ToastProvider>
  </StrictMode>,
);
