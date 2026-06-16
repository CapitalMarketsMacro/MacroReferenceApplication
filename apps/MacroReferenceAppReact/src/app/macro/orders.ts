/**
 * Macro Reference — Order Blotter domain model + mock data + AG Grid config.
 *
 * Framework-agnostic: identical in the Angular and React apps. A parent order
 * (a desk's working order) fans out to multiple child orders (venue slices);
 * the Order Blotter renders this as an AG Grid Enterprise master/detail grid.
 */
import type { ColDef, GridOptions, Theme, ValueFormatterParams } from 'ag-grid-community';

export type OrderSide = 'Buy' | 'Sell';
export type OrderStatus =
  | 'Working'
  | 'Partially Filled'
  | 'Filled'
  | 'Cancelled'
  | 'Rejected';

export interface ChildOrder {
  id: string;
  parentId: string;
  venue: string;
  qty: number;
  filledQty: number;
  px: number;
  status: OrderStatus;
  time: string;
}

export interface ParentOrder {
  id: string;
  instrument: string;
  ccy: string;
  side: OrderSide;
  qty: number;
  filledQty: number;
  limitPx: number;
  avgPx: number;
  status: OrderStatus;
  strategy: string;
  trader: string;
  time: string;
  children: ChildOrder[];
}

export function createParentOrders(): ParentOrder[] {
  return [
    {
      id: 'P-8431', instrument: 'USD 10Y SOFR', ccy: 'USD', side: 'Buy', qty: 100,
      filledQty: 60, limitPx: 4.24, avgPx: 4.2383, status: 'Partially Filled',
      strategy: 'TWAP', trader: 'JL', time: '14:22:07',
      children: [
        { id: 'P-8431-1', parentId: 'P-8431', venue: 'TradeWeb', qty: 40, filledQty: 40, px: 4.238, status: 'Filled', time: '14:22:09' },
        { id: 'P-8431-2', parentId: 'P-8431', venue: 'BBG', qty: 30, filledQty: 20, px: 4.239, status: 'Partially Filled', time: '14:22:40' },
        { id: 'P-8431-3', parentId: 'P-8431', venue: 'MarketAxess', qty: 30, filledQty: 0, px: 4.24, status: 'Working', time: '14:23:05' },
      ],
    },
    {
      id: 'P-8432', instrument: 'DBR 2.1 02/34', ccy: 'EUR', side: 'Sell', qty: 50,
      filledQty: 50, limitPx: 99.45, avgPx: 99.452, status: 'Filled',
      strategy: 'VWAP', trader: 'MK', time: '14:21:55',
      children: [
        { id: 'P-8432-1', parentId: 'P-8432', venue: 'MTS', qty: 30, filledQty: 30, px: 99.45, status: 'Filled', time: '14:21:58' },
        { id: 'P-8432-2', parentId: 'P-8432', venue: 'BrokerTec', qty: 20, filledQty: 20, px: 99.455, status: 'Filled', time: '14:22:12' },
      ],
    },
    {
      id: 'P-8433', instrument: 'UST 3.875 08/34', ccy: 'USD', side: 'Buy', qty: 75,
      filledQty: 0, limitPx: 98.2, avgPx: 0, status: 'Working',
      strategy: 'Sniper', trader: 'RP', time: '14:20:31',
      children: [
        { id: 'P-8433-1', parentId: 'P-8433', venue: 'BrokerTec', qty: 45, filledQty: 0, px: 98.2, status: 'Working', time: '14:20:33' },
        { id: 'P-8433-2', parentId: 'P-8433', venue: 'TradeWeb', qty: 30, filledQty: 0, px: 98.2, status: 'Working', time: '14:20:34' },
      ],
    },
    {
      id: 'P-8434', instrument: 'GBP 5Y SONIA', ccy: 'GBP', side: 'Sell', qty: 25,
      filledQty: 10, limitPx: 4.02, avgPx: 4.0205, status: 'Partially Filled',
      strategy: 'Manual', trader: 'TS', time: '14:19:12',
      children: [
        { id: 'P-8434-1', parentId: 'P-8434', venue: 'BBG', qty: 15, filledQty: 10, px: 4.0205, status: 'Partially Filled', time: '14:19:20' },
        { id: 'P-8434-2', parentId: 'P-8434', venue: 'TradeWeb', qty: 10, filledQty: 0, px: 4.02, status: 'Working', time: '14:19:44' },
      ],
    },
    {
      id: 'P-8435', instrument: 'EUR 10Y ESTR', ccy: 'EUR', side: 'Buy', qty: 60,
      filledQty: 60, limitPx: 2.343, avgPx: 2.3419, status: 'Filled',
      strategy: 'TWAP', trader: 'JL', time: '14:11:14',
      children: [
        { id: 'P-8435-1', parentId: 'P-8435', venue: 'TradeWeb', qty: 35, filledQty: 35, px: 2.3415, status: 'Filled', time: '14:11:18' },
        { id: 'P-8435-2', parentId: 'P-8435', venue: 'MarketAxess', qty: 25, filledQty: 25, px: 2.3425, status: 'Filled', time: '14:12:02' },
      ],
    },
    {
      id: 'P-8436', instrument: 'USD 2Y SOFR', ccy: 'USD', side: 'Sell', qty: 40,
      filledQty: 0, limitPx: 4.182, avgPx: 0, status: 'Cancelled',
      strategy: 'POV', trader: 'AB', time: '14:05:48',
      children: [
        { id: 'P-8436-1', parentId: 'P-8436', venue: 'TradeWeb', qty: 40, filledQty: 0, px: 4.182, status: 'Cancelled', time: '14:06:10' },
      ],
    },
    {
      id: 'P-8437', instrument: 'TY Dec-26', ccy: 'USD', side: 'Buy', qty: 30,
      filledQty: 0, limitPx: 110.19, avgPx: 0, status: 'Rejected',
      strategy: 'Manual', trader: 'RP', time: '14:02:09',
      children: [
        { id: 'P-8437-1', parentId: 'P-8437', venue: 'CME', qty: 30, filledQty: 0, px: 110.19, status: 'Rejected', time: '14:02:09' },
      ],
    },
  ];
}

