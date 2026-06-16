import {
  Component,
  OnDestroy,
  OnInit,
  computed,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { ColDef, GridOptions, GetRowIdParams } from 'ag-grid-community';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ToolbarModule } from 'primeng/toolbar';

import { MacroGrid } from '../macro/macro-grid';
import {
  ASSET_CLASS_FILTERS,
  type AssetClassFilter,
  type Instrument,
  createInstruments,
  decimalsFor,
  tickInstruments,
} from '../macro/instruments';

const VENUES = [
  'TradeWeb',
  'BBG',
  'MarketAxess',
  'BrokerTec',
  '360T',
  'CME',
  'Eurex',
  'MTS',
];

@Component({
  selector: 'app-blotter',
  standalone: true,
  imports: [
    FormsModule,
    MacroGrid,
    ToolbarModule,
    ButtonModule,
    SelectModule,
    SelectButtonModule,
    InputNumberModule,
    DialogModule,
  ],
  templateUrl: './blotter.html',
  styleUrl: './blotter.css',
})
export class Blotter implements OnInit, OnDestroy {
  // ----- Filter toolbar state (rates-specific) -----
  readonly assetClassOptions = ASSET_CLASS_FILTERS.map((v) => ({ label: v, value: v }));
  readonly assetClass = signal<AssetClassFilter>('ALL');

  /** ngModel bridge for the asset-class SelectButton. */
  get assetClassModel(): AssetClassFilter {
    return this.assetClass();
  }
  set assetClassModel(v: AssetClassFilter) {
    this.assetClass.set(v);
  }

  // ----- Grid data -----
  private readonly rows = signal<Instrument[]>(createInstruments());

  /** Asset-class filter only — the text search is now the wrapper's quick filter. */
  readonly filteredRows = computed<Instrument[]>(() => {
    const ac = this.assetClass();
    return this.rows().filter((r) => ac === 'ALL' || r.ac === ac);
  });

  // ----- KPI cards -----
  readonly kpiInstruments = computed(() => this.filteredRows().length);
  readonly kpiLive = computed(
    () => this.filteredRows().filter((r) => r.status === 'live').length,
  );

  // ----- Order ticket dialog -----
  readonly ticketVisible = signal(false);

  /** ngModel bridge for the dialog [(visible)]. */
  get ticketVisibleModel(): boolean {
    return this.ticketVisible();
  }
  set ticketVisibleModel(v: boolean) {
    this.ticketVisible.set(v);
  }
  readonly sideOptions = [
    { label: 'Buy', value: 'Buy' },
    { label: 'Sell', value: 'Sell' },
  ];
  side: 'Buy' | 'Sell' = 'Buy';
  quantity = 25;
  price = 0;
  venue = VENUES[0];
  readonly venueOptions = VENUES.map((v) => ({ label: v, value: v }));
  ticketInstrumentName = '';

  // ----- Grid wiring -----
  private tickHandle?: ReturnType<typeof setInterval>;

  readonly getRowId = (params: GetRowIdParams<Instrument>) => params.data.id;

  readonly columnDefs: ColDef<Instrument>[] = [
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
      valueFormatter: (p) => this.formatPrice(p.value, p.data),
    },
    {
      field: 'ask',
      headerName: 'Ask',
      width: 104,
      type: 'rightAligned',
      cellClass: 'mkt-num ask',
      enableCellChangeFlash: true,
      valueFormatter: (p) => this.formatPrice(p.value, p.data),
    },
    {
      field: 'last',
      headerName: 'Last',
      width: 104,
      type: 'rightAligned',
      cellClass: 'mkt-num',
      enableCellChangeFlash: true,
      valueFormatter: (p) => this.formatPrice(p.value, p.data),
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
        (p.value >= 0 ? '+' : '') + this.formatPrice(p.value, p.data),
    },
    { field: 'venue', headerName: 'Venue', width: 120 },
    { field: 'status', headerName: 'Status', width: 96 },
  ];

  /** Rates-specific grid options (the wrapper owns sideBar/defaultColDef/theme/density). */
  readonly gridOptions: GridOptions<Instrument> = {
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
  };

  ngOnInit(): void {
    this.tickHandle = setInterval(() => {
      this.rows.set(tickInstruments(this.rows()));
    }, 900);
  }

  ngOnDestroy(): void {
    if (this.tickHandle) clearInterval(this.tickHandle);
  }

  openTicket(): void {
    const seed = this.filteredRows()[0] ?? this.rows()[0];
    if (seed) {
      this.ticketInstrumentName = seed.name;
      this.price = Number(seed.last.toFixed(decimalsFor(seed.ac)));
    } else {
      this.ticketInstrumentName = '';
      this.price = 0;
    }
    this.side = 'Buy';
    this.quantity = 25;
    this.venue = VENUES[0];
    this.ticketVisible.set(true);
  }

  cancelTicket(): void {
    this.ticketVisible.set(false);
  }

  submitTicket(): void {
    console.log('Order ticket submitted', {
      instrument: this.ticketInstrumentName,
      side: this.side,
      quantity: this.quantity,
      price: this.price,
      venue: this.venue,
    });
    this.ticketVisible.set(false);
  }

  /** Format a numeric price using the row's asset-class precision. */
  private formatPrice(value: unknown, data?: Instrument): string {
    if (value == null) return '';
    const decimals = data ? decimalsFor(data.ac) : 4;
    return Number(value).toFixed(decimals);
  }
}
