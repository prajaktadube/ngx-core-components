import { Injectable } from '@angular/core';
import { GridColumnDef } from './models';

/**
 * Standalone injectable service for exporting grid data to JSON, CSV, and Excel formats.
 * Extracted from DataGridComponent to enable reuse and reduce component size.
 */
@Injectable({ providedIn: 'root' })
export class GridExportService {

  /**
   * Export data as a JSON file download.
   */
  exportToJson<T>(data: T[], filename = 'grid-data.json'): void {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    this.triggerDownload(dataStr, filename);
  }

  /**
   * Export data as a CSV file download.
   */
  exportToCsv<T extends object>(data: T[], columns: GridColumnDef<T>[], filename = 'grid-data.csv'): void {
    if (data.length === 0) return;
    const headers = columns.map(c => c.title);
    const fields = columns.map(c => c.field);
    const rows = data.map(row => {
      const r = row as Record<string, unknown>;
      return fields.map(field => {
        const val = r[field] ?? '';
        const valStr = typeof val === 'object' ? JSON.stringify(val) : String(val);
        return `"${valStr.replace(/"/g, '""')}"`;
      });
    });
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    this.triggerDownload(url, filename);
  }

  /**
   * Export data as an Excel (.xls) file download using an HTML table template.
   */
  exportToExcel<T extends object>(data: T[], columns: GridColumnDef<T>[], filename = 'grid-data.xls'): void {
    if (data.length === 0) return;

    let tableHtml = '<table><thead><tr>';
    columns.forEach(c => {
      tableHtml += `<th>${c.title}</th>`;
    });
    tableHtml += '</tr></thead><tbody>';

    data.forEach(row => {
      const r = row as Record<string, unknown>;
      tableHtml += '<tr>';
      columns.forEach(c => {
        const val = r[c.field] ?? '';
        const valStr = typeof val === 'object' ? JSON.stringify(val) : String(val);
        const alignClass = c.align ? ` class="text-${c.align}"` : '';
        tableHtml += `<td${alignClass}>${valStr}</td>`;
      });
      tableHtml += '</tr>';
    });
    tableHtml += '</tbody></table>';

    const worksheetName = 'Grid Export';
    const template = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
      <!--[if gte mso 9]>
      <xml>
       <x:ExcelWorkbook>
        <x:ExcelWorksheets>
         <x:ExcelWorksheet>
          <x:Name>${worksheetName}</x:Name>
          <x:WorksheetOptions>
           <x:DisplayGridlines/>
          </x:WorksheetOptions>
         </x:ExcelWorksheet>
        </x:ExcelWorksheets>
       </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <style>
        table { border-collapse: collapse; font-family: sans-serif; font-size: 11pt; }
        th { background-color: #f1f5f9; color: #1e293b; font-weight: bold; border: 1px solid #cbd5e1; padding: 6px; }
        td { border: 1px solid #cbd5e1; padding: 6px; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .text-left { text-align: left; }
      </style>
      </head>
      <body>
      ${tableHtml}
      </body>
      </html>
    `;

    const blob = new Blob([template], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    this.triggerDownload(url, filename);
  }

  /**
   * Create a temporary anchor element, trigger a download, and clean up.
   */
  private triggerDownload(href: string, filename: string): void {
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', href);
    downloadAnchor.setAttribute('download', filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }
}
