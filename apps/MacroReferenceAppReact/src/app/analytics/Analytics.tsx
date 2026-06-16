import { useMemo } from 'react';
import { AgCharts } from 'ag-charts-react';

import {
  notionalByClassOptions,
  volumeByVenueOptions,
  yieldCurveOptions,
} from '../macro/analytics';
import { createParentOrders } from '../macro/orders';
import { createTrades } from '../macro/trades';
import { useIsDark } from '../macro/use-is-dark';

const CHART_STYLE = { height: 300, width: '100%' } as const;

export function Analytics() {
  const isDark = useIsDark();

  // Recompute from current isDark so charts re-theme on toggle.
  const curve = useMemo(() => yieldCurveOptions(isDark), [isDark]);
  const notional = useMemo(() => notionalByClassOptions(isDark), [isDark]);
  const volume = useMemo(() => volumeByVenueOptions(isDark), [isDark]);

  const openOrders = useMemo(
    () =>
      createParentOrders().filter(
        (o) => o.status === 'Working' || o.status === 'Partially Filled',
      ).length,
    [],
  );
  const todaysTrades = useMemo(() => createTrades().length, []);

  return (
    <div className="macro-analytics">
      <div className="macro-kpi-row">
        <div className="macro-kpi-card">
          <div className="macro-kpi-label">Total Notional</div>
          <div className="macro-kpi-value">$10.4BN</div>
        </div>
        <div className="macro-kpi-card">
          <div className="macro-kpi-label">Open Orders</div>
          <div className="macro-kpi-value">{openOrders}</div>
        </div>
        <div className="macro-kpi-card">
          <div className="macro-kpi-label">Today's Trades</div>
          <div className="macro-kpi-value">{todaysTrades}</div>
        </div>
        <div className="macro-kpi-card">
          <div className="macro-kpi-label">Avg Fill</div>
          <div className="macro-kpi-value">62%</div>
        </div>
      </div>

      <div className="macro-chart-grid">
        <div className="macro-panel macro-chart-panel">
          <AgCharts options={curve} style={CHART_STYLE} />
        </div>
        <div className="macro-panel macro-chart-panel">
          <AgCharts options={notional} style={CHART_STYLE} />
        </div>
        <div className="macro-panel macro-chart-panel">
          <AgCharts options={volume} style={CHART_STYLE} />
        </div>
      </div>
    </div>
  );
}

export default Analytics;