// ---- Cell formatting helpers (guard group/empty rows) ----
const mmFmt = (p: ValueFormatterParams) => (p.value == null ? '' : `${p.value} MM`);
const pxFmt = (p: ValueFormatterParams) =>
  p.value == null || p.value === 0 ? '—' : Number(p.value).toFixed(4);

const sideStyle = (p: { value?: unknown }) =>
  p.value === 'Buy'
    ? { color: 'var(--mkt-up)' }
    : p.value === 'Sell'
      ? { color: 'var(--mkt-down)' }
      : null;

const statusStyle = (p: { value?: unknown }): Record<string, string | number> | null => {
  switch (p.value) {
    case 'Filled':
      return { color: 'var(--mkt-up)', fontWeight: 500 };
    case 'Working':
    case 'Partially Filled':
      return { color: 'var(--status-info)' };
    case 'Cancelled':
    case 'Rejected':
      return { color: 'var(--mkt-down)' };
    default:
      return null;
  }
};

/** Parent (master) grid columns. The first column hosts the detail expander. */
export const ORDER_MASTER_COLUMNS: ColDef<ParentOrder>[] = [
  { field: 'id', headerName: 'Order ID', cellRenderer: 'agGroupCellRenderer', minWidth: 150, pinned: 'left' },
  { field: 'instrument', headerName: 'Instrument', minWidth: 170 },
  { field: 'side', headerName: 'Side', width: 80, cellStyle: sideStyle },
  { field: 'qty', headerName: 'Qty', width: 92, type: 'rightAligned', valueFormatter: mmFmt },
  { field: 'filledQty', headerName: 'Filled', width: 92, type: 'rightAligned', valueFormatter: mmFmt },
  {
    colId: 'fill', headerName: 'Fill %', width: 84, type: 'rightAligned',
    valueGetter: (p) => (p.data && p.data.qty ? p.data.filledQty / p.data.qty : 0),
    valueFormatter: (p) => (p.value == null ? '' : Math.round(p.value * 100) + '%'),
  },
  { field: 'limitPx', headerName: 'Limit', width: 96, type: 'rightAligned', valueFormatter: pxFmt },
  { field: 'avgPx', headerName: 'Avg Px', width: 96, type: 'rightAligned', valueFormatter: pxFmt },
  { field: 'strategy', headerName: 'Strategy', width: 104 },
  { field: 'status', headerName: 'Status', width: 134, cellStyle: statusStyle },
  { field: 'trader', headerName: 'Trader', width: 88 },
  { field: 'time', headerName: 'Time', width: 96 },
];

/** Child (detail) grid columns. */
export const ORDER_DETAIL_COLUMNS: ColDef<ChildOrder>[] = [
  { field: 'id', headerName: 'Child ID', minWidth: 130 },
  { field: 'venue', headerName: 'Venue', width: 140 },
  { field: 'qty', headerName: 'Qty', width: 92, type: 'rightAligned', valueFormatter: mmFmt },
  { field: 'filledQty', headerName: 'Filled', width: 92, type: 'rightAligned', valueFormatter: mmFmt },
  { field: 'px', headerName: 'Px', width: 96, type: 'rightAligned', valueFormatter: pxFmt },
  { field: 'status', headerName: 'Status', width: 134, cellStyle: statusStyle },
  { field: 'time', headerName: 'Time', width: 96 },
];

/**
 * Master/detail grid options. The master grid's theme is set by the host
 * component (theme prop); we set the detail grid's theme here so it matches.
 */
export function buildOrderGridOptions(theme: Theme): GridOptions<ParentOrder> {
  return {
    columnDefs: ORDER_MASTER_COLUMNS,
    defaultColDef: { sortable: true, filter: true, resizable: true, flex: 1, minWidth: 84 },
    getRowId: (p) => p.data.id,
    masterDetail: true,
    detailRowAutoHeight: true,
    rowSelection: { mode: 'singleRow', checkboxes: false },
    detailCellRendererParams: {
      detailGridOptions: {
        theme,
        columnDefs: ORDER_DETAIL_COLUMNS,
        defaultColDef: { sortable: true, resizable: true, flex: 1, minWidth: 84 },
        headerHeight: 26,
        rowHeight: 22,
      },
      getDetailRowData: (params: { data: ParentOrder; successCallback: (rows: ChildOrder[]) => void }) =>
        params.successCallback(params.data.children),
    },
  };
}
