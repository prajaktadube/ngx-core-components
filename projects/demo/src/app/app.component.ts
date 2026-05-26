import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  sidebarOpen = signal(true);
  searchQuery = signal('');
  darkMode = signal(localStorage.getItem('ngx-dark-mode') === 'true');

  constructor() {
    this.applyTheme(this.darkMode());
  }

  toggleDarkMode(): void {
    const nextVal = !this.darkMode();
    this.darkMode.set(nextVal);
    localStorage.setItem('ngx-dark-mode', String(nextVal));
    this.applyTheme(nextVal);
  }

  private applyTheme(dark: boolean): void {
    if (dark) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }

  navGroups = [
    {
      title: 'Documentation',
      icon: '📚',
      items: [
        { path: '/home', label: 'Home', icon: '🏠', desc: 'Library overview' },
        { path: '/getting-started', label: 'Getting Started', icon: '⚙️', desc: 'Installation & setup' },
        { path: '/theming', label: 'Theming & Styling', icon: '🎨', desc: 'CSS customization' },
      ]
    },
    {
      title: 'Buttons & Actions (5)',
      icon: '🖱️',
      items: [
        { path: '/buttons', label: 'Buttons & Chips', icon: '🔘', desc: 'Button, ButtonGroup, Chip, SplitButton' },
      ]
    },
    {
      title: 'Layout (5)',
      icon: '🧩',
      items: [
        { path: '/layout', label: 'Layout Components', icon: '📐', desc: 'Card, TabStrip, Accordion, Stepper' },
      ]
    },
    {
      title: 'Forms & Inputs (15)',
      icon: '✏️',
      items: [
        { path: '/inputs', label: 'All Input Controls', icon: '📝', desc: 'TextBox, Dropdown, Slider, ColorPicker and more' },
      ]
    },
    {
      title: 'Charts & Visualization (5)',
      icon: '📊',
      items: [
        { path: '/charts', label: 'Basic Charts', icon: '📈', desc: 'Bar, Line, Pie, Sparkline' },
        { path: '/basic', label: 'Gantt - Basic', icon: '📅', desc: 'Timeline & scheduling' },
        { path: '/large-dataset', label: 'Gantt - Large Data', icon: '⚡', desc: 'Performance optimized' },
        { path: '/interactive', label: 'Gantt - Interactive', icon: '🖱️', desc: 'Drag-drop editing' },
      ]
    },
    {
      title: 'Data Display (3)',
      icon: '🗂️',
      items: [
        { path: '/grid', label: 'Data Grid', icon: '📑', desc: 'Advanced table with sort/filter' },
        { path: '/tree-list', label: 'Tree & List Views', icon: '🌳', desc: 'Hierarchical data display' },
        { path: '/tooltip', label: 'Tooltips & Popovers', icon: '💬', desc: 'Contextual information' },
      ]
    },
    {
      title: 'Feedback (4)',
      icon: '🔔',
      items: [
        { path: '/feedback', label: 'Feedback Components', icon: '📣', desc: 'Badge, Progress, Skeleton, Notifications' },
      ]
    },
    {
      title: 'Navigation (2)',
      icon: '🧭',
      items: [
        { path: '/navigation', label: 'Navigation', icon: '🧭', desc: 'Breadcrumb, Menu' },
      ]
    },
    {
      title: 'Barcodes (2)',
      icon: '▦',
      items: [
        { path: '/barcodes', label: 'Barcodes & QR', icon: '▦', desc: 'QR Code, Code128 Barcode' },
      ]
    },
    {
      title: 'Overlays (1)',
      icon: '🪟',
      items: [
        { path: '/dialog', label: 'Dialog & Modal', icon: '🪟', desc: 'Programmatic overlays' },
      ]
    },
  ];

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }

  onSearchInput(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  isNavItemVisible(item: any): boolean {
    if (!this.searchQuery()) return true;
    const query = this.searchQuery().toLowerCase();
    return item.label.toLowerCase().includes(query) ||
           item.desc?.toLowerCase().includes(query);
  }

  getVisibleGroups() {
    return this.navGroups.map(group => ({
      ...group,
      items: group.items.filter(item => this.isNavItemVisible(item))
    })).filter(group => group.items.length > 0);
  }
}