import { Component, computed, inject, signal } from '@angular/core';
import { MenubarModule } from 'primeng/menubar';
import type { MenuItem } from 'primeng/api';
import { Blotter } from './blotter/blotter';
import { Analytics } from './analytics/analytics';
import { Orders } from './orders/orders';
import { ThemeService } from './theme.service';

type ActiveView = 'rates' | 'analytics' | 'orders';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MenubarModule, Blotter, Analytics, Orders],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly themeSvc = inject(ThemeService);

  readonly isDark = this.themeSvc.isDark;
  readonly themeIcon = computed(() =>
    this.isDark() ? 'pi pi-moon' : 'pi pi-sun',
  );

  readonly activeView = signal<ActiveView>('rates');

  /** Menubar items — the active one is highlighted via styleClass. */
  readonly navItems = computed<MenuItem[]>(() => {
    const active = this.activeView();
    const item = (
      label: string,
      view: ActiveView,
    ): MenuItem => ({
      label,
      styleClass: active === view ? 'macro-nav-active' : undefined,
      command: () => this.activeView.set(view),
    });
    return [
      item('Rates Blotter', 'rates'),
      item('Analytics', 'analytics'),
      item('Orders', 'orders'),
    ];
  });

  toggleTheme(): void {
    this.themeSvc.toggle();
  }
}
