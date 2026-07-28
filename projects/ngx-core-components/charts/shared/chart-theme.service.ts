import { Injectable } from '@angular/core';
import { CHART_COLORS } from './chart-utils';

export type ChartThemeName = 'light' | 'dark' | 'highContrast' | 'pastel' | 'corporate' | 'monoChrome';
export type ColorblindMode = 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia';

export interface ChartTheme {
  name: ChartThemeName;
  colors: string[];
  bg: string;
  grid: string;
  axis: string;
  axisText: string;
  tooltipBg: string;
  tooltipColor: string;
}

@Injectable({ providedIn: 'root' })
export class ChartThemeService {
  
  private themes: Record<ChartThemeName, ChartTheme> = {
    light: {
      name: 'light',
      colors: [...CHART_COLORS],
      bg: '#ffffff',
      grid: '#e2e8f0',
      axis: '#94a3b8',
      axisText: '#64748b',
      tooltipBg: 'rgba(255, 255, 255, 0.8)',
      tooltipColor: '#0f172a'
    },
    dark: {
      name: 'dark',
      colors: ['#60a5fa', '#f43f5e', '#34d399', '#fbbf24', '#c084fc', '#2dd4bf', '#ef4444', '#3b82f6', '#10b981', '#f97316'],
      bg: '#0f172a',
      grid: '#334155',
      axis: '#475569',
      axisText: '#cbd5e1',
      tooltipBg: 'rgba(15, 23, 42, 0.8)',
      tooltipColor: '#f8fafc'
    },
    highContrast: {
      name: 'highContrast',
      colors: ['#ffff00', '#00ffff', '#ff00ff', '#00ff00', '#ff0000', '#0000ff', '#ffffff', '#ff8800', '#88ff00', '#ff0088'],
      bg: '#000000',
      grid: '#ffffff',
      axis: '#ffffff',
      axisText: '#ffffff',
      tooltipBg: '#000000',
      tooltipColor: '#ffffff'
    },
    pastel: {
      name: 'pastel',
      colors: ['#ffb3ba', '#ffdfba', '#ffffba', '#baffc9', '#bae1ff', '#e8baff', '#ffbaf2', '#ffc4ba', '#e2ffba', '#bacfff'],
      bg: '#fdfdfd',
      grid: '#f0f0f0',
      axis: '#d0d0d0',
      axisText: '#888888',
      tooltipBg: 'rgba(255, 255, 255, 0.9)',
      tooltipColor: '#333333'
    },
    corporate: {
      name: 'corporate',
      colors: ['#003f5c', '#2f4b7c', '#665191', '#a05195', '#d45087', '#f95d6a', '#ff7c43', '#ffa600', '#488f31', '#de425b'],
      bg: '#ffffff',
      grid: '#eaebed',
      axis: '#c4c8cb',
      axisText: '#4a4e53',
      tooltipBg: 'rgba(240, 240, 240, 0.9)',
      tooltipColor: '#1e1e1e'
    },
    monoChrome: {
      name: 'monoChrome',
      colors: ['#03045e', '#023e8a', '#0077b6', '#0096c7', '#00b4d8', '#48cae4', '#90e0ef', '#ade8f4', '#caf0f8', '#e0fbfc'],
      bg: '#ffffff',
      grid: '#f1f5f9',
      axis: '#cbd5e1',
      axisText: '#475569',
      tooltipBg: 'rgba(255, 255, 255, 0.8)',
      tooltipColor: '#0f172a'
    }
  };

  getTheme(name: ChartThemeName): ChartTheme {
    return this.themes[name] || this.themes['light'];
  }

  applyTheme(element: HTMLElement, themeName: ChartThemeName): void {
    const theme = this.getTheme(themeName);
    element.style.setProperty('--ngx-chart-bg', theme.bg);
    element.style.setProperty('--ngx-chart-grid', theme.grid);
    element.style.setProperty('--ngx-chart-axis', theme.axis);
    element.style.setProperty('--ngx-chart-axis-text', theme.axisText);
    element.style.setProperty('--ngx-chart-tooltip-bg', theme.tooltipBg);
    element.style.setProperty('--ngx-chart-tooltip-color', theme.tooltipColor);
  }

  getColorblindPalette(mode: ColorblindMode): string[] {
    switch (mode) {
      case 'deuteranopia':
      case 'protanopia':
        // Wong / Okabe-Ito friendly
        return ['#E69F00', '#56B4E9', '#009E73', '#F0E442', '#0072B2', '#D55E00', '#CC79A7', '#000000', '#999999', '#FFFFFF'];
      case 'tritanopia':
        // Tritanopia friendly
        return ['#FF0000', '#FF9900', '#00FF00', '#00FFFF', '#0000FF', '#9900FF', '#FF00FF', '#000000', '#999999', '#FFFFFF'];
      case 'none':
      default:
        return [...CHART_COLORS];
    }
  }
}
