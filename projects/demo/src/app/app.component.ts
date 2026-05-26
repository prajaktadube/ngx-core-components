import { Component, computed, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DEMO_NAV_GROUPS } from './core/demo-nav.config';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private readonly isBrowser = typeof window !== 'undefined';

  constructor(private router: Router) {
    this.currentUrl.set(this.normalizePath(this.router.url));
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentUrl.set(this.normalizePath(event.urlAfterRedirects));
        this.onRouteChanged();
      }
    });

    if (this.isMobileView()) {
      this.sidebarOpen.set(false);
    }
  }

  sidebarOpen = signal(true);
  searchQuery = signal('');
  currentUrl = signal('/home');

  navGroups = DEMO_NAV_GROUPS;

  featuredItems = computed(() =>
    this.navGroups
      .flatMap(group => group.items)
      .filter(item => item.featured)
      .slice(0, 6)
  );

  visibleGroups = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    return this.navGroups
      .map(group => ({
        ...group,
        items: group.items.filter(item => {
          if (!query) return true;
          const haystack = `${item.label} ${item.desc} ${item.keywords ?? ''}`.toLowerCase();
          return haystack.includes(query);
        }),
      }))
      .filter(group => group.items.length > 0);
  });

  activeItem = computed(() =>
    this.navGroups.flatMap(group => group.items).find(item => item.path === this.currentUrl())
  );

  currentTitle = computed(() => this.activeItem()?.label ?? 'Component Demo');
  currentDescription = computed(
    () => this.activeItem()?.desc ?? 'Explore the component demo library.'
  );

  isSearching = computed(() => this.searchQuery().trim().length > 0);

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  onSearchInput(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  onNavClick(): void {
    if (this.isMobileView()) {
      this.closeSidebar();
    }
  }

  private onRouteChanged(): void {
    if (this.isMobileView()) {
      this.closeSidebar();
    }
  }

  private normalizePath(path: string): string {
    const base = path.split('?')[0].split('#')[0];
    return base || '/home';
  }

  private isMobileView(): boolean {
    return this.isBrowser ? window.innerWidth <= 960 : false;
  }
}