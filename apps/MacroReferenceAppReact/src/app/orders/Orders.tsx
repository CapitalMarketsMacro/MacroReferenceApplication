import { useCallback, useState } from 'react';
import type { GetRowIdFunc } from 'ag-grid-community';

import { MacroGrid } from '../macro/MacroGrid';
import {
  buildOrderGridOptions,
  createParentOrders,
  type ParentOrder,
} from '../macro/orders';
import { createTrades, TRADE_COLUMNS, type Trade } from '../macro/trades';

export function Orders() {
  const [orders] = useState<ParentOrder[]>(() => createParentOrders());
  const [trades] = useState<Trade[]>(() => createTrades());

  // Both grids key rows by their `id`; the wrapper owns theme/density.
  const byId = useCallback<GetRowIdFunc>((p) => p.data.id, []);

  return (
    <div className="macro-orders">
      <div className="macro-panel macro-orders-panel macro-orders-master">
        <div className="macro-panel-body macro-grid-wrap">
          <MacroGrid
            rowData={orders}
            getRowId={byId}
            gridOptions={buildOrderGridOptions}
            title="Order Blotter"
          />
        </div>
      </div>

      <div className="macro-panel macro-orders-panel macro-orders-trades">
        <div className="macro-panel-body macro-grid-wrap">
          <MacroGrid
            rowData={trades}
            columnDefs={TRADE_COLUMNS}
            getRowId={byId}
            title="Trade Blotter"
          />
        </div>
      </div>
    </div>
  );
}

export default Orders;
