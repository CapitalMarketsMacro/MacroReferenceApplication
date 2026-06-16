import {
  Component,
  OnDestroy,
  OnInit,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import type {
  ColDef,
  GridApi,
  GridOptions,
  GridReadyEvent,
  GetRowIdParams,
  Theme,
} from 'ag-grid-community';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ToolbarModule } from 'primeng/toolbar';

import { buildAgGridTheme, type GridDensity } from '../macro/ag-grid-theme';
import {
  ASSET_CLASS_FILTERS,
  type AssetClassFilter,
  type Instrument,
  createInstruments,
  decimalsFor,
  tickInstruments,
} from '../macro/instruments';
import { ThemeService } from '../theme.service';

type Density = 'Compact' | 'Normal' | 'Comfortable';

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
    AgGridAngular,
    ToolbarModule,
    ButtonModule,
    SelectModule,
    SelectButtonModule,
    InputTextModule,
    InputNumberModule,
    DialogModule,
  ],
  templateUrl: './blotter.html',
  styleUrl: './blotter.css',
})
export class Blotter implements OnInit, OnDestroy {
  private readonly themeSvc = inject(ThemeService);

  /** AG Grid theme — recomputes whenever the dark flag or density changes. */
  readonly theme = computed<Theme>(() =>
    buildAgGridTheme(this.themeSvc.isDark(), this.densityKey()),
  );

  // ----- Filter toolbar state -----
  readonly assetClassOptions = ASSET_CLASS_FILTERS.map((v) => ({ label: v, value: v }));
  readonly assetClass = signal<AssetClassFilter>('ALL');
  readonly search = signal('');

  /** ngModel bridge for the asset-class SelectButton. */
  get assetClassModel(): AssetClassFilter {
    return this.assetClass();
  }
  set assetClassModel(v: AssetClassFilter) {
    this.assetClass.set(v);
  }

  readonly densityOptions: Density[] = ['Compact', 'Normal', 'Comfortable'];
  readonly density = signal<Density>('Compact');

  /** ngModel bridge for the density Select. */
  get densityModel(): Density {
    return this.density();
  }
  set densityModel(v: Density) {
    this.density.set(v);
  }
  /** Maps the density label to the AG Grid theme density key. */
  readonly densityKey = computed<GridDensity>(() => {
    switch (this.density()) {
      case 'Compact':
        return 'tight';
      case 'Comfortable':
        return 'cozy';
      default:
        return 'normal';
    }
  });

  // ----- Grid data -----
  private readonly rows = signal<Instrument[]>(createInstruments());

  readonly filteredRows = computed<Instrument[]>(() => {
    const ac = this.assetClass();
    const q = this.search().trim().toLowerCase();
    return this.rows().filter((r) => {
      if (ac !== 'ALL' && r.ac !== ac) return false;
      if (q && !r.name.toLowerCase().includes(q)) return false;
      return true;
    });
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
  private gridApi?: GridApi<Instrument>;
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

  readonly defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    flex: 1,
    minWidth: 90,
  };

  readonly gridOptions: GridOptions<Instrument> = {
    defaultColDef: this.defaultColDef,
    sideBar: { toolPanels: ['columns', 'filters'], hiddenByDefault: true },
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

  constructor() {
    // Keep the grid's displayed rows in sync with the active filter.
    effect(() => {
      const data = this.filteredRows();
      this.gridApi?.setGridOption('rowData', data);
    });

    // The theme param drives row sizing; re-measure rows when density changes.
    effect(() => {
      this.densityKey();
      const api = this.gridApi;
      if (api) setTimeout(() => api.resetRowHeights(), 0);
    });
  }

  ngOnInit(): void {
    this.tickHandle = setInterval(() => {
      this.rows.set(tickInstruments(this.rows()));
    }, 900);
  }

  ngOnDestroy(): void {
    if (this.tickHandle) clearInterval(this.tickHandle);
  }

  onGridReady(e: GridReadyEvent<Instrument>): void {
    this.gridApi = e.api;
  }

  toggleColumns(): void {
    if (!this.gridApi) return;
    this.gridApi.setSideBarVisible(!this.gridApi.isSideBarVisible());
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
