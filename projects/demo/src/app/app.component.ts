import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  sidebarOpen = true;

  navGroups = [
    {
      title: 'Overview',
      items: [
        { path: '/home', label: 'Home', icon: '🏠' },
        { path: '/getting-started', label: 'How to Use', icon: '📖' },
        { path: '/theming', label: 'Theming', icon: '🎨' },
      ]
    },
    {
      title: 'Charts & Gantt',
      items: [
        { path: '/charts', label: 'Bar, Line, Pie & Sparkline', icon: '📊' },
        { path: '/basic', label: 'Gantt Chart', icon: '📅' },
        { path: '/large-dataset', label: 'Gantt — Large Dataset', icon: '📦' },
        { path: '/interactive', label: 'Gantt — Interactive', icon: '🖱️' },
      ]
    },
    {
      title: 'Inputs',
      items: [
        { path: '/inputs', label: 'TextBox, Dropdown & Dates', icon: '✏️' },
      ]
    },
    {
      title: 'Data Display',
      items: [
        { path: '/grid', label: 'Data Grid', icon: '🗂️' },
        { path: '/tree-list', label: 'Tree View & List View', icon: '🌳' },
        { path: '/tooltip', label: 'Tooltip & Popover', icon: '💬' },
      ]
    },
    {
      title: 'Overlays',
      items: [
        { path: '/dialog', label: 'Dialog / Overlay', icon: '🪟' },
      ]
    },
  ];

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }
}
