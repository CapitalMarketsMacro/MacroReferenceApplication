import { Component, computed, inject } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import type { ColDef, GetRowIdParams } from 'ag-grid-community';

import { buildAgGridTheme } from '../macro/ag-grid-theme';
import {
  buildOrderGridOptions,
  createParentOrders,
  type ParentOrder,
} from '../macro/orders';
import { TRADE_COLUMNS, type Trade, createTrades } from '../macro/trades';
import { ThemeService } from '../theme.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [AgGridAngular],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders {
  private readonly themeSvc = inject(ThemeService);

  // AG Grid theme + master/detail options recompute on dark/light toggle so
  // both the master grid and its baked-in detail grid re-theme.
  readonly agTheme = computed(() => buildAgGridTheme(this.themeSvc.isDark()));
  readonly orderGridOptions = computed(() =>
    buildOrderGridOptions(this.agTheme()),
  );

  readonly orders: ParentOrder[] = createParentOrders();
  readonly trades: Trade[] = createTrades();
  readonly tradeColumns: ColDef<Trade>[] = TRADE_COLUMNS;

  readonly getRowId = (p: GetRowIdParams<ParentOrder>) => p.data.id;
  readonly getTradeRowId = (p: GetRowIdParams<Trade>) => p.data.id;

  readonly tradeDefaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    flex: 1,
    minWidth: 90,
  };
}
