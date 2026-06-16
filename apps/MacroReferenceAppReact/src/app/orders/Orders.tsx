import { useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';

import { buildAgGridTheme } from '../macro/ag-grid-theme';
import {
  buildOrderGridOptions,
  createParentOrders,
  type ParentOrder,
} from '../macro/orders';
import { createTrades, TRADE_COLUMNS, type Trade } from '../macro/trades';
import { useIsDark } from '../macro/use-is-dark';

const TRADE_DEFAULT_COL_DEF = {
  sortable: true,
  filter: true,
  resizable: true,
  flex: 1,
  minWidth: 90,
};

export function Orders() {
  const isDark = useIsDark();

  // Re-theme when dark/light toggles. The order grid options bake the theme
  // into the detail grid, so they must be rebuilt alongside the theme.
  const theme = useMemo(() => buildAgGridTheme(isDark), [isDark]);
  const orderGridOptions = useMemo(() => buildOrderGridOptions(theme), [theme]);

  const [orders] = useState<ParentOrder[]>(() => createParentOrders());
  const [trades] = useState<Trade[]>(() => createTrades());

  return (
    <div className="macro-orders">
      <div className="macro-panel macro-orders-panel macro-orders-master">
        <div className="macro-panel-header">Order Blotter</div>
        <div className="macro-panel-body macro-grid-wrap">
          <AgGridReact
            theme={theme}
            gridOptions={orderGridOptions}
            rowData={orders}
          />
        </div>
      </div>

      <div className="macro-panel macro-orders-panel macro-orders-trades">
        <div className="macro-panel-header">Trade Blotter</div>
        <div className="macro-panel-body macro-grid-wrap">
          <AgGridReact
            theme={theme}
            columnDefs={TRADE_COLUMNS}
            rowData={trades}
            getRowId={(p) => p.data.id}
            defaultColDef={TRADE_DEFAULT_COL_DEF}
          />
        </div>
      </div>
    </div>
  );
}

export default Orders;
