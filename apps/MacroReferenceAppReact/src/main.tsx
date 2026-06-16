import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { PrimeReactProvider } from 'primereact/api';
import './styles.css';
// Register AG Grid Community + Enterprise modules (side effect) before any grid.
import './app/macro/ag-grid-modules';
import App from './app/app';

// Dark-default trading UI.
document.documentElement.classList.add('dark');

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

root.render(
  <StrictMode>
    <PrimeReactProvider value={{ ripple: true }}>
      <App />
    </PrimeReactProvider>
  </StrictMode>,
);
