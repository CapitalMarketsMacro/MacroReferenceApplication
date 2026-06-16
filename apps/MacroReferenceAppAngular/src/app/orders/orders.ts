import { Component } from '@angular/core';
import type { ColDef, GetRowIdParams } from 'ag-grid-community';

import { MacroGrid } from '../macro/macro-grid';
import {
  buildOrderGridOptions,
  createParentOrders,
  type ParentOrder,
} from '../macro/orders';
import { TRADE_COLUMNS, type Trade, createTrades } from '../macro/trades';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [MacroGrid],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders {
  readonly orders: ParentOrder[] = createParentOrders();
  readonly trades: Trade[] = createTrades();
  readonly tradeColumns: ColDef<Trade>[] = TRADE_COLUMNS;

  /** Function form — the wrapper calls it with its own theme so the detail grid is themed. */
  readonly orderGridOptions = buildOrderGridOptions;

  readonly getRowId = (p: GetRowIdParams<ParentOrder>) => p.data.id;
  readonly getTradeRowId = (p: GetRowIdParams<Trade>) => p.data.id;
}
