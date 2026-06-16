import { useCallback, useMemo, useState } from 'react';
import { Menubar } from 'primereact/menubar';
import { Button } from 'primereact/button';
import type { MenuItem } from 'primereact/menuitem';

import Blotter from './blotter/Blotter';
import Analytics from './analytics/Analytics';
import Orders from './orders/Orders';
import './app.css';

type View = 'rates' | 'analytics' | 'orders';

export function App() {
  const [view, setView] = useState<View>('rates');

  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark'),
  );

  const navItems = useMemo<MenuItem[]>(
    () => [
      {
        label: 'Rates Blotter',
        className: view === 'rates' ? 'p-menuitem-active' : undefined,
        command: () => setView('rates'),
      },
      {
        label: 'Analytics',
        className: view === 'analytics' ? 'p-menuitem-active' : undefined,
        command: () => setView('analytics'),
      },
      {
        label: 'Orders',
        className: view === 'orders' ? 'p-menuitem-active' : undefined,
        command: () => setView('orders'),
      },
    ],
    [view],
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
        <Menubar model={navItems} start={brand} end={headerEnd} />
      </header>
      <main className="macro-body">
        {view === 'rates' && <Blotter />}
        {view === 'analytics' && <Analytics />}
        {view === 'orders' && <Orders />}
      </main>
    </div>
  );
}

export default App;
