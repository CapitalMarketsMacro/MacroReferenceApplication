import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type {
  ColDef,
  GridOptions,
  GridReadyEvent,
  GridApi,
  ValueFormatterParams,
} from 'ag-grid-community';
import { Toolbar } from 'primereact/toolbar';
import { Button } from 'primereact/button';
import { SelectButton } from 'primereact/selectbutton';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dialog } from 'primereact/dialog';

import { buildAgGridTheme, type GridDensity } from '../macro/ag-grid-theme';
import {
  ASSET_CLASS_FILTERS,
  createInstruments,
  decimalsFor,
  tickInstruments,
  type AssetClassFilter,
  type Instrument,
} from '../macro/instruments';

type Density = 'Compact' | 'Normal' | 'Comfortable';
type Side = 'Buy' | 'Sell';

const DENSITY_OPTIONS: Density[] = ['Compact', 'Normal', 'Comfortable'];
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

function densityKey(d: Density): GridDensity {
  if (d === 'Compact') return 'tight';
  if (d === 'Comfortable') return 'cozy';
  return 'normal';
}

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
  const [search, setSearch] = useState('');
  const [density, setDensity] = useState<Density>('Compact');

  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark'),
  );

  const [ticketOpen, setTicketOpen] = useState(false);
  const [side, setSide] = useState<Side>('Buy');
  const [qty, setQty] = useState<number>(25);
  const [price, setPrice] = useState<number>(0);
  const [venue, setVenue] = useState<string>(VENUE_OPTIONS[0]);
  const [ticketInstrument, setTicketInstrument] = useState<Instrument | null>(
    null,
  );

  const gridApiRef = useRef<GridApi | null>(null);

  // Track the .dark class on <html> so the grid theme follows light/dark.
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  // Theme follows color scheme + density (density resizes the grid via params).
  const theme = useMemo(
    () => buildAgGridTheme(isDark, densityKey(density)),
    [isDark, density],
  );

  // The theme param drives row sizing; re-measure rows when density changes.
  useEffect(() => {
    gridApiRef.current?.resetRowHeights();
  }, [density]);

  // Live ticking — produce a new frame every 900ms.
  useEffect(() => {
    const id = window.setInterval(() => {
      setRows((rs) => tickInstruments(rs));
    }, 900);
    return () => window.clearInterval(id);
  }, []);

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (assetClass !== 'ALL' && r.ac !== assetClass) return false;
      if (term && !r.name.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [rows, assetClass, search]);

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

  const gridOptions = useMemo<GridOptions>(
    () => ({
      defaultColDef: {
        sortable: true,
        filter: true,
        resizable: true,
        flex: 1,
        minWidth: 90,
      },
      sideBar: {
        toolPanels: ['columns', 'filters'],
        hiddenByDefault: true,
      },
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

  const onGridReady = useCallback((e: GridReadyEvent) => {
    gridApiRef.current = e.api;
  }, []);

  const toggleColumns = useCallback(() => {
    const api = gridApiRef.current;
    if (!api) return;
    api.setSideBarVisible(!api.isSideBarVisible());
  }, []);

  const openTicket = useCallback(() => {
    const selected = gridApiRef.current?.getSelectedRows?.()[0];
    const inst = selected ?? filteredRows[0] ?? rows[0] ?? null;
    setTicketInstrument(inst);
    setSide('Buy');
    setQty(25);
    setPrice(inst ? Number(inst.last.toFixed(decimalsFor(inst.ac))) : 0);
    setVenue(inst?.venue && VENUE_OPTIONS.includes(inst.venue) ? inst.venue : VENUE_OPTIONS[0]);
    setTicketOpen(true);
  }, [filteredRows, rows]);

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
      <span className="p-input-icon-left">
        <InputText
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter instrument…"
        />
      </span>
    </div>
  );

  const toolbarEnd = (
    <div className="macro-toolbar-group">
      <Dropdown
        value={density}
        options={DENSITY_OPTIONS}
        onChange={(e) => setDensity(e.value as Density)}
      />
      <Button label="Columns" icon="pi pi-table" outlined onClick={toggleColumns} />
      <Button label="New Order" icon="pi pi-plus" onClick={openTicket} />
    </div>
  );

  const ticketFooter = (
    <div className="macro-ticket-footer">
      <Button label="Cancel" text onClick={() => setTicketOpen(false)} />
      <Button label="Submit Order" icon="pi pi-check" onClick={submitOrder} />
    </div>
  );

  const dataDensity = densityKey(density);

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

      <div className="macro-grid-wrap" data-density={dataDensity}>
        <AgGridReact
          theme={theme}
          columnDefs={columnDefs}
          rowData={filteredRows}
          gridOptions={gridOptions}
          getRowId={getRowId}
          onGridReady={onGridReady}
          enableCharts
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
