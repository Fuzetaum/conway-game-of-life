import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BoardProvider } from '@context/BoardContext';
import './index.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <BoardProvider>
      <App />
    </BoardProvider>
  </React.StrictMode>
);