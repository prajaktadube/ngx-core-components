import{b as J}from"./chunk-EJEBK63T.js";import{$ as Ue,A as ke,B as _e,C as Se,D as Te,E as Pe,F as Me,G as Ee,H as Le,I as De,J as Re,K as Ae,L as Oe,M as $e,N as Ie,O as Ve,P as Be,Q as He,R as Ne,S as ze,T as Ge,U as We,V as Fe,W as je,X as Ye,Y as Xe,Z as Je,_ as qe,aa as Qe,ba as Ke,c as te,ca as Ze,d as ne,da as et,e as oe,ea as tt,f as ae,fa as nt,g as re,ga as ot,ha as at,ia as rt,j as ie,ja as it,k as le,ka as lt,l as se,la as st,m as ce,ma as ct,n as de,na as dt,o as pe,oa as pt,p as ue,pa as ut,q as he,qa as ht,r as ge,ra as gt,s as me,sa as mt,t as xe,ta as xt,u as be,ua as bt,v as fe,w as ve,x as Ce,y as ye,z as we}from"./chunk-QUQKICHB.js";import"./chunk-2UOPP2UL.js";import"./chunk-BBUV2CVA.js";import"./chunk-7NXLUCPK.js";import"./chunk-GOLT4CPP.js";import"./chunk-U2ULQ5FD.js";import"./chunk-PK5C44NJ.js";import{c as q,d as U,g as Q,m as K,n as Z,q as ee}from"./chunk-SJUFXX5O.js";import"./chunk-R2AJ7HBC.js";import"./chunk-46U6HULT.js";import"./chunk-HWBOMEBK.js";import{p as Y,q as X}from"./chunk-IARLGJOW.js";import{Ab as v,Db as x,Eb as c,Ma as a,Mb as A,Nb as H,Pb as d,Qb as f,Rb as _,Sb as N,Ta as R,W as I,_a as V,a as O,aa as g,ac as S,b as $,ba as m,cc as z,db as k,ic as G,jb as p,jc as W,kb as T,lb as w,lc as F,pa as b,pb as u,rb as B,sb as M,tb as E,ub as i,vb as r,vc as j,wb as h}from"./chunk-5NA2GCAU.js";var ft=`import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, viewChild, HostListener, inject, DestroyRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {  CHART_COLORS, ChartSeries, niceTicks, scale, fmtNum  } from './chart-utils';

@Component({
  selector: 'ngx-bar-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <div
      class="ngx-bar-chart"
      (mousemove)="onMouseMove($event)"
      (mouseleave)="onMouseLeave()"
    >
      <!-- Toolbar with Export option -->
      <div class="chart-header">
        <div class="chart-title-space"></div>
        @if (showExport()) {
          <div class="chart-export-menu">
            <button class="export-trigger" (click)="toggleExportMenu($event)" aria-label="Export Menu">\u{1F4E4} Export</button>
            @if (exportMenuOpen()) {
              <div class="export-dropdown">
                <button (click)="onExport('json')">\u{1F4CA} Export JSON</button>
                <button (click)="onExport('csv')">\u{1F4C4} Export CSV</button>
                <button (click)="onExport('svg')">\u{1F5BC}\uFE0F Export SVG</button>
              </div>
            }
          </div>
        }
      </div>

      <!-- Legend -->
      @if (showLegend()) {
        <div class="chart-legend">
          @for (s of series(); track s.name; let i = $index) {
            <span class="legend-item">
              <span class="legend-dot" [style.background]="seriesColor(i)"></span>
              {{ s.name }}
            </span>
          }
        </div>
      }

      <!-- SVG Chart -->
      <svg
        #svgEl
        [attr.width]="'100%'"
        [attr.height]="chartHeight()"
        class="chart-svg"
      >
        <g [attr.transform]="'translate(' + PAD_LEFT + ',' + PAD_TOP + ')'">

          <!-- Y axis grid lines + labels -->
          @for (tick of yTicks(); track tick) {
            <g [attr.transform]="'translate(0,' + yPos(tick) + ')'">
              @if (showGrid()) {
                <line
                  [attr.x1]="0" [attr.x2]="innerW()"
                  stroke="var(--ngx-chart-grid, #ebedf0)" stroke-dasharray="3,3"
                />
              }
              <text x="-8" dy="4" class="axis-label" text-anchor="end">{{ fmtNum(tick) }}</text>
            </g>
          }

          <!-- Column Highlight Ruler (Enterprise interactive UX) -->
          @if (activeColumnIndex() !== null) {
            <rect
              [attr.x]="colStartX(activeColumnIndex()!)"
              [attr.y]="0"
              [attr.width]="groupW()"
              [attr.height]="innerH()"
              class="column-ruler"
            />
          }

          <!-- X axis category labels -->
          @for (cat of categories(); track cat; let i = $index) {
            <text
              [attr.x]="catMidX(i)"
              [attr.y]="innerH() + 16"
              class="axis-label"
              text-anchor="middle"
            >{{ cat }}</text>
          }

          <!-- Bars -->
          @for (s of series(); track s.name; let si = $index) {
            @for (v of s.data; track $index; let ci = $index) {
              @if (v !== null && v !== undefined) {
                <rect
                  [attr.x]="barX(ci, si)"
                  [attr.y]="barY(v)"
                  [attr.width]="singleBarWidth()"
                  [attr.height]="barH(v)"
                  [attr.fill]="barColor(si, s)"
                  [attr.rx]="3"
                  class="bar-rect"
                />
                @if (showLabels() && animateState()) {
                  <text
                    [attr.x]="barX(ci, si) + singleBarWidth() / 2"
                    [attr.y]="barY(v) - 4"
                    class="bar-label"
                    text-anchor="middle"
                  >{{ fmtNum(v) }}</text>
                }
              }
            }
          }

          <!-- Axes -->
          <line x1="0" [attr.x2]="innerW()" [attr.y1]="innerH()" [attr.y2]="innerH()" stroke="var(--ngx-chart-axis, #ced4da)"/>
          <line x1="0" x2="0" y1="0" [attr.y2]="innerH()" stroke="var(--ngx-chart-axis, #ced4da)"/>
        </g>
      </svg>

      <!-- Advanced Grouped Tooltip -->
      @if (tooltip(); as t) {
        <div class="chart-tooltip" [style.left.px]="t.x" [style.top.px]="t.y">
          <div class="tt-cat">{{ t.cat }}</div>
          @for (row of t.rows; track row.name) {
            <div class="tt-row">
              <span class="tt-dot" [style.background]="row.color"></span>
              <span class="tt-name">{{ row.name }}</span>
              <span class="tt-val">{{ fmtNum(row.value) }}</span>
            </div>
          }
        </div>
      }
    </div>
  \`,
  styles: [\`
    :host {
      display: block;
      position: relative;
    }
    .ngx-bar-chart { position: relative; background: var(--ngx-chart-bg, #fff); font-family: inherit; }
    .chart-header { display: flex; justify-content: space-between; align-items: center; min-height: 24px; position: relative; }
    .chart-legend { display: flex; gap: 16px; padding: 4px 0 12px; flex-wrap: wrap; }
    .legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--ngx-chart-axis-text, #6c757d); }
    .legend-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
    .chart-svg { display: block; overflow: visible; }
    .axis-label { font-size: 11px; fill: var(--ngx-chart-axis-text, #6c757d); user-select: none; }
    .column-ruler { fill: rgba(99, 102, 241, 0.04); border-radius: 4px; pointer-events: none; transition: x 0.15s cubic-bezier(0.16, 1, 0.3, 1); }
    
    .bar-rect {
      cursor: pointer;
      transition: y 0.5s cubic-bezier(0.16, 1, 0.3, 1), height 0.5s cubic-bezier(0.16, 1, 0.3, 1), fill-opacity 0.15s;
    }
    .bar-rect:hover { fill-opacity: 0.85; }
    .bar-label { font-size: 11px; fill: var(--ngx-chart-axis-text, #6c757d); pointer-events: none; }
    
    /* Premium Glassmorphic Tooltip */
    .chart-tooltip {
      position: absolute; pointer-events: none; transform: translate(-50%, -100%) translateY(-8px);
      background: var(--ngx-chart-tooltip-bg, rgba(30, 41, 59, 0.85));
      backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
      color: var(--ngx-chart-tooltip-color, #fff); padding: 8px 12px;
      border-radius: 8px; font-size: 12px; min-width: 140px;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.15), 0 4px 6px -4px rgba(0,0,0,0.1);
      border: 1px solid rgba(255, 255, 255, 0.1);
      z-index: 100;
      transition: left 0.15s cubic-bezier(0.16, 1, 0.3, 1), top 0.15s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .tt-cat { font-weight: 700; margin-bottom: 6px; font-size: 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.12); padding-bottom: 4px; }
    .tt-row { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
    .tt-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .tt-name { color: rgba(255, 255, 255, 0.8); flex: 1; }
    .tt-val { font-weight: 700; }

    /* Export styles */
    .chart-export-menu {
      position: absolute;
      top: 0;
      right: 0;
      z-index: 50;
    }
    .export-trigger {
      padding: 4px 10px;
      font-size: 11px;
      font-weight: 600;
      color: var(--ngx-chart-axis-text, #6c757d);
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(8px);
      border: 1px solid var(--ngx-chart-grid, #ebedf0);
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.15s;
    }
    .export-trigger:hover {
      background: #fff;
      color: var(--primary-color, #4f46e5);
      border-color: var(--primary-color, #4f46e5);
    }
    .export-dropdown {
      position: absolute;
      right: 0;
      top: calc(100% + 4px);
      background: #fff;
      border: 1px solid var(--ngx-chart-grid, #ebedf0);
      border-radius: 8px;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.08);
      padding: 4px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 120px;
    }
    .export-dropdown button {
      background: none;
      border: none;
      padding: 6px 10px;
      font-size: 11px;
      text-align: left;
      cursor: pointer;
      color: #343a40;
      border-radius: 4px;
      font-family: inherit;
      width: 100%;
      transition: all 0.12s;
    }
    .export-dropdown button:hover {
      background: rgba(79, 70, 229, 0.06);
      color: var(--primary-color, #4f46e5);
    }
  \`]
})
export class BarChartComponent {
  readonly PAD_LEFT = 48;
  readonly PAD_TOP = 12;
  readonly PAD_RIGHT = 16;
  readonly PAD_BOTTOM = 32;

  series = input<ChartSeries[]>([]);
  categories = input<string[]>([]);
  height = input<number>(260);
  showGrid = input<boolean>(true);
  showLabels = input<boolean>(false);
  showLegend = input<boolean>(true);
  colors = input<string[]>(CHART_COLORS);
  showExport = input<boolean>(false);

  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');

  exportMenuOpen = signal(false);
  animateState = signal(false);
  activeColumnIndex = signal<number | null>(null);
  containerWidth = signal<number>(600);

  tooltip = signal<{ x: number; y: number; cat: string; rows: { name: string; value: number; color: string }[] } | null>(null);

  chartHeight = computed(() => this.height());
  innerW = computed(() => this.containerWidth() - this.PAD_LEFT - this.PAD_RIGHT);
  innerH = computed(() => this.chartHeight() - this.PAD_TOP - this.PAD_BOTTOM);

  private allValues = computed(() => this.series().flatMap(s => s.data.filter(v => v != null)));
  private yMin = computed(() => Math.min(0, ...this.allValues()));
  private yMax = computed(() => Math.max(1, ...this.allValues()));
  yTicks = computed(() => niceTicks(this.yMin(), this.yMax(), 5));

  constructor() {
    const hostEl = inject(ElementRef).nativeElement;
    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(entries => {
        if (!entries || entries.length === 0) return;
        const width = entries[0].contentRect.width;
        if (width > 0) {
          this.containerWidth.set(width);
        }
      });
      resizeObserver.observe(hostEl);
      inject(DestroyRef).onDestroy(() => resizeObserver.disconnect());
    }
    // Start growth load animations
    setTimeout(() => this.animateState.set(true), 50);
  }

  yPos(v: number): number {
    return scale(v, this.yMin(), this.yMax(), this.innerH(), 0);
  }

  barY(v: number): number {
    if (!this.animateState()) return this.yPos(0);
    return Math.min(this.yPos(0), this.yPos(v));
  }

  barH(v: number): number {
    if (!this.animateState()) return 0;
    return Math.abs(this.yPos(0) - this.yPos(v));
  }

  groupW = computed(() => this.categories().length > 0 ? this.innerW() / this.categories().length : 0);
  
  singleBarWidth = computed(() => {
    const n = this.series().length || 1;
    return Math.max(4, (this.groupW() - 8) / n);
  });

  catMidX(i: number): number { return i * this.groupW() + this.groupW() / 2; }
  
  barX(ci: number, si: number): number {
    const n = this.series().length;
    const gx = ci * this.groupW() + 4;
    return gx + si * this.singleBarWidth();
  }

  colStartX(i: number): number {
    return i * this.groupW();
  }

  seriesColor(i: number): string { return this.colors()[i % this.colors().length]; }
  barColor(si: number, s: ChartSeries): string { return s.color || this.seriesColor(si); }

  onMouseMove(event: MouseEvent): void {
    const el = event.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const mx = event.clientX - rect.left - this.PAD_LEFT;
    const cats = this.categories();
    if (cats.length === 0) return;

    // Determine hover category column index
    const idx = Math.floor(mx / this.groupW());
    const ci = Math.max(0, Math.min(cats.length - 1, idx));

    this.activeColumnIndex.set(ci);

    const rows = this.series().map((s, si) => ({
      name: s.name,
      value: s.data[ci] ?? 0,
      color: this.barColor(si, s),
    }));

    this.tooltip.set({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      cat: cats[ci],
      rows
    });
  }

  onMouseLeave(): void {
    this.activeColumnIndex.set(null);
    this.tooltip.set(null);
  }

  toggleExportMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.exportMenuOpen.set(!this.exportMenuOpen());
  }

  @HostListener('document:click')
  closeExportMenu(): void {
    this.exportMenuOpen.set(false);
  }

  onExport(type: 'json' | 'csv' | 'svg'): void {
    this.exportMenuOpen.set(false);
    if (type === 'json') this.exportToJson();
    else if (type === 'csv') this.exportToCsv();
    else if (type === 'svg') this.exportToSvg();
  }

  exportToCsv(): void {
    const cats = this.categories();
    const sers = this.series();
    if (!cats.length || !sers.length) return;

    let csv = 'Category,' + sers.map(s => \`"\${s.name}"\`).join(',') + '
';
    cats.forEach((cat, ci) => {
      const row = [cat];
      sers.forEach(s => {
        row.push(s.data[ci] !== undefined ? String(s.data[ci]) : '');
      });
      csv += row.join(',') + '
';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'bar-chart-data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToJson(): void {
    const cats = this.categories();
    const sers = this.series();
    if (!cats.length || !sers.length) return;

    const data = cats.map((cat, ci) => {
      const entry: Record<string, string | number> = { category: cat };
      sers.forEach(s => {
        if (s.data[ci] !== undefined) {
          entry[s.name] = s.data[ci];
        }
      });
      return entry;
    });

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'bar-chart-data.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToSvg(): void {
    const svg = this.svgEl()?.nativeElement;
    if (!svg) return;
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svg);
    if (!source.match(/^<svg[^>]+xmlns="http://www.w3.org/2000/svg"/)) {
      source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    if (!source.match(/^<svg[^>]+xmlns:xlink="http://www.w3.org/1999/xlink"/)) {
      source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
    }
    source = '<?xml version="1.0" encoding="utf-8"?>
' + source;
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'bar-chart.svg');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  readonly fmtNum = fmtNum;
}
`,vt=`import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, viewChild, HostListener, inject, DestroyRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {  CHART_COLORS, ChartSeries, niceTicks, scale, smoothPath, fmtNum  } from './chart-utils';

@Component({
  selector: 'ngx-line-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <div
      class="ngx-line-chart"
      (mousemove)="onMouseMove($event)"
      (mouseleave)="onMouseLeave()"
    >
      <!-- Toolbar with Export option -->
      <div class="chart-header">
        <div class="chart-title-space"></div>
        @if (showExport()) {
          <div class="chart-export-menu">
            <button class="export-trigger" (click)="toggleExportMenu($event)" aria-label="Export Menu">\u{1F4E4} Export</button>
            @if (exportMenuOpen()) {
              <div class="export-dropdown">
                <button (click)="onExport('json')">\u{1F4CA} Export JSON</button>
                <button (click)="onExport('csv')">\u{1F4C4} Export CSV</button>
                <button (click)="onExport('svg')">\u{1F5BC}\uFE0F Export SVG</button>
              </div>
            }
          </div>
        }
      </div>

      <!-- Legend -->
      @if (showLegend()) {
        <div class="chart-legend">
          @for (s of series(); track s.name; let i = $index) {
            <span class="legend-item">
              <span class="legend-line" [style.background]="seriesColor(i, s)"></span>
              {{ s.name }}
            </span>
          }
        </div>
      }

      <!-- SVG Chart -->
      <svg
        #svgEl
        [attr.width]="'100%'"
        [attr.height]="chartHeight()"
        class="chart-svg"
      >
        <defs>
          @for (s of series(); track s.name; let i = $index) {
            <linearGradient [attr.id]="'area-grad-' + i" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" [attr.stop-color]="seriesColor(i, s)" stop-opacity="0.3"/>
              <stop offset="100%" [attr.stop-color]="seriesColor(i, s)" stop-opacity="0.02"/>
            </linearGradient>
          }
        </defs>
        <g [attr.transform]="'translate(' + PAD_LEFT + ',' + PAD_TOP + ')'">

          <!-- Y axis ticks and gridlines -->
          @for (tick of yTicks(); track tick) {
            <g [attr.transform]="'translate(0,' + yPos(tick) + ')'">
              @if (showGrid()) {
                <line [attr.x1]="0" [attr.x2]="innerW()" stroke="var(--ngx-chart-grid,#ebedf0)" stroke-dasharray="3,3"/>
              }
              <text x="-8" dy="4" class="axis-label" text-anchor="end">{{ fmtNum(tick) }}</text>
            </g>
          }

          <!-- X axis category labels -->
          @for (cat of categories(); track cat; let i = $index) {
            <text [attr.x]="xPos(i)" [attr.y]="innerH() + 16" class="axis-label" text-anchor="middle">{{ cat }}</text>
          }

          <!-- Lines and Areas -->
          @for (s of series(); track s.name; let si = $index) {
            @if (showArea()) {
              <path
                [attr.d]="areaPath(s)"
                [attr.fill]="'url(#area-grad-' + si + ')'"
                stroke="none"
                class="area-path"
              />
            }
            <path
              [attr.d]="linePath(s)"
              [attr.stroke]="seriesColor(si, s)"
              fill="none"
              stroke-width="2.5"
              stroke-linejoin="round"
              stroke-linecap="round"
              class="line-path"
            />
            @if (showMarkers() && animateState()) {
              @for (v of s.data; track $index; let ci = $index) {
                <circle
                  [attr.cx]="xPos(ci)"
                  [attr.cy]="yPos(v)"
                  r="4"
                  [attr.fill]="seriesColor(si, s)"
                  stroke="#fff"
                  stroke-width="2"
                  class="marker-dot"
                />
              }
            }
          }

          <!-- Crosshair -->
          @if (crosshair(); as ch) {
            <line [attr.x1]="ch.x" [attr.x2]="ch.x" y1="0" [attr.y2]="innerH()"
              stroke="var(--ngx-chart-axis,#ced4da)" stroke-dasharray="4,3" class="chart-crosshair"/>
          }

          <line x1="0" [attr.x2]="innerW()" [attr.y1]="innerH()" [attr.y2]="innerH()" stroke="var(--ngx-chart-axis,#ced4da)"/>
          <line x1="0" x2="0" y1="0" [attr.y2]="innerH()" stroke="var(--ngx-chart-axis,#ced4da)"/>
        </g>
      </svg>

      <!-- Premium Glassmorphic Tooltip -->
      @if (tooltip(); as t) {
        <div class="chart-tooltip" [style.left.px]="t.x" [style.top.px]="t.y">
          <div class="tt-cat">{{ t.cat }}</div>
          @for (row of t.rows; track row.name) {
            <div class="tt-row">
              <span class="tt-dot" [style.background]="row.color"></span>
              <span class="tt-name">{{ row.name }}</span>
              <span class="tt-val">{{ fmtNum(row.value) }}</span>
            </div>
          }
        </div>
      }
    </div>
  \`,
  styles: [\`
    :host {
      display: block;
      position: relative;
    }
    .ngx-line-chart { position: relative; background: var(--ngx-chart-bg, #fff); }
    .chart-header { display: flex; justify-content: space-between; align-items: center; min-height: 24px; position: relative; }
    .chart-legend { display: flex; gap: 16px; padding: 4px 0 12px; flex-wrap: wrap; }
    .legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--ngx-chart-axis-text,#6c757d); }
    .legend-line { width: 20px; height: 3px; border-radius: 2px; display: inline-block; }
    .chart-svg { display: block; overflow: visible; cursor: crosshair; }
    .axis-label { font-size: 11px; fill: var(--ngx-chart-axis-text,#6c757d); user-select: none; }
    .chart-crosshair { transition: x1 0.12s cubic-bezier(0.16, 1, 0.3, 1), x2 0.12s cubic-bezier(0.16, 1, 0.3, 1); }

    /* Keyframe Line draw transition */
    @keyframes lineDraw {
      from { stroke-dashoffset: 1200; }
      to { stroke-dashoffset: 0; }
    }
    .line-path {
      stroke-dasharray: 1200;
      stroke-dashoffset: 1200;
      animation: lineDraw 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    
    @keyframes areaFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .area-path {
      animation: areaFadeIn 1s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both;
    }

    .marker-dot {
      animation: areaFadeIn 0.5s ease 0.8s both;
    }

    /* Premium Glassmorphic Tooltip */
    .chart-tooltip {
      position: absolute; pointer-events: none; transform: translate(-50%, -100%) translateY(-8px);
      background: var(--ngx-chart-tooltip-bg, rgba(30, 41, 59, 0.85));
      backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
      color: var(--ngx-chart-tooltip-color, #fff); padding: 8px 12px;
      border-radius: 8px; font-size: 12px; min-width: 140px;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.15), 0 4px 6px -4px rgba(0,0,0,0.1);
      border: 1px solid rgba(255, 255, 255, 0.1);
      z-index: 100;
      transition: left 0.12s cubic-bezier(0.16, 1, 0.3, 1), top 0.12s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .tt-cat { font-weight: 700; margin-bottom: 6px; font-size: 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.12); padding-bottom: 4px; }
    .tt-row { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
    .tt-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .tt-name { color: rgba(255, 255, 255, 0.8); flex: 1; }
    .tt-val { font-weight: 700; }

    /* Export styles */
    .chart-export-menu {
      position: absolute;
      top: 0;
      right: 0;
      z-index: 50;
    }
    .export-trigger {
      padding: 4px 10px;
      font-size: 11px;
      font-weight: 600;
      color: var(--ngx-chart-axis-text, #6c757d);
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(8px);
      border: 1px solid var(--ngx-chart-grid, #ebedf0);
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.15s;
    }
    .export-trigger:hover {
      background: #fff;
      color: var(--primary-color, #4f46e5);
      border-color: var(--primary-color, #4f46e5);
    }
    .export-dropdown {
      position: absolute;
      right: 0;
      top: calc(100% + 4px);
      background: #fff;
      border: 1px solid var(--ngx-chart-grid, #ebedf0);
      border-radius: 8px;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.08);
      padding: 4px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 120px;
    }
    .export-dropdown button {
      background: none;
      border: none;
      padding: 6px 10px;
      font-size: 11px;
      text-align: left;
      cursor: pointer;
      color: #343a40;
      border-radius: 4px;
      font-family: inherit;
      width: 100%;
      transition: all 0.12s;
    }
    .export-dropdown button:hover {
      background: rgba(79, 70, 229, 0.06);
      color: var(--primary-color, #4f46e5);
    }
  \`]
})
export class LineChartComponent {
  readonly PAD_LEFT = 48;
  readonly PAD_TOP = 12;
  readonly PAD_RIGHT = 16;
  readonly PAD_BOTTOM = 32;

  series = input<ChartSeries[]>([]);
  categories = input<string[]>([]);
  height = input<number>(260);
  showGrid = input<boolean>(true);
  showArea = input<boolean>(false);
  showMarkers = input<boolean>(true);
  showLegend = input<boolean>(true);
  colors = input<string[]>(CHART_COLORS);
  showExport = input<boolean>(false);

  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');

  exportMenuOpen = signal(false);
  animateState = signal(false);
  containerWidth = signal<number>(600);

  crosshair = signal<{ x: number } | null>(null);
  tooltip = signal<{ x: number; y: number; cat: string; rows: {name:string;value:number;color:string}[] } | null>(null);

  chartHeight = computed(() => this.height());
  innerW = computed(() => this.containerWidth() - this.PAD_LEFT - this.PAD_RIGHT);
  innerH = computed(() => this.chartHeight() - this.PAD_TOP - this.PAD_BOTTOM);

  private allValues = computed(() => this.series().flatMap(s => s.data));
  private yMin = computed(() => Math.min(0, ...this.allValues()));
  private yMax = computed(() => Math.max(1, ...this.allValues()));
  yTicks = computed(() => niceTicks(this.yMin(), this.yMax(), 5));

  constructor() {
    const hostEl = inject(ElementRef).nativeElement;
    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(entries => {
        if (!entries || entries.length === 0) return;
        const width = entries[0].contentRect.width;
        if (width > 0) {
          this.containerWidth.set(width);
        }
      });
      resizeObserver.observe(hostEl);
      inject(DestroyRef).onDestroy(() => resizeObserver.disconnect());
    }
    setTimeout(() => this.animateState.set(true), 50);
  }

  yPos(v: number): number { return scale(v, this.yMin(), this.yMax(), this.innerH(), 0); }
  xPos(i: number): number {
    const n = this.categories().length;
    return n <= 1 ? this.innerW() / 2 : scale(i, 0, n - 1, 0, this.innerW());
  }

  seriesColor(i: number, s: ChartSeries): string { return s.color || this.colors()[i % this.colors().length]; }

  linePath(s: ChartSeries): string {
    const pts: [number, number][] = s.data.map((v, i) => [this.xPos(i), this.yPos(v)]);
    return smoothPath(pts);
  }

  areaPath(s: ChartSeries): string {
    const pts: [number, number][] = s.data.map((v, i) => [this.xPos(i), this.yPos(v)]);
    const line = smoothPath(pts);
    const last = pts[pts.length - 1];
    const first = pts[0];
    return line + \` L \${last[0]} \${this.innerH()} L \${first[0]} \${this.innerH()} Z\`;
  }

  onMouseMove(event: MouseEvent): void {
    const el = event.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const mx = event.clientX - rect.left - this.PAD_LEFT;
    const cats = this.categories();
    if (cats.length === 0) return;
    const idx = Math.round(scale(mx, 0, this.innerW(), 0, cats.length - 1));
    const ci = Math.max(0, Math.min(cats.length - 1, idx));
    this.crosshair.set({ x: this.xPos(ci) });
    const rows = this.series().map((s, si) => ({
      name: s.name,
      value: s.data[ci] ?? 0,
      color: this.seriesColor(si, s),
    }));
    this.tooltip.set({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      cat: cats[ci],
      rows,
    });
  }

  onMouseLeave(): void {
    this.crosshair.set(null);
    this.tooltip.set(null);
  }

  toggleExportMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.exportMenuOpen.set(!this.exportMenuOpen());
  }

  @HostListener('document:click')
  closeExportMenu(): void {
    this.exportMenuOpen.set(false);
  }

  onExport(type: 'json' | 'csv' | 'svg'): void {
    this.exportMenuOpen.set(false);
    if (type === 'json') this.exportToJson();
    else if (type === 'csv') this.exportToCsv();
    else if (type === 'svg') this.exportToSvg();
  }

  exportToCsv(): void {
    const cats = this.categories();
    const sers = this.series();
    if (!cats.length || !sers.length) return;

    let csv = 'Category,' + sers.map(s => \`"\${s.name}"\`).join(',') + '
';
    cats.forEach((cat, ci) => {
      const row = [cat];
      sers.forEach(s => {
        row.push(s.data[ci] !== undefined ? String(s.data[ci]) : '');
      });
      csv += row.join(',') + '
';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'line-chart-data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToJson(): void {
    const cats = this.categories();
    const sers = this.series();
    if (!cats.length || !sers.length) return;

    const data = cats.map((cat, ci) => {
      const entry: Record<string, string | number> = { category: cat };
      sers.forEach(s => {
        if (s.data[ci] !== undefined) {
          entry[s.name] = s.data[ci];
        }
      });
      return entry;
    });

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'line-chart-data.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToSvg(): void {
    const svg = this.svgEl()?.nativeElement;
    if (!svg) return;
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svg);
    if (!source.match(/^<svg[^>]+xmlns="http://www.w3.org/2000/svg"/)) {
      source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    if (!source.match(/^<svg[^>]+xmlns:xlink="http://www.w3.org/1999/xlink"/)) {
      source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
    }
    source = '<?xml version="1.0" encoding="utf-8"?>
' + source;
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'line-chart.svg');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  readonly fmtNum = fmtNum;
}
`,Ct=`import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, viewChild, HostListener, inject, DestroyRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {  CHART_COLORS, ChartDataPoint, fmtNum  } from './chart-utils';

@Component({
  selector: 'ngx-pie-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <div class="ngx-pie-chart">
      <!-- Toolbar with Export option -->
      <div class="chart-header">
        <div class="chart-title-space"></div>
        @if (showExport()) {
          <div class="chart-export-menu">
            <button class="export-trigger" (click)="toggleExportMenu($event)" aria-label="Export Menu">\u{1F4E4} Export</button>
            @if (exportMenuOpen()) {
              <div class="export-dropdown">
                <button (click)="onExport('json')">\u{1F4CA} Export JSON</button>
                <button (click)="onExport('csv')">\u{1F4C4} Export CSV</button>
                <button (click)="onExport('svg')">\u{1F5BC}\uFE0F Export SVG</button>
              </div>
            }
          </div>
        }
      </div>

      <div class="chart-body">
        <svg
          #svgEl
          class="chart-svg"
          [attr.viewBox]="'0 0 ' + height() + ' ' + height()"
          [attr.width]="height()"
          [attr.height]="height()"
        >
          <g [attr.transform]="'translate(' + cx() + ',' + cy() + ')'" class="pie-group">
            @for (slice of slices(); track slice.index) {
              <path
                [attr.d]="slice.path"
                [attr.fill]="slice.color"
                [attr.stroke]="'#fff'"
                stroke-width="2"
                class="pie-slice"
                [class.hovered]="hovered() === slice.index"
                (mouseenter)="hovered.set(slice.index); onSliceHover($event, slice)"
                (mouseleave)="hovered.set(-1); tooltip.set(null)"
              />
              @if (showLabels() && slice.midAngle !== null) {
                <text
                  [attr.x]="labelX(slice)"
                  [attr.y]="labelY(slice)"
                  text-anchor="middle"
                  dominant-baseline="middle"
                  class="slice-label"
                >{{ slice.pct }}%</text>
              }
            }
            <!-- Donut hole -->
            @if (mode() === 'donut') {
              <text class="donut-center-text" text-anchor="middle" dy="-8">{{ centerTitle() }}</text>
              <text class="donut-center-value" text-anchor="middle" dy="14">{{ centerValue() }}</text>
            }
          </g>
        </svg>

        @if (showLegend()) {
          <div class="chart-legend">
            @for (slice of slices(); track slice.index) {
              <div class="legend-item" (mouseenter)="hovered.set(slice.index)" (mouseleave)="hovered.set(-1)">
                <span class="legend-dot" [style.background]="slice.color"></span>
                <span class="legend-label">{{ slice.label }}</span>
                <span class="legend-pct">{{ slice.pct }}%</span>
              </div>
            }
          </div>
        }
      </div>

      <!-- Premium Glassmorphic Tooltip -->
      @if (tooltip(); as t) {
        <div class="chart-tooltip" [style.left.px]="t.x" [style.top.px]="t.y">
          <span class="tt-dot" [style.background]="t.color"></span>
          <strong>{{ t.label }}</strong>: {{ fmtNum(t.value) }} ({{ t.pct }}%)
        </div>
      }
    </div>
  \`,
  styles: [\`
    :host {
      display: block;
      position: relative;
    }
    .ngx-pie-chart {
      position: relative;
      background: var(--ngx-chart-bg, #fff);
      font-family: inherit;
      overflow: hidden;
    }
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      min-height: 24px;
      position: relative;
    }
    .chart-body {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 24px;
      flex-wrap: wrap;
    }
    /* SVG uses explicit width/height attrs for intrinsic size;
       max-width: 100% + min-width: 0 lets it shrink inside flex. */
    .chart-svg {
      display: block;
      max-width: 100%;
      height: auto;
      min-width: 0;
    }

    @keyframes pieGrow {
      from { transform: scale(0.4) rotate(-90deg); opacity: 0; }
      to { transform: scale(1) rotate(0); opacity: 1; }
    }
    .pie-group {
      animation: pieGrow 0.75s cubic-bezier(0.16, 1, 0.3, 1) both;
      transform-box: fill-box;
      transform-origin: center;
    }

    .pie-slice {
      cursor: pointer;
      transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), fill-opacity 0.15s;
      transform-origin: 0px 0px;
    }
    .pie-slice.hovered { transform: scale(1.04); fill-opacity: 0.9; }
    .slice-label { font-size: 11px; fill: #fff; font-weight: 600; pointer-events: none; user-select: none; }
    .donut-center-text { font-size: 12px; fill: var(--ngx-chart-axis-text,#6c757d); font-weight: 500; }
    .donut-center-value { font-size: 20px; font-weight: 800; fill: var(--ngx-chart-text,#212529); }
    .chart-legend { display: flex; flex-direction: column; gap: 6px; flex-shrink: 0; }
    .legend-item { display: flex; align-items: center; gap: 8px; font-size: 12px; cursor: pointer; padding: 4px 8px; border-radius: 6px; transition: all 0.15s; }
    .legend-item:hover { background: var(--ngx-chart-grid,#f1f3f5); }
    .legend-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
    .legend-label { flex: 1; color: var(--ngx-chart-axis-text,#6c757d); }
    .legend-pct { font-weight: 600; color: var(--ngx-chart-text,#212529); }

    /* Premium Glassmorphic Tooltip */
    .chart-tooltip {
      position: absolute; pointer-events: none; transform: translate(-50%, -100%) translateY(-8px);
      background: var(--ngx-chart-tooltip-bg, rgba(30, 41, 59, 0.85));
      backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
      color: var(--ngx-chart-tooltip-color, #fff); padding: 8px 12px;
      border-radius: 8px; font-size: 12px;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.15), 0 4px 6px -4px rgba(0,0,0,0.1);
      border: 1px solid rgba(255, 255, 255, 0.1);
      z-index: 100;
      display: flex; align-items: center; gap: 6px;
      transition: left 0.15s cubic-bezier(0.16, 1, 0.3, 1), top 0.15s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .tt-dot { width: 8px; height: 8px; border-radius: 50%; }

    /* Export styles */
    .chart-export-menu {
      position: absolute;
      top: 0;
      right: 0;
      z-index: 50;
    }
    .export-trigger {
      padding: 4px 10px;
      font-size: 11px;
      font-weight: 600;
      color: var(--ngx-chart-axis-text, #6c757d);
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(8px);
      border: 1px solid var(--ngx-chart-grid, #ebedf0);
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.15s;
    }
    .export-trigger:hover {
      background: #fff;
      color: var(--primary-color, #4f46e5);
      border-color: var(--primary-color, #4f46e5);
    }
    .export-dropdown {
      position: absolute;
      right: 0;
      top: calc(100% + 4px);
      background: #fff;
      border: 1px solid var(--ngx-chart-grid, #ebedf0);
      border-radius: 8px;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.08);
      padding: 4px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 120px;
    }
    .export-dropdown button {
      background: none;
      border: none;
      padding: 6px 10px;
      font-size: 11px;
      text-align: left;
      cursor: pointer;
      color: #343a40;
      border-radius: 4px;
      font-family: inherit;
      width: 100%;
      transition: all 0.12s;
    }
    .export-dropdown button:hover {
      background: rgba(79, 70, 229, 0.06);
      color: var(--primary-color, #4f46e5);
    }
  \`]
})
export class PieChartComponent {
  data = input<ChartDataPoint[]>([]);
  mode = input<'pie' | 'donut'>('pie');
  donutHoleSize = input<number>(0.55);
  height = input<number>(240);
  showLegend = input<boolean>(true);
  showLabels = input<boolean>(true);
  colors = input<string[]>(CHART_COLORS);
  centerTitle = input<string>('Total');
  showExport = input<boolean>(false);
  colors$ = this.colors;

  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');

  exportMenuOpen = signal(false);
  hovered = signal(-1);
  tooltip = signal<{x:number;y:number;label:string;value:number;pct:number;color:string}|null>(null);

  svgSize = computed(() => this.height());
  cx = computed(() => this.svgSize() / 2);
  cy = computed(() => this.svgSize() / 2);
  radius = computed(() => this.svgSize() / 2 - 10);
  holeR = computed(() => this.radius() * this.donutHoleSize());

  constructor() {}

  centerValue = computed(() => {
    const total = this.data().reduce((s, d) => s + d.value, 0);
    return fmtNum(total);
  });

  slices = computed(() => {
    const d = this.data();
    const total = d.reduce((s, x) => s + x.value, 0) || 1;
    let start = -Math.PI / 2;
    return d.map((item, i) => {
      const frac = item.value / total;
      let angle = frac * Math.PI * 2;
      // Cap angle slightly if it is a full circle to prevent coinciding SVG endpoints
      if (frac >= 0.999) {
        angle = Math.PI * 2 - 0.0001;
      }
      const end = start + angle;
      const mid = start + angle / 2;
      const r = this.radius();
      const path = this.mode() === 'donut'
        ? this.ringPath(start, end, r, this.holeR())
        : this.arcPath(start, end, r);
      start = end;
      return {
        index: i,
        label: item.label,
        value: item.value,
        pct: Math.round(frac * 100),
        color: item.color || this.colors()[i % this.colors().length],
        path,
        midAngle: mid,
      };
    });
  });

  private arcPath(startAngle: number, endAngle: number, r: number): string {
    const x1 = Math.cos(startAngle) * r;
    const y1 = Math.sin(startAngle) * r;
    const x2 = Math.cos(endAngle) * r;
    const y2 = Math.sin(endAngle) * r;
    const large = endAngle - startAngle > Math.PI ? 1 : 0;
    return \`M 0 0 L \${x1} \${y1} A \${r} \${r} 0 \${large} 1 \${x2} \${y2} Z\`;
  }

  private ringPath(startAngle: number, endAngle: number, outerR: number, innerR: number): string {
    const ox1 = Math.cos(startAngle) * outerR;
    const oy1 = Math.sin(startAngle) * outerR;
    const ox2 = Math.cos(endAngle) * outerR;
    const oy2 = Math.sin(endAngle) * outerR;

    const ix1 = Math.cos(startAngle) * innerR;
    const iy1 = Math.sin(startAngle) * innerR;
    const ix2 = Math.cos(endAngle) * innerR;
    const iy2 = Math.sin(endAngle) * innerR;

    const large = endAngle - startAngle > Math.PI ? 1 : 0;
    return \`M \${ix1} \${iy1} L \${ox1} \${oy1} A \${outerR} \${outerR} 0 \${large} 1 \${ox2} \${oy2} L \${ix2} \${iy2} A \${innerR} \${innerR} 0 \${large} 0 \${ix1} \${iy1} Z\`;
  }

  labelX(s: {midAngle:number}): number {
    const r = this.mode() === 'donut' ? (this.radius() + this.holeR()) / 2 : this.radius() * 0.7;
    return Math.cos(s.midAngle) * r;
  }
  labelY(s: {midAngle:number}): number {
    const r = this.mode() === 'donut' ? (this.radius() + this.holeR()) / 2 : this.radius() * 0.7;
    return Math.sin(s.midAngle) * r;
  }

  onSliceHover(event: MouseEvent, slice: {label:string;value:number;pct:number;color:string}): void {
    const el = (event.currentTarget as HTMLElement).closest('.ngx-pie-chart') as HTMLElement;
    const rect = el.getBoundingClientRect();
    this.tooltip.set({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      ...slice,
    });
  }

  toggleExportMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.exportMenuOpen.set(!this.exportMenuOpen());
  }

  @HostListener('document:click')
  closeExportMenu(): void {
    this.exportMenuOpen.set(false);
  }

  onExport(type: 'json' | 'csv' | 'svg'): void {
    this.exportMenuOpen.set(false);
    if (type === 'json') this.exportToJson();
    else if (type === 'csv') this.exportToCsv();
    else if (type === 'svg') this.exportToSvg();
  }

  exportToCsv(): void {
    const data = this.data();
    if (!data.length) return;
    let csv = 'Label,Value
';
    data.forEach(d => {
      csv += \`"\${d.label}",\${d.value}
\`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'pie-chart-data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToJson(): void {
    const data = this.data();
    if (!data.length) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'pie-chart-data.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToSvg(): void {
    const svg = this.svgEl()?.nativeElement;
    if (!svg) return;
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svg);
    if (!source.match(/^<svg[^>]+xmlns="http://www.w3.org/2000/svg"/)) {
      source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    if (!source.match(/^<svg[^>]+xmlns:xlink="http://www.w3.org/1999/xlink"/)) {
      source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
    }
    source = '<?xml version="1.0" encoding="utf-8"?>
' + source;
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'pie-chart.svg');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  readonly fmtNum = fmtNum;
}
`,yt=`import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import {  CHART_COLORS, scale, smoothPath  } from './chart-utils';

@Component({
  selector: 'ngx-sparkline',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <svg
      [attr.width]="width()"
      [attr.height]="height()"
      class="ngx-sparkline"
      [attr.aria-label]="'Sparkline'"
    >
      @if (type() === 'line' || type() === 'area') {
        @if (type() === 'area') {
          <path [attr.d]="areaPath()" [attr.fill]="areaFill()" stroke="none"/>
        }
        <path
          [attr.d]="linePath()"
          [attr.stroke]="color()"
          fill="none"
          stroke-width="2"
          stroke-linejoin="round"
          stroke-linecap="round"
        />
        <!-- End dot -->
        @if (endPoint(); as ep) {
          <circle [attr.cx]="ep[0]" [attr.cy]="ep[1]" r="3" [attr.fill]="color()"/>
        }
      }
      @if (type() === 'bar') {
        @for (item of barItems(); track $index) {
          <rect
            [attr.x]="item.x"
            [attr.y]="item.y"
            [attr.width]="item.w"
            [attr.height]="item.h"
            [attr.fill]="color()"
            [attr.rx]="1"
            opacity="0.85"
          />
        }
      }
    </svg>
  \`,
  styles: [\`:host { display: inline-block; } .ngx-sparkline { display: block; }\`]
})
export class SparklineComponent {
  data = input<number[]>([]);
  type = input<'line' | 'bar' | 'area'>('line');
  color = input<string>(CHART_COLORS[0]);
  width = input<number>(120);
  height = input<number>(36);

  private PAD = 2;

  private w = computed(() => this.width() - this.PAD * 2);
  private h = computed(() => this.height() - this.PAD * 2);

  private yMin = computed(() => Math.min(...this.data(), 0));
  private yMax = computed(() => Math.max(...this.data(), 1));

  private pts = computed<[number, number][]>(() => {
    const d = this.data();
    const n = d.length;
    if (n === 0) return [];
    return d.map((v, i) => [
      this.PAD + scale(i, 0, Math.max(n - 1, 1), 0, this.w()),
      this.PAD + scale(v, this.yMin(), this.yMax(), this.h(), 0),
    ]);
  });

  linePath = computed(() => smoothPath(this.pts()));

  areaPath = computed(() => {
    const pts = this.pts();
    if (pts.length < 2) return '';
    const line = smoothPath(pts);
    const last = pts[pts.length - 1];
    const first = pts[0];
    const bottom = this.PAD + this.h();
    return line + \` L \${last[0]} \${bottom} L \${first[0]} \${bottom} Z\`;
  });

  areaFill = computed(() => this.color() + '22');

  endPoint = computed<[number, number] | null>(() => {
    const pts = this.pts();
    return pts.length > 0 ? pts[pts.length - 1] : null;
  });

  barItems = computed(() => {
    const d = this.data();
    const n = d.length;
    if (n === 0) return [];
    const bw = Math.max(2, this.w() / n - 1);
    const zero = this.PAD + scale(0, this.yMin(), this.yMax(), this.h(), 0);
    return d.map((v, i) => {
      const x = this.PAD + scale(i, 0, Math.max(n - 1, 1), 0, this.w()) - bw / 2;
      const y = this.PAD + scale(v, this.yMin(), this.yMax(), this.h(), 0);
      return { x, y, w: bw, h: Math.abs(zero - y) };
    });
  });
}
`,wt=`import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface GaugeThreshold {
  value: number; // The threshold limit (inclusive upper boundary)
  color: string; // The color associated with this threshold
}

@Component({
  selector: 'ngx-gauge-chart',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <div class="ngx-gauge-wrapper">
      <div class="ngx-gauge-container">
        <!-- SVG Gauge dial -->
        <svg
          class="ngx-gauge-svg"
          viewBox="0 0 200 200"
        >
          <!-- Background track arc -->
          <path
            [attr.d]="backgroundArcPath()"
            fill="none"
            stroke="var(--border-light, #f1f5f9)"
            stroke-width="14"
            stroke-linecap="round"
          />

          <!-- Colored progress arc -->
          <path
            [attr.d]="progressArcPath()"
            fill="none"
            [attr.stroke]="gaugeColor()"
            stroke-width="14"
            stroke-linecap="round"
            class="progress-arc"
          />

          <!-- Needle / Indicator dial -->
          @if (showNeedle()) {
            <g [attr.transform]="needleTransformString()" class="gauge-needle-group">
              <!-- Needle path pointing straight up (0 deg is relative to -90 deg rotation) -->
              <path
                d="M 100 100 L 96 35 L 100 25 L 104 35 Z"
                [attr.fill]="gaugeColor()"
                class="gauge-needle"
              />
              <circle
                cx="100"
                cy="100"
                r="8"
                [attr.fill]="gaugeColor()"
                stroke="var(--bg-secondary, #ffffff)"
                stroke-width="2.5"
              />
            </g>
          }
        </svg>

        <!-- Center values badge -->
        <div class="gauge-center-badge" [class.semi-mode]="type() === 'semi'">
          <div class="gauge-value" [style.color]="gaugeColor()">{{ value().toLocaleString() }}</div>
          @if (label()) {
            <div class="gauge-label">{{ label() }}</div>
          }
        </div>
      </div>
    </div>
  \`,
  styles: [\`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    .ngx-gauge-wrapper {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      background: var(--bg-secondary, #ffffff);
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 12px;
      box-shadow: var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05));
    }

    .ngx-gauge-container {
      position: relative;
      width: 100%;
      max-width: 240px;
      aspect-ratio: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .ngx-gauge-svg {
      width: 100%;
      height: 100%;
    }

    /* Arcs transition */
    .progress-arc {
      transition: stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.3s ease;
    }

    /* Needle transition animations */
    .gauge-needle-group {
      transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
      transform-origin: 100px 100px;
    }
    .gauge-needle {
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.15));
    }

    /* Center Value Indicator */
    .gauge-center-badge {
      position: absolute;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      pointer-events: none;
      z-index: 2;
    }
    .gauge-center-badge.semi-mode {
      transform: translateY(18px);
    }

    .gauge-value {
      font-size: 28px;
      font-weight: 800;
      letter-spacing: -0.8px;
      line-height: 1;
      transition: color 0.3s ease;
      font-family: var(--ngx-heading-font-family, inherit);
    }
    .gauge-label {
      font-size: 11px;
      text-transform: uppercase;
      font-weight: 700;
      color: var(--text-secondary, #64748b);
      letter-spacing: 0.5px;
      margin-top: 4px;
    }
  \`]
})
export class GaugeChartComponent {
  // Input Configs
  value = input.required<number>();
  min = input<number>(0);
  max = input<number>(100);
  label = input<string>('');
  type = input<'full' | 'semi'>('semi'); // 'full' is 280deg, 'semi' is 180deg
  showNeedle = input<boolean>(true);
  color = input<string>('var(--primary-color, #4f46e5)');
  thresholds = input<GaugeThreshold[]>([]);

  // Gauge angles definitions
  // 0 deg in polar is to the right (3 o'clock). 90 deg is straight down (6 o'clock).
  // A standard semi-circle speedometer goes from 180deg (left, 9 o'clock) to 360deg (right, 3 o'clock).
  // A full dial goes from 135deg (bottom-left) to 405deg (bottom-right).
  startAngle = computed(() => {
    return this.type() === 'semi' ? 180 : 135;
  });

  endAngle = computed(() => {
    return this.type() === 'semi' ? 360 : 405;
  });

  // Calculate coordinates and build path for background track
  backgroundArcPath = computed(() => {
    return this.describeArc(100, 100, 72, this.startAngle(), this.endAngle());
  });

  // Calculate current value angle and build path for progress fill
  progressArcPath = computed(() => {
    const minVal = this.min();
    const maxVal = this.max();
    const currentVal = Math.max(minVal, Math.min(maxVal, this.value()));
    const range = maxVal - minVal;
    const fraction = range === 0 ? 0 : (currentVal - minVal) / range;

    const angleRange = this.endAngle() - this.startAngle();
    const targetAngle = this.startAngle() + angleRange * fraction;

    return this.describeArc(100, 100, 72, this.startAngle(), targetAngle);
  });

  // Needle rotation calculation
  needleTransformString = computed(() => {
    const minVal = this.min();
    const maxVal = this.max();
    const currentVal = Math.max(minVal, Math.min(maxVal, this.value()));
    const range = maxVal - minVal;
    const fraction = range === 0 ? 0 : (currentVal - minVal) / range;

    const angleRange = this.endAngle() - this.startAngle();
    const angle = this.startAngle() + angleRange * fraction;

    // Needle points straight up at -90 deg rotation, so we offset by -90
    const rotateAngle = angle - 270;
    return \`rotate(\${rotateAngle})\`;
  });

  // Evaluate the gauge color depending on bound thresholds
  gaugeColor = computed(() => {
    const val = this.value();
    const thresholdList = this.thresholds();

    if (thresholdList.length === 0) {
      return this.color();
    }

    // Sort thresholds ascending
    const sorted = [...thresholdList].sort((a, b) => a.value - b.value);
    
    // Find the first threshold color where values exceed the limit
    for (const t of sorted) {
      if (val <= t.value) {
        return t.color;
      }
    }

    // Default to the last threshold color if value exceeds all thresholds
    return sorted[sorted.length - 1].color;
  });

  // Polar to Cartesian Math helpers
  private polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;

    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians)
    };
  }

  private describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number): string {
    const start = this.polarToCartesian(x, y, radius, endAngle);
    const end = this.polarToCartesian(x, y, radius, startAngle);

    // If starting and ending angle range exceeds 180 degrees, set largeArcFlag
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    return [
      'M', start.x, start.y,
      'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(' ');
  }
}
`,kt=`import { Component, input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface RadarSeries {
  label: string;
  values: number[]; // Array of values corresponding to categories
}

@Component({
  selector: 'ngx-radar-chart',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <div class="ngx-radar-wrapper">
      <!-- Radar Chart Visual Panel -->
      <div class="ngx-radar-container">
        <svg
          class="ngx-radar-svg"
          viewBox="0 0 220 220"
        >
          <!-- Concentric polygon grids (web rings) -->
          @for (ring of gridRings(); track ring) {
            <polygon
              [attr.points]="getRingPoints(ring)"
              fill="none"
              stroke="var(--border-light, #f1f5f9)"
              stroke-width="1"
            />
          }

          <!-- Axis lines projecting out to categories -->
          @for (axis of axes(); track $index) {
            <line
              [attr.x1]="110"
              [attr.y1]="110"
              [attr.x2]="axis.x"
              [attr.y2]="axis.y"
              stroke="var(--border-color, #e2e8f0)"
              stroke-width="1.2"
              stroke-dasharray="2,2"
            />
            <!-- Category Label text positions -->
            <text
              [attr.x]="axis.labelX"
              [attr.y]="axis.labelY"
              [attr.text-anchor]="axis.align"
              class="axis-label"
            >
              {{ categories()[$index] }}
            </text>
          }

          <!-- Radar polygon areas representing series -->
          @for (series of seriesData(); track series.label; let sIdx = $index) {
            <polygon
              [attr.points]="getSeriesPoints(series)"
              [attr.fill]="getSeriesColor(sIdx, 0.15)"
              [attr.stroke]="getSeriesColor(sIdx, 1)"
              stroke-width="2.5"
              class="radar-polygon"
              [class.active]="hoveredSeries() === series.label"
              (mouseenter)="hoveredSeries.set(series.label)"
              (mouseleave)="hoveredSeries.set(null)"
            />

            <!-- Plot data dots on points -->
            @for (pt of getSeriesPointList(series); track $index) {
              <circle
                [attr.cx]="pt.x"
                [attr.cy]="pt.y"
                [attr.r]="hoveredPoint()?.seriesLabel === series.label && hoveredPoint()?.index === $index ? 5 : 3.5"
                [attr.fill]="getSeriesColor(sIdx, 1)"
                stroke="#ffffff"
                stroke-width="1.5"
                class="radar-dot"
                (mouseenter)="onPointEnter(series, $index, pt, $event)"
                (mouseleave)="onPointLeave()"
              />
            }
          }
        </svg>

        <!-- Hover Tooltip Overlay -->
        @if (tooltip().show) {
          <div
            class="radar-tooltip"
            [style.left.px]="tooltip().x"
            [style.top.px]="tooltip().y"
          >
            <div class="tooltip-series">{{ tooltip().series }}</div>
            <div class="tooltip-row">
              <span>{{ tooltip().category }}:</span>
              <span>{{ tooltip().value }}</span>
            </div>
          </div>
        }
      </div>

      <!-- Legend Panel -->
      <div class="radar-legend">
        @for (series of seriesData(); track series.label; let sIdx = $index) {
          <div
            class="legend-item"
            [class.dimmed]="hoveredSeries() !== null && hoveredSeries() !== series.label"
            (mouseenter)="hoveredSeries.set(series.label)"
            (mouseleave)="hoveredSeries.set(null)"
          >
            <span class="legend-indicator" [style.background]="getSeriesColor(sIdx, 1)"></span>
            <span class="legend-text">{{ series.label }}</span>
          </div>
        }
      </div>
    </div>
  \`,
  styles: [\`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    .ngx-radar-wrapper {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      padding: 24px;
      background: var(--bg-secondary, #ffffff);
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 12px;
      box-shadow: var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05));
    }

    .ngx-radar-container {
      position: relative;
      width: 100%;
      max-width: 280px;
      aspect-ratio: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .ngx-radar-svg {
      width: 100%;
      height: 100%;
      overflow: visible;
    }

    /* Radar Polygons styling */
    .radar-polygon {
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
    }
    .radar-polygon:hover, .radar-polygon.active {
      fill-opacity: 0.3;
      stroke-width: 3.5px;
    }

    .radar-dot {
      cursor: pointer;
      transition: r 0.15s ease, stroke-width 0.15s ease;
    }

    /* Labels styling */
    .axis-label {
      font-size: 8px;
      font-weight: 700;
      fill: var(--text-secondary, #64748b);
      letter-spacing: -0.1px;
    }

    /* Glassmorphic Tooltip styling */
    .radar-tooltip {
      position: absolute;
      z-index: 100;
      pointer-events: none;
      background: rgba(15, 23, 42, 0.92);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 6px;
      padding: 8px 12px;
      color: #ffffff;
      font-family: inherit;
      font-size: 11px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      backdrop-filter: blur(8px);
      transform: translate(-50%, -115%);
      min-width: 120px;
    }
    .tooltip-series {
      font-weight: 700;
      border-bottom: 1px solid rgba(255, 255, 255, 0.15);
      padding-bottom: 4px;
      margin-bottom: 4px;
      font-size: 12px;
    }
    .tooltip-row {
      display: flex;
      justify-content: space-between;
      gap: 12px;
    }
    .tooltip-row span:last-child {
      font-weight: 700;
      color: #fbbf24;
    }

    /* Legend Layout */
    .radar-legend {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 12px;
    }
    .legend-item {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    .legend-item.dimmed {
      opacity: 0.35;
    }
    .legend-indicator {
      width: 10px;
      height: 10px;
      border-radius: 3px;
    }
    .legend-text {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-primary, #0f172a);
    }
  \`]
})
export class RadarChartComponent {
  // Input binds
  seriesData = input.required<RadarSeries[]>();
  categories = input.required<string[]>();
  max = input<number>(100);
  colors = input<string[]>(['#4f46e5', '#fbbf24', '#a855f7', '#06b6d4']);

  // Hover status signals
  hoveredSeries = signal<string | null>(null);
  hoveredPoint = signal<{ seriesLabel: string; index: number } | null>(null);
  tooltip = signal<{ show: boolean; series: string; category: string; value: string; x: number; y: number }>({
    show: false,
    series: '',
    category: '',
    value: '',
    x: 0,
    y: 0
  });

  // Concentric circle rings count
  gridRings = signal<number[]>([0.2, 0.4, 0.6, 0.8, 1]);

  // Radius bound sizing (inside the 220x220 viewBox, center is 110, 110, maxRadius is 70)
  centerX = 110;
  centerY = 110;
  maxRadius = 70;

  // Calculate coordinates for category axis projections
  axes = computed(() => {
    const N = this.categories().length;
    return this.categories().map((_, i) => {
      const angle = (i * 2 * Math.PI) / N - Math.PI / 2; // Start from top
      const x = this.centerX + this.maxRadius * Math.cos(angle);
      const y = this.centerY + this.maxRadius * Math.sin(angle);

      // Label coordinate placement (offset slightly outwards)
      const labelDistance = this.maxRadius + 14;
      const labelX = this.centerX + labelDistance * Math.cos(angle);
      const labelY = this.centerY + labelDistance * Math.sin(angle) + 3; // +3 offset for vertical alignment

      // Text alignments depending on quadrant position
      let align: 'start' | 'middle' | 'end' = 'middle';
      if (Math.cos(angle) > 0.1) align = 'start';
      else if (Math.cos(angle) < -0.1) align = 'end';

      return { x, y, labelX, labelY, align };
    });
  });

  // Generate points string for web ring paths
  getRingPoints(ringFraction: number): string {
    const N = this.categories().length;
    const r = this.maxRadius * ringFraction;
    const points: string[] = [];

    for (let i = 0; i < N; i++) {
      const angle = (i * 2 * Math.PI) / N - Math.PI / 2;
      const x = this.centerX + r * Math.cos(angle);
      const y = this.centerY + r * Math.sin(angle);
      points.push(\`\${x},\${y}\`);
    }

    return points.join(' ');
  }

  // Generate points string for data series polygons
  getSeriesPoints(series: RadarSeries): string {
    const N = this.categories().length;
    const points: string[] = [];

    for (let i = 0; i < N; i++) {
      const value = series.values[i] ?? 0;
      const fraction = Math.min(1, value / this.max());
      const r = this.maxRadius * fraction;
      
      const angle = (i * 2 * Math.PI) / N - Math.PI / 2;
      const x = this.centerX + r * Math.cos(angle);
      const y = this.centerY + r * Math.sin(angle);
      points.push(\`\${x},\${y}\`);
    }

    return points.join(' ');
  }

  // Get point list representing coordinate items to draw dots
  getSeriesPointList(series: RadarSeries): Array<{ x: number; y: number; value: number }> {
    const N = this.categories().length;
    const list: Array<{ x: number; y: number; value: number }> = [];

    for (let i = 0; i < N; i++) {
      const value = series.values[i] ?? 0;
      const fraction = Math.min(1, value / this.max());
      const r = this.maxRadius * fraction;
      
      const angle = (i * 2 * Math.PI) / N - Math.PI / 2;
      const x = this.centerX + r * Math.cos(angle);
      const y = this.centerY + r * Math.sin(angle);
      list.push({ x, y, value });
    }

    return list;
  }

  // Utility to fetch colors
  getSeriesColor(index: number, opacity: number): string {
    const colorList = this.colors();
    const color = colorList[index % colorList.length];

    if (opacity === 1) return color;
    
    // Convert hex to rgba
    const h = color.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return \`rgba(\${r}, \${g}, \${b}, \${opacity})\`;
  }

  // Hover point interactions
  onPointEnter(series: RadarSeries, index: number, pt: { x: number; y: number; value: number }, event: MouseEvent): void {
    this.hoveredSeries.set(series.label);
    this.hoveredPoint.set({ seriesLabel: series.label, index });

    // Tooltip position mappings relative to the outer container
    const svgRect = (event.currentTarget as SVGElement).ownerSVGElement!.getBoundingClientRect();
    const containerRect = (event.currentTarget as SVGElement).ownerSVGElement!.parentElement!.getBoundingClientRect();

    // Map coordinates relative to parent container
    const x = (pt.x / 220) * svgRect.width + (svgRect.left - containerRect.left);
    const y = (pt.y / 220) * svgRect.height + (svgRect.top - containerRect.top);

    this.tooltip.set({
      show: true,
      series: series.label,
      category: this.categories()[index] ?? '',
      value: pt.value.toLocaleString(),
      x,
      y
    });
  }

  onPointLeave(): void {
    this.hoveredSeries.set(null);
    this.hoveredPoint.set(null);
    this.tooltip.update(t => ({ ...t, show: false }));
  }
}
`,_t=`import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ngx-heatmap-chart',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <div class="ngx-heatmap-wrapper">
      <div class="ngx-heatmap-container">
        <!-- SVG Grid rendering -->
        <svg
          class="ngx-heatmap-svg"
          [attr.viewBox]="viewBoxString()"
          preserveAspectRatio="xMidYMid meet"
        >
          <!-- Y-axis labels -->
          @for (yLabel of yAxisLabels(); track $index) {
            <text
              [attr.x]="leftOffset - 8"
              [attr.y]="getRowY($index) + cellHeight() / 2"
              class="axis-label y-axis-label"
              text-anchor="end"
              dominant-baseline="middle"
            >
              {{ yLabel }}
            </text>
          }

          <!-- X-axis labels -->
          @for (xLabel of xAxisLabels(); track $index) {
            <text
              [attr.x]="getColX($index) + cellWidth() / 2"
              [attr.y]="topOffset - 8"
              class="axis-label x-axis-label"
              text-anchor="middle"
            >
              {{ xLabel }}
            </text>
          }

          <!-- Heatmap Cells -->
          @for (row of data(); track $index; let rIdx = $index) {
            @for (val of row; track $index; let cIdx = $index) {
              <rect
                [attr.x]="getColX(cIdx)"
                [attr.y]="getRowY(rIdx)"
                [attr.width]="cellWidth() - cellSpacing"
                [attr.height]="cellHeight() - cellSpacing"
                [attr.fill]="getCellColor(val)"
                class="heatmap-cell"
                (mouseenter)="onCellEnter(rIdx, cIdx, val, $event)"
                (mouseleave)="onCellLeave()"
                (click)="onCellClick(rIdx, cIdx, val)"
                rx="3"
                ry="3"
              />
            }
          }
        </svg>

        <!-- Dynamic Tooltip -->
        @if (tooltip().show) {
          <div
            class="heatmap-tooltip"
            [style.left.px]="tooltip().x"
            [style.top.px]="tooltip().y"
          >
            <div class="tooltip-title">{{ tooltip().title }}</div>
            <div class="tooltip-row">
              <span>Value:</span>
              <strong>{{ tooltip().value }}</strong>
            </div>
          </div>
        }
      </div>
    </div>
  \`,
  styles: [\`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
    .ngx-heatmap-wrapper {
      width: 100%;
      height: 100%;
      padding: 20px;
      background: var(--bg-secondary, #ffffff);
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 12px;
      box-shadow: var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05));
    }
    .ngx-heatmap-container {
      position: relative;
      width: 100%;
      height: 100%;
    }
    .ngx-heatmap-svg {
      width: 100%;
      height: 100%;
      overflow: visible;
    }
    .axis-label {
      font-size: 10px;
      font-weight: 700;
      fill: var(--text-secondary, #64748b);
      font-family: inherit;
    }
    .heatmap-cell {
      cursor: pointer;
      transition: fill 0.2s ease, stroke 0.15s ease, filter 0.15s ease;
      stroke: transparent;
      stroke-width: 1px;
    }
    .heatmap-cell:hover {
      filter: brightness(1.08) drop-shadow(0 2px 4px rgba(0,0,0,0.15));
      stroke: var(--primary-color, #4f46e5);
    }
    .heatmap-tooltip {
      position: absolute;
      z-index: 100;
      pointer-events: none;
      background: rgba(15, 23, 42, 0.94);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 6px;
      padding: 8px 12px;
      color: #ffffff;
      font-family: inherit;
      font-size: 11px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      backdrop-filter: blur(8px);
      transform: translate(-50%, -115%);
      min-width: 120px;
    }
    .tooltip-title {
      font-weight: 700;
      border-bottom: 1px solid rgba(255, 255, 255, 0.15);
      padding-bottom: 4px;
      margin-bottom: 4px;
      font-size: 12px;
    }
    .tooltip-row {
      display: flex;
      justify-content: space-between;
      gap: 12px;
    }
    .tooltip-row strong {
      color: #fbbf24;
    }
  \`]
})
export class HeatmapChartComponent {
  data = input.required<number[][]>();
  xAxisLabels = input<string[]>([]);
  yAxisLabels = input<string[]>([]);
  colorRange = input<string[]>(['#e2e8f0', '#4f46e5']);

  cellClick = output<{ row: number; col: number; value: number }>();

  // Dimensions configuration
  leftOffset = 70;
  topOffset = 30;
  cellSpacing = 3;

  tooltip = signal<{ show: boolean; title: string; value: string; x: number; y: number }>({
    show: false,
    title: '',
    value: '',
    x: 0,
    y: 0
  });

  cellWidth = computed(() => {
    const cols = this.data()[0]?.length || 1;
    return Math.max(16, (500 - this.leftOffset) / cols);
  });

  cellHeight = computed(() => {
    const rows = this.data().length || 1;
    return Math.max(16, (250 - this.topOffset) / rows);
  });

  viewBoxString = computed(() => {
    const cols = this.data()[0]?.length || 1;
    const rows = this.data().length || 1;
    const width = this.leftOffset + cols * this.cellWidth() + 10;
    const height = this.topOffset + rows * this.cellHeight() + 10;
    return \`0 0 \${width} \${height}\`;
  });

  getColX(colIdx: number): number {
    return this.leftOffset + colIdx * this.cellWidth();
  }

  getRowY(rowIdx: number): number {
    return this.topOffset + rowIdx * this.cellHeight();
  }

  getCellColor(val: number): string {
    const values = this.data().flat();
    const min = Math.min(...values, 0);
    const max = Math.max(...values, 1);
    const range = max - min;
    const fraction = range === 0 ? 0.5 : (val - min) / range;
    return this.interpolateColor(this.colorRange()[0], this.colorRange()[1], fraction);
  }

  private interpolateColor(color1: string, color2: string, fraction: number): string {
    const hex = (x: string) => {
      const h = x.replace('#', '');
      return h.length === 3 ? h.split('').map(c => c + c).join('') : h;
    };
    const c1 = hex(color1);
    const c2 = hex(color2);

    const r1 = parseInt(c1.substring(0, 2), 16);
    const g1 = parseInt(c1.substring(2, 4), 16);
    const b1 = parseInt(c1.substring(4, 6), 16);

    const r2 = parseInt(c2.substring(0, 2), 16);
    const g2 = parseInt(c2.substring(2, 4), 16);
    const b2 = parseInt(c2.substring(4, 6), 16);

    const r = Math.round(r1 + (r2 - r1) * fraction);
    const g = Math.round(g1 + (g2 - g1) * fraction);
    const b = Math.round(b1 + (b2 - b1) * fraction);

    return \`#\${r.toString(16).padStart(2, '0')}\${g.toString(16).padStart(2, '0')}\${b.toString(16).padStart(2, '0')}\`;
  }

  onCellEnter(rIdx: number, cIdx: number, val: number, event: MouseEvent): void {
    const xLabel = this.xAxisLabels()[cIdx] || \`Col \${cIdx + 1}\`;
    const yLabel = this.yAxisLabels()[rIdx] || \`Row \${rIdx + 1}\`;
    const title = \`\${yLabel} \u2022 \${xLabel}\`;

    const rect = (event.currentTarget as SVGRectElement).getBoundingClientRect();
    const parentRect = (event.currentTarget as SVGRectElement).ownerSVGElement!.parentElement!.getBoundingClientRect();
    const x = rect.left - parentRect.left + rect.width / 2;
    const y = rect.top - parentRect.top;

    this.tooltip.set({
      show: true,
      title,
      value: val.toLocaleString(),
      x,
      y
    });
  }

  onCellLeave(): void {
    this.tooltip.update(t => ({ ...t, show: false }));
  }

  onCellClick(rIdx: number, cIdx: number, val: number): void {
    this.cellClick.emit({ row: rIdx, col: cIdx, value: val });
  }
}
`,St=`import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TreemapItem {
  label: string;
  value: number;
  color?: string;
}

interface LayoutItem extends TreemapItem {
  x: number;
  y: number;
  w: number;
  h: number;
  displayColor: string;
}

@Component({
  selector: 'ngx-treemap-chart',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <div class="ngx-treemap-wrapper">
      <div class="ngx-treemap-container">
        <!-- SVG Canvas -->
        <svg
          class="ngx-treemap-svg"
          viewBox="0 0 500 300"
          preserveAspectRatio="xMidYMid meet"
        >
          @for (item of layoutRects(); track item.label; let idx = $index) {
            <g
              class="treemap-group"
              (mouseenter)="onItemEnter(item, $event)"
              (mouseleave)="onItemLeave()"
              (click)="onItemClick(item)"
            >
              <!-- Cell Box -->
              <rect
                [attr.x]="item.x"
                [attr.y]="item.y"
                [attr.width]="item.w"
                [attr.height]="item.h"
                [attr.fill]="item.displayColor"
                class="treemap-rect"
                rx="4"
                ry="4"
              />
              
              <!-- Labels (Only show if rectangle is large enough) -->
              @if (item.w > 50 && item.h > 30) {
                <text
                  [attr.x]="item.x + 8"
                  [attr.y]="item.y + 18"
                  class="treemap-label"
                >
                  {{ item.label }}
                </text>
                @if (item.h > 45) {
                  <text
                    [attr.x]="item.x + 8"
                    [attr.y]="item.y + 32"
                    class="treemap-value"
                  >
                    {{ item.value.toLocaleString() }}
                  </text>
                }
              }
            </g>
          }
        </svg>

        <!-- Glassmorphic Tooltip Overlay -->
        @if (tooltip().show) {
          <div
            class="treemap-tooltip"
            [style.left.px]="tooltip().x"
            [style.top.px]="tooltip().y"
          >
            <div class="tooltip-title">{{ tooltip().title }}</div>
            <div class="tooltip-row">
              <span>Value:</span>
              <strong>{{ tooltip().value }}</strong>
            </div>
          </div>
        }
      </div>
    </div>
  \`,
  styles: [\`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
    .ngx-treemap-wrapper {
      width: 100%;
      height: 100%;
      padding: 16px;
      background: var(--bg-secondary, #ffffff);
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 12px;
      box-shadow: var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05));
    }
    .ngx-treemap-container {
      position: relative;
      width: 100%;
      height: 100%;
    }
    .ngx-treemap-svg {
      width: 100%;
      height: 100%;
      display: block;
      overflow: visible;
    }
    .treemap-group {
      cursor: pointer;
    }
    .treemap-rect {
      stroke: var(--bg-secondary, #ffffff);
      stroke-width: 1.5px;
      transition: fill 0.2s ease, stroke 0.15s ease, filter 0.15s ease;
    }
    .treemap-group:hover .treemap-rect {
      filter: brightness(1.06) drop-shadow(0 2px 8px rgba(0,0,0,0.12));
      stroke: var(--primary-color, #4f46e5);
      stroke-width: 2px;
    }
    .treemap-label {
      font-size: 11px;
      font-weight: 750;
      fill: #ffffff;
      font-family: inherit;
      pointer-events: none;
      text-shadow: 0 1px 2px rgba(0,0,0,0.3);
    }
    .treemap-value {
      font-size: 9px;
      font-weight: 600;
      fill: rgba(255, 255, 255, 0.95);
      font-family: inherit;
      pointer-events: none;
      text-shadow: 0 1px 2px rgba(0,0,0,0.3);
    }
    .treemap-tooltip {
      position: absolute;
      z-index: 100;
      pointer-events: none;
      background: rgba(15, 23, 42, 0.94);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 6px;
      padding: 8px 12px;
      color: #ffffff;
      font-family: inherit;
      font-size: 11px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      backdrop-filter: blur(8px);
      transform: translate(-50%, -115%);
      min-width: 120px;
    }
    .tooltip-title {
      font-weight: 700;
      border-bottom: 1px solid rgba(255, 255, 255, 0.15);
      padding-bottom: 4px;
      margin-bottom: 4px;
      font-size: 12px;
    }
    .tooltip-row {
      display: flex;
      justify-content: space-between;
      gap: 12px;
    }
    .tooltip-row strong {
      color: #fbbf24;
    }
  \`]
})
export class TreemapChartComponent {
  data = input.required<TreemapItem[]>();
  colors = input<string[]>(['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4']);

  itemClick = output<TreemapItem>();

  tooltip = signal<{ show: boolean; title: string; value: string; x: number; y: number }>({
    show: false,
    title: '',
    value: '',
    x: 0,
    y: 0
  });

  layoutRects = computed(() => {
    const rawData = this.data();
    if (!rawData || rawData.length === 0) return [];

    // Sort items descending by value
    const items = [...rawData].sort((a, b) => b.value - a.value);
    const totalVal = items.reduce((sum, item) => sum + item.value, 0);

    const layoutList: LayoutItem[] = [];
    
    // Canvas viewBox is 500x300. Leave a tiny padding margin around
    const w = 500;
    const h = 300;

    const colorsList = this.colors();

    this.subdivide(items, 0, 0, w, h, totalVal, (item, rx, ry, rw, rh, index) => {
      const displayColor = item.color || colorsList[index % colorsList.length];
      layoutList.push({
        ...item,
        x: rx,
        y: ry,
        w: rw,
        h: rh,
        displayColor
      });
    }, 0);

    return layoutList;
  });

  private subdivide(
    items: TreemapItem[],
    x: number,
    y: number,
    w: number,
    h: number,
    totalVal: number,
    callback: (item: TreemapItem, rx: number, ry: number, rw: number, rh: number, index: number) => void,
    startIndex: number
  ) {
    if (items.length === 0) return;
    if (items.length === 1) {
      callback(items[0], x, y, w, h, startIndex);
      return;
    }

    // Proportional division
    let splitIdx = 1;
    let group1Sum = items[0].value;
    let minDiff = Math.abs(group1Sum - (totalVal - group1Sum));

    for (let i = 2; i < items.length; i++) {
      const tempSum = group1Sum + items[i - 1].value;
      const tempDiff = Math.abs(tempSum - (totalVal - tempSum));
      if (tempDiff < minDiff) {
        group1Sum = tempSum;
        splitIdx = i;
        minDiff = tempDiff;
      } else {
        break;
      }
    }

    const group1 = items.slice(0, splitIdx);
    const group2 = items.slice(splitIdx);
    const group2Sum = totalVal - group1Sum;

    // Split on wider axis
    if (w > h) {
      const w1 = w * (group1Sum / totalVal);
      const w2 = w - w1;
      this.subdivide(group1, x, y, w1, h, group1Sum, callback, startIndex);
      this.subdivide(group2, x + w1, y, w2, h, group2Sum, callback, startIndex + splitIdx);
    } else {
      const h1 = h * (group1Sum / totalVal);
      const h2 = h - h1;
      this.subdivide(group1, x, y, w, h1, group1Sum, callback, startIndex);
      this.subdivide(group2, x, y + h1, w, h2, group2Sum, callback, startIndex + splitIdx);
    }
  }

  onItemEnter(item: LayoutItem, event: MouseEvent): void {
    const rect = (event.currentTarget as SVGGraphicsElement).getBoundingClientRect();
    const parentRect = (event.currentTarget as SVGGraphicsElement).ownerSVGElement!.parentElement!.getBoundingClientRect();
    const x = rect.left - parentRect.left + rect.width / 2;
    const y = rect.top - parentRect.top;

    this.tooltip.set({
      show: true,
      title: item.label,
      value: item.value.toLocaleString(),
      x,
      y
    });
  }

  onItemLeave(): void {
    this.tooltip.update(t => ({ ...t, show: false }));
  }

  onItemClick(item: LayoutItem): void {
    this.itemClick.emit(item);
  }
}
`,Tt=`import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {  CHART_COLORS, ChartSeries, niceTicks, scale, smoothPath, fmtNum  } from './chart-utils';

@Component({
  selector: 'ngx-area-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <div class="ngx-area-chart" (mousemove)="onMouseMove($event)" (mouseleave)="crosshair.set(null); tooltip.set(null)">
      @if (showLegend()) {
        <div class="chart-legend">
          @for (s of series(); track s.name; let i = $index) {
            <span class="legend-item">
              <span class="legend-dot" [style.background]="seriesColor(i, s)"></span>
              {{ s.name }}
            </span>
          }
        </div>
      }
      
      <div class="chart-svg-wrap">
        <svg [attr.width]="'100%'" [attr.height]="height()" class="chart-svg">
          <defs>
            @for (s of series(); track s.name; let i = $index) {
              <linearGradient [attr.id]="'area-gradient-' + i" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" [attr.stop-color]="seriesColor(i, s)" stop-opacity="0.45"/>
                <stop offset="100%" [attr.stop-color]="seriesColor(i, s)" stop-opacity="0.02"/>
              </linearGradient>
            }
          </defs>
          
          <g [attr.transform]="'translate(' + PAD_LEFT + ',' + PAD_TOP + ')'">
            <!-- Gridlines -->
            @for (tick of yTicks(); track tick) {
              <g [attr.transform]="'translate(0,' + yPos(tick) + ')'">
                @if (showGrid()) {
                  <line [attr.x1]="0" [attr.x2]="innerW()" stroke="var(--ngx-chart-grid, #e2e8f0)" stroke-dasharray="3,3"/>
                }
                <text x="-8" dy="4" class="axis-label" text-anchor="end">{{ fmtNum(tick) }}</text>
              </g>
            }

            <!-- X Axis Categories -->
            @for (cat of categories(); track cat; let i = $index) {
              <text [attr.x]="xPos(i)" [attr.y]="innerH() + 16" class="axis-label" text-anchor="middle">{{ cat }}</text>
            }

            <!-- Area & Line Paths -->
            @for (s of series(); track s.name; let si = $index) {
              <!-- Area Fill -->
              <path
                [attr.d]="areaPath(s)"
                [attr.fill]="'url(#area-gradient-' + si + ')'"
                stroke="none"
              />
              
              <!-- Border Line -->
              <path
                [attr.d]="linePath(s)"
                [attr.stroke]="seriesColor(si, s)"
                fill="none"
                stroke-width="3"
                stroke-linejoin="round"
                stroke-linecap="round"
              />
              
              <!-- Hover Markers -->
              @if (showMarkers()) {
                @for (v of s.data; track $index; let ci = $index) {
                  <circle
                    [attr.cx]="xPos(ci)"
                    [attr.cy]="yPos(v)"
                    r="4"
                    [attr.fill]="seriesColor(si, s)"
                    stroke="#ffffff"
                    stroke-width="2"
                    class="marker-dot"
                  />
                }
              }
            }

            <!-- Vertical Crosshair -->
            @if (crosshair(); as ch) {
              <line [attr.x1]="ch.x" [attr.x2]="ch.x" y1="0" [attr.y2]="innerH()"
                stroke="var(--primary-color, #4f46e5)" stroke-opacity="0.3" stroke-width="1.5" stroke-dasharray="4,4"/>
            }

            <!-- Axis Lines -->
            <line x1="0" [attr.x2]="innerW()" [attr.y1]="innerH()" [attr.y2]="innerH()" stroke="var(--ngx-chart-axis, #cbd5e1)"/>
            <line x1="0" x2="0" y1="0" [attr.y2]="innerH()" stroke="var(--ngx-chart-axis, #cbd5e1)"/>
          </g>
        </svg>
      </div>

      <!-- Hover Tooltip -->
      @if (tooltip(); as t) {
        <div class="chart-tooltip" [style.left.px]="t.x" [style.top.px]="t.y">
          <div class="tt-cat">{{ t.cat }}</div>
          @for (row of t.rows; track row.name) {
            <div class="tt-row">
              <span class="tt-dot" [style.background]="row.color"></span>
              <span class="tt-name">{{ row.name }}</span>
              <strong class="tt-val">{{ fmtNum(row.value) }}</strong>
            </div>
          }
        </div>
      }
    </div>
  \`,
  styles: [\`
    :host {
      display: block;
    }
    .ngx-area-chart {
      position: relative;
      background: var(--bg-secondary, #ffffff);
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 12px;
      padding: 20px;
    }
    .chart-legend {
      display: flex;
      gap: 16px;
      padding: 0 0 12px;
      flex-wrap: wrap;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: var(--text-secondary, #64748b);
      font-weight: 500;
    }
    .legend-dot {
      width: 12px;
      height: 4px;
      border-radius: 2px;
      display: inline-block;
    }
    .chart-svg-wrap {
      position: relative;
      width: 100%;
    }
    .chart-svg {
      display: block;
      overflow: visible;
      cursor: crosshair;
    }
    .axis-label {
      font-size: 10px;
      font-weight: 600;
      fill: var(--text-secondary, #94a3b8);
    }
    .marker-dot {
      transition: r 0.1s ease;
    }
    .marker-dot:hover {
      r: 6px;
    }
    
    .chart-tooltip {
      position: absolute;
      pointer-events: none;
      transform: translate(-50%, -100%) translateY(-10px);
      background: var(--ngx-chart-tooltip-bg, #0f172a);
      color: #ffffff;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 12px;
      white-space: nowrap;
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
      z-index: 10;
    }
    .tt-cat {
      font-weight: 700;
      margin-bottom: 4px;
      color: #ffffff;
    }
    .tt-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 2px;
    }
    .tt-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .tt-name {
      font-size: 11px;
      color: #cbd5e1;
    }
    .tt-val {
      margin-left: auto;
      font-weight: 700;
    }
  \`]
})
export class AreaChartComponent {
  readonly PAD_LEFT = 48;
  readonly PAD_TOP = 12;
  readonly PAD_RIGHT = 16;
  readonly PAD_BOTTOM = 32;

  series = input<ChartSeries[]>([]);
  categories = input<string[]>([]);
  height = input<number>(260);
  showGrid = input<boolean>(true);
  showMarkers = input<boolean>(true);
  showLegend = input<boolean>(true);
  colors = input<string[]>(CHART_COLORS);

  crosshair = signal<{ x: number } | null>(null);
  tooltip = signal<{ x: number; y: number; cat: string; rows: { name: string; value: number; color: string }[] } | null>(null);
  containerWidth = signal<number>(600);

  innerW = computed(() => this.containerWidth() - this.PAD_LEFT - this.PAD_RIGHT);
  innerH = computed(() => this.height() - this.PAD_TOP - this.PAD_BOTTOM);

  constructor() {
    const hostEl = inject(ElementRef).nativeElement;
    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(entries => {
        if (!entries || entries.length === 0) return;
        const width = entries[0].contentRect.width;
        if (width > 0) {
          // Subtract padding of .ngx-area-chart (20px on each side = 40px)
          this.containerWidth.set(width - 40);
        }
      });
      resizeObserver.observe(hostEl);
      inject(DestroyRef).onDestroy(() => resizeObserver.disconnect());
    }
  }

  private allValues = computed(() => this.series().flatMap(s => s.data));
  private yMin = computed(() => Math.min(0, ...this.allValues()));
  private yMax = computed(() => Math.max(1, ...this.allValues()));
  yTicks = computed(() => niceTicks(this.yMin(), this.yMax(), 5));

  yPos(v: number): number { return scale(v, this.yMin(), this.yMax(), this.innerH(), 0); }
  xPos(i: number): number {
    const n = this.categories().length;
    return n <= 1 ? this.innerW() / 2 : scale(i, 0, n - 1, 0, this.innerW());
  }

  seriesColor(i: number, s: ChartSeries): string {
    return s.color || this.colors()[i % this.colors().length];
  }

  linePath(s: ChartSeries): string {
    const pts: [number, number][] = s.data.map((v, i) => [this.xPos(i), this.yPos(v)]);
    return smoothPath(pts);
  }

  areaPath(s: ChartSeries): string {
    const pts: [number, number][] = s.data.map((v, i) => [this.xPos(i), this.yPos(v)]);
    const line = smoothPath(pts);
    const last = pts[pts.length - 1];
    const first = pts[0];
    return line + \` L \${last[0]} \${this.innerH()} L \${first[0]} \${this.innerH()} Z\`;
  }

  onMouseMove(event: MouseEvent): void {
    const el = event.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const mx = event.clientX - rect.left - this.PAD_LEFT;
    const cats = this.categories();
    if (cats.length === 0) return;
    const idx = Math.round(scale(mx, 0, this.innerW(), 0, cats.length - 1));
    const ci = Math.max(0, Math.min(cats.length - 1, idx));
    this.crosshair.set({ x: this.xPos(ci) });
    const rows = this.series().map((s, si) => ({
      name: s.name,
      value: s.data[ci] ?? 0,
      color: this.seriesColor(si, s),
    }));
    this.tooltip.set({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      cat: cats[ci],
      rows,
    });
  }

  readonly fmtNum = fmtNum;
}
`,Pt=`import { Component, ChangeDetectionStrategy, input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {  CHART_COLORS, fmtNum  } from './chart-utils';

export interface FunnelItem {
  name: string;
  value: number;
  color?: string;
}

@Component({
  selector: 'ngx-funnel-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <div class="ngx-funnel-chart">
      <div class="funnel-layout">
        <!-- SVG Visual Funnel / Pyramid -->
        <div class="funnel-graphic" (mouseleave)="hoveredIndex.set(null)">
          <svg [attr.width]="'100%'" [attr.height]="height()" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet" class="funnel-svg">
            <g>
              @for (stage of funnelStages(); track stage.name; let i = $index) {
                <polygon
                  [attr.points]="stage.points"
                  [attr.fill]="stage.color"
                  [class.active]="hoveredIndex() === i"
                  (mouseenter)="hoveredIndex.set(i)"
                  (mousemove)="onMouseMove($event, i)"
                  class="funnel-polygon"
                />
              }
            </g>
          </svg>
          
          <!-- Hover Tooltip -->
          @if (hoveredIndex() !== null) {
            @if (funnelStages()[hoveredIndex()!]; as stage) {
              <div class="chart-tooltip" [style.left.px]="tooltipX()" [style.top.px]="tooltipY()">
                <div class="tt-name">{{ stage.name }}</div>
                <div class="tt-row">
                  Value: <strong>{{ fmtNum(stage.value) }}</strong>
                </div>
                <div class="tt-row">
                  {{ mode() === 'funnel' ? 'Conversion' : 'Share' }}: 
                  <strong>
                    {{ (mode() === 'funnel' ? (stage.value / funnelStages()[0].value) : (stage.value / totalValue())) | percent:'1.0-1' }}
                  </strong>
                </div>
              </div>
            }
          }
        </div>

        <!-- Sidebar legend & metric checklist -->
        <div class="funnel-legend">
          @for (stage of funnelStages(); track stage.name; let i = $index) {
            <div
              class="legend-item"
              [class.active]="hoveredIndex() === i"
              (mouseenter)="hoveredIndex.set(i)"
              (mouseleave)="hoveredIndex.set(null)"
            >
              <span class="legend-color-dot" [style.background]="stage.color"></span>
              <div class="legend-content">
                <span class="legend-title">{{ stage.name }}</span>
                <div class="legend-metrics">
                  <span class="metric-value">{{ fmtNum(stage.value) }}</span>
                  <span class="metric-pct">
                    {{ (mode() === 'funnel' ? (stage.value / funnelStages()[0].value) : (stage.value / totalValue())) | percent:'1.0-1' }}
                  </span>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  \`,
  styles: [\`
    :host {
      display: block;
    }
    .ngx-funnel-chart {
      background: var(--ngx-chart-bg, #ffffff);
      border: 1px solid var(--ngx-chart-grid, #ebedf0);
      border-radius: 12px;
      padding: 20px;
    }
    .funnel-layout {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 24px;
      align-items: center;
    }
    @media (max-width: 600px) {
      .funnel-layout {
        grid-template-columns: 1fr;
      }
    }
    
    .funnel-graphic {
      position: relative;
      width: 100%;
    }
    .funnel-svg {
      display: block;
      overflow: visible;
    }
    .funnel-polygon {
      cursor: pointer;
      opacity: 0.85;
      transition: opacity 0.2s, transform 0.2s, filter 0.2s;
    }
    .funnel-polygon:hover, .funnel-polygon.active {
      opacity: 1;
      filter: drop-shadow(0 4px 12px rgba(0,0,0,0.12)) brightness(1.05);
    }

    /* Tooltip styling */
    .chart-tooltip {
      position: absolute;
      pointer-events: none;
      transform: translate(-50%, -100%) translateY(-10px);
      background: var(--ngx-chart-tooltip-bg, #0f172a);
      color: #ffffff;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 12px;
      white-space: nowrap;
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
      z-index: 10;
    }
    .tt-name {
      font-weight: 700;
      margin-bottom: 4px;
    }
    .tt-row {
      font-size: 11px;
      opacity: 0.9;
    }

    /* Sidebar metrics list */
    .funnel-legend {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      border-radius: 8px;
      border: 1px solid transparent;
      transition: all 0.2s;
      cursor: pointer;
    }
    .legend-item:hover, .legend-item.active {
      background: var(--ngx-chart-grid, #f8fafc);
      border-color: var(--ngx-chart-grid, #e2e8f0);
    }
    .legend-color-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .legend-content {
      flex: 1;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
    }
    .legend-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--ngx-chart-text, #0f172a);
    }
    .legend-metrics {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .metric-value {
      font-size: 13px;
      font-weight: 700;
      color: var(--ngx-chart-text, #0f172a);
    }
    .metric-pct {
      font-size: 11px;
      color: var(--ngx-chart-axis-text, #64748b);
      background: var(--ngx-chart-grid, #f1f5f9);
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 600;
    }
  \`]
})
export class FunnelChartComponent {
  data = input<FunnelItem[]>([]);
  height = input<number>(300);
  colors = input<string[]>(CHART_COLORS);
  mode = input<'funnel' | 'pyramid'>('funnel');

  hoveredIndex = signal<number | null>(null);
  tooltipX = signal<number>(0);
  tooltipY = signal<number>(0);

  totalValue = computed(() => {
    return this.data().reduce((sum, item) => sum + item.value, 0) || 1;
  });

  // Computes the SVG polygon coordinates for the funnel / pyramid steps
  funnelStages = computed(() => {
    const items = this.data();
    if (items.length === 0) return [];
    
    const count = items.length;
    const svgW = 400;
    const svgH = 300;
    const maxFunnelW = 320;

    if (this.mode() === 'pyramid') {
      // Pyramid Mode: Stacks vertically to form a triangle pointing up.
      // Slices stack: top is narrow (apex), bottom is wide (base).
      // Each slice height represents its proportion of the total value.
      const totalVal = this.totalValue();
      let currentY = 0;

      return items.map((item, idx) => {
        const h = (item.value / totalVal) * svgH;
        const yTop = currentY;
        const yBot = currentY + h;

        // Since the outer shape is a triangle from (200, 0) to (200 - maxW/2, svgH) and (200 + maxW/2, svgH):
        // Width at any y is: w(y) = (y / svgH) * maxFunnelW
        const wTop = (yTop / svgH) * maxFunnelW;
        const wBot = (yBot / svgH) * maxFunnelW;

        const xTopLeft = (svgW - wTop) / 2;
        const xTopRight = (svgW + wTop) / 2;
        const xBotLeft = (svgW - wBot) / 2;
        const xBotRight = (svgW + wBot) / 2;

        const points = \`\${xTopLeft},\${yTop} \${xTopRight},\${yTop} \${xBotRight},\${yBot} \${xBotLeft},\${yBot}\`;
        const color = item.color || this.colors()[idx % this.colors().length];

        currentY += h;

        return {
          name: item.name,
          value: item.value,
          points,
          color,
          yCenter: (yTop + yBot) / 2
        };
      });
    } else {
      // Standard Funnel Mode
      const maxVal = items[0]?.value || 1;
      const stepH = svgH / count;
      
      return items.map((item, idx) => {
        const topPct = item.value / maxVal;
        const botPct = idx < count - 1 ? items[idx + 1].value / maxVal : topPct * 0.4;
        
        const topW = topPct * maxFunnelW;
        const botW = botPct * maxFunnelW;
        
        const yTop = idx * stepH;
        const yBot = (idx + 1) * stepH;
        
        const xTopLeft = (svgW - topW) / 2;
        const xTopRight = (svgW + topW) / 2;
        const xBotLeft = (svgW - botW) / 2;
        const xBotRight = (svgW + botW) / 2;
        
        const points = \`\${xTopLeft},\${yTop} \${xTopRight},\${yTop} \${xBotRight},\${yBot} \${xBotLeft},\${yBot}\`;
        const color = item.color || this.colors()[idx % this.colors().length];
        
        return {
          name: item.name,
          value: item.value,
          points,
          color,
          yCenter: (yTop + yBot) / 2
        };
      });
    }
  });

  onMouseMove(event: MouseEvent, index: number): void {
    const el = event.currentTarget as SVGElement;
    const rect = el.getBoundingClientRect();
    const parentRect = el.parentElement?.parentElement?.getBoundingClientRect();
    if (parentRect) {
      this.tooltipX.set(event.clientX - parentRect.left);
      this.tooltipY.set(event.clientY - parentRect.top);
    }
  }

  readonly fmtNum = fmtNum;
}
`,Mt=`import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, viewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {  CHART_COLORS, ChartSeries, niceTicks, scale, fmtNum  } from './chart-utils';

@Component({
  selector: 'ngx-combo-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <div class="ngx-combo-chart" [class.dark]="theme() === 'dark'">
      <!-- Legend -->
      @if (showLegend()) {
        <div class="chart-legend">
          @for (s of barSeries(); track s.name; let i = $index) {
            <span class="legend-item">
              <span class="legend-dot bar" [style.background]="barSeriesColor(i)"></span>
              {{ s.name }} (Bar)
            </span>
          }
          @for (s of lineSeries(); track s.name; let i = $index) {
            <span class="legend-item">
              <span class="legend-line" [style.border-color]="lineSeriesColor(i)"></span>
              <span class="legend-dot marker" [style.background]="lineSeriesColor(i)"></span>
              {{ s.name }} (Line)
            </span>
          }
        </div>
      }

      <div class="chart-svg-container" #container>
        <svg
          [attr.width]="'100%'"
          [attr.height]="height()"
          class="chart-svg"
          (mouseleave)="onMouseLeave()"
        >
          <g [attr.transform]="'translate(' + PAD_LEFT + ',' + PAD_TOP + ')'">
            <!-- Grid Lines -->
            @if (showGrid()) {
              @for (tick of leftYTicks(); track tick) {
                <line
                  [attr.x1]="0"
                  [attr.x2]="innerW()"
                  [attr.y1]="leftYPos(tick)"
                  [attr.y2]="leftYPos(tick)"
                  stroke="var(--ngx-chart-grid, #ebedf0)"
                  stroke-dasharray="3,3"
                />
              }
            }

            <!-- Y-Axis (Left) - Bars -->
            @for (tick of leftYTicks(); track tick) {
              <text
                x="-10"
                [attr.y]="leftYPos(tick) + 4"
                class="axis-label left"
                text-anchor="end"
              >{{ fmtNum(tick) }}</text>
            }
            <text
              [attr.transform]="'rotate(-90) translate(' + (-innerH()/2) + ', -36)'"
              class="axis-title left"
              text-anchor="middle"
            >{{ barYTitle() }}</text>

            <!-- Y-Axis (Right) - Lines -->
            @for (tick of rightYTicks(); track tick) {
              <text
                [attr.x]="innerW() + 10"
                [attr.y]="rightYPos(tick) + 4"
                class="axis-label right"
                text-anchor="start"
              >{{ fmtNum(tick) }}</text>
            }
            <text
              [attr.transform]="'rotate(90) translate(' + (innerH()/2) + ', ' + (-innerW() - 36) + ')'"
              class="axis-title right"
              text-anchor="middle"
            >{{ lineYTitle() }}</text>

            <!-- X-Axis Labels -->
            @for (cat of categories(); track cat; let i = $index) {
              <text
                [attr.x]="catMidX(i)"
                [attr.y]="innerH() + 20"
                class="axis-label x"
                text-anchor="middle"
              >{{ cat }}</text>
            }

            <!-- Active Category Column Highlight -->
            @if (activeCategoryIndex() !== null) {
              <rect
                [attr.x]="activeCategoryIndex()! * groupW() + 2"
                [attr.y]="0"
                [attr.width]="groupW() - 4"
                [attr.height]="innerH()"
                class="column-highlight"
              />
            }

            <!-- Bars (Left Y-Axis Scale) -->
            @for (s of barSeries(); track s.name; let si = $index) {
              @for (v of s.data; track $index; let ci = $index) {
                @if (v !== null && v !== undefined) {
                  <rect
                    [attr.x]="barX(ci, si)"
                    [attr.y]="barY(v)"
                    [attr.width]="singleBarWidth()"
                    [attr.height]="barH(v)"
                    [attr.fill]="s.color || barSeriesColor(si)"
                    [attr.rx]="2"
                    class="bar-rect"
                  />
                }
              }
            }

            <!-- Lines (Right Y-Axis Scale) -->
            @for (s of lineSeries(); track s.name; let si = $index) {
              <!-- Draw Line Path -->
              <path
                [attr.d]="linePath(s)"
                fill="none"
                [attr.stroke]="s.color || lineSeriesColor(si)"
                stroke-width="3"
                stroke-linecap="round"
                class="line-path"
              />
              <!-- Draw Markers -->
              @for (v of s.data; track $index; let ci = $index) {
                @if (v !== null && v !== undefined) {
                  <circle
                    [attr.cx]="catMidX(ci)"
                    [attr.cy]="rightYPos(v)"
                    [attr.r]="activeCategoryIndex() === ci ? 6 : 4"
                    [attr.fill]="'#ffffff'"
                    [attr.stroke]="s.color || lineSeriesColor(si)"
                    stroke-width="2.5"
                    class="line-marker"
                  />
                }
              }
            }

            <!-- Invisible Hover Interactive Hitboxes -->
            @for (cat of categories(); track cat; let i = $index) {
              <rect
                [attr.x]="i * groupW()"
                [attr.y]="0"
                [attr.width]="groupW()"
                [attr.height]="innerH()"
                fill="transparent"
                class="hitbox"
                (mousemove)="onMouseMove($event, i)"
              />
            }

            <!-- Base axes borders -->
            <line x1="0" [attr.x2]="innerW()" [attr.y1]="innerH()" [attr.y2]="innerH()" stroke="var(--ngx-chart-axis, #ced4da)"/>
            <line x1="0" x2="0" y1="0" [attr.y2]="innerH()" stroke="var(--ngx-chart-axis, #ced4da)"/>
            <line [attr.x1]="innerW()" [attr.x2]="innerW()" y1="0" [attr.y2]="innerH()" stroke="var(--ngx-chart-axis, #ced4da)"/>
          </g>
        </svg>

        <!-- Dynamic Combined Tooltip -->
        @if (tooltip(); as t) {
          <div class="chart-tooltip" [style.left.px]="t.x" [style.top.px]="t.y">
            <div class="tooltip-header">{{ t.category }}</div>
            <div class="tooltip-body">
              @for (item of t.items; track item.name) {
                <div class="tooltip-row">
                  <span class="tooltip-dot" [style.background]="item.color" [class.line-dot]="item.type === 'line'"></span>
                  <span class="tooltip-label">{{ item.name }}:</span>
                  <span class="tooltip-val">{{ fmtNum(item.value) }}{{ item.suffix || '' }}</span>
                </div>
              }
            </div>
          </div>
        }
      </div>
    </div>
  \`,
  styles: [\`
    :host {
      display: block;
      width: 100%;
    }
    .ngx-combo-chart {
      position: relative;
      background: var(--ngx-chart-bg, #ffffff);
      border-radius: 16px;
      padding: 16px;
      box-sizing: border-box;
      font-family: var(--ngx-font-family, system-ui, sans-serif);
      transition: background-color 0.3s;
    }
    .ngx-combo-chart.dark {
      background: rgba(30, 32, 48, 0.45);
      border: 1px solid rgba(255, 255, 255, 0.05);
      --ngx-chart-bg: transparent;
      --ngx-chart-grid: rgba(255, 255, 255, 0.06);
      --ngx-chart-axis: rgba(255, 255, 255, 0.12);
    }
    .chart-legend {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 500;
      color: #64748b;
    }
    .dark .legend-item {
      color: #94a3b8;
    }
    .legend-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      display: inline-block;
    }
    .legend-dot.bar {
      border-radius: 2px;
    }
    .legend-line {
      width: 14px;
      border-bottom: 2px solid;
      display: inline-block;
    }
    .legend-dot.marker {
      margin-left: -12px;
      width: 6px;
      height: 6px;
      border: 1.5px solid #ffffff;
    }
    .chart-svg-container {
      position: relative;
      width: 100%;
    }
    .chart-svg {
      display: block;
      overflow: visible;
    }
    .axis-label {
      font-size: 10px;
      fill: #64748b;
      font-weight: 500;
    }
    .dark .axis-label {
      fill: #94a3b8;
    }
    .axis-title {
      font-size: 11px;
      font-weight: 600;
      fill: #475569;
      letter-spacing: 0.5px;
    }
    .dark .axis-title {
      fill: #cbd5e1;
    }
    .column-highlight {
      fill: rgba(59, 130, 246, 0.04);
      pointer-events: none;
    }
    .dark .column-highlight {
      fill: rgba(255, 255, 255, 0.03);
    }
    .bar-rect {
      transition: fill-opacity 0.2s, transform 0.2s;
    }
    .line-path {
      transition: stroke 0.2s;
    }
    .line-marker {
      cursor: pointer;
      transition: r 0.2s, stroke-width 0.2s;
    }
    .hitbox {
      cursor: crosshair;
    }
    .chart-tooltip {
      position: absolute;
      pointer-events: none;
      transform: translate(-50%, -100%) translateY(-10px);
      background: rgba(15, 23, 42, 0.9);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
      color: #f8fafc;
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 12px;
      z-index: 100;
      min-width: 140px;
      transition: left 0.1s ease, top 0.1s ease;
    }
    .tooltip-header {
      font-weight: 700;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding-bottom: 4px;
      margin-bottom: 6px;
      color: #38bdf8;
    }
    .tooltip-body {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .tooltip-row {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .tooltip-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
    }
    .tooltip-dot.line-dot {
      border: 1.5px solid #ffffff;
      box-sizing: border-box;
      width: 8px;
      height: 8px;
    }
    .tooltip-label {
      color: #94a3b8;
      flex: 1;
    }
    .tooltip-val {
      font-weight: 700;
      font-family: monospace;
    }
  \`]
})
export class ComboChartComponent {
  PAD_LEFT = 52;
  PAD_TOP = 16;
  PAD_RIGHT = 52;
  PAD_BOTTOM = 36;

  barSeries = input<ChartSeries[]>([]);
  lineSeries = input<ChartSeries[]>([]);
  categories = input<string[]>([]);
  height = input<number>(300);
  showGrid = input<boolean>(true);
  showLegend = input<boolean>(true);
  theme = input<'light' | 'dark'>('light');
  colors = input<string[]>(CHART_COLORS);
  barYTitle = input<string>('Volume');
  lineYTitle = input<string>('Percentage');

  activeCategoryIndex = signal<number | null>(null);
  tooltip = signal<{
    x: number;
    y: number;
    category: string;
    items: Array<{ name: string; value: number; color: string; type: 'bar' | 'line'; suffix?: string }>;
  } | null>(null);

  private container = viewChild<ElementRef>('container');

  // Dimension Calculations
  innerW = computed(() => {
    const el = this.container()?.nativeElement;
    const totalW = el ? el.getBoundingClientRect().width : 600;
    return Math.max(200, totalW - this.PAD_LEFT - this.PAD_RIGHT);
  });

  innerH = computed(() => this.height() - this.PAD_TOP - this.PAD_BOTTOM);

  // Left Y-Axis Calculations (Bar values)
  private leftValues = computed(() => this.barSeries().flatMap(s => s.data.filter(v => v !== null)));
  private leftMin = computed(() => Math.min(0, ...this.leftValues()));
  private leftMax = computed(() => Math.max(1, ...this.leftValues()));
  leftYTicks = computed(() => niceTicks(this.leftMin(), this.leftMax(), 5));

  leftYPos(v: number): number {
    return scale(v, this.leftMin(), this.leftMax(), this.innerH(), 0);
  }
  barY(v: number): number { return Math.min(this.leftYPos(0), this.leftYPos(v)); }
  barH(v: number): number { return Math.abs(this.leftYPos(0) - this.leftYPos(v)); }

  // Right Y-Axis Calculations (Line values)
  private rightValues = computed(() => this.lineSeries().flatMap(s => s.data.filter(v => v !== null)));
  private rightMin = computed(() => Math.min(0, ...this.rightValues()));
  private rightMax = computed(() => Math.max(100, ...this.rightValues()));
  rightYTicks = computed(() => niceTicks(this.rightMin(), this.rightMax(), 5));

  rightYPos(v: number): number {
    return scale(v, this.rightMin(), this.rightMax(), this.innerH(), 0);
  }

  // Layout positioning
  groupW = computed(() => this.categories().length > 0 ? this.innerW() / this.categories().length : 0);
  singleBarWidth = computed(() => {
    const numSeries = this.barSeries().length || 1;
    return Math.max(4, (this.groupW() - 12) / numSeries);
  });

  catMidX(i: number): number {
    return i * this.groupW() + this.groupW() / 2;
  }

  barX(ci: number, si: number): number {
    const numSeries = this.barSeries().length;
    const groupStartX = ci * this.groupW() + 6;
    return groupStartX + si * this.singleBarWidth();
  }

  barSeriesColor(si: number): string {
    return this.colors()[si % this.colors().length];
  }

  lineSeriesColor(si: number): string {
    // Avoid color collision by shifting indices
    const offset = this.barSeries().length || 0;
    return this.colors()[(si + offset) % this.colors().length];
  }

  // Line paths generator
  linePath(series: ChartSeries): string {
    const pts = series.data.map((v, ci) => {
      if (v === null || v === undefined) return null;
      return [this.catMidX(ci), this.rightYPos(v)] as [number, number];
    }).filter((p): p is [number, number] => p !== null);

    if (pts.length < 2) return '';
    let d = \`M \${pts[0][0]} \${pts[0][1]}\`;
    for (let i = 1; i < pts.length; i++) {
      d += \` L \${pts[i][0]} \${pts[i][1]}\`;
    }
    return d;
  }

  onMouseMove(event: MouseEvent, index: number) {
    this.activeCategoryIndex.set(index);
    const containerEl = this.container()?.nativeElement;
    if (!containerEl) return;
    const rect = containerEl.getBoundingClientRect();
    const tooltipX = event.clientX - rect.left;
    const tooltipY = event.clientY - rect.top;

    const catName = this.categories()[index] || \`Category \${index + 1}\`;
    const items: any[] = [];

    // Bars info
    this.barSeries().forEach((s, si) => {
      const val = s.data[index];
      if (val !== undefined && val !== null) {
        items.push({
          name: s.name,
          value: val,
          color: s.color || this.barSeriesColor(si),
          type: 'bar'
        });
      }
    });

    // Lines info
    this.lineSeries().forEach((s, si) => {
      const val = s.data[index];
      if (val !== undefined && val !== null) {
        items.push({
          name: s.name,
          value: val,
          color: s.color || this.lineSeriesColor(si),
          type: 'line',
          suffix: '%'
        });
      }
    });

    this.tooltip.set({
      x: tooltipX,
      y: tooltipY,
      category: catName,
      items
    });
  }

  onMouseLeave() {
    this.activeCategoryIndex.set(null);
    this.tooltip.set(null);
  }

  readonly fmtNum = fmtNum;
}
`,Et=`import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, viewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {  CHART_COLORS, niceTicks, scale, fmtNum  } from './chart-utils';

export interface ScatterPoint {
  x: number;
  y: number;
  label?: string;
  group?: string;
  size?: number; // Bubble sizing support
}

@Component({
  selector: 'ngx-scatter-plot',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <div class="ngx-scatter-plot" [class.dark]="theme() === 'dark'">
      <!-- Legend -->
      @if (showLegend() && uniqueGroups().length > 0) {
        <div class="chart-legend">
          @for (group of uniqueGroups(); track group; let i = $index) {
            <span class="legend-item">
              <span class="legend-dot" [style.background]="groupColor(group)"></span>
              {{ group }}
            </span>
          }
        </div>
      }

      <div class="chart-svg-container" #container>
        <svg
          [attr.width]="'100%'"
          [attr.height]="height()"
          class="chart-svg"
          (mouseleave)="onMouseLeave()"
        >
          <g [attr.transform]="'translate(' + PAD_LEFT + ',' + PAD_TOP + ')'">
            <!-- Grid Lines (Horizontal and Vertical) -->
            @if (showGrid()) {
              <!-- Horizontal Grid Lines -->
              @for (tick of yTicks(); track tick) {
                <line
                  [attr.x1]="0"
                  [attr.x2]="innerW()"
                  [attr.y1]="yPos(tick)"
                  [attr.y2]="yPos(tick)"
                  stroke="var(--ngx-chart-grid, #ebedf0)"
                  stroke-dasharray="3,3"
                />
              }
              <!-- Vertical Grid Lines -->
              @for (tick of xTicks(); track tick) {
                <line
                  [attr.x1]="xPos(tick)"
                  [attr.x2]="xPos(tick)"
                  [attr.y1]="0"
                  [attr.y2]="innerH()"
                  stroke="var(--ngx-chart-grid, #ebedf0)"
                  stroke-dasharray="3,3"
                />
              }
            }

            <!-- Y-Axis Labels -->
            @for (tick of yTicks(); track tick) {
              <text
                x="-10"
                [attr.y]="yPos(tick) + 4"
                class="axis-label y"
                text-anchor="end"
              >{{ fmtNum(tick) }}</text>
            }
            <text
              [attr.transform]="'rotate(-90) translate(' + (-innerH()/2) + ', -36)'"
              class="axis-title y"
              text-anchor="middle"
            >{{ yTitle() }}</text>

            <!-- X-Axis Labels -->
            @for (tick of xTicks(); track tick) {
              <text
                [attr.x]="xPos(tick)"
                [attr.y]="innerH() + 20"
                class="axis-label x"
                text-anchor="middle"
              >{{ fmtNum(tick) }}</text>
            }
            <text
              [attr.x]="innerW() / 2"
              [attr.y]="innerH() + 38"
              class="axis-title x"
              text-anchor="middle"
            >{{ xTitle() }}</text>

            <!-- Render Data Points -->
            @for (pt of scaledPoints(); track $index; let i = $index) {
              <circle
                [attr.cx]="pt.cx"
                [attr.cy]="pt.cy"
                [attr.r]="pt.r"
                [attr.fill]="pt.color"
                [attr.stroke]="'#ffffff'"
                stroke-width="1.5"
                class="scatter-point"
                [class.hovered]="hoveredPointIndex() === i"
                (mouseenter)="onPointHover($event, pt.raw, i)"
              />
            }

            <!-- Base axes borders -->
            <line x1="0" [attr.x2]="innerW()" [attr.y1]="innerH()" [attr.y2]="innerH()" stroke="var(--ngx-chart-axis, #ced4da)"/>
            <line x1="0" x2="0" y1="0" [attr.y2]="innerH()" stroke="var(--ngx-chart-axis, #ced4da)"/>
          </g>
        </svg>

        <!-- Tooltip -->
        @if (tooltip(); as t) {
          <div class="chart-tooltip" [style.left.px]="t.x" [style.top.px]="t.y">
            @if (t.label) {
              <div class="tooltip-header">{{ t.label }}</div>
            }
            <div class="tooltip-body">
              @if (t.group) {
                <div class="tooltip-group">Group: <strong>{{ t.group }}</strong></div>
              }
              <div class="tooltip-val">{{ xTitle() }}: <strong>{{ fmtNum(ptX(t)) }}</strong></div>
              <div class="tooltip-val">{{ yTitle() }}: <strong>{{ fmtNum(ptY(t)) }}</strong></div>
            </div>
          </div>
        }
      </div>
    </div>
  \`,
  styles: [\`
    :host {
      display: block;
      width: 100%;
    }
    .ngx-scatter-plot {
      position: relative;
      background: var(--ngx-chart-bg, #ffffff);
      border-radius: 16px;
      padding: 16px;
      box-sizing: border-box;
      font-family: var(--ngx-font-family, system-ui, sans-serif);
      transition: background-color 0.3s;
    }
    .ngx-scatter-plot.dark {
      background: rgba(30, 32, 48, 0.45);
      border: 1px solid rgba(255, 255, 255, 0.05);
      --ngx-chart-bg: transparent;
      --ngx-chart-grid: rgba(255, 255, 255, 0.06);
      --ngx-chart-axis: rgba(255, 255, 255, 0.12);
    }
    .chart-legend {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 500;
      color: #64748b;
    }
    .dark .legend-item {
      color: #94a3b8;
    }
    .legend-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      display: inline-block;
    }
    .chart-svg-container {
      position: relative;
      width: 100%;
    }
    .chart-svg {
      display: block;
      overflow: visible;
    }
    .axis-label {
      font-size: 10px;
      fill: #64748b;
      font-weight: 500;
    }
    .dark .axis-label {
      fill: #94a3b8;
    }
    .axis-title {
      font-size: 11px;
      font-weight: 600;
      fill: #475569;
      letter-spacing: 0.5px;
    }
    .dark .axis-title {
      fill: #cbd5e1;
    }
    .scatter-point {
      cursor: pointer;
      transition: r 0.2s, opacity 0.2s, filter 0.2s;
    }
    .scatter-point.hovered {
      r: 8px;
      opacity: 0.95;
      filter: brightness(1.1);
    }
    .chart-tooltip {
      position: absolute;
      pointer-events: none;
      transform: translate(-50%, -100%) translateY(-10px);
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
      color: #f8fafc;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 11px;
      z-index: 100;
      min-width: 120px;
    }
    .tooltip-header {
      font-weight: 700;
      border-bottom: 1px solid rgba(255, 255, 255, 0.15);
      padding-bottom: 4px;
      margin-bottom: 6px;
      color: #38bdf8;
    }
    .tooltip-body {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .tooltip-group {
      color: #cbd5e1;
      margin-bottom: 3px;
    }
    .tooltip-val {
      color: #94a3b8;
    }
    .tooltip-val strong {
      color: #f8fafc;
      font-family: monospace;
    }
  \`]
})
export class ScatterPlotComponent {
  PAD_LEFT = 52;
  PAD_TOP = 16;
  PAD_RIGHT = 24;
  PAD_BOTTOM = 48;

  data = input<ScatterPoint[]>([]);
  xTitle = input<string>('X Axis');
  yTitle = input<string>('Y Axis');
  height = input<number>(300);
  showGrid = input<boolean>(true);
  showLegend = input<boolean>(true);
  theme = input<'light' | 'dark'>('light');
  colors = input<string[]>(CHART_COLORS);

  hoveredPointIndex = signal<number | null>(null);
  tooltip = signal<{
    x: number;
    y: number;
    label?: string;
    group?: string;
    xVal: number;
    yVal: number;
    color: string;
  } | null>(null);

  private container = viewChild<ElementRef>('container');

  // Dynamic dimension scales
  innerW = computed(() => {
    const el = this.container()?.nativeElement;
    const totalW = el ? el.getBoundingClientRect().width : 600;
    return Math.max(200, totalW - this.PAD_LEFT - this.PAD_RIGHT);
  });

  innerH = computed(() => this.height() - this.PAD_TOP - this.PAD_BOTTOM);

  // Group mappings
  uniqueGroups = computed(() => {
    const grps = new Set<string>();
    this.data().forEach(p => {
      if (p.group) grps.add(p.group);
    });
    return Array.from(grps);
  });

  groupColor(groupName?: string): string {
    if (!groupName) return this.colors()[0];
    const idx = this.uniqueGroups().indexOf(groupName);
    return this.colors()[idx % this.colors().length];
  }

  // Bounds Calculations
  private xValues = computed(() => this.data().map(pt => pt.x));
  private xMin = computed(() => this.xValues().length > 0 ? Math.min(...this.xValues()) * 0.9 : 0);
  private xMax = computed(() => this.xValues().length > 0 ? Math.max(...this.xValues()) * 1.1 : 100);
  xTicks = computed(() => niceTicks(this.xMin(), this.xMax(), 5));

  private yValues = computed(() => this.data().map(pt => pt.y));
  private yMin = computed(() => this.yValues().length > 0 ? Math.min(...this.yValues()) * 0.9 : 0);
  private yMax = computed(() => this.yValues().length > 0 ? Math.max(...this.yValues()) * 1.1 : 100);
  yTicks = computed(() => niceTicks(this.yMin(), this.yMax(), 5));

  // Map absolute coordinate points to SVG canvas
  xPos(x: number): number {
    return scale(x, this.xMin(), this.xMax(), 0, this.innerW());
  }

  yPos(y: number): number {
    return scale(y, this.yMin(), this.yMax(), this.innerH(), 0);
  }

  scaledPoints = computed(() => {
    return this.data().map((pt, i) => {
      const cx = this.xPos(pt.x);
      const cy = this.yPos(pt.y);
      const r = pt.size ? Math.max(3, Math.min(20, pt.size)) : 6;
      return {
        cx,
        cy,
        r,
        color: this.groupColor(pt.group),
        raw: pt
      };
    });
  });

  onPointHover(event: MouseEvent, pt: ScatterPoint, index: number) {
    this.hoveredPointIndex.set(index);
    const containerEl = this.container()?.nativeElement;
    if (!containerEl) return;
    const rect = containerEl.getBoundingClientRect();
    const tooltipX = event.clientX - rect.left;
    const tooltipY = event.clientY - rect.top;

    this.tooltip.set({
      x: tooltipX,
      y: tooltipY,
      label: pt.label,
      group: pt.group,
      xVal: pt.x,
      yVal: pt.y,
      color: this.groupColor(pt.group)
    });
  }

  onMouseLeave() {
    this.hoveredPointIndex.set(null);
    this.tooltip.set(null);
  }

  ptX(t: { xVal: number }): number { return t.xVal; }
  ptY(t: { yVal: number }): number { return t.yVal; }

  readonly fmtNum = fmtNum;
}
`,Lt=`import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, viewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {  niceTicks, scale, fmtNum  } from './chart-utils';

export interface WaterfallItem {
  label: string;
  value: number;
  isTotal?: boolean;
}

@Component({
  selector: 'ngx-waterfall-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <div class="ngx-waterfall-chart" (mouseleave)="hoveredIndex.set(null); tooltip.set(null)">
      <div class="chart-svg-container" #container>
        <svg
          [attr.width]="'100%'"
          [attr.height]="height()"
          class="chart-svg"
        >
          <g [attr.transform]="'translate(' + PAD_LEFT + ',' + PAD_TOP + ')'">
            <!-- Grid Lines (Horizontal) -->
            @if (showGrid()) {
              @for (tick of yTicks(); track tick) {
                <line
                  [attr.x1]="0"
                  [attr.x2]="innerW()"
                  [attr.y1]="yPos(tick)"
                  [attr.y2]="yPos(tick)"
                  stroke="var(--ngx-chart-grid, #ebedf0)"
                  stroke-dasharray="3,3"
                />
              }
            }

            <!-- Y-Axis Labels -->
            @for (tick of yTicks(); track tick) {
              <text
                x="-10"
                [attr.y]="yPos(tick) + 4"
                class="axis-label y"
                text-anchor="end"
              >{{ fmtNum(tick) }}</text>
            }

            <!-- X-Axis Labels -->
            @for (bar of computedBars(); track $index; let i = $index) {
              <text
                [attr.x]="bar.x + bar.width / 2"
                [attr.y]="innerH() + 20"
                class="axis-label x"
                text-anchor="middle"
              >{{ bar.label }}</text>
            }

            <!-- Connecting dashed lines between columns -->
            @for (bar of computedBars(); track $index; let i = $index) {
              @if (i < computedBars().length - 1) {
                <line
                  [attr.x1]="bar.x + bar.width"
                  [attr.x2]="computedBars()[i+1].x"
                  [attr.y1]="bar.connectY"
                  [attr.y2]="bar.connectY"
                  stroke="var(--ngx-chart-axis, #ced4da)"
                  stroke-dasharray="3,3"
                  stroke-width="1.5"
                />
              }
            }

            <!-- Bars -->
            @for (bar of computedBars(); track $index; let i = $index) {
              <rect
                [attr.x]="bar.x"
                [attr.y]="bar.y"
                [attr.width]="bar.width"
                [attr.height]="bar.rectH"
                [attr.fill]="bar.color"
                [attr.rx]="3"
                class="waterfall-bar"
                [class.hovered]="hoveredIndex() === i"
                (mouseenter)="onBarHover($event, bar, i)"
              />
              @if (showLabels() && bar.rectH > 14) {
                <text
                  [attr.x]="bar.x + bar.width / 2"
                  [attr.y]="bar.y + (bar.rectH / 2) + 4"
                  text-anchor="middle"
                  class="bar-value-label"
                >
                  {{ bar.value > 0 ? '+' : '' }}{{ fmtNum(bar.value) }}
                </text>
              }
            }

            <!-- Base axes borders -->
            <line x1="0" [attr.x2]="innerW()" [attr.y1]="innerH()" [attr.y2]="innerH()" stroke="var(--ngx-chart-axis, #ced4da)"/>
            <line x1="0" x2="0" y1="0" [attr.y2]="innerH()" stroke="var(--ngx-chart-axis, #ced4da)"/>
          </g>
        </svg>

        <!-- Tooltip -->
        @if (tooltip(); as t) {
          <div class="chart-tooltip" [style.left.px]="t.x" [style.top.px]="t.y">
            <div class="tooltip-header">{{ t.label }}</div>
            <div class="tooltip-body">
              <div class="tooltip-val">Change: <strong [style.color]="t.color">{{ t.value > 0 ? '+' : '' }}{{ fmtNum(t.value) }}</strong></div>
              <div class="tooltip-val">Running Balance: <strong>{{ fmtNum(t.balance) }}</strong></div>
            </div>
          </div>
        }
      </div>
    </div>
  \`,
  styles: [\`
    :host {
      display: block;
      width: 100%;
    }
    .ngx-waterfall-chart {
      position: relative;
      background: var(--ngx-chart-bg, #ffffff);
      border-radius: 16px;
      padding: 16px;
      box-sizing: border-box;
      font-family: var(--ngx-font-family, system-ui, sans-serif);
    }
    .chart-svg-container {
      position: relative;
      width: 100%;
    }
    .chart-svg {
      display: block;
      overflow: visible;
    }
    .axis-label {
      font-size: 10px;
      fill: #64748b;
      font-weight: 500;
    }
    .waterfall-bar {
      cursor: pointer;
      transition: opacity 0.2s, filter 0.2s;
    }
    .waterfall-bar.hovered {
      opacity: 0.9;
      filter: brightness(1.08) drop-shadow(0 4px 6px rgba(0,0,0,0.1));
    }
    .bar-value-label {
      font-size: 9px;
      fill: #ffffff;
      font-weight: 600;
      pointer-events: none;
    }
    .chart-tooltip {
      position: absolute;
      pointer-events: none;
      transform: translate(-50%, -100%) translateY(-10px);
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
      color: #f8fafc;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 11px;
      z-index: 100;
      min-width: 130px;
    }
    .tooltip-header {
      font-weight: 700;
      border-bottom: 1px solid rgba(255, 255, 255, 0.15);
      padding-bottom: 4px;
      margin-bottom: 6px;
      color: #38bdf8;
    }
    .tooltip-body {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .tooltip-val {
      color: #94a3b8;
    }
    .tooltip-val strong {
      color: #f8fafc;
      font-family: monospace;
    }
  \`]
})
export class WaterfallChartComponent {
  PAD_LEFT = 52;
  PAD_TOP = 20;
  PAD_RIGHT = 24;
  PAD_BOTTOM = 36;

  data = input<WaterfallItem[]>([]);
  height = input<number>(300);
  showGrid = input<boolean>(true);
  showLabels = input<boolean>(true);

  // Styling properties
  positiveColor = input<string>('#10b981'); // Emerald
  negativeColor = input<string>('#ef4444'); // Rose/Red
  totalColor = input<string>('#64748b');    // Slate

  hoveredIndex = signal<number | null>(null);
  tooltip = signal<{
    x: number;
    y: number;
    label: string;
    value: number;
    balance: number;
    color: string;
  } | null>(null);

  private container = viewChild<ElementRef>('container');

  innerW = computed(() => {
    const el = this.container()?.nativeElement;
    const totalW = el ? el.getBoundingClientRect().width : 600;
    return Math.max(200, totalW - this.PAD_LEFT - this.PAD_RIGHT);
  });

  innerH = computed(() => this.height() - this.PAD_TOP - this.PAD_BOTTOM);

  // Compute intermediate running balances and waterfall metrics
  processedData = computed(() => {
    const raw = this.data();
    let balance = 0;
    return raw.map(item => {
      const start = balance;
      if (item.isTotal) {
        // If it's explicitly designated as a Total, the column represents the current total
        // but wait: does it reset or just display the accumulated balance? It displays the balance!
        const val = balance;
        return {
          label: item.label,
          value: val,
          start: 0,
          end: val,
          isTotal: true,
          runningBalance: val
        };
      } else {
        balance += item.value;
        return {
          label: item.label,
          value: item.value,
          start: start,
          end: balance,
          isTotal: false,
          runningBalance: balance
        };
      }
    });
  });

  // Bounds
  yMin = computed(() => {
    const vals = [0, ...this.processedData().map(d => d.end), ...this.processedData().map(d => d.start)];
    return Math.min(...vals) < 0 ? Math.min(...vals) * 1.1 : 0;
  });

  yMax = computed(() => {
    const vals = [0, ...this.processedData().map(d => d.end), ...this.processedData().map(d => d.start)];
    return Math.max(...vals) * 1.1;
  });

  yTicks = computed(() => niceTicks(this.yMin(), this.yMax(), 5));

  // Scale functions
  xPos(index: number, count: number): number {
    const step = this.innerW() / count;
    return index * step + step * 0.15; // 15% margin
  }

  yPos(y: number): number {
    return scale(y, this.yMin(), this.yMax(), this.innerH(), 0);
  }

  barWidth(count: number): number {
    return (this.innerW() / count) * 0.7; // 70% width
  }

  computedBars = computed(() => {
    const items = this.processedData();
    const count = items.length;
    if (count === 0) return [];
    const width = this.barWidth(count);

    return items.map((item, idx) => {
      const x = this.xPos(idx, count);
      const yStart = this.yPos(item.start);
      const yEnd = this.yPos(item.end);

      const y = Math.min(yStart, yEnd);
      const rectH = Math.max(2, Math.abs(yStart - yEnd));

      let color = this.totalColor();
      if (!item.isTotal) {
        color = item.value >= 0 ? this.positiveColor() : this.negativeColor();
      }

      // Connect line is drawn from the end value of this item
      const connectY = yEnd;

      return {
        x,
        y,
        rectH,
        width,
        color,
        connectY,
        label: item.label,
        value: item.value,
        balance: item.runningBalance,
        isTotal: item.isTotal
      };
    });
  });

  onBarHover(event: MouseEvent, bar: any, index: number) {
    this.hoveredIndex.set(index);
    const containerEl = this.container()?.nativeElement;
    if (!containerEl) return;
    const rect = containerEl.getBoundingClientRect();
    const tooltipX = event.clientX - rect.left;
    const tooltipY = event.clientY - rect.top;

    this.tooltip.set({
      x: tooltipX,
      y: tooltipY,
      label: bar.label,
      value: bar.value,
      balance: bar.balance,
      color: bar.color
    });
  }

  readonly fmtNum = fmtNum;
}
`,Dt=`import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, viewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {  niceTicks, scale, fmtNum  } from './chart-utils';

export interface BoxPlotItem {
  label: string;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  outliers?: number[];
}

@Component({
  selector: 'ngx-box-plot-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <div class="ngx-box-plot-chart" (mouseleave)="hoveredIndex.set(null); tooltip.set(null)">
      <div class="chart-svg-container" #container>
        <svg
          [attr.width]="'100%'"
          [attr.height]="height()"
          class="chart-svg"
        >
          <g [attr.transform]="'translate(' + PAD_LEFT + ',' + PAD_TOP + ')'">
            <!-- Grid Lines (Horizontal) -->
            @if (showGrid()) {
              @for (tick of yTicks(); track tick) {
                <line
                  [attr.x1]="0"
                  [attr.x2]="innerW()"
                  [attr.y1]="yPos(tick)"
                  [attr.y2]="yPos(tick)"
                  stroke="var(--ngx-chart-grid, #ebedf0)"
                  stroke-dasharray="3,3"
                />
              }
            }

            <!-- Y-Axis Labels -->
            @for (tick of yTicks(); track tick) {
              <text
                x="-10"
                [attr.y]="yPos(tick) + 4"
                class="axis-label y"
                text-anchor="end"
              >{{ fmtNum(tick) }}</text>
            }

            <!-- X-Axis Labels -->
            @for (item of data(); track $index; let i = $index) {
              <text
                [attr.x]="xPos(i) + boxWidth() / 2"
                [attr.y]="innerH() + 20"
                class="axis-label x"
                text-anchor="middle"
              >{{ item.label }}</text>
            }

            <!-- Box Plot Elements -->
            @for (box of computedBoxes(); track $index; let i = $index) {
              <!-- Whiskers (Vertical Lines) -->
              <line
                [attr.x1]="box.centerX"
                [attr.x2]="box.centerX"
                [attr.y1]="box.yMin"
                [attr.y2]="box.yMax"
                [attr.stroke]="color()"
                stroke-width="1.5"
              />

              <!-- Whisker Caps (Horizontal Lines) -->
              <line
                [attr.x1]="box.centerX - capWidth() / 2"
                [attr.x2]="box.centerX + capWidth() / 2"
                [attr.y1]="box.yMin"
                [attr.y2]="box.yMin"
                [attr.stroke]="color()"
                stroke-width="1.5"
              />
              <line
                [attr.x1]="box.centerX - capWidth() / 2"
                [attr.x2]="box.centerX + capWidth() / 2"
                [attr.y1]="box.yMax"
                [attr.y2]="box.yMax"
                [attr.stroke]="color()"
                stroke-width="1.5"
              />

              <!-- Interquartile Box -->
              <rect
                [attr.x]="box.x"
                [attr.y]="box.yQ3"
                [attr.width]="box.width"
                [attr.height]="box.boxHeight"
                [attr.fill]="fillColor()"
                [attr.stroke]="color()"
                stroke-width="2"
                [attr.rx]="2"
                class="boxplot-rect"
                [class.hovered]="hoveredIndex() === i"
                (mouseenter)="onBoxHover($event, box.raw, i)"
              />

              <!-- Median line -->
              <line
                [attr.x1]="box.x"
                [attr.x2]="box.x + box.width"
                [attr.y1]="box.yMedian"
                [attr.y2]="box.yMedian"
                [attr.stroke]="color()"
                stroke-width="2.5"
              />

              <!-- Outliers (plotted as circles) -->
              @for (outlier of box.outlierPoints; track $index) {
                <circle
                  [attr.cx]="box.centerX"
                  [attr.cy]="outlier.y"
                  [attr.r]="3.5"
                  [attr.fill]="outlierColor()"
                  [attr.stroke]="'#ffffff'"
                  stroke-width="1"
                  class="outlier-dot"
                  (mouseenter)="onOutlierHover($event, box.raw.label, outlier.value)"
                />
              }
            }

            <!-- Base axes borders -->
            <line x1="0" [attr.x2]="innerW()" [attr.y1]="innerH()" [attr.y2]="innerH()" stroke="var(--ngx-chart-axis, #ced4da)"/>
            <line x1="0" x2="0" y1="0" [attr.y2]="innerH()" stroke="var(--ngx-chart-axis, #ced4da)"/>
          </g>
        </svg>

        <!-- Tooltip -->
        @if (tooltip(); as t) {
          <div class="chart-tooltip" [style.left.px]="t.x" [style.top.px]="t.y">
            <div class="tooltip-header">{{ t.label }}</div>
            <div class="tooltip-body">
              @if (t.isOutlier) {
                <div class="tooltip-val">Outlier Value: <strong>{{ fmtNum(t.outlierVal!) }}</strong></div>
              } @else {
                <div class="tooltip-val">Max: <strong>{{ fmtNum(t.max) }}</strong></div>
                <div class="tooltip-val">Q3: <strong>{{ fmtNum(t.q3) }}</strong></div>
                <div class="tooltip-val">Median: <strong style="color: #38bdf8;">{{ fmtNum(t.median) }}</strong></div>
                <div class="tooltip-val">Q1: <strong>{{ fmtNum(t.q1) }}</strong></div>
                <div class="tooltip-val">Min: <strong>{{ fmtNum(t.min) }}</strong></div>
              }
            </div>
          </div>
        }
      </div>
    </div>
  \`,
  styles: [\`
    :host {
      display: block;
      width: 100%;
    }
    .ngx-box-plot-chart {
      position: relative;
      background: var(--ngx-chart-bg, #ffffff);
      border-radius: 16px;
      padding: 16px;
      box-sizing: border-box;
      font-family: var(--ngx-font-family, system-ui, sans-serif);
    }
    .chart-svg-container {
      position: relative;
      width: 100%;
    }
    .chart-svg {
      display: block;
      overflow: visible;
    }
    .axis-label {
      font-size: 10px;
      fill: #64748b;
      font-weight: 500;
    }
    .boxplot-rect {
      cursor: pointer;
      transition: opacity 0.2s, fill 0.2s, filter 0.2s;
    }
    .boxplot-rect.hovered {
      fill: var(--ngx-chart-hover-bg, rgba(79, 70, 229, 0.25));
      filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
    }
    .outlier-dot {
      cursor: crosshair;
      transition: r 0.15s, fill 0.15s;
    }
    .outlier-dot:hover {
      r: 5.5px;
      fill: #ef4444;
    }
    .chart-tooltip {
      position: absolute;
      pointer-events: none;
      transform: translate(-50%, -100%) translateY(-10px);
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
      color: #f8fafc;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 11px;
      z-index: 100;
      min-width: 120px;
    }
    .tooltip-header {
      font-weight: 700;
      border-bottom: 1px solid rgba(255, 255, 255, 0.15);
      padding-bottom: 4px;
      margin-bottom: 6px;
      color: #38bdf8;
    }
    .tooltip-body {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .tooltip-val {
      color: #94a3b8;
    }
    .tooltip-val strong {
      color: #f8fafc;
      font-family: monospace;
    }
  \`]
})
export class BoxPlotChartComponent {
  PAD_LEFT = 52;
  PAD_TOP = 20;
  PAD_RIGHT = 24;
  PAD_BOTTOM = 36;

  data = input<BoxPlotItem[]>([]);
  height = input<number>(300);
  showGrid = input<boolean>(true);
  showLabels = input<boolean>(true);

  // Styles
  color = input<string>('#4f46e5'); // Primary Indigo
  fillColor = input<string>('rgba(79, 70, 229, 0.12)'); // Translucent primary
  outlierColor = input<string>('#ef4444'); // Red/Rose

  hoveredIndex = signal<number | null>(null);
  tooltip = signal<{
    x: number;
    y: number;
    label: string;
    min: number;
    q1: number;
    median: number;
    q3: number;
    max: number;
    isOutlier: boolean;
    outlierVal?: number;
  } | null>(null);

  private container = viewChild<ElementRef>('container');

  innerW = computed(() => {
    const el = this.container()?.nativeElement;
    const totalW = el ? el.getBoundingClientRect().width : 600;
    return Math.max(200, totalW - this.PAD_LEFT - this.PAD_RIGHT);
  });

  innerH = computed(() => this.height() - this.PAD_TOP - this.PAD_BOTTOM);

  // Range and Ticks bounds calculation
  yMin = computed(() => {
    const items = this.data();
    if (items.length === 0) return 0;
    const allVals = items.flatMap(item => [
      item.min,
      ...(item.outliers || [])
    ]);
    const minVal = Math.min(...allVals);
    return minVal < 0 ? minVal * 1.15 : minVal * 0.85;
  });

  yMax = computed(() => {
    const items = this.data();
    if (items.length === 0) return 100;
    const allVals = items.flatMap(item => [
      item.max,
      ...(item.outliers || [])
    ]);
    return Math.max(...allVals) * 1.15;
  });

  yTicks = computed(() => niceTicks(this.yMin(), this.yMax(), 5));

  // Box positions
  xPos(index: number): number {
    const count = this.data().length || 1;
    const step = this.innerW() / count;
    return index * step + step * 0.2;
  }

  yPos(y: number): number {
    return scale(y, this.yMin(), this.yMax(), this.innerH(), 0);
  }

  boxWidth(): number {
    const count = this.data().length || 1;
    return (this.innerW() / count) * 0.6;
  }

  capWidth(): number {
    return this.boxWidth() * 0.45;
  }

  computedBoxes = computed(() => {
    const items = this.data();
    const count = items.length;
    if (count === 0) return [];
    const width = this.boxWidth();

    return items.map((item, idx) => {
      const x = this.xPos(idx);
      const centerX = x + width / 2;

      const yMin = this.yPos(item.min);
      const yQ1 = this.yPos(item.q1);
      const yMedian = this.yPos(item.median);
      const yQ3 = this.yPos(item.q3);
      const yMax = this.yPos(item.max);

      const boxHeight = Math.abs(yQ1 - yQ3);

      const outlierPoints = (item.outliers || []).map(val => ({
        value: val,
        y: this.yPos(val)
      }));

      return {
        x,
        centerX,
        width,
        yMin,
        yQ1,
        yMedian,
        yQ3,
        yMax,
        boxHeight,
        outlierPoints,
        raw: item
      };
    });
  });

  onBoxHover(event: MouseEvent, item: BoxPlotItem, index: number) {
    this.hoveredIndex.set(index);
    const containerEl = this.container()?.nativeElement;
    if (!containerEl) return;
    const rect = containerEl.getBoundingClientRect();
    const tooltipX = event.clientX - rect.left;
    const tooltipY = event.clientY - rect.top;

    this.tooltip.set({
      x: tooltipX,
      y: tooltipY,
      label: item.label,
      min: item.min,
      q1: item.q1,
      median: item.median,
      q3: item.q3,
      max: item.max,
      isOutlier: false
    });
  }

  onOutlierHover(event: MouseEvent, label: string, outlierVal: number) {
    const containerEl = this.container()?.nativeElement;
    if (!containerEl) return;
    const rect = containerEl.getBoundingClientRect();
    const tooltipX = event.clientX - rect.left;
    const tooltipY = event.clientY - rect.top;

    this.tooltip.set({
      x: tooltipX,
      y: tooltipY,
      label: \`\${label} (Outlier)\`,
      min: 0,
      q1: 0,
      median: 0,
      q3: 0,
      max: 0,
      isOutlier: true,
      outlierVal
    });
  }

  readonly fmtNum = fmtNum;
}
`,Rt=`import {
  Component, ChangeDetectionStrategy, input, computed, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {  CHART_COLORS, fmtNum  } from './chart-utils';

export interface RadialBarItem {
  label: string;
  value: number;
  max: number;
  color?: string;
}

@Component({
  selector: 'ngx-radial-bar-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <div class="ngx-radial-bar-chart" (mouseleave)="hoveredIndex.set(null); tooltip.set(null)">
      <div class="chart-layout">
        <!-- SVG Concentric Circles -->
        <div class="radial-visual">
          <svg
            [attr.width]="height()"
            [attr.height]="height()"
            [attr.viewBox]="'0 0 ' + size() + ' ' + size()"
            class="radial-svg"
          >
            <!-- Rotate group by -90deg so rings start at 12 o'clock -->
            <g [attr.transform]="'translate(' + center() + ',' + center() + ') rotate(-90)'">
              @for (ring of computedRings(); track $index; let i = $index) {
                <!-- Background track ring -->
                <circle
                  cx="0"
                  cy="0"
                  [attr.r]="ring.r"
                  fill="none"
                  [attr.stroke]="ring.color"
                  stroke-opacity="0.12"
                  [attr.stroke-width]="strokeWidth()"
                />

                <!-- Active progress ring -->
                <circle
                  cx="0"
                  cy="0"
                  [attr.r]="ring.r"
                  fill="none"
                  [attr.stroke]="ring.color"
                  [attr.stroke-width]="strokeWidth()"
                  [attr.stroke-dasharray]="ring.dashArray"
                  [attr.stroke-dashoffset]="0"
                  stroke-linecap="round"
                  class="progress-ring"
                  [class.hovered]="hoveredIndex() === i"
                  (mouseenter)="onRingHover($event, ring.raw, i)"
                />
              }
            </g>
          </svg>

          <!-- Inside Center Details (Hover/Selected summary) -->
          <div class="center-content">
            @if (hoveredIndex() !== null) {
              @if (computedRings()[hoveredIndex()!]; as active) {
                <span class="center-label">{{ active.label }}</span>
                <span class="center-value" [style.color]="active.color">
                  {{ active.pct }}%
                </span>
                <span class="center-sublabel">
                  {{ fmtNum(active.value) }} / {{ fmtNum(active.max) }}
                </span>
              }
            } @else if (data().length > 0) {
              <span class="center-label">Average</span>
              <span class="center-value">{{ avgPct() }}%</span>
              <span class="center-sublabel">Completed</span>
            }
          </div>
        </div>

        <!-- Legend / List -->
        @if (showLegend() && data().length > 0) {
          <div class="radial-legend">
            @for (ring of computedRings(); track $index; let i = $index) {
              <div
                class="legend-item"
                [class.active]="hoveredIndex() === i"
                (mouseenter)="hoveredIndex.set(i)"
                (mouseleave)="hoveredIndex.set(null)"
              >
                <span class="legend-color-dot" [style.background]="ring.color"></span>
                <div class="legend-content">
                  <span class="legend-title">{{ ring.label }}</span>
                  <div class="legend-metrics">
                    <span class="metric-value">{{ ring.pct }}%</span>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  \`,
  styles: [\`
    :host {
      display: block;
    }
    .ngx-radial-bar-chart {
      background: var(--ngx-chart-bg, #ffffff);
      border-radius: 16px;
      padding: 16px;
      box-sizing: border-box;
      font-family: var(--ngx-font-family, system-ui, sans-serif);
    }
    .chart-layout {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 24px;
      flex-wrap: wrap;
    }
    .radial-visual {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .radial-svg {
      display: block;
    }
    .progress-ring {
      cursor: pointer;
      transition: stroke-width 0.2s, filter 0.2s, opacity 0.2s;
    }
    .progress-ring.hovered {
      stroke-width: 14px; /* thickens slightly on hover */
      filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.15));
    }
    .center-content {
      position: absolute;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      text-align: center;
    }
    .center-label {
      font-size: 11px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .center-value {
      font-size: 24px;
      font-weight: 800;
      color: #1e293b;
      line-height: 1.1;
      margin: 2px 0;
    }
    .center-sublabel {
      font-size: 10px;
      color: #94a3b8;
    }

    /* Legend */
    .radial-legend {
      display: flex;
      flex-direction: column;
      gap: 6px;
      min-width: 150px;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 12px;
      border-radius: 8px;
      border: 1px solid transparent;
      transition: all 0.2s;
      cursor: pointer;
    }
    .legend-item:hover, .legend-item.active {
      background: var(--ngx-chart-grid, #f8fafc);
      border-color: var(--ngx-chart-grid, #e2e8f0);
    }
    .legend-color-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .legend-content {
      flex: 1;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }
    .legend-title {
      font-size: 12px;
      font-weight: 600;
      color: #475569;
    }
    .metric-value {
      font-size: 12px;
      font-weight: 700;
      color: #1e293b;
    }
  \`]
})
export class RadialBarChartComponent {
  data = input<RadialBarItem[]>([]);
  height = input<number>(300);
  showLegend = input<boolean>(true);

  // Configuration properties
  strokeWidth = input<number>(10);
  ringGap = input<number>(4);
  colors = input<string[]>(CHART_COLORS);

  hoveredIndex = signal<number | null>(null);
  tooltip = signal<any | null>(null);

  size = computed(() => this.height());
  center = computed(() => this.size() / 2);

  // Ring properties
  computedRings = computed(() => {
    const raw = this.data();
    const count = raw.length;
    const centerPt = this.center();
    const ringW = this.strokeWidth();
    const gap = this.ringGap();

    // Start radii calculation from the outside inwards
    // Max radius leaves padding on outside
    const maxRadius = centerPt - ringW - 4;

    return raw.map((item, idx) => {
      // Offset outwards to inwards
      const r = maxRadius - idx * (ringW + gap);
      const pct = Math.min(100, Math.max(0, Math.round((item.value / item.max) * 100)));
      const color = item.color || this.colors()[idx % this.colors().length];

      // Circular arc math
      const C = 2 * Math.PI * r;
      // dasharray structure: "arcLength, circumference"
      const arcLength = (pct / 100) * C;
      const dashArray = \`\${arcLength}, \${C}\`;

      return {
        r,
        pct,
        color,
        dashArray,
        label: item.label,
        value: item.value,
        max: item.max,
        raw: item
      };
    });
  });

  // Calculate average percentage of completion
  avgPct = computed(() => {
    const raw = this.data();
    if (raw.length === 0) return 0;
    const sum = raw.reduce((acc, curr) => acc + (curr.value / curr.max), 0);
    return Math.round((sum / raw.length) * 100);
  });

  onRingHover(event: MouseEvent, item: RadialBarItem, index: number) {
    this.hoveredIndex.set(index);
  }

  readonly fmtNum = fmtNum;
}
`,At=`import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, viewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {  niceTicks, scale, fmtNum  } from './chart-utils';

export interface CandlestickItem {
  date: string | Date;
  open: number;
  high: number;
  low: number;
  close: number;
}

@Component({
  selector: 'ngx-candlestick-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <div class="ngx-candlestick-chart" (mouseleave)="hoveredIndex.set(null); tooltip.set(null)">
      <div class="chart-svg-container" #container>
        <svg
          [attr.width]="'100%'"
          [attr.height]="height()"
          class="chart-svg"
        >
          <g [attr.transform]="'translate(' + PAD_LEFT + ',' + PAD_TOP + ')'">
            <!-- Grid Lines (Horizontal) -->
            @if (showGrid()) {
              @for (tick of yTicks(); track tick) {
                <line
                  [attr.x1]="0"
                  [attr.x2]="innerW()"
                  [attr.y1]="yPos(tick)"
                  [attr.y2]="yPos(tick)"
                  stroke="var(--ngx-chart-grid, #ebedf0)"
                  stroke-dasharray="3,3"
                />
              }
            }

            <!-- Y-Axis Labels -->
            @for (tick of yTicks(); track tick) {
              <text
                x="-10"
                [attr.y]="yPos(tick) + 4"
                class="axis-label y"
                text-anchor="end"
              >{{ fmtNum(tick) }}</text>
            }

            <!-- X-Axis Labels -->
            @for (item of data(); track $index; let i = $index) {
              <text
                [attr.x]="xPos(i) + candleWidth() / 2"
                [attr.y]="innerH() + 20"
                class="axis-label x"
                text-anchor="middle"
              >{{ formatDate(item.date) }}</text>
            }

            <!-- Candles -->
            @for (candle of computedCandles(); track $index; let i = $index) {
              <!-- Whisker/Wick Line (High to Low) -->
              <line
                [attr.x1]="candle.centerX"
                [attr.x2]="candle.centerX"
                [attr.y1]="candle.yHigh"
                [attr.y2]="candle.yLow"
                [attr.stroke]="candle.color"
                stroke-width="1.5"
              />

              <!-- Candle Body Rect (Open to Close) -->
              <rect
                [attr.x]="candle.x"
                [attr.y]="candle.y"
                [attr.width]="candle.width"
                [attr.height]="candle.rectH"
                [attr.fill]="candle.color"
                [attr.stroke]="candle.color"
                stroke-width="1"
                class="candle-rect"
                [class.hovered]="hoveredIndex() === i"
                (mouseenter)="onCandleHover($event, candle.raw, i)"
              />
            }

            <!-- Base axes borders -->
            <line x1="0" [attr.x2]="innerW()" [attr.y1]="innerH()" [attr.y2]="innerH()" stroke="var(--ngx-chart-axis, #ced4da)"/>
            <line x1="0" x2="0" y1="0" [attr.y2]="innerH()" stroke="var(--ngx-chart-axis, #ced4da)"/>
          </g>
        </svg>

        <!-- Tooltip -->
        @if (tooltip(); as t) {
          <div class="chart-tooltip" [style.left.px]="t.x" [style.top.px]="t.y">
            <div class="tooltip-header">{{ formatDate(t.date) }}</div>
            <div class="tooltip-body">
              <div class="tooltip-direction" [style.color]="t.direction === 'Bullish' ? '#10b981' : '#ef4444'">
                <strong>{{ t.direction }}</strong> ({{ t.changePct }})
              </div>
              <div class="tooltip-val">High: <strong>{{ fmtNum(t.high) }}</strong></div>
              <div class="tooltip-val">Open: <strong>{{ fmtNum(t.open) }}</strong></div>
              <div class="tooltip-val">Close: <strong>{{ fmtNum(t.close) }}</strong></div>
              <div class="tooltip-val">Low: <strong>{{ fmtNum(t.low) }}</strong></div>
            </div>
          </div>
        }
      </div>
    </div>
  \`,
  styles: [\`
    :host {
      display: block;
      width: 100%;
    }
    .ngx-candlestick-chart {
      position: relative;
      background: var(--ngx-chart-bg, #ffffff);
      border-radius: 16px;
      padding: 16px;
      box-sizing: border-box;
      font-family: var(--ngx-font-family, system-ui, sans-serif);
    }
    .chart-svg-container {
      position: relative;
      width: 100%;
    }
    .chart-svg {
      display: block;
      overflow: visible;
    }
    .axis-label {
      font-size: 10px;
      fill: #64748b;
      font-weight: 500;
    }
    .candle-rect {
      cursor: pointer;
      transition: fill 0.15s, opacity 0.15s, filter 0.15s;
    }
    .candle-rect.hovered {
      opacity: 0.85;
      filter: brightness(1.1) drop-shadow(0 4px 6px rgba(0,0,0,0.12));
    }
    .chart-tooltip {
      position: absolute;
      pointer-events: none;
      transform: translate(-50%, -100%) translateY(-10px);
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
      color: #f8fafc;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 11px;
      z-index: 100;
      min-width: 130px;
    }
    .tooltip-header {
      font-weight: 700;
      border-bottom: 1px solid rgba(255, 255, 255, 0.15);
      padding-bottom: 4px;
      margin-bottom: 6px;
      color: #38bdf8;
    }
    .tooltip-direction {
      font-size: 10px;
      font-weight: 700;
      margin-bottom: 4px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .tooltip-body {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .tooltip-val {
      color: #94a3b8;
    }
    .tooltip-val strong {
      color: #f8fafc;
      font-family: monospace;
    }
  \`]
})
export class CandlestickChartComponent {
  PAD_LEFT = 52;
  PAD_TOP = 20;
  PAD_RIGHT = 24;
  PAD_BOTTOM = 36;

  data = input<CandlestickItem[]>([]);
  height = input<number>(300);
  showGrid = input<boolean>(true);
  showLabels = input<boolean>(true);

  // Bullish/Bearish colors
  bullishColor = input<string>('#10b981'); // Emerald/Green
  bearishColor = input<string>('#ef4444');  // Rose/Red

  hoveredIndex = signal<number | null>(null);
  tooltip = signal<{
    x: number;
    y: number;
    date: string | Date;
    open: number;
    high: number;
    low: number;
    close: number;
    direction: 'Bullish' | 'Bearish';
    changePct: string;
  } | null>(null);

  private container = viewChild<ElementRef>('container');

  innerW = computed(() => {
    const el = this.container()?.nativeElement;
    const totalW = el ? el.getBoundingClientRect().width : 600;
    return Math.max(200, totalW - this.PAD_LEFT - this.PAD_RIGHT);
  });

  innerH = computed(() => this.height() - this.PAD_TOP - this.PAD_BOTTOM);

  // Range bounds calculation
  yMin = computed(() => {
    const items = this.data();
    if (items.length === 0) return 0;
    const lows = items.map(d => d.low);
    return Math.min(...lows) * 0.98; // 2% padding below
  });

  yMax = computed(() => {
    const items = this.data();
    if (items.length === 0) return 100;
    const highs = items.map(d => d.high);
    return Math.max(...highs) * 1.02; // 2% padding above
  });

  yTicks = computed(() => niceTicks(this.yMin(), this.yMax(), 5));

  // Category scaling positions
  xPos(index: number): number {
    const count = this.data().length || 1;
    const step = this.innerW() / count;
    return index * step + step * 0.15;
  }

  yPos(y: number): number {
    return scale(y, this.yMin(), this.yMax(), this.innerH(), 0);
  }

  candleWidth(): number {
    const count = this.data().length || 1;
    return (this.innerW() / count) * 0.7; // 70% width
  }

  computedCandles = computed(() => {
    const items = this.data();
    const count = items.length;
    if (count === 0) return [];
    const width = this.candleWidth();

    return items.map((item, idx) => {
      const x = this.xPos(idx);
      const centerX = x + width / 2;

      const yOpen = this.yPos(item.open);
      const yClose = this.yPos(item.close);
      const yHigh = this.yPos(item.high);
      const yLow = this.yPos(item.low);

      const y = Math.min(yOpen, yClose);
      const rectH = Math.max(2, Math.abs(yOpen - yClose));

      const isBullish = item.close >= item.open;
      const color = isBullish ? this.bullishColor() : this.bearishColor();

      return {
        x,
        centerX,
        width,
        yHigh,
        yLow,
        y,
        rectH,
        color,
        raw: item
      };
    });
  });

  onCandleHover(event: MouseEvent, item: CandlestickItem, index: number) {
    this.hoveredIndex.set(index);
    const containerEl = this.container()?.nativeElement;
    if (!containerEl) return;
    const rect = containerEl.getBoundingClientRect();
    const tooltipX = event.clientX - rect.left;
    const tooltipY = event.clientY - rect.top;

    const isBullish = item.close >= item.open;
    const change = item.close - item.open;
    const changePct = ((change / item.open) * 100).toFixed(2) + '%';

    this.tooltip.set({
      x: tooltipX,
      y: tooltipY,
      date: item.date,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
      direction: isBullish ? 'Bullish' : 'Bearish',
      changePct
    });
  }

  formatDate(d: string | Date): string {
    if (d instanceof Date) {
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }
    return d;
  }

  readonly fmtNum = fmtNum;
}
`,Ot=`import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, viewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CHART_COLORS, niceTicks, scale, fmtNum } from './chart-utils';

export interface BubblePoint {
  x: number;
  y: number;
  z: number;
  label?: string;
  group?: string;
}

@Component({
  selector: 'ngx-bubble-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <div class="ngx-bubble-chart" [class.dark]="theme() === 'dark'" (mouseleave)="onMouseLeave()">
      <div class="chart-header">
        @if (showLegend() && uniqueGroups().length > 0) {
          <div class="chart-legend">
            @for (group of uniqueGroups(); track group) {
              <span class="legend-item">
                <span class="legend-dot" [style.background]="groupColor(group)"></span>
                {{ group }}
              </span>
            }
          </div>
        }
      </div>

      <div class="chart-svg-container" #container>
        <svg
          [attr.width]="'100%'"
          [attr.height]="height()"
          class="chart-svg"
        >
          <g [attr.transform]="'translate(' + PAD_LEFT + ',' + PAD_TOP + ')'">
            @if (showGrid()) {
              @for (tick of yTicks(); track tick) {
                <line
                  [attr.x1]="0"
                  [attr.x2]="innerW()"
                  [attr.y1]="yPos(tick)"
                  [attr.y2]="yPos(tick)"
                  stroke="var(--ngx-chart-grid, #ebedf0)"
                  stroke-dasharray="3,3"
                />
              }
              @for (tick of xTicks(); track tick) {
                <line
                  [attr.x1]="xPos(tick)"
                  [attr.x2]="xPos(tick)"
                  [attr.y1]="0"
                  [attr.y2]="innerH()"
                  stroke="var(--ngx-chart-grid, #ebedf0)"
                  stroke-dasharray="3,3"
                />
              }
            }

            @for (tick of yTicks(); track tick) {
              <text x="-10" [attr.y]="yPos(tick) + 4" class="axis-label y" text-anchor="end">{{ fmtNum(tick) }}</text>
            }
            <text [attr.transform]="'rotate(-90) translate(' + (-innerH()/2) + ', -38)'" class="axis-title y" text-anchor="middle">{{ yTitle() }}</text>

            @for (tick of xTicks(); track tick) {
              <text [attr.x]="xPos(tick)" [attr.y]="innerH() + 20" class="axis-label x" text-anchor="middle">{{ fmtNum(tick) }}</text>
            }
            <text [attr.x]="innerW() / 2" [attr.y]="innerH() + 38" class="axis-title x" text-anchor="middle">{{ xTitle() }}</text>

            @if (hoveredPointIndex() !== null) {
              @if (scaledPoints()[hoveredPointIndex()!]; as pt) {
                <line [attr.x1]="0" [attr.x2]="innerW()" [attr.y1]="pt.cy" [attr.y2]="pt.cy" stroke="rgba(79,70,229,0.35)" stroke-width="1.2" stroke-dasharray="3,3"/>
                <line [attr.x1]="pt.cx" [attr.x2]="pt.cx" [attr.y1]="0" [attr.y2]="innerH()" stroke="rgba(79,70,229,0.35)" stroke-width="1.2" stroke-dasharray="3,3"/>
              }
            }

            @for (pt of scaledPoints(); track $index; let i = $index) {
              <circle
                [attr.cx]="pt.cx"
                [attr.cy]="pt.cy"
                [attr.r]="hoveredPointIndex() === i ? pt.r * 1.15 + 2 : pt.r"
                [attr.fill]="pt.color"
                [attr.stroke]="'#ffffff'"
                stroke-width="1.2"
                fill-opacity="0.65"
                class="bubble-point"
                (mouseenter)="onPointHover($event, pt.raw, i)"
                (mousemove)="onPointHover($event, pt.raw, i)"
              />
              @if (showLabels() && pt.r > 12) {
                <text [attr.x]="pt.cx" [attr.y]="pt.cy + 3" class="bubble-inner-label" text-anchor="middle" fill="#ffffff" pointer-events="none">
                  {{ pt.raw.label || fmtNum(pt.raw.z) }}
                </text>
              }
            }

            <line x1="0" [attr.x2]="innerW()" [attr.y1]="innerH()" [attr.y2]="innerH()" stroke="var(--ngx-chart-axis, #ced4da)"/>
            <line x1="0" x2="0" y1="0" [attr.y2]="innerH()" stroke="var(--ngx-chart-axis, #ced4da)"/>
          </g>
        </svg>

        @if (tooltip(); as t) {
          <div class="chart-tooltip" [style.left.px]="t.x" [style.top.px]="t.y">
            <div class="tt-cat">{{ t.label || 'Bubble Data' }}</div>
            <div class="tt-row">
              <span class="tt-dot" [style.background]="t.color"></span>
              <span class="tt-name">Group</span>
              <span class="tt-val">{{ t.group || 'Default' }}</span>
            </div>
            <div class="tt-row">
              <span class="tt-name">{{ xTitle() }}</span>
              <span class="tt-val">{{ fmtNum(t.xVal) }}</span>
            </div>
            <div class="tt-row">
              <span class="tt-name">{{ yTitle() }}</span>
              <span class="tt-val">{{ fmtNum(t.yVal) }}</span>
            </div>
            <div class="tt-row bubble-highlight-row">
              <span class="tt-name">{{ zTitle() }} (Size)</span>
              <span class="tt-val">{{ fmtNum(t.zVal) }}</span>
            </div>
          </div>
        }
      </div>
    </div>
  \`,
  styles: [\`
    :host { display: block; width: 100%; }
    .ngx-bubble-chart {
      position: relative;
      background: var(--ngx-chart-bg, #ffffff);
      border-radius: 16px;
      padding: 16px;
      box-sizing: border-box;
      font-family: var(--ngx-font-family, system-ui, sans-serif);
    }
    .ngx-bubble-chart.dark {
      background: rgba(30, 32, 48, 0.45);
      border: 1px solid rgba(255, 255, 255, 0.05);
      --ngx-chart-bg: transparent;
      --ngx-chart-grid: rgba(255, 255, 255, 0.06);
      --ngx-chart-axis: rgba(255, 255, 255, 0.12);
    }
    .chart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .chart-legend { display: flex; gap: 16px; flex-wrap: wrap; }
    .legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; color: #64748b; }
    .dark .legend-item { color: #94a3b8; }
    .legend-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
    .chart-svg-container { position: relative; width: 100%; }
    .chart-svg { display: block; overflow: visible; }
    .axis-label { font-size: 10px; fill: #64748b; font-weight: 500; }
    .dark .axis-label { fill: #94a3b8; }
    .axis-title { font-size: 11px; font-weight: 600; fill: #475569; letter-spacing: 0.5px; }
    .dark .axis-title { fill: #cbd5e1; }
    .bubble-point { cursor: pointer; transition: r 0.25s cubic-bezier(0.16, 1, 0.3, 1), fill-opacity 0.2s; }
    .bubble-inner-label { font-size: 8px; font-weight: 700; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6); user-select: none; }
    .chart-tooltip {
      position: absolute; pointer-events: none; transform: translate(-50%, -100%) translateY(-10px);
      background: var(--ngx-chart-tooltip-bg, rgba(15, 23, 42, 0.92)); backdrop-filter: blur(12px);
      color: var(--ngx-chart-tooltip-color, #f8fafc); padding: 10px 14px; border-radius: 10px; font-size: 11px;
      z-index: 100; min-width: 160px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3); border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .tt-cat { font-weight: 700; margin-bottom: 6px; font-size: 12.5px; border-bottom: 1px solid rgba(255, 255, 255, 0.15); padding-bottom: 4px; color: #38bdf8; }
    .tt-row { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
    .bubble-highlight-row { margin-top: 6px; border-top: 1px dashed rgba(255, 255, 255, 0.1); padding-top: 4px; color: #fbbf24; }
    .tt-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  \`]
})
export class BubbleChartComponent {
  PAD_LEFT = 52;
  PAD_TOP = 16;
  PAD_RIGHT = 24;
  PAD_BOTTOM = 48;

  data = input<BubblePoint[]>([]);
  xTitle = input<string>('X Axis');
  yTitle = input<string>('Y Axis');
  zTitle = input<string>('Size');
  height = input<number>(300);
  showGrid = input<boolean>(true);
  showLegend = input<boolean>(true);
  showLabels = input<boolean>(true);
  theme = input<'light' | 'dark'>('light');
  colors = input<string[]>(CHART_COLORS);

  hoveredPointIndex = signal<number | null>(null);
  tooltip = signal<any | null>(null);

  private container = viewChild<ElementRef>('container');

  innerW = computed(() => {
    const el = this.container()?.nativeElement;
    const totalW = el ? el.getBoundingClientRect().width : 600;
    return Math.max(200, totalW - this.PAD_LEFT - this.PAD_RIGHT);
  });
  innerH = computed(() => this.height() - this.PAD_TOP - this.PAD_BOTTOM);

  uniqueGroups = computed(() => {
    const grps = new Set<string>();
    this.data().forEach(p => { if (p.group) grps.add(p.group); });
    return Array.from(grps);
  });

  groupColor(groupName?: string): string {
    if (!groupName) return this.colors()[0];
    const idx = this.uniqueGroups().indexOf(groupName);
    return this.colors()[idx % this.colors().length];
  }

  private xValues = computed(() => this.data().map(pt => pt.x));
  private xMin = computed(() => this.xValues().length > 0 ? Math.min(...this.xValues()) * 0.9 : 0);
  private xMax = computed(() => this.xValues().length > 0 ? Math.max(...this.xValues()) * 1.1 : 100);
  xTicks = computed(() => niceTicks(this.xMin(), this.xMax(), 5));

  private yValues = computed(() => this.data().map(pt => pt.y));
  private yMin = computed(() => this.yValues().length > 0 ? Math.min(...this.yValues()) * 0.9 : 0);
  private yMax = computed(() => this.yValues().length > 0 ? Math.max(...this.yValues()) * 1.1 : 100);
  yTicks = computed(() => niceTicks(this.yMin(), this.yMax(), 5));

  private zValues = computed(() => this.data().map(pt => pt.z));
  private zMin = computed(() => this.zValues().length > 0 ? Math.min(...this.zValues()) : 0);
  private zMax = computed(() => this.zValues().length > 0 ? Math.max(...this.zValues()) : 1);

  xPos(x: number): number { return scale(x, this.xMin(), this.xMax(), 0, this.innerW()); }
  yPos(y: number): number { return scale(y, this.yMin(), this.yMax(), this.innerH(), 0); }

  scaledPoints = computed(() => {
    return this.data().map((pt, i) => {
      const cx = this.xPos(pt.x);
      const cy = this.yPos(pt.y);
      const r = scale(pt.z, this.zMin(), this.zMax(), 5, 35);
      return { cx, cy, r, color: this.groupColor(pt.group), raw: pt };
    });
  });

  onPointHover(event: MouseEvent, pt: BubblePoint, index: number) {
    this.hoveredPointIndex.set(index);
    const containerEl = this.container()?.nativeElement;
    if (!containerEl) return;
    const rect = containerEl.getBoundingClientRect();
    this.tooltip.set({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      label: pt.label,
      group: pt.group,
      xVal: pt.x,
      yVal: pt.y,
      zVal: pt.z,
      color: this.groupColor(pt.group)
    });
  }

  onMouseLeave() {
    this.hoveredPointIndex.set(null);
    this.tooltip.set(null);
  }
}
`,$t=`import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, viewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CHART_COLORS, fmtNum } from './chart-utils';

export interface SunburstNode {
  label: string;
  value?: number;
  color?: string;
  children?: SunburstNode[];
}

interface SunburstSlice {
  id: string;
  label: string;
  value: number;
  depth: number;
  startAngle: number;
  endAngle: number;
  path: string;
  color: string;
  parentPath: string;
  pct: number;
}

@Component({
  selector: 'ngx-sunburst-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <div class="ngx-sunburst-chart" [class.dark]="theme() === 'dark'">
      <div class="chart-body">
        <svg
          class="chart-svg"
          [attr.viewBox]="'0 0 ' + height() + ' ' + height()"
          [attr.width]="height()"
          [attr.height]="height()"
        >
          <g [attr.transform]="'translate(' + cx() + ',' + cy() + ')'">
            @for (slice of slices(); track slice.id) {
              <path
                [attr.d]="slice.path"
                [attr.fill]="slice.color"
                [attr.stroke]="theme() === 'dark' ? '#1e2030' : '#ffffff'"
                stroke-width="1.5"
                class="sunburst-slice"
                [class.hovered]="hoveredSliceId() === slice.id"
                (mouseenter)="onSliceHover($event, slice)"
                (mouseleave)="onSliceLeave()"
              />
              @if (showLabels() && (slice.endAngle - slice.startAngle) > 0.15 && slice.depth < 2) {
                <text
                  [attr.transform]="labelTransform(slice)"
                  text-anchor="middle"
                  dominant-baseline="middle"
                  class="slice-label"
                >
                  {{ slice.label }}
                </text>
              }
            }
          </g>
        </svg>

        @if (showLegend() && topLevelNodes().length > 0) {
          <div class="chart-legend">
            @for (node of topLevelNodes(); track node.label; let i = $index) {
              <div class="legend-item">
                <span class="legend-dot" [style.background]="node.color || colors()[i % colors().length]"></span>
                <span class="legend-label">{{ node.label }}</span>
                <span class="legend-val">{{ fmtNum(getNodeValue(node)) }}</span>
              </div>
            }
          </div>
        }
      </div>

      @if (tooltip(); as t) {
        <div class="chart-tooltip" [style.left.px]="t.x" [style.top.px]="t.y">
          <div class="tt-path">{{ t.parentPath || t.label }}</div>
          <div class="tt-row">
            <span class="tt-dot" [style.background]="t.color"></span>
            <span class="tt-name">Value</span>
            <span class="tt-val">{{ fmtNum(t.value) }}</span>
          </div>
          <div class="tt-row">
            <span class="tt-name">Contribution</span>
            <span class="tt-val">{{ t.pct }}%</span>
          </div>
        </div>
      }
    </div>
  \`,
  styles: [\`
    :host { display: block; position: relative; }
    .ngx-sunburst-chart {
      position: relative; background: var(--ngx-chart-bg, #ffffff); border-radius: 16px; padding: 16px; box-sizing: border-box;
      font-family: var(--ngx-font-family, system-ui, sans-serif);
    }
    .ngx-sunburst-chart.dark {
      background: rgba(30, 32, 48, 0.45); border: 1px solid rgba(255, 255, 255, 0.05); --ngx-chart-bg: transparent;
    }
    .chart-body { display: flex; align-items: center; justify-content: center; gap: 32px; flex-wrap: wrap; }
    .chart-svg { display: block; max-width: 100%; height: auto; }
    .sunburst-slice { cursor: pointer; transition: fill-opacity 0.2s; }
    .sunburst-slice:hover { fill-opacity: 0.9; }
    .slice-label { font-size: 9px; fill: #ffffff; font-weight: 700; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6); pointer-events: none; }
    .chart-legend { display: flex; flex-direction: column; gap: 8px; min-width: 160px; }
    .legend-item { display: flex; align-items: center; gap: 8px; }
    .legend-dot { width: 10px; height: 10px; border-radius: 3px; }
    .legend-label { flex: 1; color: #64748b; }
    .dark .legend-label { color: #94a3b8; }
    .legend-val { font-weight: 700; color: #334155; }
    .dark .legend-val { color: #cbd5e1; }
    .chart-tooltip {
      position: absolute; pointer-events: none; transform: translate(-50%, -100%) translateY(-10px);
      background: var(--ngx-chart-tooltip-bg, rgba(15, 23, 42, 0.92)); backdrop-filter: blur(12px);
      color: var(--ngx-chart-tooltip-color, #f8fafc); padding: 10px 14px; border-radius: 10px; font-size: 11px;
      z-index: 100; min-width: 160px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3); border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .tt-path { font-weight: 700; margin-bottom: 6px; font-size: 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.15); padding-bottom: 4px; color: #38bdf8; }
    .tt-row { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
    .tt-dot { width: 8px; height: 8px; border-radius: 50%; }
  \`]
})
export class SunburstChartComponent {
  data = input<SunburstNode[]>([]);
  height = input<number>(300);
  showLegend = input<boolean>(true);
  showLabels = input<boolean>(true);
  theme = input<'light' | 'dark'>('light');
  colors = input<string[]>(CHART_COLORS);

  hoveredSliceId = signal<string | null>(null);
  tooltip = signal<any | null>(null);

  cx = computed(() => this.height() / 2);
  cy = computed(() => this.height() / 2);
  radius = computed(() => this.height() / 2 - 10);

  topLevelNodes = computed(() => this.data());

  maxDepth = computed(() => {
    const getDepth = (node: SunburstNode): number => {
      if (!node.children || node.children.length === 0) return 0;
      return 1 + Math.max(...node.children.map(getDepth));
    };
    const rootNodes = this.data();
    if (!rootNodes || rootNodes.length === 0) return 0;
    return Math.max(...rootNodes.map(getDepth));
  });

  getNodeValue(node: SunburstNode): number {
    if (node.value !== undefined) return node.value;
    if (node.children && node.children.length > 0) {
      return node.children.reduce((sum, c) => sum + this.getNodeValue(c), 0);
    }
    return 0;
  }

  private adjustColorBrightness(hex: string, percent: number): string {
    if (!hex.startsWith('#')) return hex;
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, Math.min(255, (num >> 16) + amt));
    const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amt));
    const B = Math.max(0, Math.min(255, (num & 0x0000ff) + amt));
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
  }

  private ringPath(startAngle: number, endAngle: number, outerR: number, innerR: number): string {
    const ox1 = Math.cos(startAngle) * outerR;
    const oy1 = Math.sin(startAngle) * outerR;
    const ox2 = Math.cos(endAngle) * outerR;
    const oy2 = Math.sin(endAngle) * outerR;
    const ix1 = Math.cos(startAngle) * innerR;
    const iy1 = Math.sin(startAngle) * innerR;
    const ix2 = Math.cos(endAngle) * innerR;
    const iy2 = Math.sin(endAngle) * innerR;
    const large = endAngle - startAngle > Math.PI ? 1 : 0;
    return \`M \${ix1} \${iy1} L \${ox1} \${oy1} A \${outerR} \${outerR} 0 \${large} 1 \${ox2} \${oy2} L \${ix2} \${iy2} A \${innerR} \${innerR} 0 \${large} 0 \${ix1} \${iy1} Z\`;
  }

  slices = computed(() => {
    const rootNodes = this.data();
    if (!rootNodes || rootNodes.length === 0) return [];
    const totalVal = rootNodes.reduce((sum, n) => sum + this.getNodeValue(n), 0) || 1;
    const list: SunburstSlice[] = [];
    const colorsList = this.colors();

    const processNode = (node: SunburstNode, depth: number, startAngle: number, endAngle: number, parentPath: string, color: string) => {
      const val = this.getNodeValue(node);
      const frac = val / totalVal;
      const angle = endAngle - startAngle;
      const maxRadius = this.radius();
      const numDepths = this.maxDepth() + 1;
      const depthWidth = maxRadius / numDepths;
      const innerR = depth * depthWidth;
      const outerR = (depth + 1) * depthWidth;
      const path = this.ringPath(startAngle, endAngle, outerR, innerR);
      const pathName = parentPath ? \`\${parentPath} \u203A \${node.label}\` : node.label;
      const pct = Math.round(frac * 100);

      list.push({ id: \`\${depth}-\${node.label}-\${startAngle.toFixed(4)}\`, label: node.label, value: val, depth, startAngle, endAngle, path, color, parentPath: pathName, pct });

      if (node.children && node.children.length > 0) {
        const childrenSum = node.children.reduce((sum, c) => sum + this.getNodeValue(c), 0) || 1;
        let currStart = startAngle;
        node.children.forEach(child => {
          const childVal = this.getNodeValue(child);
          const childAngle = (childVal / childrenSum) * angle;
          const childEnd = currStart + childAngle;
          const childColor = child.color || this.adjustColorBrightness(color, -10);
          processNode(child, depth + 1, currStart, childEnd, pathName, childColor);
          currStart = childEnd;
        });
      }
    };

    let currentStart = -Math.PI / 2;
    rootNodes.forEach((node, idx) => {
      const val = this.getNodeValue(node);
      const angle = (val / totalVal) * Math.PI * 2;
      const end = currentStart + angle;
      const color = node.color || colorsList[idx % colorsList.length];
      processNode(node, 0, currentStart, end, '', color);
      currentStart = end;
    });
    return list;
  });

  labelTransform(slice: SunburstSlice): string {
    const depthWidth = this.radius() / (this.maxDepth() + 1);
    const r = (slice.depth + 0.5) * depthWidth;
    const midAngle = slice.startAngle + (slice.endAngle - slice.startAngle) / 2;
    const x = Math.cos(midAngle) * r;
    const y = Math.sin(midAngle) * r;
    let rotation = (midAngle * 180) / Math.PI;
    if (rotation > 90 && rotation < 270) { rotation -= 180; }
    else if (rotation < -90) { rotation += 180; }
    return \`translate(\${x}, \${y}) rotate(\${rotation})\`;
  }

  onSliceHover(event: MouseEvent, slice: SunburstSlice): void {
    this.hoveredSliceId.set(slice.id);
    const el = (event.currentTarget as SVGElement).ownerSVGElement!.parentElement!;
    const rect = el.getBoundingClientRect();
    this.tooltip.set({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      label: slice.label,
      parentPath: slice.parentPath,
      value: slice.value,
      pct: slice.pct,
      color: slice.color
    });
  }

  onSliceLeave(): void {
    this.hoveredSliceId.set(null);
    this.tooltip.set(null);
  }
}
`,It=`import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, viewChild, HostListener, inject, DestroyRef, output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CHART_COLORS, ChartDataPoint, fmtNum } from './chart-utils';

@Component({
  selector: 'ngx-polar-area-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <div class="ngx-polar-area-chart">
      <div class="chart-header">
        <div class="chart-title-space"></div>
        @if (showExport()) {
          <div class="chart-export-menu">
            <button class="export-trigger" (click)="toggleExportMenu($event)" aria-label="Export Menu">\u{1F4E4} Export</button>
            @if (exportMenuOpen()) {
              <div class="export-dropdown">
                <button (click)="onExport('json')">\u{1F4CA} Export JSON</button>
                <button (click)="onExport('csv')">\u{1F4C4} Export CSV</button>
                <button (click)="onExport('svg')">\u{1F5BC}\uFE0F Export SVG</button>
              </div>
            }
          </div>
        }
      </div>

      <div class="chart-body">
        <svg
          #svgEl
          class="chart-svg"
          [attr.viewBox]="'0 0 ' + height() + ' ' + height()"
          [attr.width]="height()"
          [attr.height]="height()"
        >
          <g [attr.transform]="'translate(' + cx() + ',' + cy() + ')'">
            @for (level of gridLevels(); track level) {
              <circle
                cx="0"
                cy="0"
                [attr.r]="level.radius"
                fill="none"
                stroke="var(--ngx-chart-grid, #ebedf0)"
                stroke-width="1"
                stroke-dasharray="3,3"
              />
              @if (showLabels()) {
                <text
                  x="4"
                  [attr.y]="-level.radius + 12"
                  class="grid-label"
                >{{ fmtNum(level.value) }}</text>
              }
            }

            @for (slice of slices(); track slice.index) {
              <path
                [attr.d]="slice.path"
                [attr.fill]="slice.color"
                [attr.stroke]="'#fff'"
                stroke-width="1.5"
                fill-opacity="0.8"
                class="polar-slice"
                [class.hovered]="hovered() === slice.index"
                [style.transform]="hovered() === slice.index ? 'scale(1.04)' : 'scale(1)'"
                (mouseenter)="hovered.set(slice.index); onSliceHover($event, slice)"
                (mouseleave)="hovered.set(-1); tooltip.set(null)"
                (click)="onSliceClick(slice)"
              />
              
              @if (showLabels() && slice.value > 0) {
                <text
                  [attr.x]="labelX(slice)"
                  [attr.y]="labelY(slice)"
                  text-anchor="middle"
                  dominant-baseline="middle"
                  class="slice-label"
                >{{ fmtNum(slice.value) }}</text>
              }
            }
          </g>
        </svg>

        @if (showLegend()) {
          <div class="chart-legend">
            @for (slice of slices(); track slice.index) {
              <div class="legend-item" (mouseenter)="hovered.set(slice.index)" (mouseleave)="hovered.set(-1)">
                <span class="legend-dot" [style.background]="slice.color"></span>
                <span class="legend-label">{{ slice.label }}</span>
                <span class="legend-val">{{ fmtNum(slice.value) }}</span>
              </div>
            }
          </div>
        }
      </div>

      @if (tooltip(); as t) {
        <div class="chart-tooltip" [style.left.px]="t.x" [style.top.px]="t.y">
          <span class="tt-dot" [style.background]="t.color"></span>
          <strong>{{ t.label }}</strong>: {{ fmtNum(t.value) }}
        </div>
      }
    </div>
  \`,
  styles: [\`
    :host {
      display: block;
      position: relative;
    }
    .ngx-polar-area-chart {
      position: relative;
      background: var(--ngx-chart-bg, #fff);
      font-family: inherit;
      overflow: hidden;
    }
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      min-height: 24px;
      position: relative;
    }
    .chart-body {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 24px;
      flex-wrap: wrap;
    }
    .chart-svg {
      display: block;
      max-width: 100%;
      height: auto;
      min-width: 0;
      animation: polarGrow 0.75s cubic-bezier(0.16, 1, 0.3, 1) both;
      transform-origin: center;
    }

    @keyframes polarGrow {
      from { transform: scale(0.6) rotate(-45deg); opacity: 0; }
      to { transform: scale(1) rotate(0); opacity: 1; }
    }

    .polar-slice {
      cursor: pointer;
      transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), fill-opacity 0.15s;
      transform-origin: 0px 0px;
    }
    .polar-slice:hover {
      fill-opacity: 0.95;
    }
    .slice-label {
      font-size: 10px;
      fill: #fff;
      font-weight: 700;
      pointer-events: none;
      user-select: none;
      text-shadow: 0 1px 2px rgba(0,0,0,0.5);
    }
    .grid-label {
      font-size: 9px;
      fill: var(--ngx-chart-axis-text, #94a3b8);
      pointer-events: none;
      user-select: none;
    }
    .chart-legend {
      display: flex;
      flex-direction: column;
      gap: 6px;
      flex-shrink: 0;
      min-width: 140px;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      cursor: pointer;
      padding: 5px 10px;
      border-radius: 8px;
      transition: all 0.15s;
    }
    .legend-item:hover {
      background: var(--ngx-chart-grid, #f1f3f5);
    }
    .legend-dot {
      width: 10px;
      height: 10px;
      border-radius: 3px;
      flex-shrink: 0;
    }
    .legend-label {
      flex: 1;
      color: var(--ngx-chart-axis-text, #6c757d);
      font-weight: 550;
    }
    .legend-val {
      font-weight: 700;
      color: var(--ngx-chart-text, #212529);
    }

    .chart-tooltip {
      position: absolute;
      pointer-events: none;
      transform: translate(-50%, -100%) translateY(-8px);
      background: var(--ngx-chart-tooltip-bg, rgba(15, 23, 42, 0.92));
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      color: var(--ngx-chart-tooltip-color, #f8fafc);
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 12px;
      min-width: 120px;
      box-shadow: 0 10px 20px -5px rgba(0,0,0,0.25);
      border: 1px solid rgba(255, 255, 255, 0.1);
      z-index: 100;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: left 0.1s ease-out, top 0.1s ease-out;
      font-family: inherit;
    }
    .tt-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .chart-export-menu {
      position: absolute;
      top: 0;
      right: 0;
      z-index: 50;
    }
    .export-trigger {
      padding: 4px 10px;
      font-size: 11px;
      font-weight: 600;
      color: var(--ngx-chart-axis-text, #6c757d);
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(8px);
      border: 1px solid var(--ngx-chart-grid, #ebedf0);
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.15s;
    }
    .export-trigger:hover {
      background: #fff;
      color: var(--primary-color, #4f46e5);
      border-color: var(--primary-color, #4f46e5);
    }
    .export-dropdown {
      position: absolute;
      right: 0;
      top: calc(100% + 4px);
      background: #fff;
      border: 1px solid var(--ngx-chart-grid, #ebedf0);
      border-radius: 8px;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.08);
      padding: 4px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 120px;
    }
    .export-dropdown button {
      background: none;
      border: none;
      padding: 6px 10px;
      font-size: 11px;
      text-align: left;
      cursor: pointer;
      color: #343a40;
      border-radius: 4px;
      font-family: inherit;
      width: 100%;
      transition: all 0.12s;
    }
    .export-dropdown button:hover {
      background: rgba(79, 70, 229, 0.06);
      color: var(--primary-color, #4f46e5);
    }
  \`]
})
export class PolarAreaChartComponent {
  data = input<ChartDataPoint[]>([]);
  height = input<number>(280);
  showLegend = input<boolean>(true);
  showLabels = input<boolean>(true);
  colors = input<string[]>(CHART_COLORS);
  showExport = input<boolean>(false);

  sliceClick = output<ChartDataPoint>();

  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');

  exportMenuOpen = signal(false);
  hovered = signal(-1);
  tooltip = signal<{x:number;y:number;label:string;value:number;color:string}|null>(null);

  svgSize = computed(() => this.height());
  cx = computed(() => this.svgSize() / 2);
  cy = computed(() => this.svgSize() / 2);
  maxRadius = computed(() => this.svgSize() / 2 - 25);

  private maxValue = computed(() => {
    const vals = this.data().map(d => d.value);
    return Math.max(1, ...vals);
  });

  gridLevels = computed(() => {
    const maxVal = this.maxValue();
    const maxR = this.maxRadius();
    return [
      { value: maxVal * 0.25, radius: maxR * 0.25 },
      { value: maxVal * 0.5, radius: maxR * 0.5 },
      { value: maxVal * 0.75, radius: maxR * 0.75 },
      { value: maxVal, radius: maxR }
    ];
  });

  slices = computed(() => {
    const d = this.data();
    if (!d.length) return [];
    const maxVal = this.maxValue();
    const maxR = this.maxRadius();
    const angleStep = (2 * Math.PI) / d.length;

    let currentAngle = -Math.PI / 2;

    return d.map((item, i) => {
      const start = currentAngle;
      const end = currentAngle + angleStep;
      const mid = start + angleStep / 2;

      const r = maxVal > 0 ? (item.value / maxVal) * maxR : 0;

      const x1 = Math.cos(start) * r;
      const y1 = Math.sin(start) * r;
      const x2 = Math.cos(end) * r;
      const y2 = Math.sin(end) * r;
      const largeArc = angleStep > Math.PI ? 1 : 0;
      const path = \`M 0 0 L \${x1} \${y1} A \${r} \${r} 0 \${largeArc} 1 \${x2} \${y2} Z\`;

      currentAngle = end;

      return {
        index: i,
        label: item.label,
        value: item.value,
        color: item.color || this.colors()[i % this.colors().length],
        path,
        midAngle: mid,
        radius: r
      };
    });
  });

  labelX(s: {midAngle:number; radius:number}): number {
    return Math.cos(s.midAngle) * s.radius * 0.7;
  }

  labelY(s: {midAngle:number; radius:number}): number {
    return Math.sin(s.midAngle) * s.radius * 0.7;
  }

  onSliceHover(event: MouseEvent, slice: {label:string;value:number;color:string}): void {
    const el = (event.currentTarget as HTMLElement).closest('.ngx-polar-area-chart') as HTMLElement;
    const rect = el.getBoundingClientRect();
    this.tooltip.set({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      label: slice.label,
      value: slice.value,
      color: slice.color
    });
  }

  onSliceClick(slice: {label:string;value:number;color?:string}) {
    this.sliceClick.emit({ label: slice.label, value: slice.value, color: slice.color });
  }

  toggleExportMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.exportMenuOpen.set(!this.exportMenuOpen());
  }

  closeExportMenu(): void {
    this.exportMenuOpen.set(false);
  }

  onExport(type: 'json' | 'csv' | 'svg'): void {
    this.exportMenuOpen.set(false);
    if (type === 'json') this.exportToJson();
    else if (type === 'csv') this.exportToCsv();
    else if (type === 'svg') this.exportToSvg();
  }

  exportToCsv(): void {
    const data = this.data();
    if (!data.length) return;
    let csv = 'Label,Value\\n';
    data.forEach(d => {
      csv += \`"\${d.label}",\${d.value}\\n\`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'polar-area-chart-data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToJson(): void {
    const data = this.data();
    if (!data.length) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'polar-area-chart-data.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToSvg(): void {
    const svg = this.svgEl()?.nativeElement;
    if (!svg) return;
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svg);
    if (!source.match(/^<svg[^>]+xmlns="http\\:\\/\\/www\\.w3\\.org\\/2000\\/svg"/)) {
      source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    source = '<?xml version="1.0" encoding="utf-8"?>\\n' + source;
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'polar-area-chart.svg');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
`,Vt=`import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ngx-bullet-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <div class="ngx-bullet-chart">
      <svg
        #svgEl
        class="bullet-svg"
        [attr.width]="'100%'"
        [attr.height]="svgHeight()"
      >
        <g [attr.transform]="'translate(' + margin().left + ',' + margin().top + ')'">
          @for (r of rangeRects(); track $index) {
            <rect
              [attr.x]="r.x"
              [attr.y]="0"
              [attr.width]="r.width"
              [attr.height]="barHeight()"
              [attr.fill]="r.color"
              class="bullet-range"
            />
          }

          <rect
            [attr.x]="0"
            [attr.y]="valBarY()"
            [attr.width]="valBarWidth()"
            [attr.height]="valBarHeight()"
            [attr.fill]="valueColor()"
            class="bullet-value-bar"
          />

          <line
            [attr.x1]="targetX()"
            [attr.x2]="targetX()"
            [attr.y1]="targetY1()"
            [attr.y2]="targetY2()"
            [attr.stroke]="targetColor()"
            stroke-width="3"
            class="bullet-target-marker"
          />

          @if (showLabels()) {
            <g class="bullet-labels" [attr.transform]="'translate(0,' + (barHeight() + 14) + ')'">
              <text x="0" text-anchor="middle" class="tick-label">0</text>
              @for (val of ranges(); track val) {
                <text
                  [attr.x]="xPos(val)"
                  text-anchor="middle"
                  class="tick-label"
                >{{ val }}</text>
              }
              <text [attr.x]="innerW()" text-anchor="middle" class="tick-label">{{ max() }}</text>
            </g>
          }
        </g>
      </svg>
    </div>
  \`,
  styles: [\`
    :host {
      display: block;
    }
    .ngx-bullet-chart {
      width: 100%;
      background: var(--ngx-chart-bg, #fff);
      font-family: inherit;
    }
    .bullet-svg {
      display: block;
      overflow: visible;
    }
    .bullet-range {
      transition: width 0.3s ease, x 0.3s ease;
    }
    .bullet-value-bar {
      transition: width 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .bullet-target-marker {
      transition: x1 0.5s cubic-bezier(0.16, 1, 0.3, 1), x2 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .tick-label {
      font-size: 10px;
      fill: var(--ngx-chart-axis-text, #64748b);
      font-weight: 550;
      user-select: none;
    }
  \`]
})
export class BulletChartComponent {
  value = input<number>(0);
  target = input<number>(0);
  max = input<number>(100);
  ranges = input<number[]>([50, 85, 100]);
  rangeColors = input<string[]>(['#f1f5f9', '#e2e8f0', '#cbd5e1']);
  valueColor = input<string>('#4f46e5');
  targetColor = input<string>('#ef4444');
  height = input<number>(50);
  showLabels = input<boolean>(true);

  containerWidth = signal<number>(500);

  margin = computed(() => ({
    top: 5,
    right: 15,
    bottom: this.showLabels() ? 20 : 5,
    left: 15
  }));

  svgHeight = computed(() => this.height() + this.margin().top + this.margin().bottom);
  innerW = computed(() => Math.max(10, this.containerWidth() - this.margin().left - this.margin().right));
  barHeight = computed(() => this.height());

  valBarHeight = computed(() => this.barHeight() * 0.35);
  valBarY = computed(() => (this.barHeight() - this.valBarHeight()) / 2);

  targetY1 = computed(() => this.barHeight() * 0.15);
  targetY2 = computed(() => this.barHeight() * 0.85);

  constructor() {
    const hostEl = inject(ElementRef).nativeElement;
    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(entries => {
        if (!entries || entries.length === 0) return;
        const width = entries[0].contentRect.width;
        if (width > 0) {
          this.containerWidth.set(width);
        }
      });
      resizeObserver.observe(hostEl);
      inject(DestroyRef).onDestroy(() => resizeObserver.disconnect());
    }
  }

  xPos(v: number): number {
    const maxVal = this.max() || 1;
    const clamped = Math.max(0, Math.min(maxVal, v));
    return (clamped / maxVal) * this.innerW();
  }

  valBarWidth = computed(() => this.xPos(this.value()));
  targetX = computed(() => this.xPos(this.target()));

  rangeRects = computed(() => {
    const limits = this.ranges();
    const colors = this.rangeColors();
    const rects: Array<{ x: number; width: number; color: string }> = [];

    let prev = 0;
    limits.forEach((limit, idx) => {
      const x = this.xPos(prev);
      const width = Math.max(0, this.xPos(limit) - x);
      const color = colors[idx % colors.length];
      rects.push({ x, width, color });
      prev = limit;
    });

    return rects;
  });
}
`,Bt=`import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DumbbellItem {
  label: string;
  startValue: number;
  endValue: number;
  startColor?: string;
  endColor?: string;
}

@Component({
  selector: 'ngx-dumbbell-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \\\`
    <div class="ngx-dumbbell-chart" (mouseleave)="onMouseLeave()">
      @if (showLegend() && data().length > 0) {
        <div class="chart-legend">
          <div class="legend-item">
            <span class="legend-dot" [style.background]="startColor()"></span>
            <span class="legend-label">{{ startLabel() }}</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot" [style.background]="endColor()"></span>
            <span class="legend-label">{{ endLabel() }}</span>
          </div>
        </div>
      }
      <svg #svgEl class="dumbbell-svg" width="100%" [attr.height]="height()">
        <g [attr.transform]="'translate(' + margin().left + ',' + margin().top + ')'">
          @if (showGrid()) {
            @for (tick of xTicks(); track tick) {
              <line [attr.x1]="xPos(tick)" [attr.x2]="xPos(tick)" y1="0" [attr.y2]="innerH()" class="grid-line" />
            }
          }
          @for (item of computedItems(); track item.label; let i = $index) {
            <g class="dumbbell-row" [class.dimmed]="hoveredIndex() !== null && hoveredIndex() !== i" [class.highlighted]="hoveredIndex() === i" (mouseenter)="onRowHover(i, $event)" (mousemove)="onRowMouseMove($event)">
              <rect [attr.x]="-margin().left" [attr.y]="item.y - rowHeight() / 2" [attr.width]="containerWidth()" [attr.height]="rowHeight()" fill="transparent" style="cursor: pointer;" />
              @if (showLabels()) {
                <text [attr.x]="-10" [attr.y]="item.y" text-anchor="end" dominant-baseline="middle" class="y-axis-label">{{ item.label }}</text>
              }
              <line [attr.x1]="xPos(item.startValue)" [attr.x2]="xPos(item.endValue)" [attr.y1]="item.y" [attr.y2]="item.y" [attr.stroke]="item.barColor" stroke-width="4" stroke-linecap="round" class="connecting-bar" />
              <circle [attr.cx]="xPos(item.startValue)" [attr.cy]="item.y" [attr.r]="hoveredIndex() === i ? 8 : 6" [attr.fill]="item.sColor" class="endpoint-dot" />
              <circle [attr.cx]="xPos(item.endValue)" [attr.cy]="item.y" [attr.r]="hoveredIndex() === i ? 8 : 6" [attr.fill]="item.eColor" class="endpoint-dot" />
            </g>
          }
          <g [attr.transform]="'translate(0,' + innerH() + ')'" class="x-axis">
            <line x1="0" [attr.x2]="innerW()" y1="0" y2="0" class="axis-line" />
            @for (tick of xTicks(); track tick) {
              <g [attr.transform]="'translate(' + xPos(tick) + ',0)'">
                <line x1="0" x2="0" y1="0" y2="4" class="tick-line" />
                <text y="16" text-anchor="middle" class="tick-label">{{ formatNumber(tick) }}</text>
              </g>
            }
          </g>
        </g>
      </svg>
    </div>
  \\\`
})
export class DumbbellChartComponent {
  data = input<DumbbellItem[]>([]);
  height = input<number>(350);
  showGrid = input<boolean>(true);
  showLabels = input<boolean>(true);
  startColor = input<string>('#ef4444');
  endColor = input<string>('#10b981');
  startLabel = input<string>('Start');
  endLabel = input<string>('End');
  colors = input<string[]>([]);
  showLegend = input<boolean>(true);

  containerWidth = signal<number>(500);
  hoveredIndex = signal<number | null>(null);
  tooltip = signal<any | null>(null);
  tooltipX = signal<number>(0);
  tooltipY = signal<number>(0);

  margin = computed(() => ({ top: 20, right: 30, bottom: 30, left: this.showLabels() ? 100 : 20 }));
  innerW = computed(() => Math.max(10, this.containerWidth() - this.margin().left - this.margin().right));
  innerH = computed(() => Math.max(10, this.height() - this.margin().top - this.margin().bottom));

  constructor() {}
  minVal = computed(() => 0);
  maxVal = computed(() => 100);
  xTicks = computed(() => [0, 25, 50, 75, 100]);
  xPos(val: number): number { return 0; }
  rowHeight = computed(() => 30);
  computedItems = computed(() => []);
  onRowHover(idx: number, event: MouseEvent) {}
  onRowMouseMove(event: MouseEvent) {}
  onMouseLeave() {}
  formatNumber(v: number): string { return v.toString(); }
}
`,Ht=`import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ngx-lollipop-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \\\`
    <div class="ngx-lollipop-chart" (mouseleave)="onMouseLeave()">
      <svg #svgEl class="lollipop-svg" width="100%" [attr.height]="height()">
        <g [attr.transform]="'translate(' + margin().left + ',' + margin().top + ')'">
          @for (item of computedItems(); track item.label; let i = $index) {
            <g class="lollipop-row" (mouseenter)="onItemHover(i, $event)" (mousemove)="onItemMouseMove($event)">
              <line [attr.x1]="0" [attr.x2]="xPos(item.value)" [attr.y1]="item.coord" [attr.y2]="item.coord" [attr.stroke]="item.color" stroke-width="2" class="lollipop-stem" />
              <circle [attr.cx]="xPos(item.value)" [attr.cy]="item.coord" [attr.r]="dotRadius()" [attr.fill]="item.color" class="lollipop-candy" />
            </g>
          }
        </g>
      </svg>
    </div>
  \\\`
})
export class LollipopChartComponent {
  data = input<any[]>([]);
  height = input<number>(350);
  showGrid = input<boolean>(true);
  showLabels = input<boolean>(true);
  orientation = input<'horizontal' | 'vertical'>('horizontal');
  colors = input<string[]>([]);
  dotRadius = input<number>(8);

  containerWidth = signal<number>(500);
  hoveredIndex = signal<number | null>(null);
  tooltip = signal<any | null>(null);
  tooltipX = signal<number>(0);
  tooltipY = signal<number>(0);

  margin = computed(() => ({ top: 20, right: 30, bottom: 40, left: 80 }));
  innerW = computed(() => 400);
  innerH = computed(() => 300);

  xPos(val: number): number { return 0; }
  computedItems = computed(() => []);
  onItemHover(idx: number, event: MouseEvent) {}
  onItemMouseMove(event: MouseEvent) {}
  onMouseLeave() {}
  formatNumber(v: number): string { return v.toString(); }
}
`,Nt=`import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SlopeDataPoint {
  label: string;
  startValue: number;
  endValue: number;
  color?: string;
}

@Component({
  selector: 'ngx-slope-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \\\`
    <div class="ngx-slope-chart" (mouseleave)="onMouseLeave()">
      <svg #svgEl class="slope-svg" width="100%" [attr.height]="height()">
        <g [attr.transform]="'translate(' + margin().left + ',' + margin().top + ')'">
          <line [attr.x1]="leftAxisX()" [attr.x2]="leftAxisX()" y1="0" [attr.y2]="innerH()" class="axis-line" />
          <line [attr.x1]="rightAxisX()" [attr.x2]="rightAxisX()" y1="0" [attr.y2]="innerH()" class="axis-line" />
          @for (item of computedItems(); track item.label; let i = $index) {
            <g class="slope-group" (mouseenter)="onSlopeHover(i, $event)" (mousemove)="onSlopeMouseMove($event)">
              <line [attr.x1]="leftAxisX()" [attr.x2]="rightAxisX()" [attr.y1]="item.leftY" [attr.y2]="item.rightY" [attr.stroke]="item.lineColor" stroke-width="2.5" class="slope-line" />
            </g>
          }
        </g>
      </svg>
    </div>
  \\\`
})
export class SlopeChartComponent {
  data = input<SlopeDataPoint[]>([]);
  startLabel = input<string>('Before');
  endLabel = input<string>('After');
  height = input<number>(350);
  showLabels = input<boolean>(true);
  showValues = input<boolean>(true);
  colors = input<string[]>([]);

  containerWidth = signal<number>(500);
  hoveredIndex = signal<number | null>(null);
  tooltip = signal<any | null>(null);
  tooltipX = signal<number>(0);
  tooltipY = signal<number>(0);

  margin = computed(() => ({ top: 40, right: 120, bottom: 20, left: 120 }));
  innerW = computed(() => 300);
  innerH = computed(() => 300);

  leftAxisX = computed(() => 0);
  rightAxisX = computed(() => 300);

  computedItems = computed(() => []);
  onSlopeHover(idx: number, event: MouseEvent) {}
  onSlopeMouseMove(event: MouseEvent) {}
  onMouseLeave() {}
  formatNumber(v: number): string { return v.toString(); }
}
`,zt=`import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SankeyNode {
  id: string;
  label: string;
  color?: string;
}

export interface SankeyLink {
  source: string;
  target: string;
  value: number;
}

@Component({
  selector: 'ngx-sankey-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \\\`
    <div class="ngx-sankey-chart" (mouseleave)="onMouseLeave()">
      <svg #svgEl class="sankey-svg" width="100%" [attr.height]="height()">
        <g [attr.transform]="'translate(' + margin().left + ',' + margin().top + ')'">
          @for (link of computedData().links; track link.sourceId + '-' + link.targetId) {
            <path [attr.d]="link.path" [attr.stroke]="link.color" [attr.stroke-width]="link.thickness" fill="none" class="sankey-link" />
          }
          @for (node of computedData().nodes; track node.id) {
            <rect [attr.x]="node.x" [attr.y]="node.y" [attr.width]="node.width" [attr.height]="node.height" [attr.fill]="node.color" class="sankey-node" />
          }
        </g>
      </svg>
    </div>
  \\\`
})
export class SankeyChartComponent {
  nodes = input<SankeyNode[]>([]);
  links = input<SankeyLink[]>([]);
  height = input<number>(400);
  showLabels = input<boolean>(true);
  showValues = input<boolean>(true);
  colors = input<string[]>([]);
  nodePadding = input<number>(16);
  nodeWidth = input<number>(20);

  containerWidth = signal<number>(500);
  hoveredNodeId = signal<string | null>(null);
  hoveredLinkId = signal<number | null>(null);
  tooltip = signal<any | null>(null);
  tooltipX = signal<number>(0);
  tooltipY = signal<number>(0);

  margin = computed(() => ({ top: 20, right: 80, bottom: 20, left: 80 }));
  innerW = computed(() => 400);
  innerH = computed(() => 300);

  computedData = computed(() => ({ nodes: [], links: [] }));
  onNodeHover(nodeId: string) {}
  onLinkHover(idx: number, event: MouseEvent) {}
  onLinkMouseMove(event: MouseEvent) {}
  onMouseLeave() {}
  formatNumber(v: number): string { return v.toString(); }
}
`,Gt=`import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ngx-violin-plot',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <div class="ngx-violin-plot" (mouseleave)="onMouseLeave()">
      <svg #svgEl class="violin-svg" width="100%" [attr.height]="height()">
        <g [attr.transform]="'translate(' + margin().left + ',' + margin().top + ')'">
          @for (item of computedItems(); track item.label; let i = $index) {
            <g class="violin-group" (mouseenter)="onItemHover(i, $event)" (mousemove)="onItemMouseMove($event)">
              <path [attr.d]="item.path" [attr.fill]="item.color" fill-opacity="0.3" [attr.stroke]="item.color" stroke-width="1.5" />
            </g>
          }
        </g>
      </svg>
    </div>
  \`
})
export class ViolinPlotComponent {
  data = input<any[]>([]);
  height = input<number>(350);
  showGrid = input<boolean>(true);
  showLabels = input<boolean>(true);
  colors = input<string[]>([]);

  margin = computed(() => ({ top: 20, right: 20, bottom: 30, left: 45 }));
  computedItems = computed(() => []);
  onItemHover(idx: number, event: MouseEvent) {}
  onItemMouseMove(event: MouseEvent) {}
  onMouseLeave() {}
  formatNumber(v: number): string { return v.toString(); }
}
`,Wt=`import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ngx-ridgeline-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <div class="ngx-ridgeline-chart" (mouseleave)="onMouseLeave()">
      <svg #svgEl class="ridgeline-svg" width="100%" [attr.height]="height()">
        <g [attr.transform]="'translate(' + margin().left + ',' + margin().top + ')'">
          @for (item of computedItems(); track item.label; let i = $index) {
            <g class="ridgeline-row" (mouseenter)="onRowHover(i, $event)" (mousemove)="onRowMouseMove($event)">
              <path [attr.d]="item.areaPath" [attr.fill]="item.color" fill-opacity="0.4" />
              <path [attr.d]="item.linePath" [attr.stroke]="item.color" stroke-width="2" fill="none" />
            </g>
          }
        </g>
      </svg>
    </div>
  \`
})
export class RidgelineChartComponent {
  data = input<any[]>([]);
  height = input<number>(400);
  showGrid = input<boolean>(true);
  showLabels = input<boolean>(true);
  colors = input<string[]>([]);
  overlap = input<number>(1.6);

  margin = computed(() => ({ top: 40, right: 20, bottom: 30, left: 90 }));
  computedItems = computed(() => []);
  onRowHover(idx: number, event: MouseEvent) {}
  onRowMouseMove(event: MouseEvent) {}
  onMouseLeave() {}
  formatNumber(v: number): string { return v.toString(); }
}
`,Ft=`import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ngx-pareto-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <div class="ngx-pareto-chart" (mouseleave)="onMouseLeave()">
      <svg #svgEl class="pareto-svg" width="100%" [attr.height]="height()">
        <g [attr.transform]="'translate(' + margin().left + ',' + margin().top + ')'">
          @for (item of computedItems(); track item.label; let i = $index) {
            <rect [attr.x]="item.barX" [attr.y]="0" width="20" height="100" [attr.fill]="barColor()" (mouseenter)="onItemHover(i, $event)" />
          }
        </g>
      </svg>
    </div>
  \`
})
export class ParetoChartComponent {
  data = input<any[]>([]);
  height = input<number>(350);
  showGrid = input<boolean>(true);
  showLabels = input<boolean>(true);
  barColor = input<string>('#4a90d9');
  lineColor = input<string>('#ff6358');

  margin = computed(() => ({ top: 30, right: 50, bottom: 30, left: 50 }));
  computedItems = computed(() => []);
  onItemHover(idx: number, event: MouseEvent) {}
  onItemMouseMove(event: MouseEvent) {}
  onMouseLeave() {}
  formatNumber(v: number): string { return v.toString(); }
}
`,jt=`import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ngx-marimekko-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <div class="ngx-marimekko-chart" (mouseleave)="onMouseLeave()">
      <svg #svgEl class="marimekko-svg" width="100%" [attr.height]="height()">
        <g [attr.transform]="'translate(' + margin().left + ',' + margin().top + ')'">
          @for (col of computedCols(); track col.label; let i = $index) {
            @for (seg of col.segments; track seg.name; let j = $index) {
              <rect [attr.x]="col.x" [attr.y]="seg.y" [attr.width]="col.width" [attr.height]="seg.height" [attr.fill]="seg.color" (mouseenter)="onSegmentHover(i, j, $event)" />
            }
          }
        </g>
      </svg>
    </div>
  \`
})
export class MarimekkoChartComponent {
  data = input<any[]>([]);
  height = input<number>(400);
  showGrid = input<boolean>(true);
  showLabels = input<boolean>(true);
  colors = input<string[]>([]);

  margin = computed(() => ({ top: 20, right: 20, bottom: 30, left: 45 }));
  computedCols = computed(() => []);
  onSegmentHover(colIndex: number, segIndex: number, event: MouseEvent) {}
  onSegmentMouseMove(event: MouseEvent) {}
  onMouseLeave() {}
  formatNumber(v: number): string { return v.toString(); }
}
`,Yt=`import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ngx-chord-diagram',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <div class="ngx-chord-diagram" (mouseleave)="onMouseLeave()">
      <svg #svgEl class="chord-svg" width="100%" [attr.height]="height()">
        <g [attr.transform]="'translate(' + (containerWidth() / 2) + ',' + (height() / 2) + ')'">
          @for (rib of computedRibbons(); track rib.path; let i = $index) {
            <path [attr.d]="rib.path" [attr.fill]="rib.color" fill-opacity="0.35" [class.highlighted]="hoveredRibbonIndex() === i" (mouseenter)="onRibbonHover(i, $event)" />
          }
        </g>
      </svg>
    </div>
  \`
})
export class ChordDiagramComponent {
  matrix = input<number[][]>([]);
  labels = input<string[]>([]);
  height = input<number>(400);
  showLabels = input<boolean>(true);
  colors = input<string[]>([]);

  containerWidth = signal<number>(500);
  hoveredNodeIndex = signal<number | null>(null);
  hoveredRibbonIndex = signal<number | null>(null);
  computedNodes = computed(() => []);
  computedRibbons = computed(() => []);
  onNodeHover(idx: number) {}
  onRibbonHover(idx: number, event: MouseEvent) {}
  onMouseMove(event: MouseEvent) {}
  onMouseLeave() {}
  formatNumber(v: number): string { return v.toString(); }
}
`,Xt=`import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ngx-dependency-wheel',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <div class="ngx-dependency-wheel" (mouseleave)="onMouseLeave()">
      <svg #svgEl class="wheel-svg" width="100%" [attr.height]="height()">
        <g [attr.transform]="'translate(' + (containerWidth() / 2) + ',' + (height() / 2) + ')'">
          @for (dep of computedDependencies(); track dep.path; let i = $index) {
            <path [attr.d]="dep.path" [attr.fill]="dep.color" fill-opacity="0.3" (mouseenter)="onDependencyHover(i, $event)" />
          }
        </g>
      </svg>
    </div>
  \`
})
export class DependencyWheelComponent {
  matrix = input<number[][]>([]);
  labels = input<string[]>([]);
  height = input<number>(400);
  showLabels = input<boolean>(true);
  colors = input<string[]>([]);

  containerWidth = signal<number>(500);
  hoveredNodeIndex = signal<number | null>(null);
  hoveredDependencyIndex = signal<number | null>(null);
  computedNodes = computed(() => []);
  computedDependencies = computed(() => []);
  onNodeHover(idx: number) {}
  onDependencyHover(idx: number, event: MouseEvent) {}
  onMouseMove(event: MouseEvent) {}
  onMouseLeave() {}
  formatNumber(v: number): string { return v.toString(); }
}
`,Jt=`import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ngx-adjacency-matrix',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <div class="ngx-adjacency-matrix" (mouseleave)="onMouseLeave()">
      <svg #svgEl class="matrix-svg" width="100%" [attr.height]="height()">
        <g [attr.transform]="'translate(' + margin().left + ',' + margin().top + ')'">
          @for (cell of computedCells(); track cell.rowIdx + '-' + cell.colIdx) {
            <rect [attr.x]="cell.x" [attr.y]="cell.y" [attr.width]="cell.size" [attr.height]="cell.size" [attr.fill]="cell.color" [attr.fill-opacity]="cell.opacity" (mouseenter)="onCellHover(cell.rowIdx, cell.colIdx, $event)" />
          }
        </g>
      </svg>
    </div>
  \`
})
export class AdjacencyMatrixComponent {
  matrix = input<number[][]>([]);
  labels = input<string[]>([]);
  height = input<number>(400);
  showLabels = input<boolean>(true);
  color = input<string>('');

  margin = computed(() => ({ top: 80, right: 20, bottom: 20, left: 80 }));
  computedCells = computed(() => []);
  onCellHover(row: number, col: number, event: MouseEvent) {}
  onMouseMove(event: MouseEvent) {}
  onMouseLeave() {}
  formatNumber(v: number): string { return v.toString(); }
}
`,qt=`import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ngx-biplot',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <div class="ngx-biplot" (mouseleave)="onMouseLeave()">
      <svg #svgEl class="biplot-svg" width="100%" [attr.height]="height()">
        <g [attr.transform]="'translate(' + margin().left + ',' + margin().top + ')'">
          @for (pt of computedPoints(); track pt.label; let i = $index) {
            <circle [attr.cx]="pt.cx" [attr.cy]="pt.cy" r="5" [attr.fill]="pt.color" (mouseenter)="onPointHover(i, $event)" />
          }
        </g>
      </svg>
    </div>
  \`
})
export class BiplotComponent {
  points = input<any[]>([]);
  vectors = input<any[]>([]);
  height = input<number>(400);
  showLabels = input<boolean>(true);
  colors = input<string[]>([]);

  margin = computed(() => ({ top: 40, right: 40, bottom: 40, left: 40 }));
  computedPoints = computed(() => []);
  computedVectors = computed(() => []);
  onPointHover(idx: number, event: MouseEvent) {}
  onMouseMove(event: MouseEvent) {}
  onMouseLeave() {}
  formatNumber(v: number): string { return v.toString(); }
}
`,Ut=`import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef, viewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ngx-renko-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \\\`
    <div class="ngx-renko-chart" (click)="closeExportMenu()">
      <div class="chart-header">
        @if (showExport()) {
          <div class="chart-export-menu" (click)="\\\\\\$event.stopPropagation()">
            <button class="export-trigger" (click)="toggleExportMenu(\\\\\\$event)">Export</button>
            @if (exportMenuOpen()) {
              <div class="export-dropdown">
                <button (click)="onExport('svg')">SVG</button>
                <button (click)="onExport('csv')">CSV</button>
                <button (click)="onExport('json')">JSON</button>
              </div>
            }
          </div>
        }
      </div>

      <div class="chart-body">
        <svg #svgEl class="renko-svg" width="100%" [attr.height]="height()">
          <g [attr.transform]="'translate(' + margin().left + ',' + margin().top + ')'">
            @if (showGrid()) {
              @for (tick of yTicks(); track tick) {
                <line
                  [attr.x1]="0"
                  [attr.x2]="chartWidth()"
                  [attr.y1]="yScale()(tick)"
                  [attr.y2]="yScale()(tick)"
                  stroke="var(--ngx-chart-grid, #e2e8f0)"
                  stroke-width="1"
                  stroke-dasharray="3,3"
                />
                <text
                  [attr.x]="-8"
                  [attr.y]="yScale()(tick) + 4"
                  text-anchor="end"
                  class="axis-label"
                >{{ formatNumber(tick) }}</text>
              }
            }

            @for (brick of computedBricks(); track brick.index) {
              <rect
                [attr.x]="brick.x"
                [attr.y]="brick.y"
                [attr.width]="brick.w"
                [attr.height]="brick.h"
                [attr.fill]="brick.color"
                class="renko-brick"
                (mouseenter)="onBrickHover(brick, \\\\\\$event)"
                (mousemove)="onBrickHover(brick, \\\\\\$event)"
                (mouseleave)="onMouseLeave()"
              />
            }
          </g>
        </svg>
      </div>

      @if (tooltip(); as t) {
        <div class="chart-tooltip" [style.left.px]="t.x" [style.top.px]="t.y">
          @if (tooltipTemplate()) {
            <ng-container *ngTemplateOutlet="tooltipTemplate()!; context: { \\\\\\$implicit: t.raw }"></ng-container>
          } @else {
            <div class="tooltip-default">
              <div class="tooltip-row">
                <span class="tooltip-label">Type:</span>
                <span class="tooltip-value" [style.color]="t.raw.type === 'up' ? 'var(--ngx-chart-up, #10b981)' : 'var(--ngx-chart-down, #ef4444)'">
                  {{ t.raw.type.toUpperCase() }}
                </span>
              </div>
              <div class="tooltip-row">
                <span class="tooltip-label">Top:</span>
                <span class="tooltip-value">{{ formatNumber(t.raw.top) }}</span>
              </div>
              <div class="tooltip-row">
                <span class="tooltip-label">Bottom:</span>
                <span class="tooltip-value">{{ formatNumber(t.raw.bottom) }}</span>
              </div>
            </div>
          }
        </div>
      }
    </div>
  \\\`,
  styles: [\\\`
    :host { display: block; }
    .ngx-renko-chart { position: relative; font-family: inherit; }
    .chart-header { display: flex; justify-content: flex-end; position: relative; height: 30px; }
    .chart-export-menu { position: relative; }
    .export-trigger {
      padding: 4px 10px; font-size: 11px; font-weight: 600;
      color: var(--ngx-chart-axis-text, #6c757d);
      background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(8px);
      border: 1px solid var(--ngx-chart-grid, #ebedf0); border-radius: 6px; cursor: pointer;
    }
    .export-dropdown {
      position: absolute; right: 0; top: calc(100% + 4px); background: #fff;
      border: 1px solid var(--ngx-chart-grid, #ebedf0); border-radius: 8px;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.08); padding: 4px; display: flex;
      flex-direction: column; gap: 2px; min-width: 100px; z-index: 50;
    }
    .export-dropdown button {
      background: none; border: none; padding: 6px 10px; font-size: 11px; text-align: left;
      cursor: pointer; width: 100%; border-radius: 4px;
    }
    .export-dropdown button:hover { background: rgba(79, 70, 229, 0.06); }
    .renko-brick { cursor: pointer; transition: opacity 0.15s; }
    .renko-brick:hover { opacity: 0.85; }
    .axis-label { font-size: 10px; fill: var(--ngx-chart-axis-text, #94a3b8); }
    .chart-tooltip {
      position: absolute; pointer-events: none; transform: translate(-50%, -100%) translateY(-8px);
      background: var(--ngx-chart-tooltip-bg, rgba(15, 23, 42, 0.92));
      color: var(--ngx-chart-tooltip-color, #f8fafc); padding: 8px 12px; border-radius: 8px;
      font-size: 12px; min-width: 120px; box-shadow: 0 10px 20px -5px rgba(0,0,0,0.25);
      border: 1px solid rgba(255, 255, 255, 0.1); z-index: 100;
    }
    .tooltip-default { display: flex; flex-direction: column; gap: 4px; }
    .tooltip-row { display: flex; justify-content: space-between; gap: 12px; }
    .tooltip-label { color: #94a3b8; }
    .tooltip-value { font-weight: 600; }
  \\\`]
})
export class RenkoChartComponent {
  data = input<number[]>([]);
  boxSize = input<number>(5);
  height = input<number>(350);
  showGrid = input<boolean>(true);
  bullishColor = input<string>('');
  bearishColor = input<string>('');
  tooltipTemplate = input<any | null>(null);
  labelFormatter = input<((v: number) => string) | null>(null);
  showExport = input<boolean>(false);

  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');
  containerWidth = signal<number>(600);
  exportMenuOpen = signal(false);
  tooltip = signal<{x: number; y: number; raw: any} | null>(null);

  margin = computed(() => ({ top: 20, right: 20, bottom: 20, left: 45 }));
  chartWidth = computed(() => Math.max(100, this.containerWidth() - this.margin().left - this.margin().right));
  chartHeight = computed(() => Math.max(100, this.height() - this.margin().top - this.margin().bottom));

  computedBricks = computed(() => {
    // Layout algorithm returning Renko bricks
    return [];
  });

  yScale = computed(() => (v: number) => 0);
  yTicks = computed(() => []);

  onBrickHover(brick: any, event: MouseEvent) {}
  onMouseLeave() { this.tooltip.set(null); }
  formatNumber(v: number): string {
    return this.labelFormatter() ? this.labelFormatter()!(v) : v.toString();
  }

  toggleExportMenu(event: MouseEvent) {
    event.stopPropagation();
    this.exportMenuOpen.set(!this.exportMenuOpen());
  }

  closeExportMenu() { this.exportMenuOpen.set(false); }
  onExport(type: 'json' | 'csv' | 'svg') {}
}
`,Qt=`import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef, viewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ngx-kagi-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \\\`
    <div class="ngx-kagi-chart" (click)="closeExportMenu()">
      <div class="chart-header">
        @if (showExport()) {
          <div class="chart-export-menu" (click)="\\\\\\$event.stopPropagation()">
            <button class="export-trigger" (click)="toggleExportMenu(\\\\\\$event)">Export</button>
            @if (exportMenuOpen()) {
              <div class="export-dropdown">
                <button (click)="onExport('svg')">SVG</button>
                <button (click)="onExport('csv')">CSV</button>
                <button (click)="onExport('json')">JSON</button>
              </div>
            }
          </div>
        }
      </div>

      <div class="chart-body">
        <svg #svgEl class="kagi-svg" width="100%" [attr.height]="height()">
          <g [attr.transform]="'translate(' + margin().left + ',' + margin().top + ')'">
            @if (showGrid()) {
              @for (tick of yTicks(); track tick) {
                <line
                  [attr.x1]="0"
                  [attr.x2]="chartWidth()"
                  [attr.y1]="yScale()(tick)"
                  [attr.y2]="yScale()(tick)"
                  stroke="var(--ngx-chart-grid, #e2e8f0)"
                  stroke-width="1"
                  stroke-dasharray="3,3"
                />
                <text
                  [attr.x]="-8"
                  [attr.y]="yScale()(tick) + 4"
                  text-anchor="end"
                  class="axis-label"
                >{{ formatNumber(tick) }}</text>
              }
            }

            @for (seg of computedSegments(); track seg.index) {
              <line
                [attr.x1]="seg.x1"
                [attr.y1]="seg.y1"
                [attr.x2]="seg.x2"
                [attr.y2]="seg.y2"
                [attr.stroke]="seg.color"
                [attr.stroke-width]="seg.thickness"
                class="kagi-line"
                (mouseenter)="onSegmentHover(seg, \\\\\\$event)"
                (mousemove)="onSegmentHover(seg, \\\\\\$event)"
                (mouseleave)="onMouseLeave()"
              />
            }
          </g>
        </svg>
      </div>

      @if (tooltip(); as t) {
        <div class="chart-tooltip" [style.left.px]="t.x" [style.top.px]="t.y">
          @if (tooltipTemplate()) {
            <ng-container *ngTemplateOutlet="tooltipTemplate()!; context: { \\\\\\$implicit: t.raw }"></ng-container>
          } @else {
            <div class="tooltip-default">
              <div class="tooltip-row">
                <span class="tooltip-label">Type:</span>
                <span class="tooltip-value" [style.color]="t.raw.type === 'yang' ? 'var(--ngx-chart-up, #10b981)' : 'var(--ngx-chart-down, #ef4444)'">
                  {{ t.raw.type.toUpperCase() }}
                </span>
              </div>
              <div class="tooltip-row">
                <span class="tooltip-label">Start Price:</span>
                <span class="tooltip-value">{{ formatNumber(t.raw.start) }}</span>
              </div>
              <div class="tooltip-row">
                <span class="tooltip-label">End Price:</span>
                <span class="tooltip-value">{{ formatNumber(t.raw.end) }}</span>
              </div>
            </div>
          }
        </div>
      }
    </div>
  \\\`,
  styles: [\\\`
    :host { display: block; }
    .ngx-kagi-chart { position: relative; font-family: inherit; }
    .chart-header { display: flex; justify-content: flex-end; position: relative; height: 30px; }
    .chart-export-menu { position: relative; }
    .export-trigger {
      padding: 4px 10px; font-size: 11px; font-weight: 600;
      color: var(--ngx-chart-axis-text, #6c757d);
      background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(8px);
      border: 1px solid var(--ngx-chart-grid, #ebedf0); border-radius: 6px; cursor: pointer;
    }
    .export-dropdown {
      position: absolute; right: 0; top: calc(100% + 4px); background: #fff;
      border: 1px solid var(--ngx-chart-grid, #ebedf0); border-radius: 8px;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.08); padding: 4px; display: flex;
      flex-direction: column; gap: 2px; min-width: 100px; z-index: 50;
    }
    .export-dropdown button {
      background: none; border: none; padding: 6px 10px; font-size: 11px; text-align: left;
      cursor: pointer; width: 100%; border-radius: 4px;
    }
    .export-dropdown button:hover { background: rgba(79, 70, 229, 0.06); }
    .kagi-line { cursor: pointer; transition: opacity 0.15s; }
    .kagi-line:hover { opacity: 0.85; }
    .axis-label { font-size: 10px; fill: var(--ngx-chart-axis-text, #94a3b8); }
    .chart-tooltip {
      position: absolute; pointer-events: none; transform: translate(-50%, -100%) translateY(-8px);
      background: var(--ngx-chart-tooltip-bg, rgba(15, 23, 42, 0.92));
      color: var(--ngx-chart-tooltip-color, #f8fafc); padding: 8px 12px; border-radius: 8px;
      font-size: 12px; min-width: 120px; box-shadow: 0 10px 20px -5px rgba(0,0,0,0.25);
      border: 1px solid rgba(255, 255, 255, 0.1); z-index: 100;
    }
    .tooltip-default { display: flex; flex-direction: column; gap: 4px; }
    .tooltip-row { display: flex; justify-content: space-between; gap: 12px; }
    .tooltip-label { color: #94a3b8; }
    .tooltip-value { font-weight: 600; }
  \\\`]
})
export class KagiChartComponent {
  data = input<number[]>([]);
  reversalAmount = input<number>(15);
  height = input<number>(350);
  showGrid = input<boolean>(true);
  bullishColor = input<string>('');
  bearishColor = input<string>('');
  tooltipTemplate = input<any | null>(null);
  labelFormatter = input<((v: number) => string) | null>(null);
  showExport = input<boolean>(false);

  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');
  containerWidth = signal<number>(600);
  exportMenuOpen = signal(false);
  tooltip = signal<{x: number; y: number; raw: any} | null>(null);

  margin = computed(() => ({ top: 20, right: 20, bottom: 20, left: 45 }));
  chartWidth = computed(() => Math.max(100, this.containerWidth() - this.margin().left - this.margin().right));
  chartHeight = computed(() => Math.max(100, this.height() - this.margin().top - this.margin().bottom));

  computedSegments = computed(() => {
    // Layout algorithm returning Kagi segments
    return [];
  });

  yScale = computed(() => (v: number) => 0);
  yTicks = computed(() => []);

  onSegmentHover(seg: any, event: MouseEvent) {}
  onMouseLeave() { this.tooltip.set(null); }
  formatNumber(v: number): string {
    return this.labelFormatter() ? this.labelFormatter()!(v) : v.toString();
  }

  toggleExportMenu(event: MouseEvent) {
    event.stopPropagation();
    this.exportMenuOpen.set(!this.exportMenuOpen());
  }

  closeExportMenu() { this.exportMenuOpen.set(false); }
  onExport(type: 'json' | 'csv' | 'svg') {}
}
`,Kt=`import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef, viewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ngx-point-figure-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \\\`
    <div class="ngx-point-figure-chart" (click)="closeExportMenu()">
      <div class="chart-header">
        @if (showExport()) {
          <div class="chart-export-menu" (click)="\\\\\\$event.stopPropagation()">
            <button class="export-trigger" (click)="toggleExportMenu(\\\\\\$event)">Export</button>
            @if (exportMenuOpen()) {
              <div class="export-dropdown">
                <button (click)="onExport('svg')">SVG</button>
                <button (click)="onExport('csv')">CSV</button>
                <button (click)="onExport('json')">JSON</button>
              </div>
            }
          </div>
        }
      </div>

      <div class="chart-body">
        <svg #svgEl class="pf-svg" width="100%" [attr.height]="height()">
          <g [attr.transform]="'translate(' + margin().left + ',' + margin().top + ')'">
            @if (showGrid()) {
              @for (tick of yTicks(); track tick) {
                <line
                  [attr.x1]="0"
                  [attr.x2]="chartWidth()"
                  [attr.y1]="yScale()(tick)"
                  [attr.y2]="yScale()(tick)"
                  stroke="var(--ngx-chart-grid, #e2e8f0)"
                  stroke-width="1"
                  stroke-dasharray="3,3"
                />
                <text
                  [attr.x]="-8"
                  [attr.y]="yScale()(tick) + 4"
                  text-anchor="end"
                  class="axis-label"
                >{{ formatNumber(tick) }}</text>
              }
            }

            @for (cell of computedCells(); track cell.colIdx + '-' + cell.rowIdx) {
              <g
                class="pf-cell"
                (mouseenter)="onCellHover(cell, \\\\\\$event)"
                (mousemove)="onCellHover(cell, \\\\\\$event)"
                (mouseleave)="onMouseLeave()"
              >
                @if (cell.type === 'X') {
                  <line
                    [attr.x1]="cell.x - cellSize()/3"
                    [attr.y1]="cell.y - cellSize()/3"
                    [attr.x2]="cell.x + cellSize()/3"
                    [attr.y2]="cell.y + cellSize()/3"
                    [attr.stroke]="cell.color"
                    stroke-width="2"
                  />
                  <line
                    [attr.x1]="cell.x + cellSize()/3"
                    [attr.y1]="cell.y - cellSize()/3"
                    [attr.x2]="cell.x - cellSize()/3"
                    [attr.y2]="cell.y + cellSize()/3"
                    [attr.stroke]="cell.color"
                    stroke-width="2"
                  />
                } @else {
                  <circle
                    [attr.cx]="cell.x"
                    [attr.cy]="cell.y"
                    [attr.r]="cellSize()/3"
                    fill="none"
                    [attr.stroke]="cell.color"
                    stroke-width="2"
                  />
                }
              </g>
            }
          </g>
        </svg>
      </div>

      @if (tooltip(); as t) {
        <div class="chart-tooltip" [style.left.px]="t.x" [style.top.px]="t.y">
          @if (tooltipTemplate()) {
            <ng-container *ngTemplateOutlet="tooltipTemplate()!; context: { \\\\\\$implicit: t.raw }"></ng-container>
          } @else {
            <div class="tooltip-default">
              <div class="tooltip-row">
                <span class="tooltip-label">Type:</span>
                <span class="tooltip-value" [style.color]="t.raw.type === 'X' ? 'var(--ngx-chart-up, #10b981)' : 'var(--ngx-chart-down, #ef4444)'">
                  {{ t.raw.type === 'X' ? 'ACQUISITION (X)' : 'DISTRIBUTION (O)' }}
                </span>
              </div>
              <div class="tooltip-row">
                <span class="tooltip-label">Price Level:</span>
                <span class="tooltip-value">{{ formatNumber(t.raw.price) }}</span>
              </div>
              <div class="tooltip-row">
                <span class="tooltip-label">Column:</span>
                <span class="tooltip-value">#{{ t.raw.colIdx + 1 }}</span>
              </div>
            </div>
          }
        </div>
      }
    </div>
  \\\`,
  styles: [\\\`
    :host { display: block; }
    .ngx-point-figure-chart { position: relative; font-family: inherit; }
    .chart-header { display: flex; justify-content: flex-end; position: relative; height: 30px; }
    .chart-export-menu { position: relative; }
    .export-trigger {
      padding: 4px 10px; font-size: 11px; font-weight: 600;
      color: var(--ngx-chart-axis-text, #6c757d);
      background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(8px);
      border: 1px solid var(--ngx-chart-grid, #ebedf0); border-radius: 6px; cursor: pointer;
    }
    .export-dropdown {
      position: absolute; right: 0; top: calc(100% + 4px); background: #fff;
      border: 1px solid var(--ngx-chart-grid, #ebedf0); border-radius: 8px;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.08); padding: 4px; display: flex;
      flex-direction: column; gap: 2px; min-width: 100px; z-index: 50;
    }
    .export-dropdown button {
      background: none; border: none; padding: 6px 10px; font-size: 11px; text-align: left;
      cursor: pointer; width: 100%; border-radius: 4px;
    }
    .export-dropdown button:hover { background: rgba(79, 70, 229, 0.06); }
    .pf-cell { cursor: pointer; }
    .axis-label { font-size: 10px; fill: var(--ngx-chart-axis-text, #94a3b8); }
    .chart-tooltip {
      position: absolute; pointer-events: none; transform: translate(-50%, -100%) translateY(-8px);
      background: var(--ngx-chart-tooltip-bg, rgba(15, 23, 42, 0.92));
      color: var(--ngx-chart-tooltip-color, #f8fafc); padding: 8px 12px; border-radius: 8px;
      font-size: 12px; min-width: 120px; box-shadow: 0 10px 20px -5px rgba(0,0,0,0.25);
      border: 1px solid rgba(255, 255, 255, 0.1); z-index: 100;
    }
    .tooltip-default { display: flex; flex-direction: column; gap: 4px; }
    .tooltip-row { display: flex; justify-content: space-between; gap: 12px; }
    .tooltip-label { color: #94a3b8; }
    .tooltip-value { font-weight: 600; }
  \\\`]
})
export class PointFigureChartComponent {
  data = input<number[]>([]);
  boxSize = input<number>(4);
  reversal = input<number>(3);
  height = input<number>(350);
  showGrid = input<boolean>(true);
  xColor = input<string>('');
  oColor = input<string>('');
  tooltipTemplate = input<any | null>(null);
  labelFormatter = input<((v: number) => string) | null>(null);
  showExport = input<boolean>(false);

  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');
  containerWidth = signal<number>(600);
  exportMenuOpen = signal(false);
  tooltip = signal<{x: number; y: number; raw: any} | null>(null);

  margin = computed(() => ({ top: 20, right: 20, bottom: 20, left: 45 }));
  chartWidth = computed(() => Math.max(100, this.containerWidth() - this.margin().left - this.margin().right));
  chartHeight = computed(() => Math.max(100, this.height() - this.margin().top - this.margin().bottom));
  cellSize = computed(() => 14);

  computedCells = computed(() => {
    // Layout algorithm returning Point & Figure cells
    return [];
  });

  yScale = computed(() => (v: number) => 0);
  yTicks = computed(() => []);

  onCellHover(cell: any, event: MouseEvent) {}
  onMouseLeave() { this.tooltip.set(null); }
  formatNumber(v: number): string {
    return this.labelFormatter() ? this.labelFormatter()!(v) : v.toString();
  }

  toggleExportMenu(event: MouseEvent) {
    event.stopPropagation();
    this.exportMenuOpen.set(!this.exportMenuOpen());
  }

  closeExportMenu() { this.exportMenuOpen.set(false); }
  onExport(type: 'json' | 'csv' | 'svg') {}
}
`,Zt=`import {
  Component, ChangeDetectionStrategy, input, computed, signal,
  ElementRef, inject, DestroyRef, viewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ngx-wind-rose',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \\\`
    <div class="ngx-wind-rose" (click)="closeExportMenu()">
      <div class="chart-header">
        @if (showExport()) {
          <div class="chart-export-menu" (click)="\\\\\\$event.stopPropagation()">
            <button class="export-trigger" (click)="toggleExportMenu(\\\\\\$event)">Export</button>
            @if (exportMenuOpen()) {
              <div class="export-dropdown">
                <button (click)="onExport('svg')">SVG</button>
                <button (click)="onExport('csv')">CSV</button>
                <button (click)="onExport('json')">JSON</button>
              </div>
            }
          </div>
        }
      </div>

      <div class="chart-body">
        <svg #svgEl class="rose-svg" [attr.width]="height()" [attr.height]="height()">
          <g [attr.transform]="'translate(' + (height() / 2) + ',' + (height() / 2) + ')'">
            @for (circle of gridCircles(); track circle) {
              <circle cx="0" cy="0" [attr.r]="circle.r" fill="none" stroke="var(--ngx-chart-grid, #e2e8f0)" stroke-width="1" stroke-dasharray="3,3" />
            }

            @for (wedge of computedWedges(); track wedge.direction) {
              @for (bin of wedge.bins; track bin.binLabel; let bIdx = $index) {
                <path
                  [attr.d]="bin.path"
                  [attr.fill]="bin.color"
                  class="rose-wedge"
                  (mouseenter)="onWedgeHover(wedge, bin, \\\\\\$event)"
                  (mousemove)="onWedgeHover(wedge, bin, \\\\\\$event)"
                  (mouseleave)="onMouseLeave()"
                />
              }
            }
          </g>
        </svg>
      </div>

      @if (tooltip(); as t) {
        <div class="chart-tooltip" [style.left.px]="t.x" [style.top.px]="t.y">
          @if (tooltipTemplate()) {
            <ng-container *ngTemplateOutlet="tooltipTemplate()!; context: { \\\\\\$implicit: t.raw }"></ng-container>
          } @else {
            <div class="tooltip-default">
              <div class="tooltip-row">
                <span class="tooltip-label">Direction:</span>
                <span class="tooltip-value">{{ t.raw.direction }}</span>
              </div>
              <div class="tooltip-row">
                <span class="tooltip-label">Speed Bin:</span>
                <span class="tooltip-value">{{ t.raw.binLabel }} m/s</span>
              </div>
              <div class="tooltip-row">
                <span class="tooltip-label">Frequency:</span>
                <span class="tooltip-value">{{ formatNumber(t.raw.frequency) }}%</span>
              </div>
            </div>
          }
        </div>
      }
    </div>
  \\\`,
  styles: [\\\`
    :host { display: block; }
    .ngx-wind-rose { position: relative; font-family: inherit; display: flex; flex-direction: column; align-items: center; }
    .chart-header { display: flex; justify-content: flex-end; position: relative; height: 30px; width: 100%; }
    .chart-export-menu { position: relative; }
    .export-trigger {
      padding: 4px 10px; font-size: 11px; font-weight: 600;
      color: var(--ngx-chart-axis-text, #6c757d);
      background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(8px);
      border: 1px solid var(--ngx-chart-grid, #ebedf0); border-radius: 6px; cursor: pointer;
    }
    .export-dropdown {
      position: absolute; right: 0; top: calc(100% + 4px); background: #fff;
      border: 1px solid var(--ngx-chart-grid, #ebedf0); border-radius: 8px;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.08); padding: 4px; display: flex;
      flex-direction: column; gap: 2px; min-width: 100px; z-index: 50;
    }
    .export-dropdown button {
      background: none; border: none; padding: 6px 10px; font-size: 11px; text-align: left;
      cursor: pointer; width: 100%; border-radius: 4px;
    }
    .export-dropdown button:hover { background: rgba(79, 70, 229, 0.06); }
    .rose-wedge { cursor: pointer; transition: opacity 0.15s; }
    .rose-wedge:hover { opacity: 0.85; }
    .chart-tooltip {
      position: absolute; pointer-events: none; transform: translate(-50%, -100%) translateY(-8px);
      background: var(--ngx-chart-tooltip-bg, rgba(15, 23, 42, 0.92));
      color: var(--ngx-chart-tooltip-color, #f8fafc); padding: 8px 12px; border-radius: 8px;
      font-size: 12px; min-width: 120px; box-shadow: 0 10px 20px -5px rgba(0,0,0,0.25);
      border: 1px solid rgba(255, 255, 255, 0.1); z-index: 100;
    }
    .tooltip-default { display: flex; flex-direction: column; gap: 4px; }
    .tooltip-row { display: flex; justify-content: space-between; gap: 12px; }
    .tooltip-label { color: #94a3b8; }
    .tooltip-value { font-weight: 600; }
  \\\`]
})
export class WindRoseChartComponent {
  data = input<any[]>([]);
  height = input<number>(400);
  colors = input<string[]>([]);
  tooltipTemplate = input<any | null>(null);
  labelFormatter = input<((v: number) => string) | null>(null);
  showExport = input<boolean>(false);

  svgEl = viewChild<ElementRef<SVGElement>>('svgEl');
  exportMenuOpen = signal(false);
  tooltip = signal<{x: number; y: number; raw: any} | null>(null);
  gridCircles = computed(() => [{ r: 50 }, { r: 100 }, { r: 150 }]);

  computedWedges = computed(() => {
    // Layout algorithm returning Wind Rose wedges
    return [];
  });

  onWedgeHover(wedge: any, bin: any, event: MouseEvent) {}
  onMouseLeave() { this.tooltip.set(null); }
  formatNumber(v: number): string {
    return this.labelFormatter() ? this.labelFormatter()!(v) : v.toFixed(1);
  }

  toggleExportMenu(event: MouseEvent) {
    event.stopPropagation();
    this.exportMenuOpen.set(!this.exportMenuOpen());
  }

  closeExportMenu() { this.exportMenuOpen.set(false); }
  onExport(type: 'json' | 'csv' | 'svg') {}
}
`;var on=["customTooltip"],an=["tokenStreamChart"],tn=()=>[],rn=(t,o)=>[t,o],ln=()=>[50,85,100],sn=()=>["#fee2e2","#fef3c7","#dcfce7"],cn=()=>[60,85,100],dn=()=>["#f1f5f9","#e2e8f0","#cbd5e1"],pn=()=>["#e0f2fe","#0284c7"],un=()=>["Mobile","Web","Desktop"],hn=()=>({A:120,B:150,C:90,"A&B":45,"B&C":35,"A&C":20,"A&B&C":12}),gn=()=>["#f8fafc","#ec4899"],D=(t,o)=>o.name,mn=(t,o)=>o.timestamp;function xn(t,o){t&1&&(i(0,"span",109),d(1,"NEW"),r())}function bn(t,o){if(t&1){let e=v();i(0,"button",108),x("click",function(){let s=g(e).$implicit,l=c();return m(l.activeTab.set(s))}),k(1,xn,2,0,"span",109),d(2),r()}if(t&2){let e=o.$implicit,n=c();w("active",n.activeTab()===e),a(),u(n.newTabSet.has(e)?1:-1),a(),_(" ",e," ")}}function fn(t,o){if(t&1){let e=v();i(0,"div",110)(1,"span",111),d(2,"STACK MODE:"),r(),i(3,"button",112),x("click",function(){g(e);let s=c();return m(s.barStackMode.set("none"))}),d(4,"Grouped (None)"),r(),i(5,"button",112),x("click",function(){g(e);let s=c();return m(s.barStackMode.set("normal"))}),d(6,"Stacked (Normal)"),r(),i(7,"button",112),x("click",function(){g(e);let s=c();return m(s.barStackMode.set("percent"))}),d(8,"100% Stacked"),r()(),i(9,"ngx-bar-chart",113),x("barClick",function(s){g(e);let l=c();return m(l.onChartClick(s))}),r()}if(t&2){let e=c();a(3),w("active",e.barStackMode()==="none"),a(2),w("active",e.barStackMode()==="normal"),a(2),w("active",e.barStackMode()==="percent"),a(2),p("series",e.barSeries)("categories",e.months)("stackMode",e.barStackMode())("showLegend",e.showLegend())("showGrid",e.showGrid())("showLabels",e.showLabels())("height",e.chartHeight())("colors",e.getThemePalette())("showExport",!0)("referenceLines",e.showRefLinesToggle()?e.getReferenceLines():S(18,tn))("labelFormatter",e.useCustomFormatter()?e.barFormatter:void 0)("tooltipTemplate",e.useCustomTooltip()&&e.customTooltipTemplate()||null)}}function vn(t,o){if(t&1){let e=v();i(0,"ngx-line-chart",114),x("pointClick",function(s){g(e);let l=c();return m(l.onChartClick(s))}),r(),i(1,"div",115)(2,"div",116),d(3,"BRUSH & ZOOM RANGE NAVIGATOR"),r(),h(4,"ngx-chart-brush-zoom",117),r()}if(t&2){let e=c();p("series",e.lineSeries)("categories",e.months)("showArea",e.showArea())("showMarkers",e.showMarkers())("showLegend",e.showLegend())("height",e.chartHeight())("colors",e.getThemePalette())("showExport",!0)("referenceLines",e.showRefLinesToggle()?e.getReferenceLines():S(15,tn))("showLabels",e.showLabels())("labelFormatter",e.useCustomFormatter()?e.lineFormatter:void 0)("tooltipTemplate",e.useCustomTooltip()&&e.customTooltipTemplate()||null),a(4),p("data",e.lineSeries[0].data)("categories",e.months)("height",50)}}function Cn(t,o){if(t&1&&h(0,"ngx-area-chart",25),t&2){let e=c();p("series",e.lineSeries)("categories",e.months)("showMarkers",e.showMarkers())("showLegend",e.showLegend())("showGrid",e.showGrid())("height",e.chartHeight())("colors",e.getThemePalette())("showExport",!0)}}function yn(t,o){if(t&1&&h(0,"ngx-pie-chart",26),t&2){let e=c();p("data",e.pieData)("drillData",e.pieDrillData)("enableDrillDown",!0)("mode",e.pieMode())("centerTitle",e.donutTitle())("centerValue",e.donutValue())("donutHoleSize",e.donutHoleSize())("showLegend",e.showLegend())("showLabels",e.showLabels())("height",e.chartHeight())("colors",e.getThemePalette())("showExport",!0)}}function wn(t,o){if(t&1&&(i(0,"div",123)(1,"span",124),d(2),r(),h(3,"ngx-sparkline",125),i(4,"span",126),d(5),r(),i(6,"span",127),d(7),r()()),t&2){let e=o.$implicit,n=c(2);T("background",n.getThemeBgItem()),a(2),f(e.name),a(),p("data",e.data)("type",n.sparklineType())("color",n.sparklineColor())("width",140)("height",36),a(2),f(e.data[e.data.length-1]),a(),w("up",e.up)("down",!e.up),a(),N("",e.up?"\u25B2":"\u25BC"," ",e.change,"%")}}function kn(t,o){if(t&1&&(i(0,"div",27)(1,"div",118),M(2,wn,8,15,"div",119,D),r(),i(4,"div",120)(5,"div",121),d(6,"LOADING SKELETON SHIMMER PREVIEW"),r(),h(7,"ngx-chart-skeleton",122),r()()),t&2){let e=c();a(2),E(e.sparklineRows),a(5),p("height",120)}}function _n(t,o){if(t&1&&(i(0,"div",28),h(1,"ngx-gauge-chart",128),r()),t&2){let e=c();a(),p("value",e.gaugeValue())("min",0)("max",100)("label",e.gaugeLabel())("type",e.gaugeType())("showNeedle",e.showGaugeNeedle())("thresholds",e.gaugeThresholds)("color",e.getThemePalette()[0])("showExport",!0)}}function Sn(t,o){if(t&1&&(i(0,"div",29),h(1,"ngx-radar-chart",129),r()),t&2){let e=c();a(),p("seriesData",e.radarSeries)("categories",e.radarCategories)("max",100)("colors",e.getThemePalette())("showExport",!0)}}function Tn(t,o){if(t&1&&h(0,"ngx-heatmap-chart",30),t&2){let e=c();p("data",e.heatmapData())("xAxisLabels",e.heatmapXLabels())("yAxisLabels",e.heatmapYLabels())("colorRange",z(5,rn,e.getThemeBgItem(),e.getThemePalette()[0]))("showExport",!0)}}function Pn(t,o){if(t&1&&h(0,"ngx-treemap-chart",31),t&2){let e=c();p("data",e.treemapData())("colors",e.getThemePalette())("showExport",!0)}}function Mn(t,o){if(t&1&&h(0,"ngx-funnel-chart",32),t&2){let e=c();p("data",e.funnelData())("mode",e.funnelMode())("colors",e.getThemePalette())("showExport",!0)}}function En(t,o){if(t&1&&h(0,"ngx-combo-chart",33),t&2){let e=c();p("barSeries",e.comboBarSeries)("lineSeries",e.comboLineSeries)("categories",e.months)("barYTitle","Sales ($K)")("lineYTitle","Margin (%)")("showLegend",e.showLegend())("showGrid",e.showGrid())("height",e.chartHeight())("colors",e.getThemePalette())("showExport",!0)}}function Ln(t,o){if(t&1&&h(0,"ngx-scatter-plot",34),t&2){let e=c();p("data",e.scatterData)("xTitle","Unit Price ($)")("yTitle","Units Sold")("showLegend",e.showLegend())("showGrid",e.showGrid())("height",e.chartHeight())("colors",e.getThemePalette())("showExport",!0)}}function Dn(t,o){if(t&1&&h(0,"ngx-waterfall-chart",35),t&2){let e=c();p("data",e.waterfallData)("showGrid",e.showGrid())("showLabels",e.showLabels())("height",e.chartHeight())("positiveColor",e.waterfallPositiveColor())("negativeColor",e.waterfallNegativeColor())("totalColor",e.waterfallTotalColor())("showExport",!0)}}function Rn(t,o){if(t&1&&h(0,"ngx-box-plot-chart",36),t&2){let e=c();p("data",e.boxPlotData)("showGrid",e.showGrid())("showLabels",e.showLabels())("height",e.chartHeight())("color",e.boxPlotColor())("fillColor",e.boxPlotFillColor())("outlierColor",e.boxPlotOutlierColor())("showExport",!0)}}function An(t,o){if(t&1&&h(0,"ngx-radial-bar-chart",37),t&2){let e=c();p("data",e.radialData)("showLegend",e.showLegend())("height",e.chartHeight())("strokeWidth",e.radialStrokeWidth())("ringGap",e.radialRingGap())("colors",e.getThemePalette())("showExport",!0)}}function On(t,o){if(t&1&&h(0,"ngx-candlestick-chart",38),t&2){let e=c();p("data",e.candlestickData)("showGrid",e.showGrid())("showLabels",e.showLabels())("height",e.chartHeight())("bullishColor",e.candlestickBullishColor())("bearishColor",e.candlestickBearishColor())("showExport",!0)}}function $n(t,o){if(t&1&&h(0,"ngx-bubble-chart",39),t&2){let e=c();p("data",e.bubbleData())("xTitle","R&D Spend ($M)")("yTitle","Market Share (%)")("zTitle","Revenue ($B)")("showLegend",e.showLegend())("showGrid",e.showGrid())("showLabels",e.showLabels())("height",e.chartHeight())("colors",e.getThemePalette())("showExport",!0)}}function In(t,o){if(t&1&&h(0,"ngx-sunburst-chart",40),t&2){let e=c();p("data",e.sunburstData())("showLegend",e.showLegend())("showLabels",e.showLabels())("height",e.chartHeight())("colors",e.getThemePalette())("showExport",!0)}}function Vn(t,o){if(t&1&&h(0,"ngx-polar-area-chart",40),t&2){let e=c();p("data",e.pieData)("showLegend",e.showLegend())("showLabels",e.showLabels())("height",e.chartHeight())("colors",e.getThemePalette())("showExport",!0)}}function Bn(t,o){if(t&1&&(i(0,"div",41)(1,"div",130)(2,"label",131),d(3,"Sales Performance (YTD)"),r(),h(4,"ngx-bullet-chart",132),r(),i(5,"div",130)(6,"label",131),d(7,"CPU Usage Gauge"),r(),h(8,"ngx-bullet-chart",132),r()()),t&2){let e=c();a(4),p("value",e.bulletValue())("target",e.bulletTarget())("max",e.bulletMax())("ranges",S(16,ln))("rangeColors",S(17,sn))("valueColor","#10b981")("targetColor","#ef4444")("height",40),a(4),p("value",42)("target",80)("max",100)("ranges",S(18,cn))("rangeColors",S(19,dn))("valueColor","#4f46e5")("targetColor","#000000")("height",36)}}function Hn(t,o){if(t&1&&h(0,"ngx-dumbbell-chart",42),t&2){let e=c();p("data",e.dumbbellData)("showLegend",e.showLegend())("showGrid",e.showGrid())("showLabels",e.showLabels())("height",e.chartHeight())("colors",e.getThemePalette())("showExport",!0)}}function Nn(t,o){if(t&1&&h(0,"ngx-lollipop-chart",43),t&2){let e=c();p("data",e.lollipopData)("showGrid",e.showGrid())("showLabels",e.showLabels())("height",e.chartHeight())("colors",e.getThemePalette())("showExport",!0)}}function zn(t,o){if(t&1&&h(0,"ngx-slope-chart",44),t&2){let e=c();p("data",e.slopeData)("showLabels",e.showLabels())("showValues",e.showLabels())("height",e.chartHeight())("colors",e.getThemePalette())("showExport",!0)}}function Gn(t,o){if(t&1&&h(0,"ngx-sankey-chart",45),t&2){let e=c();p("nodes",e.sankeyNodes)("links",e.sankeyLinks)("showLabels",e.showLabels())("showValues",e.showLabels())("height",e.chartHeight())("colors",e.getThemePalette())("showExport",!0)}}function Wn(t,o){if(t&1&&h(0,"ngx-violin-plot",43),t&2){let e=c();p("data",e.violinData)("showGrid",e.showGrid())("showLabels",e.showLabels())("height",e.chartHeight())("colors",e.getThemePalette())("showExport",!0)}}function Fn(t,o){if(t&1&&h(0,"ngx-ridgeline-chart",43),t&2){let e=c();p("data",e.ridgelineData)("showGrid",e.showGrid())("showLabels",e.showLabels())("height",e.chartHeight())("colors",e.getThemePalette())("showExport",!0)}}function jn(t,o){if(t&1&&h(0,"ngx-pareto-chart",46),t&2){let e=c();p("data",e.paretoData)("showGrid",e.showGrid())("showLabels",e.showLabels())("height",e.chartHeight())("barColor",e.getThemePalette()[0])("lineColor",e.getThemePalette()[1])("showExport",!0)}}function Yn(t,o){if(t&1&&h(0,"ngx-marimekko-chart",43),t&2){let e=c();p("data",e.marimekkoData)("showGrid",e.showGrid())("showLabels",e.showLabels())("height",e.chartHeight())("colors",e.getThemePalette())("showExport",!0)}}function Xn(t,o){if(t&1&&h(0,"ngx-chord-diagram",47),t&2){let e=c();p("matrix",e.chordMatrix)("labels",e.chordLabels)("showLabels",e.showLabels())("height",e.chartHeight())("colors",e.getThemePalette())("showExport",!0)}}function Jn(t,o){if(t&1&&h(0,"ngx-dependency-wheel",47),t&2){let e=c();p("matrix",e.chordMatrix)("labels",e.chordLabels)("showLabels",e.showLabels())("height",e.chartHeight())("colors",e.getThemePalette())("showExport",!0)}}function qn(t,o){if(t&1&&h(0,"ngx-adjacency-matrix",48),t&2){let e=c();p("matrix",e.chordMatrix)("labels",e.chordLabels)("showLabels",e.showLabels())("height",e.chartHeight())("color",e.getThemePalette()[0])("showExport",!0)}}function Un(t,o){if(t&1&&h(0,"ngx-biplot",49),t&2){let e=c();p("points",e.biplotPoints)("vectors",e.biplotVectors)("showLabels",e.showLabels())("height",e.chartHeight())("colors",e.getThemePalette())("showExport",!0)}}function Qn(t,o){if(t&1&&h(0,"ngx-renko-chart",50),t&2){let e=c();p("data",e.financialPrices)("boxSize",5)("height",e.chartHeight())("showGrid",e.showGrid())("showExport",!0)("tooltipTemplate",e.useCustomTooltip()&&e.customTooltipTemplate()||null)("labelFormatter",e.useCustomFormatter()?e.financialFormatter:void 0)}}function Kn(t,o){if(t&1&&h(0,"ngx-kagi-chart",51),t&2){let e=c();p("data",e.financialPrices)("reversalAmount",15)("height",e.chartHeight())("showGrid",e.showGrid())("showExport",!0)("tooltipTemplate",e.useCustomTooltip()&&e.customTooltipTemplate()||null)("labelFormatter",e.useCustomFormatter()?e.financialFormatter:void 0)}}function Zn(t,o){if(t&1&&h(0,"ngx-point-figure-chart",52),t&2){let e=c();p("data",e.financialPrices)("boxSize",4)("reversal",3)("height",e.chartHeight())("showGrid",e.showGrid())("showExport",!0)("tooltipTemplate",e.useCustomTooltip()&&e.customTooltipTemplate()||null)("labelFormatter",e.useCustomFormatter()?e.financialFormatter:void 0)}}function eo(t,o){if(t&1&&h(0,"ngx-wind-rose",53),t&2){let e=c();p("data",e.windRoseData)("height",e.chartHeight())("colors",e.getThemePalette())("showExport",!0)("tooltipTemplate",e.useCustomTooltip()&&e.customTooltipTemplate()||null)("labelFormatter",e.useCustomFormatter()?e.roseFormatter:void 0)}}function to(t,o){if(t&1&&h(0,"ngx-area-range-chart",54),t&2){let e=c();p("series",e.areaRangeData)("height",e.chartHeight())("colors",e.getThemePalette())("showExport",!0)("showGrid",e.showGrid())("showMarkers",e.showMarkers())("showLegend",e.showLegend())("showLabels",e.showLabels())}}function no(t,o){if(t&1&&h(0,"ngx-network-graph",55),t&2){let e=c();p("nodes",e.networkNodes)("links",e.networkLinks)("height",e.chartHeight()+60)("colors",e.getThemePalette())("showExport",!0)("showLegend",e.showLegend())("showLabels",e.showLabels())}}function oo(t,o){if(t&1&&h(0,"ngx-treegraph",56),t&2){let e=c();p("data",e.treegraphData)("height",e.chartHeight()+60)("colors",e.getThemePalette())("showExport",!0)("showLabels",e.showLabels())}}function ao(t,o){if(t&1&&h(0,"ngx-map-choropleth",57),t&2){let e=c();p("data",e.choroplethData)("height",e.chartHeight()+80)("colors",S(5,pn))("showExport",!0)("showLegend",e.showLegend())}}function ro(t,o){if(t&1&&h(0,"ngx-flowmap",58),t&2){let e=c();p("nodes",e.flowmapNodes)("flows",e.flowmapLinks)("height",e.chartHeight()+80)("colors",e.getThemePalette())("showExport",!0)}}function io(t,o){if(t&1&&h(0,"ngx-venn-diagram",59),t&2){let e=c();p("sets",S(5,un))("sizes",S(6,hn))("height",e.chartHeight()+60)("colors",e.getThemePalette())("showExport",!0)}}function lo(t,o){if(t&1&&h(0,"ngx-word-cloud",60),t&2){let e=c();p("data",e.wordCloudItems)("height",e.chartHeight()+60)("colors",e.getThemePalette())("showExport",!0)}}function so(t,o){if(t&1&&h(0,"ngx-bell-curve-chart",60),t&2){let e=c();p("data",e.bellCurveData)("height",e.chartHeight())("colors",e.getThemePalette())("showExport",!0)}}function co(t,o){if(t&1&&h(0,"ngx-histogram",60),t&2){let e=c();p("data",e.histogramData)("height",e.chartHeight())("colors",e.getThemePalette())("showExport",!0)}}function po(t,o){if(t&1&&h(0,"ngx-flags",61),t&2){let e=c();p("data",e.flagsData)("dataset",e.flagsTimelineDataset)("categories",e.flagsTimelineCategories)("height",e.chartHeight())("colors",e.getThemePalette())("showExport",!0)("showGrid",e.showGrid())("showLabels",e.showLabels())}}function uo(t,o){if(t&1&&h(0,"ngx-area-spline-range-chart",62),t&2){let e=c();p("series",e.areaSplineRangeData)("height",e.chartHeight())("colors",e.getThemePalette())("showExport",!0)("showGrid",e.showGrid())("showMarkers",e.showMarkers())("showLegend",e.showLegend())}}function ho(t,o){if(t&1&&h(0,"ngx-streamgraph",63),t&2){let e=c();p("series",e.streamgraphSeries)("categories",e.streamgraphCategories)("height",e.chartHeight())("colors",e.getThemePalette())("showExport",!0)("showLegend",e.showLegend())}}function go(t,o){if(t&1&&h(0,"ngx-column-range-chart",64),t&2){let e=c();p("series",e.columnRangeData)("height",e.chartHeight())("colors",e.getThemePalette())("showExport",!0)("showGrid",e.showGrid())("showLegend",e.showLegend())("showLabels",e.showLabels())}}function mo(t,o){if(t&1&&h(0,"ngx-column-pyramid-chart",65),t&2){let e=c();p("series",e.columnPyramidSeries)("categories",e.months)("height",e.chartHeight())("colors",e.getThemePalette())("showExport",!0)("showGrid",e.showGrid())("showLegend",e.showLegend())("showLabels",e.showLabels())}}function xo(t,o){if(t&1&&h(0,"ngx-variwide-chart",66),t&2){let e=c();p("data",e.variwideData)("height",e.chartHeight())("colors",e.getThemePalette())("showExport",!0)("showGrid",e.showGrid())("showLegend",e.showLegend())("showLabels",e.showLabels())}}function bo(t,o){if(t&1&&h(0,"ngx-variable-pie-chart",67),t&2){let e=c();p("data",e.variablePieData)("height",e.chartHeight())("colors",e.getThemePalette())("showExport",!0)("showLegend",e.showLegend())("showLabels",e.showLabels())}}function fo(t,o){if(t&1&&h(0,"ngx-packed-bubble-chart",67),t&2){let e=c();p("data",e.packedBubbleData)("height",e.chartHeight()+60)("colors",e.getThemePalette())("showExport",!0)("showLegend",e.showLegend())("showLabels",e.showLabels())}}function vo(t,o){if(t&1&&h(0,"ngx-arc-diagram",68),t&2){let e=c();p("nodes",e.arcNodes)("links",e.arcLinks)("height",e.chartHeight()+60)("colors",e.getThemePalette())("showExport",!0)("showLabels",e.showLabels())}}function Co(t,o){if(t&1&&h(0,"ngx-error-bar",69),t&2){let e=c();p("data",e.errorBarData)("height",e.chartHeight())("colors",e.getThemePalette())("showExport",!0)("showGrid",e.showGrid())}}function yo(t,o){if(t&1&&h(0,"ngx-tilemap",56),t&2){let e=c();p("data",e.tilemapData)("height",e.chartHeight()+60)("colors",e.getThemePalette())("showExport",!0)("showLabels",e.showLabels())}}function wo(t,o){if(t&1){let e=v();i(0,"ngx-token-streaming-chart",133,1),x("streamTick",function(s){g(e);let l=c();return m(l.onTokenStreamTick(s))})("agentPromptRequest",function(s){g(e);let l=c();return m(l.onAgentPromptRequest(s))}),r()}if(t&2){let e=c();p("title","Real-Time LLM Token Output Speed")("windowSize",50)("height",e.chartHeight())("colors",e.getThemePalette())("showExport",!0)}}function ko(t,o){if(t&1){let e=v();i(0,"ngx-embedding-space-projection",134),x("lassoSelected",function(s){g(e);let l=c();return m(l.onEmbeddingLassoSelected(s))})("agentQueryRequest",function(s){g(e);let l=c();return m(l.onEmbeddingAgentQuery(s))}),r()}if(t&2){let e=c();p("data",e.embeddingProjectionData)("width",650)("height",e.chartHeight()+80)("colors",e.getThemePalette())("showExport",!0)}}function _o(t,o){if(t&1){let e=v();i(0,"div",72)(1,"div",135)(2,"label",136)(3,"input",137),x("change",function(s){g(e);let l=c();return m(l.toggleTopologyEditable(s))}),r(),i(4,"span"),d(5,"Interactive Workflow Builder Mode"),r()(),i(6,"span",138),d(7," \u{1F4A1} Double-click nodes to edit settings, drag node handles to link, single click link center to delete. "),r()(),i(8,"ngx-agentic-cognitive-topology",139),x("nodeActionClick",function(s){g(e);let l=c();return m(l.onTopologyNodeAction(s))})("validationError",function(s){g(e);let l=c();return m(l.onTopologyValidationError(s))})("nodesChange",function(s){g(e);let l=c();return m(l.onTopologyNodesChange(s))})("linksChange",function(s){g(e);let l=c();return m(l.onTopologyLinksChange(s))}),r()()}if(t&2){let e=c();a(3),p("checked",e.topologyEditable()),a(5),p("nodes",e.topologyNodes)("links",e.topologyLinks)("width",750)("height",e.chartHeight()+100)("colors",e.getThemePalette())("showExport",!0)("editable",e.topologyEditable())}}function So(t,o){if(t&1){let e=v();i(0,"ngx-transformer-attention-heatmap",140),x("cellClick",function(s){g(e);let l=c();return m(l.onAttentionCellClick(s))})("agentQueryRequest",function(s){g(e);let l=c();return m(l.onAttentionAgentQuery(s))}),r()}if(t&2){let e=c();p("tokensX",e.attentionTokensX)("tokensY",e.attentionTokensY)("weights",e.attentionWeights)("height",e.chartHeight()+60)("colors",S(6,gn))("showExport",!0)}}function To(t,o){if(t&1&&h(0,"ngx-step-line-chart",74),t&2){let e=c();p("series",e.stepLineSeries)("categories",e.months)("height",e.chartHeight())("colors",e.getThemePalette())("showExport",!0)("showGrid",e.showGrid())("showLegend",e.showLegend())("showLabels",e.showLabels())("showMarkers",e.showMarkers())("showArea",e.showArea())}}function Po(t,o){if(t&1&&h(0,"ngx-calendar-heatmap",75),t&2){let e=c();p("data",e.calendarHeatmapData)("height",e.chartHeight())("showExport",!0)}}function Mo(t,o){if(t&1&&h(0,"ngx-nested-donut-chart",76),t&2){let e=c();p("rings",e.nestedDonutRings)("height",e.chartHeight()+60)("colors",e.getThemePalette())("showExport",!0)("showLegend",e.showLegend())("showLabels",e.showLabels())}}function Eo(t,o){if(t&1&&h(0,"ngx-pyramid-chart",77),t&2){let e=c();p("data",e.pyramidItems)("height",e.chartHeight()+40)("colors",e.getThemePalette())("showExport",!0)("showLabels",e.showLabels())("showLegend",e.showLegend())}}function Lo(t,o){if(t&1&&h(0,"ngx-range-bar-chart",78),t&2){let e=c();p("data",e.rangeBarItems)("height",e.chartHeight()+40)("colors",e.getThemePalette())("showExport",!0)("showGrid",e.showGrid())("showLabels",e.showLabels())}}function Do(t,o){if(t&1&&h(0,"ngx-timeline-chart",79),t&2){let e=c();p("events",e.timelineEvents)("height",e.chartHeight()+60)("colors",e.getThemePalette())("showExport",!0)("showLegend",e.showLegend())}}function Ro(t,o){if(t&1&&h(0,"ngx-org-chart",80),t&2){let e=c();p("rootNode",e.orgNodeRoot)("height",e.chartHeight()+150)("colors",e.getThemePalette())("showExport",!0)}}function Ao(t,o){if(t&1&&h(0,"ngx-multi-needle-gauge",81),t&2){let e=c();p("needles",e.multiGaugeNeedles)("thresholds",e.gaugeThresholds)("height",e.chartHeight()+40)("showExport",!0)("showLegend",e.showLegend())}}function Oo(t,o){t&1&&(i(0,"div",146),d(1," Click on a bar or line point marker to see interactive events triggered in real time. "),r())}function $o(t,o){if(t&1&&(i(0,"div",148)(1,"span",149),d(2),r(),i(3,"span",150),d(4),r(),i(5,"span",151),d(6," Clicked category "),i(7,"strong",152),d(8),r(),d(9," with value "),i(10,"strong",152),d(11),r()()()),t&2){let e=o.$implicit,n=c(3);a(2),f(e.time),a(),T("background",n.getSeriesColor(e.seriesName)),a(),_(" ",e.seriesName," "),a(4),_('"',e.category,'"'),a(3),f(e.value)}}function Io(t,o){if(t&1&&(i(0,"div",147),M(1,$o,12,6,"div",148,mn),r()),t&2){let e=c(2);a(),E(e.chartClickLogs())}}function Vo(t,o){if(t&1){let e=v();i(0,"div",82)(1,"div",141)(2,"div",142),h(3,"span",143),d(4," Dashboard Action Logger "),r(),i(5,"button",144),x("click",function(){g(e);let s=c();return m(s.clearLogs())}),d(6,"Clear Logs"),r()(),i(7,"div",145),k(8,Oo,2,0,"div",146)(9,Io,3,0,"div",147),r()()}if(t&2){let e=c();a(8),u(e.chartClickLogs().length===0?8:9)}}function Bo(t,o){if(t&1){let e=v();i(0,"div",87)(1,"pre",153)(2,"code"),d(3),r()(),i(4,"button",154),x("click",function(){g(e);let s=c();return m(s.copyCode(s.getHtmlTemplateString()))}),d(5,"\u{1F4CB} Copy Code"),r()()}if(t&2){let e=c();a(3),f(e.getHtmlTemplateString())}}function Ho(t,o){if(t&1){let e=v();i(0,"div",87)(1,"pre",153)(2,"code"),d(3),r()(),i(4,"button",154),x("click",function(){g(e);let s=c();return m(s.copyCode(s.getTsTemplateString()))}),d(5,"\u{1F4CB} Copy Code"),r()()}if(t&2){let e=c();a(3),f(e.getTsTemplateString())}}function No(t,o){if(t&1&&(i(0,"tr")(1,"td",159),d(2),r(),i(3,"td",160),d(4),r(),i(5,"td",161),d(6),r(),i(7,"td"),d(8),r()()),t&2){let e=o.$implicit;a(2),f(e.name),a(2),f(e.type),a(2),f(e.default),a(2),f(e.description)}}function zo(t,o){if(t&1&&(i(0,"tr")(1,"td",159),d(2),r(),i(3,"td",161),d(4),r(),i(5,"td"),d(6),r()()),t&2){let e=o.$implicit;a(2),f(e.name),a(2),f(e.default),a(2),f(e.description)}}function Go(t,o){if(t&1&&(i(0,"div",88)(1,"div",155),d(2,"API Reference \u2014 Inputs"),r(),i(3,"div",156)(4,"table",157)(5,"thead")(6,"tr")(7,"th"),d(8,"Input"),r(),i(9,"th"),d(10,"Type"),r(),i(11,"th"),d(12,"Default"),r(),i(13,"th"),d(14,"Description"),r()()(),i(15,"tbody"),M(16,No,9,4,"tr",null,D),r()()(),i(18,"div",158),d(19,"CSS Custom Properties"),r(),i(20,"div",156)(21,"table",157)(22,"thead")(23,"tr")(24,"th"),d(25,"Variable"),r(),i(26,"th"),d(27,"Default"),r(),i(28,"th"),d(29,"Description"),r()()(),i(30,"tbody"),M(31,zo,7,3,"tr",null,D),r()()()()),t&2){let e=c();a(16),E(e.getApiInputs()),a(15),E(e.chartCssVars)}}function Wo(t,o){if(t&1){let e=v();i(0,"label",106)(1,"input",162),x("change",function(s){g(e);let l=c();return m(l.showLegend.set(s.target.checked))}),r(),d(2," Show Legend "),r()}if(t&2){let e=c();a(),p("checked",e.showLegend())}}function Fo(t,o){if(t&1){let e=v();i(0,"label",106)(1,"input",162),x("change",function(s){g(e);let l=c();return m(l.showGrid.set(s.target.checked))}),r(),d(2," Show Background Grid "),r()}if(t&2){let e=c();a(),p("checked",e.showGrid())}}function jo(t,o){if(t&1){let e=v();i(0,"label",106)(1,"input",162),x("change",function(s){g(e);let l=c();return m(l.showLabels.set(s.target.checked))}),r(),d(2," Show Data Labels "),r()}if(t&2){let e=c();a(),p("checked",e.showLabels())}}function Yo(t,o){if(t&1){let e=v();i(0,"div",96)(1,"div",97),d(2,"Enterprise Settings"),r(),i(3,"label",106)(4,"input",162),x("change",function(s){g(e);let l=c();return m(l.showRefLinesToggle.set(s.target.checked))}),r(),d(5," Enable Reference Lines "),r(),i(6,"label",106)(7,"input",162),x("change",function(s){g(e);let l=c();return m(l.useCustomFormatter.set(s.target.checked))}),r(),d(8," Use Custom Label Formatter "),r(),i(9,"label",106)(10,"input",162),x("change",function(s){g(e);let l=c();return m(l.useCustomTooltip.set(s.target.checked))}),r(),d(11," Use Custom Tooltip Template "),r()()}if(t&2){let e=c();a(4),p("checked",e.showRefLinesToggle()),a(3),p("checked",e.useCustomFormatter()),a(3),p("checked",e.useCustomTooltip())}}function Xo(t,o){if(t&1){let e=v();i(0,"div",98)(1,"label"),d(2,"Donut Center Title"),r(),i(3,"input",165),x("input",function(s){g(e);let l=c(2);return m(l.donutTitle.set(s.target.value))}),r()(),i(4,"div",98)(5,"label"),d(6,"Donut Hole Radius"),r(),i(7,"input",166),x("input",function(s){g(e);let l=c(2);return m(l.donutHoleSize.set(l.Number(s.target.value)))}),r(),i(8,"span",105),d(9),G(10,"percent"),r()()}if(t&2){let e=c(2);a(3),p("value",e.donutTitle()),a(4),p("value",e.donutHoleSize()),a(2),f(W(10,3,e.donutHoleSize()))}}function Jo(t,o){if(t&1){let e=v();i(0,"div",98)(1,"label"),d(2,"Chart Mode"),r(),i(3,"select",99),x("change",function(s){g(e);let l=c();return m(l.pieMode.set(s.target.value))}),i(4,"option",163),d(5,"Full Pie"),r(),i(6,"option",164),d(7,"Donut Ring"),r()()(),k(8,Xo,11,5)}if(t&2){let e=c();a(3),p("value",e.pieMode()),a(5),u(e.pieMode()==="donut"?8:-1)}}function qo(t,o){if(t&1){let e=v();i(0,"label",106)(1,"input",162),x("change",function(s){g(e);let l=c();return m(l.showArea.set(s.target.checked))}),r(),d(2," Fill Area Under Line "),r(),i(3,"label",106)(4,"input",162),x("change",function(s){g(e);let l=c();return m(l.showMarkers.set(s.target.checked))}),r(),d(5," Display Markers "),r()}if(t&2){let e=c();a(),p("checked",e.showArea()),a(3),p("checked",e.showMarkers())}}function Uo(t,o){if(t&1){let e=v();i(0,"label",106)(1,"input",162),x("change",function(s){g(e);let l=c();return m(l.showMarkers.set(s.target.checked))}),r(),d(2," Display Markers "),r()}if(t&2){let e=c();a(),p("checked",e.showMarkers())}}function Qo(t,o){if(t&1){let e=v();i(0,"div",98)(1,"label"),d(2,"Sparkline Type"),r(),i(3,"select",99),x("change",function(s){g(e);let l=c();return m(l.sparklineType.set(s.target.value))}),i(4,"option",167),d(5,"Line Spark"),r(),i(6,"option",168),d(7,"Area Segment"),r(),i(8,"option",169),d(9,"Bar Spikes"),r()()(),i(10,"div",98)(11,"label"),d(12,"Sparkline Color"),r(),i(13,"input",170),x("change",function(s){g(e);let l=c();return m(l.sparklineColor.set(s.target.value))}),r()()}if(t&2){let e=c();a(3),p("value",e.sparklineType()),a(10),p("value",e.sparklineColor())}}function Ko(t,o){if(t&1){let e=v();i(0,"div",98)(1,"label"),d(2,"Current Value"),r(),i(3,"input",171),x("input",function(s){g(e);let l=c();return m(l.onGaugeValueChange(s))}),r(),i(4,"span",105),d(5),r()(),i(6,"div",98)(7,"label"),d(8,"Dial Form Type"),r(),i(9,"select",99),x("change",function(s){g(e);let l=c();return m(l.onGaugeTypeChange(s))}),i(10,"option",172),d(11,"Semi Circular (180\xB0)"),r(),i(12,"option",173),d(13,"Full Dial (280\xB0)"),r()()(),i(14,"label",106)(15,"input",162),x("change",function(s){g(e);let l=c();return m(l.showGaugeNeedle.set(s.target.checked))}),r(),d(16," Show Needle Pointer "),r()}if(t&2){let e=c();a(3),p("value",e.gaugeValue()),a(2),_("",e.gaugeValue()," / 100"),a(4),p("value",e.gaugeType()),a(6),p("checked",e.showGaugeNeedle())}}function Zo(t,o){if(t&1){let e=v();i(0,"div",98)(1,"label"),d(2,"Bullet Value"),r(),i(3,"input",174),x("input",function(s){g(e);let l=c();return m(l.bulletValue.set(l.Number(s.target.value)))}),r(),i(4,"span",105),d(5),r()(),i(6,"div",98)(7,"label"),d(8,"Bullet Target"),r(),i(9,"input",174),x("input",function(s){g(e);let l=c();return m(l.bulletTarget.set(l.Number(s.target.value)))}),r(),i(10,"span",105),d(11),r()(),i(12,"div",98)(13,"label"),d(14,"Bullet Max"),r(),i(15,"input",175),x("input",function(s){g(e);let l=c();return m(l.bulletMax.set(l.Number(s.target.value)))}),r()()}if(t&2){let e=c();a(3),p("max",e.bulletMax())("value",e.bulletValue()),a(2),f(e.bulletValue()),a(4),p("max",e.bulletMax())("value",e.bulletTarget()),a(2),f(e.bulletTarget()),a(4),p("value",e.bulletMax())}}function ea(t,o){if(t&1){let e=v();i(0,"div",98)(1,"label"),d(2,"Layout Flow"),r(),i(3,"select",99),x("change",function(s){g(e);let l=c();return m(l.funnelMode.set(s.target.value))}),i(4,"option",176),d(5,"Funnel (Descending)"),r(),i(6,"option",177),d(7,"Pyramid (Ascending Apex)"),r()()()}if(t&2){let e=c();a(3),p("value",e.funnelMode())}}function ta(t,o){if(t&1){let e=v();i(0,"div",98)(1,"label"),d(2,"Positive Color"),r(),i(3,"input",170),x("change",function(s){g(e);let l=c();return m(l.waterfallPositiveColor.set(s.target.value))}),r()(),i(4,"div",98)(5,"label"),d(6,"Negative Color"),r(),i(7,"input",170),x("change",function(s){g(e);let l=c();return m(l.waterfallNegativeColor.set(s.target.value))}),r()(),i(8,"div",98)(9,"label"),d(10,"Total Color"),r(),i(11,"input",170),x("change",function(s){g(e);let l=c();return m(l.waterfallTotalColor.set(s.target.value))}),r()()}if(t&2){let e=c();a(3),p("value",e.waterfallPositiveColor()),a(4),p("value",e.waterfallNegativeColor()),a(4),p("value",e.waterfallTotalColor())}}function na(t,o){if(t&1){let e=v();i(0,"div",98)(1,"label"),d(2,"Box Outline Color"),r(),i(3,"input",170),x("change",function(s){g(e);let l=c();return m(l.boxPlotColor.set(s.target.value))}),r()(),i(4,"div",98)(5,"label"),d(6,"Outlier Indicator Color"),r(),i(7,"input",170),x("change",function(s){g(e);let l=c();return m(l.boxPlotOutlierColor.set(s.target.value))}),r()()}if(t&2){let e=c();a(3),p("value",e.boxPlotColor()),a(4),p("value",e.boxPlotOutlierColor())}}function oa(t,o){if(t&1){let e=v();i(0,"div",98)(1,"label"),d(2,"Ring Thickness"),r(),i(3,"input",178),x("input",function(s){g(e);let l=c();return m(l.radialStrokeWidth.set(l.Number(s.target.value)))}),r(),i(4,"span",105),d(5),r()(),i(6,"div",98)(7,"label"),d(8,"Ring Gap Distance"),r(),i(9,"input",179),x("input",function(s){g(e);let l=c();return m(l.radialRingGap.set(l.Number(s.target.value)))}),r(),i(10,"span",105),d(11),r()()}if(t&2){let e=c();a(3),p("value",e.radialStrokeWidth()),a(2),_("",e.radialStrokeWidth(),"px"),a(4),p("value",e.radialRingGap()),a(2),_("",e.radialRingGap(),"px")}}function aa(t,o){if(t&1){let e=v();i(0,"div",98)(1,"label"),d(2,"Bullish Color (Bull)"),r(),i(3,"input",170),x("change",function(s){g(e);let l=c();return m(l.candlestickBullishColor.set(s.target.value))}),r()(),i(4,"div",98)(5,"label"),d(6,"Bearish Color (Bear)"),r(),i(7,"input",170),x("change",function(s){g(e);let l=c();return m(l.candlestickBearishColor.set(s.target.value))}),r()()}if(t&2){let e=c();a(3),p("value",e.candlestickBullishColor()),a(4),p("value",e.candlestickBearishColor())}}function ra(t,o){t&1&&(i(0,"div",107),d(1," No specific options for this chart type. Use general settings. "),r())}function ia(t,o){if(t&1&&(i(0,"div",186)(1,"div",187),h(2,"span",188),i(3,"span",189),d(4),r(),i(5,"span",190),d(6),r()(),i(7,"div",191),h(8,"div",192),r()()),t&2){let e=o.$implicit,n=c(3);a(2),T("background",e.color),a(2),f(e.name),a(2),f(n.useCustomFormatter()?n.activeTab()==="Bar Chart"?n.barFormatter(e.value):n.lineFormatter(e.value):n.fmtNum(e.value)),a(2),T("background",e.color)("width",n.getProgressPercent(e.value),"%")}}function la(t,o){if(t&1&&(i(0,"div",181)(1,"span",182),d(2),r(),i(3,"span",183),d(4,"Live"),r()(),h(5,"div",184),i(6,"div",185),M(7,ia,9,8,"div",186,D),r()),t&2){let e=c().$implicit;a(2),_("",e.cat," Detail"),a(5),E(e.rows)}}function sa(t,o){if(t&1&&(i(0,"div",181)(1,"span",182),d(2,"Renko Brick Detail"),r(),i(3,"span",183),d(4),r()(),h(5,"div",184),i(6,"div",185)(7,"div",186)(8,"div",187)(9,"span",189),d(10,"Open Price"),r(),i(11,"span",190),d(12),r()()(),i(13,"div",186)(14,"div",187)(15,"span",189),d(16,"Close Price"),r(),i(17,"span",190),d(18),r()()()()),t&2){let e=c().$implicit,n=c();a(3),T("color",e.color),a(),f(e.type==="bullish"?"Yang (Bullish)":"Yin (Bearish)"),a(8),f(n.useCustomFormatter()?n.financialFormatter(e.open):n.fmtNum(e.open)),a(6),f(n.useCustomFormatter()?n.financialFormatter(e.close):n.fmtNum(e.close))}}function ca(t,o){if(t&1&&(i(0,"div",186)(1,"div",187)(2,"span",189),d(3,"From Price"),r(),i(4,"span",190),d(5),r()()(),i(6,"div",186)(7,"div",187)(8,"span",189),d(9,"To Price"),r(),i(10,"span",190),d(11),r()()()),t&2){let e=c(2).$implicit,n=c();a(5),f(n.useCustomFormatter()?n.financialFormatter(e.val1):n.fmtNum(e.val1)),a(6),f(n.useCustomFormatter()?n.financialFormatter(e.val2):n.fmtNum(e.val2))}}function da(t,o){if(t&1&&(i(0,"div",186)(1,"div",187)(2,"span",189),d(3,"Reversal Extrema"),r(),i(4,"span",190),d(5),r()()()),t&2){let e=c(2).$implicit,n=c();a(5),f(n.useCustomFormatter()?n.financialFormatter(e.val1):n.fmtNum(e.val1))}}function pa(t,o){if(t&1&&(i(0,"div",181)(1,"span",182),d(2,"Kagi Segment"),r(),i(3,"span",183),d(4),r()(),h(5,"div",184),i(6,"div",185),k(7,ca,12,2)(8,da,6,1,"div",186),r()),t&2){let e=c().$implicit;a(3),T("color",e.color),a(),f(e.trend==="bullish"?"Yang (Bullish)":"Yin (Bearish)"),a(3),u(e.type==="vertical"?7:8)}}function ua(t,o){if(t&1&&(i(0,"div",181)(1,"span",182),d(2,"P&F Cell Detail"),r(),i(3,"span",183),d(4),r()(),h(5,"div",184),i(6,"div",185)(7,"div",186)(8,"div",187)(9,"span",189),d(10,"Level"),r(),i(11,"span",190),d(12),r()()(),i(13,"div",186)(14,"div",187)(15,"span",189),d(16,"Column Index"),r(),i(17,"span",190),d(18),r()()()()),t&2){let e=c().$implicit,n=c();a(3),T("color",e.color),a(),f(e.type==="X"?"Rise (X)":"Fall (O)"),a(8),f(n.useCustomFormatter()?n.financialFormatter(e.value):n.fmtNum(e.value)),a(6),_("#",e.colIdx+1,"")}}function ha(t,o){if(t&1&&(i(0,"div",181)(1,"span",182),d(2),r(),i(3,"span",183),d(4,"Wind Rose"),r()(),h(5,"div",184),i(6,"div",185)(7,"div",186)(8,"div",187),h(9,"span",188),i(10,"span",189),d(11),r(),i(12,"span",190),d(13),r()()(),i(14,"div",186)(15,"div",187)(16,"span",189),d(17,"Sector Total"),r(),i(18,"span",190),d(19),r()()()()),t&2){let e=c().$implicit,n=c();a(2),_("",e.direction," Sector"),a(7),T("background",e.color),a(2),f(e.binLabel),a(2),f(n.useCustomFormatter()?n.roseFormatter(e.value):e.value.toFixed(1)+"%"),a(6),f(n.useCustomFormatter()?n.roseFormatter(e.cumValue):e.cumValue.toFixed(1)+"%")}}function ga(t,o){if(t&1&&(i(0,"div",180),k(1,la,9,1)(2,sa,19,5)(3,pa,9,4)(4,ua,19,5)(5,ha,20,6),r()),t&2){let e=c();a(),u(e.activeTab()!=="Renko Chart"&&e.activeTab()!=="Kagi Chart"&&e.activeTab()!=="Point & Figure Chart"&&e.activeTab()!=="Wind Rose"?1:-1),a(),u(e.activeTab()==="Renko Chart"?2:-1),a(),u(e.activeTab()==="Kagi Chart"?3:-1),a(),u(e.activeTab()==="Point & Figure Chart"?4:-1),a(),u(e.activeTab()==="Wind Rose"?5:-1)}}var en=class t{route=I(J);streamInterval;ngOnInit(){this.route.queryParams.subscribe(o=>{let e=o.tab;e&&this.tabs.includes(e)&&this.activeTab.set(e)}),this.streamInterval=setInterval(()=>{if(this.activeTab()==="Token Streaming"){let o=this.tokenStreamChart();if(o){let n=Math.random()>.93?90+Math.random()*45:15+Math.random()*20;o.appendPoint(n)}}},1e3)}ngOnDestroy(){this.streamInterval&&clearInterval(this.streamInterval)}activeTab=b("Bar Chart");activeSubtab=b("html");showRefLinesToggle=b(!0);useCustomFormatter=b(!1);useCustomTooltip=b(!0);customTooltipTemplate=R("customTooltip");tokenStreamChart=R("tokenStreamChart");chartClickLogs=b([]);barFormatter=o=>`$${o}M`;lineFormatter=o=>`${o} Users`;financialFormatter=o=>`$${o.toFixed(1)}`;roseFormatter=o=>`${o.toFixed(1)}%`;getReferenceLines(){let o=this.activeTab();return o==="Bar Chart"?[{value:75,label:"Target",color:"#10b981",strokeDasharray:"4,4"},{value:45,label:"Warning",color:"#f59e0b",strokeDasharray:"2,2"}]:o==="Line Chart"?[{value:300,label:"Target Users",color:"#818cf8",strokeDasharray:"3,3"},{value:150,label:"Min SLA",color:"#ef4444",strokeDasharray:"5,5"}]:[]}getProgressPercent(o){let e=this.activeTab()==="Line Chart"?450:100;return Math.min(100,Math.max(0,o/e*100))}onChartClick(o){let n=new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",second:"2-digit"});this.chartClickLogs.update(s=>[$(O({},o),{time:n,timestamp:Date.now()}),...s].slice(0,10))}onTokenStreamTick(o){o.value>85&&this.onChartClick({category:"Token Streaming",value:o.value,seriesName:`High latency anomaly detected at Token #${o.index+1}`})}onAgentPromptRequest(o){this.onChartClick({category:"Token Streaming",value:o.value,seriesName:`Prompt request: "${o.prompt}"`})}onEmbeddingLassoSelected(o){this.onChartClick({category:"Embedding Space",value:o.length,seriesName:`Lasso selection updated: ${o.length} points selected`})}onEmbeddingAgentQuery(o){this.onChartClick({category:"Embedding Space",value:o.selectedIds.length,seriesName:`Agent query type "${o.queryType}" for ${o.selectedIds.length} vectors`})}onTopologyNodeAction(o){this.onChartClick({category:"Agent Topology",value:0,seriesName:`Triggered action "${o.action}" on node "${o.nodeId}"`})}topologyEditable=b(!0);toggleTopologyEditable(o){let e=o.target;this.topologyEditable.set(e.checked)}onTopologyValidationError(o){this.onChartClick({category:"Topology Editor",value:0,seriesName:`Notification: ${o}`})}onTopologyNodesChange(o){this.topologyNodes=o}onTopologyLinksChange(o){this.topologyLinks=o}onAttentionCellClick(o){let e=this.attentionTokensY[o.row],n=this.attentionTokensX[o.col];this.onChartClick({category:"Attention Heatmap",value:o.weight,seriesName:`Clicked connection: "${e}" -> "${n}" (${(o.weight*100).toFixed(1)}%)`})}onAttentionAgentQuery(o){this.onChartClick({category:"Attention Heatmap",value:o.weight,seriesName:`Agent attention query: "${o.query}"`})}clearLogs(){this.chartClickLogs.set([])}getSeriesColor(o){let e=this.getThemePalette();return o==="Revenue"||o==="Users"?e[0]:o==="Expenses"||o==="Sessions"?e[1]:e[0]}fmtNum(o){return Math.abs(o)>=1e6?(o/1e6).toFixed(1)+"M":Math.abs(o)>=1e3?(o/1e3).toFixed(1)+"K":o%1===0?o.toString():o.toFixed(1)}tabs=["Step Line Chart","Calendar Heatmap","Nested Donut","Pyramid Chart","Range Bar","Timeline Chart","Org Chart","Multi-Needle Gauge","Bar Chart","Line Chart","Area Chart","Pie / Donut","Combo Chart","Scatter Plot","Bubble Chart","Sunburst Chart","Sparkline","Gauge Chart","Radar Chart","Heatmap Chart","Treemap Chart","Funnel / Pyramid Chart","Waterfall Chart","Box Plot Chart","Radial Bar Chart","Candlestick Chart","Polar Area Chart","Bullet Chart","Dumbbell Chart","Lollipop Chart","Slope Chart","Sankey Chart","Violin Plot","Ridgeline Chart","Pareto Chart","Marimekko Chart","Chord Diagram","Dependency Wheel","Adjacency Matrix","Biplot / PCA Plot","Renko Chart","Kagi Chart","Point & Figure Chart","Wind Rose","Area Range","Network Graph","Treegraph","Map Choropleth","Flowmap","Venn Diagram","Word Cloud","Bell Curve","Histogram","Flags","Area Spline Range","Streamgraph","Column Range","Column Pyramid","Variwide","Variable Pie","Packed Bubble","Arc Diagram","Error Bar","Tilemap","Token Streaming","Embedding Projection","Agent Cognitive Topology","Attention Heatmap"];selectedCategory=b("ALL");chartSearchQuery=b("");newTabSet=new Set(["Step Line Chart","Calendar Heatmap","Nested Donut","Pyramid Chart","Range Bar","Timeline Chart","Org Chart","Multi-Needle Gauge"]);filteredTabs=j(()=>{let o=this.selectedCategory(),e=this.chartSearchQuery().toLowerCase().trim(),n=this.tabs;return o==="NEW"?n=n.filter(s=>this.newTabSet.has(s)):o==="CORE"?n=["Bar Chart","Line Chart","Area Chart","Pie / Donut","Combo Chart","Scatter Plot","Bubble Chart","Sparkline","Gauge Chart","Radar Chart","Heatmap Chart","Treemap Chart"]:o==="FINANCIAL"?n=["Candlestick Chart","OHLC Chart","HLC Chart","Renko Chart","Kagi Chart","Point & Figure Chart","Multi-Needle Gauge","Range Bar"]:o==="HIERARCHY"?n=["Sankey Chart","Sunburst Chart","Chord Diagram","Treegraph","Org Chart","Network Graph","Timeline Chart","Nested Donut","Pyramid Chart"]:o==="AI"&&(n=["Token Streaming","Embedding Projection","Agent Cognitive Topology","Attention Heatmap"]),e&&(n=n.filter(s=>s.toLowerCase().includes(e))),n});showLegend=b(!0);showGrid=b(!0);showLabels=b(!0);showMarkers=b(!0);showArea=b(!1);chartHeight=b(280);chartTheme=b("light");pieMode=b("pie");donutTitle=b("Revenue");donutValue=b("$125K");donutHoleSize=b(.55);sparklineType=b("line");sparklineColor=b("#4a90d9");bulletValue=b(70);bulletTarget=b(80);bulletMax=b(100);gaugeValue=b(65);gaugeType=b("semi");gaugeLabel=b("Server Load");showGaugeNeedle=b(!0);funnelMode=b("funnel");waterfallPositiveColor=b("#10b981");waterfallNegativeColor=b("#ef4444");waterfallTotalColor=b("#64748b");boxPlotColor=b("#4f46e5");boxPlotFillColor=b("rgba(79, 70, 229, 0.12)");boxPlotOutlierColor=b("#ef4444");radialStrokeWidth=b(10);radialRingGap=b(4);candlestickBullishColor=b("#10b981");candlestickBearishColor=b("#ef4444");months=["Jan","Feb","Mar","Apr","May","Jun"];barSeries=[{name:"Revenue",data:[42,58,51,73,82,76]},{name:"Expenses",data:[31,44,38,52,61,55]}];lineSeries=[{name:"Users",data:[120,180,155,220,310,280]},{name:"Sessions",data:[200,260,230,340,420,390]}];stepLineSeries=[{name:"Server Tier A",data:[10,25,25,40,40,60]},{name:"Server Tier B",data:[5,15,30,30,45,50]}];calendarHeatmapData=Array.from({length:180},(o,e)=>{let n=new Date;return n.setDate(n.getDate()-(180-e)),{date:n.toISOString().split("T")[0],value:Math.floor(Math.random()*25)}});nestedDonutRings=[{name:"2026 Region Sales",data:[{label:"North America",value:450},{label:"Europe",value:320},{label:"Asia Pacific",value:280}]},{name:"2025 Region Sales",data:[{label:"North America",value:380},{label:"Europe",value:290},{label:"Asia Pacific",value:210}]}];pyramidItems=[{label:"Website Visits",value:1e5},{label:"Sign-Ups",value:45e3},{label:"Active Trials",value:2e4},{label:"Paid Subscriptions",value:8500}];rangeBarItems=[{label:"Design Phase",start:0,end:15,category:"Product"},{label:"Core Dev",start:10,end:45,category:"Engineering"},{label:"QA Testing",start:35,end:60,category:"Quality"},{label:"Beta Release",start:55,end:75,category:"Product"},{label:"Deployment",start:70,end:90,category:"Engineering"}];timelineEvents=[{id:"1",title:"Architecture Review",category:"Planning",startDate:"2026-01-05",endDate:"2026-01-12",status:"completed"},{id:"2",title:"Sprint 1 Kickoff",category:"Development",startDate:"2026-01-15",endDate:"2026-01-29",status:"completed"},{id:"3",title:"Security Audit Milestone",category:"Security",startDate:"2026-02-01",status:"in-progress"},{id:"4",title:"Production Rollout",category:"Release",startDate:"2026-02-15",endDate:"2026-03-01",status:"pending"}];orgNodeRoot={id:"root",name:"Sarah Connor",title:"Chief Executive Officer",department:"Executive",children:[{id:"cto",name:"Alex Vance",title:"Chief Technology Officer",department:"Engineering",children:[{id:"dev1",name:"Maria Hill",title:"Lead Architect",department:"Core Components"},{id:"dev2",name:"James Rhodes",title:"Principal Engineer",department:"UI Platform"}]},{id:"cpo",name:"Elena Rostova",title:"Chief Product Officer",department:"Product",children:[{id:"pm1",name:"David Kim",title:"Sr. Product Manager",department:"Analytics"}]}]};multiGaugeNeedles=[{label:"Minimum",value:20,color:"#3b82f6",type:"target-line"},{label:"Current Load",value:68,color:"#10b981",type:"needle"},{label:"Peak Capacity",value:92,color:"#ef4444",type:"pointer"}];barStackMode=b("none");pieData=[{label:"Product A",value:38},{label:"Product B",value:27},{label:"Product C",value:19},{label:"Product D",value:11},{label:"Other",value:5}];pieDrillData=new Map([["Product A",[{label:"Feature A1",value:20},{label:"Feature A2",value:12},{label:"Feature A3",value:6}]],["Product B",[{label:"Edition Enterprise",value:18},{label:"Edition Standard",value:9}]],["Product C",[{label:"Cloud Hosted",value:14},{label:"On-Premises",value:5}]]]);sparklineRows=[{name:"Page Views",data:[120,145,130,168,190,176,210],up:!0,change:14},{name:"Revenue ($)",data:[3200,2900,3400,3100,3800,4100,3950],up:!0,change:8},{name:"Bounce Rate",data:[48,51,44,47,43,46,42],up:!1,change:2},{name:"Avg. Session",data:[2.1,1.9,2.3,2,2.4,2.6,2.5],up:!0,change:5}];gaugeThresholds=[{value:40,color:"#10b981"},{value:75,color:"#f59e0b"},{value:100,color:"#ef4444"}];radarCategories=["Speed","Agility","Strength","Stamina","Skill","Tactics"];radarSeries=[{label:"Player A",values:[80,75,90,85,70,75]},{label:"Player B",values:[65,90,70,75,85,80]}];heatmapData=b([[12,45,15,34,67,89,21],[24,56,32,11,88,43,62],[78,23,91,54,38,29,70],[44,65,12,87,51,99,10],[35,72,48,60,19,82,53]]);heatmapXLabels=b(["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]);heatmapYLabels=b(["Week 1","Week 2","Week 3","Week 4","Week 5"]);treemapData=b([{label:"Technology",value:34e3},{label:"Healthcare",value:28e3},{label:"Finance",value:21e3},{label:"Consumer Goods",value:16e3},{label:"Energy",value:12e3},{label:"Real Estate",value:9e3},{label:"Utilities",value:5e3}]);comboBarSeries=[{name:"Sales Volume",data:[450,620,580,810,940,880]}];comboLineSeries=[{name:"Gross Margin %",data:[28,32,30,35,38,36]}];scatterData=[{x:15,y:85,label:"Basic-A",group:"Basic",size:8},{x:25,y:75,label:"Basic-B",group:"Basic",size:12},{x:35,y:65,label:"Basic-C",group:"Basic",size:6},{x:50,y:150,label:"Pro-A",group:"Pro",size:14},{x:65,y:180,label:"Pro-B",group:"Pro",size:18},{x:75,y:210,label:"Pro-C",group:"Pro",size:10},{x:110,y:320,label:"Ultra-A",group:"Ultra",size:15},{x:130,y:380,label:"Ultra-B",group:"Ultra",size:20}];funnelData=b([{name:"Website Visits",value:12500},{name:"Downloads / Signups",value:8200},{name:"Trial Activated",value:4500},{name:"Price Page Visits",value:2100},{name:"Closed Sales Deal",value:950}]);waterfallData=[{label:"Start",value:2e4,isTotal:!0},{label:"Q1 Revenue",value:8500},{label:"Services",value:3200},{label:"Marketing",value:-4500},{label:"R&D Cost",value:-5800},{label:"Direct Taxes",value:-1200},{label:"End Balance",value:0,isTotal:!0}];boxPlotData=[{label:"Class A",min:45,q1:60,median:72,q3:84,max:98,outliers:[22,105]},{label:"Class B",min:52,q1:65,median:78,q3:86,max:95,outliers:[34]},{label:"Class C",min:40,q1:55,median:68,q3:80,max:92,outliers:[12,108]}];radialData=[{label:"Move (Cal)",value:480,max:600,color:"#ef4444"},{label:"Exercise (Min)",value:22,max:30,color:"#22c55e"},{label:"Stand (Hr)",value:10,max:12,color:"#06b6d4"}];candlestickData=[{date:"Mon",open:125,high:132,low:122,close:130},{date:"Tue",open:130,high:138,low:128,close:135},{date:"Wed",open:135,high:136,low:124,close:126},{date:"Thu",open:126,high:131,low:120,close:122},{date:"Fri",open:122,high:129,low:121,close:128}];dumbbellData=[{label:"USA",startValue:74.2,endValue:78.8},{label:"Japan",startValue:79.5,endValue:84.6},{label:"Germany",startValue:76.8,endValue:81.2},{label:"India",startValue:62.4,endValue:70.8},{label:"Brazil",startValue:69.1,endValue:75.3}];lollipopData=[{label:"Marketing",value:450,color:"#4f46e5"},{label:"Sales",value:620,color:"#10b981"},{label:"Engineering",value:890,color:"#f59e0b"},{label:"Design",value:310,color:"#ec4899"},{label:"Support",value:240,color:"#8b5cf6"}];slopeData=[{label:"Productivity",startValue:65,endValue:88},{label:"Collaboration",startValue:70,endValue:92},{label:"Stress Levels",startValue:82,endValue:45},{label:"Overtime Hours",startValue:55,endValue:30},{label:"Satisfaction",startValue:60,endValue:85}];sankeyNodes=[{id:"revenue",label:"Revenue",color:"#6366f1"},{id:"sales",label:"Sales",color:"#10b981"},{id:"marketing",label:"Marketing",color:"#f59e0b"},{id:"operations",label:"Operations",color:"#ef4444"},{id:"profit",label:"Net Profit",color:"#06b6d4"}];sankeyLinks=[{source:"revenue",target:"sales",value:80},{source:"revenue",target:"marketing",value:20},{source:"sales",target:"operations",value:50},{source:"sales",target:"profit",value:30},{source:"marketing",target:"operations",value:15},{source:"marketing",target:"profit",value:5}];violinData=[{label:"Control Group",values:[12,15,14,18,25,30,22,21,24,26,28,35,40]},{label:"Treatment A",values:[18,22,21,25,35,42,30,28,32,34,38,48,55]},{label:"Treatment B",values:[15,19,17,22,28,34,25,23,27,29,31,39,45]}];ridgelineData=[{label:"Jan",values:[10,12,15,14,18,22,20,19,21,24,26,30]},{label:"Feb",values:[12,14,17,16,20,25,22,21,23,27,29,34]},{label:"Mar",values:[15,18,21,20,25,30,28,26,29,33,35,41]},{label:"Apr",values:[20,24,27,25,32,38,35,33,37,41,44,52]}];paretoData=[{label:"Defect A",value:85},{label:"Defect B",value:54},{label:"Defect C",value:32},{label:"Defect D",value:18},{label:"Defect E",value:8}];marimekkoData=[{label:"Segment X",segments:[{name:"Category 1",value:40},{name:"Category 2",value:25},{name:"Category 3",value:15}]},{label:"Segment Y",segments:[{name:"Category 1",value:20},{name:"Category 2",value:50},{name:"Category 3",value:30}]},{label:"Segment Z",segments:[{name:"Category 1",value:15},{name:"Category 2",value:10},{name:"Category 3",value:45}]}];chordMatrix=[[0,20,15,10],[5,0,25,30],[10,5,0,15],[25,10,5,0]];chordLabels=["Asia","Europe","North America","South America"];biplotPoints=[{x:-1.5,y:.8,label:"Obs A",group:"Set 1"},{x:-.9,y:1.2,label:"Obs B",group:"Set 1"},{x:1.2,y:-.5,label:"Obs C",group:"Set 2"},{x:.8,y:-.9,label:"Obs D",group:"Set 2"},{x:2.1,y:1.5,label:"Obs E",group:"Set 3"},{x:1.7,y:1.9,label:"Obs F",group:"Set 3"}];biplotVectors=[{x:1.8,y:1.2,label:"Variable 1"},{x:-1.2,y:2,label:"Variable 2"},{x:2,y:-1.5,label:"Variable 3"}];financialPrices=[100,102,105,103,101,98,95,96,99,103,107,110,112,115,113,111,108,105,107,111,114,118,122,120,124,128,125,122,119];windRoseData=[{direction:"N",speedBins:[{label:"< 5m/s",value:3.5},{label:"5-15m/s",value:6.2},{label:"> 15m/s",value:1.8}]},{direction:"NNE",speedBins:[{label:"< 5m/s",value:2.1},{label:"5-15m/s",value:4.8},{label:"> 15m/s",value:.9}]},{direction:"NE",speedBins:[{label:"< 5m/s",value:4},{label:"5-15m/s",value:5.5},{label:"> 15m/s",value:2.2}]},{direction:"ENE",speedBins:[{label:"< 5m/s",value:1.5},{label:"5-15m/s",value:3.2},{label:"> 15m/s",value:1.1}]},{direction:"E",speedBins:[{label:"< 5m/s",value:2.8},{label:"5-15m/s",value:4.1},{label:"> 15m/s",value:1.5}]},{direction:"ESE",speedBins:[{label:"< 5m/s",value:3.1},{label:"5-15m/s",value:5},{label:"> 15m/s",value:2}]},{direction:"SE",speedBins:[{label:"< 5m/s",value:5.2},{label:"5-15m/s",value:8.5},{label:"> 15m/s",value:4.1}]},{direction:"SSE",speedBins:[{label:"< 5m/s",value:2.6},{label:"5-15m/s",value:4.3},{label:"> 15m/s",value:1.2}]},{direction:"S",speedBins:[{label:"< 5m/s",value:3.9},{label:"5-15m/s",value:6.8},{label:"> 15m/s",value:2.5}]},{direction:"SSW",speedBins:[{label:"< 5m/s",value:1.8},{label:"5-15m/s",value:3.5},{label:"> 15m/s",value:.8}]},{direction:"SW",speedBins:[{label:"< 5m/s",value:4.2},{label:"5-15m/s",value:7.1},{label:"> 15m/s",value:3}]},{direction:"WSW",speedBins:[{label:"< 5m/s",value:2},{label:"5-15m/s",value:3.9},{label:"> 15m/s",value:1.3}]},{direction:"W",speedBins:[{label:"< 5m/s",value:3},{label:"5-15m/s",value:5.2},{label:"> 15m/s",value:2.1}]},{direction:"WNW",speedBins:[{label:"< 5m/s",value:2.5},{label:"5-15m/s",value:4},{label:"> 15m/s",value:1.4}]},{direction:"NW",speedBins:[{label:"< 5m/s",value:4.5},{label:"5-15m/s",value:6.9},{label:"> 15m/s",value:2.8}]},{direction:"NNW",speedBins:[{label:"< 5m/s",value:2.2},{label:"5-15m/s",value:4.2},{label:"> 15m/s",value:1}]}];areaRangeData=[{name:"Temperature Range",data:[{category:"Mon",low:12,high:22},{category:"Tue",low:14,high:24},{category:"Wed",low:11,high:21},{category:"Thu",low:15,high:26},{category:"Fri",low:16,high:28},{category:"Sat",low:13,high:23},{category:"Sun",low:12,high:22}]}];networkNodes=[{id:"R1",label:"Gateway Router",value:80,group:"Network",color:"#6366f1"},{id:"S1",label:"App Server 1",value:50,group:"Apps",color:"#3b82f6"},{id:"S2",label:"App Server 2",value:50,group:"Apps",color:"#3b82f6"},{id:"DB",label:"Primary DB",value:70,group:"Storage",color:"#10b981"},{id:"C1",label:"Cache Node",value:40,group:"Storage",color:"#10b981"},{id:"LB",label:"Load Balancer",value:60,group:"Network",color:"#6366f1"}];networkLinks=[{source:"R1",target:"LB",value:4},{source:"LB",target:"S1",value:2},{source:"LB",target:"S2",value:2},{source:"S1",target:"DB",value:3},{source:"S2",target:"DB",value:3},{source:"S1",target:"C1",value:1},{source:"S2",target:"C1",value:1}];treegraphData=[{id:"1",label:"CEO (Sophia)",value:100},{id:"2",label:"VP Eng (Alex)",parentId:"1",value:80},{id:"3",label:"VP Product (Mia)",parentId:"1",value:80},{id:"4",label:"QA Lead (John)",parentId:"2",value:50},{id:"5",label:"Dev Lead (Elena)",parentId:"2",value:60},{id:"6",label:"Design Lead (Leo)",parentId:"3",value:55},{id:"7",label:"Product Manager (Zara)",parentId:"3",value:50}];choroplethData=[{regionId:"US",value:85,label:"United States"},{regionId:"CA",value:45,label:"Canada"},{regionId:"MX",value:25,label:"Mexico"},{regionId:"EU",value:95,label:"Europe Hub"},{regionId:"CN",value:110,label:"China"},{regionId:"IN",value:75,label:"India"},{regionId:"RU",value:35,label:"Russia"},{regionId:"AU",value:60,label:"Australia"}];flowmapNodes=[{id:"CN",lat:39.9,lng:116.4,label:"Beijing Factory",color:"#ef4444",size:12},{id:"US",lat:40.71,lng:-74,label:"New York Warehouse",color:"#3b82f6",size:10},{id:"EU",lat:51.5,lng:-.12,label:"London Distribution",color:"#10b981",size:10},{id:"AU",lat:-33.86,lng:151.2,label:"Sydney Hub",color:"#8b5cf6",size:8}];flowmapLinks=[{from:"CN",to:"US",value:800,label:"Electronics",color:"#ef4444"},{from:"CN",to:"EU",value:650,label:"Apparel",color:"#10b981"},{from:"CN",to:"AU",value:350,label:"Machinery",color:"#8b5cf6"}];vennRegions=[{key:"A",label:"Mobile Users",value:120},{key:"B",label:"Web Users",value:150},{key:"C",label:"Desktop Users",value:90},{key:"A&B",label:"Mobile & Web",value:45},{key:"B&C",label:"Web & Desktop",value:35},{key:"A&C",label:"Mobile & Desktop",value:20},{key:"A&B&C",label:"Omnichannel",value:12}];wordCloudItems=[{text:"Angular",value:95},{text:"TypeScript",value:85},{text:"Signals",value:75},{text:"RxJS",value:60},{text:"HTML5",value:50},{text:"SCSS",value:45},{text:"D3",value:40},{text:"Jasmine",value:35},{text:"Karma",value:30},{text:"NodeJS",value:55},{text:"WebAssembly",value:25},{text:"ESLint",value:30},{text:"Prettier",value:20}];bellCurveData=[85,90,95,100,105,110,115,120,125,130,75,70,80,88,92,98,102,108,112,118,122,100,105,95,100,105,95,100,105];histogramData=[12,15,18,22,25,28,31,34,37,40,43,46,49,52,55,58,61,64,67,70,73,76,79,82,85,23,26,29,32,35,38,41,44,47,50,53,56,59,62,65,68,71,74,77,80,35,39,43,47,51,55,59,63,67,71,45,49,53,57,61,65,69,73];flagsData=[{x:"Jan 10",title:"A",text:"Alpha Release"},{x:"Feb 15",title:"B",text:"Beta Testing Kickoff",color:"#eab308"},{x:"Mar 22",title:"M1",text:"Milestone 1 Met",color:"#22c55e",shape:"pin"},{x:"Apr 05",title:"C",text:"Candidate Release",shape:"circle"},{x:"May 12",title:"V1",text:"Production Deployment V1.0",color:"#ec4899",shape:"square"}];flagsTimelineCategories=["Jan 10","Feb 15","Mar 22","Apr 05","May 12","Jun 18"];flagsTimelineDataset={name:"Build Stability Index",data:[75,82,70,89,95,98],color:"#6366f1"};areaSplineRangeData=[{name:"Temperature Range",data:[{category:"Mon",low:12,high:22},{category:"Tue",low:14,high:25},{category:"Wed",low:10,high:20},{category:"Thu",low:15,high:28},{category:"Fri",low:13,high:24},{category:"Sat",low:11,high:21},{category:"Sun",low:16,high:26}]}];streamgraphSeries=[{name:"Rock",data:[20,25,30,35,28,22,18]},{name:"Pop",data:[15,20,35,40,45,42,38]},{name:"Jazz",data:[25,22,18,15,12,10,8]},{name:"Hip Hop",data:[5,8,12,18,25,35,42]},{name:"Electronic",data:[3,5,10,15,22,30,35]}];streamgraphCategories=["1970","1980","1990","2000","2010","2015","2020"];columnRangeData=[{name:"Temperature",data:[{category:"Jan",low:-5,high:5},{category:"Feb",low:-3,high:8},{category:"Mar",low:2,high:14},{category:"Apr",low:6,high:20},{category:"May",low:10,high:25},{category:"Jun",low:15,high:30}]}];columnPyramidSeries=[{name:"Population",data:[1411,1380,331,274,214,169]}];variwideData=[{label:"China",y:12400,w:1411},{label:"USA",y:63500,w:331},{label:"Germany",y:46200,w:83},{label:"Japan",y:39300,w:126},{label:"UK",y:42300,w:67},{label:"India",y:2100,w:1380}];variablePieData=[{label:"Spain",value:505,radiusValue:92},{label:"France",value:551,radiusValue:119},{label:"Italy",value:348,radiusValue:106},{label:"Germany",value:312,radiusValue:130},{label:"UK",value:292,radiusValue:148}];packedBubbleData=[{id:"1",label:"React",value:180,group:"Frontend"},{id:"2",label:"Angular",value:120,group:"Frontend"},{id:"3",label:"Vue",value:90,group:"Frontend"},{id:"4",label:"Node.js",value:150,group:"Backend"},{id:"5",label:"Python",value:200,group:"Backend"},{id:"6",label:"Go",value:80,group:"Backend"},{id:"7",label:"PostgreSQL",value:130,group:"Database"},{id:"8",label:"MongoDB",value:100,group:"Database"},{id:"9",label:"Redis",value:70,group:"Database"}];arcNodes=[{id:"A",label:"Alice"},{id:"B",label:"Bob"},{id:"C",label:"Charlie"},{id:"D",label:"Diana"},{id:"E",label:"Eve"}];arcLinks=[{source:"A",target:"B",value:5},{source:"A",target:"C",value:3},{source:"B",target:"D",value:4},{source:"C",target:"E",value:2},{source:"D",target:"E",value:6}];errorBarData=[{label:"Experiment 1",value:42,errorPlus:5,errorMinus:3,x:0,y:0,yTop:0,yBottom:0},{label:"Experiment 2",value:58,errorPlus:7,errorMinus:4,x:0,y:0,yTop:0,yBottom:0},{label:"Experiment 3",value:35,errorPlus:6,errorMinus:5,x:0,y:0,yTop:0,yBottom:0},{label:"Experiment 4",value:71,errorPlus:4,errorMinus:3,x:0,y:0,yTop:0,yBottom:0},{label:"Experiment 5",value:49,errorPlus:8,errorMinus:6,x:0,y:0,yTop:0,yBottom:0}];tilemapData=[{r:0,c:10,label:"ME",value:1362},{r:1,c:9,label:"VT",value:647},{r:1,c:10,label:"NH",value:1389},{r:2,c:7,label:"WI",value:5896},{r:2,c:8,label:"MI",value:10051},{r:2,c:9,label:"NY",value:19454},{r:2,c:10,label:"MA",value:7030},{r:3,c:5,label:"NE",value:1963},{r:3,c:6,label:"IA",value:3191},{r:3,c:7,label:"IL",value:12671},{r:3,c:8,label:"IN",value:6806},{r:3,c:9,label:"PA",value:13003},{r:3,c:10,label:"CT",value:3605},{r:4,c:4,label:"CO",value:5840},{r:4,c:5,label:"KS",value:2937},{r:4,c:6,label:"MO",value:6169},{r:4,c:9,label:"NJ",value:9289},{r:5,c:5,label:"OK",value:4e3},{r:5,c:6,label:"AR",value:3025},{r:5,c:8,label:"VA",value:8643},{r:6,c:4,label:"NM",value:2118},{r:6,c:5,label:"TX",value:29528},{r:6,c:7,label:"GA",value:10800},{r:6,c:8,label:"NC",value:10600},{r:7,c:8,label:"FL",value:22245}];embeddingProjectionData=[{id:"nlp_1",x:2.1,y:1.8,group:"Core System",label:"transformer-attention-block"},{id:"nlp_2",x:1.8,y:2.2,group:"Core System",label:"embedding-layer-dense"},{id:"nlp_3",x:2.5,y:2,group:"Core System",label:"causal-lm-head"},{id:"nlp_4",x:2.3,y:1.5,group:"Core System",label:"kv-cache-manager"},{id:"nlp_5",x:1.9,y:2.5,group:"Core System",label:"rope-rotary-positional"},{id:"ui_1",x:-2,y:-2.2,group:"UI Rendering",label:"svg-path-renderer"},{id:"ui_2",x:-1.7,y:-1.8,group:"UI Rendering",label:"tooltip-glassmorphic"},{id:"ui_3",x:-2.4,y:-2,group:"UI Rendering",label:"lasso-polygon-drag"},{id:"ui_4",x:-2.2,y:-2.5,group:"UI Rendering",label:"viewbox-pan-zoom"},{id:"ui_5",x:-1.8,y:-2.1,group:"UI Rendering",label:"export-pdf-window"},{id:"api_1",x:-2.8,y:2.5,group:"API Integration",label:"web-llm-service-worker"},{id:"api_2",x:-3.2,y:2.8,group:"API Integration",label:"huggingface-hub-fetch"},{id:"api_3",x:-2.6,y:3.1,group:"API Integration",label:"sse-streaming-parser"},{id:"api_4",x:-3,y:2.4,group:"API Integration",label:"token-rate-limiter"},{id:"noise_1",x:.2,y:-.5,group:"Outliers / Noise",label:"garbage-collection-log"},{id:"noise_2",x:-.5,y:.8,group:"Outliers / Noise",label:"unresolved-promise-reject"},{id:"noise_3",x:3.5,y:-3.2,group:"Outliers / Noise",label:"deprecated-api-fallback"}];topologyNodes=[{id:"usr",label:"User Query Node",status:"success",type:"orchestrator",prompt:"Implement SVG charts for AI."},{id:"plan",label:"Planner Agent",status:"success",type:"agent",prompt:"Generate design system & checklist.",response:"Task.md and implementation plan generated."},{id:"code",label:"Code Generator",status:"thinking",type:"agent",prompt:"Write TokenStreaming component.",response:"Created token-streaming-chart.component.ts"},{id:"lint",label:"Linter Service",status:"idle",type:"tool",prompt:"Run ng lint & format checks."},{id:"test",label:"Karma Runner",status:"idle",type:"tool",prompt:"Execute unit tests suite."}];topologyLinks=[{source:"usr",target:"plan",active:!1},{source:"plan",target:"code",active:!0},{source:"code",target:"lint",active:!1},{source:"code",target:"test",active:!1}];attentionTokensY=["The","agent","solved","the","task","successfully","."];attentionTokensX=["Antigravity","completed","the","development","plan","and","build","."];attentionWeights=[[.1,.1,.6,.1,.05,.02,.02,.01],[.7,.15,.05,.03,.02,.02,.02,.01],[.05,.5,.05,.3,.04,.02,.02,.02],[.05,.05,.7,.05,.05,.04,.04,.02],[.02,.1,.08,.2,.55,.02,.02,.01],[.01,.25,.02,.02,.1,.1,.45,.05],[.01,.01,.01,.01,.01,.05,.05,.85]];bubbleData=b([{x:10,y:30,z:150,label:"App A",group:"Tech"},{x:25,y:45,z:280,label:"App B",group:"Tech"},{x:45,y:70,z:500,label:"App C",group:"Health"},{x:60,y:20,z:120,label:"App D",group:"Health"},{x:75,y:85,z:650,label:"App E",group:"Finance"},{x:90,y:60,z:400,label:"App F",group:"Finance"}]);sunburstData=b([{label:"North America",children:[{label:"USA",children:[{label:"New York",value:450},{label:"California",value:620},{label:"Texas",value:380}]},{label:"Canada",children:[{label:"Toronto",value:210},{label:"Vancouver",value:180}]}]},{label:"Europe",children:[{label:"Germany",children:[{label:"Berlin",value:310},{label:"Munich",value:290}]},{label:"UK",children:[{label:"London",value:420},{label:"Manchester",value:150}]}]}]);chartCssVars=[{name:"--ngx-chart-bg",default:"#ffffff",description:"Container canvas backdrop color."},{name:"--ngx-chart-grid",default:"#ebedf0",description:"Grid line separator tint."},{name:"--ngx-chart-axis",default:"#ced4da",description:"Base axes lines tint."},{name:"--ngx-chart-axis-text",default:"#6c757d",description:"Scales labels text color."},{name:"--ngx-chart-tooltip-bg",default:"rgba(30, 41, 59, 0.85)",description:"Glassmorphic tooltip background."}];getThemeBg(){switch(this.chartTheme()){case"dark":return"#1e293b";case"emerald":return"#f0fdf4";case"sunset":return"#fff7ed";default:return"#ffffff"}}getThemeBgItem(){switch(this.chartTheme()){case"dark":return"#0f172a";case"emerald":return"#dcfce7";case"sunset":return"#ffedd5";default:return"#f8fafc"}}getThemePalette(){switch(this.chartTheme()){case"dark":return["#38bdf8","#818cf8","#34d399","#f472b6","#a78bfa"];case"emerald":return["#10b981","#34d399","#059669","#6ee7b7","#047857"];case"sunset":return["#f97316","#ea580c","#f43f5e","#fb923c","#fda4af"];default:return te}}hasGeneralToggle(o){let e=this.activeTab();return o==="legend"?["Bar Chart","Line Chart","Area Chart","Pie / Donut","Combo Chart","Scatter Plot","Bubble Chart","Sunburst Chart","Radial Bar Chart","Step Line Chart","Nested Donut","Pyramid Chart","Timeline Chart","Multi-Needle Gauge"].includes(e):o==="grid"?["Bar Chart","Line Chart","Area Chart","Combo Chart","Scatter Plot","Bubble Chart","Waterfall Chart","Box Plot Chart","Candlestick Chart","Step Line Chart","Range Bar"].includes(e):o==="labels"?["Bar Chart","Line Chart","Pie / Donut","Bubble Chart","Sunburst Chart","Waterfall Chart","Box Plot Chart","Candlestick Chart","Step Line Chart","Nested Donut","Pyramid Chart","Range Bar"].includes(e):!1}hasSpecificControls(){let o=this.activeTab();return["Pie / Donut","Line Chart","Area Chart","Sparkline","Gauge Chart","Funnel / Pyramid Chart","Waterfall Chart","Box Plot Chart","Radial Bar Chart","Candlestick Chart"].includes(o)}onThemeChange(o){let e=o.target.value;this.chartTheme.set(e)}onHeightChange(o){let e=o.target.value;this.chartHeight.set(Number(e))}onGaugeValueChange(o){let e=o.target.value;this.gaugeValue.set(Number(e))}onGaugeTypeChange(o){let e=o.target.value;this.gaugeType.set(e)}copyCode(o){navigator.clipboard.writeText(o).then(()=>{alert("Code copied to clipboard! \u{1F4CB}")})}getHtmlTemplateString(){let o=this.activeTab(),e=this.chartHeight(),n=this.showLegend(),s=this.showGrid(),l=this.showLabels();switch(o){case"Bar Chart":return`<ngx-bar-chart
  [series]="series"
  [categories]="categories"
  [showLegend]="${n}"
  [showGrid]="${s}"
  [showLabels]="${l}"
  [height]="${e}"
  [showExport]="true"${this.showRefLinesToggle()?`
  [referenceLines]="referenceLines"`:""}${this.useCustomFormatter()?`
  [labelFormatter]="labelFormatter"`:""}${this.useCustomTooltip()?`
  [tooltipTemplate]="customTooltip"`:""}
  (barClick)="onBarClick($event)"
/>`;case"Line Chart":return`<ngx-line-chart
  [series]="series"
  [categories]="categories"
  [showArea]="${this.showArea()}"
  [showMarkers]="${this.showMarkers()}"
  [showLegend]="${n}"
  [height]="${e}"
  [showExport]="true"${this.showRefLinesToggle()?`
  [referenceLines]="referenceLines"`:""}
  [showLabels]="${l}"${this.useCustomFormatter()?`
  [labelFormatter]="labelFormatter"`:""}${this.useCustomTooltip()?`
  [tooltipTemplate]="customTooltip"`:""}
  (pointClick)="onPointClick($event)"
/>`;case"Area Chart":return`<ngx-area-chart
  [series]="series"
  [categories]="categories"
  [showMarkers]="${this.showMarkers()}"
  [showLegend]="${n}"
  [showGrid]="${s}"
  [height]="${e}"
/>`;case"Pie / Donut":return`<ngx-pie-chart
  [data]="data"
  mode="${this.pieMode()}"
  [centerTitle]="'${this.donutTitle()}'"
  [centerValue]="'${this.donutValue()}'"
  [donutHoleSize]="${this.donutHoleSize()}"
  [showLegend]="${n}"
  [showLabels]="${l}"
  [height]="${e}"
  [showExport]="true"
/>`;case"Sparkline":return`<ngx-sparkline
  [data]="data"
  type="${this.sparklineType()}"
  color="${this.sparklineColor()}"
  [width]="140"
  [height]="36"
/>`;case"Gauge Chart":return`<ngx-gauge-chart
  [value]="${this.gaugeValue()}"
  [min]="0"
  [max]="100"
  label="${this.gaugeLabel()}"
  type="${this.gaugeType()}"
  [showNeedle]="${this.showGaugeNeedle()}"
  [thresholds]="thresholds"
/>`;case"Radar Chart":return`<ngx-radar-chart
  [seriesData]="series"
  [categories]="categories"
  [max]="100"
/>`;case"Heatmap Chart":return`<ngx-heatmap-chart
  [data]="heatmapData"
  [xAxisLabels]="xLabels"
  [yAxisLabels]="yLabels"
/>`;case"Treemap Chart":return`<ngx-treemap-chart
  [data]="treemapData"
/>`;case"Funnel / Pyramid Chart":return`<ngx-funnel-chart
  [data]="data"
  mode="${this.funnelMode()}"
/>`;case"Combo Chart":return`<ngx-combo-chart
  [barSeries]="barSeries"
  [lineSeries]="lineSeries"
  [categories]="categories"
  barYTitle="Sales ($K)"
  lineYTitle="Margin (%)"
  [showLegend]="${n}"
  [showGrid]="${s}"
  [height]="${e}"
/>`;case"Scatter Plot":return`<ngx-scatter-plot
  [data]="data"
  xTitle="Unit Price"
  yTitle="Units Sold"
  [showLegend]="${n}"
  [showGrid]="${s}"
  [height]="${e}"
/>`;case"Bubble Chart":return`<ngx-bubble-chart
  [data]="data"
  xTitle="R&D Spend ($M)"
  yTitle="Market Share (%)"
  zTitle="Revenue ($B)"
  [showLegend]="${n}"
  [showGrid]="${s}"
  [showLabels]="${l}"
  [height]="${e}"
  [showExport]="true"
/>`;case"Sunburst Chart":return`<ngx-sunburst-chart
  [data]="data"
  [showLegend]="${n}"
  [showLabels]="${l}"
  [height]="${e}"
  [showExport]="true"
/>`;case"Waterfall Chart":return`<ngx-waterfall-chart
  [data]="data"
  [showGrid]="${s}"
  [showLabels]="${l}"
  [height]="${e}"
  positiveColor="${this.waterfallPositiveColor()}"
  negativeColor="${this.waterfallNegativeColor()}"
  totalColor="${this.waterfallTotalColor()}"
/>`;case"Box Plot Chart":return`<ngx-box-plot-chart
  [data]="data"
  [showGrid]="${s}"
  [showLabels]="${l}"
  [height]="${e}"
  color="${this.boxPlotColor()}"
  fillColor="${this.boxPlotFillColor()}"
  outlierColor="${this.boxPlotOutlierColor()}"
/>`;case"Radial Bar Chart":return`<ngx-radial-bar-chart
  [data]="data"
  [showLegend]="${n}"
  [height]="${e}"
  [strokeWidth]="${this.radialStrokeWidth()}"
  [ringGap]="${this.radialRingGap()}"
/>`;case"Candlestick Chart":return`<ngx-candlestick-chart
  [data]="data"
  [showGrid]="${s}"
  [showLabels]="${l}"
  [height]="${e}"
  bullishColor="${this.candlestickBullishColor()}"
  bearishColor="${this.candlestickBearishColor()}"
/>`;case"Polar Area Chart":return`<ngx-polar-area-chart
  [data]="data"
  [showLegend]="${n}"
  [showLabels]="${l}"
  [height]="${e}"
  [showExport]="true"
/>`;case"Bullet Chart":return`<ngx-bullet-chart
  [value]="${this.bulletValue()}"
  [target]="${this.bulletTarget()}"
  [max]="${this.bulletMax()}"
  [ranges]="[50, 85, 100]"
  [rangeColors]="['#fee2e2', '#fef3c7', '#dcfce7']"
  [valueColor]="'#10b981'"
  [targetColor]="'#ef4444'"
  [height]="40"
/>`;case"Dumbbell Chart":return`<ngx-dumbbell-chart
  [data]="data"
  [showLegend]="${n}"
  [showGrid]="${s}"
  [showLabels]="${l}"
  [height]="${e}"
/>`;case"Lollipop Chart":return`<ngx-lollipop-chart
  [data]="data"
  [showGrid]="${s}"
  [showLabels]="${l}"
  [height]="${e}"
/>`;case"Slope Chart":return`<ngx-slope-chart
  [data]="data"
  [showLabels]="${l}"
  [showValues]="${l}"
  [height]="${e}"
/>`;case"Sankey Chart":return`<ngx-sankey-chart
  [nodes]="nodes"
  [links]="links"
  [showLabels]="${l}"
  [showValues]="${l}"
  [height]="${e}"
/>`;case"Violin Plot":return`<ngx-violin-plot
  [data]="data"
  [showGrid]="${s}"
  [showLabels]="${l}"
  [height]="${e}"
/>`;case"Ridgeline Chart":return`<ngx-ridgeline-chart
  [data]="data"
  [showGrid]="${s}"
  [showLabels]="${l}"
  [height]="${e}"
/>`;case"Pareto Chart":return`<ngx-pareto-chart
  [data]="data"
  [showGrid]="${s}"
  [showLabels]="${l}"
  [height]="${e}"
/>`;case"Marimekko Chart":return`<ngx-marimekko-chart
  [data]="data"
  [showGrid]="${s}"
  [showLabels]="${l}"
  [height]="${e}"
/>`;case"Chord Diagram":return`<ngx-chord-diagram
  [matrix]="matrix"
  [labels]="labels"
  [showLabels]="${l}"
  [height]="${e}"
/>`;case"Dependency Wheel":return`<ngx-dependency-wheel
  [matrix]="matrix"
  [labels]="labels"
  [showLabels]="${l}"
  [height]="${e}"
/>`;case"Adjacency Matrix":return`<ngx-adjacency-matrix
  [matrix]="matrix"
  [labels]="labels"
  [showLabels]="${l}"
  [height]="${e}"
/>`;case"Biplot / PCA Plot":return`<ngx-biplot
  [points]="points"
  [vectors]="vectors"
  [showLabels]="${l}"
  [height]="${e}"
/>`;case"Renko Chart":return`<ngx-renko-chart
  [data]="data"
  [boxSize]="5"
  [height]="${e}"
/>`;case"Kagi Chart":return`<ngx-kagi-chart
  [data]="data"
  [reversalAmount]="15"
  [height]="${e}"
/>`;case"Point & Figure Chart":return`<ngx-point-figure-chart
  [data]="data"
  [boxSize]="4"
  [reversal]="3"
  [height]="${e}"
/>`;case"Wind Rose":return`<ngx-wind-rose
  [data]="data"
  [height]="${e}"
/>`;case"Token Streaming":return`<ngx-token-streaming-chart
  [title]="'Real-Time LLM Token Output Speed'"
  [windowSize]="50"
  [height]="${e}"
  [showExport]="true"
  (streamTick)="onTokenStreamTick($event)"
  (agentPromptRequest)="onAgentPromptRequest($event)"
/>`;case"Embedding Projection":return`<ngx-embedding-space-projection
  [data]="data"
  [width]="650"
  [height]="${e+80}"
  [showExport]="true"
  (lassoSelected)="onEmbeddingLassoSelected($event)"
  (agentQueryRequest)="onEmbeddingAgentQuery($event)"
/>`;case"Agent Cognitive Topology":return`<ngx-agentic-cognitive-topology
  [nodes]="nodes"
  [links]="links"
  [width]="650"
  [height]="${e+80}"
  [showExport]="true"
  (nodeActionClick)="onTopologyNodeAction($event)"
/>`;case"Attention Heatmap":return`<ngx-transformer-attention-heatmap
  [tokensX]="tokensX"
  [tokensY]="tokensY"
  [weights]="weights"
  [height]="${e+60}"
  [colors]="['#f8fafc', '#ec4899']"
  [showExport]="true"
  (cellClick)="onAttentionCellClick($event)"
  (agentQueryRequest)="onAttentionAgentQuery($event)"
/>`;case"Step Line Chart":return`<ngx-step-line-chart
  [series]="series"
  [categories]="categories"
  [showArea]="${this.showArea()}"
  [showMarkers]="${this.showMarkers()}"
  [showLegend]="${n}"
  [showGrid]="${s}"
  [showLabels]="${l}"
  [height]="${e}"
  [showExport]="true"
/>`;case"Calendar Heatmap":return`<ngx-calendar-heatmap
  [data]="data"
  [height]="${e}"
  [showExport]="true"
/>`;case"Nested Donut":return`<ngx-nested-donut-chart
  [rings]="rings"
  [showLegend]="${n}"
  [showLabels]="${l}"
  [height]="${e+60}"
  [showExport]="true"
  centerTitle="Total Sales"
  centerValue="$1.65M"
/>`;case"Pyramid Chart":return`<ngx-pyramid-chart
  [data]="data"
  [showLegend]="${n}"
  [showLabels]="${l}"
  [height]="${e+40}"
  [showExport]="true"
/>`;case"Range Bar":return`<ngx-range-bar-chart
  [data]="data"
  [showGrid]="${s}"
  [showLabels]="${l}"
  [height]="${e+40}"
  [showExport]="true"
/>`;case"Timeline Chart":return`<ngx-timeline-chart
  [events]="events"
  [showLegend]="${n}"
  [height]="${e+60}"
  [showExport]="true"
/>`;case"Org Chart":return`<ngx-org-chart
  [rootNode]="rootNode"
  [height]="${e+150}"
  [showExport]="true"
/>`;case"Multi-Needle Gauge":return`<ngx-multi-needle-gauge
  [needles]="needles"
  [thresholds]="thresholds"
  [height]="${e+40}"
  units="%"
  [showExport]="true"
  [showLegend]="${n}"
/>`;default:return""}}getTsTemplateString(){let o=this.activeTab(),e=this.getComponentClass(o),n=this.getExtraStateVariables(o);return`import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ${e} } from 'ngx-core-components/charts';

@Component({
  selector: 'app-chart-example',
  standalone: true,
  imports: [CommonModule, ${e}],
  template: \`
    ${this.getHtmlTemplateString().split(`
`).join(`
    `)}
  \`
})
export class ChartExampleComponent {
  data = ${this.getMockDataString(o).split(`
`).join(`
  `)};
  ${n?n.split(`
`).join(`
  `):""}
}`}getApiInputs(){switch(this.activeTab()){case"Bar Chart":return this.barInputs;case"Line Chart":return this.lineInputs;case"Pie / Donut":return this.pieInputs;case"Sparkline":return this.sparklineInputs;case"Gauge Chart":return this.gaugeInputs;case"Radar Chart":return this.radarInputs;case"Heatmap Chart":return this.heatmapInputs;case"Treemap Chart":return this.treemapInputs;case"Area Chart":return this.areaInputs;case"Funnel / Pyramid Chart":return this.funnelInputs;case"Combo Chart":return this.comboInputs;case"Scatter Plot":return this.scatterInputs;case"Bubble Chart":return this.bubbleInputs;case"Sunburst Chart":return this.sunburstInputs;case"Waterfall Chart":return this.waterfallInputs;case"Box Plot Chart":return this.boxPlotInputs;case"Radial Bar Chart":return this.radialInputs;case"Candlestick Chart":return this.candlestickInputs;case"Polar Area Chart":return this.polarAreaInputs;case"Bullet Chart":return this.bulletInputs;case"Dumbbell Chart":return this.dumbbellInputs;case"Lollipop Chart":return this.lollipopInputs;case"Slope Chart":return this.slopeInputs;case"Sankey Chart":return this.sankeyInputs;case"Violin Plot":return this.violinInputs;case"Ridgeline Chart":return this.ridgelineInputs;case"Pareto Chart":return this.paretoInputs;case"Marimekko Chart":return this.marimekkoInputs;case"Chord Diagram":return this.chordInputs;case"Dependency Wheel":return this.dependencyInputs;case"Adjacency Matrix":return this.matrixInputs;case"Biplot / PCA Plot":return this.biplotInputs;case"Renko Chart":return this.renkoInputs;case"Kagi Chart":return this.kagiInputs;case"Point & Figure Chart":return this.pfInputs;case"Wind Rose":return this.windRoseInputs;case"Step Line Chart":return this.lineInputs;case"Calendar Heatmap":return this.heatmapInputs;case"Nested Donut":return this.pieInputs;case"Pyramid Chart":return this.funnelInputs;case"Range Bar":return this.barInputs;case"Timeline Chart":return this.lineInputs;case"Org Chart":return this.treemapInputs;case"Multi-Needle Gauge":return this.gaugeInputs;default:return this.barInputs}}getComponentSourceCode(o){switch(o){case"Bar Chart":return ft;case"Line Chart":return vt;case"Pie / Donut":return Ct;case"Sparkline":return yt;case"Gauge Chart":return wt;case"Radar Chart":return kt;case"Heatmap Chart":return _t;case"Treemap Chart":return St;case"Area Chart":return Tt;case"Funnel / Pyramid Chart":return Pt;case"Combo Chart":return Mt;case"Scatter Plot":return Et;case"Bubble Chart":return Ot;case"Sunburst Chart":return $t;case"Waterfall Chart":return Lt;case"Box Plot Chart":return Dt;case"Radial Bar Chart":return Rt;case"Candlestick Chart":return At;case"Polar Area Chart":return It;case"Bullet Chart":return Vt;case"Dumbbell Chart":return Bt;case"Lollipop Chart":return Ht;case"Slope Chart":return Nt;case"Sankey Chart":return zt;case"Violin Plot":return Gt;case"Ridgeline Chart":return Wt;case"Pareto Chart":return Ft;case"Marimekko Chart":return jt;case"Chord Diagram":return Yt;case"Dependency Wheel":return Xt;case"Adjacency Matrix":return Jt;case"Biplot / PCA Plot":return qt;case"Renko Chart":return Ut;case"Kagi Chart":return Qt;case"Point & Figure Chart":return Kt;case"Wind Rose":return Zt;default:return""}}getComponentClass(o){switch(o){case"Bar Chart":return"BarChartComponent";case"Line Chart":return"LineChartComponent";case"Pie / Donut":return"PieChartComponent";case"Sparkline":return"SparklineComponent";case"Gauge Chart":return"GaugeChartComponent";case"Radar Chart":return"RadarChartComponent";case"Heatmap Chart":return"HeatmapChartComponent";case"Treemap Chart":return"TreemapChartComponent";case"Area Chart":return"AreaChartComponent";case"Funnel / Pyramid Chart":return"FunnelChartComponent";case"Combo Chart":return"ComboChartComponent";case"Scatter Plot":return"ScatterPlotComponent";case"Bubble Chart":return"BubbleChartComponent";case"Sunburst Chart":return"SunburstChartComponent";case"Waterfall Chart":return"WaterfallChartComponent";case"Box Plot Chart":return"BoxPlotChartComponent";case"Radial Bar Chart":return"RadialBarChartComponent";case"Candlestick Chart":return"CandlestickChartComponent";case"Polar Area Chart":return"PolarAreaChartComponent";case"Bullet Chart":return"BulletChartComponent";case"Dumbbell Chart":return"DumbbellChartComponent";case"Lollipop Chart":return"LollipopChartComponent";case"Slope Chart":return"SlopeChartComponent";case"Sankey Chart":return"SankeyChartComponent";case"Violin Plot":return"ViolinPlotComponent";case"Ridgeline Chart":return"RidgelineChartComponent";case"Pareto Chart":return"ParetoChartComponent";case"Marimekko Chart":return"MarimekkoChartComponent";case"Chord Diagram":return"ChordDiagramComponent";case"Dependency Wheel":return"DependencyWheelComponent";case"Adjacency Matrix":return"AdjacencyMatrixComponent";case"Biplot / PCA Plot":return"BiplotComponent";case"Renko Chart":return"RenkoChartComponent";case"Kagi Chart":return"KagiChartComponent";case"Point & Figure Chart":return"PointFigureChartComponent";case"Wind Rose":return"WindRoseChartComponent";case"Token Streaming":return"TokenStreamingChartComponent";case"Embedding Projection":return"EmbeddingSpaceProjectionComponent";case"Agent Cognitive Topology":return"AgenticCognitiveTopologyComponent";case"Attention Heatmap":return"TransformerAttentionHeatmapComponent";default:return""}}getPlaygroundTemplate(o){let e=this.showLegend(),n=this.showGrid(),s=this.showLabels(),l=this.chartHeight();switch(o){case"Bar Chart":return`<ngx-bar-chart [series]="data" [categories]="['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']" [showLegend]="${e}" [showGrid]="${n}" [showLabels]="${s}" [height]="${l}"></ngx-bar-chart>`;case"Line Chart":return`<ngx-line-chart [series]="data" [categories]="['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']" [showArea]="${this.showArea()}" [showMarkers]="${this.showMarkers()}" [showLegend]="${e}" [height]="${l}"></ngx-line-chart>`;case"Area Chart":return`<ngx-area-chart [series]="data" [categories]="['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']" [showMarkers]="${this.showMarkers()}" [showLegend]="${e}" [showGrid]="${n}" [height]="${l}"></ngx-area-chart>`;case"Pie / Donut":return`<ngx-pie-chart [data]="data" mode="${this.pieMode()}" centerTitle="${this.donutTitle()}" centerValue="${this.donutValue()}" [donutHoleSize]="${this.donutHoleSize()}" [showLegend]="${e}" [showLabels]="${s}" [height]="${l}"></ngx-pie-chart>`;case"Sparkline":return`<ngx-sparkline [data]="data" type="${this.sparklineType()}" color="${this.sparklineColor()}" [width]="140" [height]="36"></ngx-sparkline>`;case"Gauge Chart":return`<ngx-gauge-chart [value]="${this.gaugeValue()}" [min]="0" [max]="100" label="${this.gaugeLabel()}" type="${this.gaugeType()}" [showNeedle]="${this.showGaugeNeedle()}" [thresholds]="thresholds"></ngx-gauge-chart>`;case"Radar Chart":return`<ngx-radar-chart [seriesData]="data" [categories]="['Speed', 'Agility', 'Strength', 'Stamina', 'Skill', 'Tactics']" [max]="100"></ngx-radar-chart>`;case"Heatmap Chart":return`<ngx-heatmap-chart [data]="data" [xAxisLabels]="['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']" [yAxisLabels]="['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5']"></ngx-heatmap-chart>`;case"Treemap Chart":return'<ngx-treemap-chart [data]="data"></ngx-treemap-chart>';case"Funnel / Pyramid Chart":return`<ngx-funnel-chart [data]="data" mode="${this.funnelMode()}"></ngx-funnel-chart>`;case"Combo Chart":return`<ngx-combo-chart [barSeries]="barSeries" [lineSeries]="lineSeries" [categories]="['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']" barYTitle="Sales" lineYTitle="Margin" [showLegend]="${e}" [showGrid]="${n}" [height]="${l}"></ngx-combo-chart>`;case"Scatter Plot":return`<ngx-scatter-plot [data]="data" xTitle="Unit Price" yTitle="Units Sold" [showLegend]="${e}" [showGrid]="${n}" [height]="${l}"></ngx-scatter-plot>`;case"Bubble Chart":return`<ngx-bubble-chart [data]="data" xTitle="R&D Spend" yTitle="Market Share" zTitle="Revenue" [showLegend]="${e}" [showGrid]="${n}" [showLabels]="${s}" [height]="${l}"></ngx-bubble-chart>`;case"Sunburst Chart":return`<ngx-sunburst-chart [data]="data" [showLegend]="${e}" [showLabels]="${s}" [height]="${l}"></ngx-sunburst-chart>`;case"Waterfall Chart":return`<ngx-waterfall-chart [data]="data" [showGrid]="${n}" [showLabels]="${s}" [height]="${l}" positiveColor="${this.waterfallPositiveColor()}" negativeColor="${this.waterfallNegativeColor()}" totalColor="${this.waterfallTotalColor()}"></ngx-waterfall-chart>`;case"Box Plot Chart":return`<ngx-box-plot-chart [data]="data" [showGrid]="${n}" [showLabels]="${s}" [height]="${l}" color="${this.boxPlotColor()}" fillColor="${this.boxPlotFillColor()}" outlierColor="${this.boxPlotOutlierColor()}"></ngx-box-plot-chart>`;case"Radial Bar Chart":return`<ngx-radial-bar-chart [data]="data" [showLegend]="${e}" [height]="${l}" [strokeWidth]="${this.radialStrokeWidth()}" [ringGap]="${this.radialRingGap()}"></ngx-radial-bar-chart>`;case"Candlestick Chart":return`<ngx-candlestick-chart [data]="data" [showGrid]="${n}" [showLabels]="${s}" [height]="${l}" bullishColor="${this.candlestickBullishColor()}" bearishColor="${this.candlestickBearishColor()}"></ngx-candlestick-chart>`;case"Polar Area Chart":return`<ngx-polar-area-chart [data]="data" [showLegend]="${e}" [showLabels]="${s}" [height]="${l}"></ngx-polar-area-chart>`;case"Bullet Chart":return`<ngx-bullet-chart [value]="${this.bulletValue()}" [target]="${this.bulletTarget()}" [max]="${this.bulletMax()}" [ranges]="[50, 85, 100]" [rangeColors]="['#fee2e2', '#fef3c7', '#dcfce7']" [valueColor]="'#10b981'" [targetColor]="'#ef4444'" [height]="40"></ngx-bullet-chart>`;case"Dumbbell Chart":return`<ngx-dumbbell-chart [data]="data" [showLegend]="${e}" [showGrid]="${n}" [showLabels]="${s}" [height]="${l}"></ngx-dumbbell-chart>`;case"Lollipop Chart":return`<ngx-lollipop-chart [data]="data" [showGrid]="${n}" [showLabels]="${s}" [height]="${l}"></ngx-lollipop-chart>`;case"Slope Chart":return`<ngx-slope-chart [data]="data" [showLabels]="${s}" [showValues]="${s}" [height]="${l}"></ngx-slope-chart>`;case"Sankey Chart":return`<ngx-sankey-chart [nodes]="nodes" [links]="links" [showLabels]="${s}" [showValues]="${s}" [height]="${l}"></ngx-sankey-chart>`;case"Violin Plot":return`<ngx-violin-plot [data]="data" [showGrid]="${n}" [showLabels]="${s}" [height]="${l}"></ngx-violin-plot>`;case"Ridgeline Chart":return`<ngx-ridgeline-chart [data]="data" [showGrid]="${n}" [showLabels]="${s}" [height]="${l}"></ngx-ridgeline-chart>`;case"Pareto Chart":return`<ngx-pareto-chart [data]="data" [showGrid]="${n}" [showLabels]="${s}" [height]="${l}"></ngx-pareto-chart>`;case"Marimekko Chart":return`<ngx-marimekko-chart [data]="data" [showGrid]="${n}" [showLabels]="${s}" [height]="${l}"></ngx-marimekko-chart>`;case"Chord Diagram":return`<ngx-chord-diagram [matrix]="matrix" [labels]="labels" [showLabels]="${s}" [height]="${l}"></ngx-chord-diagram>`;case"Dependency Wheel":return`<ngx-dependency-wheel [matrix]="matrix" [labels]="labels" [showLabels]="${s}" [height]="${l}"></ngx-dependency-wheel>`;case"Adjacency Matrix":return`<ngx-adjacency-matrix [matrix]="matrix" [labels]="labels" [showLabels]="${s}" [height]="${l}"></ngx-adjacency-matrix>`;case"Biplot / PCA Plot":return`<ngx-biplot [points]="points" [vectors]="vectors" [showLabels]="${s}" [height]="${l}"></ngx-biplot>`;case"Renko Chart":return`<ngx-renko-chart
  [data]="data"
  [boxSize]="5"
  [height]="${l}"
  [showGrid]="${n}"
  [showExport]="true"${this.useCustomFormatter()?`
  [labelFormatter]="labelFormatter"`:""}${this.useCustomTooltip()?`
  [tooltipTemplate]="customTooltip"`:""}>
</ngx-renko-chart>`;case"Kagi Chart":return`<ngx-kagi-chart
  [data]="data"
  [reversalAmount]="15"
  [height]="${l}"
  [showGrid]="${n}"
  [showExport]="true"${this.useCustomFormatter()?`
  [labelFormatter]="labelFormatter"`:""}${this.useCustomTooltip()?`
  [tooltipTemplate]="customTooltip"`:""}>
</ngx-kagi-chart>`;case"Point & Figure Chart":return`<ngx-point-figure-chart
  [data]="data"
  [boxSize]="4"
  [reversal]="3"
  [height]="${l}"
  [showGrid]="${n}"
  [showExport]="true"${this.useCustomFormatter()?`
  [labelFormatter]="labelFormatter"`:""}${this.useCustomTooltip()?`
  [tooltipTemplate]="customTooltip"`:""}>
</ngx-point-figure-chart>`;case"Wind Rose":return`<ngx-wind-rose
  [data]="data"
  [height]="${l}"
  [colors]="colors"
  [showExport]="true"${this.useCustomFormatter()?`
  [labelFormatter]="labelFormatter"`:""}${this.useCustomTooltip()?`
  [tooltipTemplate]="customTooltip"`:""}>
</ngx-wind-rose>`;case"Token Streaming":return`<ngx-token-streaming-chart
  [title]="'Real-Time LLM Token Output Speed'"
  [windowSize]="50"
  [height]="${l}"
  [colors]="colors"
  [showExport]="true"
  (streamTick)="onTokenStreamTick($event)"
  (agentPromptRequest)="onAgentPromptRequest($event)">
</ngx-token-streaming-chart>`;case"Embedding Projection":return`<ngx-embedding-space-projection
  [data]="data"
  [width]="650"
  [height]="${l+80}"
  [colors]="colors"
  [showExport]="true"
  (lassoSelected)="onEmbeddingLassoSelected($event)"
  (agentQueryRequest)="onEmbeddingAgentQuery($event)">
</ngx-embedding-space-projection>`;case"Agent Cognitive Topology":return`<ngx-agentic-cognitive-topology
  [nodes]="nodes"
  [links]="links"
  [width]="650"
  [height]="${l+80}"
  [colors]="colors"
  [showExport]="true"
  (nodeActionClick)="onTopologyNodeAction($event)">
</ngx-agentic-cognitive-topology>`;case"Attention Heatmap":return`<ngx-transformer-attention-heatmap
  [tokensX]="tokensX"
  [tokensY]="tokensY"
  [weights]="weights"
  [height]="${l+60}"
  [colors]="['#f8fafc', '#ec4899']"
  [showExport]="true"
  (cellClick)="onAttentionCellClick($event)"
  (agentQueryRequest)="onAttentionAgentQuery($event)">
</ngx-transformer-attention-heatmap>`;default:return""}}getExtraStateVariables(o){let e="";if(o==="Bar Chart"||o==="Line Chart")return this.showRefLinesToggle()&&(o==="Bar Chart"?e+=`referenceLines = [
    { value: 75, label: 'Target', color: '#10b981', strokeDasharray: '4,4' },
    { value: 45, label: 'Warning', color: '#f59e0b', strokeDasharray: '2,2' }
  ];
  `:e+=`referenceLines = [
    { value: 300, label: 'Target Users', color: '#818cf8', strokeDasharray: '3,3' },
    { value: 150, label: 'Min SLA', color: '#ef4444', strokeDasharray: '5,5' }
  ];
  `),this.useCustomFormatter()&&(o==="Bar Chart"?e+=`labelFormatter = (v: number) => '$' + v + 'M';
  `:e+=`labelFormatter = (v: number) => v + ' active';
  `),o==="Bar Chart"?e+=`onBarClick(event: any) {
    console.log('Bar clicked:', event);
  }
  `:e+=`onPointClick(event: any) {
    console.log('Point clicked:', event);
  }
  `,e.trim();if(o==="Gauge Chart")return`thresholds = [
    { value: 40, color: '#10b981' },
    { value: 75, color: '#f59e0b' },
    { value: 100, color: '#ef4444' }
  ];`;if(o==="Combo Chart")return`barSeries = [{ name: 'Sales Volume', data: [450, 620, 580, 810, 940, 880] }];
  lineSeries = [{ name: 'Gross Margin %', data: [28, 32, 30, 35, 38, 36] }];`;if(o==="Sankey Chart")return`nodes = ${JSON.stringify(this.sankeyNodes,null,2)};
  links = ${JSON.stringify(this.sankeyLinks,null,2)};`;if(o==="Chord Diagram"||o==="Dependency Wheel"||o==="Adjacency Matrix")return`matrix = ${JSON.stringify(this.chordMatrix,null,2)};
  labels = ${JSON.stringify(this.chordLabels,null,2)};`;if(o==="Biplot / PCA Plot")return`points = ${JSON.stringify(this.biplotPoints,null,2)};
  vectors = ${JSON.stringify(this.biplotVectors,null,2)};`;if(o==="Renko Chart"||o==="Kagi Chart"||o==="Point & Figure Chart"){let n="";return this.useCustomFormatter()&&(n="labelFormatter = (v: number) => '$' + v.toFixed(1);"),n}if(o==="Wind Rose"){let n="";return this.useCustomFormatter()&&(n="labelFormatter = (v: number) => v.toFixed(1) + '%';"),n}return""}getPlaygroundTooltipTemplate(o){if(!this.useCustomTooltip())return"";switch(o){case"Renko Chart":return`
      <ng-template #customTooltip let-t>
        <div style="background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(8px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px; color: #ffffff; font-size: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.15);">
          <div style="font-weight: bold; margin-bottom: 4px; color: #38bdf8;">Renko Brick Details</div>
          <div>Type: <span [style.color]="t.type === 'bullish' ? '#10b981' : '#ef4444'">\\{{ t.type }}</span></div>
          <div>Open: $\\{{ t.open.toFixed(1) }}</div>
          <div>Close: $\\{{ t.close.toFixed(1) }}</div>
        </div>
      </ng-template>`;case"Kagi Chart":return`
      <ng-template #customTooltip let-t>
        <div style="background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(8px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px; color: #ffffff; font-size: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.15);">
          <div style="font-weight: bold; margin-bottom: 4px; color: #38bdf8;">Kagi Segment Details</div>
          <div>Trend: <span [style.color]="t.trend === 'bullish' ? '#10b981' : '#ef4444'">\\{{ t.trend }}</span></div>
          @if (t.type === 'vertical') {
            <div>From: $\\{{ t.val1.toFixed(1) }}</div>
            <div>To: $\\{{ t.val2.toFixed(1) }}</div>
          } @else {
            <div>Reversal: $\\{{ t.val1.toFixed(1) }}</div>
          }
        </div>
      </ng-template>`;case"Point & Figure Chart":return`
      <ng-template #customTooltip let-t>
        <div style="background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(8px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px; color: #ffffff; font-size: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.15);">
          <div style="font-weight: bold; margin-bottom: 4px; color: #38bdf8;">P&F Cell Details</div>
          <div>Type: <span [style.color]="t.type === 'X' ? '#10b981' : '#ef4444'">\\{{ t.type === 'X' ? 'Rise (X)' : 'Fall (O)' }}</span></div>
          <div>Level: $\\{{ t.value.toFixed(1) }}</div>
          <div>Column: #\\{{ t.colIdx + 1 }}</div>
        </div>
      </ng-template>`;case"Wind Rose":return`
      <ng-template #customTooltip let-t>
        <div style="background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(8px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px; color: #ffffff; font-size: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.15);">
          <div style="font-weight: bold; margin-bottom: 4px; color: #38bdf8;">\\{{ t.direction }} Sector</div>
          <div>Bin: \\{{ t.binLabel }}</div>
          <div>Value: \\{{ t.value.toFixed(1) }}%</div>
          <div>Cumulative: \\{{ t.cumValue.toFixed(1) }}%</div>
        </div>
      </ng-template>`;default:return`
      <ng-template #customTooltip let-t>
        <div style="background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(8px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px; color: #ffffff; font-size: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.15);">
          <div style="font-weight: bold; margin-bottom: 4px; color: #38bdf8;">\\{{ t.cat || 'Details' }}</div>
          @for (row of t.rows; track $index) {
            <div style="display: flex; align-items: center; gap: 6px; margin: 2px 0;">
              <span [style.background]="row.color" style="width: 8px; height: 8px; border-radius: 50%; display: inline-block;"></span>
              <span>\\{{ row.name }}:</span>
              <span style="font-weight: bold;">\\{{ row.value }}</span>
            </div>
          }
        </div>
      </ng-template>`}}getMockDataString(o){switch(o){case"Bar Chart":return JSON.stringify(this.barSeries,null,2);case"Line Chart":return JSON.stringify(this.lineSeries,null,2);case"Area Chart":return JSON.stringify(this.lineSeries,null,2);case"Pie / Donut":return JSON.stringify(this.pieData,null,2);case"Sparkline":return JSON.stringify([120,145,130,168,190,176,210],null,2);case"Gauge Chart":return"65";case"Radar Chart":return JSON.stringify(this.radarSeries,null,2);case"Heatmap Chart":return JSON.stringify(this.heatmapData(),null,2);case"Treemap Chart":return JSON.stringify(this.treemapData(),null,2);case"Funnel / Pyramid Chart":return JSON.stringify(this.funnelData(),null,2);case"Combo Chart":return"[]";case"Scatter Plot":return JSON.stringify(this.scatterData,null,2);case"Bubble Chart":return JSON.stringify(this.bubbleData(),null,2);case"Sunburst Chart":return JSON.stringify(this.sunburstData(),null,2);case"Waterfall Chart":return JSON.stringify(this.waterfallData,null,2);case"Box Plot Chart":return JSON.stringify(this.boxPlotData,null,2);case"Radial Bar Chart":return JSON.stringify(this.radialData,null,2);case"Candlestick Chart":return JSON.stringify(this.candlestickData,null,2);case"Polar Area Chart":return JSON.stringify(this.pieData,null,2);case"Bullet Chart":return"70";case"Dumbbell Chart":return JSON.stringify(this.dumbbellData,null,2);case"Lollipop Chart":return JSON.stringify(this.lollipopData,null,2);case"Slope Chart":return JSON.stringify(this.slopeData,null,2);case"Sankey Chart":return"[]";case"Violin Plot":return JSON.stringify(this.violinData,null,2);case"Ridgeline Chart":return JSON.stringify(this.ridgelineData,null,2);case"Pareto Chart":return JSON.stringify(this.paretoData,null,2);case"Marimekko Chart":return JSON.stringify(this.marimekkoData,null,2);case"Chord Diagram":return"[]";case"Dependency Wheel":return"[]";case"Adjacency Matrix":return"[]";case"Biplot / PCA Plot":return"[]";case"Renko Chart":return JSON.stringify(this.financialPrices,null,2);case"Kagi Chart":return JSON.stringify(this.financialPrices,null,2);case"Point & Figure Chart":return JSON.stringify(this.financialPrices,null,2);case"Wind Rose":return JSON.stringify(this.windRoseData,null,2);case"Area Range":return JSON.stringify(this.areaRangeData,null,2);case"Network Graph":return JSON.stringify(this.networkNodes,null,2);case"Treegraph":return JSON.stringify(this.treegraphData,null,2);case"Map Choropleth":return JSON.stringify(this.choroplethData,null,2);case"Flowmap":return JSON.stringify({nodes:this.flowmapNodes,flows:this.flowmapLinks},null,2);case"Venn Diagram":return JSON.stringify({sets:["Mobile","Web","Desktop"],sizes:{A:120,B:150,C:90,"A&B":45,"B&C":35,"A&C":20,"A&B&C":12}},null,2);case"Word Cloud":return JSON.stringify(this.wordCloudItems,null,2);case"Bell Curve":return JSON.stringify(this.bellCurveData,null,2);case"Histogram":return JSON.stringify(this.histogramData,null,2);case"Flags":return JSON.stringify(this.flagsData,null,2);case"Area Spline Range":return JSON.stringify(this.areaSplineRangeData,null,2);case"Streamgraph":return JSON.stringify(this.streamgraphSeries,null,2);case"Column Range":return JSON.stringify(this.columnRangeData,null,2);case"Column Pyramid":return JSON.stringify(this.columnPyramidSeries,null,2);case"Variwide":return JSON.stringify(this.variwideData,null,2);case"Variable Pie":return JSON.stringify(this.variablePieData,null,2);case"Packed Bubble":return JSON.stringify(this.packedBubbleData,null,2);case"Arc Diagram":return JSON.stringify({nodes:this.arcNodes,links:this.arcLinks},null,2);case"Error Bar":return JSON.stringify(this.errorBarData,null,2);case"Tilemap":return JSON.stringify(this.tilemapData,null,2);case"Token Streaming":return JSON.stringify(this.tokenStreamChart()?.points()||[],null,2);case"Embedding Projection":return JSON.stringify(this.embeddingProjectionData,null,2);case"Agent Cognitive Topology":return JSON.stringify({nodes:this.topologyNodes,links:this.topologyLinks},null,2);case"Attention Heatmap":return JSON.stringify({tokensX:this.attentionTokensX,tokensY:this.attentionTokensY,weights:this.attentionWeights},null,2);default:return"[]"}}editInStackBlitz(){let o=this.activeTab(),e={"src/index.html":`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Angular Chart Demo</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin: 0; background-color: #f8fafc;">
  <app-root></app-root>
</body>
</html>`,"src/main.ts":`import { bootstrapApplication } from '@angular/platform-browser';
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ${this.getComponentClass(o)} } from 'ngx-core-components';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ${this.getComponentClass(o)}],
  template: \`
    <div style="padding: 32px; font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto;">
      <h2 style="color: #0f172a; margin-bottom: 4px; font-weight: 800;">${o} Sandbox</h2>
      <p style="color: #64748b; font-size: 14px; margin-top: 0; margin-bottom: 24px;">
        Bootstrap 5 inspired, zero-dependency SVG component compiled standalone.
      </p>
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
        ${this.getPlaygroundTemplate(o)}
      </div>
      ${this.getPlaygroundTooltipTemplate(o)}
    </div>
  \`
})
export class App {
  chartType = '${o}';
  data = ${this.getMockDataString(o)};
  ${this.getExtraStateVariables(o)}
}

bootstrapApplication(App).catch(err => console.error(err));`,"src/styles.css":"/* Global styles */","angular.json":JSON.stringify({$schema:"./node_modules/@angular/cli/lib/config/schema.json",version:1,newProjectRoot:"projects",projects:{demo:{projectType:"application",root:"",sourceRoot:"src",prefix:"app",architect:{build:{builder:"@angular-devkit/build-angular:application",options:{outputPath:"dist/demo",index:"src/index.html",browser:"src/main.ts",polyfills:["zone.js"],tsConfig:"tsconfig.app.json",styles:["src/styles.css"]},configurations:{production:{optimization:!0,outputHashing:"all",sourceMap:!1},development:{optimization:!1,sourceMap:!0}},defaultConfiguration:"development"},serve:{builder:"@angular-devkit/build-angular:dev-server",configurations:{production:{buildTarget:"demo:build:production"},development:{buildTarget:"demo:build:development"}},defaultConfiguration:"development"}}}}},null,2),"package.json":JSON.stringify({name:`ngx-chart-${o.toLowerCase().replace(/[^a-z0-9]+/g,"-")}-demo`,version:"1.0.0",private:!0,scripts:{start:"ng serve"},dependencies:{"@angular/common":"^19.2.0","@angular/compiler":"^19.2.0","@angular/core":"^19.2.0","@angular/forms":"^19.2.0","@angular/platform-browser":"^19.2.0","@angular/platform-browser-dynamic":"^19.2.0","@angular/router":"^19.2.0","ngx-core-components":"^0.3.20",rxjs:"~7.8.0","zone.js":"~0.15.0",tslib:"^2.3.0"},devDependencies:{"@angular-devkit/build-angular":"^19.2.23","@angular/cli":"^19.2.23","@angular/compiler-cli":"^19.2.0",typescript:"~5.7.2"},stackblitz:{startCommand:"npm start"}},null,2),"tsconfig.json":JSON.stringify({compileOnSave:!1,compilerOptions:{target:"ES2022",module:"ES2022",moduleResolution:"bundler",esModuleInterop:!0,experimentalDecorators:!0,skipLibCheck:!0,allowSyntheticDefaultImports:!0,baseUrl:"./"}},null,2),"tsconfig.app.json":JSON.stringify({extends:"./tsconfig.json",compilerOptions:{outDir:"./out-tsc/app",types:[]},files:["src/main.ts"],include:["src/**/*.ts","src/**/*.d.ts"]},null,2)},n=document.createElement("form");n.method="POST",n.action="https://stackblitz.com/run",n.target="_blank";let s={"@angular/common":"^19.2.0","@angular/compiler":"^19.2.0","@angular/core":"^19.2.0","@angular/forms":"^19.2.0","@angular/platform-browser":"^19.2.0","@angular/platform-browser-dynamic":"^19.2.0","@angular/router":"^19.2.0","ngx-core-components":"0.3.20",rxjs:"~7.8.0","zone.js":"~0.15.0",tslib:"^2.3.0"},l={title:`${o} Standalone Sandbox`,description:`Programmatic showcase of ${o} from ngx-core-components library.`,tags:"angular,svg,charting,enterprise",template:"node",dependencies:JSON.stringify(s)};for(let[y,P]of Object.entries(l)){let C=document.createElement("input");C.type="hidden",C.name=`project[${y}]`,C.value=P,n.appendChild(C)}for(let[y,P]of Object.entries(e)){let C=document.createElement("input");C.type="hidden",C.name=`project[files][${y}]`,C.value=P,n.appendChild(C)}document.body.appendChild(n),n.submit(),document.body.removeChild(n)}editInCodeSandbox(){let o=this.activeTab(),e={"src/index.html":{content:`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Angular Chart Demo</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin: 0; background-color: #f8fafc;">
  <app-root></app-root>
</body>
</html>`},"src/main.ts":{content:`import { bootstrapApplication } from '@angular/platform-browser';
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ${this.getComponentClass(o)} } from 'ngx-core-components';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ${this.getComponentClass(o)}],
  template: \`
    <div style="padding: 32px; font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto;">
      <h2 style="color: #0f172a; margin-bottom: 4px; font-weight: 800;">${o} Sandbox</h2>
      <p style="color: #64748b; font-size: 14px; margin-top: 0; margin-bottom: 24px;">
        Bootstrap 5 inspired, zero-dependency SVG component compiled standalone.
      </p>
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
        ${this.getPlaygroundTemplate(o)}
      </div>
      ${this.getPlaygroundTooltipTemplate(o)}
    </div>
  \`
})
export class App {
  chartType = '${o}';
  data = ${this.getMockDataString(o)};
  ${this.getExtraStateVariables(o)}
}

bootstrapApplication(App).catch(err => console.error(err));`},"src/styles.css":{content:"/* Global styles */"},"angular.json":{content:JSON.stringify({$schema:"./node_modules/@angular/cli/lib/config/schema.json",version:1,newProjectRoot:"projects",projects:{demo:{projectType:"application",root:"",sourceRoot:"src",prefix:"app",architect:{build:{builder:"@angular-devkit/build-angular:application",options:{outputPath:"dist/demo",index:"src/index.html",browser:"src/main.ts",polyfills:["zone.js"],tsConfig:"tsconfig.app.json",styles:["src/styles.css"]},configurations:{production:{optimization:!0,outputHashing:"all",sourceMap:!1},development:{optimization:!1,sourceMap:!0}},defaultConfiguration:"development"},serve:{builder:"@angular-devkit/build-angular:dev-server",configurations:{production:{buildTarget:"demo:build:production"},development:{buildTarget:"demo:build:development"}},defaultConfiguration:"development"}}}}},null,2)},"package.json":{content:JSON.stringify({name:`ngx-chart-${o.toLowerCase().replace(/[^a-z0-9]+/g,"-")}-demo`,version:"1.0.0",private:!0,scripts:{start:"ng serve"},dependencies:{"@angular/common":"^19.2.0","@angular/compiler":"^19.2.0","@angular/core":"^19.2.0","@angular/forms":"^19.2.0","@angular/platform-browser":"^19.2.0","@angular/platform-browser-dynamic":"^19.2.0","@angular/router":"^19.2.0","ngx-core-components":"0.3.20",rxjs:"~7.8.0","zone.js":"~0.15.0",tslib:"^2.3.0"},devDependencies:{"@angular-devkit/build-angular":"^19.2.23","@angular/cli":"^19.2.23","@angular/compiler-cli":"^19.2.0",typescript:"~5.7.2"}},null,2)},"tsconfig.json":{content:JSON.stringify({compileOnSave:!1,compilerOptions:{target:"ES2022",module:"ES2022",moduleResolution:"bundler",esModuleInterop:!0,experimentalDecorators:!0,skipLibCheck:!0,allowSyntheticDefaultImports:!0,baseUrl:"./"}},null,2)},"tsconfig.app.json":{content:JSON.stringify({extends:"./tsconfig.json",compilerOptions:{outDir:"./out-tsc/app",types:[]},files:["src/main.ts"],include:["src/**/*.ts","src/**/*.d.ts"]},null,2)}};new Promise((s,l)=>{if(window.LZString){s(window.LZString);return}let y=document.createElement("script");y.src="https://cdnjs.cloudflare.com/ajax/libs/lz-string/1.5.0/lz-string.min.js",y.onload=()=>s(window.LZString),y.onerror=P=>l(P),document.head.appendChild(y)}).then(s=>{let y=JSON.stringify({files:e,template:"node"}),P=s.compressToBase64(y).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,""),C=document.createElement("form");C.method="POST",C.action="https://codesandbox.io/api/v1/sandboxes/define",C.target="_blank";let L=document.createElement("input");L.type="hidden",L.name="parameters",L.value=P,C.appendChild(L),document.body.appendChild(C),C.submit(),document.body.removeChild(C)}).catch(s=>{console.error("Failed to load LZ-String compression library from CDN:",s)})}Number(o){return Number(o)}barInputs=[{name:"series",type:"ChartSeries[]",default:"[]",description:"Array of data series. Each series has a name and an array of numeric values."},{name:"categories",type:"string[]",default:"[]",description:"Category labels for the X axis."},{name:"showLabels",type:"boolean",default:"false",description:"Show value label on top of each bar."},{name:"showGrid",type:"boolean",default:"true",description:"Show horizontal grid lines in the chart area."},{name:"showLegend",type:"boolean",default:"true",description:"Show a color-coded legend below the chart."},{name:"colors",type:"string[]",default:"CHART_COLORS",description:"Custom color palette."},{name:"height",type:"number",default:"260",description:"Chart height in pixels."},{name:"referenceLines",type:"ReferenceLine[]",default:"[]",description:"Enterprise feature: Draw horizontal helper lines with text annotations."},{name:"labelFormatter",type:"(v: number) => string",default:"undefined",description:"Enterprise feature: Callback function to format data labels."},{name:"tooltipTemplate",type:"TemplateRef<any>",default:"null",description:"Enterprise feature: Custom projected template for custom HTML tooltips."},{name:"barClick",type:"OutputEmitter",default:"-",description:"Enterprise feature: Output fired when a bar rect element is clicked."}];lineInputs=[{name:"series",type:"ChartSeries[]",default:"[]",description:"Array of data series. Each has a name and numeric data[] array."},{name:"categories",type:"string[]",default:"[]",description:"X-axis category labels."},{name:"showArea",type:"boolean",default:"false",description:"Fill the area under each line with a translucent color."},{name:"showMarkers",type:"boolean",default:"true",description:"Show circular data point markers on the lines."},{name:"showGrid",type:"boolean",default:"true",description:"Show horizontal grid lines."},{name:"showLegend",type:"boolean",default:"true",description:"Show series legend below the chart."},{name:"colors",type:"string[]",default:"CHART_COLORS",description:"Custom color palette."},{name:"height",type:"number",default:"300",description:"Chart height in pixels."},{name:"showLabels",type:"boolean",default:"false",description:"Show value labels above the line markers."},{name:"referenceLines",type:"ReferenceLine[]",default:"[]",description:"Enterprise feature: Draw horizontal helper lines with text annotations."},{name:"labelFormatter",type:"(v: number) => string",default:"undefined",description:"Enterprise feature: Callback function to format data labels."},{name:"tooltipTemplate",type:"TemplateRef<any>",default:"null",description:"Enterprise feature: Custom projected template for custom HTML tooltips."},{name:"pointClick",type:"OutputEmitter",default:"-",description:"Enterprise feature: Output fired when a line point marker is clicked."}];areaInputs=[{name:"series",type:"ChartSeries[]",default:"[]",description:"Array of data series, each containing name and numeric data array."},{name:"categories",type:"string[]",default:"[]",description:"X-axis category labels."},{name:"height",type:"number",default:"260",description:"Height of the chart in pixels."},{name:"showGrid",type:"boolean",default:"true",description:"Show background grid lines."},{name:"showMarkers",type:"boolean",default:"true",description:"Show dots/markers on data coordinate points."},{name:"showLegend",type:"boolean",default:"true",description:"Show series legend panel above the chart."},{name:"colors",type:"string[]",default:"CHART_COLORS",description:"List of colors to cycle through for series lines."}];pieInputs=[{name:"data",type:"ChartDataPoint[]",default:"[]",description:"Array of { label, value } data points for each slice."},{name:"mode",type:"'pie' | 'donut'",default:"'pie'",description:"Rendering mode. 'donut' cuts a hole in the center."},{name:"donutHoleSize",type:"number",default:"0.55",description:"Fraction (0\u20131) of the radius that is cut out in donut mode."},{name:"centerTitle",type:"string",default:"''",description:"Text displayed in the center hole (donut mode only)."},{name:"centerValue",type:"string",default:"''",description:"Center subtext/value displayed (donut mode only)."},{name:"showLabels",type:"boolean",default:"true",description:"Show percentage labels on each slice."},{name:"showLegend",type:"boolean",default:"true",description:"Show the color-coded legend."},{name:"colors",type:"string[]",default:"CHART_COLORS",description:"Custom color palette. One color per slice."},{name:"height",type:"number",default:"300",description:"Chart height in pixels."}];comboInputs=[{name:"barSeries",type:"ChartSeries[]",default:"[]",description:"Array of series data represented as bars (Left Y-Axis)."},{name:"lineSeries",type:"ChartSeries[]",default:"[]",description:"Array of series data represented as lines (Right Y-Axis)."},{name:"categories",type:"string[]",default:"[]",description:"Category labels for the X-axis."},{name:"barYTitle",type:"string",default:"'Volume'",description:"Title label for the Left Y-axis."},{name:"lineYTitle",type:"string",default:"'Percentage'",description:"Title label for the Right Y-axis."},{name:"showLegend",type:"boolean",default:"true",description:"Show the color-coded chart legend."},{name:"showGrid",type:"boolean",default:"true",description:"Show horizontal background grid lines."},{name:"height",type:"number",default:"300",description:"Chart height in pixels."}];scatterInputs=[{name:"data",type:"ScatterPoint[]",default:"[]",description:"List of data points containing x, y coordinates, label, group, and size."},{name:"xTitle",type:"string",default:"'X Axis'",description:"Label title for the X-axis."},{name:"yTitle",type:"string",default:"'Y Axis'",description:"Label title for the Y-axis."},{name:"showLegend",type:"boolean",default:"true",description:"Show the group categorization legend."},{name:"showGrid",type:"boolean",default:"true",description:"Show vertical and horizontal background grid lines."},{name:"height",type:"number",default:"300",description:"Chart height in pixels."}];sparklineInputs=[{name:"data",type:"number[]",default:"[]",description:"Array of numeric values to plot."},{name:"type",type:"'line' | 'area' | 'bar'",default:"'line'",description:"Sparkline rendering type."},{name:"color",type:"string",default:"'#4a90d9'",description:"Primary color for the sparkline."},{name:"width",type:"number",default:"100",description:"Width in pixels."},{name:"height",type:"number",default:"32",description:"Height in pixels."}];gaugeInputs=[{name:"value",type:"number",default:"required",description:"Current numerical value displayed in the gauge."},{name:"min",type:"number",default:"0",description:"Minimum bounds value."},{name:"max",type:"number",default:"100",description:"Maximum bounds value."},{name:"label",type:"string",default:"''",description:"Center subtext label (e.g. Unit title)."},{name:"type",type:"'full' | 'semi'",default:"'semi'",description:"Dials arc shape."},{name:"showNeedle",type:"boolean",default:"true",description:"Displays the central pointer needle."},{name:"color",type:"string",default:"'#4f46e5'",description:"Default color if no thresholds match."},{name:"thresholds",type:"GaugeThreshold[]",default:"[]",description:"Adaptive color mapping depending on value level limits."}];radarInputs=[{name:"seriesData",type:"RadarSeries[]",default:"required",description:"Dimensions dataset mappings containing values arrays."},{name:"categories",type:"string[]",default:"required",description:"Web spokes axes dimension names."},{name:"max",type:"number",default:"100",description:"Maximum value bounds."}];heatmapInputs=[{name:"data",type:"number[][]",default:"required",description:"2D array mapping row and column values."},{name:"xAxisLabels",type:"string[]",default:"[]",description:"Text labels mapped sequentially above the columns."},{name:"yAxisLabels",type:"string[]",default:"[]",description:"Text labels mapped sequentially to the left of the rows."},{name:"colorRange",type:"string[]",default:"['#e2e8f0', '#4f46e5']",description:"Hex boundaries determining gradient shading."}];treemapInputs=[{name:"data",type:"TreemapItem[]",default:"required",description:"List of label-value data items to subdivide proportionally."}];funnelInputs=[{name:"data",type:"FunnelItem[]",default:"[]",description:"List of stage items in order, containing name and numeric value."},{name:"mode",type:"'funnel' | 'pyramid'",default:"'funnel'",description:"Switches layout geometry flow shapes."},{name:"height",type:"number",default:"300",description:"Height of the SVG drawing canvas in pixels."}];waterfallInputs=[{name:"data",type:"WaterfallItem[]",default:"[]",description:"List of incremental change items. Items with isTotal: true will plot from zero."},{name:"height",type:"number",default:"300",description:"Height of the chart canvas."},{name:"showGrid",type:"boolean",default:"true",description:"Shows background horizontal gridlines."},{name:"showLabels",type:"boolean",default:"true",description:"Shows individual values labels directly on the bars."},{name:"positiveColor",type:"string",default:"'#10b981'",description:"Bar fill color for positive delta changes."},{name:"negativeColor",type:"string",default:"'#ef4444'",description:"Bar fill color for negative delta changes."},{name:"totalColor",type:"string",default:"'#64748b'",description:"Bar fill color for total/balance columns."}];boxPlotInputs=[{name:"data",type:"BoxPlotItem[]",default:"[]",description:"Statistical distribution data containing min, q1, median, q3, max, and optional outliers."},{name:"height",type:"number",default:"300",description:"Height of the chart canvas."},{name:"showGrid",type:"boolean",default:"true",description:"Shows background gridlines."},{name:"color",type:"string",default:"'#4f46e5'",description:"Stroke and outline border color for the boxes and whiskers."},{name:"fillColor",type:"string",default:"'rgba(79, 70, 229, 0.12)'",description:"Translucent background fill for the boxes."},{name:"outlierColor",type:"string",default:"'#ef4444'",description:"Dot indicator fill color for outlier values."}];radialInputs=[{name:"data",type:"RadialBarItem[]",default:"[]",description:"Concentric ring items containing value and max thresholds."},{name:"height",type:"number",default:"300",description:"Total diameter width and height bounds."},{name:"showLegend",type:"boolean",default:"true",description:"Displays categorizations labels list next to rings."},{name:"strokeWidth",type:"number",default:"10",description:"Width thickness of the rings tracks."},{name:"ringGap",type:"number",default:"4",description:"Gap spacing distance between concentric rings."}];candlestickInputs=[{name:"data",type:"CandlestickItem[]",default:"[]",description:"OHLC financial values containing open, high, low, close numbers."},{name:"height",type:"number",default:"300",description:"Height of the chart canvas."},{name:"showGrid",type:"boolean",default:"true",description:"Shows background gridlines."},{name:"bullishColor",type:"string",default:"'#10b981'",description:"Stroke and fill color when close price is higher than open price."},{name:"bearishColor",type:"string",default:"'#ef4444'",description:"Stroke and fill color when close price is lower than open price."}];bubbleInputs=[{name:"data",type:"BubblePoint[]",default:"[]",description:"List of data points containing x, y, size magnitude z, label, and group."},{name:"xTitle",type:"string",default:"'X Axis'",description:"Label title for the X-axis."},{name:"yTitle",type:"string",default:"'Y Axis'",description:"Label title for the Y-axis."},{name:"zTitle",type:"string",default:"'Size'",description:"Label title for the size coordinate z."},{name:"showLegend",type:"boolean",default:"true",description:"Show the group categorization legend."},{name:"showGrid",type:"boolean",default:"true",description:"Show background grid lines."},{name:"showLabels",type:"boolean",default:"true",description:"Show labels inside the bubbles for larger sizes."},{name:"height",type:"number",default:"300",description:"Chart height in pixels."},{name:"showExport",type:"boolean",default:"false",description:"Enable file export dropdown menu (JSON, CSV, SVG)."}];sunburstInputs=[{name:"data",type:"SunburstNode[]",default:"[]",description:"Hierarchical tree structure of nodes with label, optional children, and value."},{name:"height",type:"number",default:"300",description:"Chart diameter width and height bounds."},{name:"showLegend",type:"boolean",default:"true",description:"Show a legend listing the top-level categories."},{name:"showLabels",type:"boolean",default:"true",description:"Show label text inside the concentric rings."},{name:"colors",type:"string[]",default:"CHART_COLORS",description:"Custom color palette."},{name:"showExport",type:"boolean",default:"false",description:"Enable file export dropdown menu (JSON, CSV, SVG)."}];polarAreaInputs=[{name:"data",type:"ChartDataPoint[]",default:"[]",description:"Array of data points containing label, value, and optional color."},{name:"height",type:"number",default:"280",description:"Height of the chart in pixels."},{name:"showLegend",type:"boolean",default:"true",description:"Show color-coded legend below the chart."},{name:"showLabels",type:"boolean",default:"true",description:"Show value labels inside the slices."},{name:"colors",type:"string[]",default:"CHART_COLORS",description:"Custom color palette."},{name:"showExport",type:"boolean",default:"false",description:"Enable data export options."}];bulletInputs=[{name:"value",type:"number",default:"0",description:"The actual measured value to display."},{name:"target",type:"number",default:"0",description:"The target value threshold mark."},{name:"max",type:"number",default:"100",description:"The maximum limit on the chart scale."},{name:"ranges",type:"number[]",default:"[50, 85, 100]",description:"Boundaries for qualitative performance ranges."},{name:"rangeColors",type:"string[]",default:"grey shades",description:"List of color hexes for the qualitative range bars."},{name:"valueColor",type:"string",default:"'#4f46e5'",description:"Color of the actual progress bar."},{name:"targetColor",type:"string",default:"'#ef4444'",description:"Color of the vertical target marker line."},{name:"height",type:"number",default:"50",description:"Height of the chart canvas."},{name:"showLabels",type:"boolean",default:"true",description:"Show numeric tick labels at the bottom."}];dumbbellInputs=[{name:"data",type:"DumbbellItem[]",default:"[]",description:"List of dumbbell items with start and end values."},{name:"height",type:"number",default:"350",description:"Total height of the chart canvas."},{name:"showGrid",type:"boolean",default:"true",description:"Enable horizontal reference grids."},{name:"showLabels",type:"boolean",default:"true",description:"Display Y axis categories labels."},{name:"startColor",type:"string",default:"'#ef4444'",description:"Color fill for start value endpoint circle."},{name:"endColor",type:"string",default:"'#10b981'",description:"Color fill for end value endpoint circle."},{name:"startLabel",type:"string",default:"'Start'",description:"Label name in the chart legend for start dots."},{name:"endLabel",type:"string",default:"'End'",description:"Label name in the chart legend for end dots."},{name:"showLegend",type:"boolean",default:"true",description:"Enable legend display at the top."}];lollipopInputs=[{name:"data",type:"ChartDataPoint[]",default:"[]",description:"Dataset of items with labels and values."},{name:"height",type:"number",default:"350",description:"Total height of the chart canvas."},{name:"showGrid",type:"boolean",default:"true",description:"Enable reference gridlines."},{name:"showLabels",type:"boolean",default:"true",description:"Display axis category labels."},{name:"orientation",type:"'horizontal' | 'vertical'",default:"'horizontal'",description:"Layout orientation of the stems."},{name:"colors",type:"string[]",default:"CHART_COLORS",description:"Color palette for the lollipop candies."},{name:"dotRadius",type:"number",default:"8",description:"Radius of the tip circle candy marker."}];slopeInputs=[{name:"data",type:"SlopeDataPoint[]",default:"[]",description:"Comparison values list for two-stage trajectory."},{name:"startLabel",type:"string",default:"'Before'",description:"Header title of the left trajectory axis."},{name:"endLabel",type:"string",default:"'After'",description:"Header title of the right trajectory axis."},{name:"height",type:"number",default:"350",description:"Total height of the chart canvas."},{name:"showLabels",type:"boolean",default:"true",description:"Display outer category labels."},{name:"showValues",type:"boolean",default:"true",description:"Display inner value indicators next to dots."}];sankeyInputs=[{name:"nodes",type:"SankeyNode[]",default:"[]",description:"Topological node blocks definitions list."},{name:"links",type:"SankeyLink[]",default:"[]",description:"Curved paths flows and values from source to target."},{name:"height",type:"number",default:"400",description:"Total height of the chart canvas."},{name:"showLabels",type:"boolean",default:"true",description:"Display node text labels."},{name:"showValues",type:"boolean",default:"true",description:"Display flow values text inside labels."},{name:"nodePadding",type:"number",default:"16",description:"Vertical padding spacing between node rectangles."},{name:"nodeWidth",type:"number",default:"20",description:"Width thickness of the node block rectangles."}];violinInputs=[{name:"data",type:"ViolinItem[]",default:"[]",description:"Raw sample datasets for density estimation."},{name:"height",type:"number",default:"350",description:"Total height of the chart canvas."},{name:"showGrid",type:"boolean",default:"true",description:"Render background horizontal reference lines."},{name:"showLabels",type:"boolean",default:"true",description:"Render category names under each column."},{name:"colors",type:"string[]",default:"CHART_COLORS",description:"Color palette sequence for violins."}];ridgelineInputs=[{name:"data",type:"RidgelineItem[]",default:"[]",description:"List of distribution data profiles."},{name:"height",type:"number",default:"400",description:"Total height of the chart canvas."},{name:"showGrid",type:"boolean",default:"true",description:"Render background vertical reference lines."},{name:"showLabels",type:"boolean",default:"true",description:"Render label text on the left Y axis."},{name:"colors",type:"string[]",default:"CHART_COLORS",description:"Color palette sequence for ridge shapes."},{name:"overlap",type:"number",default:"1.6",description:"Stack overlap scaling ratio factor."}];paretoInputs=[{name:"data",type:"ParetoItem[]",default:"[]",description:"Unsorted category counts or frequency data."},{name:"height",type:"number",default:"350",description:"Total height of the chart canvas."},{name:"showGrid",type:"boolean",default:"true",description:"Render background horizontal reference lines."},{name:"showLabels",type:"boolean",default:"true",description:"Render category names under bars."},{name:"barColor",type:"string",default:"'#4a90d9'",description:"Fill color of the sorted frequency bars."},{name:"lineColor",type:"string",default:"'#ff6358'",description:"Color of cumulative percentage line."}];marimekkoInputs=[{name:"data",type:"MarimekkoItem[]",default:"[]",description:"Market segmentation and category share data."},{name:"height",type:"number",default:"400",description:"Total height of the chart canvas."},{name:"showGrid",type:"boolean",default:"true",description:"Render background horizontal reference lines."},{name:"showLabels",type:"boolean",default:"true",description:"Render segment label names."},{name:"colors",type:"string[]",default:"CHART_COLORS",description:"Color palette sequence for grid rects."}];chordInputs=[{name:"matrix",type:"number[][]",default:"[]",description:"Flow weight square adjacency matrix."},{name:"labels",type:"string[]",default:"[]",description:"Group names for circumference segments."},{name:"height",type:"number",default:"400",description:"Total height of the chart canvas."},{name:"showLabels",type:"boolean",default:"true",description:"Render label text on circular border."},{name:"colors",type:"string[]",default:"CHART_COLORS",description:"Color palette sequence for chord nodes."}];dependencyInputs=[{name:"matrix",type:"number[][]",default:"[]",description:"Directed flow dependency square matrix."},{name:"labels",type:"string[]",default:"[]",description:"Segment names on circumference."},{name:"height",type:"number",default:"400",description:"Total height of the chart canvas."},{name:"showLabels",type:"boolean",default:"true",description:"Render label text on border."},{name:"colors",type:"string[]",default:"CHART_COLORS",description:"Color palette sequence for nodes."}];matrixInputs=[{name:"matrix",type:"number[][]",default:"[]",description:"Adjacency matrix connection weight grid."},{name:"labels",type:"string[]",default:"[]",description:"Node label list for row/col axes."},{name:"height",type:"number",default:"400",description:"Total height of the chart canvas."},{name:"showLabels",type:"boolean",default:"true",description:"Display labels on axes."},{name:"color",type:"string",default:"CHART_COLORS[0]",description:"Base cell shading color."}];biplotInputs=[{name:"points",type:"BiplotPoint[]",default:"[]",description:"PCA observation coordinates and groups."},{name:"vectors",type:"BiplotVector[]",default:"[]",description:"Feature load vectors pointing from center."},{name:"height",type:"number",default:"400",description:"Total height of the chart canvas."},{name:"showLabels",type:"boolean",default:"true",description:"Display observation point labels."},{name:"colors",type:"string[]",default:"CHART_COLORS",description:"Color palette for groups."}];renkoInputs=[{name:"data",type:"number[]",default:"[]",description:"Close prices historical array series."},{name:"boxSize",type:"number",default:"5",description:"Required price movement to draw a brick."},{name:"height",type:"number",default:"350",description:"Total height of the chart canvas."},{name:"showGrid",type:"boolean",default:"true",description:"Display horizontal reference grids."},{name:"bullishColor",type:"string",default:'"#10b981"',description:"Color for rising price bricks."},{name:"bearishColor",type:"string",default:'"#ef4444"',description:"Color for falling price bricks."}];kagiInputs=[{name:"data",type:"number[]",default:"[]",description:"Close prices historical array series."},{name:"reversalAmount",type:"number",default:"15",description:"Price movement required to switch trend."},{name:"height",type:"number",default:"350",description:"Total height of the chart canvas."},{name:"showGrid",type:"boolean",default:"true",description:"Display horizontal reference grids."},{name:"bullishColor",type:"string",default:'"#10b981"',description:"Color for Yang (bullish) lines."},{name:"bearishColor",type:"string",default:'"#ef4444"',description:"Color for Yin (bearish) lines."}];pfInputs=[{name:"data",type:"number[]",default:"[]",description:"Price series history array."},{name:"boxSize",type:"number",default:"4",description:"The price span per grid box unit."},{name:"reversal",type:"number",default:"3",description:"Number of boxes needed to trigger a reversal column."},{name:"height",type:"number",default:"350",description:"Total height of the chart canvas."},{name:"showGrid",type:"boolean",default:"true",description:"Render background horizontal price ranges."},{name:"xColor",type:"string",default:'"#10b981"',description:"Color of rise indicator X shapes."},{name:"oColor",type:"string",default:'"#ef4444"',description:"Color of fall indicator O shapes."}];windRoseInputs=[{name:"data",type:"WindRoseItem[]",default:"[]",description:"Speed frequency distributions grouped by direction."},{name:"height",type:"number",default:"400",description:"Total height of the chart canvas."},{name:"colors",type:"string[]",default:"CHART_COLORS",description:"Color sequence for speed range bins."}];static \u0275fac=function(e){return new(e||t)};static \u0275cmp=V({type:t,selectors:[["app-charts-demo"]],viewQuery:function(e,n){e&1&&(A(n.customTooltipTemplate,on,5),A(n.tokenStreamChart,an,5)),e&2&&H(2)},decls:177,vars:116,consts:[["customTooltip",""],["tokenStreamChart",""],[1,"demo-page"],[1,"page-header"],[1,"page-header-text"],[1,"header-badges"],[1,"badge","badge-purple"],[1,"badge","badge-blue"],[1,"badge","badge-green"],[2,"display","flex","flex-wrap","wrap","align-items","center","justify-content","space-between","gap","12px","margin-bottom","12px","padding","12px 16px","background","var(--ngx-card-bg, #ffffff)","border","1px solid var(--ngx-border, #e2e8f0)","border-radius","12px"],[2,"display","flex","flex-wrap","wrap","gap","6px","align-items","center"],[1,"cat-pill",3,"click"],[1,"cat-pill","new-badge",3,"click"],[2,"position","relative","min-width","220px"],["type","text","placeholder","\u{1F50D} Search 68 charts...",2,"width","100%","padding","6px 12px","border-radius","8px","border","1px solid #cbd5e1","font-size","12px","outline","none",3,"ngModelChange","ngModel"],[1,"tab-nav-container"],[1,"tab-nav"],[1,"tab-btn",3,"active"],[1,"playground-layout"],[1,"playground-left"],[1,"chart-preview-card"],[1,"preview-header"],[1,"preview-title"],[1,"preview-badge"],[1,"chart-display-container"],[3,"series","categories","showMarkers","showLegend","showGrid","height","colors","showExport"],[3,"data","drillData","enableDrillDown","mode","centerTitle","centerValue","donutHoleSize","showLegend","showLabels","height","colors","showExport"],[1,"sparkline-demo-container"],[1,"gauge-display-container"],[1,"radar-display-container"],[3,"data","xAxisLabels","yAxisLabels","colorRange","showExport"],[3,"data","colors","showExport"],[3,"data","mode","colors","showExport"],[3,"barSeries","lineSeries","categories","barYTitle","lineYTitle","showLegend","showGrid","height","colors","showExport"],[3,"data","xTitle","yTitle","showLegend","showGrid","height","colors","showExport"],[3,"data","showGrid","showLabels","height","positiveColor","negativeColor","totalColor","showExport"],[3,"data","showGrid","showLabels","height","color","fillColor","outlierColor","showExport"],[3,"data","showLegend","height","strokeWidth","ringGap","colors","showExport"],[3,"data","showGrid","showLabels","height","bullishColor","bearishColor","showExport"],[3,"data","xTitle","yTitle","zTitle","showLegend","showGrid","showLabels","height","colors","showExport"],[3,"data","showLegend","showLabels","height","colors","showExport"],[1,"bullet-demo-container",2,"display","flex","flex-direction","column","gap","24px","width","100%"],[3,"data","showLegend","showGrid","showLabels","height","colors","showExport"],[3,"data","showGrid","showLabels","height","colors","showExport"],[3,"data","showLabels","showValues","height","colors","showExport"],[3,"nodes","links","showLabels","showValues","height","colors","showExport"],[3,"data","showGrid","showLabels","height","barColor","lineColor","showExport"],[3,"matrix","labels","showLabels","height","colors","showExport"],[3,"matrix","labels","showLabels","height","color","showExport"],[3,"points","vectors","showLabels","height","colors","showExport"],[3,"data","boxSize","height","showGrid","showExport","tooltipTemplate","labelFormatter"],[3,"data","reversalAmount","height","showGrid","showExport","tooltipTemplate","labelFormatter"],[3,"data","boxSize","reversal","height","showGrid","showExport","tooltipTemplate","labelFormatter"],[3,"data","height","colors","showExport","tooltipTemplate","labelFormatter"],[3,"series","height","colors","showExport","showGrid","showMarkers","showLegend","showLabels"],[3,"nodes","links","height","colors","showExport","showLegend","showLabels"],[3,"data","height","colors","showExport","showLabels"],[3,"data","height","colors","showExport","showLegend"],[3,"nodes","flows","height","colors","showExport"],[3,"sets","sizes","height","colors","showExport"],[3,"data","height","colors","showExport"],[3,"data","dataset","categories","height","colors","showExport","showGrid","showLabels"],[3,"series","height","colors","showExport","showGrid","showMarkers","showLegend"],[3,"series","categories","height","colors","showExport","showLegend"],[3,"series","height","colors","showExport","showGrid","showLegend","showLabels"],[3,"series","categories","height","colors","showExport","showGrid","showLegend","showLabels"],[3,"data","height","colors","showExport","showGrid","showLegend","showLabels"],[3,"data","height","colors","showExport","showLegend","showLabels"],[3,"nodes","links","height","colors","showExport","showLabels"],[3,"data","height","colors","showExport","showGrid"],[3,"title","windowSize","height","colors","showExport"],[3,"data","width","height","colors","showExport"],[1,"topology-demo-container",2,"display","flex","flex-direction","column","gap","12px","width","100%"],[3,"tokensX","tokensY","weights","height","colors","showExport"],[3,"series","categories","height","colors","showExport","showGrid","showLegend","showLabels","showMarkers","showArea"],[3,"data","height","showExport"],["centerTitle","Total Sales","centerValue","$1.65M",3,"rings","height","colors","showExport","showLegend","showLabels"],[3,"data","height","colors","showExport","showLabels","showLegend"],[3,"data","height","colors","showExport","showGrid","showLabels"],[3,"events","height","colors","showExport","showLegend"],[3,"rootNode","height","colors","showExport"],["units","%",3,"needles","thresholds","height","showExport","showLegend"],[1,"event-logger-card"],[1,"doc-subtabs-card"],[1,"subtab-header"],[1,"subtab-btn",3,"click"],[1,"subtab-content"],[1,"code-container"],[1,"api-docs-container"],[1,"playground-right"],[1,"config-card"],[1,"config-header"],[1,"sandbox-buttons"],[1,"stackblitz-btn",3,"click"],[1,"codesandbox-btn",3,"click"],[1,"config-body"],[1,"config-section"],[1,"config-section-title"],[1,"config-control"],[3,"change","value"],["value","light"],["value","dark"],["value","emerald"],["value","sunset"],["type","range","min","200","max","450","step","10",3,"input","value"],[1,"control-value"],[1,"checkbox-control"],[2,"font-size","12px","color","#94a3b8","font-style","italic"],[1,"tab-btn",3,"click"],[2,"font-size","10px","background","#3b82f6","color","#fff","padding","2px 6px","border-radius","8px","margin-right","4px","font-weight","700"],[2,"margin-bottom","12px","display","flex","align-items","center","gap","8px"],[2,"font-size","11px","font-weight","700","color","#64748b"],[1,"toggle-btn",3,"click"],[3,"barClick","series","categories","stackMode","showLegend","showGrid","showLabels","height","colors","showExport","referenceLines","labelFormatter","tooltipTemplate"],[3,"pointClick","series","categories","showArea","showMarkers","showLegend","height","colors","showExport","referenceLines","showLabels","labelFormatter","tooltipTemplate"],[2,"margin-top","16px"],[2,"font-size","11px","font-weight","700","color","#64748b","margin-bottom","4px"],[3,"data","categories","height"],[1,"sparkline-table"],[1,"sl-row",3,"background"],[2,"margin-top","20px"],[2,"font-size","11px","font-weight","700","color","#64748b","margin-bottom","8px"],["mode","loading","chartType","line",3,"height"],[1,"sl-row"],[1,"sl-name"],[3,"data","type","color","width","height"],[1,"sl-value"],[1,"sl-trend"],[3,"value","min","max","label","type","showNeedle","thresholds","color","showExport"],[3,"seriesData","categories","max","colors","showExport"],[1,"bullet-demo-item"],[1,"field-label",2,"font-size","12px","font-weight","600","margin-bottom","4px","display","block","color","var(--ngx-chart-text, #0f172a)"],[3,"value","target","max","ranges","rangeColors","valueColor","targetColor","height"],[3,"streamTick","agentPromptRequest","title","windowSize","height","colors","showExport"],[3,"lassoSelected","agentQueryRequest","data","width","height","colors","showExport"],[1,"topology-editor-controls",2,"display","flex","align-items","center","justify-content","space-between","padding","10px 14px","background","rgba(15, 23, 42, 0.03)","border-radius","8px","border","1px solid rgba(0,0,0,0.05)","flex-wrap","wrap","gap","8px"],[1,"toggle-control",2,"display","inline-flex","align-items","center","gap","8px","cursor","pointer","font-size","12px","font-weight","600","color","#334155"],["type","checkbox",2,"cursor","pointer",3,"change","checked"],[1,"editor-tip",2,"font-size","11px","color","#64748b","font-style","italic"],[3,"nodeActionClick","validationError","nodesChange","linksChange","nodes","links","width","height","colors","showExport","editable"],[3,"cellClick","agentQueryRequest","tokensX","tokensY","weights","height","colors","showExport"],[1,"logger-header"],[1,"logger-title"],[1,"logger-dot-indicator"],[1,"clear-log-btn",3,"click"],[1,"logger-body"],[1,"empty-logger-state"],[1,"log-entries"],[1,"log-entry"],[1,"log-time"],[1,"log-badge"],[1,"log-text"],[1,"highlight-text"],[1,"code-block"],[1,"copy-btn",3,"click"],[1,"section-label"],[1,"api-table-wrap"],[1,"api-table"],[1,"section-label",2,"margin-top","24px"],[1,"api-name"],[1,"api-type"],[1,"api-default"],["type","checkbox",3,"change","checked"],["value","pie"],["value","donut"],["type","text",3,"input","value"],["type","range","min","0.3","max","0.8","step","0.05",3,"input","value"],["value","line"],["value","area"],["value","bar"],["type","color",3,"change","value"],["type","range","min","0","max","100",3,"input","value"],["value","semi"],["value","full"],["type","range","min","0","step","1",3,"input","max","value"],["type","number",2,"width","100%",3,"input","value"],["value","funnel"],["value","pyramid"],["type","range","min","6","max","18","step","1",3,"input","value"],["type","range","min","2","max","10","step","1",3,"input","value"],[1,"custom-premium-tooltip"],[1,"tooltip-header"],[1,"tooltip-title"],[1,"tooltip-status"],[1,"tooltip-divider"],[1,"tooltip-rows"],[1,"tooltip-row-item"],[1,"tooltip-row-header"],[1,"tooltip-row-dot"],[1,"tooltip-row-name"],[1,"tooltip-row-value"],[1,"tooltip-progress-track"],[1,"tooltip-progress-bar"]],template:function(e,n){if(e&1){let s=v();i(0,"div",2)(1,"div",3)(2,"div",4)(3,"h1"),d(4,"Enterprise Chart Playground"),r(),i(5,"p"),d(6,"SVG-based, standalone charting components with dynamic configuration panels, adaptive themes, interactive tooltips, copyable code, and StackBlitz sandbox integration."),r()(),i(7,"div",5)(8,"span",6),d(9,"Standalone"),r(),i(10,"span",7),d(11,"Interactive"),r(),i(12,"span",8),d(13,"Angular 19"),r()()(),i(14,"div",9)(15,"div",10)(16,"button",11),x("click",function(){return g(s),m(n.selectedCategory.set("ALL"))}),d(17,"All Charts (68)"),r(),i(18,"button",12),x("click",function(){return g(s),m(n.selectedCategory.set("NEW"))}),d(19,"\u2728 New Enterprise (8)"),r(),i(20,"button",11),x("click",function(){return g(s),m(n.selectedCategory.set("CORE"))}),d(21,"\u{1F4CA} Core Charts"),r(),i(22,"button",11),x("click",function(){return g(s),m(n.selectedCategory.set("FINANCIAL"))}),d(23,"\u{1F4C8} Financial & IoT"),r(),i(24,"button",11),x("click",function(){return g(s),m(n.selectedCategory.set("HIERARCHY"))}),d(25,"\u{1F578}\uFE0F Flow & Tree"),r(),i(26,"button",11),x("click",function(){return g(s),m(n.selectedCategory.set("AI"))}),d(27,"\u{1F916} AI & Cognitive"),r()(),i(28,"div",13)(29,"input",14),x("ngModelChange",function(y){return g(s),m(n.chartSearchQuery.set(y))}),r()()(),i(30,"div",15)(31,"div",16),M(32,bn,3,4,"button",17,B),r()(),i(34,"div",18)(35,"div",19)(36,"div",20)(37,"div",21)(38,"span",22),d(39),r(),i(40,"span",23),d(41,"Active View"),r()(),i(42,"div",24),k(43,fn,10,19)(44,vn,5,16)(45,Cn,1,8,"ngx-area-chart",25)(46,yn,1,12,"ngx-pie-chart",26)(47,kn,8,1,"div",27)(48,_n,2,9,"div",28)(49,Sn,2,5,"div",29)(50,Tn,1,8,"ngx-heatmap-chart",30)(51,Pn,1,3,"ngx-treemap-chart",31)(52,Mn,1,4,"ngx-funnel-chart",32)(53,En,1,10,"ngx-combo-chart",33)(54,Ln,1,8,"ngx-scatter-plot",34)(55,Dn,1,8,"ngx-waterfall-chart",35)(56,Rn,1,8,"ngx-box-plot-chart",36)(57,An,1,7,"ngx-radial-bar-chart",37)(58,On,1,7,"ngx-candlestick-chart",38)(59,$n,1,10,"ngx-bubble-chart",39)(60,In,1,6,"ngx-sunburst-chart",40)(61,Vn,1,6,"ngx-polar-area-chart",40)(62,Bn,9,20,"div",41)(63,Hn,1,7,"ngx-dumbbell-chart",42)(64,Nn,1,6,"ngx-lollipop-chart",43)(65,zn,1,6,"ngx-slope-chart",44)(66,Gn,1,7,"ngx-sankey-chart",45)(67,Wn,1,6,"ngx-violin-plot",43)(68,Fn,1,6,"ngx-ridgeline-chart",43)(69,jn,1,7,"ngx-pareto-chart",46)(70,Yn,1,6,"ngx-marimekko-chart",43)(71,Xn,1,6,"ngx-chord-diagram",47)(72,Jn,1,6,"ngx-dependency-wheel",47)(73,qn,1,6,"ngx-adjacency-matrix",48)(74,Un,1,6,"ngx-biplot",49)(75,Qn,1,7,"ngx-renko-chart",50)(76,Kn,1,7,"ngx-kagi-chart",51)(77,Zn,1,8,"ngx-point-figure-chart",52)(78,eo,1,6,"ngx-wind-rose",53)(79,to,1,8,"ngx-area-range-chart",54)(80,no,1,7,"ngx-network-graph",55)(81,oo,1,5,"ngx-treegraph",56)(82,ao,1,6,"ngx-map-choropleth",57)(83,ro,1,5,"ngx-flowmap",58)(84,io,1,7,"ngx-venn-diagram",59)(85,lo,1,4,"ngx-word-cloud",60)(86,so,1,4,"ngx-bell-curve-chart",60)(87,co,1,4,"ngx-histogram",60)(88,po,1,8,"ngx-flags",61)(89,uo,1,7,"ngx-area-spline-range-chart",62)(90,ho,1,6,"ngx-streamgraph",63)(91,go,1,7,"ngx-column-range-chart",64)(92,mo,1,8,"ngx-column-pyramid-chart",65)(93,xo,1,7,"ngx-variwide-chart",66)(94,bo,1,6,"ngx-variable-pie-chart",67)(95,fo,1,6,"ngx-packed-bubble-chart",67)(96,vo,1,6,"ngx-arc-diagram",68)(97,Co,1,5,"ngx-error-bar",69)(98,yo,1,5,"ngx-tilemap",56)(99,wo,2,5,"ngx-token-streaming-chart",70)(100,ko,1,5,"ngx-embedding-space-projection",71)(101,_o,9,8,"div",72)(102,So,1,7,"ngx-transformer-attention-heatmap",73)(103,To,1,10,"ngx-step-line-chart",74)(104,Po,1,3,"ngx-calendar-heatmap",75)(105,Mo,1,6,"ngx-nested-donut-chart",76)(106,Eo,1,6,"ngx-pyramid-chart",77)(107,Lo,1,6,"ngx-range-bar-chart",78)(108,Do,1,5,"ngx-timeline-chart",79)(109,Ro,1,4,"ngx-org-chart",80)(110,Ao,1,5,"ngx-multi-needle-gauge",81),r()(),k(111,Vo,10,1,"div",82),i(112,"div",83)(113,"div",84)(114,"button",85),x("click",function(){return g(s),m(n.activeSubtab.set("html"))}),d(115,"HTML Template"),r(),i(116,"button",85),x("click",function(){return g(s),m(n.activeSubtab.set("ts"))}),d(117,"TypeScript Code"),r(),i(118,"button",85),x("click",function(){return g(s),m(n.activeSubtab.set("api"))}),d(119,"API & CSS Reference"),r()(),i(120,"div",86),k(121,Bo,6,1,"div",87)(122,Ho,6,1,"div",87)(123,Go,33,0,"div",88),r()()(),i(124,"div",89)(125,"div",90)(126,"div",91)(127,"h3"),d(128,"Configuration"),r(),i(129,"div",92)(130,"button",93),x("click",function(){return g(s),m(n.editInStackBlitz())}),d(131," \u26A1 StackBlitz "),r(),i(132,"button",94),x("click",function(){return g(s),m(n.editInCodeSandbox())}),d(133," \u{1F4E6} CodeSandbox "),r()()(),i(134,"div",95)(135,"div",96)(136,"div",97),d(137,"General Properties"),r(),i(138,"div",98)(139,"label"),d(140,"Color Theme"),r(),i(141,"select",99),x("change",function(y){return g(s),m(n.onThemeChange(y))}),i(142,"option",100),d(143,"\u2600\uFE0F Classic Light"),r(),i(144,"option",101),d(145,"\u{1F319} Dark Premium"),r(),i(146,"option",102),d(147,"\u{1F49A} Emerald Mint"),r(),i(148,"option",103),d(149,"\u{1F9E1} Sunset Glow"),r()()(),i(150,"div",98)(151,"label"),d(152,"Chart Height (px)"),r(),i(153,"input",104),x("input",function(y){return g(s),m(n.onHeightChange(y))}),r(),i(154,"span",105),d(155),r()(),k(156,Wo,3,1,"label",106)(157,Fo,3,1,"label",106)(158,jo,3,1,"label",106),r(),k(159,Yo,12,3,"div",96),i(160,"div",96)(161,"div",97),d(162),r(),k(163,Jo,9,2)(164,qo,6,2)(165,Uo,3,1,"label",106)(166,Qo,14,2)(167,Ko,17,4)(168,Zo,16,7)(169,ea,8,1,"div",98)(170,ta,12,3)(171,na,8,2)(172,oa,12,4)(173,aa,8,2)(174,ra,2,0,"div",107),r()()()()(),k(175,ga,6,5,"ng-template",null,0,F),r()}e&2&&(w("dark-theme",n.chartTheme()==="dark"),a(16),w("active",n.selectedCategory()==="ALL"),a(2),w("active",n.selectedCategory()==="NEW"),a(2),w("active",n.selectedCategory()==="CORE"),a(2),w("active",n.selectedCategory()==="FINANCIAL"),a(2),w("active",n.selectedCategory()==="HIERARCHY"),a(2),w("active",n.selectedCategory()==="AI"),a(3),p("ngModel",n.chartSearchQuery()),a(3),E(n.filteredTabs()),a(4),T("background",n.getThemeBg()),a(3),_("",n.activeTab()," Preview"),a(4),u(n.activeTab()==="Bar Chart"?43:-1),a(),u(n.activeTab()==="Line Chart"?44:-1),a(),u(n.activeTab()==="Area Chart"?45:-1),a(),u(n.activeTab()==="Pie / Donut"?46:-1),a(),u(n.activeTab()==="Sparkline"?47:-1),a(),u(n.activeTab()==="Gauge Chart"?48:-1),a(),u(n.activeTab()==="Radar Chart"?49:-1),a(),u(n.activeTab()==="Heatmap Chart"?50:-1),a(),u(n.activeTab()==="Treemap Chart"?51:-1),a(),u(n.activeTab()==="Funnel / Pyramid Chart"?52:-1),a(),u(n.activeTab()==="Combo Chart"?53:-1),a(),u(n.activeTab()==="Scatter Plot"?54:-1),a(),u(n.activeTab()==="Waterfall Chart"?55:-1),a(),u(n.activeTab()==="Box Plot Chart"?56:-1),a(),u(n.activeTab()==="Radial Bar Chart"?57:-1),a(),u(n.activeTab()==="Candlestick Chart"?58:-1),a(),u(n.activeTab()==="Bubble Chart"?59:-1),a(),u(n.activeTab()==="Sunburst Chart"?60:-1),a(),u(n.activeTab()==="Polar Area Chart"?61:-1),a(),u(n.activeTab()==="Bullet Chart"?62:-1),a(),u(n.activeTab()==="Dumbbell Chart"?63:-1),a(),u(n.activeTab()==="Lollipop Chart"?64:-1),a(),u(n.activeTab()==="Slope Chart"?65:-1),a(),u(n.activeTab()==="Sankey Chart"?66:-1),a(),u(n.activeTab()==="Violin Plot"?67:-1),a(),u(n.activeTab()==="Ridgeline Chart"?68:-1),a(),u(n.activeTab()==="Pareto Chart"?69:-1),a(),u(n.activeTab()==="Marimekko Chart"?70:-1),a(),u(n.activeTab()==="Chord Diagram"?71:-1),a(),u(n.activeTab()==="Dependency Wheel"?72:-1),a(),u(n.activeTab()==="Adjacency Matrix"?73:-1),a(),u(n.activeTab()==="Biplot / PCA Plot"?74:-1),a(),u(n.activeTab()==="Renko Chart"?75:-1),a(),u(n.activeTab()==="Kagi Chart"?76:-1),a(),u(n.activeTab()==="Point & Figure Chart"?77:-1),a(),u(n.activeTab()==="Wind Rose"?78:-1),a(),u(n.activeTab()==="Area Range"?79:-1),a(),u(n.activeTab()==="Network Graph"?80:-1),a(),u(n.activeTab()==="Treegraph"?81:-1),a(),u(n.activeTab()==="Map Choropleth"?82:-1),a(),u(n.activeTab()==="Flowmap"?83:-1),a(),u(n.activeTab()==="Venn Diagram"?84:-1),a(),u(n.activeTab()==="Word Cloud"?85:-1),a(),u(n.activeTab()==="Bell Curve"?86:-1),a(),u(n.activeTab()==="Histogram"?87:-1),a(),u(n.activeTab()==="Flags"?88:-1),a(),u(n.activeTab()==="Area Spline Range"?89:-1),a(),u(n.activeTab()==="Streamgraph"?90:-1),a(),u(n.activeTab()==="Column Range"?91:-1),a(),u(n.activeTab()==="Column Pyramid"?92:-1),a(),u(n.activeTab()==="Variwide"?93:-1),a(),u(n.activeTab()==="Variable Pie"?94:-1),a(),u(n.activeTab()==="Packed Bubble"?95:-1),a(),u(n.activeTab()==="Arc Diagram"?96:-1),a(),u(n.activeTab()==="Error Bar"?97:-1),a(),u(n.activeTab()==="Tilemap"?98:-1),a(),u(n.activeTab()==="Token Streaming"?99:-1),a(),u(n.activeTab()==="Embedding Projection"?100:-1),a(),u(n.activeTab()==="Agent Cognitive Topology"?101:-1),a(),u(n.activeTab()==="Attention Heatmap"?102:-1),a(),u(n.activeTab()==="Step Line Chart"?103:-1),a(),u(n.activeTab()==="Calendar Heatmap"?104:-1),a(),u(n.activeTab()==="Nested Donut"?105:-1),a(),u(n.activeTab()==="Pyramid Chart"?106:-1),a(),u(n.activeTab()==="Range Bar"?107:-1),a(),u(n.activeTab()==="Timeline Chart"?108:-1),a(),u(n.activeTab()==="Org Chart"?109:-1),a(),u(n.activeTab()==="Multi-Needle Gauge"?110:-1),a(),u(n.activeTab()==="Bar Chart"||n.activeTab()==="Line Chart"?111:-1),a(3),w("active",n.activeSubtab()==="html"),a(2),w("active",n.activeSubtab()==="ts"),a(2),w("active",n.activeSubtab()==="api"),a(3),u(n.activeSubtab()==="html"?121:-1),a(),u(n.activeSubtab()==="ts"?122:-1),a(),u(n.activeSubtab()==="api"?123:-1),a(18),p("value",n.chartTheme()),a(12),p("value",n.chartHeight()),a(2),_("",n.chartHeight(),"px"),a(),u(n.hasGeneralToggle("legend")?156:-1),a(),u(n.hasGeneralToggle("grid")?157:-1),a(),u(n.hasGeneralToggle("labels")?158:-1),a(),u(n.activeTab()==="Bar Chart"||n.activeTab()==="Line Chart"?159:-1),a(3),_("",n.activeTab()," Specifics"),a(),u(n.activeTab()==="Pie / Donut"?163:-1),a(),u(n.activeTab()==="Line Chart"?164:-1),a(),u(n.activeTab()==="Area Chart"?165:-1),a(),u(n.activeTab()==="Sparkline"?166:-1),a(),u(n.activeTab()==="Gauge Chart"?167:-1),a(),u(n.activeTab()==="Bullet Chart"?168:-1),a(),u(n.activeTab()==="Funnel / Pyramid Chart"?169:-1),a(),u(n.activeTab()==="Waterfall Chart"?170:-1),a(),u(n.activeTab()==="Box Plot Chart"?171:-1),a(),u(n.activeTab()==="Radial Bar Chart"?172:-1),a(),u(n.activeTab()==="Candlestick Chart"?173:-1),a(),u(n.hasSpecificControls()?-1:174))},dependencies:[X,Y,ee,K,Z,q,U,Q,ne,oe,ae,re,ie,le,se,ce,de,pe,ue,he,xe,be,fe,ve,ge,me,Ce,ye,we,ke,_e,Se,Te,Pe,Me,Ee,Le,De,Re,Ae,Oe,$e,Ie,Ve,Ye,nt,ot,Xe,Ze,et,Ue,qe,tt,Be,He,Ne,ze,Ge,We,Fe,je,Je,Qe,Ke,at,rt,it,lt,dt,pt,ut,ht,gt,mt,xt,bt,ct,st],styles:["[_nghost-%COMP%]{display:flex;flex-direction:column;height:100%;overflow-y:auto;background:var(--ngx-chart-bg-site, #f8fafc)}.demo-page[_ngcontent-%COMP%]{padding:28px;max-width:1200px;margin:0 auto;width:100%;box-sizing:border-box;display:flex;flex-direction:column;gap:24px;transition:background-color .3s}.demo-page.dark-theme[_ngcontent-%COMP%]{background:#0f172a;color:#f8fafc;--ngx-chart-bg-site: #0f172a;--bg-card: #1e293b;--border-card: rgba(255, 255, 255, .05);--text-muted: #94a3b8}.page-header[_ngcontent-%COMP%]{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding-bottom:20px;border-bottom:1px solid rgba(0,0,0,.08)}.dark-theme[_ngcontent-%COMP%]   .page-header[_ngcontent-%COMP%]{border-bottom-color:#ffffff1a}.page-header-text[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%]{margin:0 0 6px;font-size:26px;font-weight:800;color:#1e293b}.dark-theme[_ngcontent-%COMP%]   .page-header-text[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%]{color:#f8fafc}.page-header-text[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]{margin:0;font-size:13px;color:#64748b;line-height:1.6;max-width:700px}.dark-theme[_ngcontent-%COMP%]   .page-header-text[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]{color:#94a3b8}.header-badges[_ngcontent-%COMP%]{display:flex;gap:8px;flex-shrink:0}.badge[_ngcontent-%COMP%]{font-size:11px;font-weight:700;padding:4px 12px;border-radius:12px}.badge-purple[_ngcontent-%COMP%]{background:#f3e8ff;color:#7c3aed}.badge-blue[_ngcontent-%COMP%]{background:#e0f2fe;color:#0284c7}.badge-green[_ngcontent-%COMP%]{background:#dcfce7;color:#166534}.cat-pill[_ngcontent-%COMP%]{padding:6px 14px;font-size:12px;font-weight:600;border-radius:20px;border:1px solid #cbd5e1;background:#f8fafc;color:#475569;cursor:pointer;transition:all .15s ease;font-family:inherit}.cat-pill[_ngcontent-%COMP%]:hover{background:#f1f5f9;color:#0f172a}.cat-pill.active[_ngcontent-%COMP%]{background:#3b82f6;color:#fff;border-color:#3b82f6;box-shadow:0 2px 6px #3b82f64d}.cat-pill.new-badge[_ngcontent-%COMP%]{border-color:#8b5cf6;color:#7c3aed}.cat-pill.new-badge.active[_ngcontent-%COMP%]{background:#7c3aed;color:#fff;border-color:#7c3aed;box-shadow:0 2px 6px #7c3aed4d}.tab-nav-container[_ngcontent-%COMP%]{width:100%;overflow-x:auto;border-bottom:2px solid rgba(0,0,0,.06)}.dark-theme[_ngcontent-%COMP%]   .tab-nav-container[_ngcontent-%COMP%]{border-bottom-color:#ffffff1a}.tab-nav[_ngcontent-%COMP%]{display:flex;gap:4px;padding-bottom:2px;min-width:max-content}.tab-btn[_ngcontent-%COMP%]{padding:10px 18px;background:none;border:none;font-size:13px;font-weight:600;color:#64748b;cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-2px;font-family:inherit;transition:all .2s}.tab-btn[_ngcontent-%COMP%]:hover{color:#1e293b}.dark-theme[_ngcontent-%COMP%]   .tab-btn[_ngcontent-%COMP%]:hover{color:#f8fafc}.tab-btn.active[_ngcontent-%COMP%]{color:#4f46e5;border-bottom-color:#4f46e5}.dark-theme[_ngcontent-%COMP%]   .tab-btn.active[_ngcontent-%COMP%]{color:#818cf8;border-bottom-color:#818cf8}.playground-layout[_ngcontent-%COMP%]{display:grid;grid-template-columns:1fr 340px;gap:24px;align-items:start}@media (max-width: 900px){.playground-layout[_ngcontent-%COMP%]{grid-template-columns:1fr}}.chart-preview-card[_ngcontent-%COMP%]{background:#fff;border:1px solid rgba(0,0,0,.05);border-radius:16px;padding:24px;box-shadow:0 4px 6px -1px #0000000d,0 2px 4px -2px #0000000d;margin-bottom:24px;transition:background-color .2s,box-shadow .2s}.dark-theme[_ngcontent-%COMP%]   .chart-preview-card[_ngcontent-%COMP%]{box-shadow:0 4px 20px #0000004d}.preview-header[_ngcontent-%COMP%]{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;border-bottom:1px solid rgba(0,0,0,.05);padding-bottom:10px}.dark-theme[_ngcontent-%COMP%]   .preview-header[_ngcontent-%COMP%]{border-bottom-color:#ffffff0f}.preview-title[_ngcontent-%COMP%]{font-size:14px;font-weight:700;color:#334155;text-transform:uppercase;letter-spacing:.5px}.dark-theme[_ngcontent-%COMP%]   .preview-title[_ngcontent-%COMP%]{color:#cbd5e1}.preview-badge[_ngcontent-%COMP%]{font-size:9px;font-weight:700;background:#e2e8f0;color:#475569;padding:2px 8px;border-radius:4px;text-transform:uppercase}.dark-theme[_ngcontent-%COMP%]   .preview-badge[_ngcontent-%COMP%]{background:#334155;color:#94a3b8}.chart-display-container[_ngcontent-%COMP%]{width:100%;min-height:280px;display:flex;flex-direction:column;justify-content:center}.doc-subtabs-card[_ngcontent-%COMP%]{background:#fff;border:1px solid rgba(0,0,0,.05);border-radius:16px;box-shadow:0 2px 4px #00000005}.dark-theme[_ngcontent-%COMP%]   .doc-subtabs-card[_ngcontent-%COMP%]{background:#1e293b;border-color:#ffffff0d}.subtab-header[_ngcontent-%COMP%]{display:flex;background:#f8fafc;border-bottom:1px solid rgba(0,0,0,.05);border-radius:16px 16px 0 0;padding:0 8px}.dark-theme[_ngcontent-%COMP%]   .subtab-header[_ngcontent-%COMP%]{background:#111827;border-bottom-color:#ffffff0d}.subtab-btn[_ngcontent-%COMP%]{padding:12px 20px;background:none;border:none;font-size:12px;font-weight:600;color:#64748b;cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-1px;font-family:inherit;transition:all .15s}.subtab-btn[_ngcontent-%COMP%]:hover{color:#334155}.dark-theme[_ngcontent-%COMP%]   .subtab-btn[_ngcontent-%COMP%]:hover{color:#cbd5e1}.subtab-btn.active[_ngcontent-%COMP%]{color:#4f46e5;border-bottom-color:#4f46e5}.dark-theme[_ngcontent-%COMP%]   .subtab-btn.active[_ngcontent-%COMP%]{color:#818cf8;border-bottom-color:#818cf8}.subtab-content[_ngcontent-%COMP%]{padding:20px}.code-container[_ngcontent-%COMP%]{position:relative}.code-block[_ngcontent-%COMP%]{margin:0;background:#0f172a;color:#38bdf8;border-radius:8px;padding:18px 24px;font-size:12px;line-height:1.6;overflow-x:auto;white-space:pre;font-family:SF Mono,Consolas,Menlo,monospace}.copy-btn[_ngcontent-%COMP%]{position:absolute;top:10px;right:10px;padding:4px 10px;background:#ffffff14;border:1px solid rgba(255,255,255,.15);color:#cbd5e1;font-size:11px;font-weight:600;border-radius:6px;cursor:pointer;font-family:inherit;transition:all .15s}.copy-btn[_ngcontent-%COMP%]:hover{background:#ffffff26;color:#fff}.config-card[_ngcontent-%COMP%]{background:#fff;border:1px solid rgba(0,0,0,.05);border-radius:16px;padding:20px;box-shadow:0 4px 6px -1px #0000000d}.dark-theme[_ngcontent-%COMP%]   .config-card[_ngcontent-%COMP%]{background:#1e293b;border-color:#ffffff0d}.config-header[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:12px;margin-bottom:20px;border-bottom:1px solid rgba(0,0,0,.05);padding-bottom:14px}.dark-theme[_ngcontent-%COMP%]   .config-header[_ngcontent-%COMP%]{border-bottom-color:#ffffff0f}.config-header[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%]{margin:0;font-size:16px;font-weight:800;color:#1e293b}.dark-theme[_ngcontent-%COMP%]   .config-header[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%]{color:#f8fafc}.sandbox-buttons[_ngcontent-%COMP%]{display:grid;grid-template-columns:1fr 1fr;gap:8px;width:100%}.stackblitz-btn[_ngcontent-%COMP%]{width:100%;background:#1389fd;color:#fff;border:none;padding:10px;font-weight:700;font-size:11px;border-radius:8px;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:4px;transition:background .2s,transform .1s}.stackblitz-btn[_ngcontent-%COMP%]:hover{background:#006ee6}.stackblitz-btn[_ngcontent-%COMP%]:active{transform:scale(.98)}.codesandbox-btn[_ngcontent-%COMP%]{width:100%;background:#151515;color:#fff;border:none;padding:10px;font-weight:700;font-size:11px;border-radius:8px;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:4px;transition:background .2s,transform .1s}.codesandbox-btn[_ngcontent-%COMP%]:hover{background:#252525}.codesandbox-btn[_ngcontent-%COMP%]:active{transform:scale(.98)}.config-body[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:20px}.config-section[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:12px}.config-section-title[_ngcontent-%COMP%]{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#94a3b8;border-bottom:1px solid rgba(0,0,0,.03);padding-bottom:4px}.dark-theme[_ngcontent-%COMP%]   .config-section-title[_ngcontent-%COMP%]{border-bottom-color:#ffffff08}.config-control[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:4px}.config-control[_ngcontent-%COMP%]   label[_ngcontent-%COMP%]{font-size:12px;font-weight:600;color:#475569}.dark-theme[_ngcontent-%COMP%]   .config-control[_ngcontent-%COMP%]   label[_ngcontent-%COMP%]{color:#cbd5e1}.config-control[_ngcontent-%COMP%]   select[_ngcontent-%COMP%], .config-control[_ngcontent-%COMP%]   input[type=text][_ngcontent-%COMP%]{padding:8px 12px;border-radius:6px;border:1px solid #cbd5e1;font-size:12px;background:#fff;color:#1e293b;font-family:inherit;outline:none}.dark-theme[_ngcontent-%COMP%]   .config-control[_ngcontent-%COMP%]   select[_ngcontent-%COMP%], .dark-theme[_ngcontent-%COMP%]   .config-control[_ngcontent-%COMP%]   input[type=text][_ngcontent-%COMP%]{background:#111827;border-color:#ffffff1a;color:#cbd5e1}.config-control[_ngcontent-%COMP%]   input[type=range][_ngcontent-%COMP%]{cursor:pointer;accent-color:#4f46e5}.control-value[_ngcontent-%COMP%]{font-size:10px;font-weight:700;color:#64748b;align-self:flex-end;margin-top:-2px}.checkbox-control[_ngcontent-%COMP%]{display:flex;align-items:center;gap:8px;font-size:12px;font-weight:600;color:#475569;cursor:pointer;-webkit-user-select:none;user-select:none}.dark-theme[_ngcontent-%COMP%]   .checkbox-control[_ngcontent-%COMP%]{color:#cbd5e1}.checkbox-control[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]{cursor:pointer;accent-color:#4f46e5}.api-docs-container[_ngcontent-%COMP%]{display:flex;flex-direction:column}.api-table-wrap[_ngcontent-%COMP%]{overflow-x:auto;margin-top:8px}.api-table[_ngcontent-%COMP%]{width:100%;border-collapse:collapse;font-size:12px;text-align:left}.api-table[_ngcontent-%COMP%]   thead[_ngcontent-%COMP%]   th[_ngcontent-%COMP%]{background:#f8fafc;font-weight:700;color:#475569;padding:10px 12px;border-bottom:2px solid #e2e8f0;font-size:11px}.dark-theme[_ngcontent-%COMP%]   .api-table[_ngcontent-%COMP%]   thead[_ngcontent-%COMP%]   th[_ngcontent-%COMP%]{background:#111827;color:#cbd5e1;border-bottom-color:#ffffff0f}.api-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   td[_ngcontent-%COMP%]{padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#334155;vertical-align:top;line-height:1.5}.dark-theme[_ngcontent-%COMP%]   .api-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   td[_ngcontent-%COMP%]{border-bottom-color:#ffffff0d;color:#cbd5e1}.api-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]:hover   td[_ngcontent-%COMP%]{background:#f8fafc}.dark-theme[_ngcontent-%COMP%]   .api-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]:hover   td[_ngcontent-%COMP%]{background:#ffffff05}.api-name[_ngcontent-%COMP%]{color:#2563eb!important;font-family:monospace;font-weight:600}.dark-theme[_ngcontent-%COMP%]   .api-name[_ngcontent-%COMP%]{color:#60a5fa!important}.api-type[_ngcontent-%COMP%]{color:#7c3aed!important;font-family:monospace}.dark-theme[_ngcontent-%COMP%]   .api-type[_ngcontent-%COMP%]{color:#a78bfa!important}.api-default[_ngcontent-%COMP%]{font-family:monospace;color:#64748b}.dark-theme[_ngcontent-%COMP%]   .api-default[_ngcontent-%COMP%]{color:#94a3b8}.sparkline-demo-container[_ngcontent-%COMP%], .sparkline-table[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:8px;width:100%}.sl-row[_ngcontent-%COMP%]{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:8px 16px;border-radius:8px;background:#f8fafc;border:1px solid rgba(0,0,0,.02)}.sl-name[_ngcontent-%COMP%]{width:120px;font-size:13px;font-weight:600;color:#475569}.sl-value[_ngcontent-%COMP%]{font-size:14px;font-weight:700;color:#1e293b;min-width:50px;text-align:right}.sl-trend[_ngcontent-%COMP%]{font-size:11px;font-weight:700;min-width:60px;text-align:right}.sl-trend.up[_ngcontent-%COMP%]{color:#10b981}.sl-trend.down[_ngcontent-%COMP%]{color:#ef4444}.gauge-display-container[_ngcontent-%COMP%], .radar-display-container[_ngcontent-%COMP%]{display:flex;justify-content:center;align-items:center;width:100%}.event-logger-card[_ngcontent-%COMP%]{background:#fff;border:1px solid rgba(0,0,0,.05);border-radius:16px;padding:20px;box-shadow:0 4px 6px -1px #0000000d;margin-bottom:24px;transition:background-color .2s}.dark-theme[_ngcontent-%COMP%]   .event-logger-card[_ngcontent-%COMP%]{background:#1e293b;border-color:#ffffff0d}.logger-header[_ngcontent-%COMP%]{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;border-bottom:1px solid rgba(0,0,0,.05);padding-bottom:10px}.dark-theme[_ngcontent-%COMP%]   .logger-header[_ngcontent-%COMP%]{border-bottom-color:#ffffff0f}.logger-title[_ngcontent-%COMP%]{font-size:13px;font-weight:700;color:#475569;display:flex;align-items:center;gap:8px;text-transform:uppercase;letter-spacing:.5px}.dark-theme[_ngcontent-%COMP%]   .logger-title[_ngcontent-%COMP%]{color:#cbd5e1}.logger-dot-indicator[_ngcontent-%COMP%]{width:8px;height:8px;background:#10b981;border-radius:50%;display:inline-block;box-shadow:0 0 8px #10b981;animation:_ngcontent-%COMP%_pulse 2s infinite}@keyframes _ngcontent-%COMP%_pulse{0%{transform:scale(.95);box-shadow:0 0 #10b981b3}70%{transform:scale(1);box-shadow:0 0 0 6px #10b98100}to{transform:scale(.95);box-shadow:0 0 #10b98100}}.clear-log-btn[_ngcontent-%COMP%]{background:transparent;border:1px solid #cbd5e1;color:#64748b;font-size:11px;padding:4px 10px;border-radius:6px;cursor:pointer;font-weight:600;transition:all .15s}.dark-theme[_ngcontent-%COMP%]   .clear-log-btn[_ngcontent-%COMP%]{border-color:#ffffff1a;color:#94a3b8}.clear-log-btn[_ngcontent-%COMP%]:hover{background:#f1f5f9;color:#1e293b}.dark-theme[_ngcontent-%COMP%]   .clear-log-btn[_ngcontent-%COMP%]:hover{background:#ffffff0d;color:#f8fafc}.logger-body[_ngcontent-%COMP%]{max-height:180px;overflow-y:auto;font-family:SF Mono,Consolas,Menlo,monospace;font-size:11px}.empty-logger-state[_ngcontent-%COMP%]{padding:16px;text-align:center;color:#94a3b8;font-style:italic}.log-entries[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:6px}.log-entry[_ngcontent-%COMP%]{display:flex;align-items:center;gap:10px;padding:6px 10px;border-radius:6px;background:#f8fafc;border:1px solid rgba(0,0,0,.02);animation:_ngcontent-%COMP%_fadeIn .2s ease-out}.dark-theme[_ngcontent-%COMP%]   .log-entry[_ngcontent-%COMP%]{background:#0f172a;border-color:#ffffff05}@keyframes _ngcontent-%COMP%_fadeIn{0%{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}.log-time[_ngcontent-%COMP%]{color:#94a3b8;font-weight:500}.log-badge[_ngcontent-%COMP%]{padding:2px 6px;border-radius:4px;color:#fff;font-weight:700;font-size:10px;text-transform:uppercase}.log-text[_ngcontent-%COMP%]{color:#334155}.dark-theme[_ngcontent-%COMP%]   .log-text[_ngcontent-%COMP%]{color:#cbd5e1}.highlight-text[_ngcontent-%COMP%]{color:#4f46e5;font-weight:600}.dark-theme[_ngcontent-%COMP%]   .highlight-text[_ngcontent-%COMP%]{color:#818cf8}.custom-premium-tooltip[_ngcontent-%COMP%]{background:#0f172af2;backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.15);border-radius:12px;padding:14px;color:#f8fafc;min-width:200px;box-shadow:0 10px 15px -3px #00000080,0 4px 6px -4px #00000080;pointer-events:none}.tooltip-header[_ngcontent-%COMP%]{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}.tooltip-title[_ngcontent-%COMP%]{font-size:11px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:#94a3b8}.tooltip-status[_ngcontent-%COMP%]{font-size:8px;font-weight:700;background:#10b98133;color:#10b981;padding:1px 5px;border-radius:3px;text-transform:uppercase}.tooltip-divider[_ngcontent-%COMP%]{height:1px;background:#ffffff14;margin-bottom:10px}.tooltip-rows[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:10px}.tooltip-row-item[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:4px}.tooltip-row-header[_ngcontent-%COMP%]{display:flex;align-items:center;font-size:12px}.tooltip-row-dot[_ngcontent-%COMP%]{width:8px;height:8px;border-radius:50%;margin-right:8px}.tooltip-row-name[_ngcontent-%COMP%]{color:#cbd5e1;flex-grow:1}.tooltip-row-value[_ngcontent-%COMP%]{font-weight:700;font-family:monospace;color:#fff}.tooltip-progress-track[_ngcontent-%COMP%]{height:4px;background:#ffffff1a;border-radius:2px;overflow:hidden;margin-left:16px}.tooltip-progress-bar[_ngcontent-%COMP%]{height:100%;border-radius:2px;transition:width .3s ease}"]})};export{en as ChartsDemoComponent};
