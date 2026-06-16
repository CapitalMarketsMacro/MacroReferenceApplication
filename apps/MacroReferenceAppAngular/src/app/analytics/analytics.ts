import { Component, computed, inject } from '@angular/core';
import { AgCharts } from 'ag-charts-angular';

import {
  notionalByClassOptions,
  volumeByVenueOptions,
  yieldCurveOptions,
} from '../macro/analytics';
import { createParentOrders } from '../macro/orders';
import { createTrades } from '../macro/trades';
import { ThemeService } from '../theme.service';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [AgCharts],
  templateUrl: './analytics.html',
  styleUrl: './analytics.css',
})
export class Analytics {
  private readonly themeSvc = inject(ThemeService);

  // Chart options recompute from the current dark flag so the charts re-theme
  // whenever the user toggles dark/light in the header.
  readonly curve = computed(() => yieldCurveOptions(this.themeSvc.isDark()));
  readonly notional = computed(() =>
    notionalByClassOptions(this.themeSvc.isDark()),
  );
  readonly volume = computed(() => volumeByVenueOptions(this.themeSvc.isDark()));

  // KPI values derived from the shared mock domain.
  readonly totalNotional = '$10.4BN';
  readonly openOrders = createParentOrders().filter(
    (o) => o.status === 'Working' || o.status === 'Partially Filled',
  ).length;
  readonly todaysTrades = createTrades().length;
  readonly avgFill = '62%';
}
