import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  ColDef,
  GridOptions,
  ValueFormatterParams,
} from 'ag-grid-community';
import { Toolbar } from 'primereact/toolbar';
import { Button } from 'primereact/button';
import { SelectButton } from 'primereact/selectbutton';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Dialog } from 'primereact/dialog';

import { MacroGrid } from '../macro/MacroGrid';
import {
  ASSET_CLASS_FILTERS,
  createInstruments,
  decimalsFor,
  tickInstruments,
  type AssetClassFilter,
  type Instrument,
} from '../macro/instruments';

type Side = 'Buy' | 'Sell';

const VENUE_OPTIONS = [
  'TradeWeb',
  'BBG',
  'MarketAxess',
  'BrokerTec',
  '360T',
  'CME',
  'Eurex',
  'MTS',
];

/** Format a price using the row's asset-class precision. Guards group/agg rows
 * (which have no `data`) so grouping doesn't crash the render. */
function formatPrice(value: unknown, data?: Instrument): string {
  if (value == null) return '';
  const decimals = data ? decimalsFor(data.ac) : 4;
  return Number(value).toFixed(decimals);
}

const priceFormatter = (p: ValueFormatterParams) =>
  formatPrice(p.value, p.data as Instrument | undefined);

export function Blotter() {
  const [rows, setRows] = useState<Instrument[]>(() => createInstruments());
  const [assetClass, setAssetClass] = useState<AssetClassFilter>('ALL');

  const [ticketOpen, setTicketOpen] = useState(false);
  const [side, setSide] = useState<Side>('Buy');
  const [qty, setQty] = useState<number>(25);
  const [price, setPrice] = useState<number>(0);
  const [venue, setVenue] = useState<string>(VENUE_OPTIONS[0]);
  const [ticketInstrument, setTicketInstrument] = useState<Instrument | null>(
    null,
  );

  // Live ticking — produce a new frame every 900ms.
  useEffect(() => {
    const id = window.setInterval(() => {
      setRows((rs) => tickInstruments(rs));
    }, 900);
    return () => window.clearInterval(id);
  }, []);

  // Asset-class narrowing only — the free-text search is now the wrapper's
  // generic quick filter.
  const filteredRows = useMemo(
    () =>
      assetClass === 'ALL' ? rows : rows.filter((r) => r.ac === assetClass),
    [rows, assetClass],
  );

  const filteredRowsRef = useRef(filteredRows);
  filteredRowsRef.current = filteredRows;

  const liveCount = useMemo(
    () => filteredRows.filter((r) => r.status === 'live').length,
    [filteredRows],
  );

  const columnDefs = useMemo<ColDef[]>(
    () => [
      { field: 'name', headerName: 'Instrument', minWidth: 190, pinned: 'left' },
      { field: 'tenor', headerName: 'Tenor', width: 80 },
      { field: 'ccy', headerName: 'Ccy', width: 72 },
      { field: 'ac', headerName: 'Class', width: 84, enableRowGroup: true },
      {
        field: 'bid',
        headerName: 'Bid',
        width: 104,
        type: 'rightAligned',
        cellClass: 'mkt-num bid',
        enableCellChangeFlash: true,
        valueFormatter: priceFormatter,
      },
      {
        field: 'ask',
        headerName: 'Ask',
        width: 104,
        type: 'rightAligned',
        cellClass: 'mkt-num ask',
        enableCellChangeFlash: true,
        valueFormatter: priceFormatter,
      },
      {
        field: 'last',
        headerName: 'Last',
        width: 104,
        type: 'rightAligned',
        cellClass: 'mkt-num',
        enableCellChangeFlash: true,
        valueFormatter: priceFormatter,
      },
      {
        field: 'chg',
        headerName: 'Chg',
        width: 104,
        type: 'rightAligned',
        enableCellChangeFlash: true,
        cellClassRules: {
          'mkt-up': (p) => p.value >= 0,
          'mkt-down': (p) => p.value < 0,
        },
        valueFormatter: (p) =>
          p.value == null
            ? ''
            : (p.value >= 0 ? '+' : '') +
              formatPrice(p.value, p.data as Instrument | undefined),
      },
      { field: 'venue', headerName: 'Venue', width: 120 },
      { field: 'status', headerName: 'Status', width: 96 },
    ],
    [],
  );

  // Rates-specific grid options (the wrapper owns sideBar/defaultColDef/theme).
  const gridOptions = useMemo<GridOptions>(
    () => ({
      rowGroupPanelShow: 'always',
      rowSelection: { mode: 'multiRow' },
      cellSelection: true,
      animateRows: true,
      enableCharts: true,
      statusBar: {
        statusPanels: [
          { statusPanel: 'agTotalAndFilteredRowCountComponent', align: 'left' },
          { statusPanel: 'agSelectedRowCountComponent' },
          { statusPanel: 'agAggregationComponent', align: 'right' },
        ],
      },
    }),
    [],
  );

  const getRowId = useCallback(
    (p: { data: Instrument }) => p.data.id,
    [],
  );

  const openTicket = useCallback(() => {
    const inst = filteredRowsRef.current[0] ?? rows[0] ?? null;
    setTicketInstrument(inst);
    setSide('Buy');
    setQty(25);
    setPrice(inst ? Number(inst.last.toFixed(decimalsFor(inst.ac))) : 0);
    setVenue(inst?.venue && VENUE_OPTIONS.includes(inst.venue) ? inst.venue : VENUE_OPTIONS[0]);
    setTicketOpen(true);
  }, [rows]);

  const submitOrder = useCallback(() => {
    console.log('Submit Order', {
      instrument: ticketInstrument?.name ?? null,
      side,
      qty,
      price,
      venue,
    });
    setTicketOpen(false);
  }, [ticketInstrument, side, qty, price, venue]);

  const toolbarStart = (
    <div className="macro-toolbar-group">
      <SelectButton
        value={assetClass}
        options={ASSET_CLASS_FILTERS as unknown as string[]}
        onChange={(e) => {
          if (e.value) setAssetClass(e.value as AssetClassFilter);
        }}
        allowEmpty={false}
      />
    </div>
  );

  const toolbarEnd = (
    <div className="macro-toolbar-group">
      <Button label="New Order" icon="pi pi-plus" onClick={openTicket} />
    </div>
  );

  const ticketFooter = (
    <div className="macro-ticket-footer">
      <Button label="Cancel" text onClick={() => setTicketOpen(false)} />
      <Button label="Submit Order" icon="pi pi-check" onClick={submitOrder} />
    </div>
  );

  return (
    <div className="macro-blotter">
      <Toolbar start={toolbarStart} end={toolbarEnd} className="macro-filter-toolbar" />

      <div className="macro-kpi-row">
        <div className="macro-kpi-card">
          <div className="macro-kpi-label">Instruments</div>
          <div className="macro-kpi-value">{filteredRows.length}</div>
        </div>
        <div className="macro-kpi-card">
          <div className="macro-kpi-label">Live</div>
          <div className="macro-kpi-value">{liveCount}</div>
        </div>
        <div className="macro-kpi-card">
          <div className="macro-kpi-label">Σ Notional</div>
          <div className="macro-kpi-value">$2.45BN</div>
        </div>
        <div className="macro-kpi-card">
          <div className="macro-kpi-label">Day P&amp;L</div>
          <div className="macro-kpi-value macro-kpi-pnl">+$182.4K</div>
        </div>
      </div>

      <div className="macro-grid-wrap">
        <MacroGrid
          rowData={filteredRows}
          columnDefs={columnDefs}
          getRowId={getRowId}
          gridOptions={gridOptions}
          searchPlaceholder="Filter instrument…"
        />
      </div>

      <Dialog
        header="New Order"
        visible={ticketOpen}
        modal
        onHide={() => setTicketOpen(false)}
        footer={ticketFooter}
        style={{ width: '420px' }}
      >
        <div className="macro-ticket">
          {ticketInstrument && (
            <div className="macro-ticket-inst">{ticketInstrument.name}</div>
          )}
          <div className="macro-field">
            <label className="macro-field-label">Side</label>
            <SelectButton
              value={side}
              options={['Buy', 'Sell']}
              onChange={(e) => {
                if (e.value) setSide(e.value as Side);
              }}
              allowEmpty={false}
            />
          </div>
          <div className="macro-field">
            <label className="macro-field-label">Quantity</label>
            <InputNumber
              value={qty}
              onValueChange={(e) => setQty(e.value ?? 0)}
              suffix=" MM"
            />
          </div>
          <div className="macro-field">
            <label className="macro-field-label">Price</label>
            <InputNumber
              value={price}
              onValueChange={(e) => setPrice(e.value ?? 0)}
              step={0.001}
              minFractionDigits={0}
              maxFractionDigits={5}
            />
          </div>
          <div className="macro-field">
            <label className="macro-field-label">Venue</label>
            <Dropdown
              value={venue}
              options={VENUE_OPTIONS}
              onChange={(e) => setVenue(e.value as string)}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}

export default Blotter;
