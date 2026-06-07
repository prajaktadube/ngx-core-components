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
  isDarkMode = signal(false);
  sidebarOpen = signal(true);
  searchQuery = signal('');
  currentUrl = signal('/home');

  expandedGroups = signal<Record<string, boolean>>({
    'Foundations': true,
    'Inputs & Actions': true,
    'Layout & Overlays': true,
    'Data Presentation': false,
    'Visualizations': false,
    'Intelligence': false,
    'Feedback': false,
    'Advanced Inputs': false,
  });
  expandedItems = signal<Record<string, boolean>>({});

  constructor(private router: Router) {
    this.currentUrl.set(this.normalizePath(this.router.url));
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentUrl.set(this.normalizePath(event.urlAfterRedirects));
        this.autoExpandActive();
        this.onRouteChanged();
      }
    });

    if (this.isMobileView()) {
      this.sidebarOpen.set(false);
    }

    this.initTheme();
    this.autoExpandActive();
  }

  navGroups = DEMO_NAV_GROUPS;

  parseItemPath(item: any): any {
    const parts = item.path.split('?');
    const routePath = parts[0];
    const queryParams: Record<string, string> = {};
    if (parts[1]) {
      const searchParams = new URLSearchParams(parts[1]);
      searchParams.forEach((val, key) => {
        queryParams[key] = val;
      });
    }
    const parsed: any = {
      ...item,
      routePath,
      queryParams
    };
    if (item.children) {
      parsed.children = item.children.map((child: any) => this.parseItemPath(child));
    }
    return parsed;
  }

  featuredItems = computed(() => {
    const flatLeafs: any[] = [];
    const traverse = (items: any[]) => {
      for (const item of items) {
        if (item.children) {
          traverse(item.children);
        } else {
          flatLeafs.push(item);
        }
      }
    };
    this.navGroups.forEach(group => traverse(group.items));
    return flatLeafs
      .filter(item => item.featured)
      .map(item => this.parseItemPath(item))
      .slice(0, 6);
  });

  visibleGroups = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    return this.navGroups
      .map(group => {
        const filteredItems: any[] = [];
        for (const item of group.items) {
          if (item.children) {
            const matchingChildren = item.children.filter(child => {
              if (!query) return true;
              const haystack = `${child.label} ${child.desc} ${child.keywords ?? ''}`.toLowerCase();
              return haystack.includes(query);
            });
            const parentMatches = query ? `${item.label} ${item.desc} ${item.keywords ?? ''}`.toLowerCase().includes(query) : false;
            if (matchingChildren.length > 0 || parentMatches) {
              const parsedParent = this.parseItemPath(item);
              parsedParent.children = (parentMatches ? item.children : matchingChildren).map(child => this.parseItemPath(child));
              filteredItems.push(parsedParent);
            }
          } else {
            if (!query) {
              filteredItems.push(this.parseItemPath(item));
            } else {
              const haystack = `${item.label} ${item.desc} ${item.keywords ?? ''}`.toLowerCase();
              if (haystack.includes(query)) {
                filteredItems.push(this.parseItemPath(item));
              }
            }
          }
        }
        return {
          ...group,
          items: filteredItems
        };
      })
      .filter(group => group.items.length > 0);
  });

  activeItem = computed(() => {
    const flatLeafs: any[] = [];
    const traverse = (items: any[]) => {
      for (const item of items) {
        if (item.children) {
          traverse(item.children);
        } else {
          flatLeafs.push(item);
        }
      }
    };
    this.navGroups.forEach(group => traverse(group.items));
    const items = flatLeafs.map(item => this.parseItemPath(item));
    const exactMatch = items.find(item => item.path === decodeURIComponent(this.router.url));
    if (exactMatch) return exactMatch;
    const currentBase = this.currentUrl().split('?')[0];
    return items.find(item => item.routePath === currentBase);
  });

  currentTitle = computed(() => this.activeItem()?.label ?? 'Component Demo');
  currentDescription = computed(
    () => this.activeItem()?.desc ?? 'Explore the component demo library.'
  );

  isSearching = computed(() => this.searchQuery().trim().length > 0);

  quickGroups = computed(() =>
    this.navGroups.map(group => ({
      title: group.title,
      icon: group.icon,
      count: group.items.reduce((total, item) => total + (item.children?.length ?? 1), 0),
    }))
  );

  searchSummary = computed(() => {
    const query = this.searchQuery().trim();
    const visibleCount = this.visibleGroups().reduce((total, group) => total + group.items.length, 0);

    if (query) {
      return `Showing ${visibleCount} match${visibleCount === 1 ? '' : 'es'} for “${query}”.`;
    }

    return `Browse ${visibleCount} components across ${this.navGroups.length} categories.`;
  });

  toggleGroup(title: string): void {
    this.expandedGroups.update(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  }

  isGroupExpanded(title: string): boolean {
    return this.expandedGroups()[title] !== false || this.isSearching();
  }

  toggleItem(label: string): void {
    this.expandedItems.update(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  }

  isItemExpanded(label: string): boolean {
    return !!this.expandedItems()[label] || this.isSearching();
  }

  private autoExpandActive(): void {
    const url = decodeURIComponent(this.router.url);
    const traverse = (items: any[], groupTitle: string) => {
      for (const item of items) {
        if (item.children) {
          const hasActiveChild = item.children.some((child: any) => {
            const childDecoded = decodeURIComponent(child.path);
            return childDecoded === url || this.normalizePath(childDecoded) === this.normalizePath(url);
          });
          if (hasActiveChild) {
            this.expandedItems.update(prev => ({
              ...prev,
              [item.label]: true
            }));
            this.expandedGroups.update(prev => ({
              ...prev,
              [groupTitle]: true
            }));
          }
          traverse(item.children, groupTitle);
        }
      }
    };
    this.navGroups.forEach(group => traverse(group.items, group.title));
  }

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  groupId(title: string): string {
    return this.slugify(title);
  }

  jumpToGroup(title: string): void {
    this.searchQuery.set('');
    this.expandedGroups.update(prev => ({ ...prev, [title]: true }));

    if (this.isBrowser) {
      const groupId = this.slugify(title);
      requestAnimationFrame(() => {
        const target = document.getElementById(`group-${groupId}`);
        const sidebar = document.querySelector('.sidebar-content') as HTMLElement | null;

        if (sidebar && target) {
          sidebar.scrollTo({
            top: Math.max(target.offsetTop - 12, 0),
            behavior: 'smooth'
          });
          return;
        }

        target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }

    if (this.isMobileView()) {
      this.closeSidebar();
    }
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

  toggleTheme(): void {
    const nextDark = !this.isDarkMode();
    this.isDarkMode.set(nextDark);
    if (this.isBrowser) {
      localStorage.setItem('ngx-demo-theme', nextDark ? 'dark' : 'light');
    }
    this.applyTheme(nextDark);
  }

  private initTheme(): void {
    if (!this.isBrowser) return;
    const saved = localStorage.getItem('ngx-demo-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = saved ? saved === 'dark' : prefersDark;
    this.isDarkMode.set(isDark);
    this.applyTheme(isDark);
  }

  private applyTheme(isDark: boolean): void {
    if (!this.isBrowser) return;
    if (isDark) {
      document.body.classList.add('dark-theme');
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark-theme');
      document.body.classList.remove('dark');
    }
  }

  private normalizePath(path: string): string {
    const base = path.split('?')[0].split('#')[0];
    return base || '/home';
  }

  private slugify(value: string): string {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  private isMobileView(): boolean {
    return this.isBrowser ? window.innerWidth <= 960 : false;
  }
}