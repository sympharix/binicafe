import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import AuthInit from './components/AuthInit';
import SocketInit from './components/SocketInit';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AuthInit />
        <SocketProvider>
          <SocketInit />
          <App />
        </SocketProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--tw-rms-panel, #161d26)',
              border: '1px solid var(--tw-rms-border, #2d3748)',
              color: '#e2e8f0',
            },
            className: 'rounded-xl',
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
