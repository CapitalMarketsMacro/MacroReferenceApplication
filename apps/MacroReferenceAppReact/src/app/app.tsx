import { useCallback, useState } from 'react';
import { Menubar } from 'primereact/menubar';
import { Button } from 'primereact/button';
import type { MenuItem } from 'primereact/menuitem';

import Blotter from './blotter/Blotter';
import './app.css';

const NAV_ITEMS: MenuItem[] = [
  { label: 'Rates Blotter', className: 'p-menuitem-active' },
  { label: 'Analytics' },
  { label: 'Orders' },
];

export function App() {
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark'),
  );

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      document.body.classList.toggle('theme-light', !next);
      return next;
    });
  }, []);

  const brand = (
    <img
      src="/logo-lockup.svg"
      alt="Macro"
      style={{ height: 18 }}
      className="macro-brand"
    />
  );

  const headerEnd = (
    <div className="macro-header-end">
      <span className="macro-live-badge">
        <span className="macro-live-dot" />
        LIVE
      </span>
      <Button
        icon={isDark ? 'pi pi-moon' : 'pi pi-sun'}
        text
        rounded
        aria-label="Toggle theme"
        onClick={toggleTheme}
      />
      <span className="macro-user-chip">JL</span>
    </div>
  );

  return (
    <div className="macro-app">
      <header className="macro-app-bar">
        <Menubar model={NAV_ITEMS} start={brand} end={headerEnd} />
      </header>
      <main className="macro-body">
        <Blotter />
      </main>
    </div>
  );
}

export default App;
