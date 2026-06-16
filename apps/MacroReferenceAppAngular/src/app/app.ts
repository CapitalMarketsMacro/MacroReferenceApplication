import { Component, computed, inject } from '@angular/core';
import { MenubarModule } from 'primeng/menubar';
import type { MenuItem } from 'primeng/api';
import { Blotter } from './blotter/blotter';
import { ThemeService } from './theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MenubarModule, Blotter],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly themeSvc = inject(ThemeService);

  readonly isDark = this.themeSvc.isDark;
  readonly themeIcon = computed(() =>
    this.isDark() ? 'pi pi-moon' : 'pi pi-sun',
  );

  readonly navItems: MenuItem[] = [
    { label: 'Rates Blotter', styleClass: 'macro-nav-active' },
    { label: 'Analytics' },
    { label: 'Orders' },
  ];

  toggleTheme(): void {
    this.themeSvc.toggle();
  }
}
