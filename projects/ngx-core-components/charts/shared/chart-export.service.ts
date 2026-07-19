import { inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

/**
 * ChartExportService — SSR-safe chart data and image export.
 *
 * All public methods are no-ops on the server (SSR) platform.
 * Inject this service in chart components to avoid duplicating
 * download logic and document/window references across all 70+ charts.
 *
 * Usage:
 *   private readonly exportSvc = inject(ChartExportService);
 *   this.exportSvc.downloadCsv(headers, rows, 'my-chart.csv');
 */
@Injectable({ providedIn: 'root' })
export class ChartExportService {
  private readonly doc = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  /** Trigger a file download from a Blob */
  private triggerDownload(blob: Blob, filename: string): void {
    if (!this.isBrowser) return;
    const url = (this.doc.defaultView as Window & typeof globalThis).URL.createObjectURL(blob);
    const link = this.doc.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    this.doc.body.appendChild(link);
    link.click();
    this.doc.body.removeChild(link);
    (this.doc.defaultView as Window & typeof globalThis).URL.revokeObjectURL(url);
  }

  /** Download chart data as CSV */
  downloadCsv(headers: string[], rows: (string | number)[][], filename: string): void {
    if (!this.isBrowser) return;
    const csvLines = [
      headers.map(h => `"${h}"`).join(','),
      ...rows.map(row => row.map(cell => (typeof cell === 'string' ? `"${cell}"` : String(cell))).join(',')),
    ];
    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    this.triggerDownload(blob, filename);
  }

  /** Download chart data as JSON */
  downloadJson(data: object, filename: string): void {
    if (!this.isBrowser) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    this.triggerDownload(blob, filename);
  }

  /** Download the chart SVG element as an .svg file */
  downloadSvg(svgEl: SVGElement | null | undefined, filename: string): void {
    if (!this.isBrowser || !svgEl) return;
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svgEl);
    if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
      source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    if (!source.match(/^<svg[^>]+xmlns:xlink="http:\/\/www\.w3\.org\/1999\/xlink"/)) {
      source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
    }
    source = '<?xml version="1.0" encoding="utf-8"?>\n' + source;
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    this.triggerDownload(blob, filename);
  }

  /** Open a print dialog to save the chart as PDF (print-to-PDF) */
  downloadPdf(svgEl: SVGElement | null | undefined, title: string, filename: string): void {
    if (!this.isBrowser || !svgEl) return;
    const win = this.doc.defaultView as (Window & typeof globalThis) | null;
    if (!win) return;

    const printWindow = win.open('', '_blank');
    if (!printWindow) {
      // Popup blocked — fail gracefully
      console.warn(`[ChartExportService] Could not open print window for "${filename}". Allow pop-ups to enable PDF export.`);
      return;
    }

    const svgHtml = svgEl.outerHTML;
    const date = new Date().toLocaleString();

    const html = `<!DOCTYPE html>
<html>
<head>
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      padding: 24px; color: #0f172a; text-align: center;
    }
    .header {
      display: flex; justify-content: space-between; align-items: center;
      border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 24px; text-align: left;
    }
    .chart-title { font-size: 20px; font-weight: bold; }
    .chart-date { font-size: 12px; color: #64748b; }
    .chart-container {
      display: inline-block; margin-top: 24px; border: 1px solid #cbd5e1;
      border-radius: 12px; padding: 20px; background: #ffffff; width: 90%;
    }
    svg { width: 100%; height: auto; }
    @media print {
      body { padding: 0; }
      .chart-container { border: none; padding: 0; width: 100%; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="chart-title">${title}</div>
    <div class="chart-date">${date}</div>
  </div>
  <div class="chart-container">${svgHtml}</div>
  <script>
    window.onload = function () { window.print(); setTimeout(function () { window.close(); }, 600); };
  <\/script>
</body>
</html>`;

    printWindow.document.write(html);
    printWindow.document.close();
  }
}
